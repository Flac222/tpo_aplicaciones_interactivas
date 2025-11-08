import { AuthRequest } from "../middlewares/auth.middleware"; // Importar
import { Response } from "express";
import { ComentarioService } from "../services/comentario.service";

const comentarioService = new ComentarioService();

export async function crearComentario(req: AuthRequest, res: Response) { // Usar AuthRequest
  try {
    const { tareaId } = req.params;
    const { contenido } = req.body;
    
    const autorId = req.user!.id; 
    
    const comentario = await comentarioService.crearComentario(tareaId, autorId, contenido);
    res.status(201).json(comentario);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

export async function editarComentario(req: AuthRequest, res: Response) { // Usar AuthRequest
  try {
    const { id } = req.params;
    const { contenido } = req.body;
    const usuarioId = req.user!.id; 

 
    const comentarioActualizado = await comentarioService.editarComentario(id, contenido); 
    res.json(comentarioActualizado);
  } catch (err: any) {
    // El servicio debería lanzar un error 403 (prohibido) si el usuario no es el autor
    res.status(400).json({ error: err.message });
  }
}

export async function borrarComentario(req: AuthRequest, res: Response) { // Usar AuthRequest
  try {
    const { id } = req.params;
    const usuarioId = req.user!.id; // Obtener usuario del token

    // Igualmente, el servicio debe verificar propiedad
    await comentarioService.eliminarComentario(id); 
    res.json({ message: "Comentario eliminado con éxito" });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

export async function listarComentariosTarea(req: AuthRequest, res: Response) {
  try {
    const { tareaId } = req.params;
    const usuarioId = req.user!.id; 

    const comentarios = await comentarioService.listarPorTarea(tareaId); 

    res.json(comentarios);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}