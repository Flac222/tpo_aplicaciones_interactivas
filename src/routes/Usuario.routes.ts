import { Router } from "express";
import { crearUsuario, login } from "../controllers/Usuario.controller";

const router = Router();

router.post("/register", crearUsuario);
router.post("/login", login);

export default router;
