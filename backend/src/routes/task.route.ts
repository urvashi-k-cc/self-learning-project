import { Router } from "express";
import { authenticate } from "../middlewares/authenticate";
import { authorizeRoles } from "../middlewares/authorizeRoles";
import {
  createTaskController,
  getTasksController,
  getTaskByIdController,
  updateTaskController,
  updateTaskStatusController,
  getProjectDevelopersController,
  deleteTaskController,
  getTaskStatsController,
} from "../controllers/task.controller";

const router = Router();
router.use(authenticate);

router.get(
  "/project/:projectId/developers",
  authorizeRoles("teamLead", "manager"),
  getProjectDevelopersController
);
router.get(
  "/stats",
  authorizeRoles("manager", "teamLead", "developer"),
  getTaskStatsController
);
router.get(
  "/",
  authorizeRoles("teamLead", "developer", "manager"),
  getTasksController
);
router.get(
  "/:id",
  authorizeRoles("manager", "teamLead", "developer"),
  getTaskByIdController
);
router.post(
  "/",
  authorizeRoles("teamLead","manager"),
  createTaskController
);
router.patch("/:id", authorizeRoles("teamLead","manager"), updateTaskController);
router.patch(
  "/:id/status",
  authorizeRoles("teamLead", "developer"),
  updateTaskStatusController
);
router.delete("/:id", authorizeRoles("teamLead"), deleteTaskController);


export default router;
