// src/types/tarea.ts

// Enums
export enum EstadoTarea {
    PENDIENTE = "Pendiente",
    EN_CURSO = "En curso",
    TERMINADA = "Terminada",
    CANCELADA = "Cancelada"
}

export enum PrioridadTarea {
    ALTA = "Alta",
    MEDIA = "Media",
    BAJA = "Baja"
}

// Interfaz
export interface Tarea {
    id: string;
    titulo: string;
    descripcion?: string;
    estado: EstadoTarea;
    prioridad: PrioridadTarea;
    // Puedes añadir mas campos aquí (ej: asignadoA, fechaCreacion)
}


// **NUEVA INTERFAZ DE COMENTARIO**
export interface Comentario {
    id: string;
    contenido: string;
    creadorId: string; // El ID del usuario que creó el comentario
    fechaCreacion: string; // O Date, dependiendo de cómo lo manejes
    tareaId: string;
    // Opcional: información del creador para mostrar en la UI
    creadorNombre?: string; 
}

// Constantes y Helpers
export const estadoConfig = {
    [EstadoTarea.PENDIENTE]: { title: "Pendiente", color: "#63B3ED", icon: "🕒" },
    [EstadoTarea.EN_CURSO]: { title: "En curso", color: "#F6AD55", icon: "🚀" },
    [EstadoTarea.TERMINADA]: { title: "Terminada", color: "#48BB78", icon: "✅" },
    [EstadoTarea.CANCELADA]: { title: "Cancelada", color: "#9F7AEA", icon: "❌" },
} as const;

export function getPriorityColor(prioridad: PrioridadTarea): string {
    switch (prioridad) {
        case PrioridadTarea.ALTA: return 'var(--color-error, #E53E3E)';
        case PrioridadTarea.MEDIA: return 'var(--color-warning, #DD6B20)';
        case PrioridadTarea.BAJA: return 'var(--color-success, #38A169)';
        default: return '#CCC';
    }
}

/**
 * Define las transiciones de estado válidas según las reglas del negocio.
 * PENDIENTE -> EN_CURSO (+ CANCELADA)
 * EN_CURSO -> TERMINADA (+ CANCELADA)
 * TERMINADA -> CANCELADA
 * CANCELADA -> Ninguna
 */
export function getValidNextStatuses(currentStatus: EstadoTarea): EstadoTarea[] {
    const cancellable = [EstadoTarea.CANCELADA]; 
    const terminada = [EstadoTarea.TERMINADA];

    switch (currentStatus) {
        case EstadoTarea.PENDIENTE:
            return [EstadoTarea.EN_CURSO, ...cancellable];
        case EstadoTarea.EN_CURSO:
            return [...terminada, ...cancellable];
        case EstadoTarea.TERMINADA:
            return [...cancellable]; 
        case EstadoTarea.CANCELADA:
            return [];
        default:
            return [];
    }
}