// src/services/TaskTemplate.service.ts

// --- Clases de Error (Similar a ServiceError en etiquetas.service.ts)
class ServiceError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

// --- DTOs (Data Transfer Objects)

// 1. Input para Creación y Actualización
export interface TaskTemplateCreateUpdateDTO {
  name: string; // Requerido
  description?: string; 
  priority?: "Alta" | "Media" | "Baja"; 
  teamId?: string;
  tagIds: string[]; // Array de IDs de etiquetas
}

// 2. Output para Prellenado de Tarea 
export interface TaskPreFillDTO {
  title: string;
  description?: string;
  priority: "Alta" | "Media" | "Baja";
  teamId?: string;
  assignedToId?: string; 
  tagIds: string[];
  originTemplateId: string; // CLAVE para rastrear el origen
}

// 3. Output para Respuesta 
export interface TagResponseDTO {
    id: string;
    nombre: string;
    
}

export interface TaskTemplateResponseDTO {
    id: string;
    name: string;
    description?: string;
    priority: "Alta" | "Media" | "Baja";
    teamId?: string;
    teamName?: string;
    creatorId: string;
    creatorName: string;
    tags: TagResponseDTO[];
    createdAt: Date;
    updatedAt: Date;
}

// 4. Input para Listado 
export interface TaskTemplateListFilterDTO {
    teamId?: string;
    search?: string; 
    limit: number;
    offset: number;
}

import { TaskTemplateRepository } from "../repositories/TaskTemplates.repository";
import { TaskTemplateTagRepository } from "../repositories/TaskTemplatesTag.repository";
import { EtiquetasRepository } from "../repositories/etiquetas.repository";
import { EquipoRepository } from "../repositories/Equipos.repository";
import { Tarea} from "../entities/Tareas.entity";
import { PrioridadTarea } from "../entities/Enums";

export class TaskTemplateService {
  private taskTemplateRepo: TaskTemplateRepository;
  private taskTemplateTagRepo: TaskTemplateTagRepository;
  private etiquetasRepo: EtiquetasRepository;
  private equipoRepo: EquipoRepository;

  constructor() {
    this.taskTemplateRepo = new TaskTemplateRepository();
    this.taskTemplateTagRepo = new TaskTemplateTagRepository();
    this.etiquetasRepo = new EtiquetasRepository();
    this.equipoRepo = new EquipoRepository();
  }

  // --- LÓGICA AUXILIAR ---

  private mapToResponseDTO(template: Tarea | any): TaskTemplateResponseDTO {
    
    const tags = template.tagsAsociados
        ? template.tagsAsociados.map((tt: any) => ({
            id: tt.etiqueta.id,
            nombre: tt.etiqueta.nombre,
            
        }))
        : [];

    return {
        id: template.id,
        name: template.name,
        description: template.description,
        priority: template.priority,
        teamId: template.teamId || undefined,
        teamName: template.team?.nombre || undefined,
        creatorId: template.creatorId,
        creatorName: template.creator?.nombre || 'Desconocido', 
        tags,
        createdAt: template.createdAt,
        updatedAt: template.updatedAt,
    };
  }

  // --- MÉTODOS CRUD PRINCIPALES ---

  /**
   * 1. Listar templates con filtros y paginación 
   */
  async listarTemplates(
    creatorId: string,
    filters: TaskTemplateListFilterDTO
  ): Promise<{ templates: TaskTemplateResponseDTO[], total: number }> {
    
    const { teamId, search, limit, offset } = filters;

    const [templates, total] = await this.taskTemplateRepo.findFiltered(
      creatorId,
      teamId,
      search,
      limit,
      offset
    );

    const templatesDTO = templates.map(this.mapToResponseDTO);

    return { templates: templatesDTO, total };
  }
  
  /**
   * 2. Obtener template por ID 
   */
  async obtenerTemplatePorId(id: string): Promise<TaskTemplateResponseDTO> {
    const template = await this.taskTemplateRepo.findById(id);

    if (!template) {
      throw new ServiceError("Template no encontrada.", 404);
    }
    
    return this.mapToResponseDTO(template);
  }

  /**
   * 3. Crear una nueva template 
   */
  async crearTemplate(
    data: TaskTemplateCreateUpdateDTO,
    creatorId: string
  ): Promise<TaskTemplateResponseDTO> {
    
    // 1. Validación de Unicidad por Creador 
    const existing = await this.taskTemplateRepo.findByCreatorAndName(creatorId, data.name);
    if (existing) {
      throw new ServiceError(
        `Ya existe una template llamada '${data.name}' creada por ti.`,
        409 
      );
    }

    // 2. Validación de Tags (Requisito 4)
    if (data.tagIds && data.tagIds.length > 0) {
      const validTags = await this.etiquetasRepo.findByIds(data.tagIds);
      if (validTags.length !== data.tagIds.length) {
        throw new ServiceError("Uno o más IDs de etiquetas no son válidos.", 400);
      }
    }
    
    // 3. Validación de Equipo (opcional)
    let equipo = undefined;
    if (data.teamId) {
        equipo = await this.equipoRepo.findById(data.teamId);
        if (!equipo) {
            throw new ServiceError("El ID de equipo proporcionado no es válido.", 400);
        }
        // Se podría añadir una validación para asegurar que el creador pertenezca al equipo.
    }

    // 4. Creación de la entidad principal
    const newTemplate = await this.taskTemplateRepo.create({
      name: data.name,
      description: data.description,
      priority: data.priority as PrioridadTarea,
      creatorId: creatorId,
      team: equipo, // TypeORM manejará el objeto Equipo
    });

    // 5. Creación de las relaciones Tags (Requisito 1 y 2)
    const tagAssociations: any[] = [];
    if (data.tagIds) {
      for (const tagId of data.tagIds) {
        const association = await this.taskTemplateTagRepo.createAssociation(newTemplate.id, tagId);
        tagAssociations.push(association);
      }
    }

    // Retornar el objeto creado (debes cargarlo de nuevo o construirlo manualmente para incluir las tags)
    const templateWithTags = await this.taskTemplateRepo.findById(newTemplate.id);
    return this.mapToResponseDTO(templateWithTags);
  }

  /**
   * 4. Actualizar template (Requisito 2 y 4)
   */
  async actualizarTemplate(
    id: string,
    data: TaskTemplateCreateUpdateDTO,
    creatorId: string
  ): Promise<TaskTemplateResponseDTO> {
    
    const existingTemplate = await this.taskTemplateRepo.findById(id);
    if (!existingTemplate) {
      throw new ServiceError("Template no encontrada.", 404);
    }
    
    // 1. Validar que el usuario autenticado es el creador
    if (existingTemplate.creatorId !== creatorId) {
        throw new ServiceError("No tienes permiso para actualizar esta template.", 403);
    }

    // 2. Validación de Unicidad si se cambia el nombre
    if (data.name && data.name !== existingTemplate.name) {
      const existingWithName = await this.taskTemplateRepo.findByCreatorAndName(creatorId, data.name);
      // Debe existir *y* tener un ID diferente al que estamos actualizando
      if (existingWithName && existingWithName.id !== id) {
        throw new ServiceError(
          `Ya existe otra template llamada '${data.name}' creada por ti.`,
          409
        );
      }
    }

    // 3. Validación de Tags (Requisito 4)
    if (data.tagIds && data.tagIds.length > 0) {
      const validTags = await this.etiquetasRepo.findByIds(data.tagIds);
      if (validTags.length !== data.tagIds.length) {
        throw new ServiceError("Uno o más IDs de etiquetas no son válidos.", 400);
      }
    }

    // 4. Validación de Equipo
    let equipo: any = existingTemplate.team;
    if (data.teamId !== undefined) {
        if (data.teamId) {
            equipo = await this.equipoRepo.findById(data.teamId);
            if (!equipo) {
                throw new ServiceError("El ID de equipo proporcionado no es válido.", 400);
            }
        } else {
            // Si teamId es null/undefined en el DTO, se remueve el equipo
            equipo = undefined;
        }
    }

    // 5. Actualización de la entidad principal
    const updatedTemplate = await this.taskTemplateRepo.update(id, {
        ...data,
        team: equipo,
    } as any); // TypeORM maneja la actualización del campo 'updatedAt'

    if (!updatedTemplate) {
        throw new ServiceError("Error al actualizar la template.", 500);
    }


    // 6. Actualización de Tags (borrar y crear de nuevo)
    if (data.tagIds) {
        // Borrar todas las relaciones existentes
        await this.taskTemplateTagRepo.deleteByTemplateId(id);
        
        // Crear las nuevas relaciones
        for (const tagId of data.tagIds) {
            await this.taskTemplateTagRepo.createAssociation(id, tagId);
        }
    }

    // Retornar el objeto actualizado
    const templateWithTags = await this.taskTemplateRepo.findById(id);
    return this.mapToResponseDTO(templateWithTags);
  }

  /**
   * 5. Eliminar template 
   */
  async eliminarTemplate(id: string, creatorId: string): Promise<boolean> {
    const existingTemplate = await this.taskTemplateRepo.findById(id);
    if (!existingTemplate) {
      throw new ServiceError("Template no encontrada.", 404);
    }
    
    // Validar que el usuario autenticado es el creador
    if (existingTemplate.creatorId !== creatorId) {
        throw new ServiceError("No tienes permiso para eliminar esta template.", 403);
    }

    // La eliminación en cascada en la DB se encargará de TaskTemplateTag
    const deleted = await this.taskTemplateRepo.delete(id);
    
    if (!deleted) {
      throw new ServiceError("Error al eliminar la template.", 500);
    }
    
    return deleted;
  }
  
  /**
   * 6. Obtener datos para prellenar formulario de tareas 
   */
  async obtenerDatosPrellenado(id: string): Promise<TaskPreFillDTO> {
    const template = await this.taskTemplateRepo.findById(id);

    if (!template) {
      throw new ServiceError("Template de origen no encontrada.", 404);
    }

    // Extraer solo los IDs de las etiquetas
    const tagIds = template.tagsAsociados
        ? template.tagsAsociados.map((tt) => tt.etiqueta.id)
        : [];
        
    // Mapeo directo para el formulario de Tarea 
    return {
        title: template.name, 
        description: template.description,
        priority: template.priority,
        teamId: template.teamId || undefined,
        tagIds: tagIds,
        originTemplateId: template.id, 
    };
  }
}