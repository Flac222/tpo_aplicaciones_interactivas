import { Router } from "express";
import { crearUsuario, login,actualizarUsuario,eliminarUsuario,obtenerMiPerfil } from "../controllers/Usuario.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();
router.get("/me", authMiddleware, obtenerMiPerfil);
router.post("/register",crearUsuario);
router.post("/login", login);
router.put("/:id", authMiddleware, actualizarUsuario);
router.delete("/:id", authMiddleware, eliminarUsuario);

export default router;
