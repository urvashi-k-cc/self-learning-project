import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
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
  createTaskApi,
  updateTaskStatusApi,
  getProjectDevelopersApi,
  getProjectsApi,
} from "../helpers/apiRequest";
import { useAuth } from "../context/AuthContext";

const STATUSES = ["todo", "in_progress", "review", "done"];

const TaskList = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const initialProjectId = searchParams.get("projectId") || "";

  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [developers, setDevelopers] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(initialProjectId);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    assignedToId: "",
    status: "todo",
  });
  const [loading, setLoading] = useState(true);

  const isTeamLead = user?.role === "teamLead";
  const isDeveloper = user?.role === "developer";

  const loadTasks = async (projectId) => {
    const res = await getTasksApi(projectId ? Number(projectId) : undefined);
    setTasks(res.tasks || []);
  };

  useEffect(() => {
    const init = async () => {
      try {
        if (isTeamLead) {
          const projectsRes = await getProjectsApi();
          setProjects(projectsRes.projects || []);
          const pid = initialProjectId || projectsRes.projects?.[0]?.id;
          if (pid) {
            setSelectedProjectId(String(pid));
            const devRes = await getProjectDevelopersApi(Number(pid));
            setDevelopers(devRes.developers || []);
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
  }, [isTeamLead, isDeveloper, initialProjectId]);

  const handleProjectChange = async (projectId) => {
    setSelectedProjectId(projectId);
    try {
      if (projectId) {
        const devRes = await getProjectDevelopersApi(Number(projectId));
        setDevelopers(devRes.developers || []);
        await loadTasks(projectId);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load project data");
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const res = await createTaskApi({
        title: form.title,
        description: form.description,
        projectId: Number(selectedProjectId),
        assignedToId: Number(form.assignedToId),
        status: form.status,
      });
      toast.success(res.message || "Task assigned");
      setShowForm(false);
      setForm({ title: "", description: "", assignedToId: "", status: "todo" });
      await loadTasks(selectedProjectId);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to assign task");
    }
  };

  const handleStatusChange = async (taskId, status) => {
    try {
      await updateTaskStatusApi(taskId, status);
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status } : t))
      );
      toast.success("Status updated");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update status");
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
        {isTeamLead && selectedProjectId && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-gray-800 text-white rounded-md cursor-pointer"
          >
            {showForm ? "Cancel" : "Assign Task"}
          </button>
        )}
      </div>

      {isTeamLead && (
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
      )}

      {showForm && isTeamLead && (
        <form
          onSubmit={handleCreateTask}
          className="mb-6 p-4 border border-gray-200 rounded-lg space-y-3"
        >
          <input
            type="text"
            placeholder="Task title"
            required
            className="w-full h-10 px-3 border rounded-md"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <textarea
            placeholder="Description (optional)"
            className="w-full px-3 py-2 border rounded-md"
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
          />
          <select
            required
            className="w-full h-10 px-3 border rounded-md"
            value={form.assignedToId}
            onChange={(e) =>
              setForm({ ...form, assignedToId: e.target.value })
            }
          >
            <option value="">Assign to developer</option>
            {developers.map((d) => (
              <option key={d.id} value={d.id}>
                {d.first_name} {d.last_name}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="px-4 py-2 bg-gray-900 text-white rounded-md"
          >
            Assign
          </button>
        </form>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            {isTeamLead && <TableHead>Assignee</TableHead>}
            <TableHead>Project</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={isTeamLead ? 4 : 3}
                className="text-center text-gray-500"
              >
                No tasks found
              </TableCell>
            </TableRow>
          ) : (
            tasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell>{task.title}</TableCell>
                {isTeamLead && (
                  <TableCell>
                    {task.assignedTo?.first_name} {task.assignedTo?.last_name}
                  </TableCell>
                )}
                <TableCell>{task.project?.name || "—"}</TableCell>
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
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default TaskList;
