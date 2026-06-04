import { UserController,UserLoginController, UserRefreshTokenController, UserForgotPasswordController, UserResetPasswordController, UserProfileController,userGoogleLoginController, totalUsersController } from "../controllers/user.controller";
import { Router } from "express";
import { authenticate } from "../middlewares/authenticate";
import { authorizeRoles } from "../middlewares/authorizeRoles";

const router=Router();


router.post("/register",UserController)
router.post("/login",UserLoginController)
router.post("/refresh-token", UserRefreshTokenController)
router.post("/forgot-password",UserForgotPasswordController)
router.post("/reset-password",UserResetPasswordController)
router.get("/profile", authenticate, UserProfileController);
router.post("/google-login", userGoogleLoginController)
router.get("/total-users", authenticate, authorizeRoles("manager"), totalUsersController);
export default router