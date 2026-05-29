import { Router } from "express";
import { authenticate } from "../middlewares/authenticate";
import { authorizeRoles } from "../middlewares/authorizeRoles";
import {
  createTaskController,
  getTasksController,
  updateTaskController,
  updateTaskStatusController,
  getProjectDevelopersController,
} from "../controllers/task.controller";

const router = Router();

router.use(authenticate);

router.get(
  "/project/:projectId/developers",
  authorizeRoles("teamLead"),
  getProjectDevelopersController
);
router.get("/", authorizeRoles("teamLead", "developer"), getTasksController);
router.post("/", authorizeRoles("teamLead"), createTaskController);
router.patch("/:id", authorizeRoles("teamLead"), updateTaskController);
router.patch(
  "/:id/status",
  authorizeRoles("teamLead", "developer"),
  updateTaskStatusController
);

export default router;
