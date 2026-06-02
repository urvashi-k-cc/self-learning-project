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
import { Team } from "./team.entity";

@Entity()
export class Project {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  name!: string;

  @Column({ type: "text", nullable: true })
  description!: string | null;

  @Column()
  createdById!: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: "createdById" })
  createdBy!: User;

  @OneToMany(() => Team, (team) => team.project)
  teams!: Team[];

  @CreateDateColumn()
  created_at!: Date;

  @Column({ type: "timestamp", nullable: true })
  deletedAt!: Date | null;

  @UpdateDateColumn()
  updated_at!: Date;
}
