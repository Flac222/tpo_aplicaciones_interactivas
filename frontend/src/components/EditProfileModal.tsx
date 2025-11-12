import React, { useState, FormEvent, ChangeEvent } from 'react';
// Asegúrate de que AuthContext exporte el tipo Usuario
import { useAuth, Usuario } from '../contexts/AuthContext'; 

// --- Tipos ---
interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: Usuario | null;
}

interface FormData {
    nombre: string;
    email: string;
    password?: string; // Contraseña es opcional al enviar
}

export function EditProfileModal({ isOpen, onClose, user }: EditProfileModalProps) {
    const { updateProfile } = useAuth();
    
    const [formData, setFormData] = useState<FormData>({
        nombre: user?.nombre || '',
        email: user?.email || '',
        password: '', // Siempre vacío inicialmente por seguridad
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Manejador de cambios
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Manejador de envío
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const dataToUpdate: FormData = {
            nombre: formData.nombre,
            email: formData.email,
        };

        // Solo se añade 'password' al payload si el usuario ha introducido algo
        if (formData.password) {
            dataToUpdate.password = formData.password;
        }

        try {
            await updateProfile(dataToUpdate);
            
            // Si tiene éxito, actualiza el estado local para reflejar los cambios (excepto la contraseña)
            setFormData(prev => ({ ...prev, password: '' })); 
            
            onClose(); // Cierra la ventana emergente
        } catch (err: any) {
            setError(err.message || "Fallo al guardar los cambios.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;
    
    // Estilos para la ventana emergente flotante
const modalStyle: React.CSSProperties = {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.7)', // Fondo oscuro como en FeedPage
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000, 
    };

    const contentStyle: React.CSSProperties = {
        // Usa las variables CSS de tu aplicación
        backgroundColor: 'var(--bg-lightest)', 
        color: 'var(--text-primary)',
        padding: '2rem',
        borderRadius: '8px',
        minWidth: '300px',
        maxWidth: '450px',
        zIndex: 1001,
        // Agregamos un box-shadow si no lo manejas globalmente
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
    };

    const inputStyle: React.CSSProperties = { 
        width: '100%', 
        padding: '0.75rem', 
        // Usar variables para el borde, si existen, si no, mantener #ccc
        border: '1px solid var(--bg-tertiary, #ccc)', 
        borderRadius: '4px',
        boxSizing: 'border-box', // Importante para que el padding no desborde
        backgroundColor: 'var(--bg-primary, white)',
        color: 'var(--text-primary)',
    };

    const buttonStylePrimary: React.CSSProperties = {
        padding: '0.75rem 1.5rem',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        backgroundColor: 'var(--color-primary, #d9534f)', // Usar la variable principal
        color: 'white',
        fontWeight: 'bold',
    };

    const buttonStyleSecondary: React.CSSProperties = {
        ...buttonStylePrimary, // Heredar base
        backgroundColor: 'var(--text-secondary)',
        color: 'var(--bg-lightest)',
    };

    const errorStyle: React.CSSProperties = {
        color: 'var(--color-error, #d9534f)', 
        backgroundColor: 'var(--bg-tertiary, #f2dede)', 
        padding: '0.75rem', 
        borderRadius: '4px', 
        marginBottom: '1rem'
    };


    return (
        <div style={modalStyle} onClick={onClose}>
            <div style={contentStyle} onClick={e => e.stopPropagation()}>
                <h3 style={{ marginTop: 0 }}>✏️ Editar Perfil de {user?.nombre}</h3>
                <hr style={{ margin: '1rem 0', borderTop: '1px solid var(--bg-tertiary)' }} />

                <form onSubmit={handleSubmit}>
                    
                    {/* Campo Nombre */}
                    <div style={{ marginBottom: '1rem' }}>
                        <label htmlFor="nombre" style={{ display: 'block', marginBottom: '0.5rem' }}>Nombre:</label>
                        <input
                            type="text" id="nombre" name="nombre" value={formData.nombre}
                            onChange={handleChange} required style={inputStyle}
                        />
                    </div>

                    {/* Campo Email */}
                    <div style={{ marginBottom: '1rem' }}>
                        <label htmlFor="email" style={{ display: 'block', marginBottom: '0.5rem' }}>Email:</label>
                        <input
                            type="email" id="email" name="email" value={formData.email}
                            onChange={handleChange} required style={inputStyle}
                        />
                    </div>

                    {/* Campo Contraseña (Opcional) */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label htmlFor="password" style={{ display: 'block', marginBottom: '0.5rem' }}>Contraseña (Dejar vacío para no cambiar):</label>
                        <input
                            type="password" id="password" name="password" value={formData.password}
                            onChange={handleChange} style={inputStyle} placeholder="********"
                        />
                    </div>
                    
                    {/* Mensaje de Error */}
                    {error && <p style={errorStyle}>❌ {error}</p>}

                    {/* Botones de acción */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                        <button type="button" onClick={onClose} disabled={loading}
                            style={buttonStyleSecondary}>
                            Cancelar
                        </button>
                        <button type="submit" disabled={loading}
                            style={buttonStylePrimary}>
                            {loading ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}