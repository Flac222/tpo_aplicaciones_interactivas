import { AuthRequest } from "../middlewares/auth.middleware";
import { Response } from "express";
import { TaskWatcherNotificationService } from "../services/TaskWatcherNotification.service";
import { NotificationsQueryDTO } from "../dtos/taskWatcherNotification.dtos";

const notifService = new TaskWatcherNotificationService();

// Listar notificaciones no leídas (con filtros y paginación)
export async function listUnreadNotifications(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const { taskId, eventType, skip = "0", take = "20" } = req.query;

    const query: NotificationsQueryDTO = {
      taskId: taskId as string | undefined,
      eventType: eventType as any,
      skip: parseInt(skip as string),
      take: parseInt(take as string)
    };

    const result = await notifService.getUnread(userId, query);

    if (!result.ok) {
      return res.status(result.status).json({ error: result.message });
    }
    return res.json(result.data);
  } catch (err: any) {
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

// Marcar notificaciones como leídas (todas o filtradas por task)
export async function markNotificationsAsRead(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const { taskId } = req.body; // opcional

    const result = await notifService.markAsRead(userId, taskId);

    if (!result.ok) {
      return res.status(result.status).json({ error: result.message });
    }
    return res.json(result.data); // { affected: number }
  } catch (err: any) {
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}
