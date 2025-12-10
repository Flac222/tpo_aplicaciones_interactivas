// services/taskWatcher.service.ts
import AppDataSource from "../db/data-source";
import { TaskWatcher } from "../entities/TaskWatcher.entity";
import { Tarea, EstadoTarea } from "../entities/Tareas.entity";
import { Usuario } from "../entities/Usuario.entity";
import { Equipo } from "../entities/Equipo.entity";
import { TaskWatcherRepository } from "../repositories/TaskWatcher.repository";
import { TaskWatcherNotificationRepository } from "../repositories/TaskWatcherNotification.repository";
import { EventType } from "../entities/TaskWatcherNotification.entity";
import { Historial } from "../entities/Historial.entity";

import {
  SubscribeWatcherDTO,
  UnsubscribeWatcherDTO,
  ListTaskWatchersResponseItem,
  WatchlistFiltersDTO,
  WatchlistItemDTO
} from "../dtos/TaskWatcher.dtos";

type ServiceResult<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; message: string };

export class TaskWatcherService {
  private watcherRepo = new TaskWatcherRepository();
  private notifRepo = new TaskWatcherNotificationRepository();
  private tareaRepo = AppDataSource.getRepository(Tarea);
  private usuarioRepo = AppDataSource.getRepository(Usuario);

  constructor(private maxWatchersPerTask = 50) {}

  // Suscribirse a una tarea (aplica reglas)
  // Suscribirse a una tarea (aplica reglas)
  // Suscribirse a una tarea (aplica reglas)
  async subscribe(dto: SubscribeWatcherDTO): Promise<ServiceResult<{ watcherId: string }>> {
    const { userId, taskId } = dto;

    // Validar existencia de usuario y tarea
    const [user, task] = await Promise.all([
        this.usuarioRepo.findOne({ where: { id: userId }, relations: ["equipos"] }),
        this.tareaRepo.findOne({ where: { id: taskId }, relations: ["equipo", "equipo.propietario"] })
    ]);

    if (!user) return { ok: false, status: 404, message: "Usuario no encontrado" };
    if (!task) return { ok: false, status: 404, message: "Tarea no encontrada" };

    // Regla: solo miembros del team o propietario (admin)
    const isAdmin = task.equipo && task.equipo.propietario.id === user.id;
    const isTeamMember = task.equipo
        ? (user.equipos || []).some(e => e.id === task.equipo.id)
        : false;

    if (!isAdmin && !isTeamMember) {
        return { ok: false, status: 403, message: "No pertenece al equipo de la tarea" };
    }

    // Regla: no duplicados
    const alreadyExists = await this.watcherRepo.exists(userId, taskId);
    if (alreadyExists) {
        return { ok: false, status: 409, message: "Ya estás suscripto a esta tarea" };
    }

    // Regla: máximo watchers por task
    const count = await this.watcherRepo.countByTask(taskId);
    if (count >= this.maxWatchersPerTask) {
        return { ok: false, status: 422, message: "Se alcanzó el máximo de watchers para la tarea" };
    }

    // Crear watcher
    const repo = AppDataSource.getRepository(TaskWatcher);
    const watcher = repo.create({ user, task });
    const saved = await repo.save(watcher);

    const historialRepo = AppDataSource.getRepository(Historial);
    const historial = historialRepo.create({
      tarea: task,
      usuario: user,
      cambio: `Usuario ${user.nombre} se suscribió a la tarea`
    });
    await historialRepo.save(historial);
    
    // Creo la notificacion
    await this.notifRepo.createNotification(watcher, EventType.SUBSCRIBE, {
      usuarioId: user.id,
      nombre: user.nombre
    });

    return { ok: true, data: { watcherId: saved.id } };
  }

  // Desuscribirse de una tarea
  async unsubscribe(dto: UnsubscribeWatcherDTO): Promise<ServiceResult<null>> {
    const { userId, taskId } = dto;

    const repo = AppDataSource.getRepository(TaskWatcher);
    const watcher = await repo.findOne({
      where: { user: { id: userId }, task: { id: taskId } }
    });

    if (!watcher) {
      // Regla: puede desuscribirse de algo no vigente (idempotente)
      return { ok: false, status: 404, message: "Suscripción no encontrada" };
    }

    await repo.remove(watcher);

    const historialRepo = AppDataSource.getRepository(Historial);
    const historial = historialRepo.create({
      tarea: watcher.task,
      usuario: watcher.user,
      cambio: `Usuario ${watcher.user.nombre} se desuscribió de la tarea`
    });
    await historialRepo.save(historial);

    return { ok: true, data: null };
  }

  // Listar watchers de una tarea (id, name, avatar, orden por fecha)
  async listTaskWatchers(taskId: string): Promise<ServiceResult<ListTaskWatchersResponseItem[]>> {
    const watchers = await this.watcherRepo.listByTask(taskId);
    const items: ListTaskWatchersResponseItem[] = watchers.map(w => ({
      id: w.id,
      userId: w.user.id,
      name: w.user.nombre, // ajustá al campo real
      avatar: (w.user.nombre || "?").charAt(0).toUpperCase(),
      subscribedAt: w.createdAt
    }));
    return { ok: true, data: items };
  }

  // Watchlist del usuario (paginada + filtros)
  async getUserWatchlist(
    userId: string,
    filters: WatchlistFiltersDTO,
    skip = 0,
    take = 20
  ): Promise<ServiceResult<{ items: WatchlistItemDTO[]; total: number }>> {
    const watchers = await this.watcherRepo.getUserWatchlist(
      userId,
      {
        status: filters.status as EstadoTarea | undefined,
        teamId: filters.teamId,
        updatedSince: filters.updatedSince
      },
      skip,
      take
    );

    // total (para paginación)
    const totalQb = AppDataSource.getRepository(TaskWatcher)
      .createQueryBuilder("watcher")
      .leftJoin("watcher.task", "task")
      .leftJoin("task.equipo", "equipo")
      .where("watcher.userId = :userId", { userId });

    if (filters.status) totalQb.andWhere("task.estado = :status", { status: filters.status });
    if (filters.teamId) totalQb.andWhere("equipo.id = :teamId", { teamId: filters.teamId });
    if (filters.updatedSince) totalQb.andWhere("task.fechaActualizacion > :updatedSince", { updatedSince: filters.updatedSince });

    const total = await totalQb.getCount();

    const items: WatchlistItemDTO[] = watchers.map(w => ({
      taskId: w.task.id,
      titulo: w.task.titulo,
      estado: w.task.estado,
      prioridad: w.task.prioridad,
      fechaActualizacion: w.task.fechaActualizacion,
      subscribedAt: w.createdAt
    }));

    return { ok: true, data: { items, total } };
  }

  // Hooks/Listeners: notificar a todos los watchers ante eventos de la tarea
  async onTaskEvent(taskId: string, eventType: EventType, payload: any) {
    await this.notifRepo.notifyTaskWatchers(taskId, eventType, payload);
  }
}
