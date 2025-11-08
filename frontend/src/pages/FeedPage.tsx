import { useAuth } from "../contexts/AuthContext";

export function FeedPage() {
    const { usuario } = useAuth();

    return (
        <div className="main-content">
            <div className="card">
                <h2 className="card-title">Feed de Kanban tira piedra</h2>
                <p style={{ color: "var(--text-secondary)" }}>
                    ¡Hola {usuario?.username}! Este es el feed donde verás tus equipos y tareas.
                </p>
                <div style={{
                    marginTop: "2rem",
                    padding: "1.5rem",
                    backgroundColor: "var(--bg-tertiary)",
                    borderRadius: "8px"
                }}>
                    <h3>🎯 Ejercicio 4: useFetch</h3>
                    <p style={{ color: "var(--text-secondary)", marginTop: "0.5rem" }}>
                        Implementa un hook <code>useFetch</code> para cargar posts desde una API.
                        Muestra loading states, manejo de errores y la lista de posts.
                    </p>
                </div>
            </div>
        </div>
    );
}

