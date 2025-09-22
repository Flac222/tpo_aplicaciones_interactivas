// services/equipoService.ts
import  AppDataSource  from "../db/data-source";
import { Equipo } from "../entities/Equipo.entity";
import { Usuario } from "../entities/Usuario.entity";

export class EquipoService {
  private equipoRepo = AppDataSource.getRepository(Equipo);
  private usuarioRepo = AppDataSource.getRepository(Usuario);

  async crearEquipo(nombre: string, propietarioId: string) {
    const propietario = await this.usuarioRepo.findOneBy({ id: propietarioId });
    if (!propietario) throw new Error("Propietario no encontrado");

    const equipo = this.equipoRepo.create({ nombre, propietario, miembros: [propietario] });
    return await this.equipoRepo.save(equipo);
  }

  async invitarMiembro(equipoId: string, usuarioId: string, propietarioId: string) {
    const equipo = await this.equipoRepo.findOne({ where: { id: equipoId }, relations: ["propietario", "miembros"] });
    if (!equipo) throw new Error("Equipo no encontrado");
    if (equipo.propietario.id !== propietarioId) throw new Error("No autorizado");

    const usuario = await this.usuarioRepo.findOneBy({ id: usuarioId });
    if (!usuario) throw new Error("Usuario no encontrado");

    equipo.miembros.push(usuario);
    return await this.equipoRepo.save(equipo);
  }
}
