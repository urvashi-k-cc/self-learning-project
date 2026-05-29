import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../config/database";
import { User } from "../entities/user.entity";

const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET!;
const userRepository = AppDataSource.getRepository(User);

export interface AuthRequest extends Request {
  user?: any;
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, ACCESS_SECRET) as {
      userId?: number;
      role?: string;
    };

    if (!decoded.userId) {
      return res.status(401).json({
        success: false,
        message: "Invalid token payload",
      });
    }

    userRepository
      .findOneBy({ id: decoded.userId })
      .then((user) => {
        if (!user) {
          return res.status(401).json({
            success: false,
            message: "User not found",
          });
        }

        // Always use latest DB role to avoid stale token-role authorization issues.
        req.user = {
          userId: user.id,
          role: user.role,
        };

        next();
      })
      .catch(() => {
        return res.status(500).json({
          success: false,
          message: "Authentication lookup failed",
        });
      });
    return;

  } catch (error: any) {

    // Token expired
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Access token expired",
      });
    }

    // Invalid token
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }
};