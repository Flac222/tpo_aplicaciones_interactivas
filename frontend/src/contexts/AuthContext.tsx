import { createContext, useState, ReactNode, useContext } from "react";

// (Tu interfaz Usuario queda igual)
export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  password: string; // Nota de Seguridad: Evita almacenar la contraseña real.
}

// Interfaz para los datos que pueden ser actualizados (Password es opcional)
interface UpdateData {
  nombre?: string;
  email?: string;
  password?: string;
}
interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: Usuario | null;
}

interface AuthContextType {
  usuario: Usuario | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  token: string | null;
  // 🔥 Función añadida
  updateProfile: (data: UpdateData) => Promise<Usuario>; 
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const baseUrl = "http://localhost:3000"; // URL base de tu API

  // (Tu función login queda igual)
  const login = async (email: string, password: string) => {
    // ... (Tu lógica de login)
    try {
        const res = await fetch(`${baseUrl}/api/users/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        if (!res.ok) {
            throw new Error("Error en login");
        }

        const data = await res.json();
        setUsuario(data.usuario);
        setToken(data.token);
        localStorage.setItem("token", data.token);
    } catch (error) {
        console.error(error);
        throw error;
    }
  };

  // (Tu función logout queda igual)
  const logout = () => {
    setUsuario(null);
    setToken(null);
    localStorage.removeItem("token");
  };

  // 🚀 Nueva función para actualizar el perfil del usuario
  const updateProfile = async (data: UpdateData): Promise<Usuario> => {
    if (!usuario || !token) {
      throw new Error("No hay usuario autenticado o token disponible.");
    }
    
    // Utilizamos el ID del usuario logueado
    const userId = usuario.id; 

    try {
      const res = await fetch(`${baseUrl}/api/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`, // Usamos el token para autenticar
        },
        // Enviamos solo los campos que se modificaron
        body: JSON.stringify(data), 
      });

      if (!res.ok) {
        // Asumiendo que tu API devuelve un mensaje de error en formato JSON
        const errorData = await res.json();
        throw new Error(errorData.message || "Error al actualizar el perfil.");
      }

      // Asumimos que la API devuelve el objeto Usuario actualizado
      const updatedUser: Usuario = await res.json();
      
      // 🔥 Actualizamos el estado global del usuario con los nuevos datos
      // Esto hará que todos los componentes que usen useAuth se re-rendericen.
      setUsuario(updatedUser); 
      
      return updatedUser;
    } catch (error) {
      console.error("Error en updateProfile:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        usuario,
        login,
        logout,
        isAuthenticated: usuario !== null,
        token,
        // 🔥 Proveemos la nueva función
        updateProfile, 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Custom Hook (no necesita cambios, ya que se actualiza automáticamente con AuthContextType)
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return context;
}