import { Response } from "express";
import { AuthRequest } from "../types/express";
import {
  createProjectService,
  getProjectsForUserService,
  getProjectByIdService,
  updateProjectService,
  softDeleteProjectService,
  updateProjectMembersService,
} from "../services/project.service";

export const createProjectController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const managerId = req.user!.userId;
    const project = await createProjectService(managerId, req.body);

    return res.status(201).json({
      success: true,
      message: "Project created successfully",
      project,
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

export const getProjectsController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { userId, role } = req.user!;
    const projects = await getProjectsForUserService(userId, role);

    return res.status(200).json({
      success: true,
      projects,
    });
  } catch (err: any) {
    const status = err.message.includes("permission") ? 403 : 400;
    return res.status(status).json({
      success: false,
      message: err.message,
    });
  }
};

export const getProjectByIdController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { userId, role } = req.user!;
    const projectId = parseInt(String(req.params.id), 10);
    const project = await getProjectByIdService(projectId, userId, role);

    return res.status(200).json({
      success: true,
      project,
    });
  } catch (err: any) {
    const status =
      err.message.includes("access") || err.message.includes("permission")
        ? 403
        : 404;
    return res.status(status).json({
      success: false,
      message: err.message,
    });
  }
};

export const deleteProjectController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const projectId = parseInt(String(req.params.id), 10);
    await softDeleteProjectService(projectId);

    return res.status(200).json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

export const updateProjectController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const projectId = parseInt(String(req.params.id), 10);
    const updatedProject = await updateProjectService(projectId, req.body);

    return res.status(200).json({
      success: true,
      message: "Project updated successfully",
      project: updatedProject,
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

export const updateProjectMembersController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const projectId = parseInt(String(req.params.id), 10);
    const project = await updateProjectMembersService(
      projectId,
      req.body.members
    );

    return res.status(200).json({
      success: true,
      message: "Team members updated successfully",
      project,
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};
