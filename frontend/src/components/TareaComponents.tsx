// src/components/TareaComponents.tsx
import React, { useState } from 'react';

import { 
    EstadoTarea, 
    PrioridadTarea, 
    Tarea, 
    Comentario, // Asumiendo que la interfaz Comentario ya tiene 'autor' y 'fecha'
    estadoConfig, 
    getPriorityColor, 
    getValidNextStatuses 
} from '../types/tareas';

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
}

// Componente para renderizar la Tarjeta de Tarea
interface TareaCardProps {
    tarea: Tarea;
    setSelectedTask: (tarea: Tarea) => void;
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

// ----------------------------------------------------
// Componente: ComentarioCard
// ----------------------------------------------------
const ComentarioCard: React.FC<ComentarioProps> = ({ comentario, currentUserId, onEdit, onDelete }) => {
    // La comprobación del dueño está bien
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
             // El error se propaga
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
             // El error se propaga
        } finally {
            setLoading(false);
        }
    };


    return (
        <div style={{ borderLeft: '3px solid var(--color-primary)', padding: '0.5rem 1rem', marginBottom: '1rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '4px' }}>
            <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold' }}>
                {/* La lógica de mostrar 'Tú' y 'comentario.autor.nombre' está CORRECTA */}
                {isOwner ? 'Tú' : (comentario.autor.nombre || `Usuario ${comentario.autor.id}`)} 
                <small style={{ fontWeight: 'normal', color: 'var(--text-secondary)', marginLeft: '10px' }}>
                    {/* ❌ CORRECCIÓN CRÍTICA: Cambiado de 'comentario.fechaCreacion' a 'comentario.fecha' */}
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

// ----------------------------------------------------
// Componente: ComentarioForm (sin cambios)
// ----------------------------------------------------
const ComentarioForm: React.FC<{ taskId: string, onCreate: ComentariosSectionProps['onCreate'], loading: boolean }> = ({ taskId, onCreate, loading }) => {
    const [content, setContent] = useState('');
    const [localLoading, setLocalLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim() || localLoading) return;
        
        setLocalLoading(true);
        try {
            await onCreate(taskId, content.trim());
            setContent(''); // Limpiar si fue exitoso
        } catch(e) {
            // El error se muestra en la página principal, solo manejamos el estado aquí.
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


// ----------------------------------------------------
// Componente: ComentariosSection (sin cambios)
// ----------------------------------------------------
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

// ... (TareaCard y TareaColumna sin cambios)

export const TareaCard: React.FC<TareaCardProps> = ({ tarea, setSelectedTask }) => (
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
    </div>
);

// ... (TareaColumna sin cambios)
interface TareaColumnaProps {
    estado: EstadoTarea;
    tareas: Tarea[];
    setSelectedTask: (tarea: Tarea) => void;
}
export const TareaColumna: React.FC<TareaColumnaProps> = ({ estado, tareas, setSelectedTask }) => {
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
                    tareas.map(t => <TareaCard key={t.id} tarea={t} setSelectedTask={setSelectedTask} />)
                )}
            </div>
        </div>
    );
};

// ... (CreateTaskModal sin cambios)
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
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = (props) => {
    if (!props.isTaskModalOpen) return null;

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
                    minWidth: '300px', maxWidth: '500px', zIndex: 1001,
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <h3 style={{ marginTop: 0 }}>Crear Nueva Tarea</h3>
                <form onSubmit={props.handleCreateTask}>
                    {/* Título */}
                    <div style={{ marginBottom: '1rem' }}>
                        <label htmlFor="taskTitle" style={{ display: 'block', marginBottom: '0.5rem' }}>Título de la Tarea:</label>
                        <input
                            id="taskTitle" type="text" value={props.newTaskTitle}
                            onChange={(e) => props.setNewTaskTitle(e.target.value)}
                            placeholder="Ej: Implementar login"
                            style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }}
                            autoFocus
                            required
                        />
                    </div>

                    {/* Descripción */}
                    <div style={{ marginBottom: '1rem' }}>
                        <label htmlFor="taskDesc" style={{ display: 'block', marginBottom: '0.5rem' }}>Descripción (opcional):</label>
                        <textarea
                            id="taskDesc" value={props.newTaskDesc}
                            onChange={(e) => props.setNewTaskDesc(e.target.value)}
                            placeholder="Detalles sobre la tarea..."
                            style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box', minHeight: '80px' }}
                        />
                    </div>

                    {/* Prioridad */}
                    <div style={{ marginBottom: '1rem' }}>
                        <label htmlFor="taskPriority" style={{ display: 'block', marginBottom: '0.5rem' }}>Prioridad:</label>
                        <select
                            id="taskPriority"
                            value={props.newTaskPriority}
                            onChange={(e) => props.setNewTaskPriority(e.target.value as PrioridadTarea)}
                            style={{ width: '100%', padding: '0.5rem' }}
                        >
                            <option value={PrioridadTarea.ALTA}>Alta</option>
                            <option value={PrioridadTarea.MEDIA}>Media</option>
                            <option value={PrioridadTarea.BAJA}>Baja</option>
                        </select>
                    </div>

                    {/* Estado Inicial */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label htmlFor="taskEstado" style={{ display: 'block', marginBottom: '0.5rem' }}>Estado Inicial:</label>
                        <select
                            id="taskEstado"
                            value={props.newTaskEstado}
                            onChange={(e) => props.setNewTaskEstado(e.target.value as EstadoTarea)}
                            style={{ width: '100%', padding: '0.5rem' }}
                        >
                            <option value={EstadoTarea.PENDIENTE}>Pendiente</option>
                            <option value={EstadoTarea.EN_CURSO}>En curso</option>
                            <option value={EstadoTarea.TERMINADA}>Terminada</option>
                            <option value={EstadoTarea.CANCELADA}>Cancelada</option>
                        </select>
                    </div>
                    
                    {props.taskModalError && (
                        <p style={{ color: 'var(--color-error)', fontSize: '0.9rem' }}>{props.taskModalError}</p>
                    )}

                    {/* Botones */}
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
    // Desestructurar todas las props de comentarios aquí
    comentarios,
    isCommentsLoading,
    currentUserId,
    handleCreateComment,
    handleEditComment,
    handleDeleteComment
}) => {
    if (!selectedTask) return null;
    
    const currentStatus = selectedTask.estado;
    const validStatuses = getValidNextStatuses(currentStatus);
    const displayStatuses = Array.from(new Set([currentStatus, ...validStatuses]));
    const isReadOnly = currentStatus === EstadoTarea.CANCELADA;

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
                {/* Encabezado y Botón de Cerrar */}
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
                
                {/* Detalles y Edición de Estado */}
                <div style={{ marginBottom: '2rem', backgroundColor: 'var(--bg-tertiary)', padding: '1rem', borderRadius: '4px', display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                    
                    {/* Prioridad (solo lectura) */}
                    <div style={{ flex: 1, minWidth: '150px' }}>
                        <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold' }}>Prioridad:</p>
                        <span style={{ color: getPriorityColor(selectedTask.prioridad) }}>{selectedTask.prioridad}</span>
                    </div>

                    {/* Selector de Estado (Editable/Readonly) */}
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
                                        // Deshabilita estados que no son ni el actual ni los válidos (si el navegador lo permite)
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

                {/* Descripción */}
                <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1rem', fontSize: '1.2rem' }}>Descripción</h3>
                <div style={{ whiteSpace: 'pre-wrap', minHeight: '50px', color: selectedTask.descripcion ? 'inherit' : 'var(--text-secondary)' }}>
                    {selectedTask.descripcion || 'Sin descripción detallada.'}
                </div>
                
                {/* Componente ComentariosSection: */}
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