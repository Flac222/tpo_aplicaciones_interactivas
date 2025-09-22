import { Router } from "express";
import { crearTarea, actualizarEstado } from "../controllers/Tareas.controller";

const router = Router();

router.post("/", crearTarea);
router.put("/:id/estado", actualizarEstado);

export default router;
