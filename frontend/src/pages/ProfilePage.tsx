import { useAuth } from "../contexts/AuthContext";

export function ProfilePage() {
    const { gamer } = useAuth();

    return (
        <div className="main-content">
            <div className="card">
                <div style={{ display: "flex", alignItems: "center", gap: "2rem", marginBottom: "2rem" }}>
                    <div className="avatar">{gamer?.avatar}</div>
                    <div>
                        <h2 style={{ marginBottom: "0.5rem" }}>{gamer?.username}</h2>
                        <div style={{ display: "flex", gap: "1rem" }}>
                            <span className="badge badge-level">⚡ Level {gamer?.level}</span>
                            <span className="badge badge-points">💎 {gamer?.points} pts</span>
                        </div>
                    </div>
                </div>

                <div style={{
                    marginTop: "2rem",
                    padding: "1.5rem",
                    backgroundColor: "var(--bg-tertiary)",
                    borderRadius: "8px"
                }}>
                    <h3>🎯 Ejercicio 6: React Router + Loaders</h3>
                    <p style={{ color: "var(--text-secondary)", marginTop: "0.5rem" }}>
                        Implementa un loader para cargar los datos del perfil antes de renderizar.
                        Usa <code>useLoaderData()</code> para acceder a los datos.
                    </p>
                </div>
            </div>
        </div>
    );
}

