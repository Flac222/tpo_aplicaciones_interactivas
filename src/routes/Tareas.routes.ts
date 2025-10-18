import { Router } from "express";
import { crearTarea, actualizarEstado,listarTareasPorFiltro,eliminarTarea } from "../controllers/Tareas.controller";

const router = Router();

router.post("/", crearTarea);
router.get("/", listarTareasPorFiltro);
router.put("/:id/estado", actualizarEstado);
router.delete("/:id", eliminarTarea);

export default router;
