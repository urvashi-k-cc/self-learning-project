import { Router } from "express";
import { authenticate } from "../middlewares/authenticate";
import { authorizeRoles } from "../middlewares/authorizeRoles";
import {
  getTeamsController,
  getAssignableUsersController,
} from "../controllers/team.controller";

const router = Router();

router.use(authenticate);

router.get(
  "/assignable-users",
  authorizeRoles("manager"),
  getAssignableUsersController
);
router.get("/", authorizeRoles("manager", "teamLead"), getTeamsController);

export default router;
