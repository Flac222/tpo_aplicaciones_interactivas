import { Link } from "react-router-dom";

export function NotFoundPage() {
    return (
        <div className="main-content">
            <div className="card" style={{ textAlign: "center" }}>
                <h1 style={{ fontSize: "4em", marginBottom: "0.5rem" }}>404</h1>
                <h2>Página no encontrada</h2>
                <p style={{ color: "var(--text-secondary)", marginTop: "1rem" }}>
                    La página que buscas no existe.
                </p>
                <Link to="/">
                    <button style={{ marginTop: "1.5rem" }}>
                        🏠 Volver al inicio
                    </button>
                </Link>
            </div>
        </div>
    );
}

