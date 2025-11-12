import { AuthRequest } from "../middlewares/auth.middleware";
import { Response } from "express";
import { TareaService } from "../services/Tareas.service";
import { EstadoTarea } from "../entities/Tareas.entity";

const tareaService = new TareaService();

export async function crearTarea(req: AuthRequest, res: Response) {
  try {
    // 1. Desestructuramos *todo* del body, incluyendo 'etiquetasId'
    const {
      titulo,
      descripcion,
      equipoId,
      estado,
      prioridad,
      etiquetasId // <--- ¡AQUÍ ESTÁ! (Será un array de IDs o undefined)
    } = req.body;

    const creadorId = req.user!.id;

    // 2. Validamos lo mínimo necesario
    if (!titulo || !equipoId) {
      return res.status(400).json({ error: "Título y EquipoID son obligatorios" });
    }

    // 3. Agrupamos los datos de la tarea en un objeto
    const datosTarea = {
      titulo,
      descripcion,
      equipoId,
      estado,
      prioridad
    };

    // 4. Llamamos al servicio con los argumentos correctos
    const tarea = await tareaService.crearTarea(
      datosTarea,
      creadorId,
      etiquetasId // <--- Pasamos el array de IDs al servicio
    );

    res.status(201).json(tarea); // Usamos 201 (Created) que es más correcto
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}


// En tu archivo de controller de tareas (ej: TareaController.ts)
// Asegúrate de importar TareaService y TareaEtiqueta si es necesario

export const listarTareasPorFiltro = async (req: AuthRequest, res: Response) => {
  const { equipoId } = req.params;

  // 💡 CAMBIO: Extraemos 'etiquetaId' y 'q' (para búsqueda de texto)
  const {
    estado,
    prioridad,
    page = "1",
    limit = "10",
    etiquetaId,
    q
  } = req.query;

  const usuarioId = req.user!.id; // (No se usa aquí, pero está bien tenerlo)

  try {
    const tareasPaginadas = await TareaService.listarPorEquipoYFiltro(
      equipoId,
      estado as any,
      prioridad as any,
      parseInt(page as string),
      parseInt(limit as string),
      // 💡 CAMBIO: Pasamos los nuevos parámetros al servicio
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