import { Request, Response } from "express";
import { ComentarioService } from "../services/comentario.service";

const comentarioService = new ComentarioService();

// Crear comentario en una tarea
export async function crearComentario(req: Request, res: Response) {
  try {
    const { tareaId } = req.params;
    const { autorId, contenido } = req.body;

    const comentario = await comentarioService.crearComentario(tareaId, autorId, contenido);
    res.status(201).json(comentario);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

// Listar todos los comentarios de una tarea
export async function listarComentariosTarea(req: Request, res: Response) {
  try {
    const { tareaId } = req.params;
    const comentarios = await comentarioService.listarPorTarea(tareaId);
    res.json(comentarios);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

// Editar contenido de un comentario
export async function editarComentario(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { contenido } = req.body;

    const comentarioActualizado = await comentarioService.editarComentario(id, contenido);
    res.json(comentarioActualizado);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

// Eliminar comentario
export async function borrarComentario(req: Request, res: Response) {
  try {
    const { id } = req.params;
    await comentarioService.eliminarComentario(id);
    res.json({ message: "Comentario eliminado con éxito" });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}
