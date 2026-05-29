import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from "typeorm";
import { User } from "./user.entity";
import { Team } from "./team.entity";

@Entity()
@Unique(["teamId", "userId"])
export class TeamMember {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  teamId!: number;

  @Column()
  userId!: number;
  
  @Column({ default: false })
  isTeamLead!: boolean;

  @ManyToOne(() => Team, (team) => team.members, { onDelete: "CASCADE" })
  @JoinColumn({ name: "teamId" })
  team!: Team;

  @ManyToOne(() => User)
  @JoinColumn({ name: "userId" })
  user!: User;
}
