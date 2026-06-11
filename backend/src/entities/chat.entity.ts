import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from "typeorm";
import { User } from "./user.entity";
import { Task } from "./task.entity";

@Entity()
export class ChatMessage {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  taskId!: number;

  @Column()
  senderId!: number;

  @Column("text")
  message!: string;

  @Column({ type: "int", nullable: true })
  replyToId!: number | null;

  @CreateDateColumn()
  createdAt!: Date;

  @ManyToOne(() => Task)
  @JoinColumn({ name: "taskId" })
  task!: Task;

  @ManyToOne(() => User)
  @JoinColumn({ name: "senderId" })
  sender!: User;

  @ManyToOne(() => ChatMessage)
  @JoinColumn({ name: "replyToId" })
  replyTo!: ChatMessage | null;
}