
import AppDataSource from "../db/data-source";
import { EtiquetasRepository } from "../repositories/etiquetas.repository";
import { TareaEtiquetaRepository } from "../repositories/tareaEtiqueta.repository";
import { EquipoRepository } from "../repositories/Equipos.repository"; 
import { UsuarioRepository } from "../repositories/Usuario.repository"; 
import { TareaRepository } from "../repositories/Tareas.repository"; 
import { Etiqueta } from "../entities/Etiqueta.entity";
import { Historial } from "../entities/Historial.entity";
import { TaskWatcherService } from "./TaskWatcher.service";
import { EventType } from "../entities/TaskWatcherNotification.entity";


class ServiceError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

export class EtiquetasService {
  private etiquetaRepo: EtiquetasRepository;
  private tareaEtiquetaRepo: TareaEtiquetaRepository;
  private equipoRepo: EquipoRepository;
  private usuarioRepo: UsuarioRepository;
  private tareaRepo: TareaRepository; 

  constructor() {
    this.etiquetaRepo = new EtiquetasRepository();
    this.tareaEtiquetaRepo = new TareaEtiquetaRepository();
    this.equipoRepo = new EquipoRepository();
    this.usuarioRepo = new UsuarioRepository();
    
   
    this.tareaRepo = new TareaRepository(); 
  }

 
  private async esMiembro(equipoId: string, usuarioId: string): Promise<boolean> {
    const equipo = await this.equipoRepo.findById(equipoId);
    
    if (!equipo) {
        throw new ServiceError("Equipo no encontrado.", 404);
    }

    
    if (equipo.propietario.id === usuarioId) {
        return true;
    }

    const esMiembro = equipo.miembros.some(miembro => miembro.id === usuarioId);
    return esMiembro;
  }

 
  async createEtiqueta(equipoId: string, creadorId: string, nombre: string): Promise<Etiqueta> {
  
    const equipo = await this.equipoRepo.findById(equipoId);
    if (!equipo) {
      throw new ServiceError("Equipo no encontrado.", 404);
    }

    const creador = await this.usuarioRepo.findById(creadorId);
    if (!creador) {
        throw new ServiceError("Usuario creador no encontrado.", 404);
    }
    
 
    const esMiembro = await this.esMiembro(equipoId, creadorId);
    if (!esMiembro) {
        throw new ServiceError("Acceso denegado. El usuario no es miembro del equipo.", 403);
    }

   
    return this.etiquetaRepo.create(nombre, equipo, creador);
  }


  async getEtiquetasByEquipo(equipoId: string, usuarioId: string): Promise<Etiqueta[]> {

    const esMiembro = await this.esMiembro(equipoId, usuarioId);
    if (!esMiembro) {
        throw new ServiceError("Acceso denegado. El usuario no es miembro del equipo.", 403);
    }
    
 
    return this.etiquetaRepo.findByEquipoId(equipoId);
  }

  
  async updateEtiqueta(etiquetaId: string, usuarioId: string, nombre: string): Promise<Etiqueta> {
    const etiqueta = await this.etiquetaRepo.findById(etiquetaId);
    if (!etiqueta) {
      throw new ServiceError("Etiqueta no encontrada.", 404);
    }

    if (etiqueta.creador.id !== usuarioId) {
      throw new ServiceError("Acceso denegado. Solo el creador puede editar esta etiqueta.", 403);
    }

    return this.etiquetaRepo.update(etiqueta, nombre);
  }

 
  async deleteEtiqueta(etiquetaId: string, usuarioId: string): Promise<void> {
    const etiqueta = await this.etiquetaRepo.findById(etiquetaId);
    if (!etiqueta) {
      throw new ServiceError("Etiqueta no encontrada.", 404);
    }

   
    if (etiqueta.creador.id !== usuarioId) {
      throw new ServiceError("Acceso denegado. Solo el creador puede eliminar esta etiqueta.", 403);
    }

    await this.etiquetaRepo.delete(etiquetaId);
  }


  async asignarEtiqueta(tareaId: string, etiquetaId: string, usuarioId: string): Promise<any> {

    const tarea = await this.tareaRepo.findById(tareaId) as any; 
    if (!tarea || !tarea.equipo) {
        throw new ServiceError("Tarea no encontrada o no pertenece a un equipo.", 404);
    }
    const etiqueta = await this.etiquetaRepo.findById(etiquetaId);
    if (!etiqueta) {
        throw new ServiceError("Etiqueta no encontrada.", 404);
    }
   
    if (tarea.equipo.id !== etiqueta.equipo.id) {
        throw new ServiceError("La etiqueta no pertenece al equipo de esta tarea.", 400);
    }
   
    const esMiembro = await this.esMiembro(tarea.equipo.id, usuarioId);
    if (!esMiembro) {
        throw new ServiceError("Acceso denegado. El usuario no es miembro del equipo de la tarea.", 403);
    }
  
    const asignacionExistente = await this.tareaEtiquetaRepo.findOne(tareaId, etiquetaId);
    if (asignacionExistente) {
        return asignacionExistente; 
    }

    // Historial
    const usuario = await this.usuarioRepo.findById(usuarioId);

    if (!usuario) {
      throw new ServiceError("Usuario no encontrado.", 404);
    }

    const historialRepo = AppDataSource.getRepository(Historial);
    const historial = historialRepo.create({
      tarea: tarea,
      usuario: usuario,
      cambio: `Etiqueta "${etiqueta.nombre}" asignada a la tarea por ${usuario?.nombre}`
    });
    await historialRepo.save(historial);

    // Notificación
    const watcherService = new TaskWatcherService();
    await watcherService.onTaskEvent(
      tarea.id,
      EventType.ASSIGN_TAG,
      { etiquetaId: etiqueta.id, etiquetaNombre: etiqueta.nombre, usuarioId }
    );

    return this.tareaEtiquetaRepo.create(tareaId, etiquetaId);
  }


  async removerEtiqueta(tareaId: string, etiquetaId: string, usuarioId: string): Promise<void> {

    const tarea = await this.tareaRepo.findById(tareaId) as any;
    if (!tarea || !tarea.equipo) {
        throw new ServiceError("Tarea no encontrada o no pertenece a un equipo.", 404);
    }

    const esMiembro = await this.esMiembro(tarea.equipo.id, usuarioId);
    if (!esMiembro) {
        throw new ServiceError("Acceso denegado. El usuario no es miembro del equipo de la tarea.", 403);
    }

    const usuario = await this.usuarioRepo.findById(usuarioId);
    if (!usuario) {
      throw new ServiceError("Usuario no encontrado.", 404);
    }

    const etiqueta = await this.etiquetaRepo.findById(etiquetaId);

    const historialRepo = AppDataSource.getRepository(Historial);
    const historial = historialRepo.create({
      tarea: tarea,
      usuario: usuario,
      cambio: `Etiqueta "${etiqueta?.nombre}" removida de la tarea por ${usuario.nombre}`
    });
    await historialRepo.save(historial);

    // Notificación
    const watcherService = new TaskWatcherService();
    await watcherService.onTaskEvent(
      tarea.id,
      EventType.REMOVE_TAG,
      { etiquetaId, etiquetaNombre: etiqueta?.nombre, usuarioId }
    );

    await this.tareaEtiquetaRepo.delete(tareaId, etiquetaId);
  }
 
    async getEtiquetasByTarea(tareaId: string, usuarioId: string): Promise<Etiqueta[]> {
     
        const tarea = await this.tareaRepo.findById(tareaId) as any; 
        
        if (!tarea || !tarea.equipo) {
            throw new ServiceError("Tarea no encontrada o no pertenece a un equipo.", 404);
        }

        const equipoId = tarea.equipo.id;

       
        const esMiembro = await this.esMiembro(equipoId, usuarioId);
        if (!esMiembro) {
            throw new ServiceError("Acceso denegado. El usuario no es miembro del equipo de la tarea.", 403);
        }

       
        const relaciones = await this.tareaEtiquetaRepo.findByTareaId(tareaId);

        if (relaciones.length === 0) {
            return []; 
        }

        
        const etiquetaIds = relaciones.map(rel => rel.etiquetaId);

       
        const etiquetas = await this.etiquetaRepo.findByIds(etiquetaIds);

        return etiquetas;
    }

}