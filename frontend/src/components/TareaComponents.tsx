// src/components/TareaComponents.tsx
import React, { useState, useEffect } from 'react';

import {
    EstadoTarea,
    PrioridadTarea,
    Tarea,
    Comentario, // Asumiendo que la interfaz Comentario ya tiene 'autor' y 'fecha'
    RegistroHistorial,
    estadoConfig,
    getPriorityColor,
    getValidNextStatuses,
    Etiqueta
} from '../types/tareas';

const BASE_URL = 'http://localhost:3000';

// Definición de Props para el modal de detalle
interface TaskDetailsModalProps {
    selectedTask: Tarea | null;
    setSelectedTask: (task: Tarea | null) => void;
    handleUpdateTaskStatus: (tareaId: string, nuevoEstado: EstadoTarea) => Promise<void>;
    isUpdatingTask: boolean;

    // **NUEVAS PROPS DE COMENTARIOS**
    comentarios: Comentario[];
    isCommentsLoading: boolean;
    currentUserId: string;
    handleCreateComment: (tareaId: string, contenido: string) => Promise<void>;
    handleEditComment: (commentId: string, nuevoContenido: string) => Promise<void>;
    handleDeleteComment: (commentId: string) => Promise<void>;
    allLabels: Etiqueta[];
    currentTaskLabels: Etiqueta[];
    labelsLoading: boolean;
    handleUpdateTaskLabels: (tareaId: string, newLabelIds: string[]) => Promise<void>;
    isUpdatingLabels: boolean;
}

// Componente para renderizar la Tarjeta de Tarea
interface TareaCardProps {
    tarea: Tarea;
    setSelectedTask: (tarea: Tarea) => void;
    token: string; // 💡 El token de autenticación es necesario para el fetch
}

interface EtiquetaDisplayProps {
    etiquetas: Etiqueta[];
}

interface ComentarioProps {
    comentario: Comentario;
    currentUserId: string;
    onEdit: (commentId: string, nuevoContenido: string) => Promise<void>;
    onDelete: (commentId: string) => Promise<void>;
}

interface ComentariosSectionProps {
    tareaId: string;
    comentarios: Comentario[];
    currentUserId: string;
    onCreate: (tareaId: string, contenido: string) => Promise<void>;
    onEdit: (commentId: string, nuevoContenido: string) => Promise<void>;
    onDelete: (commentId: string) => Promise<void>;
    loading: boolean;
}

interface RegistroHistorialProps {
    registro: RegistroHistorial;
}

// ----------------------------------------------------
// Componentes de Edición de Etiquetas
// ----------------------------------------------------
interface LabelActionSectionProps {
    allLabels?: Etiqueta[];
    currentTaskLabels: Etiqueta[];
    onAction: (labelId: string, operation: 'add' | 'remove') => Promise<void>;
    isUpdatingLabels: boolean;
    onClose: () => void;
}

const AddLabelsSection: React.FC<LabelActionSectionProps> = ({ allLabels = [], currentTaskLabels, onAction, isUpdatingLabels, onClose }) => {
    const assignedIds = currentTaskLabels.map(l => l.id);
    const availableToAdd = allLabels.filter(label => !assignedIds.includes(label.id));

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <h5 style={{ margin: 0, fontSize: '1rem' }}>Selecciona etiquetas para **agregar**:</h5>
                <button onClick={onClose} style={{ background: 'var(--text-secondary)' }}>Cerrar</button>
            </div>
            <div style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid var(--border-color)', padding: '0.5rem', backgroundColor: 'var(--bg-secondary)' }}>
                {availableToAdd.length === 0 ? (
                    <small style={{ fontStyle: 'italic', color: 'var(--text-secondary)' }}>Todas las etiquetas del equipo ya están asignadas.</small>
                ) : (
                    availableToAdd.map(label => (
                        <div
                            key={label.id}
                            onClick={() => !isUpdatingLabels && onAction(label.id, 'add')}
                            style={{ 
                                cursor: isUpdatingLabels ? 'wait' : 'pointer', 
                                padding: '5px', margin: '2px 0', borderRadius: '4px', 
                                backgroundColor: 'var(--bg-lightest)', 
                                border: '1px solid var(--color-primary)', 
                                transition: 'background-color 0.1s', 
                                opacity: isUpdatingLabels ? 0.6 : 1 
                            }}
                            onMouseEnter={(e) => isUpdatingLabels ? null : (e.currentTarget.style.backgroundColor = 'var(--color-primary-light)')}
                            onMouseLeave={(e) => isUpdatingLabels ? null : (e.currentTarget.style.backgroundColor = 'var(--bg-lightest)')}
                        >
                            {label.nombre}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

const RemoveLabelsSection: React.FC<LabelActionSectionProps> = ({ currentTaskLabels, onAction, isUpdatingLabels, onClose }) => {
    const availableToRemove = currentTaskLabels;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <h5 style={{ margin: 0, fontSize: '1rem' }}>Selecciona etiquetas para **remover**:</h5>
                <button onClick={onClose} style={{ background: 'var(--text-secondary)' }}>Cerrar</button>
            </div>
            <div style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid var(--border-color)', padding: '0.5rem', backgroundColor: 'var(--bg-secondary)' }}>
                {availableToRemove.length === 0 ? (
                    <small style={{ fontStyle: 'italic', color: 'var(--text-secondary)' }}>Esta tarea no tiene etiquetas para remover.</small>
                ) : (
                    availableToRemove.map(label => (
                        <div
                            key={label.id}
                            onClick={() => !isUpdatingLabels && onAction(label.id, 'remove')}
                            style={{ 
                                cursor: isUpdatingLabels ? 'wait' : 'pointer', 
                                padding: '5px', margin: '2px 0', borderRadius: '4px', 
                                backgroundColor: 'var(--color-warning-light)', 
                                border: '1px solid var(--color-warning)', 
                                fontWeight: 'bold', 
                                transition: 'background-color 0.1s', 
                                opacity: isUpdatingLabels ? 0.6 : 1 
                            }}
                            onMouseEnter={(e) => isUpdatingLabels ? null : (e.currentTarget.style.backgroundColor = 'var(--color-error-light)')}
                            onMouseLeave={(e) => isUpdatingLabels ? null : (e.currentTarget.style.backgroundColor = 'var(--color-warning-light)')}
                        >
                            {label.nombre} (Click para remover)
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

// ----------------------------------------------------
// ... (Otros componentes sin cambios relevantes de estilo de botones)
// ----------------------------------------------------

const RegistroHistorialCard: React.FC<RegistroHistorialProps> = ({ registro }) => {

    const fechaFormateada = new Date(registro.fecha).toLocaleString();
    const usuario = registro.usuario;
    let nombreMostrar = 'Sistema / Usuario Desconocido'; 

    if (usuario) {
        if (usuario.nombre && usuario.nombre.trim() !== '') {
            nombreMostrar = usuario.nombre;
        } else if (usuario.email && usuario.email.trim() !== '') {
            nombreMostrar = usuario.email;
        } else {
            nombreMostrar = 'Usuario (sin datos de identificación)';
        }
    }


    return (
        <div style={{
            display: 'flex',
            borderBottom: '1px dotted var(--border-color)',
            padding: '0.5rem 0',
            fontSize: '0.9rem',
            color: 'var(--text-secondary)'
        }}>
            <div style={{ flex: '0 0 120px', color: 'var(--color-primary)', fontWeight: 'bold' }}>
                {fechaFormateada}
            </div>
            <div style={{ flexGrow: 1 }}>
                <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>
                    {nombreMostrar}
                </span>{' '}
                ha realizado el cambio: <span style={{ fontStyle: 'italic' }}>{registro.cambio}</span>
            </div>
        </div>
    );
};

interface HistorialSectionProps {
    historial: RegistroHistorial[];
}

export const HistorialSection: React.FC<HistorialSectionProps> = ({ historial }) => {
    const historialOrdenado = [...historial].sort((a, b) =>
        new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
    );

    return (
        <section style={{ marginTop: '2rem' }}>
            <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1rem', fontSize: '1.2rem' }}>
                ⏳ Historial de Actividad ({historial.length})
            </h3>
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {historialOrdenado.length === 0 ? (
                    <p style={{ color: 'var(--text-secondary)' }}>No hay registros de historial para esta tarea.</p>
                ) : (
                    historialOrdenado.map(registro => (
                        <RegistroHistorialCard key={registro.id} registro={registro} />
                    ))
                )}
            </div>
        </section>
    );
};

const ComentarioCard: React.FC<ComentarioProps> = ({ comentario, currentUserId, onEdit, onDelete }) => {
    const isOwner = comentario.autor.id === currentUserId;

    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(comentario.contenido);
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        if (editContent.trim() === comentario.contenido || !editContent.trim()) {
            setIsEditing(false);
            return;
        }
        setLoading(true);
        try {
            await onEdit(comentario.id, editContent);
            setIsEditing(false);
        } catch (e) {
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("¿Estás seguro de que quieres eliminar este comentario?")) return;
        setLoading(true);
        try {
            await onDelete(comentario.id);
        } catch (e) {
        } finally {
            setLoading(false);
        }
    };


    return (
        <div style={{ borderLeft: '3px solid var(--color-primary)', padding: '0.5rem 1rem', marginBottom: '1rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '4px' }}>
            <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold' }}>
                {isOwner ? 'Tú' : (comentario.autor.nombre || `Usuario ${comentario.autor.id}`)}
                <small style={{ fontWeight: 'normal', color: 'var(--text-secondary)', marginLeft: '10px' }}>
                    {new Date(comentario.fecha).toLocaleString()}
                </small>
            </p>

            {isEditing ? (
                <>
                    <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        style={{ width: '100%', minHeight: '60px', padding: '0.5rem', boxSizing: 'border-box' }}
                        disabled={loading}
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '5px', marginTop: '5px' }}>
                        <button onClick={() => setIsEditing(false)} disabled={loading} style={{ background: 'var(--text-secondary)' }}>Cancelar</button>
                        <button onClick={handleSave} disabled={loading}>{loading ? 'Guardando...' : 'Guardar'}</button>
                    </div>
                </>
            ) : (
                <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{comentario.contenido}</p>
            )}

            {isOwner && !isEditing && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '5px', marginTop: '0.5rem' }}>
                    <button onClick={() => { setIsEditing(true); setEditContent(comentario.contenido); }} disabled={loading} style={{ background: 'var(--color-warning)', padding: '0.2rem 0.5rem', fontSize: '0.8rem' }}>Editar</button>
                    <button onClick={handleDelete} disabled={loading} style={{ background: 'var(--color-error)', padding: '0.2rem 0.5rem', fontSize: '0.8rem' }}>Eliminar</button>
                </div>
            )}
        </div>
    );
};

const ComentarioForm: React.FC<{ taskId: string, onCreate: ComentariosSectionProps['onCreate'], loading: boolean }> = ({ taskId, onCreate, loading }) => {
    const [content, setContent] = useState('');
    const [localLoading, setLocalLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim() || localLoading) return;

        setLocalLoading(true);
        try {
            await onCreate(taskId, content.trim());
            setContent('');
        } catch (e) {
        } finally {
            setLocalLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Escribe un nuevo comentario..."
                style={{ width: '100%', minHeight: '80px', padding: '0.5rem', boxSizing: 'border-box' }}
                disabled={loading || localLoading}
                required
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" disabled={loading || localLoading || !content.trim()}>
                    {loading || localLoading ? 'Publicando...' : 'Publicar Comentario'}
                </button>
            </div>
        </form>
    );
};


export const ComentariosSection: React.FC<ComentariosSectionProps> = ({
    tareaId,
    comentarios,
    currentUserId,
    onCreate,
    onEdit,
    onDelete,
    loading
}) => {

    return (
        <section style={{ marginTop: '2rem' }}>
            <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1rem', fontSize: '1.2rem' }}>
                💬 Comentarios ({comentarios.length})
            </h3>

            {loading && <p style={{ color: 'var(--text-secondary)' }}>Cargando comentarios...</p>}

            <ComentarioForm taskId={tareaId} onCreate={onCreate} loading={loading} />

            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {comentarios.length === 0 && !loading ? (
                    <p style={{ color: 'var(--text-secondary)' }}>Sé el primero en comentar.</p>
                ) : (
                    comentarios.map(c => (
                        <ComentarioCard
                            key={c.id}
                            comentario={c}
                            currentUserId={currentUserId}
                            onEdit={onEdit}
                            onDelete={onDelete}
                        />
                    ))
                )}
            </div>
        </section>
    );
};


export const TareaCard: React.FC<TareaCardProps> = ({ tarea, setSelectedTask, token }) => {
    const [taskLabels, setTaskLabels] = useState<Etiqueta[]>(tarea.etiquetas ?? []);
    const [loadingLabels, setLoadingLabels] = useState(false);
    const [hasFetchedLabels, setHasFetchedLabels] = useState(false);

    useEffect(() => {
        if (hasFetchedLabels) {
            return;
        }

        const needsFetching = token && tarea.id && (!tarea.etiquetas || tarea.etiquetas.length === 0);

        if (needsFetching) {
            if (!loadingLabels) { 
                setLoadingLabels(true);
            }
            
            const fetchTaskLabels = async () => {
                try {
                    const res = await fetch(`${BASE_URL}/api/etiquetas/tareas/${tarea.id}/etiquetas`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`,
                        },
                    });
                    
                    if (!res.ok) {
                        console.error(`Error ${res.status} al cargar etiquetas para tarea ${tarea.id}`);
                        setTaskLabels([]);
                    } else {
                        const data: Etiqueta[] = await res.json();
                        setTaskLabels(data); 
                    }

                } catch (error) {
                    console.error("Fallo el fetch de etiquetas:", error);
                    setTaskLabels([]);
                } finally {
                    setHasFetchedLabels(true); 
                    setLoadingLabels(false);
                }
            };

            fetchTaskLabels();
        } 
        
        if (tarea.etiquetas && tarea.etiquetas.length > 0) {
             setHasFetchedLabels(true);
        }
    }, [tarea.id, token, tarea.etiquetas]);

    return (
        <div
            key={tarea.id}
            onClick={() => setSelectedTask(tarea)}
            style={{
                padding: '1rem',
                borderRadius: '8px',
                backgroundColor: 'var(--bg-lightest)',
                boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                borderLeft: `5px solid ${getPriorityColor(tarea.prioridad)}`,
                marginBottom: '10px',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={(e) => {
                (e.currentTarget.style.transform = 'translateY(-2px)');
                (e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)');
            }}
            onMouseLeave={(e) => {
                (e.currentTarget.style.transform = 'translateY(0)');
                (e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.1)');
            }}
        >
            <h4 style={{ margin: '0 0 0.5rem 0' }}>{tarea.titulo}</h4>
            <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <span>Prioridad: <strong>{tarea.prioridad}</strong></span>
            </div>
            
            <div style={{ 
                display: 'flex', 
                alignItems: 'flex-start', 
                flexDirection: 'column', 
                gap: '0.2rem', 
                fontSize: '0.8rem', 
                color: 'var(--text-secondary)', 
                marginTop: '0.5rem' 
            }}>
                <span style={{ fontWeight: 'bold' }}>Etiquetas:</span>
                <div style={{ marginTop: '0.2rem' }}>
                    {loadingLabels 
                        ? <small style={{ fontStyle: 'italic' }}>Cargando etiquetas...</small>
                        : (hasFetchedLabels || taskLabels.length > 0) 
                            ? <EtiquetaDisplay etiquetas={taskLabels}/>
                            : <small style={{ fontStyle: 'italic' }}>Sin etiquetas</small>
                    }
                </div>
            </div>
        </div>
    )
};

export const EtiquetaDisplay: React.FC<EtiquetaDisplayProps> = ({ etiquetas }) => {
    if (!etiquetas || etiquetas.length === 0) {
        return null;
    }
    
    return (
        <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: '6px', 
        }}>
            {etiquetas.map(etiqueta => (
                <span 
                    key={etiqueta.id} 
                    style={{
                        backgroundColor: 'var(--color-primary-light)', 
                        color: 'var(--text-primary)', 
                        border: '1px solid var(--color-primary)', 
                        padding: '3px 8px', 
                        borderRadius: '12px', 
                        fontSize: '0.75rem', 
                        fontWeight: 'bold',
                        whiteSpace: 'nowrap'
                    }}
                >
                    {etiqueta.nombre}
                </span>
            ))}
        </div>
    );
};

interface TareaColumnaProps {
    estado: EstadoTarea;
    tareas: Tarea[];
    setSelectedTask: (tarea: Tarea) => void;
    token: string;
}
export const TareaColumna: React.FC<TareaColumnaProps> = ({ estado, tareas, setSelectedTask, token}) => {
    const config = estadoConfig[estado];

    return (
        <div style={{
            flex: '1 1 24%',
            minWidth: '250px',
            backgroundColor: 'var(--bg-tertiary)',
            padding: '1rem',
            borderRadius: '8px',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 0 10px rgba(0,0,0,0.05)'
        }}>
            <h3 style={{
                margin: '0 0 1rem 0',
                color: config.color,
                borderBottom: `2px solid ${config.color}`,
                paddingBottom: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
            }}>
                {config.icon} {config.title} ({tareas.length})
            </h3>

            <div style={{
                flexGrow: 1,
                overflowY: 'auto',
                minHeight: '100px',
                paddingRight: '5px'
            }}>
                {tareas.length === 0 ? (
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        No hay tareas con estos filtros.
                    </p>
                ) : (
                    tareas.map(t => <TareaCard
                        key={t.id}
                        tarea={t}
                        setSelectedTask={setSelectedTask}
                        token={token} 
                    />)
                )}
            </div>
        </div>
    );
};


interface CreateTaskModalProps {
    isTaskModalOpen: boolean;
    setIsTaskModalOpen: (isOpen: boolean) => void;
    handleCreateTask: (e: React.FormEvent) => Promise<void>;
    // Estados del formulario
    newTaskTitle: string;
    setNewTaskTitle: (title: string) => void;
    newTaskDesc: string;
    setNewTaskDesc: (desc: string) => void;
    newTaskPriority: PrioridadTarea;
    setNewTaskPriority: (p: PrioridadTarea) => void;
    newTaskEstado: EstadoTarea;
    setNewTaskEstado: (e: EstadoTarea) => void;
    taskModalLoading: boolean;
    taskModalError: string | null;
    // 💡 NUEVAS PROPS DE ETIQUETAS
    allLabels: Etiqueta[];
    newTaskLabels: string[];
    setNewTaskLabels: (labels: string[]) => void;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = (props) => {
    if (!props.isTaskModalOpen) return null;

    // 💡 Lógica para manejo de etiquetas con doble click
    const selectedLabels = props.allLabels.filter(label => props.newTaskLabels.includes(label.id));
    const availableLabels = props.allLabels.filter(label => !props.newTaskLabels.includes(label.id));

    const handleSelectLabel = (labelId: string) => {
        if (!props.newTaskLabels.includes(labelId)) {
            props.setNewTaskLabels([...props.newTaskLabels, labelId]);
        }
    };

    const handleDeselectLabel = (labelId: string) => {
        props.setNewTaskLabels(props.newTaskLabels.filter(id => id !== labelId));
    };


    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000,
        }}
            onClick={() => props.setIsTaskModalOpen(false)}
        >
            <div
                style={{
                    backgroundColor: 'var(--bg-lightest)', color: 'var(--text-primary)',
                    padding: '2rem', borderRadius: '8px',
                    minWidth: '300px', maxWidth: '600px', zIndex: 1001,
                    maxHeight: '90vh', overflowY: 'auto'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <h3 style={{ marginTop: 0 }}>Crear Nueva Tarea</h3>
                <form onSubmit={props.handleCreateTask}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label htmlFor="taskTitle" style={{ display: 'block', marginBottom: '0.5rem' }}>Título:</label>
                        <input
                            id="taskTitle"
                            type="text"
                            value={props.newTaskTitle}
                            onChange={(e) => props.setNewTaskTitle(e.target.value)}
                            required
                            style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }}
                            placeholder="Nombre corto de la tarea"
                        />
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label htmlFor="taskDesc" style={{ display: 'block', marginBottom: '0.5rem' }}>Descripción (opcional):</label>
                        <textarea
                            id="taskDesc"
                            value={props.newTaskDesc}
                            onChange={(e) => props.setNewTaskDesc(e.target.value)}
                            style={{ width: '100%', padding: '0.5rem', minHeight: '80px', boxSizing: 'border-box' }}
                            placeholder="Detalles de la tarea"
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem' }}>
                        
                        <div style={{ flex: 1 }}>
                            <label htmlFor="taskPriority" style={{ display: 'block', marginBottom: '0.5rem' }}>Prioridad:</label>
                            <select
                                id="taskPriority"
                                value={props.newTaskPriority}
                                onChange={(e) => props.setNewTaskPriority(e.target.value as PrioridadTarea)}
                                required
                                style={{ padding: '0.5rem', width: '100%', boxSizing: 'border-box' }}
                            >
                                {Object.values(PrioridadTarea).map(p => (
                                    <option key={p} value={p}>{p}</option>
                                ))}
                            </select>
                        </div>

                        <div style={{ flex: 1 }}>
                            <label htmlFor="taskEstado" style={{ display: 'block', marginBottom: '0.5rem' }}>Estado Inicial:</label>
                            <select
                                id="taskEstado"
                                value={props.newTaskEstado}
                                onChange={(e) => props.setNewTaskEstado(e.target.value as EstadoTarea)}
                                required
                                style={{ padding: '0.5rem', width: '100%', boxSizing: 'border-box' }}
                            >
                                {Object.values(EstadoTarea).map(e => (
                                    <option key={e} value={e}>{e}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div style={{ marginBottom: '1.5rem', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '1rem' }}>
                        <h4 style={{ margin: '0 0 1rem 0', borderBottom: '1px dotted var(--border-color)', paddingBottom: '0.5rem', fontSize: '1.1rem' }}>🏷️ Etiquetas (Doble Click para Seleccionar)</h4>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            {/* Etiquetas Disponibles */}
                            <div style={{ flex: 1 }}>
                                <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold' }}>Disponibles ({availableLabels.length}):</p>
                                <div style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid var(--text-secondary)', padding: '0.5rem', borderRadius: '4px', backgroundColor: 'var(--bg-secondary)' }}>
                                    {availableLabels.length === 0 ? (
                                        <small style={{ fontStyle: 'italic', color: 'var(--text-secondary)' }}>No hay etiquetas para agregar.</small>
                                    ) : (
                                        availableLabels.map(label => (
                                            <div
                                                key={label.id}
                                                onDoubleClick={() => handleSelectLabel(label.id)}
                                                style={{ 
                                                    cursor: 'pointer', padding: '5px', margin: '2px 0', 
                                                    borderRadius: '4px', backgroundColor: 'var(--bg-lightest)', 
                                                    border: '1px solid var(--text-secondary)', 
                                                    transition: 'background-color 0.1s' 
                                                }}
                                                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-primary-light)')}
                                                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-lightest)')}
                                            >
                                                {label.nombre}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Etiquetas Seleccionadas */}
                            <div style={{ flex: 1 }}>
                                <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold' }}>Seleccionadas ({selectedLabels.length}):</p>
                                <div style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid var(--text-secondary)', padding: '0.5rem', borderRadius: '4px', backgroundColor: 'var(--bg-secondary)' }}>
                                    {selectedLabels.length === 0 ? (
                                        <small style={{ fontStyle: 'italic', color: 'var(--text-secondary)' }}>Doble click en las disponibles para agregar.</small>
                                    ) : (
                                        selectedLabels.map(label => (
                                            <div
                                                key={label.id}
                                                onDoubleClick={() => handleDeselectLabel(label.id)}
                                                style={{ 
                                                    cursor: 'pointer', padding: '5px', margin: '2px 0', 
                                                    borderRadius: '4px', backgroundColor: 'var(--color-primary-light)', 
                                                    border: '1px solid var(--color-primary)', 
                                                    fontWeight: 'bold', 
                                                    transition: 'background-color 0.1s' 
                                                }}
                                                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-warning-light)')}
                                                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-primary-light)')}
                                            >
                                                {label.nombre} (X)
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>


                    {props.taskModalError && (
                        <p style={{ color: 'var(--color-error)', fontSize: '0.9rem' }}>{props.taskModalError}</p>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                        <button
                            type="button" onClick={() => props.setIsTaskModalOpen(false)}
                            style={{ backgroundColor: 'var(--text-secondary)' }}
                            disabled={props.taskModalLoading}
                        >
                            Cancelar
                        </button>
                        <button type="submit" disabled={props.taskModalLoading}>
                            {props.taskModalLoading ? 'Creando...' : 'Crear Tarea'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


// ----------------------------------------------------
// Componente: TaskDetailsModal
// ----------------------------------------------------
export const TaskDetailsModal: React.FC<TaskDetailsModalProps> = ({
    selectedTask,
    setSelectedTask,
    handleUpdateTaskStatus,
    isUpdatingTask,
    comentarios,
    isCommentsLoading,
    currentUserId,
    handleCreateComment,
    handleEditComment,
    handleDeleteComment,
    allLabels,
    currentTaskLabels,
    labelsLoading,
    handleUpdateTaskLabels,
    isUpdatingLabels,
}) => {
    if (!selectedTask) return null;

    const currentStatus = selectedTask.estado;
    const validStatuses = getValidNextStatuses(currentStatus);
    const displayStatuses = Array.from(new Set([currentStatus, ...validStatuses]));
    const isReadOnly = currentStatus === EstadoTarea.CANCELADA;
    
    const [selectedLabelIds, setSelectedLabelIds] = useState<string[]>([]);
    const [isAddingLabels, setIsAddingLabels] = useState(false);
    const [isRemovingLabels, setIsRemovingLabels] = useState(false);
    const [labelUpdateError, setLabelUpdateError] = useState<string | null>(null);

    useEffect(() => {
        if (currentTaskLabels) {
            setSelectedLabelIds(currentTaskLabels.map(label => label.id));
        }
    }, [currentTaskLabels]);

    const handleLabelAction = async (labelId: string, operation: 'add' | 'remove') => {
        if (!selectedTask || isUpdatingLabels) return;

        setLabelUpdateError(null);
        let newLabelIds = [...selectedLabelIds];

        if (operation === 'add' && !newLabelIds.includes(labelId)) {
            newLabelIds.push(labelId);
        } else if (operation === 'remove' && newLabelIds.includes(labelId)) {
            newLabelIds = newLabelIds.filter(id => id !== labelId);
        } else {
            return;
        }

        try {
            await handleUpdateTaskLabels(selectedTask.id, newLabelIds);
            setSelectedLabelIds(newLabelIds); 
            
        } catch (error) {
            setLabelUpdateError(error instanceof Error ? error.message : 'Error al guardar');
        }
    };


    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000,
        }}
            onClick={() => setSelectedTask(null)}
        >
            <div
                style={{
                    backgroundColor: 'var(--bg-lightest)', color: 'var(--text-primary)',
                    padding: '2rem', borderRadius: '8px',
                    minWidth: '350px', maxWidth: '600px', zIndex: 2001,
                    maxHeight: '80vh', overflowY: 'auto'
                }}
                onClick={(e) => e.stopPropagation()}
            >

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                    <h2 style={{ margin: 0, fontSize: '1.5rem' }}>{selectedTask.titulo}</h2>
                    <button
                        onClick={() => setSelectedTask(null)}
                        style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-secondary)' }}
                        disabled={isUpdatingTask}
                    >
                        &times;
                    </button>
                </div>

                <div style={{ marginBottom: '2rem', backgroundColor: 'var(--bg-tertiary)', padding: '1rem', borderRadius: '4px', display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>

                    <div style={{ flex: 1, minWidth: '150px' }}>
                        <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold' }}>Prioridad:</p>
                        <span style={{ color: getPriorityColor(selectedTask.prioridad) }}>{selectedTask.prioridad}</span>
                    </div>

                    <div style={{ flex: 1, minWidth: '150px' }}>
                        <label htmlFor="taskStateSelect" style={{ display: 'block', margin: '0 0 0.5rem 0', fontWeight: 'bold' }}>
                            Estado Actual:
                        </label>
                        {isReadOnly ? (
                            <p style={{ color: estadoConfig[currentStatus as EstadoTarea]?.color, fontWeight: 'bold' }}>
                                {currentStatus} (Inmutable)
                            </p>
                        ) : (
                            <select
                                id="taskStateSelect"
                                value={currentStatus}
                                onChange={(e) => handleUpdateTaskStatus(selectedTask.id, e.target.value as EstadoTarea)}
                                style={{ padding: '0.5rem', width: '100%' }}
                                disabled={isUpdatingTask || isReadOnly}
                            >
                                {displayStatuses.map(estado => (
                                    <option
                                        key={estado}
                                        value={estado}
                                        disabled={estado !== currentStatus && !validStatuses.includes(estado)}
                                    >
                                        {estado}
                                    </option>
                                ))}
                            </select>
                        )}

                        {isUpdatingTask && <small style={{ color: estadoConfig[currentStatus as EstadoTarea].color, display: 'block', marginTop: '5px' }}>Actualizando...</small>}
                    </div>
                </div>

                <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1rem', fontSize: '1.2rem' }}>Descripción</h3>
                <div style={{ whiteSpace: 'pre-wrap', minHeight: '50px', color: selectedTask.descripcion ? 'inherit' : 'var(--text-secondary)' }}>
                    {selectedTask.descripcion || 'Sin descripción detallada.'}
                </div>

                <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1rem', marginTop: '2rem', fontSize: '1.2rem' }}>
                    🏷️ Etiquetas
                </h3>
                
                {labelsLoading ? (
                    <p style={{ color: 'var(--text-secondary)' }}>Cargando etiquetas...</p>
                ) : (
                    <div style={{ marginBottom: '1.5rem' }}>
                        
                        <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold' }}>Etiquetas Actuales:</p>
                        <div style={{ display: 'flex', gap: '5px', alignItems: 'center', marginBottom: '1rem', minHeight: '30px' }}>
                            <EtiquetaDisplay etiquetas={currentTaskLabels} />
                        </div>

                        {/* 💡 CAMBIO: Contenedor para centrar los botones y darles margen */}
                        <div style={{ 
                            display: 'flex', 
                            justifyContent: 'center', 
                            marginTop: '1.5rem',     
                            marginBottom: '1rem'     
                        }}>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button 
                                    onClick={() => { setIsAddingLabels(true); setIsRemovingLabels(false); setLabelUpdateError(null); }}
                                    disabled={isReadOnly || isUpdatingLabels}
                                    // Usa el color primario (el salmón que asumes)
                                >
                                    ➕ Agregar Etiquetas
                                </button>
                                <button 
                                    onClick={() => { setIsRemovingLabels(true); setIsAddingLabels(false); setLabelUpdateError(null); }}
                                    disabled={isReadOnly || isUpdatingLabels || currentTaskLabels.length === 0}
                                    // Se eliminó el background 'warning' para que use el color primario (salmón)
                                >
                                    ➖ Remover Etiquetas
                                </button>
                            </div>
                        </div>
                        
                        {/* Secciones condicionales para la gestión */}
                        {(isAddingLabels || isRemovingLabels) && (
                            <div style={{ marginTop: '1rem', padding: '1rem', border: '1px dashed var(--border-color)', borderRadius: '4px' }}>
                                {isAddingLabels && (
                                    <AddLabelsSection
                                        allLabels={allLabels}
                                        currentTaskLabels={currentTaskLabels}
                                        onAction={handleLabelAction}
                                        isUpdatingLabels={isUpdatingLabels}
                                        onClose={() => setIsAddingLabels(false)}
                                    />
                                )}
                                {isRemovingLabels && (
                                    <RemoveLabelsSection
                                        currentTaskLabels={currentTaskLabels}
                                        onAction={handleLabelAction}
                                        isUpdatingLabels={isUpdatingLabels}
                                        onClose={() => setIsRemovingLabels(false)}
                                    />
                                )}
                                {isUpdatingLabels && <p style={{ color: 'var(--color-primary)', fontStyle: 'italic' }}>Guardando cambio...</p>}
                                {labelUpdateError && <p style={{ color: 'var(--color-error)' }}>Error: {labelUpdateError}</p>}
                            </div>
                        )}
                    </div>
                )}

                <HistorialSection
                    historial={selectedTask.historial || []}
                />

                <ComentariosSection
                    tareaId={selectedTask.id}
                    comentarios={comentarios}
                    currentUserId={currentUserId}
                    onCreate={handleCreateComment}
                    onEdit={handleEditComment}
                    onDelete={handleDeleteComment}
                    loading={isCommentsLoading}
                />
            </div>
        </div>
    );
};