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
    
    
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState<PrioridadTarea>(PrioridadTarea.MEDIA);
    const [teamId, setTeamId] = useState(''); 
    const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);

    
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    
    const fetchOptions: RequestInit = useMemo(() => ({
        headers: { Authorization: `Bearer ${token}` }
    }), [token]);

    
    const teamUrl = (token && userId) 
        ? `${BASE_URL}/api/equipos/equipos/${userId}` 
        : null;

    const { data: userTeams, loading: loadingTeams } = useFetch<EquipoSimple[]>(
        teamUrl, 
        fetchOptions
    );
    
    
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

    
    type TemplateResponse = TaskTemplateCreateDTO & { id: string, tags?: Etiqueta[], teamName?: string };
    const templateUrl = (isEditing || isDetailView) && id && token 
        ? `${BASE_URL}/api/tasktemplates/${id}` 
        : null;

    const { data: currentTemplate, loading: loadingTemplate, error: templateError } = useFetch<TemplateResponse>(
        templateUrl, 
        fetchOptions
    );

   
    useEffect(() => {
        if (currentTemplate) {
            setName(currentTemplate.name);
            setDescription(currentTemplate.description || '');
            setPriority(currentTemplate.priority);
            setTeamId(currentTemplate.teamId || '');
            
           
            if (currentTemplate.tags) {
                setSelectedTagIds(currentTemplate.tags.map(t => t.id));
            } else {
                setSelectedTagIds([]);
            }
        }
    }, [currentTemplate]);

    
    const handleTeamChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newTeamId = e.target.value;
        setTeamId(newTeamId);
        
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
        const url = isEditing ? `${BASE_URL}/api/tasktemplates/${id}` : `${BASE_URL}/api/tasktemplates`;

        
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

            
            navigate('/templates');
        } catch (err: any) {
            console.error(err);
            setFormError(err.message || 'Error desconocido al procesar la solicitud.');
        } finally {
            setSaving(false);
        }
    };

    if ((isEditing || isDetailView) && loadingTemplate) return <p>Cargando Template...</p>;
    if (templateError) return <p style={{ color: 'red' }}>Error al cargar la template: {templateError}</p>;

    const tagsToRender = availableTags || [];

    const title = isDetailView
        ? `Detalle de Template: ${currentTemplate?.name || 'Cargando...'}`
        : isEditing
            ? `Editar Template: ${currentTemplate?.name || 'Cargando...'}`
            : 'Crear Nueva Template';
    
   
    return (
        
        <div style={{ 
            padding: '2rem', 
            minHeight: 'calc(100vh - 60px)', 
            display: 'flex',
            justifyContent: 'center', 
            alignItems: 'flex-start', 
        }}>
          
            <div className="card" style={{ 
                maxWidth: '650px', 
                width: '100%',
                margin: '0', 
                padding: '2rem', 
                backgroundColor: 'var(--bg-secondary, #fff)', 
                borderRadius: '12px', 
                boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)', 
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem'
            }}>
                <h2>{title}</h2>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    
                    {/* Campo Nombre: Etiqueta arriba */}
                    <div className="form-group">
                        <label htmlFor="name" style={{ fontWeight: 'bold', marginBottom: '0.3rem', display: 'block' }}>Nombre</label>
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            disabled={isDetailView}
                        />
                    </div>

                    {/* Campo Descripción: Etiqueta arriba */}
                    <div className="form-group">
                        <label htmlFor="description" style={{ fontWeight: 'bold', marginBottom: '0.3rem', display: 'block' }}>Descripción (Opcional)</label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={4}
                            disabled={isDetailView}
                        />
                    </div>

                    {/* Selector de Prioridad: Etiqueta arriba */}
                    <div className="form-group">
                        <label htmlFor="priority" style={{ fontWeight: 'bold', marginBottom: '0.3rem', display: 'block' }}>Prioridad por Defecto</label>
                        <select
                            id="priority"
                            value={priority}
                            onChange={(e) => setPriority(e.target.value as PrioridadTarea)}
                            required
                            disabled={isDetailView}
                        >
                            {Object.values(PrioridadTarea).map(p => (
                                <option key={p} value={p}>{p}</option>
                            ))}
                        </select>
                    </div>

                    {/* Selector de Equipo: Etiqueta arriba */}
                    <div className="form-group">
                        <label htmlFor="teamId" style={{ fontWeight: 'bold', marginBottom: '0.3rem', display: 'block' }}>Equipo Predeterminado (Opcional)</label>
                        {loadingTeams ? (
                            <p>Cargando equipos...</p>
                        ) : (
                            <select
                                id="teamId"
                                value={teamId}
                                onChange={handleTeamChange}
                                disabled={isDetailView}
                            >
                                <option value="">(Sin Equipo Predeterminado)</option>
                                {userTeams?.map(team => (
                                    <option key={team.id} value={team.id}>{team.nombre}</option>
                                ))}
                            </select>
                        )}
                    </div>
                    
                    {/* Selector de Etiquetas: Etiqueta arriba */}
                    <div className="form-group">
                        <label style={{ fontWeight: 'bold', marginBottom: '0.3rem', display: 'block' }}>Etiquetas por Defecto (Opcional)</label>
                        {(teamId || isEditing || isDetailView) && (
                            <TagSelector
                                allTags={tagsToRender} 
                                selectedTagIds={selectedTagIds}
                                onChange={setSelectedTagIds} 
                                disabled={isDetailView}
                            />
                        )}
                        {loadingTags ? (
                            <p>Cargando etiquetas...</p>
                        ) : tagsError ? (
                            <p style={{ color: 'var(--color-error)', fontSize: '0.9rem' }}>Error al cargar etiquetas.</p>
                        ) : tagsToRender.length === 0 && teamId && !isDetailView ? (
                            <p style={{ fontStyle: 'italic', fontSize: '0.9rem', color: '#666' }}>No hay etiquetas creadas para este equipo. Crea algunas en la vista de equipo.</p>
                        ) : null}
                    </div>

                    {formError && (
                        <div style={{ backgroundColor: '#fed7d7', color: '#c53030', padding: '0.5rem', borderRadius: '4px', marginBottom: '1rem' }}>
                            {formError}
                        </div>
                    )}

                    
                    {!isDetailView && (
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1.5rem' }}>
                            <button type="button" onClick={() => navigate('/templates')} className="secondary">
                                Cancelar
                            </button>
                            <button type="submit" disabled={saving}>
                                {saving ? 'Guardando...' : 'Guardar Template'}
                            </button>
                        </div>
                    )}
                    
                    {isDetailView && (
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1.5rem' }}>
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