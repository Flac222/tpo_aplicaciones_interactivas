import { Request, Response } from "express";
import { EtiquetasService } from "../services/etiquetas.service";
import { AuthRequest } from "../middlewares/auth.middleware";

class ServiceError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

export class EtiquetasController {
  private service: EtiquetasService;

  constructor() {
    this.service = new EtiquetasService();
  }

  // Manejador de errores centralizado
  private handleError(res: Response, error: any): Response {
    const statusCode = error instanceof ServiceError ? error.statusCode : 500;
    const message = error.message || "Error interno del servidor.";
    
    // Si es un error 500, loguear para depuración
    if (statusCode === 500) {
        console.error("Error en el controlador de etiquetas:", error);
    }

    return res.status(statusCode).json({ message });
  }

  // POST /api/equipos/:equipoId/etiquetas
  async createEtiqueta(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { equipoId } = req.params;
      const { nombre } = req.body;
      // ✅ CORRECTO: Obtener el ID del usuario autenticado desde req.user
      const creadorId = req.user!.id; 

      if (!nombre) {
        return res.status(400).json({ message: "El nombre de la etiqueta es requerido." });
      }

      const etiqueta = await this.service.createEtiqueta(equipoId, creadorId, nombre);
      return res.status(201).json(etiqueta);
    } catch (error: any) {
      return this.handleError(res, error);
    }
  }

  // GET /api/equipos/:equipoId/etiquetas
  async getEtiquetasByEquipo(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { equipoId } = req.params;
      // ✅ CORRECTO: Obtener el ID del usuario autenticado
      const usuarioId = req.user!.id; 

      const etiquetas = await this.service.getEtiquetasByEquipo(equipoId, usuarioId);
      return res.status(200).json(etiquetas);
    } catch (error: any) {
      return this.handleError(res, error);
    }
  }

  // PATCH /api/etiquetas/:etiquetaId
  async updateEtiqueta(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { etiquetaId } = req.params;
      const { nombre } = req.body;
      // ✅ CORRECTO: Obtener el ID del usuario autenticado
      const usuarioId = req.user!.id; 

      if (!nombre) {
        return res.status(400).json({ message: "El nuevo nombre de la etiqueta es requerido." });
      }

      const etiquetaActualizada = await this.service.updateEtiqueta(etiquetaId, usuarioId, nombre);
      return res.status(200).json(etiquetaActualizada);
    } catch (error: any) {
      return this.handleError(res, error);
    }
  }

  // DELETE /api/etiquetas/:etiquetaId
  async deleteEtiqueta(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { etiquetaId } = req.params;
      // ✅ CORRECTO: Obtener el ID del usuario autenticado
      const usuarioId = req.user!.id; 

      await this.service.deleteEtiqueta(etiquetaId, usuarioId);
      return res.status(204).send(); // No Content
    } catch (error: any) {
      return this.handleError(res, error);
    }
  }

  // POST /api/tareas/:tareaId/etiquetas/:etiquetaId
  async asignarEtiqueta(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { tareaId, etiquetaId } = req.params;
      // ✅ CORRECTO: Obtener el ID del usuario autenticado
      const usuarioId = req.user!.id; 

      await this.service.asignarEtiqueta(tareaId, etiquetaId, usuarioId);
      return res.status(201).json({ message: "Etiqueta asignada correctamente." });
    } catch (error: any) {
      return this.handleError(res, error);
    }
  }

  // DELETE /api/tareas/:tareaId/etiquetas/:etiquetaId
  async removerEtiqueta(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { tareaId, etiquetaId } = req.params;
      // ✅ CORRECTO: Obtener el ID del usuario autenticado
      const usuarioId = req.user!.id; 

      await this.service.removerEtiqueta(tareaId, etiquetaId, usuarioId);
      return res.status(204).send(); // No Content
    } catch (error: any) {
      return this.handleError(res, error);
    }
  }
}