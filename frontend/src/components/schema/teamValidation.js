import { z } from "zod";

export const teamValidation = z.object({
  name: z.string().min(2, "Team name must be at least 2 characters"),
  projectId: z.string().min(1, "Please select a project"),
});
