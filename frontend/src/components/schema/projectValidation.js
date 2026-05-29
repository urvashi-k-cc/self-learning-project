import { z } from "zod";

export const projectValidation = z.object({
  name: z.string().min(2, "Project name must be at least 2 characters"),
  description: z.string().optional(),
  teamName: z.string().optional(),
});
