import { useAuth } from "../contexts/AuthContext";
import { useState } from "react";
// 💡 Importamos el componente tipado
import { EditProfileModal } from "../components/EditProfileModal"; 


export function ProfilePage() {
    // 🔥 CORRECCIÓN: SOLO desestructuramos 'usuario'. 
    // Las propiedades 'setUsuario' y 'userId' ya no son necesarias y causaban el error.
    const { usuario } = useAuth(); 
    
    // Estado para controlar la visibilidad del modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // El estado 'message' y el 'handleSaveProfile' han sido eliminados.

    return (
        <div className="main-content">
            <div className="card">
                
                {/* Botón de Editar Perfil */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        style={{ padding: '0.5rem 1rem', cursor: 'pointer', border: '1px solid var(--primary-color, #007bff)', borderRadius: '4px', backgroundColor: 'transparent', color: 'var(--primary-color, #007bff)' }}
                    >
                        ✏️ 
                    </button>
                </div>
                
                {/* ELIMINAR el bloque {message && ...} */}

                <div style={{ display: "flex", alignItems: "center", gap: "2rem", marginBottom: "2rem" }}>
                    <div>
                        <h2 style={{ marginBottom: "0.5rem" }}>{usuario?.nombre}</h2>
                        <div style={{ display: "flex", gap: "1rem" }}>
                            {/* Otros elementos del perfil aquí */}
                        </div>
                    </div>
                </div>

                <div style={{
                    marginTop: "2rem",
                    padding: "1.5rem",
                    backgroundColor: "var(--bg-tertiary)",
                    borderRadius: "8px"
                }}>
                    <p><strong>Email:</strong> {usuario?.email}</p>
                    <p><strong>Contraseña:</strong> ********* (oculta por seguridad)</p>
                </div>
            </div>

            {/* El Modal de Edición */}
            <EditProfileModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                user={usuario} // Pasamos el objeto usuario para pre-llenar el formulario
                // 🔥 ELIMINAR onSave, el modal llama a updateProfile directamente
            />
        </div>
    );
}