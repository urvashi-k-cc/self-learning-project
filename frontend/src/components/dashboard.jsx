import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

const roleLabels = {
  manager: "Manager",
  teamLead: "Team Lead",
  developer: "Developer",
};

const Dashboard = () => {
  const { user } = useAuth();
  const role = user?.role;
  return (
    <div className="p-6 max-w-3xl">
      <h1 className="text-2xl font-bold mb-2">Dashboard</h1>
      <p className="text-gray-600 mb-6">
        Signed in as {user?.first_name} {user?.last_name} (
        {roleLabels[role] || role})
      </p>
      {role === "manager" && (
        <div className="space-y-2">
          <p className="font-medium">You can:</p>
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            <li>
              <Link to="/add-project" className="text-blue-600 hover:underline">
                Create projects
              </Link>{" "}
              with a mandatory Team Lead and developers
            </li>
            <li>
              <Link to="/projects" className="text-blue-600 hover:underline">
                View and manage all projects
              </Link>
            </li>
            <li>
              <Link to="/teams" className="text-blue-600 hover:underline">
                View teams
              </Link>
            </li>
          </ul>
        </div>
      )}

      {role === "teamLead" && (
        <div className="space-y-2">
          <p className="font-medium">You can:</p>
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            <li>
              <Link to="/projects" className="text-blue-600 hover:underline">
                View projects assigned to you
              </Link>
            </li>
            <li>
              <Link to="/tasks" className="text-blue-600 hover:underline">
                Assign and manage tasks
              </Link>{" "}
              for developers on your projects
            </li>
          </ul>
        </div>
      )}

      {role === "developer" && (
        <div className="space-y-2">
          <p className="font-medium">You can:</p>
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            <li>
              <Link to="/tasks" className="text-blue-600 hover:underline">
                View tasks assigned to you
              </Link>{" "}
              and update their status
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
