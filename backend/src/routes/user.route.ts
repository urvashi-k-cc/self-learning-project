import { UserController,UserLoginController, UserRefreshTokenController, UserForgotPasswordController, UserResetPasswordController, UserProfileController,userGoogleLoginController } from "../controllers/user.controller";
import { Router } from "express";
import { authenticate } from "../middlewares/authenticate";

const router=Router();


router.post("/register",UserController)
router.post("/login",UserLoginController)
router.post("/refresh-token", UserRefreshTokenController)
router.post("/forgot-password",UserForgotPasswordController)
router.post("/reset-password",UserResetPasswordController)
router.get(
  "/profile",
  authenticate,
  UserProfileController
);
router.post("/google-login", userGoogleLoginController)
export default router