import { getTaskByIdApi } from "../helpers/apiRequest";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const ViewTaskDetails = () => {
  const { id } = useParams();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTask = async () => {
      try {
        const res = await getTaskByIdApi(id);
        setTask(res.task);
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to load task");
      } finally {
        setLoading(false);
      }
    };

    loadTask();
  }, [id]);

  const statusLabels = {
    todo: "To Do",
    in_progress: "In Progress",
    review: "Review",
    done: "Done",
  };

  const statusColors = {
    todo: "bg-gray-100 text-gray-700",
    in_progress: "bg-blue-100 text-blue-700",
    review: "bg-yellow-100 text-yellow-700",
    done: "bg-green-100 text-green-700",
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-60">
        <Loader2 className="animate-spin w-8 h-8" />
      </div>
    );
  }

  if (!task) {
    return <div className="text-center mt-10 text-red-500">Task not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white shadow-md rounded-xl border overflow-hidden">
        {/* Header */}
        <div className="border-b px-6 py-4">
          <h1 className="text-2xl font-bold">{task.title}</h1>
          <p className="text-gray-500 mt-1">Task Details & Information</p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Description */}
          <div>
            <h3 className="font-semibold text-gray-700 mb-2">Description</h3>
            <p className="text-gray-600 leading-relaxed">
              {task.description || "No description available"}
            </p>
          </div>

          {/* Status */}
          <div>
            <h3 className="font-semibold text-gray-700 mb-2">Status</h3>
            <span
              className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                statusColors[task.status]
              }`}
            >
              {statusLabels[task.status]}
            </span>
          </div>

          {/* Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4">
              <p className="text-sm text-gray-500">Assigned To</p>
              <p className="font-medium">
                {task.assignedTo?.first_name} {task.assignedTo?.last_name}
              </p>
            </div>

            <div className="border rounded-lg p-4">
              <p className="text-sm text-gray-500">Assigned By</p>
              <p className="font-medium">
                {task.createdBy?.first_name} {task.createdBy?.last_name}
              </p>
            </div>

            <div className="border rounded-lg p-4">
              <p className="text-sm text-gray-500">Project</p>
              <p className="font-medium">{task.project?.name || "N/A"}</p>
            </div>

            {/* <div className="border rounded-lg p-4">
              <p className="text-sm text-gray-500">Task ID</p>
              <p className="font-medium">{task.id}</p>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewTaskDetails;
