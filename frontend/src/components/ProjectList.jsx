import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

import { getProjectsApi, deleteProjectApi } from "../helpers/apiRequest";
import { useEffect, useState } from "react";
import { FaEdit, FaPlus } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";

const getMemberCount = (project) => {
  if (!project.teams?.length) return 0;
  return project.teams.reduce(
    (sum, team) => sum + (team.members?.length || 0),
    0
  );
};

const ProjectsList = () => {
  const [projects, setProjects] = useState([]);
  const [deleteId, setDeleteId] = useState(null);
  const [open, setOpen] = useState(false);

  const navigate = useNavigate();
  const { user } = useAuth();

  const isManager = user?.role === "manager";
  const isTeamLead = user?.role === "teamLead";

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const projectsRes = await getProjectsApi();
        setProjects(projectsRes.projects || []);
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to load projects"
        );
      }
    };
    loadProjects();
  }, []);

  // Open dialog
  const openDeleteDialog = (projectId) => {
    setDeleteId(projectId);
    setOpen(true);
  };

  // Confirm delete 
  const handleDelete = async () => {
    try {
      await deleteProjectApi(deleteId);

      setProjects((prev) =>
        prev.filter((project) => project.id !== deleteId)
      );

      toast.success("Project deleted");

      setOpen(false);
      setDeleteId(null);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to delete project"
      );
    }
  };

  const title = isManager
    ? "All Projects"
    : isTeamLead
      ? "My Projects"
      : "Projects";

  return (
    <div className="max-w-5xl mx-auto p-6 rounded-lg shadow border border-gray-300 mt-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableCell colSpan={4}>
              <div className="flex items-center justify-between w-full">
                <h1 className="text-2xl font-bold">{title}</h1>

                {isManager && (
                  <button
                    className="px-4 py-2 bg-gray-800 text-white rounded-md flex items-center cursor-pointer"
                    onClick={() => navigate("/add-project")}
                  >
                    <FaPlus />
                    <span className="ml-2">Add</span>
                  </button>
                )}
              </div>
            </TableCell>
          </TableRow>

          <TableRow>
            <TableHead>Project Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Members</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {projects.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-gray-500">
                No projects found
              </TableCell>
            </TableRow>
          ) : (
            projects.map((project) => (
              <TableRow key={project.id}>
                <TableCell>{project.name}</TableCell>

                <TableCell className="max-w-37.5 truncate">
                  {project.description || "N/A"}
                </TableCell>

                <TableCell>{getMemberCount(project)}</TableCell>

                <TableCell>
                  {isManager && (
                    <>
                      <button
                        className="px-3 py-2 bg-gray-800 text-white rounded-md cursor-pointer"
                        onClick={() =>
                          navigate(`/edit-project/${project.id}`, {
                            state: { project },
                          })
                        }
                      >
                        <FaEdit />
                      </button>

                      <button
                        className="px-3 py-2 bg-gray-800 text-white rounded-md cursor-pointer ms-2"
                        onClick={() => openDeleteDialog(project.id)}
                      >
                        <MdDelete />
                      </button>
                    </>
                  )}

                  {isTeamLead && (
                    <button
                      className="px-3 py-1 text-sm bg-gray-800 text-white rounded-md cursor-pointer"
                      onClick={() =>
                        navigate(`/tasks?projectId=${project.id}`)
                      }
                    >
                      View Assigned Tasks
                    </button>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Project?</DialogTitle>
            <DialogDescription>
              This action will hide the project. It cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>

            <Button
              variant="destructive"
              onClick={handleDelete}
              className="flex items-center gap-2 cursor-pointer"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectsList;