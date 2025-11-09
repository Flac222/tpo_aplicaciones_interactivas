// services/tareaService.ts
import AppDataSource from "../db/data-source";
import { Tarea, EstadoTarea, PrioridadTarea } from "../entities/Tareas.entity";
import { Usuario } from "../entities/Usuario.entity";
import { Equipo } from "../entities/Equipo.entity";
import { Historial } from "../entities/Historial.entity";
import { TareaRepository } from "../repositories/Tareas.repository";


export class TareaService {
  private tareaRepo = AppDataSource.getRepository(Tarea);
  private TareaRepository = new TareaRepository();
  private usuarioRepo = AppDataSource.getRepository(Usuario);
  private equipoRepo = AppDataSource.getRepository(Equipo);
  private historialRepo = AppDataSource.getRepository(Historial);

  async crearTarea(titulo: string, descripcion: string, creadorId: string, equipoId?: string, estado?: string, prioridad?: string) {
    const creador = await this.usuarioRepo.findOneBy({ id: creadorId });
    if (!creador) throw new Error("Usuario no encontrado");
    let equipo: Equipo | null = null;
    if (equipoId) {
      equipo = await this.equipoRepo.findOne({
        where: { id: equipoId },
        relations: ["miembros"]
      });
      if (!equipo) throw new Error("Equipo no encontrado");
    }

    const tarea = this.tareaRepo.create({
      titulo,
      descripcion,
      creador,
      equipo: equipoId ? { id: equipoId } as Equipo : undefined, // 
      estado: estado as EstadoTarea || EstadoTarea.PENDIENTE,
      prioridad: prioridad as PrioridadTarea || PrioridadTarea.MEDIA
    });

    await this.tareaRepo.save(tarea);

    const historial = this.historialRepo.create({
      tarea,
      usuario: creador,
      cambio: "Tarea creada"
    });
    await this.historialRepo.save(historial);

    return tarea;
  }

  async actualizarEstado(tareaId: string, nuevoEstado: EstadoTarea, usuarioId: string) {
    const tarea = await this.tareaRepo.findOne({ where: { id: tareaId }, relations: ["creador"] });
    if (!tarea) throw new Error("Tarea no encontrada");

    const usuario = await this.usuarioRepo.findOneBy({ id: usuarioId });
    if (!usuario) throw new Error("Usuario no encontrado");

    const estadoAnterior = tarea.estado;
    tarea.estado = nuevoEstado;
    await this.tareaRepo.save(tarea);

    const historial = this.historialRepo.create({
      tarea,
      usuario,
      cambio: `Estado cambiado de ${estadoAnterior} a ${nuevoEstado}`
    });
    await this.historialRepo.save(historial);

    return tarea;
  }

static async listarPorEquipoYFiltro(
  equipoId: string,
  estado?: EstadoTarea,
  prioridad?: PrioridadTarea,
  page: number = 1,
  limit: number = 10
) {
  const query = AppDataSource.getRepository(Tarea)
    .createQueryBuilder("tarea")
    .leftJoinAndSelect("tarea.equipo", "equipo")
    .leftJoinAndSelect("tarea.historial", "historial") 
    .where("equipo.id = :equipoId", { equipoId });

  if (estado) query.andWhere("tarea.estado = :estado", { estado });
  if (prioridad) query.andWhere("tarea.prioridad = :prioridad", { prioridad });

  query.skip((page - 1) * limit).take(limit);

  const [tareas, total] = await query.getManyAndCount();

  return {
    tareas,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  };
}



  async eliminarTareaService(tareaId: string, usuarioId: string): Promise<boolean> {
    const tarea = await this.tareaRepo.findOne({
      where: { id: tareaId },
      relations: ["equipo"]
    });

    if (!tarea) throw new Error("Tarea no encontrada");

    if (!tarea.equipo) throw new Error("La tarea no pertenece a ningún equipo");

    const equipo = await this.equipoRepo.findOne({
      where: { id: tarea.equipo.id },
      relations: ["propietario"]
    });

    if (!equipo) throw new Error("Equipo no encontrado");

    if (equipo.propietario.id !== usuarioId) {
      throw new Error("No tienes permisos para eliminar esta tarea");
    }


    return await this.TareaRepository.delete(tareaId);
  }
}
