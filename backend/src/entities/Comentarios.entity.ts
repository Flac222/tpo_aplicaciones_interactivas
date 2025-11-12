import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn, 
  UpdateDateColumn
} from "typeorm";
import { Usuario } from "./Usuario.entity";
import { Tarea } from "./Tareas.entity";

@Entity()
export class Comentario {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "text" })
  contenido!: string;

  @ManyToOne(() => Usuario, usuario => usuario.comentarios)
  autor!: Usuario;

  @ManyToOne(() => Tarea, tarea => tarea.comentarios, { onDelete: "CASCADE" })
  tarea!: Tarea;

  @CreateDateColumn()
  fecha!: Date;

  @UpdateDateColumn()
  fechaActualizacion!: Date;
}
   