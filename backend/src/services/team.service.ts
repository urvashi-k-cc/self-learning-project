import { In } from "typeorm";
import { AppDataSource } from "../config/database";
import { Team } from "../entities/team.entity";
import { User } from "../entities/user.entity";
import {
  TeamMemberInput,
  validateTeamMembers,
} from "../utils/team-members";
import { getActiveProjectOrThrow } from "./access.service";
const teamRepository = AppDataSource.getRepository(Team);
const userRepository = AppDataSource.getRepository(User);
export const getManagerTeamsService = async (
  managerId: number,
  projectId?: number
) => {
  const query = teamRepository
    .createQueryBuilder("team")
    .leftJoinAndSelect("team.members", "members")
    .leftJoinAndSelect("members.user", "user")
    .leftJoinAndSelect("team.project", "project")
    .where("team.createdById = :managerId", { managerId })
    .andWhere("project.deletedAt IS NULL")
    .orderBy("team.created_at", "DESC");

  if (projectId) {
    query.andWhere("team.projectId = :projectId", { projectId });
  }

  return query.getMany();
};

export const getProjectTeamForUserService = async (
  projectId: number,
  userId: number,
  role: "manager" | "teamLead"
) => {
  await getActiveProjectOrThrow(projectId);

  if (role === "teamLead") {
    const team = await teamRepository
      .createQueryBuilder("team")
      .leftJoinAndSelect("team.members", "members")
      .leftJoinAndSelect("members.user", "user")
      .innerJoin("team.members", "leadMember", "leadMember.isTeamLead = true")
      .where("team.projectId = :projectId", { projectId })
      .andWhere("leadMember.userId = :userId", { userId })
      .getOne();

    if (!team) {
      throw new Error("You do not have access to this project's team");
    }
    return team;
  }

  return teamRepository.findOne({
    where: { projectId },
    relations: { members: { user: true }, project: true },
  });
};

export const getAssignableUsersService = async () => {
  return userRepository.find({
    where: { role: In(["developer", "teamLead"]) },
    select: ["id", "first_name", "last_name", "email", "role", "teamId"],
    order: { first_name: "ASC" },
  });
};

// Re-export for backward compatibility with createTeam route if kept
export { validateTeamMembers, TeamMemberInput };
