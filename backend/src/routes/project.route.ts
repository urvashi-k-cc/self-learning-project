import { Router } from "express";
import { authenticate } from "../middlewares/authenticate";
import { authorizeRoles } from "../middlewares/authorizeRoles";
import {
  createProjectController,
  getProjectsController,
  getProjectByIdController,
  deleteProjectController,
  updateProjectController,
  updateProjectMembersController,
} from "../controllers/project.controller";

const router = Router();

router.use(authenticate);

router.post("/", authorizeRoles("manager"), createProjectController);
router.get("/", authorizeRoles("manager", "teamLead"), getProjectsController);
router.get(
  "/:id",
  authorizeRoles("manager", "teamLead"),
  getProjectByIdController
);
router.put("/:id", authorizeRoles("manager"), updateProjectController);
router.delete("/:id", authorizeRoles("manager"), deleteProjectController);
router.put(
  "/:id/members",
  authorizeRoles("manager"),
  updateProjectMembersController
);

export default router;
