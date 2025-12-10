// src/entities/TaskTemplate.entity.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Index 
} from "typeorm";
import { Usuario } from "./Usuario.entity";
import { Equipo } from "./Equipo.entity";
import { TaskTemplateTag } from "./TaskTemplateTag.entity"; // Nueva entidad intermedia
import { PrioridadTarea } from "./Enums";

@Entity()
@Index(["name", "creatorId"], { unique: true }) 
export class TaskTemplate {
  @PrimaryGeneratedColumn("uuid")
  id!: string; 

  @Column()
  name!: string; 



  @Column({ type: "text", nullable: true })
  description!: string; 

  @Column({ type: "enum", enum: PrioridadTarea, default: PrioridadTarea.MEDIA })
  priority!: PrioridadTarea; 

  @ManyToOne(() => Equipo, { nullable: true, onDelete: "SET NULL" })
  team!: Equipo; 
  
  // Campo que TypeORM usa para la FK, útil para el índice
  @Column({ nullable: true })
  teamId!: string; 

  @ManyToOne(() => Usuario, usuario => usuario.templatesCreados, { onDelete: "CASCADE" })
  creator!: Usuario; 
  
  
  @Column() 
  creatorId!: string;

  // Relación con la tabla intermedia para Tags de la Template
  @OneToMany(() => TaskTemplateTag, (templateTag) => templateTag.template)
  tagsAsociados!: TaskTemplateTag[]; 

  @CreateDateColumn()
  createdAt!: Date; 

  @UpdateDateColumn()
  updatedAt!: Date;  
}