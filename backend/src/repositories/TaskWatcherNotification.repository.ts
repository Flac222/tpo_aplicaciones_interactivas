import AppDataSource from "../db/data-source";
import { TaskWatcherNotification, EventType } from "../entities/TaskWatcherNotification.entity";
import { TaskWatcher } from "../entities/TaskWatcher.entity";

export class TaskWatcherNotificationRepository {
  private repo = AppDataSource.getRepository(TaskWatcherNotification);

  // Crear una notificación para un watcher específico
  async createNotification(watcher: TaskWatcher, eventType: EventType, payload: any) {
    const notif = this.repo.create({
      watcher,
      eventType,
      payload
    });
    return await this.repo.save(notif);
  }

  // Crear notificaciones en lote para todos los watchers de una tarea
  async notifyTaskWatchers(taskId: string, eventType: EventType, payload: any) {
    const watcherRepo = AppDataSource.getRepository(TaskWatcher);
    const watchers = await watcherRepo.find({ where: { task: { id: taskId } } });

    const notifications = watchers.map(w =>
      this.repo.create({ watcher: w, eventType, payload })
    );

    return await this.repo.save(notifications);
  }

  // Listar notificaciones no leídas de un usuario
  async getUnread(userId: string) {
    return await this.repo.createQueryBuilder("notif")
    .leftJoinAndSelect("notif.watcher", "watcher")
    .leftJoinAndSelect("watcher.task", "task")
    .leftJoin("watcher.user", "user")
    .where("user.id = :userId", { userId })
    .andWhere("notif.readAt IS NULL")
    .orderBy("notif.createdAt", "DESC")
    .getMany();
  }

  // Marcar notificaciones como leídas (todas o filtradas por tarea)
  async markAsRead(userId: string, taskId?: string) {
    const qb = this.repo.createQueryBuilder()
      .update(TaskWatcherNotification)
      .set({ readAt: () => "CURRENT_TIMESTAMP" })
      .where("watcher.userId = :userId", { userId });

    if (taskId) {
      qb.andWhere("watcher.taskId = :taskId", { taskId });
    }

    await qb.execute();
  }
}
