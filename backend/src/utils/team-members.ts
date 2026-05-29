export interface TeamMemberInput {
  userId: number;
  isTeamLead: boolean;
}

export const validateTeamMembers = (members: TeamMemberInput[]) => {
  if (!members?.length) {
    throw new Error("At least one team member is required");
  }

  const teamLeadCount = members.filter((m) => m.isTeamLead).length;
  if (teamLeadCount === 0) {
    throw new Error("A Team Lead is required for every project");
  }
  if (teamLeadCount > 1) {
    throw new Error("Each project must have exactly one Team Lead");
  }

  const userIds = members.map((m) => m.userId);
  const uniqueIds = new Set(userIds);
  if (uniqueIds.size !== userIds.length) {
    throw new Error("Duplicate members are not allowed");
  }
};
