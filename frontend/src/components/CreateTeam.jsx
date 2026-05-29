import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { teamValidation } from "./schema/teamValidation";
import {
  createTeamApi,
  getProjectsApi,
  getAssignableUsersApi,
} from "../helpers/apiRequest";

const CreateTeam = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState({});
  const [loading, setLoading] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(teamValidation) });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [projectsRes, usersRes] = await Promise.all([
          getProjectsApi(),
          getAssignableUsersApi(),
        ]);
        setProjects(projectsRes.projects || []);
        setUsers(usersRes.users || []);
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to load form data"
        );
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const toggleMember = (userId) => {
    setSelectedMembers((prev) => {
      const next = { ...prev };
      if (next[userId]) {
        delete next[userId];
      } else {
        next[userId] = { isTeamLead: false };
      }
      return next;
    });
  };

  const toggleTeamLead = (userId) => {
    setSelectedMembers((prev) => ({
      ...prev,
      [userId]: { isTeamLead: !prev[userId]?.isTeamLead },
    }));
  };

  const onSubmit = async (data) => {
    const members = Object.entries(selectedMembers).map(([userId, value]) => ({
      userId: Number(userId),
      isTeamLead: value.isTeamLead,
    }));

    if (members.length === 0) {
      toast.error("Add at least one team member");
      return;
    }

    if (!members.some((m) => m.isTeamLead)) {
      toast.error("Team must have at least one team lead");
      return;
    }

    try {
      const response = await createTeamApi({
        name: data.name,
        projectId: Number(data.projectId),
        members,
      });
      toast.success(response.message || "Team created");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create team");
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 mt-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Create Team</h1>

      {projects.length === 0 ? (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-amber-800">
          Create a project first before adding a team.
        </div>
      ) : (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4 bg-white p-6 rounded-lg shadow"
        >
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Team name
            </label>
            <input
              type="text"
              className="w-full h-11 px-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Project
            </label>
            <select
              className="w-full h-11 px-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              {...register("projectId")}
            >
              <option value="">Select a project</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
            {errors.projectId && (
              <p className="text-red-500 text-xs mt-1">
                {errors.projectId.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Team members (at least one team lead required)
            </label>
            <div className="border border-gray-200 rounded-md divide-y max-h-72 overflow-y-auto">
              {users.length === 0 ? (
                <p className="p-4 text-sm text-gray-500">
                  No developers or team leads available to assign.
                </p>
              ) : (
                users.map((user) => {
                  const isSelected = Boolean(selectedMembers[user.id]);
                  const isAssigned = user.teamId !== null;

                  return (
                    <div
                      key={user.id}
                      className={`flex items-center justify-between p-3 ${
                        isAssigned ? "bg-gray-50 opacity-60" : ""
                      }`}
                    >
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          disabled={isAssigned}
                          checked={isSelected}
                          onChange={() => toggleMember(user.id)}
                        />
                        <span className="text-sm">
                          {user.first_name} {user.last_name} ({user.role})
                          {isAssigned && " — already on a team"}
                        </span>
                      </label>

                      {isSelected && (
                        <label className="flex items-center gap-2 text-sm text-blue-600">
                          <input
                            type="checkbox"
                            checked={selectedMembers[user.id]?.isTeamLead}
                            onChange={() => toggleTeamLead(user.id)}
                          />
                          Team lead
                        </label>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-500 text-white font-bold rounded-md hover:bg-blue-600 disabled:opacity-50"
            >
              {isSubmitting ? "Creating..." : "Create Team"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default CreateTeam;
