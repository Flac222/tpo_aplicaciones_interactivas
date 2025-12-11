import { Router } from "express";
import { crearTarea, actualizarEstado, listarTareasPorFiltro, eliminarTarea } from "../controllers/Tareas.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import {
  subscribeWatcher,
  unsubscribeWatcher,
  listTaskWatchers,
} from "../controllers/taskWatcher.controller";

const router = Router();

// Suscribirse a una tarea
router.post("/:tareaId/watchers", authMiddleware, subscribeWatcher);

// Desuscribirse de una tarea
router.delete("/:tareaId/watchers", authMiddleware, unsubscribeWatcher);

// Listar watchers de una tarea
router.get("/:tareaId/watchers", authMiddleware, listTaskWatchers);

router.post("/", authMiddleware, crearTarea);
router.get("/:equipoId", authMiddleware, listarTareasPorFiltro);
router.put("/:id/estado", authMiddleware, actualizarEstado);

router.delete("/:id/:userId", authMiddleware, eliminarTarea);

export default router;
