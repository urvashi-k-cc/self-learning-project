import { useEffect, useState } from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getTasksApi,
  updateTaskStatusApi,
  getProjectsApi,
  deleteTaskApi,
} from "../helpers/apiRequest";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { FaPlus } from "react-icons/fa";
const STATUSES = ["todo", "in_progress", "review", "done"];

const TaskList = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const initialProjectId = searchParams.get("projectId") || "";
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(initialProjectId);
  const [loading, setLoading] = useState(true);
  const isTeamLead = user?.role === "teamLead";
  const isDeveloper = user?.role === "developer";
  const isManager = user?.role === "manager";
  const navigate = useNavigate();

  const loadTasks = async (projectId) => {
    const res = await getTasksApi(projectId ? Number(projectId) : undefined);
    setTasks(res.tasks || []);
  };

  useEffect(() => {
    const init = async () => {
      try {
        if (isTeamLead || isManager) {
          const projectsRes = await getProjectsApi();
          setProjects(projectsRes.projects || []);

          const pid = initialProjectId || projectsRes.projects?.[0]?.id;

          if (pid) {
            setSelectedProjectId(String(pid));
            await loadTasks(String(pid));
          }
        } else if (isDeveloper) {
          await loadTasks();
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to load tasks");
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [isTeamLead, isManager, isDeveloper, initialProjectId]);
  const handleProjectChange = async (projectId) => {
    setSelectedProjectId(projectId);
    try {
      if (projectId) {
        await loadTasks(projectId);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to load project data",
      );
    }
  };

  const handleStatusChange = async (taskId, status) => {
    try {
      const response = await updateTaskStatusApi(taskId, status);
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status } : t)),
      );
      console.log("API response >>>>>>>>>", response);
      toast.dismiss(); // clear existing toasts
      toast.success(
        response?.message ||
          response?.data?.message ||
          "Task status updated successfully",
      );
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update status");
    }
  };

  const handleDelete = async (taskId) => {
    try {
      await deleteTaskApi(taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      toast.success("Task deleted successfully");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete task");
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
    <div className="max-w-5xl mx-auto p-6 rounded-lg shadow border border-gray-300 mt-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">
          {isDeveloper ? "My Tasks" : "Project Tasks"}
        </h1>
        {isTeamLead || isManager ? (
          <button
            className="flex items-center px-4 py-2 bg-gray-800 text-white rounded-md cursor-pointer"
            onClick={() => navigate("/tasks/create")}
          >
            <FaPlus />
            <span className="ml-2">Add</span>
          </button>
        ) : null}
      </div>

      {isTeamLead ||
        (isManager && (
          <div className="mb-4">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Project
            </label>
            <select
              className="w-full max-w-md h-11 px-4 border border-gray-300 rounded-md"
              value={selectedProjectId}
              onChange={(e) => handleProjectChange(e.target.value)}
            >
              <option value="">Select a project</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        ))}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-center">#</TableHead>
            <TableHead>Title</TableHead>
            {isTeamLead && <TableHead>Assignee</TableHead>}
            <TableHead>Project</TableHead>
            <TableHead>Task Assigned By</TableHead>
            <TableHead>Project Manager</TableHead>
            <TableHead>Status</TableHead>
            {(isTeamLead || isDeveloper || isManager) && (
              <TableHead>Actions</TableHead>
            )}{" "}
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-gray-500 py-4">
                No tasks found
              </TableCell>
            </TableRow>
          ) : (
            tasks.map((task, index) => (
              <TableRow key={task.id}>
                <TableCell className="text-center ms-2">{index + 1}</TableCell>
                <TableCell>{task.title}</TableCell>
                {isTeamLead && (
                  <TableCell>
                    {task.assignedTo?.first_name} {task.assignedTo?.last_name}
                  </TableCell>
                )}
                <TableCell>{task.project?.name || "—"}</TableCell>
                <TableCell>
                  {`${task.createdBy.first_name} ${task.createdBy.last_name}`}
                </TableCell>{" "}
                <TableCell>
                  {`${task.project?.createdBy.first_name} ${task.project?.createdBy.last_name}`}
                </TableCell>
                <TableCell>
                  <select
                    className="border rounded px-2 py-1 text-sm"
                    value={task.status}
                    onChange={(e) =>
                      handleStatusChange(task.id, e.target.value)
                    }
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s.replace("_", " ")}
                      </option>
                    ))}
                  </select>
                </TableCell>
                <TableCell className="flex items-center">
                     {(isDeveloper || isTeamLead || isManager) && (
                    <button
                      type="button"
                      className="px-3 py-1 text-sm bg-gray-800 text-white rounded-md cursor-pointer ms-2"
                      onClick={() =>
                        navigate(`/tasks/${task.id}/chat`, { state: { task } })
                      }
                    >
                      {isManager || isTeamLead ? "Reply" : "Chat"}
                    </button>
                  )}
                  {(isDeveloper || isTeamLead || isManager) && (
                    <button
                      type="button"
                      className="ms-2 px-3 py-1 text-sm bg-gray-800 text-white rounded-md cursor-pointer text-center"
                      onClick={() => navigate(`/tasks/${task.id}`)}
                    >
                      View
                    </button>
                  )}
               
                  {(isTeamLead || isManager) && (
                    <button
                      type="button"
                      className="px-3 py-1 text-sm bg-gray-800 text-white rounded-md cursor-pointer ms-2"
                      onClick={() => navigate(`/tasks/edit/${task.id}`)}
                    >
                      Edit
                    </button>
                  )}
                  <div className="h-1 flex" />
                  {(isTeamLead || isManager) && (
                    <button
                      className="px-3 py-1 text-sm bg-gray-800 text-white rounded-md cursor-pointer ms-2"
                      onClick={() => handleDelete(task.id)}
                    >
                      Delete
                    </button>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default TaskList;
