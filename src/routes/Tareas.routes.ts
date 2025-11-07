import { Router } from "express";
import { crearTarea, actualizarEstado,listarTareasPorFiltro,eliminarTarea } from "../controllers/Tareas.controller";

const router = Router();

router.post("/", crearTarea);
router.get("/:equipoId", listarTareasPorFiltro);
router.put("/:id/estado", actualizarEstado);
router.delete("/:id/:userId", eliminarTarea);

export default router;
