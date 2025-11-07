import { EquipoRepository } from "../repositories/Equipos.repository";
import { UsuarioRepository } from "../repositories/Usuario.repository";
import { Equipo } from "../entities/Equipo.entity";
import e from "express";

export class EquipoService {

  private equipoRepo: EquipoRepository;
  private usuarioRepo: UsuarioRepository;

  constructor() {
    this.equipoRepo = new EquipoRepository();
    this.usuarioRepo = new UsuarioRepository();
  }

  async crearEquipo(nombre: string, propietarioId: string) {
    const propietario = await this.usuarioRepo.findById(propietarioId);
    if (!propietario) throw new Error("Propietario no encontrado");

    const equipo = this.equipoRepo.create({ nombre, propietario, miembros: [propietario] });
    return equipo;
  }

  async invitarMiembro(equipoId: string, usuarioId: string, propietarioId: string): Promise<Equipo> {
    const equipo = await this.equipoRepo.findById(equipoId);
    if (!equipo) throw new Error("Equipo no encontrado");
    if (equipo.propietario.id !== propietarioId) throw new Error("No autorizado");

    const usuario = await this.usuarioRepo.findById(usuarioId);
    if (!usuario) throw new Error("Usuario no encontrado");

    // evitar duplicados
    if (equipo.miembros.find((m) => m.id === usuario.id)) {
      throw new Error("El usuario ya es miembro del equipo");
    }

    equipo.miembros.push(usuario);
    return this.equipoRepo.create(equipo); // 
  }

  async listarEquiposUsuario(userId: string) {
    const usuario = await this.usuarioRepo.findById(userId);
    if (!usuario) throw new Error("Usuario no encontrado");

    return this.equipoRepo.findByUser(usuario);
  }

  async salirEquipo(userId: string, equipoId: string) {
    const usuario = await this.usuarioRepo.findById(userId);
    const equipo = await this.equipoRepo.findById(equipoId);

    if (!usuario || !equipo) throw new Error("No encontrado");

    if (!equipo.miembros.find((m) => m.id === usuario.id)) {
      throw new Error("No sos miembro del equipo");
    }

    if (equipo.propietario.id === usuario.id) {
      throw new Error("El propietario no puede salir, solo borrar el equipo");
    }

    return this.equipoRepo.removeMember(equipo, usuario);
  }

  async borrarEquipo(userId: string, equipoId: string) {
    const equipo = await this.equipoRepo.findById(equipoId);
    if (!equipo) throw new Error("Equipo no encontrado");

    if (equipo.propietario.id !== userId) {
      throw new Error("Solo el propietario puede borrar el equipo");
    }

    return this.equipoRepo.delete(equipoId);
  }
}
