import React, { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useFetch } from '../hooks/useFetch';

interface Tarea {
  id: string;
  titulo: string;
  estado: 'pendiente' | 'en progreso' | 'completada';
  prioridad: 'alta' | 'media' | 'baja';
}

const BASE_URL = 'http://localhost:3000';

export function EquipoPage(): React.ReactElement {
  const { id: equipoId } = useParams();
  const { nombre: nombreEquipo } = useParams();
  const { token } = useAuth();

  const url = equipoId ? `${BASE_URL}/api/equipos/${equipoId}/tareas` : null;

  const fetchOptions: RequestInit = useMemo(() => ({
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  }), [token]);

  const { data: tareas, loading, error} = useFetch<Tarea[]>(url, fetchOptions);

  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [filtroPrioridad, setFiltroPrioridad] = useState<string>('todos');
  const [correo, setCorreo] = useState('');

  const tareasFiltradas = useMemo(() => {
    return tareas?.filter(t => 
      (filtroEstado === 'todos' || t.estado === filtroEstado) &&
      (filtroPrioridad === 'todos' || t.prioridad === filtroPrioridad)
    ) || [];
  }, [tareas, filtroEstado, filtroPrioridad]);

  const invitarUsuario = async () => {
    if (!correo || !equipoId) return;

    const res = await fetch(`${BASE_URL}/api/equipos/${equipoId}/invitar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ correo }),
    });

    if (res.ok) {
      alert('Invitación enviada');
      setCorreo('');
    } else {
      alert('Error al enviar la invitación');
    }
  };

  return (
    <div className="main-content">
      <h2>Equipo: {nombreEquipo}</h2>

      <section style={{ marginBottom: '2rem' }}>
        <h3>🎯 Filtrar tareas</h3>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <select aria-label="Filtrar por estado" value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}>
            <option value="todos">Todos los estados</option>
            <option value="pendiente">Pendiente</option>
            <option value="en curso">En curso</option>
            <option value="completada">Completada</option>
          </select>
          <select aria-label="Filtrar por prioridad" value={filtroPrioridad} onChange={e => setFiltroPrioridad(e.target.value)}>
            <option value="todos">Todas las prioridades</option>
            <option value="alta">Alta</option>
            <option value="media">Media</option>
            <option value="baja">Baja</option>
          </select>
        </div>
      </section>

      <section>
        <h3>📋 Tareas del equipo</h3>
        {loading && <p>Cargando tareas...</p>}
        {error && <p style={{ color: 'red' }}>Error: {error}</p>}
        {tareasFiltradas.length === 0 && <p>No hay tareas que coincidan con el filtro.</p>}
        <div style={{ display: 'grid', gap: '1rem' }}>
          {tareasFiltradas.map(t => (
            <div key={t.id} style={{
              padding: '1rem',
              borderRadius: '8px',
              backgroundColor: 'var(--bg-lightest)',
              boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
            }}>
              <h4>{t.titulo}</h4>
              <p>Estado: <strong>{t.estado}</strong></p>
              <p>Prioridad: <strong>{t.prioridad}</strong></p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ marginTop: '3rem' }}>
        <h3>📨 Invitar usuario al equipo</h3>
        <input 
          type="email" 
          placeholder="Correo electrónico" 
          value={correo} 
          onChange={e => setCorreo(e.target.value)} 
          style={{ padding: '0.5rem', marginRight: '1rem' }}
        />
        <button onClick={invitarUsuario}>Invitar</button>
      </section>
    </div>
  );
}
