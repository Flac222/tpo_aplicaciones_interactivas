import AppDataSource from "../db/data-source";
import { Repository } from "typeorm";
import { Comentario } from "../entities/Comentarios.entity";

export class ComentarioRepository {
  private readonly repository: Repository<Comentario>;

  constructor() {
    this.repository = AppDataSource.getRepository(Comentario);
  }

  // Listar todos los comentarios de una tarea
  findByTarea(tareaId: string): Promise<Comentario[]> {
    return this.repository.find({
      where: { tarea: { id: tareaId } },
      relations: ["autor", "tarea"],
      order: { fecha: "DESC" },
    });
  }

  // Buscar un comentario por ID
  findById(id: string): Promise<Comentario | null> {
    return this.repository.findOne({
      where: { id },
      relations: ["autor", "tarea"],
    });
  }

  //  Crear un nuevo comentario
  async create(data: Partial<Comentario>): Promise<Comentario> {
    const comentario = this.repository.create(data);
    return this.repository.save(comentario);
  }

  // Actualizar contenido del comentario
  async update(id: string, data: Partial<Comentario>): Promise<Comentario | null> {
    const comentario = await this.findById(id);
    if (!comentario) return null;
    Object.assign(comentario, data);
    return this.repository.save(comentario);
  }

  //  Eliminar comentario
  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected !== 0;
  }
}
