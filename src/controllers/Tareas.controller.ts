import { Request, Response } from "express";
import { TareaService } from "../services/Tareas.service";
import { EstadoTarea } from "../entities/Tareas.entity";

const tareaService = new TareaService();

export async function crearTarea(req: Request, res: Response) {
  try {
    const { titulo, descripcion, creadorId, equipoId, estado, prioridad } = req.body;
    const tarea = await tareaService.crearTarea(titulo, descripcion, creadorId, equipoId, estado, prioridad);
    res.json(tarea);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

export async function actualizarEstado(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { nuevoEstado, usuarioId } = req.body;

    if (!(nuevoEstado in EstadoTarea)) {
      return res.status(400).json({ error: "Estado inválido" });
    }

    const tarea = await tareaService.actualizarEstado(id, nuevoEstado as EstadoTarea, usuarioId);
    res.json(tarea);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}
