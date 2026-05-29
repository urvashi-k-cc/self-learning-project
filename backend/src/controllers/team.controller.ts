import { Response } from "express";
import { AuthRequest } from "../types/express";
import {
  getManagerTeamsService,
  getAssignableUsersService,
  getProjectTeamForUserService,
} from "../services/team.service";

export const getTeamsController = async (req: AuthRequest, res: Response) => {
  try {
    const { userId, role } = req.user!;
    const projectId = req.query.projectId
      ? Number(req.query.projectId)
      : undefined;

    if (role === "manager") {
      const teams = await getManagerTeamsService(userId, projectId);
      return res.status(200).json({ success: true, teams });
    }

    if (role === "teamLead" && projectId) {
      const team = await getProjectTeamForUserService(
        projectId,
        userId,
        "teamLead"
      );
      return res.status(200).json({ success: true, team });
    }

    return res.status(403).json({
      success: false,
      message: "You do not have permission to perform this action",
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

export const getAssignableUsersController = async (
  _req: AuthRequest,
  res: Response
) => {
  try {
    const users = await getAssignableUsersService();

    return res.status(200).json({
      success: true,
      users,
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};
