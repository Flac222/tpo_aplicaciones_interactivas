import AppDataSource from "../db/data-source";
import { TaskWatcher } from "../entities/TaskWatcher.entity";
import { EstadoTarea } from "../entities/Tareas.entity";

export class TaskWatcherRepository {
  private repo = AppDataSource.getRepository(TaskWatcher);

  // Verificar si un usuario ya está suscripto a una tarea
  async exists(userId: string, taskId: string): Promise<boolean> {
    return await this.repo.count({
      where: { user: { id: userId }, task: { id: taskId } }
    }) > 0;
  }

  // Contar watchers de una tarea (para validar límite)
  async countByTask(taskId: string): Promise<number> {
    return await this.repo.count({ where: { task: { id: taskId } } });
  }

  // Listar watchers de una tarea ordenados por fecha de suscripción
  async listByTask(taskId: string) {
    return await this.repo.find({
      where: { task: { id: taskId } },
      relations: ["user"],
      order: { createdAt: "ASC" }
    });
  }

  // Watchlist de un usuario con filtros y paginación
  async getUserWatchlist(
    userId: string,
    filters: { status?: EstadoTarea; teamId?: string; updatedSince?: Date },
    skip = 0,
    take = 20
  ) {
    const qb = this.repo.createQueryBuilder("watcher")
      .leftJoinAndSelect("watcher.task", "task")
      .leftJoin("task.equipo", "equipo")
      .where("watcher.userId = :userId", { userId });

    if (filters.status) {
      qb.andWhere("task.estado = :status", { status: filters.status });
    }
    if (filters.teamId) {
      qb.andWhere("equipo.id = :teamId", { teamId: filters.teamId });
    }
    if (filters.updatedSince) {
      qb.andWhere("task.fechaActualizacion > :updatedSince", { updatedSince: filters.updatedSince });
    }

    return await qb.skip(skip).take(take).getMany();
  }
}
