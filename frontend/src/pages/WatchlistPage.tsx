import { useWatchlist } from '../hooks/useWatchlist';
import { EstadoTarea } from '../types/tareas';
import { WatchlistItem } from '../types/watchers';
import { Link } from 'react-router-dom';
import { useAuth } from "../contexts/AuthContext";
import { useFetch } from "../hooks/useFetch";
import { useMemo } from 'react';

// Interfaces for Teams (copied/adapted from FeedPage/types)
interface EquipoSimple {
    id: string;
    nombre: string;
}

export const WatchlistPage: React.FC = () => {
    const { watchlist, total, loading, params, updateParams, refresh } = useWatchlist({ limit: 10, page: 1 });
    const { usuario, token } = useAuth();
    const userId = usuario?.id;

    // --- Team Fetching Logic ---
    const teamsUrl = userId ? `http://localhost:3000/api/equipos/equipos/${userId}` : null;
    const fetchOptions: RequestInit = useMemo(() => {
        if (token) {
            return {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            };
        }
        return {};
    }, [token]);

    const { data: teams } = useFetch<EquipoSimple[]>(teamsUrl, fetchOptions);

    // --- Handlers ---
    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        updateParams({ status: e.target.value || undefined, page: 1 });
    };

    const handleTeamChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        updateParams({ teamId: e.target.value || undefined, page: 1 });
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        updateParams({ updatedSince: e.target.value || undefined, page: 1 });
    };

    const handlePageChange = (newPage: number) => {
        updateParams({ page: newPage });
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ margin: 0 }}>📋 Mis Tareas Seguidas</h1>
                <button onClick={() => refresh()} disabled={loading}>
                    🔄 Actualizar
                </button>
            </div>

            <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <div>
                    <label style={{ fontWeight: 'bold', marginRight: '0.5rem' }}>Estado:</label>
                    <select onChange={handleStatusChange} value={params.status || ''} style={{ padding: '0.5rem' }}>
                        <option value="">Todos</option>
                        {Object.values(EstadoTarea).map(estado => (
                            <option key={estado} value={estado}>{estado}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label style={{ fontWeight: 'bold', marginRight: '0.5rem' }}>Equipo:</label>
                    <select onChange={handleTeamChange} value={params.teamId || ''} style={{ padding: '0.5rem' }}>
                        <option value="">Todos los Equipos</option>
                        {teams?.map(team => (
                            <option key={team.id} value={team.id}>{team.nombre}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label style={{ fontWeight: 'bold', marginRight: '0.5rem' }}>Actualizado desde:</label>
                    <input
                        type="date"
                        onChange={handleDateChange}
                        value={params.updatedSince || ''}
                        style={{ padding: '0.4rem' }}
                    />
                </div>
            </div>

            {loading && watchlist.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                    <p>Cargando watchlist...</p>
                    {[1, 2, 3].map(i => (
                        <div key={i} style={{ height: '60px', backgroundColor: '#E2E8F0', borderRadius: '4px', marginBottom: '10px', animation: 'pulse 1.5s infinite' }}></div>
                    ))}
                </div>
            ) : watchlist.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', border: '2px dashed var(--border-color)', borderRadius: '8px' }}>
                    <h3>No estás siguiendo ninguna tarea.</h3>
                    <p>Ve a los equipos y suscríbete a las tareas que te interesen para verlas aquí.</p>
                    <Link to="/equipos">
                        <button style={{ marginTop: '1rem', padding: '0.5rem 1rem' }}>Ir a Equipos</button>
                    </Link>
                </div>
            ) : (
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'var(--bg-lightest)', borderRadius: '8px', overflow: 'hidden' }}>
                        <thead style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}>
                            <tr>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Tarea</th>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Estado</th>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Prioridad</th>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Actualizado</th>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Suscrito desde</th>
                                <th style={{ padding: '1rem', textAlign: 'center' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {watchlist.map((item: WatchlistItem) => (
                                <tr key={item.taskId} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    <td style={{ padding: '1rem' }}>
                                        <strong>{item.titulo}</strong>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{
                                            padding: '2px 8px',
                                            borderRadius: '12px',
                                            fontSize: '0.8rem',
                                            backgroundColor: 'var(--bg-tertiary)',
                                            border: '1px solid var(--border-color)'
                                        }}>
                                            {item.estado}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{ fontWeight: 'bold' }}>{item.prioridad}</span>
                                    </td>
                                    <td style={{ padding: '1rem', fontSize: '0.9rem' }}>
                                        {new Date(item.fechaActualizacion).toLocaleDateString()}
                                    </td>
                                    <td style={{ padding: '1rem', fontSize: '0.9rem' }}>
                                        {new Date(item.subscribedAt).toLocaleDateString()}
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                                        {item.teamId ? (
                                            <Link to={`/equipo/${item.teamId}`}>
                                                <button style={{ cursor: 'pointer', padding: '0.25rem 0.5rem' }}>
                                                    Ver
                                                </button>
                                            </Link>
                                        ) : (
                                            <button disabled style={{ cursor: 'not-allowed', opacity: 0.5 }} title="Ir al equipo (TeamID no disponible)">
                                                Ver
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2rem' }}>
                        <button
                            disabled={!params.page || params.page <= 1}
                            onClick={() => handlePageChange((params.page || 1) - 1)}
                            style={{ padding: '0.5rem 1rem' }}
                        >
                            Anterior
                        </button>
                        <span style={{ display: 'flex', alignItems: 'center' }}>
                            Página {params.page}
                        </span>
                        <button
                            disabled={watchlist.length < (params.limit || 10)}
                            onClick={() => handlePageChange((params.page || 1) + 1)}
                            style={{ padding: '0.5rem 1rem' }}
                        >
                            Siguiente
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
