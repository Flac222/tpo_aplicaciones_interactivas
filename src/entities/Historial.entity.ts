import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn
} from "typeorm";
import { Tarea } from "./Tareas.entity";
import { Usuario } from "./Usuario.entity";

@Entity()
export class Historial {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => Tarea, tarea => tarea.historial, { onDelete: "CASCADE" })
  tarea!: Tarea;

  @ManyToOne(() => Usuario, { nullable: true })
  usuario!: Usuario;

  @Column()
  cambio!: string; // Ej: "Estado cambiado de Pendiente a En curso"

  @CreateDateColumn()
  fecha!: Date;
}
