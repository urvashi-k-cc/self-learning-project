import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  first_name!: string;

  @Column() 
  last_name!: string;

  @Column()
  email!: string;

  @Column()
  password!: string;
  @Column({
    type: "enum",
    enum: ["developer", "teamLead", "manager"],
    default: "developer",
  })
  role!: "developer" | "teamLead" | "manager";

  @Column({ type: "int", nullable: true })
  teamId!: number | null;

  @Column({ type: "text", nullable: true })
  refreshTokenHash!: string | null;

  @Column({ type: "text", nullable: true })
  resetPasswordToken!: string | null;

  @Column({ type: "timestamp", nullable: true })
  resetPasswordExpires!: Date | null;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
