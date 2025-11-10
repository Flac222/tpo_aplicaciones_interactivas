
import  AppDataSource  from "../db/data-source";
import { Usuario } from "../entities/Usuario.entity";
import { UsuarioRepository } from "../repositories/Usuario.repository";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export class UsuarioService {
  private usuarioRepo = AppDataSource.getRepository(Usuario);
  private usuarioCustomRepo = new UsuarioRepository();
  // ... importaciones
// ...



  // 💡 NUEVO MÉTODO: Obtener usuario por ID
  async obtenerUsuarioPorId(id: string) {
    const usuario = await this.usuarioRepo.findOne({
      where: { id },
      // ⚠️ Importante: Excluye la contraseña de la respuesta
      select: ["id", "nombre", "email"], 
    });
    if (!usuario) throw new Error("Usuario no encontrado.");
    return usuario;
  }


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

    const token = jwt.sign({ id: usuario.id }, process.env.JWT_SECRET!, { expiresIn: "7d" });
    return { usuario, token };
  }

  async actualizarUsuario(id: string, data: Partial<Usuario>) {
    if (data.email) {
      const existe = await this.usuarioRepo.findOneBy({ email: data.email });
      if (existe && existe.id !== id) throw new Error("El email ya está en uso");
    }

    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }

    const actualizado = await this.usuarioCustomRepo.update(id, data);
    if (!actualizado) throw new Error("Usuario no encontrado");
    return actualizado;
  }

  async eliminarUsuario(id: string): Promise<boolean> {
    return await this.usuarioCustomRepo.delete(id);
  }
}



