import { Response } from "express";
import { AuthRequest } from "../types/express";
import {
  createTaskService,
  getTasksForUserService,
  updateTaskService,
  updateTaskStatusService,
  getProjectDevelopersService,
  deleteTaskService,
} from "../services/task.service";

export const createTaskController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const teamLeadId = req.user!.userId;
    const task = await createTaskService(teamLeadId, req.body);

    return res.status(201).json({
      success: true,
      message: "Task assigned successfully",
      task,
    });
  } catch (err: any) {
    const status = err.message.includes("permission") ? 403 : 400;
    return res.status(status).json({
      success: false,
      message: err.message,
    });
  }
};

export const getTasksController = async (req: AuthRequest, res: Response) => {
  try {
    const { userId, role } = req.user!;
    const projectId = req.query.projectId
      ? Number(req.query.projectId)
      : undefined;

    const tasks = await getTasksForUserService(userId, role, projectId);

    return res.status(200).json({
      success: true,
      tasks,
    });
  } catch (err: any) {
    const status = err.message.includes("permission") ? 403 : 400;
    return res.status(status).json({
      success: false,
      message: err.message,
    });
  }
};

export const updateTaskController = async (req: AuthRequest, res: Response) => {
  try {
    const { userId, role } = req.user!;
    const taskId = parseInt(String(req.params.id), 10);
    const task = await updateTaskService(taskId, userId, role, req.body);

    return res.status(200).json({
      success: true,
      message: "Task updated successfully",
      task,
    });
  } catch (err: any) {
    const status = err.message.includes("permission") ? 403 : 400;
    return res.status(status).json({
      success: false,
      message: err.message,
    });
  }
};

export const updateTaskStatusController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { userId, role } = req.user!;
    const taskId = parseInt(String(req.params.id), 10);
    const task = await updateTaskStatusService(
      taskId,
      userId,
      role,
      req.body.status
    );

    return res.status(200).json({
      success: true,
      message: "Task status updated successfully",
      task,
    });
  } catch (err: any) {
    const status = err.message.includes("permission") ? 403 : 400;
    return res.status(status).json({
      success: false,
      message: err.message,
    });
  }
};

export const getProjectDevelopersController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { userId, role } = req.user!;
    const projectId = parseInt(String(req.params.projectId), 10);
    const developers = await getProjectDevelopersService(
      projectId,
      userId,
      role
    );

    return res.status(200).json({
      success: true,
      developers,
    });
  } catch (err: any) {
    const status =
      err.message.includes("access") || err.message.includes("permission")
        ? 403
        : 400;
    return res.status(status).json({
      success: false,
      message: err.message,
    });
  }
};

export const deleteTaskController = async (req: AuthRequest, res: Response) => {
  try {
    const { userId, role } = req.user!;
    const taskId = parseInt(String(req.params.id), 10);
    await deleteTaskService(taskId, userId, role);

    return res.status(200).json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (err: any) {
    const status =
      err.message.includes("access") || err.message.includes("permission")
        ? 403
        : 400;
    return res.status(status).json({
      success: false,
      message: err.message,
    });
  } 
}