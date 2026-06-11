import { Request, Response } from "express";
import {
  getTaskMessagesService,
} from "../services/chat.service";

export const getTaskMessagesController =
  async (req: Request, res: Response) => {
    const taskId = Number(req.params.taskId);

    const messages =
      await getTaskMessagesService(taskId);

    res.status(200).json({
      success: true,
      messages,
    });
  };