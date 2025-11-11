// src/modules/etiquetas/etiquetas.routes.ts (CORREGIDO)

import { Router } from "express";
import { EtiquetasController } from "../controllers/etiquetas.controller";
import { authMiddleware } from "../middlewares/auth.middleware"; 

const router = Router();
const controller = new EtiquetasController();

// APLICA EL MIDDLEWARE UNA SOLA VEZ A TODAS LAS RUTAS EN ESTE ARCHIVO
router.use(authMiddleware); 

// ** Rutas de Gestión de Etiquetas (Listar, Crear por Equipo) **
router.post(
  "/equipos/:equipoId/etiquetas",
  controller.createEtiqueta.bind(controller) // Aquí SÓLO va el Controller
);
router.get(
  "/equipos/:equipoId/etiquetas",
  controller.getEtiquetasByEquipo.bind(controller) // Aquí SÓLO va el Controller
);

// ** Rutas de Gestión de Etiquetas (Editar/Eliminar por ID) **
router.patch(
  "/etiquetas/:etiquetaId",
  controller.updateEtiqueta.bind(controller)
);
router.delete(
  "/etiquetas/:etiquetaId",
  controller.deleteEtiqueta.bind(controller)
);

// ** Rutas de Asignación a Tareas **
router.post(
  "/tareas/:tareaId/etiquetas/:etiquetaId",
  controller.asignarEtiqueta.bind(controller)
);
router.delete(
  "/tareas/:tareaId/etiquetas/:etiquetaId",
  controller.removerEtiqueta.bind(controller)
);

router.get(
    "/tareas/:tareaId/etiquetas",
    controller.getEtiquetasByTarea.bind(controller) // Añadida la nueva función
);
export default router;