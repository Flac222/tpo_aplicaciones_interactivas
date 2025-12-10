// src/pages/TemplateDetailPage.tsx

import { useState, useMemo } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useFetch } from '../hooks/useFetch';
import { PrioridadTarea, EstadoTarea, getPriorityColor } from '../types/tareas';
import { TaskTemplate } from '../types/templates'; 
import { TemplateTagDisplay } from '../components/TemplateComponets'; 

const BASE_URL = 'http://localhost:3000';

// DTO para crear la tarea (se usa para pasar en el state al EquipoPage)
interface TaskCreateDTO {
    titulo: string;
    descripcion?: string; 
    estado: EstadoTarea;
    prioridad: PrioridadTarea;
    teamId: string; 
    tagIds: string[];
    originTemplateId: string;
}

export function TemplateDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { token, usuario } = useAuth(); 

    
    const [isAssigning, setIsAssigning] = useState(false);
    const [assignError, setAssignError] = useState<string | null>(null);

    
    const fetchOptions: RequestInit = useMemo(() => ({
        headers: { Authorization: `Bearer ${token}` }
    }), [token]);

    
    const url = id && token ? `${BASE_URL}/api/tasktemplates/${id}` : null;
    const { data: template, loading, error } = useFetch<TaskTemplate>(
        url,
        fetchOptions
    );

    
    const handleUseTemplate = async () => {
        if (!template || !template.teamId) {
            setAssignError('Error: La template no está completa o no tiene equipo predefinido.');
            return;
        }

        setIsAssigning(true);
        setAssignError(null);

       
        const taskData: TaskCreateDTO = {
           
          
            titulo: template.name, 
            descripcion: template.description ?? '', 
            prioridad: template.priority, 
            

            estado: EstadoTarea.PENDIENTE, 
            teamId: template.teamId,
            tagIds: template.tags.map(tag => tag.id), 
            originTemplateId: template.id,
        };

        
        try {
            navigate(`/equipo/${template.teamId}`, { 
                state: { prefillTask: taskData } 
            });
        } catch(e) {
             setAssignError("Error al intentar redirigir.");
        } finally {
            setIsAssigning(false);
        }
    };
    
    // --- Renderizado ---

    if (!id) return <div className="main-content"><p>ID de Template no encontrado.</p></div>;
    if (loading) return <div className="main-content"><p>Cargando Template...</p></div>;
    if (error) return <div className="main-content"><p style={{ color: 'red' }}>Error al cargar: {error}</p></div>;
    if (!template) return <div className="main-content"><p>Template no encontrada.</p></div>;

    const priorityColor = getPriorityColor(template.priority);

    return (
        <div className="main-content">
            <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
                <h2 className="card-title">Detalle de Template</h2>
                
                <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--bg-tertiary)', paddingBottom: '1rem' }}>
                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{template.name}</p>
                    
                    <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                        Creado por: {template.creatorName}
                    </p>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Descripción</h3>
                    <p style={{ whiteSpace: 'pre-wrap', color: template.description ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                        {template.description || "Sin descripción."}
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '2rem', marginBottom: '1.5rem' }}>
                    {/* Prioridad */}
                    <div>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Prioridad</h3>
                        <span style={{ 
                            backgroundColor: priorityColor, 
                            color: '#fff', 
                            padding: '4px 8px', 
                            borderRadius: '4px',
                            fontWeight: 'bold'
                        }}>
                            {template.priority}
                        </span>
                    </div>

                    {/* Equipo */}
                    <div>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Equipo Asignado</h3>
                        <span style={{ 
                            fontWeight: 'bold', 
                            color: template.teamId ? 'var(--color-primary)' : 'var(--text-secondary)' 
                        }}>
                            {template.teamName || 'Ninguno (Requiere Personalizar)'}
                        </span>
                    </div>
                </div>

                {/* Etiquetas */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Etiquetas</h3 >
                    {template.tags && template.tags.length > 0 ? (
                        <TemplateTagDisplay tags={template.tags} /> 
                    ) : (
                        <p style={{ color: 'var(--text-secondary)' }}>Sin etiquetas predefinidas.</p>
                    )}
                </div>


                {assignError && (
                    <div style={{ backgroundColor: '#fed7d7', color: '#c53030', padding: '0.5rem', borderRadius: '4px', marginTop: '1rem' }}>
                        {assignError}
                    </div>
                )}
                
                <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                    <button 
                        type="button" 
                        onClick={() => navigate('/templates')} 
                        className="secondary"
                    >
                        ⬅ Volver
                    </button>

                    {template.teamId ? (
                        
                        <button 
                            onClick={handleUseTemplate} 
                            disabled={isAssigning}
                            className="button-primary"
                            style={{ backgroundColor: 'var(--color-success)', fontWeight: 'bold' }}
                            title="Redirige al tablero del equipo para crear la tarea pre-llenada."
                        >
                            {isAssigning ? 'Preparando...' : `🚀 Usar y Pre-llenar Tarea`}
                        </button>
                    ) : (
                       
                        <Link 
                            to={`/templates/${template.id}/use`} 
                            className="button-primary" 
                            style={{ 
                                textDecoration: 'none', 
                                padding: '0.5rem 1rem',
                                fontWeight: 'bold'
                            }}
                        >
                            ✏️ Personalizar y Usar
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}