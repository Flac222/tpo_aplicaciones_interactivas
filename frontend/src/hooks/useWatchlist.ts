
import { useState, useCallback, useEffect } from 'react';
import { watcherService } from '../services/watcherService';
import { WatchlistItem, WatchlistParams } from '../types/watchers';
import { useToast } from '../contexts/ToastContext';

export function useWatchlist(initialParams: WatchlistParams = {}) {
    const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [params, setParams] = useState<WatchlistParams>(initialParams);

    const { addToast } = useToast();

    const fetchWatchlist = useCallback(async () => {
        setLoading(true);
        try {
            const data = await watcherService.getWatchlist(params);
            setWatchlist(data.items);
            setTotal(data.total);
        } catch (error) {
            console.error("Error fetching watchlist:", error);
            // Esto es para mostrar un toast
            addToast('Error al cargar la watchlist', 'error');
        } finally {
            setLoading(false);
        }
    }, [params]);

    useEffect(() => {
        fetchWatchlist();
    }, [fetchWatchlist]);

    const updateParams = (newParams: Partial<WatchlistParams>) => {
        setParams(prev => ({ ...prev, ...newParams }));
    };

    return {
        watchlist,
        total,
        loading,
        params,
        updateParams,
        refresh: fetchWatchlist
    };
}
