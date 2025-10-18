import AppDataSource from "../db/data-source";
import { Repository } from "typeorm";
import { Usuario } from "../entities/Usuario.entity";

export class UsuarioRepository {
  private readonly repository: Repository<Usuario>;

  constructor() {
    this.repository = AppDataSource.getRepository(Usuario);
  }

  findAll(): Promise<Usuario[]> {
    return this.repository.find();
  }

findById(id: string): Promise<Usuario | null> {
  return this.repository.findOne({ where: { id } });
}


  create(usuario: Partial<Usuario>): Promise<Usuario> {
    const newUsuario = this.repository.create(usuario);
    return this.repository.save(newUsuario);
  }

  update(id: number, data: Partial<Usuario>): Promise<Usuario | null> {
    return this.findById(id).then((usuario) => {
      if (!usuario) return null;
      Object.assign(usuario, data);
      return this.repository.save(usuario);
    });
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected !== 0;
  }
}
