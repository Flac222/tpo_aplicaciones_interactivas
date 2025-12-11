
import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    addToast: (message: string, type: ToastType) => void;
    removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = useCallback((message: string, type: ToastType) => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, message, type }]);

        setTimeout(() => {
            removeToast(id);
        }, 5000); // Remover el toast después de 5 segundos
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ addToast, removeToast }}>
            {children}
            <div className="toast-container" style={{
                position: 'fixed',
                bottom: '20px',
                right: '20px',
                zIndex: 9999,
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
            }}>
                {toasts.map((toast) => (
                    <div key={toast.id} style={{
                        padding: '10px 20px',
                        borderRadius: '4px',
                        color: 'white',
                        backgroundColor: toast.type === 'success' ? '#48BB78' :
                            toast.type === 'error' ? '#F56565' :
                                toast.type === 'warning' ? '#ED8936' : '#4299E1',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                        minWidth: '200px',
                        animation: 'fadeIn 0.3s ease-in-out'
                    }}>
                        {toast.message}
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}
