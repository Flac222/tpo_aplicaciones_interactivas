import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import React from "react";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
   
    const { isAuthenticated, loading } = useAuth(); 

    
    if (loading) {
        return (
            <div style={{ padding: '20px', textAlign: 'center', fontSize: '1.2em' }}>
                Verificando sesión...
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

   
    return <>{children}</>;
}