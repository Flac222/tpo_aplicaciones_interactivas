// src/pages/TemplateUsePage.tsx

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useFetch } from '../hooks/useFetch';
// Asegúrate de que estos tipos estén definidos e importados correctamente
import { PrioridadTarea, EstadoTarea, Etiqueta } from '../types/tareas';
import { TaskPreFillDTO, EquipoSimple } from '../types/templates'; 
import { TagSelector } from '../components/TemplateComponets'; 

const BASE_URL = 'http://localhost:3000';

// DTO para crear la tarea a partir de la template (se usa para pasar en el state)
interface TaskCreateDTO {
    titulo: string;
    descripcion?: string;
    // El estado inicial siempre debe ser PENDIENTE para una tarea nueva
    estado: EstadoTarea; 
    prioridad: PrioridadTarea;
    teamId: string; 
    tagIds: string[];
    originTemplateId: string;
}

export function TemplateUsePage() {
    const { id } = useParams(); // ID de la template
    const navigate = useNavigate();
    const { token, usuario } = useAuth(); 
    const userId = usuario?.id;
    
    // Fetch Options memoizadas
    const fetchOptions: RequestInit = useMemo(() => ({
        headers: { Authorization: `Bearer ${token}` }
    }), [token]);

    // --- Estados del Formulario ---
    const [titulo, setTitulo] = useState('');
    const [descripcion, setDescripcion] = useState(''); 
    const [prioridad, setPrioridad] = useState<PrioridadTarea>(PrioridadTarea.MEDIA);
    const [teamId, setTeamId] = useState(''); // El equipo donde se creará la tarea
    const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
    
    // --- Estados de UI ---
    const [loadingTemplate, setLoadingTemplate] = useState(true);
    const [templateError, setTemplateError] = useState<string | null>(null);
    // Cambiamos 'saving' por 'redireccionando' para reflejar el nuevo flujo
    const [saving, setSaving] = useState(false); 
    const [formError, setFormError] = useState<string | null>(null);


    // 1. Fetch de equipos (para el selector de equipos)
    const teamUrl = (token && userId) 
        ? `${BASE_URL}/api/equipos/equipos/${userId}` 
        : null;

    const { data: userTeams, loading: loadingTeams } = useFetch<EquipoSimple[]>(
        teamUrl,
        fetchOptions
    );

    // 2. Fetch de etiquetas del equipo seleccionado
    const tagsUrl = (token && teamId) 
        ? `${BASE_URL}/api/etiquetas/${teamId}`
        : null;
        
    const { data: teamTags, loading: loadingTags } = useFetch<Etiqueta[]>(
        tagsUrl,
        fetchOptions
    );
    
    const availableTags = useMemo(() => teamTags || [], [teamTags]);
    const isFormDisabled = loadingTemplate || saving;


    // 3. useEffect para cargar los datos de la template (Preview)
    useEffect(() => {
        if (!id || !token) return;

        setLoadingTemplate(true);
        setTemplateError(null);

        // Fetch al endpoint de preview (GET /api/tasktemplates/:id/preview)
        fetch(`${BASE_URL}/api/tasktemplates/${id}/preview`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(async res => {
            if (!res.ok) throw new Error("Error cargando preview de template.");
            const data: TaskPreFillDTO = await res.json();
            
            // Prellenar estados con datos de la template
            setTitulo(data.title);
            setDescripcion(data.description || '');
            setPrioridad(data.priority);
            setTeamId(data.teamId || '');
            setSelectedTagIds(data.tagIds || []); 
        })
        .catch(err => setTemplateError(err.message))
        .finally(() => setLoadingTemplate(false));

    }, [id, token]);


    // 💡 FUNCIÓN MODIFICADA: Ahora redirige en lugar de crear la tarea
    const handleCreateTask = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!teamId || !titulo) {
            setFormError('Debes ingresar un Título y seleccionar un Equipo.');
            return;
        }

        // 1. Construir el objeto de datos prellenados (TaskCreateDTO)
        const prefillTaskData: TaskCreateDTO = {
            titulo: titulo,
            descripcion: descripcion,
            // Importante: Asignar el estado inicial
            estado: EstadoTarea.PENDIENTE, 
            prioridad: prioridad,
            teamId: teamId,
            tagIds: selectedTagIds,
            originTemplateId: id!, // ID de la template
        };
        
        setFormError(null);

        // 2. REDIRECCIÓN: Vamos a la página del equipo y pasamos los datos en el 'state'
        // El EquipoPage deberá leer este state y abrir el modal.
        navigate(`/equipo/${teamId}`, { 
            state: { prefillTask: prefillTaskData } 
        });

        // Quitamos la lógica de fetch, setSaving y manejo de éxito/error.
    };


    if (loadingTemplate) return <div className="main-content"><p>Cargando Template...</p></div>;
    if (templateError) return <div className="main-content"><p style={{ color: 'red' }}>Error: {templateError}</p></div>;
    if (!usuario) return null; // No debería pasar si está en ProtectedRoute


    // Lógica para determinar qué etiquetas mostrar
    const tagsToRender = availableTags.filter(tag => selectedTagIds.includes(tag.id) || tag.equipoId === teamId);


    return (
        <div className="main-content">
            <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
                <h2 className="card-title">Usar Template: Personalizar Tarea</h2>
                <p>Modifica la tarea antes de crearla en el equipo seleccionado.</p>

                <form onSubmit={handleCreateTask} style={{ marginTop: '1.5rem' }}>
                    {/* --- Título de la Tarea --- */}
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>Título de la Tarea</label>
                        <input 
                            type="text" 
                            value={titulo}
                            onChange={(e) => setTitulo(e.target.value)}
                            style={{ width: '100%', padding: '0.5rem' }}
                            placeholder="Ingresa un título para la nueva tarea"
                            required
                            disabled={isFormDisabled}
                        />
                    </div>

                    {/* --- Descripción --- */}
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>Descripción (Opcional)</label>
                        <textarea 
                            value={descripcion}
                            onChange={(e) => setDescripcion(e.target.value)}
                            style={{ width: '100%', padding: '0.5rem', minHeight: '100px' }}
                            disabled={isFormDisabled}
                        />
                    </div>

                    {/* --- Prioridad --- */}
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>Prioridad</label>
                        <select
                            value={prioridad}
                            onChange={(e) => setPrioridad(e.target.value as PrioridadTarea)}
                            style={{ padding: '0.5rem', minWidth: '150px' }}
                            disabled={isFormDisabled}
                        >
                            {/* Asegúrate de que PrioridadTarea.ALTA, MEDIA, BAJA sean strings válidos */}
                            <option value={PrioridadTarea.ALTA}>{PrioridadTarea.ALTA}</option>
                            <option value={PrioridadTarea.MEDIA}>{PrioridadTarea.MEDIA}</option>
                            <option value={PrioridadTarea.BAJA}>{PrioridadTarea.BAJA}</option>
                        </select>
                    </div>

                    {/* --- Equipo Destino (TeamId) --- */}
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>Equipo Destino</label>
                        <select
                            value={teamId}
                            onChange={(e) => {
                                setTeamId(e.target.value);
                                // Limpia las etiquetas si cambia de equipo
                                setSelectedTagIds([]);
                            }}
                            style={{ padding: '0.5rem', minWidth: '150px', width: '100%' }}
                            required
                            disabled={isFormDisabled || loadingTeams}
                        >
                            <option value="">{loadingTeams ? 'Cargando equipos...' : 'Selecciona un equipo...'}</option>
                            {userTeams?.map(team => (
                                <option key={team.id} value={team.id}>{team.nombre}</option>
                            ))}
                        </select>
                    </div>

                    {/* --- Etiquetas --- */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>Etiquetas (Opcional)</label>
                        {loadingTags ? (
                            <p>Cargando etiquetas...</p>
                        ) : tagsToRender.length === 0 && !teamId ? (
                            <p style={{ fontStyle: 'italic', fontSize: '0.9rem' }}>Selecciona un equipo para ver sus etiquetas.</p>
                        ) : (
                            <TagSelector 
                                allTags={tagsToRender}
                                selectedTagIds={selectedTagIds}
                                onChange={setSelectedTagIds} 
                                disabled={isFormDisabled}
                            />
                        )}
                    </div>

                    {formError && (
                        <div style={{ backgroundColor: '#fed7d7', color: '#c53030', padding: '0.5rem', borderRadius: '4px', marginBottom: '1rem' }}>
                            {formError}
                        </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                        <button type="button" onClick={() => navigate('/templates')} className="secondary">
                            ⬅️ Volver
                        </button>
                        
                        {/* 💡 CAMBIO EN BOTÓN: Texto y disabled actualizado */}
                        <button 
                            type="submit" 
                            disabled={isFormDisabled || !teamId || !titulo}
                            className="button-primary"
                            style={{ backgroundColor: 'var(--color-success)', fontWeight: 'bold' }}
                        >
                            Confirmar y Pre-llenar Tarea
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}