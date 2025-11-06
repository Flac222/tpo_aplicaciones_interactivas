import { Router } from "express";
import { crearUsuario, login,actualizarUsuario,eliminarUsuario } from "../controllers/Usuario.controller";

const router = Router();

router.post("/register", crearUsuario);
router.post("/login", login);
router.put("/:id", actualizarUsuario);
router.delete("/:id", eliminarUsuario);

export default router;
