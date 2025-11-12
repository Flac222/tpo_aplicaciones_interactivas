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

  /**
   * 1. Cambiamos la firma de la función para aceptar los nuevos argumentos
   */
  async crearTarea(
    datosTarea: {
      titulo: string;
      descripcion?: string;
      equipoId: string;
      estado?: string;
      prioridad?: string;
    },
    creadorId: string,
    etiquetasId?: string[] // 👈 Recibimos el array de IDs (puede ser undefined)
  ) {

    /**
     * 2. Usamos una transacción para asegurar la integridad de los datos
     */
    return AppDataSource.manager.transaction(async (transactionalEntityManager) => {

      // Obtenemos los repositorios que SÍ van a escribir en la transacción
      const tareaRepo = transactionalEntityManager.getRepository(Tarea);
      const historialRepo = transactionalEntityManager.getRepository(Historial);
      const tareaEtiquetaRepo = transactionalEntityManager.getRepository(TareaEtiqueta);

      // 3. Validamos creador y equipo (podemos usar los repos de 'this' para leer)
      const creador = await this.usuarioRepo.findOneBy({ id: creadorId });
      if (!creador) throw new Error("Usuario no encontrado");

      const equipo = await this.equipoRepo.findOneBy({ id: datosTarea.equipoId });
      if (!equipo) throw new Error("Equipo no encontrado");

      // 4. Creamos la entidad Tarea
      const tarea = tareaRepo.create({
        titulo: datosTarea.titulo,
        descripcion: datosTarea.descripcion,
        creador: creador,
        equipo: equipo, // Asignamos la entidad 'equipo' completa
        estado: (datosTarea.estado as EstadoTarea) || EstadoTarea.PENDIENTE,
        prioridad: (datosTarea.prioridad as PrioridadTarea) || PrioridadTarea.MEDIA
      });

      // 5. Guardamos la Tarea (usando la transacción)
      // Esto es vital para que 'tarea.id' se genere
      const tareaGuardada = await tareaRepo.save(tarea);

      // 6. Creamos y guardamos el Historial (usando la transacción)
      const historial = historialRepo.create({
        tarea: tareaGuardada,
        usuario: creador,
        cambio: "Tarea creada"
      });
      await historialRepo.save(historial);

      /**
       * 7. Lógica para guardar etiquetas (¡LA PARTE CLAVE!)
       * Verificamos si 'etiquetasId' existe y si tiene elementos.
       * Si el usuario no seleccionó etiquetas, 'etiquetasId' será [] o undefined,
       * por lo que este bloque se omitirá (que es lo que quieres).
       */
      if (etiquetasId && etiquetasId.length > 0) {

        // Creamos las entidades de la tabla intermedia
        const nuevasAsignaciones = etiquetasId.map(idDeEtiqueta => {
          return tareaEtiquetaRepo.create({
            tareaId: tareaGuardada.id, // ID de la tarea que acabamos de guardar
            etiquetaId: idDeEtiqueta,   // ID de la etiqueta del bucle
          });
        });

        // Guardamos todas las asignaciones (usando la transacción)
        await tareaEtiquetaRepo.save(nuevasAsignaciones);
      }

      // 8. Devolvemos la tarea creada
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
    // 💡 CAMBIO: Añadimos los nuevos parámetros opcionales
    etiquetaId?: string,
    q?: string
  ) {
    const query = AppDataSource.getRepository(Tarea)
      .createQueryBuilder("tarea")
      .leftJoinAndSelect("tarea.equipo", "equipo")
      .leftJoinAndSelect("tarea.historial", "historial")
      .leftJoinAndSelect("historial.usuario", "usuario")

      // 💡 CAMBIO 1: Carga anticipada de etiquetas
      // Cargamos la relación intermedia Y la entidad Etiqueta final
      .leftJoinAndSelect("tarea.etiquetasAsignadas", "tareaEtiqueta")
      .leftJoinAndSelect("tareaEtiqueta.etiqueta", "etiqueta")

      .where("equipo.id = :equipoId", { equipoId });

    if (estado) query.andWhere("tarea.estado = :estado", { estado });
    if (prioridad) query.andWhere("tarea.prioridad = :prioridad", { prioridad });

    // 💡 CAMBIO 2: Filtro por texto (búsqueda 'q')
    if (q) {
      // Usamos LOWER para búsqueda case-insensitive (funciona en Postgres, MySQL, etc.)
      query.andWhere(
        "(LOWER(tarea.titulo) LIKE LOWER(:q) OR LOWER(tarea.descripcion) LIKE LOWER(:q))",
        { q: `%${q}%` } // % son wildcards
      );
    }

    // 💡 CAMBIO 3: Filtro por Etiqueta (usando subquery)
    if (etiquetaId) {
      // Añadimos un filtro que dice: "donde el ID de la tarea exista en
      // esta subconsulta que busca en TareaEtiqueta"
      query.andWhere(qb => {
        const subQuery = qb.subQuery()
          .select("te.tareaId")
          .from(TareaEtiqueta, "te") // Usamos la Entidad
          .where("te.etiquetaId = :etiquetaId")
          .getQuery();
        return "tarea.id IN " + subQuery;
      }).setParameter("etiquetaId", etiquetaId); // Asignamos el parámetro a la query principal
    }

    // Paginación y orden (buena práctica añadir un orden)
    query.orderBy("tarea.fechaCreacion", "DESC")
      .skip((page - 1) * limit)
      .take(limit);

    const [tareas, total] = await query.getManyAndCount();

    // 💡 CAMBIO 4: Transformación de la respuesta
    // El frontend (TareaCard) espera 'tarea.etiquetas: Etiqueta[]'
    // pero la BD nos dio 'tarea.etiquetasAsignadas: TareaEtiqueta[]'

    const tareasTransformadas = tareas.map(tarea => {
      // Mapeamos la data de la tabla intermedia a un array plano de Etiqueta
      const etiquetas = tarea.etiquetasAsignadas
        ? tarea.etiquetasAsignadas.map(te => te.etiqueta).filter(Boolean) // filter(Boolean) por si alguna relación está rota
        : [];

      // Devolvemos la tarea con el formato que espera el frontend
      return {
        ...tarea,
        etiquetas: etiquetas, // Array de Etiqueta (lo que TareaCard espera)
        etiquetasAsignadas: undefined, // Opcional: limpiar para no enviar data extra
      };
    });


    return {
      tareas: tareasTransformadas, // 👈 Enviamos las tareas transformadas
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
