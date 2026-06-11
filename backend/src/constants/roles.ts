export const ROLES = {
  MANAGER: "manager",
  TEAM_LEAD: "teamLead",
  DEVELOPER: "developer",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const TASK_STATUSES = [
  "todo",
  "in_progress",
  "review",
  "done",
] as const;

export type TaskStatus = (typeof TASK_STATUSES)[number];

export const TaskPriority = {
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH",
} as const;
