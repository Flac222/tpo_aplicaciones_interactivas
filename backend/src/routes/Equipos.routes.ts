import { Router } from "express";
import { 
  crearEquipo, 
  invitarMiembro, 
  listarEquiposUsuario, 
  salirEquipo, 
  borrarEquipo 
} from "../controllers/Equipos.controller";

const router = Router();


router.post("/:id", crearEquipo);


router.post("/:id/invitar", invitarMiembro);


router.get("/equipos/:userId", listarEquiposUsuario);


router.post("/:userid/salir", salirEquipo);


router.delete("/:id", borrarEquipo);

export default router;

