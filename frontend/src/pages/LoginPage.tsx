import { useAuth } from "../contexts/AuthContext";
import { LoginForm } from "../components/LoginForm";
import { Navigate } from "react-router-dom";

export function LoginPage() {
    const { isAuthenticated } = useAuth();

    if (isAuthenticated) {
        return <Navigate to="/equipos" replace />;
    }

    return (
        <div className="main-content">
            <LoginForm/>
        </div>
    );
}

