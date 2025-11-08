import { Router } from "express";
import {
  crearComentario,
  listarComentariosTarea,
  editarComentario,
  borrarComentario
} from "../controllers/comentarios.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

// Listar todos los comentarios de una tarea
router.get("/tareas/:tareaId/comentarios", authMiddleware, listarComentariosTarea);

// Crear un nuevo comentario en una tarea
router.post("/tareas/:tareaId/comentarios", authMiddleware, crearComentario);

// Editar un comentario
router.put("/comentarios/:id", authMiddleware, editarComentario);

// Borrar un comentario
router.delete("/comentarios/:id", authMiddleware, borrarComentario);

export default router;
