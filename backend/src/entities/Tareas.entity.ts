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
import { TareaEtiqueta } from "./TareasEtiqueta.entity";
import { EstadoTarea, PrioridadTarea } from "./Enums";


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

  @OneToMany(() => TareaEtiqueta, (tareaEtiqueta) => tareaEtiqueta.tarea)
  etiquetasAsignadas!: TareaEtiqueta[];

  @OneToMany(() => Historial, historial => historial.tarea)
  historial!: Historial[];

  @Column({ type: "uuid", nullable: true })
  originTemplateId?: string | null;

  @CreateDateColumn()
  fechaCreacion!: Date;

  @UpdateDateColumn()
  fechaActualizacion!: Date;
}
