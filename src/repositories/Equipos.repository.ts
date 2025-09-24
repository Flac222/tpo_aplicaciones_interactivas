import AppDataSource from "../db/data-source";
import { Repository } from "typeorm";
import { Equipo } from "../entities/Equipo.entity";

export class EquipoRepository {
  private readonly repository: Repository<Equipo>;

  constructor() {
    this.repository = AppDataSource.getRepository(Equipo);
  }

  findAll(): Promise<Equipo[]> {
    return this.repository.find({ relations: ["miembros", "tareas"] });
  }

  findById(id: number): Promise<Equipo | null> {
    return this.repository.findOne({
      where: { id: id.toString() },
      relations: ["miembros", "tareas"],
    });
  }

  create(equipo: Partial<Equipo>): Promise<Equipo> {
    const newEquipo = this.repository.create(equipo);
    return this.repository.save(newEquipo);
  }

  update(id: number, data: Partial<Equipo>): Promise<Equipo | null> {
    return this.findById(id).then((equipo) => {
      if (!equipo) return null;
      Object.assign(equipo, data);
      return this.repository.save(equipo);
    });
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected !== 0;
  }
}
