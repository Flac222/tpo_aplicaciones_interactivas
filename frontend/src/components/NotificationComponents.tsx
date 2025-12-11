import React, { useState, useEffect } from 'react';
import { NotificationItem } from '../types/notifications';

const BASE_URL = 'http://localhost:3000/api';

function formatNotification(n: NotificationItem): string {
    switch (n.eventType) {
        case "createComment":
            return `Agregaron un comentario: "${n.payload?.texto}"`;
        case "editComment":
            return `Editarón un comentario: "${n.payload?.textoNuevo}"`;
        case "deleteComment":
            return `Eliminaron un comentario`;
        case "statusChange":
            return `Cambió el estado de "${n.titulo}" de ${n.payload?.anterior} a ${n.payload?.nuevo}`;
        case "subscribe":
            return `${n.payload?.nombre || "Un usuario"} se suscribió a la tarea "${n.titulo}"`;
        case "unsubscribe":
            return `${n.payload?.nombre || "Un usuario"} se desuscribió de la tarea "${n.titulo}"`;
        case "assingTag":
            return `Asignaron una etiqueta de la tarea "${n.titulo}"`;
        case "removeTag":
            return `Removieron una etiqueta de la tarea "${n.titulo}"`;
        default:
            return `Se registró un evento en "${n.titulo}"`;
    }
}

export const NotificationBadge: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [totalUnread, setTotalUnread] = useState(0);
    const [page, setPage] = useState(1);
    const pageSize = 5;

    const fetchNotifications = async (pageNum: number) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const skip = (pageNum - 1) * pageSize;

            const res = await fetch(
                `${BASE_URL}/notifications?skip=${skip}&take=${pageSize}`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        ...(token ? { Authorization: `Bearer ${token}` } : {})
                    },
                }
            );

            const data = await res.json();
            setNotifications(data.items || []);
            setTotalUnread(data.total || 0);
        } catch (err) {
            console.error("Error fetching notifications", err);
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = () => {
        if (!isOpen) fetchNotifications(page);
        setIsOpen(!isOpen);
    };

    const handleRead = async (id: string) => {
        const token = localStorage.getItem('token');
        await fetch(`${BASE_URL}/notifications/read`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {})
            },
            body: JSON.stringify({ notificationId: id })
        });

        fetchNotifications(page);
    };

    const totalPages = Math.ceil(totalUnread / pageSize);

    // 🔄 Polling cada 10 segundos
    useEffect(() => {
        const interval = setInterval(() => {
            fetchNotifications(page);
        }, 10000); // 10s

        return () => clearInterval(interval); // limpiar al desmontar
    }, [page]);

    return (
        <div className="notif-container">
            <div className="notif-icon" onClick={handleToggle}>
                🔔
                {totalUnread > 0 && (
                    <span className="notif-count">{totalUnread}</span>
                )}
            </div>

            {isOpen && (
                <div className="notif-panel">
                    <div className="notif-header">Notificaciones</div>

                    {loading ? (
                        <div className="notif-loading">Cargando...</div>
                    ) : notifications.length === 0 ? (
                        <div className="notif-empty">No tienes notificaciones nuevas</div>
                    ) : (
                        <>
                            {notifications.map(n => (
                                <div key={n.id} className="notif-item">
                                    <div className="notif-title">{n.titulo}</div>
                                    <div className="notif-type">{formatNotification(n)}</div>
                                    <div className="notif-date">
                                        {new Date(n.createdAt).toLocaleString()}
                                    </div>
                                    <button className="notif-read-btn" onClick={() => handleRead(n.id)}>
                                        ✓
                                    </button>
                                </div>
                            ))}

                            {/* PAGINACIÓN */}
                            <div className="notif-pagination">
                                <button
                                    disabled={page <= 1}
                                    onClick={() => {
                                        setPage(p => p - 1);
                                        fetchNotifications(page - 1);
                                    }}>
                                    ◀
                                </button>

                                <span>{page} / {totalPages}</span>

                                <button
                                    disabled={page >= totalPages}
                                    onClick={() => {
                                        setPage(p => p + 1);
                                        fetchNotifications(page + 1);
                                    }}>
                                    ▶
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};
