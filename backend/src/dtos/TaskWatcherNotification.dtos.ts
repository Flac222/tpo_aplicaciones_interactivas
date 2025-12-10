// dtos/TaskWatcherNotification.dtos.ts

import { EventType } from "../entities/TaskWatcherNotification.entity";

export interface NotificationItemDTO {
  id: string;
  taskId: string;
  titulo: string;
  eventType: EventType;
  payload: Record<string, any> | null;
  createdAt: Date;
}

export interface NotificationsQueryDTO {
  taskId?: string;
  eventType?: EventType;
  skip?: number;
  take?: number; // default 20
}
