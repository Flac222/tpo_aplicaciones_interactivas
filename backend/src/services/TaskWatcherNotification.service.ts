// services/taskWatcherNotification.service.ts
import AppDataSource from "../db/data-source";
import { TaskWatcher } from "../entities/TaskWatcher.entity";
import { TaskWatcherNotificationRepository } from "../repositories/TaskWatcherNotification.repository";
import { EventType } from "../entities/TaskWatcherNotification.entity";
import { NotificationItemDTO, NotificationsQueryDTO } from "../dtos/taskWatcherNotification.dtos";

type ServiceResult<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; message: string };

export class TaskWatcherNotificationService {
  private notifRepo = new TaskWatcherNotificationRepository();

  // Crear notificación para un watcher puntual (validando existencia del watcher)
  async createForWatcher(watcherId: string, eventType: EventType, payload: any): Promise<ServiceResult<{ id: string }>> {
    try {
      const watcher = await AppDataSource.getRepository(TaskWatcher).findOne({ where: { id: watcherId }, relations: ["task", "user"] });
      if (!watcher) return { ok: false, status: 404, message: "Watcher no encontrado" };

      const notif = await this.notifRepo.createNotification(watcher, eventType, payload);
      return { ok: true, data: { id: notif.id } };
    } catch {
      return { ok: false, status: 500, message: "Error al crear notificación" };
    }
  }

  // Notificar a todos los watchers de una tarea (status/priority/comment)
  async notifyTaskWatchers(taskId: string, eventType: EventType, payload: any): Promise<ServiceResult<number>> {
    try {
      const notifs = await this.notifRepo.notifyTaskWatchers(taskId, eventType, payload);
      return { ok: true, data: notifs.length };
    } catch {
      return { ok: false, status: 500, message: "Error al notificar watchers" };
    }
  }

  // Obtener notificaciones (por defecto: no leídas) con filtros y paginación
  async getUnread(
    userId: string,
    query: NotificationsQueryDTO = {}
  ): Promise<ServiceResult<{ items: NotificationItemDTO[]; total: number }>> {
    try {
      const { taskId, eventType, skip = 0, take = 20 } = query;

      // Base query (no leídas)
      const qb = AppDataSource.getRepository(TaskWatcher).createQueryBuilder("watcher")
        .leftJoin("watcher.user", "user")
        .leftJoin("watcher.task", "task")
        .leftJoinAndSelect("watcher.notifications", "notif")
        .where("user.id = :userId", { userId })
        .andWhere("notif.readAt IS NULL");

      if (taskId) qb.andWhere("task.id = :taskId", { taskId });
      if (eventType) qb.andWhere("notif.eventType = :eventType", { eventType });

      // total
      const total = await qb.getCount();

      // page
      const rows = await qb
        .orderBy("notif.createdAt", "DESC")
        .skip(skip)
        .take(take)
        .getMany();

      // map a DTO (aplana notificaciones por watcher)
      const items: NotificationItemDTO[] = rows.flatMap(w =>
        (w.notifications || []).map(n => ({
          id: n.id,
          taskId: w.task.id,
          titulo: w.task.titulo,
          eventType: n.eventType,
          payload: n.payload ?? null,
          createdAt: n.createdAt
        }))
      );

      return { ok: true, data: { items, total } };
    } catch {
      return { ok: false, status: 500, message: "Error al obtener notificaciones" };
    }
  }

  // Marcar notificaciones como leídas (todas o filtradas por task)
  async markAsRead(userId: string, taskId?: string): Promise<ServiceResult<{ affected: number }>> {
    try {
        // Usamos el método del repositorio que ya hace el UPDATE sobre TaskWatcherNotification
        await this.notifRepo.markAsRead(userId, taskId);

        // Para devolver cuántas se marcaron, contamos las no leídas antes del update
        const pending = await this.notifRepo.getUnread(userId);
        const affected = pending.filter(n => (taskId ? n.watcher.task.id === taskId : true)).length;

        return { ok: true, data: { affected } };
    } catch {
        return { ok: false, status: 500, message: "Error al marcar como leídas" };
    }
    }

}
