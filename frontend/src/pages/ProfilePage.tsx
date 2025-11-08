import { useAuth } from "../contexts/AuthContext";


export function ProfilePage() {
    const { usuario } = useAuth();

    return (
        <div className="main-content">
            <div className="card">
                <div style={{ display: "flex", alignItems: "center", gap: "2rem", marginBottom: "2rem" }}>
                    <div>
                        <h2 style={{ marginBottom: "0.5rem" }}>{usuario?.nombre}</h2>
                        <div style={{ display: "flex", gap: "1rem" }}>
                         
                        </div>
                    </div>
                </div>

                <div style={{
                    marginTop: "2rem",
                    padding: "1.5rem",
                    backgroundColor: "var(--bg-tertiary)",
                    borderRadius: "8px"
                }}>
                </div>
            </div>
        </div>
    );
}

