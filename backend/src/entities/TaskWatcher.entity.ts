import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany
} from "typeorm";
import { Tarea } from "./Tareas.entity";
import { Usuario } from "./Usuario.entity";
import { TaskWatcherNotification } from "./TaskWatcherNotification.entity";

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

  @OneToMany(() => TaskWatcherNotification, notif => notif.watcher)
  notifications!: TaskWatcherNotification[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
