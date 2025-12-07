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
    
    // Configuración base de la consulta
    const options: FindManyOptions<TaskTemplate> = {
      where: { creatorId },
      relations: ["team", "tagsAsociados", "tagsAsociados.etiqueta"],
      take: limit,
      skip: offset,
      order: { createdAt: "DESC" },
    };

    // Añadir filtro por TeamId (si se proporciona)
    if (teamId) {
        // Asegúrate de que TypeORM sepa manejar la columna teamId
        (options.where as any).teamId = teamId;
    }

    // Añadir búsqueda por nombre o descripción (si se proporciona)
    if (search) {
      const searchCondition = ILike(`%${search}%`); // Búsqueda parcial (case-insensitive)
      
      // Combinar las condiciones de búsqueda con las condiciones existentes (creatorId y teamId)
      // Se utiliza createQueryBuilder para manejo avanzado de OR/AND
      const query = this.repository
        .createQueryBuilder("template")
        .leftJoinAndSelect("template.team", "team")
        .leftJoinAndSelect("template.tagsAsociados", "templateTag")
        .leftJoinAndSelect("templateTag.etiqueta", "etiqueta")
        .where("template.creatorId = :creatorId", { creatorId })
        .orderBy("template.createdAt", "DESC")
        .take(limit)
        .skip(offset);
      
      // Aplicar filtro de búsqueda (OR entre name y description)
      query.andWhere(
          "(template.name ILike :search OR template.description ILike :search)",
          { search: `%${search}%` }
      );

      // Aplicar filtro de equipo (AND adicional)
      if (teamId) {
          query.andWhere("template.teamId = :teamId", { teamId });
      }

      return query.getManyAndCount();
    }
    
    // Si no hay búsqueda por texto, usamos la forma simple de `find`
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

  // U: Actualizar template (solo la entidad principal)
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