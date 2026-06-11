import {z} from "zod";

export const taskValidation = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  assignedToId: z.string().min(1, "Assignee is required"),
  projectId: z.string().min(1, "Project is required"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"], {
    required_error: "Priority is required",
  }),
});