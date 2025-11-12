import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import React from "react";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
    // 💡 Importar 'loading' es crucial
    const { isAuthenticated, loading } = useAuth(); 

    // 1. Si está cargando, mostramos un mensaje de espera (esto previene la redirección inmediata)
    if (loading) {
        return (
            <div style={{ padding: '20px', textAlign: 'center', fontSize: '1.2em' }}>
                Verificando sesión...
            </div>
        );
    }

    // 2. Si la carga terminó y NO está autenticado, redirigimos
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // 3. Si la carga terminó y SÍ está autenticado, mostramos el contenido
    return <>{children}</>;
}