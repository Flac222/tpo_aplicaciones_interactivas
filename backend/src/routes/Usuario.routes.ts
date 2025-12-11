import { Router } from "express";
import { crearUsuario, login,actualizarUsuario,eliminarUsuario,obtenerMiPerfil } from "../controllers/Usuario.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { getUserWatchlist } from "../controllers/taskWatcher.controller";

const router = Router();
router.get("/me", authMiddleware, obtenerMiPerfil);
router.post("/register",crearUsuario);
router.post("/login", login);
router.put("/:id", authMiddleware, actualizarUsuario);
router.delete("/:id", authMiddleware, eliminarUsuario);
// Watchlist del usuario autenticado (paginada + filtros)
router.get("/watchers/watchlist", authMiddleware, getUserWatchlist);

export default router;
