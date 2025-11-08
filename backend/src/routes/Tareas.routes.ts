import { Router } from "express";
import { crearTarea, actualizarEstado,listarTareasPorFiltro,eliminarTarea } from "../controllers/Tareas.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.post("/", authMiddleware, crearTarea);
router.get("/:equipoId", authMiddleware, listarTareasPorFiltro);
router.put("/:id/estado", authMiddleware, actualizarEstado);
router.delete("/:id/:userId", authMiddleware, eliminarTarea);

export default router;
