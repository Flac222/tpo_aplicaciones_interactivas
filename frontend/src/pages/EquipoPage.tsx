// EquipoPage.tsx
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
    Etiqueta,
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
    // 💡 NUEVO ESTADO: Filtro por etiqueta
    const [filtroEtiqueta, setFiltroEtiqueta] = useState<string>('todos');
    const [filtroTexto, setFiltroTexto] = useState<string>('');
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [isUpdatingLabels, setIsUpdatingLabels] = useState(false); // Para el spinner de "guardar"
    const [modalTaskLabels, setModalTaskLabels] = useState<Etiqueta[]>([]);
    const [modalLabelsLoading, setModalLabelsLoading] = useState(false);

    const [correo, setCorreo] = useState('');
    const [inviteLoading, setInviteLoading] = useState(false);

    // Estados para el modal de CREACIÓN de TAREAS
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [newTaskTitle, setNewTaskTitle] = useState("");
    const [newTaskDesc, setNewTaskDesc] = useState("");
    const [newTaskPriority, setNewTaskPriority] = useState<PrioridadTarea>(PrioridadTarea.MEDIA);
    const [newTaskEstado, setNewTaskEstado] = useState<EstadoTarea>(EstadoTarea.PENDIENTE);
    const [newTaskLabels, setNewTaskLabels] = useState<string[]>([]);
    const [taskModalLoading, setTaskModalLoading] = useState(false);
    const [taskModalError, setTaskModalError] = useState<string | null>(null);

    const [selectedTask, setSelectedTask] = useState<Tarea | null>(null);
    const [isUpdatingTask, setIsUpdatingTask] = useState(false);
    const [comentarios, setComentarios] = useState<Comentario[]>([]);
    const [isCommentsLoading, setIsCommentsLoading] = useState(false);

    // 💡 NUEVOS ESTADOS para la creación de Etiquetas
    const [newLabelName, setNewLabelName] = useState('');
    const [isLabelModalOpen, setIsLabelModalOpen] = useState(false);
    const [labelLoading, setLabelLoading] = useState(false);
    const [labelError, setLabelError] = useState<string | null>(null);


    // --- BLOQUE DE FETCH Y DEPENDENCIAS ---

    // 💡 CAMBIO: Lógica para obtener la URL de las Tareas (ahora incluye filtroEtiqueta)
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

        if (filtroEtiqueta !== 'todos') {
            params.append('etiquetaId', filtroEtiqueta);
        }

        // 💡 NUEVO FILTRO EN LA URL: Filtro por texto
        if (filtroTexto.trim()) {
            params.append('q', filtroTexto.trim()); // Usamos 'q' (query)
        }

        // Ajustamos la dependencia aquí
        return `${BASE_URL}/api/tareas/${equipoId}?${params.toString()}`;
    }, [equipoId, page, limit, filtroEstado, filtroPrioridad, filtroEtiqueta, filtroTexto]); // 💡 Añadimos filtroTexto a las dependencias

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

    // 💡 NUEVO FETCH: Obtener la lista de etiquetas
    const etiquetasUrl = useMemo(() => {
        if (!equipoId) return '';
        return `${BASE_URL}/api/etiquetas/equipos/${equipoId}/etiquetas`;
    }, [equipoId]);

    const {
        data: etiquetas = [], // Inicializamos con un array vacío
        refetch: refetchEtiquetas
    } = useFetch<Etiqueta[]>(etiquetasUrl, fetchOptions);

    // 3. LÓGICA DE FILTRADO Y AGRUPACIÓN (el filtro de etiqueta en `url` ya lo maneja el backend)
    const tareasFiltradas = useMemo(() => {
        const tareas = paginacion?.tareas;

        if (!Array.isArray(tareas)) {
            return [];
        }
        // Nota: Solo se necesita filtrar lo que no se incluyó en el fetch principal.
        // Los filtros de estado y prioridad ya se manejaban aquí, los mantendremos por coherencia, 
        // aunque ahora también se envían al backend. La lógica de filtro por etiqueta 
        // se asume manejada totalmente en el backend vía `etiquetaId` en la URL.

        return tareas.filter(t =>
            (filtroEstado === 'todos' || t.estado === filtroEstado) &&
            (filtroPrioridad === 'todos' || t.prioridad === filtroPrioridad)
            // Ya NO necesitamos filtrar por etiqueta aquí, ya que la API lo hace.
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

    const handleUpdateTaskLabels = async (tareaId: string, newLabelIds: string[]) => {
        if (!token) throw new Error("No autenticado");

        setIsUpdatingLabels(true);

        // 1. Obtener las etiquetas actuales (IDs) del estado local
        const currentLabelIds = modalTaskLabels.map(label => label.id);

        // 2. Calcular el Diff: Qué agregar y qué remover.
        const labelsToAdd = newLabelIds.filter(id => !currentLabelIds.includes(id));
        const labelsToRemove = currentLabelIds.filter(id => !newLabelIds.includes(id));

        // Array para almacenar todas las promesas de la API
        const updatePromises: Promise<any>[] = [];

        // ✅ 3. Crear Promesas para AÑADIR (POST) - ¡POSICIÓN CORRECTA!
        labelsToAdd.forEach(labelId => {
            const promise = fetch(`${BASE_URL}/api/etiquetas/tareas/${tareaId}/etiquetas/${labelId}`, {
                method: 'POST', // Usar POST para asignar
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            }).then(res => {
                if (!res.ok) {
                    throw new Error(`Fallo al asignar etiqueta ${labelId}: ${res.statusText}`);
                }
            });
            updatePromises.push(promise);
        });

        // ✅ 4. Crear Promesas para REMOVER (DELETE) - ¡POSICIÓN CORRECTA!
        labelsToRemove.forEach(labelId => {
            const promise = fetch(`${BASE_URL}/api/etiquetas/tareas/${tareaId}/etiquetas/${labelId}`, {
                method: 'DELETE', // Usar DELETE para remover
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            }).then(res => {
                if (!res.ok) {
                    throw new Error(`Fallo al remover etiqueta ${labelId}: ${res.statusText}`);
                }
            });
            updatePromises.push(promise);
        });

        try {
            // 5. Ejecutar todas las llamadas en paralelo
            await Promise.all(updatePromises);

            // 6. Si todas las llamadas son exitosas, actualizamos el estado local del modal
            const updatedLabels = (etiquetas ?? []).filter(label => newLabelIds.includes(label.id));
            setModalTaskLabels(updatedLabels);

            // 🚀 AQUI ESTÁ LA SOLUCIÓN: Recarga el listado completo de tareas
            refetch();

        } catch (error) {
            console.error("Error en la actualización atómica de etiquetas:", error);
            // Relanzar el error para que el modal pueda mostrar el mensaje
            throw error;
        } finally {
            setIsUpdatingLabels(false);
        }
    };

    const fetchTaskLabels = async (tareaId: string) => {
        if (!token) return;
        try {
            const res = await fetch(`${BASE_URL}/api/etiquetas/tareas/${tareaId}/etiquetas`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (!res.ok) throw new Error('No se pudieron cargar las etiquetas de la tarea.');
            const data: Etiqueta[] = await res.json();
            setModalTaskLabels(data);
        } catch (error) {
            console.error("Error al cargar etiquetas de la tarea:", error);
            setModalTaskLabels([]); // Limpiar en caso de error
        }
    };

    // --- Handlers ---
    const handleEstadoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFiltroEstado(e.target.value);
        setPage(1);
    };

    const handlePrioridadChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFiltroPrioridad(e.target.value);
        setPage(1);
    };

    // 💡 NUEVO HANDLER: Cambiar el filtro de etiqueta
    const handleLabelFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFiltroEtiqueta(e.target.value);
        setPage(1);
    };

    // 💡 NUEVO HANDLER: Crear etiqueta
    const handleCreateLabel = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newLabelName.trim()) {
            setLabelError("El nombre de la etiqueta es obligatorio.");
            return;
        }
        if (!equipoId || !token) {
            setLabelError("Error de autenticación o de equipo. Recarga la página.");
            return;
        }

        setLabelLoading(true);
        setLabelError(null);

        try {
            const res = await fetch(`${BASE_URL}/api/etiquetas/equipos/${equipoId}/etiquetas`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ nombre: newLabelName }),
            });
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Error desconocido al crear la etiqueta');
            }

            setIsLabelModalOpen(false);
            refetchEtiquetas(); // Refrescar la lista de etiquetas
            setNewLabelName("");
            alert(`Etiqueta "${newLabelName}" creada con éxito.`);

        } catch (err: any) {
            setLabelError(err.message);
        } finally {
            setLabelLoading(false);
        }
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

        // 💡 CAMBIO CRÍTICO: Incluir 'etiquetasId'
        const body = {
            titulo: newTaskTitle,
            descripcion: newTaskDesc,
            prioridad: newTaskPriority,
            equipoId: equipoId,
            estado: newTaskEstado,
            etiquetasId: newTaskLabels, // 💡 ENVIAMOS EL ARRAY DE IDs
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
            // Limpiar estados de la nueva tarea
            setNewTaskTitle("");
            setNewTaskDesc("");
            setNewTaskPriority(PrioridadTarea.MEDIA);
            setNewTaskEstado(EstadoTarea.PENDIENTE);
            setNewTaskLabels([]); // 💡 Limpiamos las etiquetas

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

            // 💡 Iniciar cargas en paralelo
            setIsCommentsLoading(true);
            setModalLabelsLoading(true); // 💡 NUEVO

            const loadModalData = async () => {
                await Promise.all([
                    fetchComentarios(selectedTask.id), // (Tu función existente)
                    fetchTaskLabels(selectedTask.id)  // 💡 NUEVO: Cargar etiquetas
                ]);

                // Marcar como completadas
                setIsCommentsLoading(false);
                setModalLabelsLoading(false); // 💡 NUEVO
            };

            loadModalData();

        } else {
            // Limpiar estados cuando se cierra el modal
            setComentarios([]);
            setModalTaskLabels([]); // 💡 NUEVO
        }
    }, [selectedTask, token]); // Dependencias existentes

    // 💡 NUEVO EFECTO: Mostrar/Ocultar Modal de Etiqueta
    const closeLabelModal = () => {
        setIsLabelModalOpen(false);
        setNewLabelName('');
        setLabelError(null);
    };

    const closeTaskModal = () => {
        setIsTaskModalOpen(false);
        setNewTaskTitle("");
        setNewTaskDesc("");
        setNewTaskPriority(PrioridadTarea.MEDIA);
        setNewTaskEstado(EstadoTarea.PENDIENTE);
        setNewTaskLabels([]); // 💡 Limpiamos al cerrar
        setTaskModalError(null);
    }

    // 5. RENDERIZADO PRINCIPAL
    return (
        <div className="main-content">
            {/* Modal para CREAR ETIQUETA */}
            {isLabelModalOpen && (
                <div className="modal" style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
                    justifyContent: 'center', alignItems: 'center', zIndex: 1000
                }}>
                    <div className="card" style={{ padding: '2rem', width: '90%', maxWidth: '400px' }}>
                        <h3>Crear Nueva Etiqueta</h3>
                        <form onSubmit={handleCreateLabel} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <input
                                type="text"
                                placeholder="Nombre de la etiqueta (ej: Bug, Frontend)"
                                value={newLabelName}
                                onChange={e => setNewLabelName(e.target.value)}
                                required
                                style={{ padding: '0.5rem' }}
                            />
                            {labelError && <p style={{ color: 'var(--color-error)' }}>{labelError}</p>}
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                                <button type="button" onClick={closeLabelModal} disabled={labelLoading} className="secondary">
                                    Cancelar
                                </button>
                                <button type="submit" disabled={labelLoading}>
                                    {labelLoading ? 'Creando...' : 'Crear'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Componentes de modal importados */}
            <CreateTaskModal
                isTaskModalOpen={isTaskModalOpen}
                setIsTaskModalOpen={closeTaskModal} // 💡 Usamos el nuevo handler para limpieza
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
                // 💡 NUEVAS PROPS PARA ETIQUETAS
                allLabels={etiquetas ?? []} // Lista de todas las etiquetas disponibles
                newTaskLabels={newTaskLabels}
                setNewTaskLabels={setNewTaskLabels}
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
                currentTaskLabels={modalTaskLabels} // Etiquetas de esta tarea
                labelsLoading={modalLabelsLoading}  // Cargando etiquetas de esta tarea
                handleUpdateTaskLabels={handleUpdateTaskLabels}
                isUpdatingLabels={isUpdatingLabels} // Guardando etiquetas
                allLabels={etiquetas ?? []}
            />

            <div className="card">

                <h2 className="card-title">Gestión del Equipo</h2>

                {/* Controles de Filtros e Invitación */}
                <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                    flexWrap: 'wrap', gap: '2rem', marginBottom: '2.5rem',
                    padding: '1.5rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px'
                }}>

                    <section style={{ flex: '1.5', minWidth: '350px' }}>
                        <h3>🎯 Filtrar tareas</h3>
                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>

                            <input
                                type="text"
                                placeholder="Buscar por título/descripción..."
                                value={filtroTexto}
                                onChange={e => {
                                    setFiltroTexto(e.target.value);
                                    setPage(1); // Reiniciar la paginación al cambiar el texto de búsqueda
                                }}
                                style={{ padding: '0.5rem', flexGrow: 1 }}
                            />

                            {/* Filtro por Estado */}
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

                            {/* Filtro por Prioridad */}
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

                            {/* 💡 NUEVO FILTRO: Por Etiqueta */}
                            <select
                                aria-label="Filtrar por etiqueta" value={filtroEtiqueta}
                                onChange={handleLabelFilterChange}
                                style={{ padding: '0.5rem' }}
                            >
                                <option value="todos">Todas las etiquetas</option>
                                {(etiquetas ?? []).map(label => (
                                    <option key={label.id} value={label.id}>{label.nombre}</option>
                                ))}
                            </select>
                            <button onClick={() => setIsLabelModalOpen(true)} className="secondary" style={{ whiteSpace: 'nowrap' }}>
                                + Etiqueta
                            </button>
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
                                <TareaColumna
                                    estado={EstadoTarea.PENDIENTE}
                                    tareas={tareasAgrupadas[EstadoTarea.PENDIENTE]}
                                    setSelectedTask={setSelectedTask}
                                    token={token || ''} // 💡 AÑADIR ESTA PROP
                                />
                                <TareaColumna
                                    estado={EstadoTarea.EN_CURSO}
                                    tareas={tareasAgrupadas[EstadoTarea.EN_CURSO]}
                                    setSelectedTask={setSelectedTask}
                                    token={token || ''} // 💡 AÑADIR ESTA PROP
                                />
                                <TareaColumna
                                    estado={EstadoTarea.TERMINADA}
                                    tareas={tareasAgrupadas[EstadoTarea.TERMINADA]}
                                    setSelectedTask={setSelectedTask}
                                    token={token || ''} // 💡 AÑADIR ESTA PROP
                                />
                                <TareaColumna
                                    estado={EstadoTarea.CANCELADA}
                                    tareas={tareasAgrupadas[EstadoTarea.CANCELADA]}
                                    setSelectedTask={setSelectedTask}
                                    token={token || ''} // 💡 AÑADIR ESTA PROP
                                />
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