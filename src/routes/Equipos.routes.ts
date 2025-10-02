import { Router } from "express";
import { 
  crearEquipo, 
  invitarMiembro, 
  listarEquiposUsuario, 
  salirEquipo, 
  borrarEquipo 
} from "../controllers/Equipos.controller";

const router = Router();


router.post("/", crearEquipo);


router.post("/:id/invitar", invitarMiembro);


router.get("/usuario/:userId", listarEquiposUsuario);


router.post("/:id/salir", salirEquipo);


router.delete("/:id", borrarEquipo);

export default router;

