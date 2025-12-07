// src/controllers/TaskTemplate.controller.ts

import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware"; 
import { TaskTemplateService, 
    TaskTemplateListFilterDTO, 
    TaskTemplateCreateUpdateDTO } from "../services/TaskTemplates.service"; // Importar DTOs y Service

// Definición de ServiceError para manejar errores con status code
class ServiceError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

// Instancia del servicio
const taskTemplateService = new TaskTemplateService();

/**
 * Función auxiliar para centralizar el manejo de errores del servicio.
 * Se reutiliza la lógica vista en otros controllers como etiquetas.controller.ts
 */
const handleError = (res: Response, error: any): Response => {
  const statusCode = error instanceof ServiceError ? error.statusCode : 500;
  const message = error.message || "Error interno del servidor.";
  
  if (statusCode === 500) {
      console.error("Error en el controlador de TaskTemplates:", error);
  }

  return res.status(statusCode).json({ message });
};

// --- ENDPOINTS REST (CRUD + Listado + Pre-llenado) ---

/**
 * GET /api/tasktemplates
 * Lista templates del usuario con filtros (teamId, búsqueda por nombre/descripción) y paginación. (Requisito 2)
 */
export async function listarTemplates(req: AuthRequest, res: Response): Promise<Response> {
  try {
    const creatorId = req.user!.id;
    
    // Extracción de parámetros de consulta
    const { teamId, search, page = '1', limit = '10' } = req.query;

    const filters: TaskTemplateListFilterDTO = {
      teamId: teamId as string,
      search: search as string,
      limit: parseInt(limit as string),
      offset: (parseInt(page as string) - 1) * parseInt(limit as string),
    };
    
    const pageNumber = parseInt(page as string);
    const limitNumber = parseInt(limit as string);

    if (isNaN(pageNumber) || pageNumber < 1) throw new ServiceError("El parámetro 'page' debe ser un número positivo.", 400);
    if (isNaN(limitNumber) || limitNumber < 1) throw new ServiceError("El parámetro 'limit' debe ser un número positivo.", 400);

    const result = await taskTemplateService.listarTemplates(creatorId, filters);

    // Devolver el resultado con información de paginación
    const totalPages = Math.ceil(result.total / limitNumber);
    
    return res.status(200).json({
      templates: result.templates,
      pagination: {
        total: result.total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: totalPages,
      },
    });

  } catch (error: any) {
    return handleError(res, error);
  }
}

/**
 * GET /api/tasktemplates/:id
 * Consulta de detalle de un template con sus tags y relaciones. (Requisito 2)
 */
export async function obtenerTemplateDetalle(req: AuthRequest, res: Response): Promise<Response> {
  try {
    const { id } = req.params;
    
    // No es necesario verificar que el usuario sea el creador aquí,
    // ya que el Service podría implementarlo o dejarlo abierto
    // (pero por unicidad por creador, es buena práctica que solo acceda a las suyas).
    const template = await taskTemplateService.obtenerTemplatePorId(id);
    
    // Opcional: Si solo las templates propias son accesibles, añadir:
    // if (template.creatorId !== req.user!.id) throw new ServiceError("No autorizado para ver esta template.", 403);
    
    return res.status(200).json(template);

  } catch (error: any) {
    return handleError(res, error);
  }
}

/**
 * POST /api/tasktemplates
 * Creación de template (Requisito 2)
 */
export async function crearTemplate(req: AuthRequest, res: Response): Promise<Response> {
  try {
    const creatorId = req.user!.id;
    const data: TaskTemplateCreateUpdateDTO = req.body;
    
    // Validación básica de campos requeridos
    if (!data.name || !data.tagIds) {
      throw new ServiceError("El nombre y tagIds son campos requeridos.", 400);
    }
    
    const newTemplate = await taskTemplateService.crearTemplate(data, creatorId);

    // 201 Created
    return res.status(201).json(newTemplate);

  } catch (error: any) {
    return handleError(res, error);
  }
}

/**
 * PUT /api/tasktemplates/:id
 * Actualización de template (Requisito 2)
 */
export async function actualizarTemplate(req: AuthRequest, res: Response): Promise<Response> {
  try {
    const { id } = req.params;
    const creatorId = req.user!.id; // Usuario autenticado
    const data: TaskTemplateCreateUpdateDTO = req.body;
    
    if (!data.tagIds) {
      throw new ServiceError("El campo tagIds es requerido, aunque esté vacío.", 400);
    }

    const updatedTemplate = await taskTemplateService.actualizarTemplate(id, data, creatorId);

    return res.status(200).json(updatedTemplate);

  } catch (error: any) {
    // El servicio lanza 403 si no es el creador, 404 si no existe, 409 si hay conflicto de nombre.
    return handleError(res, error);
  }
}

/**
 * DELETE /api/tasktemplates/:id
 * Eliminación de template (Requisito 2)
 */
export async function eliminarTemplate(req: AuthRequest, res: Response): Promise<Response> {
  try {
    const { id } = req.params;
    const creatorId = req.user!.id;

    await taskTemplateService.eliminarTemplate(id, creatorId);

    // 204 No Content
    return res.status(204).send();

  } catch (error: any) {
    return handleError(res, error);
  }
}

/**
 * GET /api/tasktemplates/:id/preview
 * Entrega la información necesaria para que el frontend pueda prellenar el formulario de tasks. (Requisito 2 y 3)
 */
export async function obtenerDatosPrellenado(req: AuthRequest, res: Response): Promise<Response> {
    try {
        const { id } = req.params;
        
        // No se requiere 'creatorId' en el Service para esta operación, ya que cualquiera puede
        // usar una template si conoce el ID, aunque es más seguro verificar que la template exista
        // y sea accesible.
        
        const preFillData = await taskTemplateService.obtenerDatosPrellenado(id);
        
        // El DTO de salida contiene: title, description, priority, teamId, tagIds, originTemplateId
        return res.status(200).json(preFillData);
        
    } catch (error: any) {
        return handleError(res, error);
    }
}