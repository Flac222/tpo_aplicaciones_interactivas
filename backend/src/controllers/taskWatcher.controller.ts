import { AuthRequest } from "../middlewares/auth.middleware";
import { Response } from "express";
import { TaskWatcherService } from "../services/TaskWatcher.service";
import {
  SubscribeWatcherDTO,
  UnsubscribeWatcherDTO,
  WatchlistFiltersDTO
} from "../dtos/TaskWatcher.dtos";

const watcherService = new TaskWatcherService();

// Suscribirse a una tarea
export async function subscribeWatcher(req: AuthRequest, res: Response) {
  try {
    const { tareaId } = req.params;
    const userId = req.user!.id;

    const dto: SubscribeWatcherDTO = { userId, taskId: tareaId };
    const result = await watcherService.subscribe(dto);

    if (!result.ok) {
      return res.status(result.status).json({ error: result.message });
    }
    return res.status(201).json(result.data);
  } catch (err: any) {
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

// Desuscribirse de una tarea
export async function unsubscribeWatcher(req: AuthRequest, res: Response) {
  try {
    const { tareaId } = req.params;
    const userId = req.user!.id;

    const dto: UnsubscribeWatcherDTO = { userId, taskId: tareaId };
    const result = await watcherService.unsubscribe(dto);

    if (!result.ok) {
      return res.status(result.status).json({ error: result.message });
    }
    return res.status(204).send(); // No Content
  } catch (err: any) {
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

// Listar watchers de una tarea
export async function listTaskWatchers(req: AuthRequest, res: Response) {
  try {
    const { tareaId } = req.params;
    const result = await watcherService.listTaskWatchers(tareaId);

    if (!result.ok) {
      return res.status(result.status).json({ error: result.message });
    }
    return res.json(result.data);
  } catch (err: any) {
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

// Obtener watchlist del usuario autenticado
export async function getUserWatchlist(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const { status, teamId, updatedSince, page = "1", limit = "20" } = req.query;

    const filters: WatchlistFiltersDTO = {
      status: status as string | undefined,
      teamId: teamId as string | undefined,
      updatedSince: updatedSince ? new Date(updatedSince as string) : undefined
    };

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const take = parseInt(limit as string);

    const result = await watcherService.getUserWatchlist(userId, filters, skip, take);

    if (!result.ok) {
      return res.status(result.status).json({ error: result.message });
    }
    return res.json(result.data);
  } catch (err: any) {
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}
