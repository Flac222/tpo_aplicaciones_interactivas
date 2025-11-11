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
    token: string; // 💡 NUEVO: El token de autenticación es necesario para el fetch
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

const RegistroHistorialCard: React.FC<RegistroHistorialProps> = ({ registro }) => {

    const fechaFormateada = new Date(registro.fecha).toLocaleString();

    // Creamos una variable de usuario segura
    const usuario = registro.usuario;

    // 💡 Paso 1: Debugging temporal para ver los valores
    // console.log("Registro:", registro);
    // console.log("Usuario.nombre:", usuario?.nombre);
    // console.log("Usuario.email:", usuario?.email);

    let nombreMostrar = 'Sistema / Usuario Desconocido'; // Fallback por defecto

    if (usuario) {
        // Asignar el nombre si existe y no es una cadena vacía
        if (usuario.nombre && usuario.nombre.trim() !== '') {
            nombreMostrar = usuario.nombre;
            // Si el nombre falla, usar el email si existe y no es una cadena vacía
        } else if (usuario.email && usuario.email.trim() !== '') {
            nombreMostrar = usuario.email;
        } else {
            // Si el objeto usuario existe, pero nombre y email están vacíos.
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
                    {/* Utilizamos la variable calculada (ya verificada): */}
                    {nombreMostrar}
                </span>{' '}
                ha realizado el cambio: <span style={{ fontStyle: 'italic' }}>{registro.cambio}</span>
            </div>
        </div>
    );
};

// ----------------------------------------------------
// Componente: HistorialSection (NUEVO)
// ----------------------------------------------------
interface HistorialSectionProps {
    historial: RegistroHistorial[];
}

export const HistorialSection: React.FC<HistorialSectionProps> = ({ historial }) => {
    // Para mostrar el historial del más reciente al más antiguo
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
        } catch (e) {
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


export const TareaCard: React.FC<TareaCardProps> = ({ tarea, setSelectedTask, token }) => {
    // 💡 HACEMOS taskLabels robusto: inicializa con el prop o un array vacío.
    const [taskLabels, setTaskLabels] = useState<Etiqueta[]>(tarea.etiquetas ?? []);
    const [loadingLabels, setLoadingLabels] = useState(false);
    // 💡 NUEVO ESTADO: Bandera para saber si ya consultamos las etiquetas, incluso si el resultado fue vacío.
    const [hasFetchedLabels, setHasFetchedLabels] = useState(false);

    useEffect(() => {
        // 1. CONDICIÓN DE ESCAPE PRINCIPAL: Si ya las trajimos (estén vacías o llenas), salimos.
        if (hasFetchedLabels) {
            return;
        }

        // 2. CONDICIÓN DE INICIO: Solo si el token existe y la tarea no tiene etiquetas pre-cargadas.
        const needsFetching = token && tarea.id && (!tarea.etiquetas || tarea.etiquetas.length === 0);

        if (needsFetching) {
            // Se debe establecer loading aquí para evitar un loop de fetch
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
                    // 💡 CRUCIAL: Marcamos que la consulta ha terminado (exitosa o fallida).
                    setHasFetchedLabels(true); 
                    setLoadingLabels(false);
                }
            };

            fetchTaskLabels();
        } 
        
        // 3. Si la tarea ya traía etiquetas desde el inicio, también marcamos como "fetched"
        if (tarea.etiquetas && tarea.etiquetas.length > 0) {
             setHasFetchedLabels(true);
        }

    // Dependencias: token y el ID de la tarea
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
            <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                {loadingLabels 
                    ? <small style={{ fontStyle: 'italic' }}>Cargando etiquetas...</small>
                    // Solo renderiza EtiquetaDisplay si ya terminamos de consultar (hasFetchedLabels es true)
                    : (hasFetchedLabels || taskLabels.length > 0) 
                        ? <EtiquetaDisplay etiquetas={taskLabels}/>
                        : null // O puedes poner: <small>Sin etiquetas</small>
                }
            </div>
            {/* 💡 NUEVO: Mostrar las etiquetas asociadas a la tarea */}

        </div>
    )
};

export const EtiquetaDisplay: React.FC<EtiquetaDisplayProps> = ({ etiquetas }) => {
    // 1. Manejo de nulo/vacío
    if (!etiquetas || etiquetas.length === 0) {
        return null; // O <></> (fragmento vacío)
    }
    
    return (
        <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: '4px', // Espacio entre etiquetas
        }}>
            {/* 2. Mapeo y renderizado de cada etiqueta */}
            {etiquetas.map(etiqueta => (
                <span 
                    key={etiqueta.id} 
                    style={{
                        // 💡 ESTILOS CRUCIALES:
                        backgroundColor: 'var(--color-primary-light)', // Color de fondo visible
                        color: '#000', // Color de texto
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '0.7rem',
                        fontWeight: 'bold'
                    }}
                >
                    {etiqueta.nombre}
                </span>
            ))}
        </div>
    );
};

// ... (TareaColumna sin cambios)
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
                        token={token} // <-- ESTO ES CRUCIAL
                    />)
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
    // 💡 NUEVAS PROPS DE ETIQUETAS
    allLabels: Etiqueta[]; // Todas las etiquetas disponibles
    newTaskLabels: string[]; // IDs de etiquetas seleccionadas
    setNewTaskLabels: (labels: string[]) => void; // Setter para IDs de etiquetas
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = (props) => {
    if (!props.isTaskModalOpen) return null;

    const handleLabelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        // Obtenemos un array de los IDs seleccionados
        const selectedOptions = Array.from(e.target.selectedOptions);
        const selectedIds = selectedOptions.map(option => option.value);
        props.setNewTaskLabels(selectedIds);
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
                    minWidth: '300px', maxWidth: '500px', zIndex: 1001,
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

                    {/* 2. Descripción */}
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

                    {/* 3. Prioridad */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label htmlFor="taskPriority" style={{ display: 'block', marginBottom: '0.5rem' }}>Prioridad:</label>
                        <select
                            id="taskPriority"
                            value={props.newTaskPriority}
                            onChange={(e) => props.setNewTaskPriority(e.target.value as PrioridadTarea)}
                            required
                            style={{ padding: '0.5rem' }}
                        >
                            {Object.values(PrioridadTarea).map(p => (
                                <option key={p} value={p}>{p}</option>
                            ))}
                        </select>
                    </div>

                    {/* 4. Estado Inicial */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label htmlFor="taskEstado" style={{ display: 'block', marginBottom: '0.5rem' }}>Estado Inicial:</label>
                        <select
                            id="taskEstado"
                            value={props.newTaskEstado}
                            onChange={(e) => props.setNewTaskEstado(e.target.value as EstadoTarea)}
                            required
                            style={{ padding: '0.5rem' }}
                        >
                            {Object.values(EstadoTarea).map(e => (
                                <option key={e} value={e}>{e}</option>
                            ))}
                        </select>
                    </div>

                    {/* 💡 NUEVO SELECTOR DE ETIQUETAS MÚLTIPLES */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label htmlFor="taskLabels" style={{ display: 'block', marginBottom: '0.5rem' }}>Etiquetas (Selección múltiple, opcional):</label>
                        <select
                            id="taskLabels"
                            multiple // Habilitar selección múltiple
                            value={props.newTaskLabels}
                            onChange={handleLabelChange}
                            style={{ width: '100%', padding: '0.5rem', minHeight: '100px', boxSizing: 'border-box' }}
                        >
                            {props.allLabels.map(label => (
                                <option key={label.id} value={label.id}>{label.nombre}</option>
                            ))}
                        </select>
                        {props.allLabels.length === 0 && (
                            <small style={{ color: 'var(--text-secondary)', marginTop: '5px', display: 'block' }}>
                                No hay etiquetas disponibles. Crea una en la página del equipo.
                            </small>
                        )}
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
    const [labelUpdateError, setLabelUpdateError] = useState<string | null>(null);

    useEffect(() => {
        if (currentTaskLabels) {
            setSelectedLabelIds(currentTaskLabels.map(label => label.id));
        }
    }, [currentTaskLabels]); // Dependencia: las etiquetas cargadas

    const handleLabelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedOptions = Array.from(e.target.selectedOptions);
        const selectedIds = selectedOptions.map(option => option.value);
        setSelectedLabelIds(selectedIds);
    };

    const saveLabelChanges = async () => {
        setLabelUpdateError(null);

        // Comprobar si hay cambios reales
        const originalIds = (currentTaskLabels || []).map(l => l.id).sort();
        const newIds = [...selectedLabelIds].sort();

        if (JSON.stringify(originalIds) === JSON.stringify(newIds)) {
            return; // No hay cambios
        }

        try {
            await handleUpdateTaskLabels(selectedTask.id, selectedLabelIds);
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

                <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1rem', marginTop: '2rem', fontSize: '1.2rem' }}>
                    🏷️ Etiquetas
                </h3>

                {labelsLoading ? (
                    <p style={{ color: 'var(--text-secondary)' }}>Cargando etiquetas...</p>
                ) : (
                    <div style={{ marginBottom: '1.5rem' }}>
                        <select
                            id="taskLabelsEdit"
                            multiple
                            value={selectedLabelIds}
                            onChange={handleLabelChange}
                            style={{ width: '100%', padding: '0.5rem', minHeight: '100px', boxSizing: 'border-box' }}
                            disabled={isUpdatingLabels || isReadOnly}
                        >
                            {allLabels.map(label => (
                                <option key={label.id} value={label.id}>{label.nombre}</option>
                            ))}
                        </select>
                        {allLabels.length === 0 && (
                            <small style={{ color: 'var(--text-secondary)', marginTop: '5px', display: 'block' }}>
                                No hay etiquetas disponibles en este equipo.
                            </small>
                        )}

                        {/* Botón de Guardar para Etiquetas */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                            <button
                                onClick={saveLabelChanges}
                                disabled={isUpdatingLabels || isReadOnly}
                            >
                                {isUpdatingLabels ? 'Guardando...' : 'Guardar Etiquetas'}
                            </button>
                        </div>
                        {labelUpdateError && <p style={{ color: 'var(--color-error)', fontSize: '0.9rem', textAlign: 'right' }}>{labelUpdateError}</p>}
                    </div>
                )}

                {/* 1. SECCIÓN DE HISTORIAL (NUEVA POSICIÓN) */}
                <HistorialSection
                    // La propiedad 'historial' viene directamente de selectedTask
                    historial={selectedTask.historial || []}
                />

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