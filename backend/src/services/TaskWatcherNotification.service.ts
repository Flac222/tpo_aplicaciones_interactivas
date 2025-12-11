// services/taskWatcherNotification.service.ts
import AppDataSource from "../db/data-source";
import { TaskWatcher } from "../entities/TaskWatcher.entity";
import { TaskWatcherNotificationRepository } from "../repositories/TaskWatcherNotification.repository";
import { EventType } from "../entities/TaskWatcherNotification.entity";
import { NotificationItemDTO, NotificationsQueryDTO } from "../dtos/taskWatcherNotification.dtos";
import { TaskWatcherNotification } from "../entities/TaskWatcherNotification.entity";

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

      const notifRepo = AppDataSource.getRepository(TaskWatcherNotification);

      // Base query sobre notificaciones
      const qb = notifRepo.createQueryBuilder("notif")
        .innerJoinAndSelect("notif.watcher", "watcher")
        .innerJoinAndSelect("watcher.task", "task")
        .innerJoin("watcher.user", "user")
        .where("user.id = :userId", { userId })
        .andWhere("notif.readAt IS NULL");

      if (taskId) qb.andWhere("task.id = :taskId", { taskId });
      if (eventType) qb.andWhere("notif.eventType = :eventType", { eventType });

      // total de notificaciones pendientes
      const total = await qb.getCount();

      // page
      const rows = await qb
        .orderBy("notif.createdAt", "DESC")
        .skip(skip)
        .take(take)
        .getMany();

      // map a DTO
      const items: NotificationItemDTO[] = rows.map(n => ({
        id: n.id,
        taskId: n.watcher.task.id,
        titulo: n.watcher.task.titulo,
        eventType: n.eventType,
        payload: n.payload ?? null,
        createdAt: n.createdAt
      }));

      return { ok: true, data: { items, total } };
    } catch {
      return { ok: false, status: 500, message: "Error al obtener notificaciones" };
    }
  }

  async markAsRead(
    userId: string,
    taskId?: string,
    notificationId?: string
  ): Promise<ServiceResult<{ affected: number }>> {
    try {
      const notifRepo = AppDataSource.getRepository(TaskWatcherNotification);

      if (notificationId) {
        // Caso: marcar una sola notificación
        const notif = await notifRepo.findOne({
          where: { id: notificationId },
          relations: ["watcher", "watcher.user"]
        });

        if (!notif) {
          return { ok: false, status: 404, message: "Notificación no encontrada" };
        }
        if (notif.watcher.user.id !== userId) {
          return { ok: false, status: 403, message: "No tienes permiso para modificar esta notificación" };
        }

        const result = await notifRepo.createQueryBuilder()
          .update(TaskWatcherNotification)
          .set({ readAt: () => "CURRENT_TIMESTAMP" })
          .where("id = :id", { id: notificationId })
          .execute();

        return { ok: true, data: { affected: result.affected ?? 0 } };
      }

      // Caso: marcar todas o por task
      const watcherIdsRaw = await AppDataSource.getRepository(TaskWatcher)
        .createQueryBuilder("w")
        .select("w.id", "id")
        .where("w.userId = :userId", { userId })
        .andWhere(taskId ? "w.taskId = :taskId" : "1=1", { taskId })
        .getRawMany();

      const watcherIds = watcherIdsRaw.map(r => r.id);

      if (watcherIds.length === 0) {
        return { ok: true, data: { affected: 0 } };
      }

      const result = await notifRepo.createQueryBuilder()
        .update(TaskWatcherNotification)
        .set({ readAt: () => "CURRENT_TIMESTAMP" })
        .where("watcherId IN (:...ids)", { ids: watcherIds })
        .execute();

      return { ok: true, data: { affected: result.affected ?? 0 } };
    } catch {
      return { ok: false, status: 500, message: "Error al marcar como leídas" };
    }
  }



}
