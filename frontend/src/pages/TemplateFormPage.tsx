// src/pages/TemplateFormPage.tsx

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useFetch } from '../hooks/useFetch';
import { PrioridadTarea, Etiqueta } from '../types/tareas';
import { TaskTemplateCreateDTO, EquipoSimple } from '../types/templates'; 
import { TagSelector } from '../components/TemplateComponets'; 

const BASE_URL = 'http://localhost:3000';

interface TemplateFormPageProps {
    viewMode?: boolean; 
}

export function TemplateFormPage({ viewMode = false }: TemplateFormPageProps) {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation(); 
    const { token, usuario } = useAuth(); 
    const userId = usuario?.id;
    
    const isEditing = !!id && location.pathname.includes('/edit'); 
    const isDetailView = !!id && viewMode;
    
    // --- Estados del formulario ---
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState<PrioridadTarea>(PrioridadTarea.MEDIA);
    const [teamId, setTeamId] = useState(''); 
    const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);

    // --- Estados de fetch/UI ---
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    // Fetch Options memoizadas
    const fetchOptions: RequestInit = useMemo(() => ({
        headers: { Authorization: `Bearer ${token}` }
    }), [token]);

    // 1. Fetch de equipos del usuario
    const teamUrl = (token && userId) 
        ? `${BASE_URL}/api/equipos/equipos/${userId}` 
        : null;

    const { data: userTeams, loading: loadingTeams } = useFetch<EquipoSimple[]>(
        teamUrl, 
        fetchOptions
    );
    
    // 2. Fetch de etiquetas del equipo seleccionado
    const tagsUrl = (token && teamId) 
        ? `${BASE_URL}/api/etiquetas/equipos/${teamId}/etiquetas` 
        : null;

    const { 
        data: availableTags = [], 
        loading: loadingTags, 
        error: tagsError 
    } = useFetch<Etiqueta[]>(
        tagsUrl, 
        fetchOptions
    );

    // 3. Fetch de la template a editar
    type TemplateResponse = TaskTemplateCreateDTO & { id: string, tags?: Etiqueta[], teamName?: string };
    const templateUrl = (isEditing || isDetailView) && id && token 
        ? `${BASE_URL}/api/tasktemplates/${id}` 
        : null;

    const { data: currentTemplate, loading: loadingTemplate, error: templateError } = useFetch<TemplateResponse>(
        templateUrl, 
        fetchOptions
    );

    // Manejo de carga de datos iniciales
    useEffect(() => {
        if (currentTemplate) {
            setName(currentTemplate.name);
            setDescription(currentTemplate.description || '');
            setPriority(currentTemplate.priority);
            setTeamId(currentTemplate.teamId || '');
            
            // Si la template tiene tags, extraemos sus IDs
            if (currentTemplate.tags) {
                setSelectedTagIds(currentTemplate.tags.map(t => t.id));
            } else {
                setSelectedTagIds([]);
            }
        }
    }, [currentTemplate]);

    // Función para manejar el cambio de equipo y resetear tags
    const handleTeamChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newTeamId = e.target.value;
        setTeamId(newTeamId);
        // Limpiar tags seleccionados al cambiar de equipo
        setSelectedTagIds([]); 
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setFormError(null);

        if (!name || !priority) {
            setFormError("El nombre y la prioridad son obligatorios.");
            setSaving(false);
            return;
        }

        const method = isEditing ? 'PUT' : 'POST';
        const url = isEditing 
            ? `${BASE_URL}/api/tasktemplates/${id}` 
            : `${BASE_URL}/api/tasktemplates`;
        
        // El DTO para POST/PUT espera solo IDs de tags
        const templateData: TaskTemplateCreateDTO = {
            name,
            description: description || undefined,
            priority,
            teamId: teamId || undefined, 
            tagIds: selectedTagIds,
        };

        try {
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(templateData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al guardar la template.');
            }

            // Éxito: Volver a la lista de templates
            navigate('/templates'); 

        } catch (err: any) {
            console.error(err);
            setFormError(err.message || 'Error desconocido al procesar la solicitud.');
        } finally {
            setSaving(false);
        }
    };


    if ((isEditing || isDetailView) && loadingTemplate) return <p>Cargando Template...</p>;
    if (templateError) return <p style={{ color: 'red' }}>Error al cargar template: {templateError}</p>;


    // 💡 CORRECCIÓN PARA EL ERROR DE LENGTH: Se asegura de que sea un array vacío si es null/undefined
    const tagsToRender = availableTags || [];
    
    // El resto del JSX (renderizado)
    return (
        <div className="page-container">
            <h1>{isEditing ? 'Editar Template' : isDetailView ? 'Detalle de Template' : 'Crear Nueva Template'}</h1>
            <div className="card">
                
                <form onSubmit={handleSubmit}>
                    
                    <div className="form-group">
                        <label htmlFor="name">Nombre de la Template:</label>
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            disabled={saving || isDetailView}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="description">Descripción (Opcional):</label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={4}
                            disabled={saving || isDetailView}
                        ></textarea>
                    </div>

                    <div className="form-group">
                        <label htmlFor="priority">Prioridad por Defecto:</label>
                        <select
                            id="priority"
                            value={priority}
                            onChange={(e) => setPriority(e.target.value as PrioridadTarea)}
                            required
                            disabled={saving || isDetailView}
                        >
                            {Object.values(PrioridadTarea).map(p => (
                                <option key={p} value={p}>{p}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="teamId">Equipo (Opcional):</label>
                        <select
                            id="teamId"
                            value={teamId}
                            onChange={handleTeamChange} // Usar la función corregida
                            disabled={saving || loadingTeams || isDetailView}
                        >
                            <option value="">-- Global / Sin Equipo --</option>
                            {userTeams?.map(team => (
                                <option key={team.id} value={team.id}>
                                    {team.nombre}
                                </option>
                            ))}
                        </select>
                        {loadingTeams && <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Cargando equipos...</p>}
                    </div>

                    <div className="form-group">
                        <label>Etiquetas ({teamId ? `disponibles para el equipo ${userTeams?.find(t => t.id === teamId)?.nombre}` : 'Sin equipo seleccionado'}):</label>
                        
                        {/* 💡 CORRECCIÓN DE TAG SELECTOR: Se usa tagsToRender para evitar el error de 'null.length' */}
                        {loadingTags ? (
                            <p>Cargando etiquetas...</p>
                        ) : tagsError ? (
                            <p style={{ color: 'var(--color-error)', fontSize: '0.9rem' }}>Error al cargar etiquetas.</p>
                        ) : tagsToRender.length === 0 && teamId ? (
                            <p style={{ fontStyle: 'italic', fontSize: '0.9rem' }}>No hay etiquetas disponibles en este equipo.</p>
                        ) : tagsToRender.length === 0 && !teamId ? (
                            <p style={{ fontStyle: 'italic', fontSize: '0.9rem' }}>Selecciona un equipo para ver sus etiquetas.</p>
                        ) : (
                            <TagSelector 
                                allTags={tagsToRender}
                                selectedTagIds={selectedTagIds}
                                onChange={setSelectedTagIds} 
                                disabled={isDetailView}
                            />
                        )}
                    </div>

                    {formError && (
                        <div style={{ backgroundColor: '#fed7d7', color: '#c53030', padding: '0.5rem', borderRadius: '4px', marginBottom: '1rem' }}>
                            {formError}
                        </div>
                    )}

                    {/* Botones */}
                    {!isDetailView && (
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                            <button type="button" onClick={() => navigate('/templates')} className="secondary">
                                Cancelar
                            </button>
                            <button type="submit" disabled={saving}>
                                {saving ? 'Guardando...' : 'Guardar Template'}
                            </button>
                        </div>
                    )}
                    
                    {isDetailView && (
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                            <button type="button" onClick={() => navigate('/templates')}>
                                Volver a la Lista
                            </button>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}