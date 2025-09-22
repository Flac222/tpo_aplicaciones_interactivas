import { Router } from "express";
import { crearEquipo, invitarMiembro } from "../controllers/Equipos.controller";

const router = Router();

router.post("/", crearEquipo);
router.post("/:id/invitar", invitarMiembro);

export default router;
