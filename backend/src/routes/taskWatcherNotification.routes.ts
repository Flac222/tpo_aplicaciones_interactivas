import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import {
  listUnreadNotifications,
  markNotificationsAsRead
} from "../controllers/taskWatcherNotification.controller";

const router = Router();

// GET /api/notifications → listar notificaciones no leídas con filtros y paginación
router.get("/", authMiddleware, listUnreadNotifications);

// PUT /api/notifications/read → marcar como leídas (todas o filtradas por taskId)
router.put("/read", authMiddleware, markNotificationsAsRead);

export default router;
