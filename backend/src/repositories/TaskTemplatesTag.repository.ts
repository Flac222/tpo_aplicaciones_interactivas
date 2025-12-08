// src/repositories/TaskTemplateTag.repository.ts

import { Repository } from "typeorm";
import AppDataSource from "../db/data-source";
import { TaskTemplateTag } from "../entities/TaskTemplateTag.entity"; 

export class TaskTemplateTagRepository {
  private repository: Repository<TaskTemplateTag>;

  constructor() {
    this.repository = AppDataSource.getRepository(TaskTemplateTag);
  }

  // C: Asignar una etiqueta a una template (Crear la relación)
  async createAssociation(templateId: string, etiquetaId: string): Promise<TaskTemplateTag> {
    const nuevaAsignacion = this.repository.create({
      templateId,
      etiquetaId,
    });
    // Se usa { reload: false } para mayor eficiencia
    return this.repository.save(nuevaAsignacion, { reload: false });
  }

  // D: Eliminar todas las etiquetas asociadas a una template
  // Este método es CLAVE para la lógica de actualización (UPDATE)
  async deleteByTemplateId(templateId: string): Promise<void> {
    await this.repository.delete({ templateId });
  }

  // R: Obtener todas las relaciones (TaskTemplateTag) por ID de Template
  async findByTemplateId(templateId: string): Promise<TaskTemplateTag[]> {
    return this.repository.findBy({ templateId });
  }
}