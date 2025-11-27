import { createContext, useState, ReactNode, useContext, useEffect } from "react";

// --- Interfaces ---

export interface Usuario {
    id: string;
    nombre: string;
    email: string;
    password: string; 
}

interface UpdateData {
    nombre?: string;
    email?: string;
    password?: string;
}

interface AuthContextType {
    usuario: Usuario | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
    token: string | null;
    updateProfile: (data: UpdateData) => Promise<Usuario>;
    loading: boolean; 
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- Componente AuthProvider con Persistencia de Sesión ---

export function AuthProvider({ children }: { children: ReactNode }) {
    const [usuario, setUsuario] = useState<Usuario | null>(null);
    const [token, setToken] = useState<string | null>(null);
   
    const [loading, setLoading] = useState(true); 
    const baseUrl = "http://localhost:3000";

    
    const loadUser = async (authToken: string) => {
        try {
            
            const res = await fetch(`${baseUrl}/api/users/me`, { 
                method: "GET",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${authToken}`, 
                },
            });

            if (!res.ok) {
                
                throw new Error("Token de sesión inválido o expirado.");
            }

            const data = await res.json();
            setUsuario(data.usuario || data); 
            setToken(authToken);
        } catch (error) {
            console.error("Error al restaurar la sesión:", error);
            localStorage.removeItem("token");
            setUsuario(null);
            setToken(null);
        } finally {
            
            setLoading(false); 
        }
    };

   
    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        if (storedToken) {
            loadUser(storedToken);
        } else {
            setLoading(false); 
        }
    }, []); 


    const login = async (email: string, password: string) => {

        try {
            const res = await fetch(`${baseUrl}/api/users/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || "Error en login");
            }

            const data = await res.json();
            setUsuario(data.usuario);
            setToken(data.token);
            localStorage.setItem("token", data.token); 
        } catch (error) {
            throw error;
        } finally {
            setLoading(false); 
        }
    };

    const logout = () => {
        setUsuario(null);
        setToken(null);
        localStorage.removeItem("token"); 
    };

    const updateProfile = async (data: UpdateData): Promise<Usuario> => {
        if (!usuario || !token) {
            throw new Error("No hay usuario autenticado o token disponible.");
        }
        
        const userId = usuario.id; 

        try {
            const res = await fetch(`${baseUrl}/api/users/${userId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`, 
                },
                body: JSON.stringify(data), 
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || "Error al actualizar el perfil.");
            }

            const updatedUser: Usuario = await res.json();
            setUsuario(updatedUser); 
            
            return updatedUser;
        } catch (error) {
            console.error("Error en updateProfile:", error);
            throw error;
        }
    };

    
    if (loading) {
        return (
            <div style={{ padding: '20px', textAlign: 'center', fontSize: '1.2em', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                Verificando sesión...
            </div>
        ); 
    }

    return (
        <AuthContext.Provider
            value={{
                usuario,
                login,
                logout,
                isAuthenticated: usuario !== null,
                token,
                updateProfile, 
                loading,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth debe usarse dentro de AuthProvider");
    }
    return context;
}