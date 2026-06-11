import { IsNull } from "typeorm";
import { AppDataSource } from "../config/database";
import { Project } from "../entities/project.entity";
import { Team } from "../entities/team.entity";
import { TeamMember } from "../entities/team-member.entity";
import { Task } from "../entities/task.entity";
import { UserRole } from "../types/express";

const projectRepository = AppDataSource.getRepository(Project);
const teamRepository = AppDataSource.getRepository(Team);
const teamMemberRepository = AppDataSource.getRepository(TeamMember);
const taskRepository = AppDataSource.getRepository(Task);

export const getActiveProjectOrThrow = async (projectId: number) => {
  const project = await projectRepository.findOne({
    where: { id: projectId, deletedAt: IsNull() },
  });
  if (!project) {
    throw new Error("Project not found");
  }
  return project;
};

export const isUserTeamLeadOnProject = async (
  userId: number,
  projectId: number,
) => {
  const membership = await teamMemberRepository
    .createQueryBuilder("member")
    .innerJoin("member.team", "team")
    .where("team.projectId = :projectId", { projectId })
    .andWhere("member.userId = :userId", { userId })
    .andWhere("member.isTeamLead = true")
    .getOne();

  return Boolean(membership);
};

export const isUserOnProject = async (userId: number, projectId: number) => {
  const membership = await teamMemberRepository
    .createQueryBuilder("member")
    .innerJoin("member.team", "team")
    .where("team.projectId = :projectId", { projectId })
    .andWhere("member.userId = :userId", { userId })
    .getOne();

  return Boolean(membership);
};

export const assertCanViewProject = async (
  userId: number,
  role: UserRole,
  projectId: number,
) => {
  await getActiveProjectOrThrow(projectId);

  if (role === "manager") {
    return;
  }

  if (role === "teamLead") {
    const isLead = await isUserTeamLeadOnProject(userId, projectId);
    if (!isLead) {
      throw new Error("You do not have access to this project");
    }
    return;
  }

  throw new Error("You do not have access to this project");
};

export const assertCanManageProject = async (projectId: number) => {
  await getActiveProjectOrThrow(projectId);
};

export const getProjectTeam = async (projectId: number) => {
  return teamRepository.findOne({
    where: { projectId },
    relations: { members: { user: true } },
  });
};

export const getTaskOrThrow = async (taskId: number) => {
  const task = await taskRepository.findOne({
    where: { id: taskId },
    relations: { project: true, assignedTo: true },
  });
  if (!task || task.project.deletedAt) {
    throw new Error("Task not found");
  }
  return task;
};

export const assertCanManageTask = async (
  userId: number,
  role: UserRole,
  taskId: number,
) => {
  const task = await getTaskOrThrow(taskId);

  if (role === "teamLead") {
    const isLead = await isUserTeamLeadOnProject(userId, task.projectId);
    if (!isLead) {
      throw new Error("You do not have permission to manage this task");
    }
    return task;
  }
  if (role === "manager") {
    return task;
  }

  throw new Error("You do not have permission to manage this task");
};

export const assertCanUpdateTaskStatus = async (
  userId: number,
  role: UserRole,
  taskId: number,
) => {
  const task = await getTaskOrThrow(taskId);

  if (role === "developer") {
    if (task.assignedToId !== userId) {
      throw new Error("You can only update tasks assigned to you");
    }
    return task;
  }

  if (role === "teamLead") {
    const isLead = await isUserTeamLeadOnProject(userId, task.projectId);
    if (!isLead) {
      throw new Error("You do not have permission to update this task");
    }
    return task;
  }

  throw new Error("You do not have permission to update this task");
};
