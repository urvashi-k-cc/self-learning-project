import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  DeleteDateColumn,
} from "typeorm";
import { User } from "./user.entity";
import { Project } from "./project.entity";
import { TASK_STATUSES, TaskStatus } from "../constants/roles";

@Entity()
export class Task {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  title!: string;

  @Column({ type: "text", nullable: true })
  description!: string | null;

  @Column({
    type: "enum",
    enum: TASK_STATUSES,
    default: "todo",
  })
  status!: TaskStatus;

  @Column()
  projectId!: number;

  @ManyToOne(() => Project)
  @JoinColumn({ name: "projectId" })
  project!: Project;

  @Column()
  assignedToId!: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: "assignedToId" })
  assignedTo!: User;

  @Column()
  createdById!: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: "createdById" })
  createdBy!: User;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @DeleteDateColumn()
  deletedAt!: Date | null;
}
