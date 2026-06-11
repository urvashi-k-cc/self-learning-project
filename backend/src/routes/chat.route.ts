import { Router } from "express";
import { authenticate } from "../middlewares/authenticate";
import { authorizeRoles } from "../middlewares/authorizeRoles";
import {
    getTaskMessagesController,
} from "../controllers/chat.controller";

const router = Router();

router.get(
  "/task/:taskId",
  authenticate,
  authorizeRoles("teamLead", "manager", "developer"),
  getTaskMessagesController
);

export default router;
