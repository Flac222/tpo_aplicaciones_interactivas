
import { AuthRequest } from "../middlewares/auth.middleware";
import { Response } from "express";
import { EquipoService } from "../services/Equipo.service";
import AppDataSource from "../db/data-source";
import { Usuario } from "../entities/Usuario.entity";

const equipoService = new EquipoService();

export async function crearEquipo(req: AuthRequest, res: Response) {
  try {
    const { nombre } = req.body;
    const propietarioId = req.user!.id; 
    
    const equipo = await equipoService.crearEquipo(nombre, propietarioId);
    res.json(equipo);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

export async function invitarMiembro(req: AuthRequest, res: Response) {
  try {
    const { correo } = req.body; 
    const { id: equipoId } = req.params;
    const propietarioId = req.user!.id; 

    if (!correo) {
      return res.status(400).json({ error: "El correo es obligatorio." });
    }

    const usuarioRepository = AppDataSource.getRepository(Usuario);
    const usuarioAInvitar = await usuarioRepository.findOne({ where: { email: correo } });


    if (!usuarioAInvitar) {
  
      return res.status(404).json({ error: "No se encontró un usuario registrado con ese correo." });
    }

  
    const usuarioId = usuarioAInvitar.id;
    
  
    if (usuarioId === propietarioId) {
        return res.status(400).json({ error: "No puedes invitarte a ti mismo." });
    }

    const equipo = await equipoService.invitarMiembro(equipoId, usuarioId, propietarioId);
    
  
    res.json(equipo);

  } catch (err: any) {

    res.status(400).json({ error: err.message });
  }
}

export async function listarEquiposUsuario(req: AuthRequest, res: Response) {
  try {
    const { id: userId } = req.user!; 
    const equipos = await equipoService.listarEquiposUsuario(userId);
    res.json(equipos);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

export async function salirEquipo(req: AuthRequest, res: Response) {
  try {
    const { equipoid: equipoId } = req.params;
    const authenticatedUserId = req.user!.id; 

    const memberIdToRemove = req.body.userId || authenticatedUserId; 


    const equipo = await equipoService.salirEquipo(
      authenticatedUserId, 
      equipoId, 
      memberIdToRemove 
    );
    
    const isSelfExit = authenticatedUserId === memberIdToRemove;
    const message = isSelfExit 
      ? "Saliste del equipo con éxito" 
      : "Miembro removido del equipo con éxito";
      
    res.json({ message, equipo });
    
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

export async function borrarEquipo(req: AuthRequest, res: Response) {
  try {
    const { id: equipoId } = req.params;
    const userId = req.user!.id; 
    
    await equipoService.borrarEquipo(userId, equipoId);
    res.json({ message: "Equipo borrado con éxito" });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}