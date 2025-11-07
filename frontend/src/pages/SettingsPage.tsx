export function SettingsPage() {
    return (
        <div className="main-content">
            <div className="card">
                <h2 className="card-title">⚙️ Configuración</h2>
                <div style={{
                    marginTop: "2rem",
                    padding: "1.5rem",
                    backgroundColor: "var(--bg-tertiary)",
                    borderRadius: "8px"
                }}>
                    <h3>🎯 Ejercicio 3: useLocalStorage</h3>
                    <p style={{ color: "var(--text-secondary)", marginTop: "0.5rem" }}>
                        Implementa preferencias de usuario que se guarden en localStorage.
                        Incluye: notificaciones, volumen, idioma, etc.
                    </p>
                </div>
            </div>
        </div>
    );
}

