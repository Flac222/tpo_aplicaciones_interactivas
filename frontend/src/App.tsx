// src/App.tsx

import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { use } from "react";
import "./App.css";
import { ThemeContext } from "./contexts/ThemeContext";
import { useAuth } from "./contexts/AuthContext";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { FeedPage } from "./pages/FeedPage";
import { ProfilePage } from "./pages/ProfilePage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { EquipoPage } from "./pages/EquipoPage";

import { TemplateListPage } from "./pages/TemplateListPage";
import { TemplateFormPage } from "./pages/TemplateFormPage";
import { TemplateUsePage } from "./pages/TemplateUsePage"; 
import { TemplateDetailPage } from "./pages/TemplateDetailPage"; 


function App() {
    const { theme, toggleTheme } = use(ThemeContext);
    const { isAuthenticated, usuario, logout } = useAuth();

    return (
        <BrowserRouter>
            <div className="app" style={{
                backgroundColor: theme === "dark" ? "var(--bg-primary)" : "#f5f5f5",
                color: theme === "dark" ? "var(--text-primary)" : "#333",
                transition: "all 0.3s ease"
            }}>
                <nav className="navbar">
                    <Link to="/" className="navbar-brand">
                        🗐 KANBAN TIRA PIEDRA
                    </Link>

                    <div className="navbar-links">
                        <Link to="/" className="navbar-link">
                            🏠 Home
                        </Link>
                        {isAuthenticated && (
                            <>
                                <Link to="/feed" className="navbar-link">
                                    🧑‍💻 Equipos
                                </Link>
                                <Link to="/templates" className="navbar-link">
                                    📄 Templates
                                </Link>
                                <Link to={`/profile/${usuario?.nombre}`} className="navbar-link">
                                    👤 {usuario?.nombre}
                                </Link>
                                <button onClick={logout} className="navbar-link">
                                    🚪 Logout
                                </button>
                            </>
                        )}
                        <button onClick={toggleTheme} className="navbar-link">
                            {theme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode"}
                        </button>
                    </div>
                </nav>

                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<LoginPage />} />
                    
                    {/* RUTAS PROTEGIDAS */}
                    <Route
                        path="/feed"
                        element={
                            <ProtectedRoute>
                                <FeedPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/equipo/:id"
                        element={
                            <ProtectedRoute>
                                <EquipoPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/profile/:username"
                        element={
                            <ProtectedRoute>
                                <ProfilePage />
                            </ProtectedRoute>
                        }
                    />
                    
                    {/* RUTAS DE TEMPLATES */}
                    <Route path="/templates" element={<ProtectedRoute><TemplateListPage /></ProtectedRoute>} />
                    <Route path="/templates/new" element={<ProtectedRoute><TemplateFormPage /></ProtectedRoute>} />
                    <Route path="/templates/:id/edit" element={<ProtectedRoute><TemplateFormPage /></ProtectedRoute>} />
                    
                    {/*RUTA DE DETALLE SIMPLE / ASIGNACIÓN DIRECTA  */}
                    <Route 
                        path="/templates/:id" 
                        element={<ProtectedRoute><TemplateDetailPage /></ProtectedRoute>} 
                    />
                    
                    {/* RUTA DE FORMULARIO DE USO COMPLETO */}
                    <Route 
                        path="/templates/:id/use" 
                        element={<ProtectedRoute><TemplateUsePage /></ProtectedRoute>} 
                    />
                </Routes>


                <footer style={{
                    padding: "2rem",
                    textAlign: "center",
                    color: "var(--text-secondary)",
                    borderTop: "1px solid var(--bg-tertiary)",
                    marginTop: "3rem"
                }}>
                    <p>Kanban tira piedra - Esto no es un kanban o si</p>
                    <p style={{ fontSize: "0.9em", marginTop: "0.5rem" }}>
                        Trabajo practico de la materia aplicaciones interactivas
                    </p>
                </footer>
            </div>
        </BrowserRouter>
    );
}

export default App;