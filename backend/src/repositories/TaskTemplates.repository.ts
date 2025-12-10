// src/repositories/TaskTemplate.repository.ts

import AppDataSource from "../db/data-source";
import { FindManyOptions, ILike, Repository } from "typeorm";
import { TaskTemplate } from "../entities/TaskTemplate.entity";

export class TaskTemplateRepository {
  private readonly repository: Repository<TaskTemplate>;

  constructor() {
    this.repository = AppDataSource.getRepository(TaskTemplate);
  }

  // R: Listar todas las templates del creador con filtros y paginación
  async findFiltered(
    creatorId: string,
    teamId?: string,
    search?: string,
    limit: number = 10,
    offset: number = 0
  ): Promise<[TaskTemplate[], number]> {
    
    
    const options: FindManyOptions<TaskTemplate> = {
      where: { creatorId },
      relations: ["team", "tagsAsociados", "tagsAsociados.etiqueta"],
      take: limit,
      skip: offset,
      order: { createdAt: "DESC" },
    };

    
    if (teamId) {
        
        (options.where as any).teamId = teamId;
    }

    // Añadir búsqueda por nombre o descripción 
    if (search) {
      const searchCondition = ILike(`%${search}%`); 
      
 
      const query = this.repository
        .createQueryBuilder("template")
        .leftJoinAndSelect("template.team", "team")
        .leftJoinAndSelect("template.tagsAsociados", "templateTag")
        .leftJoinAndSelect("templateTag.etiqueta", "etiqueta")
        .where("template.creatorId = :creatorId", { creatorId })
        .orderBy("template.createdAt", "DESC")
        .take(limit)
        .skip(offset);
      
      
      query.andWhere(
          "(template.name ILike :search OR template.description ILike :search)",
          { search: `%${search}%` }
      );

      
      if (teamId) {
          query.andWhere("template.teamId = :teamId", { teamId });
      }

      return query.getManyAndCount();
    }
    
    
    return this.repository.findAndCount(options);
  }

  // R: Obtener una template por ID
  async findById(id: string): Promise<TaskTemplate | null> {
    return this.repository.findOne({
      where: { id },
      relations: ["creator", "team", "tagsAsociados", "tagsAsociados.etiqueta"],
    });
  }

  // R: Verificar unicidad 
  async findByCreatorAndName(creatorId: string, name: string): Promise<TaskTemplate | null> {
      return this.repository.findOneBy({ 
          creatorId, 
          name 
      });
  }

  // C: Crear una nueva template 
  
  async create(data: Partial<TaskTemplate>): Promise<TaskTemplate> {
    const newTemplate = this.repository.create(data);
    return this.repository.save(newTemplate);
  }

  // U: Actualizar template 
  async update(id: string, data: Partial<TaskTemplate>): Promise<TaskTemplate | null> {
    const template = await this.findById(id);
    if (!template) return null;
    
    // Asegurarse de no sobrescribir el creador o ID
    delete data.creator;
    delete (data as any).creatorId;

    Object.assign(template, data);
    return this.repository.save(template);
  }

  // D: Eliminar template
  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected !== 0;
  }
}