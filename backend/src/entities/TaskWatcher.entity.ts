import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn
} from "typeorm";
import { Tarea } from "./Tareas.entity";
import { Usuario } from "./Usuario.entity";

@Entity()
export class TaskWatcher {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  // Relación con la tarea
  @ManyToOne(() => Tarea, tarea => tarea.watchers, {
    onDelete: "CASCADE" // si se elimina la tarea, se eliminan los watchers asociados
  })
  task!: Tarea;

  // Relación con el usuario
  @ManyToOne(() => Usuario, usuario => usuario.taskWatchers, {
    onDelete: "CASCADE" // opcional: si se elimina el usuario, se eliminan sus watchers
  })
  user!: Usuario;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
