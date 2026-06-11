import {z } from "zod";
export const loginValidation = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(1, "Password is required").max(20, "Password must be at most 20 characters"),
});