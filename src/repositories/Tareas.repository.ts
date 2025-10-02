import AppDataSource from "../db/data-source";
import { Repository } from "typeorm";
import { Tarea } from "../entities/Tareas.entity";
import { Equipo } from "../entities/Equipo.entity";

export class TareaRepository {
  private readonly repository: Repository<Tarea>;

  constructor() {
    this.repository = AppDataSource.getRepository(Tarea);
  }

  findAll(): Promise<Tarea[]> {
    return this.repository.find({ relations: ["usuario", "equipo"] });
  }

  findById(id: string): Promise<Tarea | null> {
    return this.repository.findOne({
      where: { id : id.toString() },
      relations: ["usuario", "equipo"],
    });
  }

create(tarea: Partial<Tarea>): Promise<Tarea> {
  if (tarea.equipo && typeof tarea.equipo === "object" && "id" in tarea.equipo) {
    tarea.equipo = { id: tarea.equipo.id } as Equipo; // solo pasás el ID
  }

  const newTarea = this.repository.create(tarea);
  return this.repository.save(newTarea);
}


update(id: string, data: Partial<Tarea>): Promise<Tarea | null> {
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
