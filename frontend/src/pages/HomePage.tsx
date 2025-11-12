import React, { useState, FormEvent, ChangeEvent } from "react";
import { Link } from "react-router-dom";

// Define la URL base de tu API
const BASE_URL = "http://localhost:3000"; 

export function HomePage(): React.ReactElement {
    // --- Estados para el Formulario de Registro ---
    const [nombre, setNombre] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    
    // Estados para feedback
    const [loading, setLoading] = useState<boolean>(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // --- Manejador del Formulario ---
    const handleRegister = async (e: FormEvent) => {
        e.preventDefault();
        setMessage(null);
        setLoading(true);

        // Simple validación básica
        if (!nombre || !email || !password) {
            setMessage({ type: 'error', text: "Todos los campos son obligatorios." });
            setLoading(false);
            return;
        }

        try {
            const res = await fetch(`${BASE_URL}/api/users/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre, email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                // Si el servidor devuelve un error (ej: email ya registrado)
                throw new Error(data.error || "Fallo en el registro. Intenta con otro email.");
            }

            // Éxito en el registro
            setMessage({ 
                type: 'success', 
                text: `✅ ¡Registro exitoso para ${data.nombre}! Ahora puedes iniciar sesión.` 
            });
            
            // Limpiar formulario al éxito
            setNombre("");
            setEmail("");
            setPassword("");

        } catch (err: any) {
            setMessage({ type: 'error', text: `❌ Error: ${err.message}` });
        } finally {
            setLoading(false);
        }
    };

    // --- Estilos para inputs (basados en tus ejemplos) ---
    const inputStyle: React.CSSProperties = { 
        width: '100%', 
        padding: '0.75rem', 
        border: '1px solid var(--bg-tertiary, #ccc)', 
        borderRadius: '4px',
        boxSizing: 'border-box',
        marginBottom: '1rem'
    };
    
    // --- Estilos para el mensaje de feedback ---
    const messageStyle: React.CSSProperties = message ? {
        padding: '1rem',
        borderRadius: '4px',
        marginBottom: '1rem',
        textAlign: 'left',
        fontWeight: 'bold',
        backgroundColor: message.type === 'success' ? 'var(--color-success-light, #d4edda)' : 'var(--color-error-light, #f8d7da)',
        color: message.type === 'success' ? 'var(--color-success, #155724)' : 'var(--color-error, #721c24)',
    } : {};


    return (
        <div className="main-content">
            {/* Header */}
            <div className="card" style={{ textAlign: "center", marginBottom: "2rem" }}>
                <h1 style={{ fontSize: "3em", marginBottom: "0.5rem" }}>
                    Bienvenido a Kanban Tira Piedra
                </h1>
                <p style={{ fontSize: "1.2em", color: "var(--text-secondary)" }}>
                    Una app de kanban
                </p>
            </div>

            {/* Instrucciones principales (Tu bloque original) */}
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
                    
                </p>
            </div>

            {/* Formulario de Registro de Usuario */}
            <div className="card" style={{ marginBottom: "2rem" }}>
                <h2 className="card-title" style={{ marginBottom: "1.5rem" }}>Registrar Nuevo Usuario</h2>

                {/* Mensaje de Feedback */}
                {message && <div style={messageStyle}>{message.text}</div>}

                <form onSubmit={handleRegister}>
                    {/* Campo Nombre */}
                    <div>
                        <label htmlFor="register-nombre" style={{ display: 'block', marginBottom: '0.5rem' }}>Nombre:</label>
                        <input
                            id="register-nombre"
                            type="text"
                            value={nombre}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setNombre(e.target.value)}
                            style={inputStyle}
                            disabled={loading}
                            placeholder="Tu nombre completo"
                        />
                    </div>

                    {/* Campo Email */}
                    <div>
                        <label htmlFor="register-email" style={{ display: 'block', marginBottom: '0.5rem' }}>Email:</label>
                        <input
                            id="register-email"
                            type="email"
                            value={email}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                            style={inputStyle}
                            disabled={loading}
                            placeholder="ejemplo@correo.com"
                        />
                    </div>

                    {/* Campo Contraseña */}
                    <div>
                        <label htmlFor="register-password" style={{ display: 'block', marginBottom: '0.5rem' }}>Contraseña:</label>
                        <input
                            id="register-password"
                            type="password"
                            value={password}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                            style={inputStyle}
                            disabled={loading}
                            placeholder="Mínimo 6 caracteres"
                        />
                    </div>
                    
                    {/* Botón de Registro */}
                    <button 
                        type="submit" 
                        disabled={loading}
                        style={{ padding: "0.75rem 1.5rem", fontSize: "1em", width: '100%', marginTop: '0.5rem' }}
                    >
                        {loading ? 'Registrando...' : 'Crear Cuenta'}
                    </button>
                </form>

            </div>
            
            {/* CTA Login (Tu bloque original) */}
            <div className="card" style={{ textAlign: "center" }}>
                <h3 style={{ marginBottom: "1rem" }}>Login</h3>
                <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
                    Inicia sesión para acceder a la aplicación
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