// Importa las dependencias necesarias.
// Necesitarás repositorios para Equipo y Usuario para las validaciones.
import { EtiquetasRepository } from "../repositories/etiquetas.repository";
import { TareaEtiquetaRepository } from "../repositories//tareaEtiqueta.repository";
import { EquipoRepository } from "../repositories/Equipos.repository"; // Asumiendo que tienes este
import { UsuarioRepository } from "../repositories/Usuario.repository"; // Asumiendo que tienes este
import { TareaRepository } from "../repositories/Tareas.repository"; // Asumiendo que tienes este
import { Etiqueta } from "../entities/Etiqueta.entity";

// Clase de error personalizada para manejar la lógica de negocio
class ServiceError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

export class EtiquetasService {
  private etiquetaRepo: EtiquetasRepository;
  private tareaEtiquetaRepo: TareaEtiquetaRepository;
  private equipoRepo: EquipoRepository;
  private usuarioRepo: UsuarioRepository;
  private tareaRepo: TareaRepository; // Ahora es una instancia real

  constructor() {
    this.etiquetaRepo = new EtiquetasRepository();
    this.tareaEtiquetaRepo = new TareaEtiquetaRepository();
    this.equipoRepo = new EquipoRepository();
    this.usuarioRepo = new UsuarioRepository();
    
    // 💡 CORRECCIÓN: Inicializar con 'new'
    this.tareaRepo = new TareaRepository(); 
  }

  // ** FUNCIÓN DE UTILIDAD: Lógica de Membresía **
  private async esMiembro(equipoId: string, usuarioId: string): Promise<boolean> {
    const equipo = await this.equipoRepo.findById(equipoId);
    
    if (!equipo) {
        throw new ServiceError("Equipo no encontrado.", 404);
    }

    // Comprobar si el usuario es el propietario
    if (equipo.propietario.id === usuarioId) {
        return true;
    }

    // Comprobar si el usuario está en la lista de miembros
    const esMiembro = equipo.miembros.some(miembro => miembro.id === usuarioId);
    return esMiembro;
  }

  // ** 1. CREAR ETIQUETA (POST /api/equipos/:equipoId/etiquetas) **
  async createEtiqueta(equipoId: string, creadorId: string, nombre: string): Promise<Etiqueta> {
    // 1. Obtener Entidades
    const equipo = await this.equipoRepo.findById(equipoId);
    if (!equipo) {
      throw new ServiceError("Equipo no encontrado.", 404);
    }

    const creador = await this.usuarioRepo.findById(creadorId);
    if (!creador) {
        throw new ServiceError("Usuario creador no encontrado.", 404);
    }
    
    // 2. ** VALIDACIÓN DE MEMBRESÍA **
    const esMiembro = await this.esMiembro(equipoId, creadorId);
    if (!esMiembro) {
        throw new ServiceError("Acceso denegado. El usuario no es miembro del equipo.", 403);
    }

    // 3. Crear
    return this.etiquetaRepo.create(nombre, equipo, creador);
  }

  // ** 2. LISTAR ETIQUETAS POR EQUIPO (GET /api/equipos/:equipoId/etiquetas) **
  async getEtiquetasByEquipo(equipoId: string, usuarioId: string): Promise<Etiqueta[]> {
    // 1. ** VALIDACIÓN DE MEMBRESÍA **
    const esMiembro = await this.esMiembro(equipoId, usuarioId);
    if (!esMiembro) {
        throw new ServiceError("Acceso denegado. El usuario no es miembro del equipo.", 403);
    }
    
    // 2. Listar
    return this.etiquetaRepo.findByEquipoId(equipoId);
  }

  // ** 3. ACTUALIZAR ETIQUETA (PATCH /api/etiquetas/:etiquetaId) **
  async updateEtiqueta(etiquetaId: string, usuarioId: string, nombre: string): Promise<Etiqueta> {
    const etiqueta = await this.etiquetaRepo.findById(etiquetaId);
    if (!etiqueta) {
      throw new ServiceError("Etiqueta no encontrada.", 404);
    }

    // ** VALIDACIÓN DE CREADOR ** (SOLO si usuarioId es el creador de la etiqueta)
    if (etiqueta.creador.id !== usuarioId) {
      throw new ServiceError("Acceso denegado. Solo el creador puede editar esta etiqueta.", 403);
    }

    return this.etiquetaRepo.update(etiqueta, nombre);
  }

  // ** 4. ELIMINAR ETIQUETA (DELETE /api/etiquetas/:etiquetaId) **
  async deleteEtiqueta(etiquetaId: string, usuarioId: string): Promise<void> {
    const etiqueta = await this.etiquetaRepo.findById(etiquetaId);
    if (!etiqueta) {
      throw new ServiceError("Etiqueta no encontrada.", 404);
    }

    // ** VALIDACIÓN DE CREADOR ** (SOLO si usuarioId es el creador de la etiqueta)
    if (etiqueta.creador.id !== usuarioId) {
      throw new ServiceError("Acceso denegado. Solo el creador puede eliminar esta etiqueta.", 403);
    }

    await this.etiquetaRepo.delete(etiquetaId);
  }

  // ** 5. ASIGNAR ETIQUETA A TAREA (POST /api/tareas/:tareaId/etiquetas/:etiquetaId) **
  async asignarEtiqueta(tareaId: string, etiquetaId: string, usuarioId: string): Promise<any> {
    // 1. Verificar existencia de Tarea y Etiqueta (Necesitas TareaRepository.findById que incluya 'equipo')
    // Simulando la obtención de la tarea con el equipo. En realidad, necesitarías un TareaRepository.
    const tarea = await this.tareaRepo.findById(tareaId) as any; 
    if (!tarea || !tarea.equipo) {
        throw new ServiceError("Tarea no encontrada o no pertenece a un equipo.", 404);
    }
    const etiqueta = await this.etiquetaRepo.findById(etiquetaId);
    if (!etiqueta) {
        throw new ServiceError("Etiqueta no encontrada.", 404);
    }

    // 2. Validar que la etiqueta pertenezca al mismo equipo que la tarea
    if (tarea.equipo.id !== etiqueta.equipo.id) {
        throw new ServiceError("La etiqueta no pertenece al equipo de esta tarea.", 400);
    }

    // 3. ** VALIDACIÓN DE MEMBRESÍA ** (Usuario debe pertenecer al equipo de la tarea)
    const esMiembro = await this.esMiembro(tarea.equipo.id, usuarioId);
    if (!esMiembro) {
        throw new ServiceError("Acceso denegado. El usuario no es miembro del equipo de la tarea.", 403);
    }

    // 4. Verificar si ya está asignada
    const asignacionExistente = await this.tareaEtiquetaRepo.findOne(tareaId, etiquetaId);
    if (asignacionExistente) {
        return asignacionExistente; 
    }

    // 5. Crear la asignación
    return this.tareaEtiquetaRepo.create(tareaId, etiquetaId);
  }

  // ** 6. REMOVER ETIQUETA DE TAREA (DELETE /api/tareas/:tareaId/etiquetas/:etiquetaId) **
  async removerEtiqueta(tareaId: string, etiquetaId: string, usuarioId: string): Promise<void> {
    // 1. Verificar si la tarea existe para obtener el equipo
    const tarea = await this.tareaRepo.findById(tareaId) as any;
    if (!tarea || !tarea.equipo) {
        throw new ServiceError("Tarea no encontrada o no pertenece a un equipo.", 404);
    }

    // 2. ** VALIDACIÓN DE MEMBRESÍA ** (Cualquier miembro del equipo puede remover)
    const esMiembro = await this.esMiembro(tarea.equipo.id, usuarioId);
    if (!esMiembro) {
        throw new ServiceError("Acceso denegado. El usuario no es miembro del equipo de la tarea.", 403);
    }

    // 3. Eliminar la relación
    await this.tareaEtiquetaRepo.delete(tareaId, etiquetaId);
  }
  // ** 7. OBTENER ETIQUETAS ASIGNADAS A TAREA (GET /api/tareas/:tareaId/etiquetas) **
    async getEtiquetasByTarea(tareaId: string, usuarioId: string): Promise<Etiqueta[]> {
        // 1. Obtener Tarea (debe incluir la relación con el equipo)
        // NOTA: Asumimos que TareaRepository.findById() ahora incluye la relación 'equipo'.
        const tarea = await this.tareaRepo.findById(tareaId) as any; 
        
        if (!tarea || !tarea.equipo) {
            throw new ServiceError("Tarea no encontrada o no pertenece a un equipo.", 404);
        }

        const equipoId = tarea.equipo.id;

        // 2. ** VALIDACIÓN DE MEMBRESÍA ** (Usuario debe pertenecer al equipo para ver las etiquetas)
        const esMiembro = await this.esMiembro(equipoId, usuarioId);
        if (!esMiembro) {
            throw new ServiceError("Acceso denegado. El usuario no es miembro del equipo de la tarea.", 403);
        }

        // 3. Obtener las relaciones TareaEtiqueta para esa tarea
        const relaciones = await this.tareaEtiquetaRepo.findByTareaId(tareaId);

        if (relaciones.length === 0) {
            return []; // No hay etiquetas asignadas
        }

        // 4. Extraer las IDs de las etiquetas
        const etiquetaIds = relaciones.map(rel => rel.etiquetaId);

        // 5. Obtener los detalles completos de las etiquetas
        // NOTA: Asumimos que EtiquetasRepository tiene un método para obtener por lista de IDs
        const etiquetas = await this.etiquetaRepo.findByIds(etiquetaIds);

        return etiquetas;
    }

}