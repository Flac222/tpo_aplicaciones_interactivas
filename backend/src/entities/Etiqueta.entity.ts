// src/entities/Etiqueta.entity.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { Equipo } from "./Equipo.entity";
import { Usuario } from "./Usuario.entity";
import { TareaEtiqueta } from "../entities/TareasEtiqueta.entity"; // Entidad intermedia

@Entity()
export class Etiqueta {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ unique: true }) // Asegura que no haya etiquetas duplicadas en la DB (aunque luego controlaremos por Equipo)
  nombre!: string;

  @ManyToOne(() => Equipo, (equipo) => equipo.etiquetas, { onDelete: "CASCADE" })
  equipo!: Equipo;

  // Permite saber quién creó la etiqueta para aplicar la lógica de permisos
  @ManyToOne(() => Usuario, (usuario) => usuario.etiquetasCreadas)
  creador!: Usuario;

  // Relación con la tabla intermedia para asignarla a Tareas
  @OneToMany(() => TareaEtiqueta, (tareaEtiqueta) => tareaEtiqueta.etiqueta)
  tareaAsignada!: TareaEtiqueta[];

  @CreateDateColumn()
  fechaCreacion!: Date;

  @UpdateDateColumn()
  fechaActualizacion!: Date;
}