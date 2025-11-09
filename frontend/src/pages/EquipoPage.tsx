
import React, { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useFetch } from '../hooks/useFetch';

// Enums (sin cambios)
export enum EstadoTarea {
  PENDIENTE = "Pendiente",
  EN_CURSO = "En curso",
  TERMINADA = "Terminada",
  CANCELADA = "Cancelada"
}

export enum PrioridadTarea {
  ALTA = "Alta",
  MEDIA = "Media",
  BAJA = "Baja"
}

// Interfaz (sin cambios)
interface Tarea {
  id: string;
  titulo: string;
  descripcion?: string;
  estado: EstadoTarea;
  prioridad: PrioridadTarea;
}

const BASE_URL = 'http://localhost:3000';

export function EquipoPage(): React.ReactElement {
  // 1. OBTENER DATOS (sin cambios)
  const { id: equipoId } = useParams();
  const { token } = useAuth();

  // 2. FETCH DE TAREAS (sin cambios)
  const url = equipoId ? `${BASE_URL}/api/tareas/${equipoId}` : null;

  const fetchOptions: RequestInit = useMemo(() => ({
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  }), [token]);

  const { data: tareas, loading, error, refetch } = useFetch<Tarea[]>(url, fetchOptions);

  // 3. ESTADO DE FILTROS E INVITACIÓN (sin cambios)
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [filtroPrioridad, setFiltroPrioridad] = useState<string>('todos');
  const [correo, setCorreo] = useState<string | null>(null);
  const [inviteLoading, setInviteLoading] = useState(false);

  // --- MODIFICADO: Estados para el modal de TAREAS ---
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDesc, setNewTaskDesc] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<PrioridadTarea>(PrioridadTarea.MEDIA);
  // ¡NUEVO! Estado para el estado de la tarea
  const [newTaskEstado, setNewTaskEstado] = useState<EstadoTarea>(EstadoTarea.PENDIENTE);
  const [taskModalLoading, setTaskModalLoading] = useState(false);
  const [taskModalError, setTaskModalError] = useState<string | null>(null);
  // --- Fin de modificación ---


  // 4. LÓGICA DE FILTRADO (sin cambios)
  const tareasFiltradas = useMemo(() => {
    if (!tareas) return [];
    
    return tareas.filter(t =>
      (filtroEstado === 'todos' || t.estado === filtroEstado) &&
      (filtroPrioridad === 'todos' || t.prioridad === filtroPrioridad)
    );
  }, [tareas, filtroEstado, filtroPrioridad]);

  // 5. LÓGICA DE INVITACIÓN (sin cambios)
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
        setCorreo(null);
      } else {
        alert(`Error al invitar: ${data.error || 'Error desconocido'}`);
      }
    } catch (err) {
      alert('Error de red al enviar la invitación.');
    } finally {
      setInviteLoading(false);
    }
  };

  // --- MODIFICADO: Función para manejar la creación de la Tarea ---
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

    // Basado en tu tareas.controller.ts (función crearTarea)
    const body = {
      titulo: newTaskTitle,
      descripcion: newTaskDesc,
      prioridad: newTaskPriority,
      equipoId: equipoId,
      estado: newTaskEstado, // ¡USA EL NUEVO ESTADO!
    };

    try {
      const res = await fetch(`${BASE_URL}/api/tareas`, { // Ruta POST /api/tareas
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

      // ¡ÉXITO!
      setIsTaskModalOpen(false); // Cierra modal
      refetch();                 // ¡Recarga la lista de tareas!
      
      // Limpia el formulario
      setNewTaskTitle("");
      setNewTaskDesc("");
      setNewTaskPriority(PrioridadTarea.MEDIA);
      setNewTaskEstado(EstadoTarea.PENDIENTE); // Resetea el estado

    } catch (err: any) {
      setTaskModalError(err.message);
    } finally {
      setTaskModalLoading(false);
    }
  };

  // --- MODIFICADO: Función que renderiza el modal de TAREAS ---
  const renderCreateTaskModal = (): React.ReactNode => {
    if (!isTaskModalOpen) return null;

    return (
      <div style={{
        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000,
      }}
      onClick={() => setIsTaskModalOpen(false)}
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
          <form onSubmit={handleCreateTask}>
            {/* Título */}
            <div style={{ marginBottom: '1rem' }}>
              <label htmlFor="taskTitle" style={{ display: 'block', marginBottom: '0.5rem' }}>
                Título de la Tarea:
              </label>
              <input
                id="taskTitle" type="text" value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Ej: Implementar login"
                style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }}
                autoFocus
                required
              />
            </div>

            {/* Descripción */}
            <div style={{ marginBottom: '1rem' }}>
              <label htmlFor="taskDesc" style={{ display: 'block', marginBottom: '0.5rem' }}>
                Descripción (opcional):
              </label>
              <textarea
                id="taskDesc" value={newTaskDesc}
                onChange={(e) => setNewTaskDesc(e.target.value)}
                placeholder="Detalles sobre la tarea..."
                style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box', minHeight: '80px' }}
              />
            </div>

            {/* Prioridad */}
            <div style={{ marginBottom: '1rem' }}>
              <label htmlFor="taskPriority" style={{ display: 'block', marginBottom: '0.5rem' }}>
                Prioridad:
              </label>
              <select
                id="taskPriority"
                value={newTaskPriority}
                onChange={(e) => setNewTaskPriority(e.target.value as PrioridadTarea)}
                style={{ width: '100%', padding: '0.5rem' }}
              >
                <option value={PrioridadTarea.ALTA}>Alta</option>
                <option value={PrioridadTarea.MEDIA}>Media</option>
                <option value={PrioridadTarea.BAJA}>Baja</option>
              </select>
            </div>

            {/* ¡NUEVO! Selector de Estado */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label htmlFor="taskEstado" style={{ display: 'block', marginBottom: '0.5rem' }}>
                Estado Inicial:
              </label>
              <select
                id="taskEstado"
                value={newTaskEstado}
                onChange={(e) => setNewTaskEstado(e.target.value as EstadoTarea)}
                style={{ width: '100%', padding: '0.5rem' }}
              >
                <option value={EstadoTarea.PENDIENTE}>Pendiente</option>
                <option value={EstadoTarea.EN_CURSO}>En curso</option>
                <option value={EstadoTarea.TERMINADA}>Terminada</option>
                <option value={EstadoTarea.CANCELADA}>Cancelada</option>
              </select>
            </div>
            {/* --- Fin de nuevo selector --- */}
            
            {taskModalError && (
              <p style={{ color: 'var(--color-error)', fontSize: '0.9rem' }}>
                {taskModalError}
              </p>
            )}

            {/* Botones */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <button
                type="button" onClick={() => setIsTaskModalOpen(false)}
                style={{ backgroundColor: 'var(--text-secondary)' }}
                disabled={taskModalLoading}
              >
                Cancelar
              </button>
              <button type="submit" disabled={taskModalLoading}>
                {taskModalLoading ? 'Creando...' : 'Crear Tarea'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };


  // 6. RENDERIZADO (sin cambios)
  return (
    <div className="main-content">
      {renderCreateTaskModal()}

      <div className="card">
        
        <h2 className="card-title">Gestión del Equipo</h2>

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
                onChange={e => setFiltroEstado(e.target.value)} style={{ padding: '0.5rem' }}
              >
                <option value="todos">Todos los estados</option>
                <option value={EstadoTarea.PENDIENTE}>Pendiente</option>
                <option value={EstadoTarea.EN_CURSO}>En curso</option>
                <option value={EstadoTarea.TERMINADA}>Terminada</option>
                <option value={EstadoTarea.CANCELADA}>Cancelada</option>
              </select>
              
              <select
                aria-label="Filtrar por prioridad" value={filtroPrioridad}
                onChange={e => setFiltroPrioridad(e.target.value)} style={{ padding: '0.5rem' }}
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

        <section>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            marginBottom: '1rem'
          }}>
            <h3 style={{ margin: 0 }}>📋 Tareas del equipo</h3>
            <button
              onClick={() => setIsTaskModalOpen(true)}
            >
              + Tarea
            </button>
          </div>
          
          {loading && <p>Cargando tareas...</p>}
          
          {error && (
            <div style={{ color: 'var(--color-error)' }}>
              <p>Error al cargar tareas: {error}</p>
              <button onClick={refetch}>Reintentar</button>
            </div>
          )}

          {!loading && !error && tareasFiltradas.length === 0 && (
            <p style={{ color: 'var(--text-secondary)'}}>
              {tareas?.length === 0 ? 'Este equipo aún no tiene tareas.' : 'No hay tareas que coincidan con los filtros.'}
            </p>
          )}

          <div style={{
            display: 'flex',
            flexDirection: 'column', 
            gap: '1rem'
          }}>
            {tareasFiltradas.map(t => (
              <div
                key={t.id}
                style={{
                  padding: '1rem 1.5rem',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-lightest)',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                  borderLeft: `5px solid ${getPriorityColor(t.prioridad)}`
                }}
              >
                <h4 style={{ margin: '0 0 0.5rem 0' }}>{t.titulo}</h4>
                <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.9rem' }}>
                  <span>Estado: <strong>{t.estado}</strong></span>
                  <span>Prioridad: <strong>{t.prioridad}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </section>
        
      </div>
    </div>
  );
}

// Función helper (sin cambios)
function getPriorityColor(prioridad: PrioridadTarea): string {
  switch (prioridad) {
    case PrioridadTarea.ALTA: return 'var(--color-error, #E53E3E)';
    case PrioridadTarea.MEDIA: return 'var(--color-warning, #DD6B20)';
    case PrioridadTarea.BAJA: return 'var(--color-success, #38A169)';
    default: return '#CCC';
  }
}
