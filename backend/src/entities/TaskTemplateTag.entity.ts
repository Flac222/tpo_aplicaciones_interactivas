// src/entities/TaskTemplateTag.entity.ts

import { Entity, PrimaryColumn, ManyToOne } from "typeorm";
import { TaskTemplate } from "./TaskTemplate.entity";
import { Etiqueta } from "./Etiqueta.entity";

@Entity()
export class TaskTemplateTag {
  @PrimaryColumn()
  templateId!: string;

  @PrimaryColumn()
  etiquetaId!: string;

  @ManyToOne(() => TaskTemplate, (template) => template.tagsAsociados, {
    onDelete: "CASCADE",
  })
  template!: TaskTemplate;

  @ManyToOne(() => Etiqueta, (etiqueta) => etiqueta.templateAsignada, {
    onDelete: "CASCADE",
  })
  etiqueta!: Etiqueta;
}