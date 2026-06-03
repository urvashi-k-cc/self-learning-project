import {
  createTaskApi,
  updateTaskApi,
  getProjectDevelopersApi,
//   getTaskByIdApi,
  getProjectsApi,
} from "@/helpers/apiRequest";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { taskValidation } from "@/components/schema/taskValidation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useNavigate, useParams } from "react-router-dom";

const CreateEditTask = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState([]);
  const [developers, setDevelopers] = useState([]);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(taskValidation),
    defaultValues: {
      title: "",
      description: "",
      projectId: "",
      assignedToId: "",
    },
  });

  const selectedProjectId = watch("projectId");

  // Load projects + developers
  useEffect(() => {
    loadInitialData();
  }, []);

  // Load developers when project changes (for create mode)
  useEffect(() => {
    if (selectedProjectId && !isEdit) {
      loadDevelopers(selectedProjectId);
    }
  }, [selectedProjectId, isEdit]);
  const loadInitialData = async () => {
    try {
      setLoading(true);
      // Load projects for Team Lead
      const projectsRes = await getProjectsApi();
      const projectList = projectsRes?.projects || projectsRes?.data?.projects || [];
      console.log("Projects Response:", projectList);
      setProjects(projectList);

      if (isEdit) {
        // const taskRes = await getTaskByIdApi(id);
        const task = taskRes?.task || taskRes?.data?.task || taskRes?.data;
        
        if (task) {
          reset({
            title: task.title || "",
            description: task.description || "",
            projectId: String(task.projectId || task.project?.id || ""),
            assignedToId: String(task.assignedToId || task.assignedTo?.id || ""),
          });

          // Load developers for the task's project
          if (task.projectId || task.project?.id) {
            await loadDevelopers(task.projectId || task.project?.id);
          }
        }
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const loadDevelopers = async (projectId) => {
    try {
      const res = await getProjectDevelopersApi(Number(projectId));
      setDevelopers(res?.developers || res?.data?.developers || []);
    } catch (error) {
      toast.error("Failed to load developers");
      setDevelopers([]);
    }
  };

  const onSubmit = async (formData) => {
    console.log("Form Data Submitted >>>>>>>>>", formData);
      console.log("selectedProjectId =", selectedProjectId);


    try {
      setLoading(true);
      const payload = {
        title: formData.title,
        description: formData.description,
        assignedToId: Number(formData.assignedToId),        
        projectId: Number(formData.projectId),
        // ...(isEdit ? {} : { projectId: Number(formData.projectId) }), // Only send projectId on create
      };

      if (isEdit) {
        await updateTaskApi(id, payload);
        toast.success("Task updated successfully");
      } else {
        console.log("Creating task with payload >>>>>>>>>", payload);
        await createTaskApi(payload);
        
        toast.success("Task created successfully");
      }
      navigate("/tasks");
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          `Failed to ${isEdit ? "update" : "create"} task`
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading && !isEdit) {
    return <div className="text-center py-10">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto bg-white shadow border rounded-lg p-6 mt-4">
      <h1 className="text-2xl font-bold mb-6">
        {isEdit ? "Edit Task" : "Create New Task"}
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Project Selection - Only for Create */}
        {!isEdit && (
          <div>
            <label className="block mb-2 text-sm font-medium">Project</label>
            <select
              {...register("projectId")}
              className="w-full border rounded-md px-3 py-2"
            >
              <option value="">Select Project</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
            {<p>selected  Project : {selectedProjectId}</p>}
            {errors.projectId && (
              <p className="text-red-500 text-sm mt-1">{errors.projectId.message}</p>
            )}
          </div>
        )}

        <div>
          <label className="block mb-2 text-sm font-medium">Title</label>
          <input
            type="text"
            {...register("title")}
            className="w-full border rounded-md px-3 py-2"
          />
          {errors.title && (
            <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
          )}
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium">Description</label>
          <textarea
            rows={4}
            {...register("description")}
            className="w-full border rounded-md px-3 py-2"
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
          )}
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium">Assign Developer</label>
          <select
            {...register("assignedToId")}
            className="w-full border rounded-md px-3 py-2"
            disabled={!selectedProjectId && !isEdit}
          >
            <option value="">Select Developer</option>
            {developers.map((dev) => (
              <option key={dev.id} value={dev.id}>
                {dev.first_name} {dev.last_name}
              </option>
            ))}
          </select>
          {errors.assignedToId && (
            <p className="text-red-500 text-sm mt-1">{errors.assignedToId.message}</p>
          )}
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900 disabled:opacity-50"
          >
            {loading ? "Saving..." : isEdit ? "Update Task" : "Create Task"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/tasks")}
            className="px-6 py-2 border rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateEditTask;