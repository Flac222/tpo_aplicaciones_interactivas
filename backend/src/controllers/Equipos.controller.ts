
import { AuthRequest } from "../middlewares/auth.middleware";
import { Response } from "express";
import { EquipoService } from "../services/Equipo.service";

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
    const { usuarioId } = req.body; 
    const { id: equipoId } = req.params;
  
    const propietarioId = req.user!.id; 

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
    const { id: equipoId } = req.params;
    const userId = req.user!.id; 

    const equipo = await equipoService.salirEquipo(userId, equipoId);
    res.json({ message: "Saliste del equipo con éxito", equipo });
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