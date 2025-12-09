// src/modules/etiquetas/etiquetas.routes.ts 

import { Router } from "express";
import { EtiquetasController } from "../controllers/etiquetas.controller";
import { authMiddleware } from "../middlewares/auth.middleware"; 

const router = Router();
const controller = new EtiquetasController();


router.use(authMiddleware); 


router.post(
  "/equipos/:equipoId/etiquetas",
  controller.createEtiqueta.bind(controller) 
);
router.get(
  "/equipos/:equipoId/etiquetas",
  controller.getEtiquetasByEquipo.bind(controller) 
);


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
    controller.getEtiquetasByTarea.bind(controller) 
);
export default router;