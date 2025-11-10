import { Repository } from "typeorm";
import AppDataSource from "../db/data-source";
import { Etiqueta } from "../entities/Etiqueta.entity";
import { Usuario } from "../entities/Usuario.entity";
import { Equipo } from "../entities/Equipo.entity";

export class EtiquetasRepository {
  private repository: Repository<Etiqueta>;

  constructor() {
    this.repository = AppDataSource.getRepository(Etiqueta);
  }

  // C: Crear una nueva etiqueta
  async create(nombre: string, equipo: Equipo, creador: Usuario): Promise<Etiqueta> {
    const nuevaEtiqueta = this.repository.create({
      nombre,
      equipo,
      creador,
    });
    return this.repository.save(nuevaEtiqueta);
  }

  // R: Obtener una etiqueta por ID
  async findById(id: string): Promise<Etiqueta | null> {
    return this.repository.findOne({
      where: { id },
      relations: ["equipo", "creador"],
    });
  }

  // R: Obtener todas las etiquetas de un equipo
  async findByEquipoId(equipoId: string): Promise<Etiqueta[]> {
    return this.repository.find({
      where: { equipo: { id: equipoId } },
      relations: ["creador"],
    });
  }

  // U: Actualizar una etiqueta
  async update(etiqueta: Etiqueta, nombre: string): Promise<Etiqueta> {
    etiqueta.nombre = nombre;
    return this.repository.save(etiqueta);
  }

  // D: Eliminar una etiqueta
  async delete(etiquetaId: string): Promise<void> {
    await this.repository.delete(etiquetaId);
  }
}