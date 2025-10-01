// services/usuarioService.ts
import  AppDataSource  from "../db/data-source";
import { Usuario } from "../entities/Usuario.entity";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export class UsuarioService {
  private usuarioRepo = AppDataSource.getRepository(Usuario);

  async crearUsuario(nombre: string, email: string, password: string) {
    const existe = await this.usuarioRepo.findOneBy({ email });
    if (existe) throw new Error("El email ya está registrado");

    const hash = await bcrypt.hash(password, 10);
    const usuario = this.usuarioRepo.create({ nombre, email, password: hash });
    return await this.usuarioRepo.save(usuario);
  }

  async login(email: string, password: string) {
    const usuario = await this.usuarioRepo.findOneBy({ email });
    if (!usuario) throw new Error("Usuario no encontrado");

    const valido = await bcrypt.compare(password, usuario.password);
    if (!valido) throw new Error("Contraseña incorrecta");

    const token = jwt.sign({ id: usuario.id }, "SECRET", { expiresIn: "1d" });
    return { usuario, token };
  }

  async listarEquiposDelUsuario(usuarioId: string) {
    const usuario = await AppDataSource.getRepository(Usuario).findOne({
      where: { id: usuarioId },
      relations: ["equipos"]
    });

    if (!usuario) throw new Error("Usuario no encontrado");
    return usuario.equipos;
  }
}
