import { AuthRequest } from "../middlewares/auth.middleware"; 
import { Response } from "express";
import { TareaService } from "../services/Tareas.service";
import { EstadoTarea } from "../entities/Tareas.entity";

const tareaService = new TareaService();

export async function crearTarea(req: AuthRequest, res: Response) { 
  try {

    const { titulo, descripcion, equipoId, estado, prioridad } = req.body;
    
    const creadorId = req.user!.id; 
    

    
    const tarea = await tareaService.crearTarea(titulo, descripcion, creadorId, equipoId, estado, prioridad);
    res.json(tarea);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}


export const listarTareasPorFiltro = async (req: AuthRequest, res: Response) => { 
  const { equipoId } = req.params;
  const { estado, prioridad } = req.query; 
  const usuarioId = req.user!.id; 

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
export async function actualizarEstado(req: AuthRequest, res: Response) { 
  try {
    const { id } = req.params;
    const { nuevoEstado } = req.body;
    

    const usuarioId = req.user!.id; 


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

export async function eliminarTarea(req: AuthRequest, res: Response) { 
  const { id } = req.params;
  const usuarioId = req.user!.id; 

  try {
    const resultado = await tareaService.eliminarTareaService(id, usuarioId);
    res.json({ eliminado: resultado });
  } catch (err: any) {
    res.status(403).json({ error: err.message });
  }
}