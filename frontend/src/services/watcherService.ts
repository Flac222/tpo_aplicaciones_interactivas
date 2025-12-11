
import { apiRequest } from './api';
import { Watcher, WatchlistParams, WatchlistResponse } from '../types/watchers';

export const watcherService = {
    subscribe: async (taskId: string): Promise<{ watcherId: string }> => {
        if (!taskId) throw new Error("TaskId is required");
        return apiRequest<{ watcherId: string }>(`/tareas/${taskId}/watchers`, {
            method: 'POST',
        });
    },

    unsubscribe: async (taskId: string): Promise<void> => {
        if (!taskId) throw new Error("TaskId is required");
        return apiRequest<void>(`/tareas/${taskId}/watchers`, {
            method: 'DELETE',
        });
    },

    getTaskWatchers: async (taskId: string): Promise<Watcher[]> => {
        if (!taskId) throw new Error("TaskId is required");
        return apiRequest<Watcher[]>(`/tareas/${taskId}/watchers`);
    },

    getWatchlist: async (params: WatchlistParams = {}): Promise<WatchlistResponse> => {
        const query = new URLSearchParams();
        if (params.status) query.append('status', params.status);
        if (params.teamId) query.append('teamId', params.teamId);
        if (params.updatedSince) query.append('updatedSince', params.updatedSince);
        if (params.page) query.append('page', params.page.toString());
        if (params.limit) query.append('limit', params.limit.toString());

        return apiRequest<WatchlistResponse>(`/users/watchers/watchlist?${query.toString()}`);
    }
};
