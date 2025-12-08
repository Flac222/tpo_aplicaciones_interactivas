// src/types/templates.ts
import { PrioridadTarea, Etiqueta } from "./tareas";

export interface TaskTemplate {
    id: string;
    name: string;
    description?: string;
    priority: PrioridadTarea;
    teamId?: string;
    teamName?: string;
    creatorId: string;
    creatorName: string;
    tags: Etiqueta[]; // El backend devuelve objetos completos en GET
    createdAt: string;
    updatedAt: string;
}

export interface TaskTemplateCreateDTO {
    name: string;
    description?: string;
    priority: PrioridadTarea;
    teamId?: string;
    tagIds: string[]; // El backend espera IDs en POST/PUT
}

export interface TaskPreFillDTO {
    title: string;
    description?: string;
    priority: PrioridadTarea;
    teamId?: string;
    tagIds: string[];
    originTemplateId: string;
}