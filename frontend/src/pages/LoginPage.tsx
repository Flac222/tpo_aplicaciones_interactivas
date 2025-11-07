import { useAuth } from "../contexts/AuthContext";
import { LoginForm } from "../components/LoginForm";
import { Navigate } from "react-router-dom";

export function LoginPage() {
    const { isAuthenticated } = useAuth();

    if (isAuthenticated) {
        return <Navigate to="/feed" replace />;
    }

    return (
        <div className="main-content">
            <LoginForm />

            <div style={{
                maxWidth: "600px",
                margin: "2rem auto",
                padding: "1.5rem",
                backgroundColor: "var(--bg-secondary)",
                borderRadius: "12px"
            }}>
                <h3 style={{ marginBottom: "1rem" }}>💡 Ejercicio: Context API + Auth</h3>
                <p style={{ color: "var(--text-secondary)", marginBottom: "1rem" }}>
                    Este formulario utiliza el <strong>AuthContext</strong> para manejar la autenticación.
                </p>
                <h4 style={{ fontSize: "1em", marginTop: "1.5rem", marginBottom: "0.5rem" }}>
                    Conceptos aplicados:
                </h4>
                <ul style={{ color: "var(--text-secondary)", paddingLeft: "1.5rem", lineHeight: "1.8" }}>
                    <li><strong>Context API:</strong> Estado global de usuario</li>
                    <li><strong>Custom Hook (useAuth):</strong> Encapsula lógica de auth</li>
                    <li><strong>Protected Routes:</strong> Redirección automática</li>
                    <li><strong>Loading States:</strong> Feedback durante login</li>
                </ul>
            </div>
        </div>
    );
}

