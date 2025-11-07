import { createContext, useState, ReactNode, use } from "react";

interface Gamer {
    id: number;
    username: string;
    avatar: string;
    level: number;
    points: number;
}

interface AuthContextType {
    gamer: Gamer | null;
    login: (username: string, password: string) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType>({
    gamer: null,
    login: async () => { },
    logout: () => { },
    isAuthenticated: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
    const [gamer, setGamer] = useState<Gamer | null>(null);

    const login = async (username: string, password: string) => {
        // Simulación de login
        await new Promise((resolve) => setTimeout(resolve, 1000));

        if (username && password) {
            setGamer({
                id: 1,
                username: username,
                avatar: username.includes("pro") ? "🎮" : "👤",
                level: Math.floor(Math.random() * 50) + 1,
                points: Math.floor(Math.random() * 20000),
            });
        } else {
            throw new Error("Credenciales inválidas");
        }
    };

    const logout = () => {
        setGamer(null);
    };

    return (
        <AuthContext
            value={{
                gamer,
                login,
                logout,
                isAuthenticated: gamer !== null,
            }}
        >
            {children}
        </AuthContext>
    );
}

// Custom Hook
export function useAuth() {
    const context = use(AuthContext);
    if (!context) {
        throw new Error("useAuth debe usarse dentro de AuthProvider");
    }
    return context;
}

