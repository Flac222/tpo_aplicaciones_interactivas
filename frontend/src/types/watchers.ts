
export interface Watcher {
    id: string;
    userId: string;
    name: string;
    avatar: string;
    subscribedAt: string;
}

export interface WatchlistParams {
    status?: string;
    teamId?: string;
    updatedSince?: string;
    page?: number;
    limit?: number;
}

export interface WatchlistItem {
    taskId: string;
    titulo: string;
    estado: string;
    prioridad: string;
    fechaActualizacion: string;
    subscribedAt: string;
    teamId?: string;
}

export interface WatchlistResponse {
    items: WatchlistItem[];
    total: number;
}
