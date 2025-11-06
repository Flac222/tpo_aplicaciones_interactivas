import { Router } from "express";
import { ComentarioController } from "../controllers/comentarios.controller";

const router = Router();
const controller = new ComentarioController();

//GET: Listar todos los comentarios de una tarea
router.get("/tareas/:tareaId/comentarios", controller.listarPorTarea);

// POST: Crear comentario en una tarea
router.post("/tareas/:tareaId/comentarios", controller.crear);

// PUT: Editar comentario
router.put("/comentarios/:id", controller.editar);

// DELETE: Eliminar comentario
router.delete("/comentarios/:id", controller.eliminar);

export default router;
