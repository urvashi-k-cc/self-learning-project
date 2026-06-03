import { In } from "typeorm";
import { AppDataSource } from "../config/database";
import { Task } from "../entities/task.entity";
import { User } from "../entities/user.entity";
import { TASK_STATUSES, TaskStatus } from "../constants/roles";
import {
  assertCanManageTask,
  assertCanUpdateTaskStatus,
  assertCanViewProject,
  getActiveProjectOrThrow,
  getProjectTeam,
  isUserTeamLeadOnProject,
} from "./access.service";
import { UserRole } from "../types/express";

const taskRepository = AppDataSource.getRepository(Task);
const userRepository = AppDataSource.getRepository(User);

interface CreateTaskData {
  title: string;
  description?: string;
  projectId: number;
  assignedToId: number;
  status?: TaskStatus;
}

interface UpdateTaskData {
  title?: string;
  description?: string;
  assignedToId?: number;
  status?: TaskStatus;
}

export const createTaskService = async (
  teamLeadId: number,
  data: CreateTaskData,
) => {
  if (!data.title?.trim()) {
    throw new Error("Task title is required");
  }

  await getActiveProjectOrThrow(data.projectId);

  const isLead = await isUserTeamLeadOnProject(teamLeadId, data.projectId);
  if (!isLead) {
    throw new Error("You can only assign tasks on projects you lead");
  }

  const team = await getProjectTeam(data.projectId);
  const assigneeOnTeam = team?.members.some(
    (m) => m.userId === data.assignedToId && !m.isTeamLead,
  );
  if (!assigneeOnTeam) {
    throw new Error(
      "Tasks can only be assigned to developers on the project team",
    );
  }

  const assignee = await userRepository.findOneBy({ id: data.assignedToId });
  if (!assignee || assignee.role !== "developer") {
    throw new Error("Tasks must be assigned to a developer");
  }

  const status = data.status || "todo";
  if (!TASK_STATUSES.includes(status)) {
    throw new Error("Invalid task status");
  }

  const task = taskRepository.create({
    title: data.title.trim(),
    description: data.description?.trim() || null,
    projectId: data.projectId,
    assignedToId: data.assignedToId,
    createdById: teamLeadId,  
    status,
  });

  await taskRepository.save(task);

  return taskRepository.findOne({
    where: { id: task.id },
    relations: { assignedTo: true, project: true },
  });
};

export const getTasksForUserService = async (
  userId: number,
  role: UserRole,
  projectId?: number,
) => {
  if (role === "teamLead") {
    const query = taskRepository
      .createQueryBuilder("task")
      .leftJoinAndSelect("task.assignedTo", "assignedTo")
      .leftJoinAndSelect("task.project", "project")
      .leftJoinAndSelect("project.createdBy", "projectCreator")
      .innerJoin("project.teams", "team")
      .innerJoin("team.members", "leadMember", "leadMember.isTeamLead = true")
      .where("leadMember.userId = :userId", { userId })
      .andWhere("project.deletedAt IS NULL")
      .orderBy("task.created_at", "DESC")
      .leftJoinAndSelect("task.createdBy", "createdBy");

    if (projectId) {
      await assertCanViewProject(userId, role, projectId);
      query.andWhere("task.projectId = :projectId", { projectId });
    }

    return query.getMany();
  }

  if (role === "developer") {
    const query = taskRepository
      .createQueryBuilder("task")
      .leftJoinAndSelect("task.assignedTo", "assignedTo")
      .leftJoinAndSelect("task.createdBy", "createdBy")
      .leftJoinAndSelect("task.project", "project")
      .leftJoinAndSelect("project.createdBy", "projectCreator")
      .where("task.assignedToId = :userId", { userId })
      .andWhere("project.deletedAt IS NULL")
      .orderBy("task.created_at", "DESC");

    if (projectId) {
      query.andWhere("task.projectId = :projectId", { projectId });
    }

    return query.getMany();
  }

  throw new Error("You do not have permission to view tasks");
};

export const updateTaskService = async (
  taskId: number,
  userId: number,
  role: UserRole,
  data: UpdateTaskData,
) => {
  const task = await assertCanManageTask(userId, role, taskId);

  if (data.title !== undefined) {
    if (!data.title.trim()) {
      throw new Error("Task title cannot be empty");
    }
    task.title = data.title.trim();
  }

  if (data.description !== undefined) {
    task.description = data.description.trim() || null;
  }

  if (data.status !== undefined) {
    if (!TASK_STATUSES.includes(data.status)) {
      throw new Error("Invalid task status");
    }
    task.status = data.status;
  }

  if (data.assignedToId !== undefined) {
    const team = await getProjectTeam(task.projectId);
    const assigneeOnTeam = team?.members.some(
      (m) => m.userId === data.assignedToId && !m.isTeamLead,
    );
    if (!assigneeOnTeam) {
      throw new Error(
        "Tasks can only be assigned to developers on the project team",
      );
    }

    const assignee = await userRepository.findOneBy({
      id: data.assignedToId,
    });
    if (!assignee || assignee.role !== "developer") {
      throw new Error("Tasks must be assigned to a developer");
    }
    task.assignedToId = data.assignedToId;
  }

  await taskRepository.save(task);

  return taskRepository.findOne({
    where: { id: task.id },
    relations: { assignedTo: true, project: true },
  });
};

export const updateTaskStatusService = async (
  taskId: number,
  userId: number,
  role: UserRole,
  status: TaskStatus,
) => {
  if (!TASK_STATUSES.includes(status)) {
    throw new Error("Invalid task status");
  }

  const task = await assertCanUpdateTaskStatus(userId, role, taskId);
  task.status = status;
  await taskRepository.save(task);

  return taskRepository.findOne({
    where: { id: task.id },
    relations: { assignedTo: true, project: true },
  });
};

export const getProjectDevelopersService = async (
  projectId: number,
  userId: number,
  role: UserRole,
) => {
  await assertCanViewProject(userId, role, projectId);

  const team = await getProjectTeam(projectId);
  if (!team) {
    return [];
  }

  return team.members
    .filter((m) => !m.isTeamLead && m.user.role === "developer")
    .map((m) => m.user);
};

export const deleteTaskService = async (taskId: number, userId: number, role: UserRole) => {
  await assertCanManageTask(userId, role, taskId);
  await taskRepository.delete({ id: taskId });
};
