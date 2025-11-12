import AppDataSource from "../db/data-source";
import { Repository } from "typeorm";
import { Equipo } from "../entities/Equipo.entity";
import { Usuario } from "../entities/Usuario.entity";

export class EquipoRepository {
  private readonly repository: Repository<Equipo>;

  constructor() {
    this.repository = AppDataSource.getRepository(Equipo);
  }

  // Listar todos los equipos con sus relaciones
  findAll(): Promise<Equipo[]> {
    return this.repository.find({ relations: ["miembros", "tareas"] });
  }

  // Crear un nuevo equipo
  create(equipo: Partial<Equipo>): Promise<Equipo> {
    const newEquipo = this.repository.create(equipo);
    return this.repository.save(newEquipo);
  }

  // Actualizar equipo
  async update(id: string, data: Partial<Equipo>): Promise<Equipo | null> {
    const equipo = await this.findById(id);
    if (!equipo) return null;

    Object.assign(equipo, data);
    return this.repository.save(equipo);
  }

  // Eliminar equipo por ID
  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected !== 0;
  }

  
  findById(id: string): Promise<Equipo | null> {
    return this.repository.findOne({
      where: { id },
      relations: ["propietario", "miembros", "tareas"],
    });
  }

  findByUser(usuario: Usuario): Promise<Equipo[]> {
    return this.repository
      .createQueryBuilder("equipo")
      .leftJoinAndSelect("equipo.miembros", "miembro")
      .leftJoinAndSelect("equipo.propietario", "propietario")
      .leftJoinAndSelect("equipo.tareas", "tarea")
      .where("miembro.id = :id OR propietario.id = :id", { id: usuario.id })
      .getMany();
  }

  async removeMember(equipo: Equipo, usuario: Usuario): Promise<Equipo> {
    equipo.miembros = equipo.miembros.filter((m) => m.id !== usuario.id);
    return this.repository.save(equipo);
  }
}

