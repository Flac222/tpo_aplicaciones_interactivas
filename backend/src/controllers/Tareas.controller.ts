import { AuthRequest } from "../middlewares/auth.middleware";
import { Response } from "express";
import { TareaService } from "../services/Tareas.service";
import { EstadoTarea } from "../entities/Tareas.entity";

const tareaService = new TareaService();

export async function crearTarea(req: AuthRequest, res: Response) {
  try {
   
    const {
      titulo,
      descripcion,
      equipoId,
      estado,
      prioridad,
      etiquetasId 
    } = req.body;

    const creadorId = req.user!.id;

    
    if (!titulo || !equipoId) {
      return res.status(400).json({ error: "Título y EquipoID son obligatorios" });
    }

    const datosTarea = {
      titulo,
      descripcion,
      equipoId,
      estado,
      prioridad
    };

   
    const tarea = await tareaService.crearTarea(
      datosTarea,
      creadorId,
      etiquetasId 
    );

    res.status(201).json(tarea); 
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}




export const listarTareasPorFiltro = async (req: AuthRequest, res: Response) => {
  const { equipoId } = req.params;


  const {
    estado,
    prioridad,
    page = "1",
    limit = "10",
    etiquetaId,
    q
  } = req.query;

  const usuarioId = req.user!.id; 

  try {
    const tareasPaginadas = await TareaService.listarPorEquipoYFiltro(
      equipoId,
      estado as any,
      prioridad as any,
      parseInt(page as string),
      parseInt(limit as string),
      
      etiquetaId as string | undefined,
      q as string | undefined
    );
    res.json(tareasPaginadas);
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : "Unknown error" });
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