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
import { Project } from "./project.entity";
import { TeamMember } from "./team-member.entity";


@Entity()
export class Team {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column()
  projectId!: number;

  @ManyToOne(() => Project, (project) => project.teams)
  @JoinColumn({ name: "projectId" })
  project!: Project;

  @Column()
  createdById!: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: "createdById" })
  createdBy!: User;

  @OneToMany(() => TeamMember, (member) => member.team)
  members!: TeamMember[];

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
