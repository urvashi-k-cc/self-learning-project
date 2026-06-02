import { Request, Response } from "express";
import {
  UserRegisterService,
  UserLoginService,
  UserRefreshTokenService,
  UserForgotPasswordService,
  UserResetPasswordService,
  UserProfileService,
  UserGoogleLoginService
} from "../services/user.service";
import { AuthRequest } from "../types/express";

// Register
export const UserController = async (req: Request, res: Response) => {
  try {
    const user = await UserRegisterService(req.body);
    return res.status(201).json({
      success: true,
      message: "User created successfully",
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
      },
      
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
      
    });
  }
};

// Login
export const UserLoginController = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const tokens = await UserLoginService(email, password);
    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });
    res.json({
      success: true,
      message: "Logged in successfully",
      accessToken: tokens.accessToken,
      user: tokens.user

    });

  } catch (err: any) {
    res.status(401).json({ message: err.message });
  }
};

// Refresh access token using httpOnly refresh cookie
export const UserRefreshTokenController = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token not provided",
      });
    }

    const tokens = await UserRefreshTokenService(refreshToken);

    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      success: true,
      accessToken: tokens.accessToken,
    });
  } catch (err: any) {
    res.clearCookie("refreshToken");
    return res.status(401).json({
      success: false,
      message: err.message || "Invalid refresh token",
    });
  }
};

// Forgot Password
export const UserForgotPasswordController = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    await UserForgotPasswordService(email);

    return res.status(200).json({
      success: true,
      message: "Reset link has been sent to your email",
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// Reset Password
export const UserResetPasswordController = async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;        
    // OR support URL param as fallback
    const resetToken = token || req.params.token;

    if (!resetToken) throw new Error("Token is required");

    await UserResetPasswordService(resetToken, password);
    return res.status(200).json({ success: true, message: "Password reset successful" });
  } catch (err: any) {
    console.error("Reset Password Error:", err);
    return res.status(400).json({ success: false, message: err.message });
  }
};

export const UserProfileController = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: userId missing",
      });
    }
    const userProfile = await UserProfileService(userId);
    return res.status(200).json({
      success: true,
      user: userProfile,
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

export const userGoogleLoginController = async (req: Request, res: Response) => {
  try {
    const { tokenId } = req.body;
    const tokens = await UserGoogleLoginService(tokenId);
    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });
    res.json({
      success: true,
      message: "Logged in successfully",
      accessToken: tokens.accessToken,
      user: tokens.user

    });
  } catch (err: any) {
    res.status(401).json({ message: err.message });
  }
};