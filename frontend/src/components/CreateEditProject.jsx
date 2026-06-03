import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { toast } from "sonner";
import { projectValidation } from "./schema/projectValidation";
import {
  createProjectApi,
  updateProjectApi,
  updateProjectMembersApi,
  getAssignableUsersApi,
  getProjectByIdApi,
} from "../helpers/apiRequest";
import { FaArrowLeft } from "react-icons/fa";

const CreateProject = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();

  const projectFromState = location.state?.project;
  const projectId = params.id || projectFromState?.id;
  const isEdit = Boolean(projectId);

  const [users, setUsers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState({});
  const [teamLeadId, setTeamLeadId] = useState(null);
  const [loadingUsers, setLoadingUsers] = useState(!isEdit);

  const defaultValues = {
    name: projectFromState?.name || "",
    description: projectFromState?.description || "",
    teamName: "",
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(projectValidation),
    defaultValues,
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const usersRes = await getAssignableUsersApi();
        setUsers(usersRes.users || []);

        if (isEdit && projectId) {
          const projectRes = await getProjectByIdApi(projectId);
          const project = projectRes.project;

          reset({
            name: project.name,
            description: project.description || "",
            teamName: "",
          });

          const members = {};
          let existingLead = null;

          project.teams?.forEach((team) => {
            team.members?.forEach((m) => {
              members[m.userId] = { isTeamLead: m.isTeamLead };

              if (m.isTeamLead) {
                existingLead = m.userId;
              }
            });
          });

          setSelectedMembers(members);
          setTeamLeadId(existingLead);
        }
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to load form data"
        );
      } finally {
        setLoadingUsers(false);
      }
    };

    loadData();
  }, [isEdit, projectId, reset]);

  const formatRole = (role) => {
    const roleMap = {
      teamLead: "Team Lead",
      manager: "Manager",
      developer: "Developer",
    };
    return roleMap[role] || role;
  };

  const toggleMember = (userId) => {
    setSelectedMembers((prev) => {
      const next = { ...prev };

      if (next[userId]) {
        delete next[userId];

        if (teamLeadId === userId) {
          setTeamLeadId(null);
        }
      } else {
        next[userId] = { isTeamLead: false };
      }

      return next;
    });
  };

  const onSubmit = async (data) => {
    try {
      const members = Object.entries(selectedMembers).map(([userId]) => ({
        userId: Number(userId),
        isTeamLead: Number(userId) === teamLeadId,
      }));

      if (members.length === 0) {
        toast.error("Add at least one team member");
        return;
      }

      if (!teamLeadId) {
        toast.error("Please select a Team Lead");
        return;
      }

      if (isEdit) {
        await updateProjectApi({ ...data, id: projectId });
        await updateProjectMembersApi(projectId, members);
      } else {
        await createProjectApi({
          name: data.name,
          description: data.description,
          teamName: data.teamName,
          members,
        });
      }

      toast.success(isEdit ? "Project updated" : "Project created");
      navigate("/projects");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save project");
    }
  };

  if (loadingUsers) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 rounded-lg shadow border border-gray-200 mt-4">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6 ml-4">
        <h1 className="text-2xl font-bold text-black">
          {isEdit ? "Edit Project" : "Create Project"}
        </h1>

        <button
          onClick={() => navigate("/projects")}
          className="px-4 py-2 bg-gray-800 text-white rounded-md flex items-center cursor-pointer"
        >
          <FaArrowLeft />
          <span className="ml-2">Back</span>
        </button>
      </div>

      {/* FORM */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 bg-white p-6 rounded-lg"
      >
        {/* NAME */}
        <div>
          <label className="block text-sm font-bold mb-2">
            Project name *
          </label>
          <input
            className="w-full h-11 px-4 border rounded-md"
            {...register("name")}
          />
          {errors.name && (
            <p className="text-red-500 text-xs">{errors.name.message}</p>
          )}
        </div>

        {/* DESCRIPTION */}
        <div>
          <label className="block text-sm font-bold mb-2">
            Description
          </label>
          <textarea
            rows={4}
            className="w-full px-4 py-2 border rounded-md"
            {...register("description")}
          />
        </div>

        {/* TEAM NAME */}
        {!isEdit && (
          <div>
            <label className="block text-sm font-bold mb-2">
              Team name
            </label>
            <input
              className="w-full h-11 px-4 border rounded-md"
              {...register("teamName")}
            />
          </div>
        )}

        {/* MEMBERS */}
        <div>
          <label className="block text-sm font-bold mb-2">
            Team members
          </label>
       <div className="border rounded-md divide-y max-h-72 overflow-y-auto">
  {users
    .filter((user) => user.role === "developer")
    .map((user) => {
      const isSelected = Boolean(selectedMembers[user.id]);

      return (
        <div
          key={user.id}
          className="flex items-center justify-between p-3"
        >
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => toggleMember(user.id)}
            />

            <span className="text-sm">
              {user.first_name} {user.last_name} (
              {formatRole(user.role)})
            </span>
          </label>
        </div>
      );
    })}
</div>
        </div>

        {/* TEAM LEAD DROPDOWN (NEW UX) */}
        {Object.keys(selectedMembers).length > 0 && (
          <div>
            <label className="block text-sm font-bold mb-2">
              Select Team Lead *
            </label>

            <select
              className="w-full h-11 px-3 border rounded-md"
              value={teamLeadId || ""}
              onChange={(e) => setTeamLeadId(Number(e.target.value))}
            >
              <option value="">Select Team Lead</option>

              {users
                .filter(    (u) => selectedMembers[u.id] && u.role === "teamLead"
)
                .map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.first_name} {user.last_name} (
                    {formatRole(user.role)})
                  </option>
                ))}
            </select>
          </div>
        )}

        {/* ACTIONS */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-gray-900 text-white rounded-md"
          >
            {isSubmitting
              ? "Submitting..."
              : isEdit
              ? "Update"
              : "Submit"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/projects")}
            className="px-4 py-2 border rounded-md"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateProject;