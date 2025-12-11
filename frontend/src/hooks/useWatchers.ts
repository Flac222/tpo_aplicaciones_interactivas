
import { useState, useCallback, useEffect } from 'react';
import { watcherService } from '../services/watcherService';
import { Watcher } from '../types/watchers';
import { useToast } from '../contexts/ToastContext';

// Este hook se encarga de gestionar los watchers de una tarea
export function useWatchers(taskId?: string) {
    const [watchers, setWatchers] = useState<Watcher[]>([]);
    const [loading, setLoading] = useState(false);
    const [subscribing, setSubscribing] = useState(false);
    const { addToast } = useToast();

    const fetchWatchers = useCallback(async () => {
        if (!taskId) {
            setWatchers([]);
            return;
        }
        setLoading(true);
        try {
            const data = await watcherService.getTaskWatchers(taskId);
            setWatchers(data);
        } catch (error) {
            console.error("Error fetching watchers:", error);
        } finally {
            setLoading(false);
        }
    }, [taskId]);

    useEffect(() => {
        fetchWatchers();
    }, [fetchWatchers]);

    const subscribe = async () => {
        if (!taskId) return;
        setSubscribing(true);
        try {
            await watcherService.subscribe(taskId);
            addToast('Suscripción exitosa', 'success');
            fetchWatchers();
        } catch (error: any) {
            if (error.status === 409) {
                addToast('Ya estás suscrito a esta tarea', 'info');
            } else if (error.status === 422) {
                addToast('Límite de watchers alcanzado', 'error');
            } else {
                addToast('Error al suscribirse', 'error');
            }
        } finally {
            setSubscribing(false);
        }
    };

    const unsubscribe = async () => {
        if (!taskId) return;
        setSubscribing(true);
        try {
            await watcherService.unsubscribe(taskId);
            addToast('Te has desuscrito', 'success');
            fetchWatchers();
        } catch (error) {
            console.error(error);
            addToast('Error al desuscribirse', 'error');
        } finally {
            setSubscribing(false);
        }
    };

    // Esto va a verificar si el usuario esta suscrito a la tarea
    const isUserWatching = useCallback((userId: string) => {
        return watchers.some(w => w.userId === userId);
    }, [watchers]);

    return {
        watchers,
        loading,
        subscribing,
        subscribe,
        unsubscribe,
        isUserWatching,
        refetch: fetchWatchers
    };
}
