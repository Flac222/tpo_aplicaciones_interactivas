
import React, { useMemo } from 'react';
import { useAuth } from "../contexts/AuthContext";
import { useFetch } from "../hooks/useFetch";
import { Link } from "react-router-dom";

// Define la interfaz para la estructura de tu equipo
interface Equipo {
  id: string; // ID o clave primaria
  nombre: string;
  // ... otras propiedades
}

// Asume que tienes tu URL base
const BASE_URL = "http://localhost:3000"; // **Asegúrate de reemplazar con tu BASE_URL real**

export function FeedPage(): React.ReactElement {
  // 1. Obtener datos del usuario del contexto
  // Asumo que 'usuario' es el objeto que contiene 'uuid', 'token' y 'nombre'
  const { usuario } = useAuth();

  const userId = usuario?.id;
  const userToken = useAuth().token;

  // 2. Configurar la URL y las Opciones de Fetch

  // Construye la URL solo si el userId existe
  const url = userId ? `${BASE_URL}/api/equipos/equipos/${userId}` : null;

  // **Memoiza las opciones** para evitar que cambien en cada render
  // y provoquen un bucle en el hook useFetch.
  const fetchOptions: RequestInit = useMemo(() => {
    // Solo incluimos el token si existe
    if (userToken) {
      return {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`,
        },
      };
    }
    return {}; // Opciones vacías si no hay token (aunque la petición no se hará si url es null)
  }, [userToken]);


  // 3. Llamar a tu hook useFetch modificado
  // Le pasamos la URL (que puede ser null) y las opciones.
  const {
    data: equipos,
    loading,
    error,
    refetch // Podemos usar esta función para recargar la lista
  } = useFetch<Equipo[]>(url, fetchOptions);

  // 4. Lógica de renderizado
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

    // Listado de equipos
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

  // 5. Estructura del componente principal
  return (
    <div className="main-content">
      <div className="card">
        <h2 className="card-title">Tus Equipos</h2>
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