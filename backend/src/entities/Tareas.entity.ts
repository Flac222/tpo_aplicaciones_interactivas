import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn
} from "typeorm";
import { Usuario } from "./Usuario.entity";
import { Equipo } from "./Equipo.entity";
import { Comentario } from "./Comentarios.entity";
import { Historial } from "./Historial.entity";

export enum EstadoTarea {
  PENDIENTE = "Pendiente",
  EN_CURSO = "En curso",
  TERMINADA = "Terminada",
  CANCELADA = "Cancelada"
}

export enum PrioridadTarea {
  ALTA = "Alta",
  MEDIA = "Media",
  BAJA = "Baja"
}

@Entity()
export class Tarea {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  titulo!: string;

  @Column({ type: "text", nullable: true })
  descripcion!: string;

  @Column({ type: "enum", enum: EstadoTarea, default: EstadoTarea.PENDIENTE })
  estado!: EstadoTarea;

  @Column({ type: "enum", enum: PrioridadTarea, default: PrioridadTarea.MEDIA })
  prioridad!: PrioridadTarea;

  @ManyToOne(() => Usuario, usuario => usuario.tareasCreadas)
  creador!: Usuario;

  @ManyToOne(() => Equipo, equipo => equipo.tareas, { nullable: true })
  equipo!: Equipo;

  @OneToMany(() => Comentario, comentario => comentario.tarea)
  comentarios!: Comentario[];

  @OneToMany(() => Historial, historial => historial.tarea)
  historial!: Historial[];

  @CreateDateColumn()
  fechaCreacion!: Date;

  @UpdateDateColumn()
  fechaActualizacion!: Date;
}
