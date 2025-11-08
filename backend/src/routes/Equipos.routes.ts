import { Router } from "express";
import { 
  crearEquipo, 
  invitarMiembro, 
  listarEquiposUsuario, 
  salirEquipo, 
  borrarEquipo 
} from "../controllers/Equipos.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();


router.post("/:id", authMiddleware, crearEquipo);


router.post("/:id/invitar", authMiddleware,  invitarMiembro);


router.get("/equipos/:userId", authMiddleware, listarEquiposUsuario);


router.post("/:userid/salir", authMiddleware, salirEquipo);


router.delete("/:id", authMiddleware, borrarEquipo);

export default router;

