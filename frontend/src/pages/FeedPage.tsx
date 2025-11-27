import React, { useMemo, useState, useCallback } from 'react';
import { useAuth } from "../contexts/AuthContext";
import { useFetch } from "../hooks/useFetch";
import { Link } from "react-router-dom";


interface Miembro {
  id: string;
  nombre: string;
  email?: string;
}


interface Propietario extends Miembro {
  email?: string;
  password?: string;
}

interface Equipo {
  id: string;
  nombre: string;
  propietario: Propietario;
  miembros: Miembro[];
}
const BASE_URL = "http://localhost:3000";

export function FeedPage(): React.ReactElement {
  const { usuario } = useAuth();
  const userId = usuario?.id;
  const userToken = useAuth().token;

  const url = userId ? `${BASE_URL}/api/equipos/equipos/${userId}` : null;

  const fetchOptions: RequestInit = useMemo(() => {
    if (userToken) {
      return {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`,
        },
      };
    }
    return {};
  }, [userToken]);


  const {
    data: equipos,
    loading,
    error,
    refetch
  } = useFetch<Equipo[]>(url, fetchOptions);

 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  


  const [viewingTeam, setViewingTeam] = useState<Equipo | null>(null);

  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);
  const [listError, setListError] = useState<string | null>(null);



  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim()) {
      setModalError("El nombre del equipo no puede estar vacío.");
      return;
    }
    if (!userId || !userToken) {
      setModalError("Error de autenticación. Intenta recargar.");
      return;
    }
    setModalLoading(true);
    setModalError(null);
    try {
      const res = await fetch(`${BASE_URL}/api/equipos/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          nombre: newTeamName,
          propietarioId: userId
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al crear el equipo');
      }
      setIsModalOpen(false);
      setNewTeamName("");
      refetch();
    } catch (err: any) {
      setModalError(err.message);
    } finally {
      setModalLoading(false);
    }
  };

  const handleRemoveMember = useCallback(async (equipoId: string, miembroId: string) => {
    if (userId === miembroId) {
      setListError("No puedes eliminarte a ti mismo. Usa 'Salir del Equipo'.");
      return;
    }
    if (!window.confirm("¿Estás seguro de que quieres remover a este miembro?")) {
      return;
    }

    setRemovingMemberId(miembroId);
    setListError(null);

    try {
      const res = await fetch(`${BASE_URL}/api/equipos/${equipoId}/salir`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`,
        },
        body: JSON.stringify({ userId: miembroId }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al remover al miembro');
      }

      // ¡ÉXITO!
      refetch(); 


      setViewingTeam(prevTeam => {
        if (!prevTeam) return null;
        const newMiembros = prevTeam.miembros.filter(m => m.id !== miembroId);
        return { ...prevTeam, miembros: newMiembros };
      });

    } catch (err: any) {
      setListError(err.message);
    } finally {
      setRemovingMemberId(null);
    }
  }, [userToken, userId, refetch]); 


  
  const renderContent = (): React.ReactNode => {
    if (!userId) {
      return <p style={{ color: "var(--color-warning)" }}>⚠️ Esperando datos de usuario...</p>;
    }
    if (loading) {
      return <p>Cargando equipos...</p>;
    }

    
    if (listError) {
      return (
        <p style={{ color: "var(--color-error)", fontWeight: 'bold' }}>
          ❌ Error: {listError}
        </p>
      );
    }
    if (error) {
      return (
        <div>
          <p style={{ color: "var(--color-error)", fontWeight: 'bold' }}>
            ❌ Error al cargar los equipos: {error}
          </p>
          <button onClick={refetch} style={{ marginTop: '0.5rem' }}>Reintentar</button>
        </div>
      );
    }
    if (!equipos || equipos.length === 0) {
      return <p>Aún no tienes equipos asignados. ¡Empieza uno nuevo!</p>;
    }

    
    return (
      <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))' }}>
        {equipos.map((equipo) => {
          return (
            <Link
              key={equipo.id}
              to={`/equipo/${equipo.id}`}
              style={{
                textDecoration: 'none',
                color: 'inherit',
                backgroundColor: 'var(--bg-lightest)',
                padding: '1rem',
                borderRadius: '8px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                transition: 'transform 0.2s ease-in-out',
                display: 'block'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              {/* --- Cabecera de la tarjeta con nombre y botón de ver miembros --- */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <h3 style={{ margin: 0 }}>🛠️ {equipo.nombre}</h3>
                <button
                  title="Ver miembros"
                  onClick={(e) => {
                    e.stopPropagation(); 
                    e.preventDefault();   
                    setViewingTeam(equipo);
                  }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', padding: '0.25rem' }}
                >
                  👥
                </button>
              </div>

              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0 }}>
                Haz clic para gestionar este equipo
              </p>

              {/* Ya NO mostramos la lista de miembros aquí */}

            </Link>
          );
        })}
      </div>
    );
  };

 
  const renderCreateTeamModal = (): React.ReactNode => {
    if (!isModalOpen) return null;
    return (
      <div style={{
        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.7)', display: 'flex',
        justifyContent: 'center', alignItems: 'center', zIndex: 1000,
      }}
        onClick={() => setIsModalOpen(false)}
      >
        <div
          style={{
            backgroundColor: 'var(--bg-lightest)', color: 'var(--text-primary)',
            padding: '2rem', borderRadius: '8px', minWidth: '300px',
            maxWidth: '500px', zIndex: 1001,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <h3 style={{ marginTop: 0 }}>Crear Nuevo Equipo</h3>
          <form onSubmit={handleCreateTeam}>
            <div style={{ marginBottom: '1rem' }}>
              <label htmlFor="teamName" style={{ display: 'block', marginBottom: '0.5rem' }}>
                Nombre del Equipo:
              </label>
              <input
                id="teamName" type="text" value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                placeholder="Ej: Equipo de Frontend"
                style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }}
                autoFocus
              />
            </div>
            {modalError && (
              <p style={{ color: 'var(--color-error)', fontSize: '0.9rem' }}>
                {modalError}
              </p>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <button
                type="button" onClick={() => setIsModalOpen(false)}
                style={{ backgroundColor: 'var(--text-secondary)' }}
                disabled={modalLoading}
              >
                Cancelar
              </button>
              <button type="submit" disabled={modalLoading}>
                {modalLoading ? 'Creando...' : 'Crear'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const renderMemberModal = (): React.ReactNode => {
    if (!viewingTeam) return null; 

    const isOwner = userId === viewingTeam.propietario.id;

    return (
      
      <div style={{
        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.7)', display: 'flex',
        justifyContent: 'center', alignItems: 'center', zIndex: 1000,
      }}
        onClick={() => setViewingTeam(null)} 
      >
        {/* Contenido del Modal */}
        <div
          style={{
            backgroundColor: 'var(--bg-lightest)', color: 'var(--text-primary)',
            padding: '2rem', borderRadius: '8px', minWidth: '300px',
            maxWidth: '500px', zIndex: 1001,
          }}
          onClick={(e) => e.stopPropagation()} 
        >
          <h3 style={{ marginTop: 0 }}>Miembros de: {viewingTeam.nombre}</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '-0.5rem', marginBottom: '1rem' }}>
            {isOwner ? 'Eres el propietario de este equipo.' : 'Eres miembro.'}
          </p>

          <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '1.5rem' }}>
            <ul style={{ listStyleType: 'none', margin: 0, padding: 0 }}>
              {viewingTeam.miembros.length > 0 ? (
                viewingTeam.miembros.map((miembro) => (
                  <li
                    key={miembro.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.5rem 0.25rem',
                      borderBottom: '1px solid var(--bg-tertiary)'
                    }}
                  >
                    <span>{miembro.nombre} {miembro.id === userId ? '(Tú)' : ''}</span>

                    {/* --- ¡NUEVO! Lógica de remover movida aquí --- */}

                    {isOwner && miembro.id !== viewingTeam.propietario.id && (
                      <button
                        title="Remover miembro"
                        onClick={() => handleRemoveMember(viewingTeam.id, miembro.id)}
                        disabled={removingMemberId === miembro.id}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-error)', fontSize: '1rem', padding: '0.25rem' }}
                      >
                        {removingMemberId === miembro.id ? '⏳' : '🗑️'}
                      </button>
                    )}
                  </li>
                ))
              ) : (
                <p>No hay miembros en este equipo (esto no debería pasar, al menos deberías estar tú).</p>
              )}
            </ul>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={() => setViewingTeam(null)}
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    );
  };


  return (
    <div className="main-content">
      {/* Renderizar ambos modales (estarán ocultos por CSS) */}
      {renderCreateTeamModal()}
      {renderMemberModal()} {/* <-- ¡NUEVO! */}

      <div className="card">
        {/* --- Título y botón de crear (sin cambios) --- */}
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', flexWrap: 'wrap', gap: '1rem'
        }}>
          <h2 className="card-title" style={{ margin: 0 }}>Tus Equipos</h2>
          <button onClick={() => setIsModalOpen(true)}>
            ✨ Crear Nuevo Equipo
          </button>
        </div>

        <p style={{ color: "var(--text-secondary)" }}>
          ¡Hola {usuario?.nombre || 'usuario'}!
        </p>

        <div style={{
          marginTop: "2rem", padding: "1.5rem",
          backgroundColor: "var(--bg-tertiary)", borderRadius: "8px"
        }}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
}