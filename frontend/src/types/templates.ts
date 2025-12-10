// src/types/templates.ts
import { PrioridadTarea, Etiqueta } from "./tareas";

export interface EquipoSimple {
    id: string;
    nombre: string;
}

export interface TaskTemplate {
    id: string;
    name: string;
    description?: string;
    priority: PrioridadTarea;
    teamId?: string;
    teamName?: string;
    creatorId: string;
    creatorName: string;
    tags: Etiqueta[]; 
    createdAt: string;
    updatedAt: string;
}

export interface TaskTemplateCreateDTO {
    name: string;
    description?: string;
    priority: PrioridadTarea;
    teamId?: string;
    tagIds: string[];
}

export interface TaskPreFillDTO {
    title: string;
    description?: string;
    priority: PrioridadTarea;
    teamId?: string;
    tagIds: string[];
    originTemplateId: string;
}