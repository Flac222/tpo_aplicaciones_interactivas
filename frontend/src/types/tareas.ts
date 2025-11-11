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

export interface Etiqueta { 
    id: string;
    nombre: string;
    equipoId: string;
}

export interface Tarea {
    id: string;
    titulo: string;
    descripcion: string;
    estado: EstadoTarea;
    prioridad: PrioridadTarea;
    equipo: {
        id: string;
        nombre: string;
    };
    historial: RegistroHistorial[]; // <-- NUEVA PROPIEDAD
    fechaCreacion: string;
    fechaActualizacion: string;
    etiquetas: Etiqueta[]; 
}

// DESPUÉS (types/tareas.ts)
export interface UsuarioComentario {
    id: string;
    nombre: string;
    email: string;
    // La contraseña es un detalle sensible, 
    // pero la incluimos si el back la retorna:
    password: string; 
}

export interface Comentario {
    id: string;
    contenido: string;
    autor: UsuarioComentario; // <-- CAMBIO: De 'creador' a 'autor'
    tarea: {
        id: string;
        titulo: string;
        descripcion: string;
        estado: string;
        prioridad: string;
        fechaCreacion: Date;
        fechaActualizacion: Date;
    };
    fecha: string; // <-- CAMBIO: De 'fechaCreacion' a 'fecha'
    fechaActualizacion: string;
}

export interface UsuarioHistorial {
    id: string;
    nombre: string;
    email: string;
    password: string; 
}

export interface RegistroHistorial {
    id: string;
    usuario: UsuarioHistorial; // El usuario que realizó el cambio
    cambio: string; // Descripción del cambio (e.g., "Estado cambiado de X a Y")
    fecha: string; // Fecha del cambio
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

