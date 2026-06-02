import { In, IsNull, Not } from "typeorm";
import { AppDataSource } from "../config/database";
import { Project } from "../entities/project.entity";
import { Team } from "../entities/team.entity";
import { TeamMember } from "../entities/team-member.entity";
import { User } from "../entities/user.entity";
import {
  TeamMemberInput,
  validateTeamMembers,
} from "../utils/team-members";
import {
  assertCanViewProject,
  getActiveProjectOrThrow,
  getProjectTeam,
} from "./access.service";
import { UserRole } from "../types/express";

const projectRepository = AppDataSource.getRepository(Project);
const userRepository = AppDataSource.getRepository(User);

interface CreateProjectData {
  name: string;
  description?: string;
  teamName?: string;
  members: TeamMemberInput[];
}

interface UpdateProjectData {
  name?: string;
  description?: string;
}
const validateMemberUsers = async (
  members: TeamMemberInput[],
  currentTeamId?: number
) => {
  const memberIds = members.map((m) => m.userId);
  const users = await userRepository.find({
    where: { id: In(memberIds) },
  });

  if (users.length !== memberIds.length) {
    throw new Error("One or more selected users were not found");
  }
  
  const managerUser = users.find((u) => u.role === "manager");
  if (managerUser) {
    throw new Error("Managers cannot be added as team members");
  }

  const teamLeadMember = members.find((m) => m.isTeamLead);
  const teamLeadUser = users.find((u) => u.id === teamLeadMember?.userId);
  if (teamLeadUser && teamLeadUser.role !== "teamLead") {
    throw new Error("The Team Lead must be a user with the Team Lead role");
  }

  // const alreadyAssigned = users.find(
  //   (u) => u.teamId !== null && u.teamId !== currentTeamId
  // );
  // if (alreadyAssigned) {
  //   throw new Error(
  //     `${alreadyAssigned.first_name} ${alreadyAssigned.last_name} is already assigned to a project team`
  //   );
  // }

  return users;
};
const saveTeamMembers = async (
  transactionalManager: typeof AppDataSource.manager,
  teamId: number,
  members: TeamMemberInput[]
) => {
  const memberRepo = transactionalManager.getRepository(TeamMember);
  const userRepo = transactionalManager.getRepository(User);

  for (const member of members) {
    await memberRepo.save(
      memberRepo.create({
        teamId,
        userId: member.userId,
        isTeamLead: member.isTeamLead,
      })
    );
    await userRepo.update(member.userId, { teamId });
  }
};

export const createProjectService = async (
  managerId: number,
  data: CreateProjectData
) => {
  if (!data.name?.trim()) {
    throw new Error("Project name is required");
  }

  validateTeamMembers(data.members);
  await validateMemberUsers(data.members);

  const existingProject = await projectRepository.findOne({
    where: { name: data.name.trim(), deletedAt: IsNull() },
  });
  if (existingProject) {
    throw new Error("Project name already exists");
  }

  return AppDataSource.transaction(async (manager) => {
    const projectRepo = manager.getRepository(Project);
    const teamRepo = manager.getRepository(Team);

    const project = projectRepo.create({
      name: data.name.trim(),
      description: data.description?.trim() || null,
      createdById: managerId,
      deletedAt: null,
    });
    await projectRepo.save(project);

    const team = teamRepo.create({
      name: data.teamName?.trim() || `${project.name} Team`,
      projectId: project.id,
      createdById: managerId,
    });
    await teamRepo.save(team);

    await saveTeamMembers(manager, team.id, data.members);

    return projectRepo.findOne({
      where: { id: project.id },
      relations: {
        teams: { members: { user: true } },
      },
    });
  });
};

export const getProjectsForUserService = async (
  userId: number,
  role: UserRole
) => {
  if (role === "manager") {
    return projectRepository.find({
      where: { deletedAt: IsNull() },
      relations: { teams: { members: { user: true } } },
      order: { created_at: "DESC" },
    });
  }

  if (role === "teamLead") {
    return projectRepository
      .createQueryBuilder("project")
      .leftJoinAndSelect("project.teams", "team")
      .leftJoinAndSelect("team.members", "members")
      .leftJoinAndSelect("members.user", "user")
      .innerJoin("team.members", "leadMember", "leadMember.isTeamLead = true")
      .where("project.deletedAt IS NULL")
      .andWhere("leadMember.userId = :userId", { userId })
      .orderBy("project.created_at", "DESC")
      .getMany();
  }

  throw new Error("You do not have permission to view projects");
};

export const getProjectByIdService = async (
  projectId: number,
  userId: number,
  role: UserRole
) => {
  await assertCanViewProject(userId, role, projectId);

  const project = await projectRepository.findOne({
    where: { id: projectId, deletedAt: IsNull() },
    relations: { teams: { members: { user: true } } },
  });

  if (!project) {
    throw new Error("Project not found");
  }

  return project;
};

export const updateProjectService = async (
  projectId: number,
  data: UpdateProjectData
) => {
  const project = await getActiveProjectOrThrow(projectId);

  if (data.name !== undefined) {
    if (!data.name.trim()) {
      throw new Error("Project name cannot be empty");
    }
    const existingProject = await projectRepository.findOne({
      where: { name: data.name.trim(), id: Not(projectId), deletedAt: IsNull() },
    });
    if (existingProject) {
      throw new Error("Project name already exists");
    }
    project.name = data.name.trim();
  }

  if (data.description !== undefined) {
    project.description = data.description.trim() || null;
  }

  await projectRepository.save(project);
  return projectRepository.findOne({
    where: { id: project.id },
    relations: { teams: { members: { user: true } } },
  });
};

export const softDeleteProjectService = async (projectId: number) => {
  const project = await getActiveProjectOrThrow(projectId);
  project.deletedAt = new Date();
  await projectRepository.save(project);
};

export const updateProjectMembersService = async (
  projectId: number,
  members: TeamMemberInput[]
) => {
  validateTeamMembers(members);
  await getActiveProjectOrThrow(projectId);
  await validateMemberUsers(members);

  const team = await getProjectTeam(projectId);
  if (!team) {
    throw new Error("Project team not found");
  }

  const currentMemberIds = new Set(team.members.map((m) => m.userId));
  const newMemberIds = new Set(members.map((m) => m.userId));

  const removedIds = [...currentMemberIds].filter((id) => !newMemberIds.has(id));
  const addedMembers = members.filter((m) => !currentMemberIds.has(m.userId));

  if (addedMembers.length > 0) {
    const addedUsers = await userRepository.find({
      where: { id: In(addedMembers.map((m) => m.userId)) },
    });
    const alreadyAssigned = addedUsers.find(
      (u) => u.teamId !== null && u.teamId !== team.id
    );
  }

  return AppDataSource.transaction(async (manager) => {
    const memberRepo = manager.getRepository(TeamMember);
    const userRepo = manager.getRepository(User);

    if (removedIds.length > 0) {
      await memberRepo.delete({ teamId: team.id, userId: In(removedIds) });
      for (const userId of removedIds) {
        await userRepo.update(userId, { teamId: null });
      }
    }

    for (const member of members) {
      const existing = team.members.find((m) => m.userId === member.userId);
      if (existing) {
        existing.isTeamLead = member.isTeamLead;
        await memberRepo.save(existing);
      } else {
        await memberRepo.save(
          memberRepo.create({
            teamId: team.id,
            userId: member.userId,
            isTeamLead: member.isTeamLead,
          })
        );
        await userRepo.update(member.userId, { teamId: team.id });
      }
    }

    return projectRepository.findOne({
      where: { id: projectId },
      relations: { teams: { members: { user: true } } },
    });
  });
};
