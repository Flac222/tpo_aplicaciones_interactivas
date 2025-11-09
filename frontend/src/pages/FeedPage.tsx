import React, { useMemo, useState } from 'react'; // <-- Importar useState
import { useAuth } from "../contexts/AuthContext";
import { useFetch } from "../hooks/useFetch";
import { Link } from "react-router-dom";


interface Equipo {
  id: string;
  nombre: string;
  
}

// Asume que tienes tu URL base
const BASE_URL = "http://localhost:3000"; // **Asegúrate de reemplazar con tu BASE_URL real**

export function FeedPage(): React.ReactElement {
  // 1. Obtener datos del usuario del contexto
  const { usuario } = useAuth();
  const userId = usuario?.id;
  const userToken = useAuth().token; // Usamos este para el API

  // 2. Configurar la URL y las Opciones de Fetch
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


  // 3. Llamar a tu hook useFetch modificado
  const {
    data: equipos,
    loading,
    error,
    refetch // ¡Usaremos esto para recargar la lista!
  } = useFetch<Equipo[]>(url, fetchOptions);

  // --- ¡NUEVO! Estados para el modal ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  // --- Fin de nuevos estados ---


  // --- ¡NUEVO! Función para manejar la creación del equipo ---
  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault(); // Evitar que el formulario recargue la página
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

    // Lógica de API basada en tus controllers y request.http
    // Controller: crearEquipo(req, res) -> usa req.body.nombre y req.user.id
    // Request.http: POST {{baseUrl}}/api/equipos/{{userId}}
    //
    // Combinamos ambos: usamos la RUTA de request.http y el BODY del controller.
    
    try {
      const res = await fetch(`${BASE_URL}/api/equipos/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`,
        },
        body: JSON.stringify({ nombre: newTeamName }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al crear el equipo');
      }

      // ¡ÉXITO!
      setIsModalOpen(false); // Cerrar modal
      setNewTeamName("");     // Limpiar input
      refetch();              // ¡Recargar la lista de equipos!

    } catch (err: any) {
      setModalError(err.message);
    } finally {
      setModalLoading(false);
    }
  };


  // 4. Lógica de renderizado (sin cambios)
  const renderContent = (): React.ReactNode => {
    if (!userId) {
      return <p style={{ color: "var(--color-warning)" }}>⚠️ Esperando datos de usuario...</p>;
    }

    if (loading) {
      return <p>Cargando equipos...</p>;
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

    // Listado de equipos (sin cambios)
    return (
      <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))' }}>
        {equipos.map((equipo) => (
          <Link
            key={equipo.id}
            to={`/equipo/${equipo.id}`} // Ruta dinámica
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
            <h3 style={{ marginBottom: '0.5rem' }}>🛠️ {equipo.nombre}</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Haz clic para gestionar este equipo
            </p>
          </Link>
        ))}
      </div>
    );
  };

  // --- ¡NUEVO! Función que renderiza el modal ---
  const renderCreateTeamModal = (): React.ReactNode => {
    if (!isModalOpen) return null;

    return (
      // Overlay (fondo oscuro)
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
      }}
      onClick={() => setIsModalOpen(false)} // Cierra al hacer clic fuera
      >
        {/* Contenido del Modal */}
        <div
          style={{
            backgroundColor: 'var(--bg-lightest)',
            color: 'var(--text-primary)',
            padding: '2rem',
            borderRadius: '8px',
            minWidth: '300px',
            maxWidth: '500px',
            zIndex: 1001,
          }}
          onClick={(e) => e.stopPropagation()} // Evita que el clic se propague al overlay
        >
          <h3 style={{ marginTop: 0 }}>Crear Nuevo Equipo</h3>
          <form onSubmit={handleCreateTeam}>
            <div style={{ marginBottom: '1rem' }}>
              <label htmlFor="teamName" style={{ display: 'block', marginBottom: '0.5rem' }}>
                Nombre del Equipo:
              </label>
              <input
                id="teamName"
                type="text"
                value={newTeamName}
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
                type="button" // Para que no envíe el formulario
                onClick={() => setIsModalOpen(false)}
                style={{ backgroundColor: 'var(--text-secondary)' }}
                disabled={modalLoading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={modalLoading}
              >
                {modalLoading ? 'Creando...' : 'Crear'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };


  // 5. Estructura del componente principal
  return (
    <div className="main-content">
      {/* ¡NUEVO! Renderizar el modal (estará oculto por defecto) */}
      {renderCreateTeamModal()}

      <div className="card">
        {/* --- ¡MODIFICADO! Título y botón de crear --- */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <h2 className="card-title" style={{ margin: 0 }}>Tus Equipos</h2>
          <button
            onClick={() => setIsModalOpen(true)} // Abre el modal
          >
            ✨ Crear Nuevo Equipo
          </button>
        </div>
        {/* --- Fin de modificación --- */}

        <p style={{ color: "var(--text-secondary)" }}>
          ¡Hola {usuario?.nombre || 'usuario'}!
        </p>

        <div style={{
          marginTop: "2rem",
          padding: "1.5rem",
          backgroundColor: "var(--bg-tertiary)",
          borderRadius: "8px"
        }}>

          {renderContent()}

        </div>
      </div>
    </div>
  );
}