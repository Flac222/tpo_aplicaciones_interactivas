import AppDataSource from "../db/data-source";
import { Repository } from "typeorm";
import { Tarea } from "../entities/Tarea.entity";

export class TareaRepository {
  private readonly repository: Repository<Tarea>;

  constructor() {
    this.repository = AppDataSource.getRepository(Tarea);
  }

  findAll(): Promise<Tarea[]> {
    return this.repository.find({ relations: ["usuario", "equipo"] });
  }

  findById(id: number): Promise<Tarea | null> {
    return this.repository.findOne({
      where: { id },
      relations: ["usuario", "equipo"],
    });
  }

  create(tarea: Partial<Tarea>): Promise<Tarea> {
    const newTarea = this.repository.create(tarea);
    return this.repository.save(newTarea);
  }

  update(id: number, data: Partial<Tarea>): Promise<Tarea | null> {
    return this.findById(id).then((tarea) => {
      if (!tarea) return null;
      Object.assign(tarea, data);
      return this.repository.save(tarea);
    });
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected !== 0;
  }
}
