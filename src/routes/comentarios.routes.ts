import { Router } from "express";
import {
  crearComentario,
  listarComentariosTarea,
  editarComentario,
  borrarComentario
} from "../controllers/comentarios.controller";

const router = Router();

// Listar todos los comentarios de una tarea
router.get("/tareas/:tareaId/comentarios", listarComentariosTarea);

// Crear un nuevo comentario en una tarea
router.post("/tareas/:tareaId/comentarios", crearComentario);

// Editar un comentario
router.put("/comentarios/:id", editarComentario);

// Borrar un comentario
router.delete("/comentarios/:id", borrarComentario);

export default router;
