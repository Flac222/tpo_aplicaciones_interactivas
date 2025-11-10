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

 // NO LO HAGAS EN EL FRONT. ESTO ES UN EJEMPLO DE CÓMO SE VE EL BACKEND SI USAS UN SOLO ENDPOINT
// Asumo que 'Usuario' es el tipo que devuelve tu usuarioRepo.findById
// Y que tienes acceso a tu usuarioRepo.

async salirEquipo(authenticatedUserId: string, equipoId: string, memberIdToRemove: string) {
    const equipo = await this.equipoRepo.findById(equipoId);
    
    if (!equipo) throw new Error("Equipo no encontrado");

    const usuarioARemover = await this.usuarioRepo.findById(memberIdToRemove); 
    if (!usuarioARemover) throw new Error("Usuario a remover no encontrado.");

    if (!equipo.miembros.find((m) => m.id === usuarioARemover.id)) {
        throw new Error("El usuario no es miembro del equipo.");
    }
    
    if (authenticatedUserId === memberIdToRemove) {
        if (equipo.propietario.id === authenticatedUserId) {
            throw new Error("El propietario no puede salir, solo borrar el equipo.");
        }
        
        return this.equipoRepo.removeMember(equipo, usuarioARemover); 
        
    } 

    else {
        if (equipo.propietario.id !== authenticatedUserId) {
            throw new Error("No tienes permiso para remover a otros miembros.");
        }
        
        if (equipo.propietario.id === memberIdToRemove) {
             throw new Error("El propietario no puede ser removido por esta vía.");
        }
        
        return this.equipoRepo.removeMember(equipo, usuarioARemover);
    }
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
