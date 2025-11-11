import { Repository } from "typeorm";
import AppDataSource from "../db/data-source";
import { TareaEtiqueta } from "../entities/TareasEtiqueta.entity";

export class TareaEtiquetaRepository {
  private repository: Repository<TareaEtiqueta>;

  constructor() {
    this.repository = AppDataSource.getRepository(TareaEtiqueta);
  }

  // C: Asignar una etiqueta a una tarea (Crear la relación)
  async create(tareaId: string, etiquetaId: string): Promise<TareaEtiqueta> {
    const nuevaAsignacion = this.repository.create({
      tareaId,
      etiquetaId,
    });
    // Uso save con { reload: false } para evitar la consulta de joins, ya que PrimaryColumn es suficiente
    return this.repository.save(nuevaAsignacion, { reload: false });
  }

  // R: Verificar si la asignación ya existe
  async findOne(tareaId: string, etiquetaId: string): Promise<TareaEtiqueta | null> {
    return this.repository.findOneBy({ tareaId, etiquetaId });
  }

  // R: Obtener todas las relaciones (TareaEtiqueta) por ID de Tarea
  // 💡 NUEVO MÉTODO REQUERIDO POR EL SERVICE
  async findByTareaId(tareaId: string): Promise<TareaEtiqueta[]> {
    // Esto devolverá todas las filas de la tabla intermedia que tengan el 'tareaId'
    return this.repository.findBy({ tareaId });
  }

  // D: Remover una etiqueta de una tarea (Eliminar la relación)
  async delete(tareaId: string, etiquetaId: string): Promise<void> {
    await this.repository.delete({ tareaId, etiquetaId });
  }
}