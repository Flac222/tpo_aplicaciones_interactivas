import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  CreateDateColumn
} from "typeorm";
import { TaskWatcher } from "./TaskWatcher.entity";

export enum EventType {
  STATUS_CHANGE = "statusChange",
  CREATE_COMMENT = "createComment",
  EDIT_COMMENT = "editComment",
  DELETE_COMMENT = "deleteComment",
  SUBSCRIBE = "subscribe",
  UNSUBSCRIBE = "unsubscribe",
  ASSIGN_TAG = "assingTag",
  REMOVE_TAG = "removeTag",
  OTHER = "other"
}


@Entity()
export class TaskWatcherNotification {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  // Relación directa con el watcher (usuario + tarea)
  @ManyToOne(() => TaskWatcher, watcher => watcher.notifications, {
    onDelete: "CASCADE"
  })
  watcher!: TaskWatcher;

  @Column({ type: "enum", enum: EventType })
  eventType!: EventType;

  @Column({ type: "json", nullable: true })
  payload!: Record<string, any>;

  @CreateDateColumn()
  createdAt!: Date;

  @Column({ type: "timestamp", nullable: true })
  readAt!: Date | null;
}
