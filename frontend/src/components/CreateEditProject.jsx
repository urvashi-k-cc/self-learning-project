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
  } = useForm({ resolver: zodResolver(projectValidation), defaultValues });

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
          project.teams?.forEach((team) => {
            team.members?.forEach((m) => {
              members[m.userId] = { isTeamLead: m.isTeamLead };
            });
          });
          setSelectedMembers(members);
        } else if (isEdit && projectFromState) {
          reset(defaultValues);
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

  const setTeamLead = (userId) => {
    setSelectedMembers((prev) => {
      const next = {};
      Object.keys(prev).forEach((id) => {
        next[id] = { isTeamLead: Number(id) === userId };
      });
      if (!next[userId]) {
        next[userId] = { isTeamLead: true };
      }
      return next;
    });
  };

  const onSubmit = async (data) => {
    try {
      let response;
      if (isEdit) {
        response = await updateProjectApi({ ...data, id: projectId });

        const members = Object.entries(selectedMembers).map(
          ([userId, value]) => ({
            userId: Number(userId),
            isTeamLead: value.isTeamLead,
          })
        );

        if (members.length > 0) {
          if (!members.some((m) => m.isTeamLead)) {
            toast.error("Every project must have exactly one Team Lead");
            return;
          }
          if (members.filter((m) => m.isTeamLead).length > 1) {
            toast.error("Only one Team Lead is allowed per project");
            return;
          }
          await updateProjectMembersApi(projectId, members);
        }
      } else {
        const members = Object.entries(selectedMembers).map(
          ([userId, value]) => ({
            userId: Number(userId),
            isTeamLead: value.isTeamLead,
          })
        );

        if (members.length === 0) {
          toast.error("Add at least one team member");
          return;
        }

        if (!members.some((m) => m.isTeamLead)) {
          toast.error("Every project must have exactly one Team Lead");
          return;
        }

        if (members.filter((m) => m.isTeamLead).length > 1) {
          toast.error("Only one Team Lead is allowed per project");
          return;
        }

        response = await createProjectApi({
          name: data.name,
          description: data.description,
          teamName: data.teamName,
          members,
        });
      }
      toast.success(
        response.message || (isEdit ? "Project updated" : "Project created")
      );
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
    <div className="max-w-5xl mx-auto p-6 rounded-lg shadow border border-gray-300 mt-4">
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
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 bg-white p-6 rounded-lg shadow"
      >
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Project name
            <span className="text-red-600 ml-1 font-normal">*</span>
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
            Description (optional)
          </label>
          <textarea
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            {...register("description")}
          />
        </div>

        {!isEdit && (
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Team name (optional)
            </label>
            <input
              type="text"
              placeholder="Defaults to project name + Team"
              className="w-full h-11 px-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              {...register("teamName")}
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Team members
            {!isEdit && (
              <span className="text-red-600 ml-1 font-normal">
                * (exactly one Team Lead required)
              </span>
            )}
          </label>
          <div className="border border-gray-200 rounded-md divide-y max-h-72 overflow-y-auto">
            {users.length === 0 ? (
              <p className="p-4 text-sm text-gray-500">
                No developers or team leads available to assign.
              </p>
            ) : (
              users.map((user) => {
                const isSelected = Boolean(selectedMembers[user.id]);
                const isOnThisProject = isSelected;
                // const isAssignedElsewhere =
                //   user.teamId !== null && !isOnThisProject && user.role !== "teamLead" ;
                const isLead = selectedMembers[user.id]?.isTeamLead;

                return (
                  <div
                    key={user.id}
                    className={`flex items-center justify-between p-3 
                   `
                  }
                  >
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        // disabled={isAssignedElsewhere}
                        checked={isSelected}
                        onChange={() => toggleMember(user.id)}
                      />
                      <span className="text-sm">
                        {user.first_name} {user.last_name} ({user.role})
                        {/* {isAssignedElsewhere && "  already on another team"} */}
                      </span>
                    </label>

                    {isSelected && user.role === "teamLead" && (
                      <label className="flex items-center gap-2 text-sm text-blue-600">
                        <input
                          type="radio"
                          name="teamLead"
                          checked={isLead}
                          onChange={() => setTeamLead(user.id)}
                        />
                        Team Lead
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
            className="px-4 py-2 bg-gray-900 text-white font-bold rounded-md hover:bg-gray-800 disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? "Submitting..." : isEdit ? "Update" : "Submit"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/projects")}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateProject;
