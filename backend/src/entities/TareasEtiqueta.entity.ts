// src/entities/TareaEtiqueta.entity.ts

import { Entity, PrimaryColumn, ManyToOne } from "typeorm";
import { Tarea } from "./Tareas.entity";
import { Etiqueta } from "./Etiqueta.entity";

@Entity()
export class TareaEtiqueta {
  // Clave primaria compuesta de las IDs de Tarea y Etiqueta
  @PrimaryColumn()
  tareaId!: string;

  @PrimaryColumn()
  etiquetaId!: string;

  @ManyToOne(() => Tarea, (tarea) => tarea.etiquetasAsignadas, {
    onDelete: "CASCADE",
  })
  tarea!: Tarea;

  @ManyToOne(() => Etiqueta, (etiqueta) => etiqueta.tareaAsignada, {
    onDelete: "CASCADE",
  })
  etiqueta!: Etiqueta;
}