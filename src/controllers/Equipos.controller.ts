import { Request, Response } from "express";
import { EquipoService } from "../services/Equipo.service";

const equipoService = new EquipoService();

export async function crearEquipo(req: Request, res: Response) {
  try {
    const { nombre, propietarioId } = req.body;
    const equipo = await equipoService.crearEquipo(nombre, propietarioId);
    res.json(equipo);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

export async function invitarMiembro(req: Request, res: Response) {
  try {
    const { usuarioId, propietarioId } = req.body;
    const { id: equipoId } = req.params;
    const equipo = await equipoService.invitarMiembro(equipoId, usuarioId, propietarioId);
    res.json(equipo);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

export async function listarEquiposUsuario(req: Request, res: Response) {
  try {
    const { userId } = req.params;
    const equipos = await equipoService.listarEquiposUsuario(userId);
    res.json(equipos);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

export async function salirEquipo(req: Request, res: Response) {
  try {
    const { userId } = req.body;
    const { id: equipoId } = req.params;
    const equipo = await equipoService.salirEquipo(userId, equipoId);
    res.json({ message: "Saliste del equipo con éxito", equipo });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}


export async function borrarEquipo(req: Request, res: Response) {
  try {
    const { userId } = req.body;
    const { id: equipoId } = req.params;
    await equipoService.borrarEquipo(userId, equipoId);
    res.json({ message: "Equipo borrado con éxito" });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}
