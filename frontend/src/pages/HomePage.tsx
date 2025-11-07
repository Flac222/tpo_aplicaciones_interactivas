import { Link } from "react-router-dom";

export function HomePage() {
    return (
        <div className="main-content">
            {/* Header */}
            <div className="card" style={{ textAlign: "center", marginBottom: "2rem" }}>
                <h1 style={{ fontSize: "3em", marginBottom: "0.5rem" }}>
                    Bienvenido a Kanban tira piedra
                </h1>
                <p style={{ fontSize: "1.2em", color: "var(--text-secondary)" }}>
                    Una app de kanban
                </p>
            </div>

            {/* Instrucciones principales */}
            <div style={{ 
                padding: "2rem", 
                backgroundColor: "var(--accent-primary)", 
                borderRadius: "12px", 
                marginBottom: "2rem",
                border: "2px solid var(--accent-secondary)"
            }}>
                <h2 style={{ marginBottom: "1rem", fontSize: "1.5em" }}>📋 Instrucciones</h2>
                <ol style={{ lineHeight: "1.8", paddingLeft: "1.5rem", marginBottom: "1rem" }}>
                    <li><strong>Lee el README.md</strong> - Revisa los ejercicios y sus objetivos</li>
                    <li><strong>Inicia sesión</strong> - Usa el botón de abajo (usuario: gamer / password: cualquiera)</li>
                    <li><strong>Explora la app</strong> - Navega por Feed, Perfil y Configuración</li>
                    <li><strong>Completa los ejercicios</strong> - Implementa las funcionalidades faltantes</li>
                </ol>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.95em" }}>
                    💡 Algunos ejercicios ya están resueltos como referencia. Busca las secciones marcadas con 🔧 en el código.
                </p>
            </div>

            {/* Estado de ejercicios */}
            <div className="card" style={{ marginBottom: "2rem" }}>
                <h2 className="card-title" style={{ marginBottom: "1.5rem" }}>📊 Estado de los Ejercicios</h2>
                
                <div style={{ display: "grid", gap: "1rem" }}>
                    {/* Ejercicio 1 */}
                    <div style={{ 
                        padding: "1rem", 
                        backgroundColor: "var(--bg-tertiary)", 
                        borderRadius: "8px",
                        borderLeft: "4px solid #51cf66"
                    }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div>
                                <h3 style={{ marginBottom: "0.25rem" }}>✅ Ejercicio 1: Theme Context</h3>
                                <p style={{ color: "var(--text-secondary)", fontSize: "0.9em", margin: 0 }}>
                                    Implementado como referencia
                                </p>
                            </div>
                            <span style={{ fontSize: "1.5em" }}>⭐</span>
                        </div>
                    </div>

                    {/* Ejercicio 2 */}
                    <div style={{ 
                        padding: "1rem", 
                        backgroundColor: "var(--bg-tertiary)", 
                        borderRadius: "8px",
                        borderLeft: "4px solid #51cf66"
                    }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div>
                                <h3 style={{ marginBottom: "0.25rem" }}>✅ Ejercicio 2: Auth Context</h3>
                                <p style={{ color: "var(--text-secondary)", fontSize: "0.9em", margin: 0 }}>
                                    Implementado como referencia
                                </p>
                            </div>
                            <span style={{ fontSize: "1.5em" }}>⭐⭐</span>
                        </div>
                    </div>

                    {/* Ejercicio 3 */}
                    <div style={{ 
                        padding: "1rem", 
                        backgroundColor: "var(--bg-tertiary)", 
                        borderRadius: "8px",
                        borderLeft: "4px solid #ffd43b"
                    }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div>
                                <h3 style={{ marginBottom: "0.25rem" }}>🔧 Ejercicio 3: useLocalStorage</h3>
                                <p style={{ color: "var(--text-secondary)", fontSize: "0.9em", margin: 0 }}>
                                    <strong>Tu turno:</strong> Implementa en Settings (⚙️ Config)
                                </p>
                            </div>
                            <span style={{ fontSize: "1.5em" }}>⭐⭐</span>
                        </div>
                    </div>

                    {/* Ejercicio 4 */}
                    <div style={{ 
                        padding: "1rem", 
                        backgroundColor: "var(--bg-tertiary)", 
                        borderRadius: "8px",
                        borderLeft: "4px solid #ffd43b"
                    }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div>
                                <h3 style={{ marginBottom: "0.25rem" }}>🔧 Ejercicio 4: useFetch</h3>
                                <p style={{ color: "var(--text-secondary)", fontSize: "0.9em", margin: 0 }}>
                                    <strong>Tu turno:</strong> Implementa en Feed (📱)
                                </p>
                            </div>
                            <span style={{ fontSize: "1.5em" }}>⭐⭐⭐</span>
                        </div>
                    </div>

                    {/* Ejercicio 5 */}
                    <div style={{ 
                        padding: "1rem", 
                        backgroundColor: "var(--bg-tertiary)", 
                        borderRadius: "8px",
                        borderLeft: "4px solid #51cf66"
                    }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div>
                                <h3 style={{ marginBottom: "0.25rem" }}>✅ Ejercicio 5: React Router</h3>
                                <p style={{ color: "var(--text-secondary)", fontSize: "0.9em", margin: 0 }}>
                                    Implementado como referencia
                                </p>
                            </div>
                            <span style={{ fontSize: "1.5em" }}>⭐⭐</span>
                        </div>
                    </div>

                    {/* Ejercicio 6 */}
                    <div style={{ 
                        padding: "1rem", 
                        backgroundColor: "var(--bg-tertiary)", 
                        borderRadius: "8px",
                        borderLeft: "4px solid #ff6b6b"
                    }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div>
                                <h3 style={{ marginBottom: "0.25rem" }}>🔧 Ejercicio 6: Router + Loaders</h3>
                                <p style={{ color: "var(--text-secondary)", fontSize: "0.9em", margin: 0 }}>
                                    <strong>Avanzado:</strong> Migrar a createBrowserRouter
                                </p>
                            </div>
                            <span style={{ fontSize: "1.5em" }}>⭐⭐⭐⭐</span>
                        </div>
                    </div>
                </div>

                <div style={{ 
                    marginTop: "1.5rem", 
                    padding: "1rem", 
                    backgroundColor: "var(--bg-secondary)", 
                    borderRadius: "8px",
                    display: "flex",
                    gap: "2rem",
                    justifyContent: "center",
                    flexWrap: "wrap"
                }}>
                    <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: "2em", marginBottom: "0.25rem" }}>✅</div>
                        <div style={{ color: "var(--text-secondary)", fontSize: "0.9em" }}>Completados: 3</div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: "2em", marginBottom: "0.25rem" }}>🔧</div>
                        <div style={{ color: "var(--text-secondary)", fontSize: "0.9em" }}>Por hacer: 3</div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: "2em", marginBottom: "0.25rem" }}>📝</div>
                        <div style={{ color: "var(--text-secondary)", fontSize: "0.9em" }}>Total: 6</div>
                    </div>
                </div>
            </div>

            {/* CTA */}
            <div className="card" style={{ textAlign: "center" }}>
                <h3 style={{ marginBottom: "1rem" }}>🚀 Empieza a Practicar</h3>
                <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
                    Inicia sesión para acceder a la aplicación y explorar los ejercicios
                </p>
                <Link to="/login">
                    <button style={{ padding: "1rem 2rem", fontSize: "1.1em" }}>
                        Ir al Login →
                    </button>
                </Link>
            </div>

        </div>
    );
}

