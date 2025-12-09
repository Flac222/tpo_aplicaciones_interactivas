// services/tareaService.ts
import AppDataSource from "../db/data-source";
import { Tarea, EstadoTarea, PrioridadTarea } from "../entities/Tareas.entity";
import { Usuario } from "../entities/Usuario.entity";
import { Equipo } from "../entities/Equipo.entity";
import { Historial } from "../entities/Historial.entity";
import { TareaRepository } from "../repositories/Tareas.repository";
import { TareaEtiqueta } from "../entities/TareasEtiqueta.entity";



export class TareaService {
  private tareaRepo = AppDataSource.getRepository(Tarea);
  private TareaRepository = new TareaRepository();
  private usuarioRepo = AppDataSource.getRepository(Usuario);
  private equipoRepo = AppDataSource.getRepository(Equipo);
  private historialRepo = AppDataSource.getRepository(Historial);
  private tareaEtiquetaRepo = AppDataSource.getRepository(TareaEtiqueta);

 
  async crearTarea(
    datosTarea: {
      titulo: string;
      descripcion?: string;
      equipoId: string;
      estado?: string;
      prioridad?: string;
    },
    creadorId: string,
    etiquetasId?: string[]
  ) {

   
    return AppDataSource.manager.transaction(async (transactionalEntityManager) => {


      const tareaRepo = transactionalEntityManager.getRepository(Tarea);
      const historialRepo = transactionalEntityManager.getRepository(Historial);
      const tareaEtiquetaRepo = transactionalEntityManager.getRepository(TareaEtiqueta);

     
      const creador = await this.usuarioRepo.findOneBy({ id: creadorId });
      if (!creador) throw new Error("Usuario no encontrado");

      const equipo = await this.equipoRepo.findOneBy({ id: datosTarea.equipoId });
      if (!equipo) throw new Error("Equipo no encontrado");

      
      const tarea = tareaRepo.create({
        titulo: datosTarea.titulo,
        descripcion: datosTarea.descripcion,
        creador: creador,
        equipo: equipo, 
        estado: (datosTarea.estado as EstadoTarea) || EstadoTarea.PENDIENTE,
        prioridad: (datosTarea.prioridad as PrioridadTarea) || PrioridadTarea.MEDIA
      });

     
      const tareaGuardada = await tareaRepo.save(tarea);

      
      const historial = historialRepo.create({
        tarea: tareaGuardada,
        usuario: creador,
        cambio: "Tarea creada"
      });
      await historialRepo.save(historial);

   
      
      if (etiquetasId && etiquetasId.length > 0) {

      
        const nuevasAsignaciones = etiquetasId.map(idDeEtiqueta => {
          return tareaEtiquetaRepo.create({
            tareaId: tareaGuardada.id, 
            etiquetaId: idDeEtiqueta,   
          });
        });


        await tareaEtiquetaRepo.save(nuevasAsignaciones);
      }


      return tareaGuardada;
    });
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
    limit: number = 10,
   
    etiquetaId?: string,
    q?: string
  ) {
    const query = AppDataSource.getRepository(Tarea)
      .createQueryBuilder("tarea")
      .leftJoinAndSelect("tarea.equipo", "equipo")
      .leftJoinAndSelect("tarea.historial", "historial")
      .leftJoinAndSelect("historial.usuario", "usuario")

  
      .leftJoinAndSelect("tarea.etiquetasAsignadas", "tareaEtiqueta")
      .leftJoinAndSelect("tareaEtiqueta.etiqueta", "etiqueta")

      .where("equipo.id = :equipoId", { equipoId });

    if (estado) query.andWhere("tarea.estado = :estado", { estado });
    if (prioridad) query.andWhere("tarea.prioridad = :prioridad", { prioridad });

   
    if (q) {
    
      query.andWhere(
        "(LOWER(tarea.titulo) LIKE LOWER(:q) OR LOWER(tarea.descripcion) LIKE LOWER(:q))",
        { q: `%${q}%` }
      );
    }

    
    if (etiquetaId) {
    
      query.andWhere(qb => {
        const subQuery = qb.subQuery()
          .select("te.tareaId")
          .from(TareaEtiqueta, "te") 
          .where("te.etiquetaId = :etiquetaId")
          .getQuery();
        return "tarea.id IN " + subQuery;
      }).setParameter("etiquetaId", etiquetaId); 
    }

  
    query.orderBy("tarea.fechaCreacion", "DESC")
      .skip((page - 1) * limit)
      .take(limit);

    const [tareas, total] = await query.getManyAndCount();

 

    const tareasTransformadas = tareas.map(tarea => {
     
      const etiquetas = tarea.etiquetasAsignadas
        ? tarea.etiquetasAsignadas.map(te => te.etiqueta).filter(Boolean) 
        : [];

      
      return {
        ...tarea,
        etiquetas: etiquetas, 
        etiquetasAsignadas: undefined, 
      };
    });


    return {
      tareas: tareasTransformadas, 
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
