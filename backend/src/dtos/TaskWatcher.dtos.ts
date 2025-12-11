// dtos/TaskWatcher.dtos.ts

export interface SubscribeWatcherDTO {
  userId: string;
  taskId: string;
}

export interface UnsubscribeWatcherDTO {
  userId: string;
  taskId: string;
}

export interface ListTaskWatchersResponseItem {
  id: string;         // watcherId
  userId: string;
  name: string;
  avatar: string;     // primera letra del nombre
  subscribedAt: Date; // createdAt del watcher
}

export interface WatchlistFiltersDTO {
  status?: string;        // EstadoTarea
  teamId?: string;
  updatedSince?: Date;
}

export interface WatchlistItemDTO {
  taskId: string;
  titulo: string;
  estado: string;
  prioridad: string;
  fechaActualizacion: Date;
  subscribedAt: Date; // cuando se suscribio el usuario
  teamId?: string;
}
