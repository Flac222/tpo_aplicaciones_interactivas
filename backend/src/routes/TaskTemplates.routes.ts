// src/routes/TaskTemplates.routes.ts

import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware'; // Importar el middleware de autenticación
import { 
    listarTemplates,
    obtenerTemplateDetalle,
    crearTemplate,
    actualizarTemplate,
    eliminarTemplate,
    obtenerDatosPrellenado
} from '../controllers/TaskTemplates.controller'; // Importar todas las funciones del controller

const router = Router();

// Aplicar el middleware de autenticación a todas las rutas de templates
router.use(authMiddleware); 

// Rutas base: Listar y Crear
// GET /api/tasktemplates
// POST /api/tasktemplates
router.route('/')
    .get(listarTemplates) 
    .post(crearTemplate); 

// Rutas por ID: Detalle, Actualizar y Eliminar
// GET /api/tasktemplates/:id
// PUT /api/tasktemplates/:id
// DELETE /api/tasktemplates/:id
router.route('/:id')
    .get(obtenerTemplateDetalle)
    .put(actualizarTemplate)
    .delete(eliminarTemplate);

// Ruta de Previsualización/Pre-llenado para Tasks
// GET /api/tasktemplates/:id/preview
router.get('/:id/preview', obtenerDatosPrellenado);

export default router;