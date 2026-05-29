import { Request } from "express";

export type UserRole = "developer" | "teamLead" | "manager";

export interface AuthUser {
  userId: number;
  role: UserRole;
  email?: string;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}