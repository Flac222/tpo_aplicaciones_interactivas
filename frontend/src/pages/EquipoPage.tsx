// src/pages/EquipoPage.tsx

// ... (todos los imports igual que antes)
import React, { useMemo, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useFetch } from '../hooks/useFetch';
import {
    EstadoTarea,
    PrioridadTarea,
    Tarea,
    Comentario,
    getValidNextStatuses,
} from '../types/tareas';
import { 
    TareaColumna, 
    CreateTaskModal,
    TaskDetailsModal
} from '../components/TareaComponents';


const BASE_URL = 'http://localhost:3000';

// << Interfaz de Paginación (igual que antes) >>
interface PaginacionTareas {
    tareas: Tarea[];
    total: number;
    page: number;
    totalPages: number;
    limit: number;
}


export function EquipoPage(): React.ReactElement {
    const { id: equipoId } = useParams();
    // 💡 CAMBIO 1: Desestructuramos el objeto 'usuario' del contexto de Auth
    const { token, usuario } = useAuth(); 
    
    // 💡 CAMBIO 2: Obtenemos el ID real del usuario logueado
    const currentUserId = usuario?.id || ''; 

    // << Estados (igual que antes) >>
    const [filtroEstado, setFiltroEstado] = useState<string>('todos');
    const [filtroPrioridad, setFiltroPrioridad] = useState<string>('todos');
    const [page, setPage] = useState(1);
    const [limit] = useState(10); 
    
    const [correo, setCorreo] = useState('');
    const [inviteLoading, setInviteLoading] = useState(false);
    
    // Estados para el modal de CREACIÓN de TAREAS
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [newTaskTitle, setNewTaskTitle] = useState("");
    const [newTaskDesc, setNewTaskDesc] = useState("");
    const [newTaskPriority, setNewTaskPriority] = useState<PrioridadTarea>(PrioridadTarea.MEDIA);
    const [newTaskEstado, setNewTaskEstado] = useState<EstadoTarea>(EstadoTarea.PENDIENTE);
    const [taskModalLoading, setTaskModalLoading] = useState(false);
    const [taskModalError, setTaskModalError] = useState<string | null>(null);

    const [selectedTask, setSelectedTask] = useState<Tarea | null>(null);
    const [isUpdatingTask, setIsUpdatingTask] = useState(false);
    const [comentarios, setComentarios] = useState<Comentario[]>([]);
    const [isCommentsLoading, setIsCommentsLoading] = useState(false);

    // --- BLOQUE DE FETCH Y DEPENDENCIAS (sin cambios) ---
    const url = useMemo(() => {
        if (!equipoId) return '';
        
        const params = new URLSearchParams();
        params.append('page', page.toString());
        params.append('limit', limit.toString());
        
        if (filtroEstado !== 'todos') {
            params.append('estado', filtroEstado);
        }
        if (filtroPrioridad !== 'todos') {
            params.append('prioridad', filtroPrioridad);
        }

        return `${BASE_URL}/api/tareas/${equipoId}?${params.toString()}`;
    }, [equipoId, page, limit, filtroEstado, filtroPrioridad]);

    const fetchOptions: RequestInit = useMemo(() => ({
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    }), [token]);

    const { 
        data: paginacion, 
        loading, 
        error, 
        refetch 
    } = useFetch<PaginacionTareas>(url, fetchOptions);

    // 3. LÓGICA DE FILTRADO Y AGRUPACIÓN (sin cambios)
    const tareasFiltradas = useMemo(() => {
        const tareas = paginacion?.tareas; 
        
        if (!Array.isArray(tareas)) {
            return [];
        }

        return tareas.filter(t =>
            (filtroEstado === 'todos' || t.estado === filtroEstado) &&
            (filtroPrioridad === 'todos' || t.prioridad === filtroPrioridad)
        );
    }, [paginacion, filtroEstado, filtroPrioridad]);

    const tareasAgrupadas = useMemo(() => {
        const grupos: Record<EstadoTarea, Tarea[]> = {
            [EstadoTarea.PENDIENTE]: [],
            [EstadoTarea.EN_CURSO]: [],
            [EstadoTarea.TERMINADA]: [],
            [EstadoTarea.CANCELADA]: [],
        };
        
        if (tareasFiltradas) {
            tareasFiltradas.forEach(tarea => {
                if (grupos[tarea.estado as EstadoTarea]) {
                   grupos[tarea.estado as EstadoTarea].push(tarea);
                }
            });
        }
        return grupos;
    }, [tareasFiltradas]);

    
    // --- Handlers ---
    const handleEstadoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      setFiltroEstado(e.target.value);
      setPage(1); 
    };

    const handlePrioridadChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      setFiltroPrioridad(e.target.value);
      setPage(1); 
    };
    
    const handleUpdateTaskStatus = async (
        tareaId: string,
        nuevoEstado: EstadoTarea
    ) => {
        if (isUpdatingTask || !token || !selectedTask) return;
        const currentStatus = selectedTask.estado;
        const validStatuses = getValidNextStatuses(currentStatus);

        if (currentStatus === nuevoEstado) return;

        if (!validStatuses.includes(nuevoEstado)) {
            alert(`¡Error! La transición de ${currentStatus} a ${nuevoEstado} no está permitida.`);
            return;
        }
        setIsUpdatingTask(true);
        try {
            const body = {
                nuevoEstado: nuevoEstado,
                usuarioId: currentUserId, // Usando el ID real
            };
            const res = await fetch(`${BASE_URL}/api/tareas/${tareaId}/estado`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(body),
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Error desconocido al actualizar el estado de la tarea');
            }
            setSelectedTask(prev => prev ? { ...prev, estado: nuevoEstado } : null);
            refetch(); 

        } catch (err) {
            alert(`Error al cambiar el estado: ${err instanceof Error ? err.message : String(err)}`);
        } finally {
            setIsUpdatingTask(false);
        }
    };

    const invitarUsuario = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!correo || !equipoId || inviteLoading) return;
        setInviteLoading(true);
        try {
            const res = await fetch(`${BASE_URL}/api/equipos/${equipoId}/invitar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ correo }),
            });
            const data = await res.json();
            if (res.ok) {
                alert('Invitación enviada con éxito');
                setCorreo('');
            } else {
                alert(`Error al invitar: ${data.error || 'Error desconocido'}`);
            }
        } catch (err) {
            alert('Error de red al enviar la invitación.');
        } finally {
            setInviteLoading(false);
        }
    };

    const handleCreateTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTaskTitle.trim()) {
            setTaskModalError("El título es obligatorio.");
            return;
        }
        if (!equipoId || !token) {
            setTaskModalError("Error de autenticación o de equipo. Recarga la página.");
            return;
        }
        setTaskModalLoading(true);
        setTaskModalError(null);
        const body = {
            titulo: newTaskTitle,
            descripcion: newTaskDesc,
            prioridad: newTaskPriority,
            equipoId: equipoId,
            estado: newTaskEstado,
        };
        try {
            const res = await fetch(`${BASE_URL}/api/tareas`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(body),
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || 'Error desconocido al crear la tarea');
            }

            setIsTaskModalOpen(false); 
            refetch(); 
            setNewTaskTitle("");
            setNewTaskDesc("");
            setNewTaskPriority(PrioridadTarea.MEDIA);
            setNewTaskEstado(EstadoTarea.PENDIENTE);
        } catch (err: any) {
            setTaskModalError(err.message);
        } finally {
            setTaskModalLoading(false);
        }
    };

    const fetchComentarios = async (tareaId: string) => {
        if (!token) return;
        setIsCommentsLoading(true);
        try {
            const res = await fetch(`${BASE_URL}/api/comentarios/tareas/${tareaId}/comentarios`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (!res.ok) {
                throw new Error('No se pudieron cargar los comentarios.');
            }
            const data: Comentario[] = await res.json();
            
            // 💡 AJUSTE DE FECHA: Usamos 'a.fecha' y 'b.fecha' para ordenar
            setComentarios(data.sort((a, b) => 
                new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
            ));

        } catch (error) {
            console.error("Error al cargar comentarios:", error);
            setComentarios([]);
            alert('Error al cargar comentarios: ' + (error instanceof Error ? error.message : 'Error desconocido'));
        } finally {
            setIsCommentsLoading(false);
        }
    };

    const handleCreateComment = async (tareaId: string, contenido: string) => {
        if (!token || !currentUserId) return; 
        
        try {
            const res = await fetch(`${BASE_URL}/api/comentarios/tareas/${tareaId}/comentarios`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    contenido,
                    // 💡 Se mantiene 'creadorId' asumiendo que el endpoint POST espera esto
                    creadorId: currentUserId 
                }), 
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Error al crear el comentario');
            }
            // Recargar la lista de comentarios para ver el nuevo
            await fetchComentarios(tareaId); 

        } catch (error) {
            alert('Error al crear el comentario: ' + (error instanceof Error ? error.message : 'Error desconocido'));
            throw error;
        }
    };

    const handleEditComment = async (commentId: string, nuevoContenido: string) => {
        if (!token) return;
        
        try {
            const res = await fetch(`${BASE_URL}/api/comentarios/comentarios/${commentId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ contenido: nuevoContenido }),
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Error al editar el comentario');
            }
            
            setComentarios(prev => prev.map(c => 
                c.id === commentId ? { ...c, contenido: nuevoContenido } : c
            ));
        } catch (error) {
            alert('Error al editar el comentario: ' + (error instanceof Error ? error.message : 'Error desconocido'));
            throw error;
        }
    };

    const handleDeleteComment = async (commentId: string) => {
        if (!token) return;
        
        try {
            const res = await fetch(`${BASE_URL}/api/comentarios/comentarios/${commentId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ id: commentId }),
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Error al eliminar el comentario');
            }
            
            setComentarios(prev => prev.filter(c => c.id !== commentId));
        } catch (error) {
            alert('Error al eliminar el comentario: ' + (error instanceof Error ? error.message : 'Error desconocido'));
            throw error;
        }
    };

    useEffect(() => {
        // Aseguramos que solo haga fetch si hay una tarea seleccionada Y un token
        if (selectedTask && token) { 
            fetchComentarios(selectedTask.id);
        } else {
            setComentarios([]);
        }
    }, [selectedTask, token]);    

    // 5. RENDERIZADO PRINCIPAL
    return (
        <div className="main-content">
            {/* Componentes de modal importados */}
            <CreateTaskModal 
                isTaskModalOpen={isTaskModalOpen}
                setIsTaskModalOpen={setIsTaskModalOpen}
                handleCreateTask={handleCreateTask}
                newTaskTitle={newTaskTitle}
                setNewTaskTitle={setNewTaskTitle}
                newTaskDesc={newTaskDesc}
                setNewTaskDesc={setNewTaskDesc}
                newTaskPriority={newTaskPriority}
                setNewTaskPriority={setNewTaskPriority}
                newTaskEstado={newTaskEstado}
                setNewTaskEstado={setNewTaskEstado}
                taskModalLoading={taskModalLoading}
                taskModalError={taskModalError}
            />
            {/* TaskDetailsModal con props de comentarios */}
            <TaskDetailsModal 
                selectedTask={selectedTask}
                setSelectedTask={setSelectedTask}
                handleUpdateTaskStatus={handleUpdateTaskStatus}
                isUpdatingTask={isUpdatingTask}

                // Props de Comentarios
                comentarios={comentarios}
                isCommentsLoading={isCommentsLoading}
                // Pasamos el ID real del usuario logueado
                currentUserId={currentUserId} 
                handleCreateComment={handleCreateComment}
                handleEditComment={handleEditComment}
                handleDeleteComment={handleDeleteComment}
            />

            <div className="card">

                <h2 className="card-title">Gestión del Equipo</h2>

                {/* Controles de Filtros e Invitación */}
                <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                    flexWrap: 'wrap', gap: '2rem', marginBottom: '2.5rem',
                    padding: '1.5rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px'
                }}>

                    <section style={{ flex: '1', minWidth: '250px' }}>
                        <h3>🎯 Filtrar tareas</h3>
                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                            <select
                                aria-label="Filtrar por estado" value={filtroEstado}
                                onChange={handleEstadoChange} 
                                style={{ padding: '0.5rem' }}
                            >
                                <option value="todos">Todos los estados</option>
                                <option value={EstadoTarea.PENDIENTE}>Pendiente</option>
                                <option value={EstadoTarea.EN_CURSO}>En curso</option>
                                <option value={EstadoTarea.TERMINADA}>Terminada</option>
                                <option value={EstadoTarea.CANCELADA}>Cancelada</option>
                            </select>

                            <select
                                aria-label="Filtrar por prioridad" value={filtroPrioridad}
                                onChange={handlePrioridadChange} 
                                style={{ padding: '0.5rem' }}
                            >
                                <option value="todos">Todas las prioridades</option>
                                <option value={PrioridadTarea.ALTA}>Alta</option>
                                <option value={PrioridadTarea.MEDIA}>Media</option>
                                <option value={PrioridadTarea.BAJA}>Baja</option>
                            </select>
                        </div>
                    </section>

                    <section style={{ flex: '1', minWidth: '250px' }}>
                        <h3>📨 Invitar usuario</h3>
                        <form onSubmit={invitarUsuario} style={{ display: 'flex', gap: '0.5rem' }}>
                            <input
                                type="email" placeholder="Correo electrónico del miembro"
                                value={correo} onChange={e => setCorreo(e.target.value)}
                                required style={{ padding: '0.5rem', flex: 1 }}
                            />
                            <button type="submit" disabled={inviteLoading}>
                                {inviteLoading ? 'Enviando...' : 'Invitar'}
                            </button>
                        </form>
                    </section>
                </div>

                {/* Sección Kanban */}
                <section>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '1rem',
                        marginBottom: '1.5rem'
                    }}>
                        <h3 style={{ margin: 0 }}>📋 Vista Kanban de Tareas</h3>
                        <button onClick={() => setIsTaskModalOpen(true)}>+ Tarea</button>
                    </div>

                    {loading && <p>Cargando tareas...</p>}

                    {error && (
                        <div style={{ color: 'var(--color-error)' }}>
                            <p>Error al cargar tareas: {error}</p>
                            <button onClick={refetch}>Reintentar</button>
                        </div>
                    )}

                    {!loading && !error && (
                        <>
                            {/* Columnas Kanban */}
                            <div style={{
                                display: 'flex',
                                gap: '1rem',
                                overflowX: 'auto',
                                paddingBottom: '1rem',
                                minHeight: '500px'
                            }}>
                                <TareaColumna estado={EstadoTarea.PENDIENTE} tareas={tareasAgrupadas[EstadoTarea.PENDIENTE]} setSelectedTask={setSelectedTask} />
                                <TareaColumna estado={EstadoTarea.EN_CURSO} tareas={tareasAgrupadas[EstadoTarea.EN_CURSO]} setSelectedTask={setSelectedTask} />
                                <TareaColumna estado={EstadoTarea.TERMINADA} tareas={tareasAgrupadas[EstadoTarea.TERMINADA]} setSelectedTask={setSelectedTask} />
                                <TareaColumna estado={EstadoTarea.CANCELADA} tareas={tareasAgrupadas[EstadoTarea.CANCELADA]} setSelectedTask={setSelectedTask} />
                            </div>

                            {/* Controles de Paginación */}
                            <div className="pagination-controls" style={{ 
                                display: 'flex', 
                                justifyContent: 'center', 
                                gap: '1rem', 
                                alignItems: 'center', 
                                margin: '2rem 0 1rem 0'
                            }}>
                                <button 
                                    onClick={() => setPage(p => p - 1)} 
                                    disabled={page <= 1 || loading}
                                >
                                    Anterior
                                </button>
                                <span>
                                    Página {paginacion?.page || 1} de {paginacion?.totalPages || 1}
                                </span>
                                <button 
                                    onClick={() => setPage(p => p + 1)} 
                                    disabled={page >= (paginacion?.totalPages || 1) || loading}
                                >
                                    Siguiente
                                </button>
                            </div>
                        </>
                    )}
                </section>

            </div>
        </div>
    );
}