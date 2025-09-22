// services/tareaService.ts
import AppDataSource from "../db/data-source";
import { Tarea, EstadoTarea, PrioridadTarea } from "../entities/Tareas.entity";
import { Usuario } from "../entities/Usuario.entity";
import { Equipo } from "../entities/Equipo.entity";
import { Historial } from "../entities/Historial.entity";

export class TareaService {
  private tareaRepo = AppDataSource.getRepository(Tarea);
  private usuarioRepo = AppDataSource.getRepository(Usuario);
  private equipoRepo = AppDataSource.getRepository(Equipo);
  private historialRepo = AppDataSource.getRepository(Historial);

  async crearTarea(titulo: string, descripcion: string, creadorId: string, equipoId?: string) {
    const creador = await this.usuarioRepo.findOneBy({ id: creadorId });
    if (!creador) throw new Error("Usuario no encontrado");

    let equipo: Equipo | null = null;
    if (equipoId) {
      equipo = await this.equipoRepo.findOne({ where: { id: equipoId }, relations: ["miembros"] });
      if (!equipo) throw new Error("Equipo no encontrado");
    }

    const tarea = this.tareaRepo.create({
      titulo,
      descripcion,
      creador,
      equipo: equipo ?? undefined,
      estado: EstadoTarea.PENDIENTE,
      prioridad: PrioridadTarea.MEDIA
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
}
