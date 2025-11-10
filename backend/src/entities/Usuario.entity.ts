import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToMany,
  JoinTable
} from "typeorm";
import { Equipo } from "./Equipo.entity";
import { Tarea } from "./Tareas.entity";
import { Comentario } from "./Comentarios.entity";
import { Etiqueta } from "./Etiqueta.entity"; 

@Entity()
export class Usuario {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  nombre!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  // Equipos creados (propietario)
  @OneToMany(() => Equipo, equipo => equipo.propietario)
  equiposCreados!: Equipo[];

  // Equipos donde participa
  @ManyToMany(() => Equipo, equipo => equipo.miembros)
  @JoinTable()
  equipos!: Equipo[];

  @OneToMany(() => Tarea, tarea => tarea.creador)
  tareasCreadas!: Tarea[];

  @OneToMany(() => Comentario, comentario => comentario.autor)
  comentarios!: Comentario[];

  @OneToMany(() => Etiqueta, (etiqueta) => etiqueta.creador)
  etiquetasCreadas!: Etiqueta[];
}
