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

    // extraemos solo los valores del enum
    const estadosValidos = Object.values(EstadoTarea) as string[];
    if (!estadosValidos.includes(nuevoEstado)) {
      return res.status(400).json({ error: "Estado inválido" });
    }

    const tarea = await tareaService.actualizarEstado(
      id,
      nuevoEstado as EstadoTarea,
      usuarioId
    );
    res.json(tarea);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}
export const listarTareasPorFiltro = async (req: Request, res: Response) => {
  const { equipoId } = req.params;
  const { estado, prioridad } = req.query;

  try {
    const tareas = await TareaService.listarPorEquipoYFiltro(
      equipoId,
      estado as any,
      prioridad as any
    );
    res.json(tareas);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(400).json({ error: "Unknown error" });
    }
  }
};