import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  OneToMany
} from "typeorm";
import { Usuario } from "./Usuario.entity";
import { Tarea } from "./Tareas.entity";

@Entity()
export class Equipo {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  nombre!: string;

  @ManyToOne(() => Usuario, usuario => usuario.equiposCreados, { onDelete: "CASCADE" })
  propietario!: Usuario;

  @ManyToMany(() => Usuario, usuario => usuario.equipos)
  miembros!: Usuario[];

  @OneToMany(() => Tarea, tarea => tarea.equipo)
  tareas!: Tarea[];
}
