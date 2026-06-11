import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { GoProjectSymlink } from "react-icons/go";
import { FiUsers } from "react-icons/fi";
import {
  LuClipboardCheck,
  LuClipboardList,
  LuLoader,
  LuClock,
  LuCircleCheck,
  LuCircleDashed,
} from "react-icons/lu";
import {
  totalProjectsApi,
  totalUsersApi,
  taskStatsApi,
} from "../helpers/apiRequest";

const StatCard = ({ label, value, icon, borderColor, loading }) => (
  <div
    className={`bg-white p-5 rounded-lg shadow-sm border-l-4 ${borderColor} flex justify-between items-center`}
  >
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <h2 className="text-3xl font-bold text-gray-800 mt-1">
        {loading ? (
          <span className="inline-block w-10 h-7 bg-gray-200 animate-pulse rounded" />
        ) : (
          value ?? 0
        )}
      </h2>
    </div>
    <div className="text-3xl opacity-80">{icon}</div>
  </div>
);

const statusMeta = {
  todo:        { label: "To Do",       color: "bg-gray-400",   textColor: "text-gray-600",  icon: <LuCircleDashed /> },
  in_progress: { label: "In Progress", color: "bg-blue-400",   textColor: "text-blue-600",  icon: <LuLoader /> },
  review:      { label: "In Review",   color: "bg-yellow-400", textColor: "text-yellow-600",icon: <LuClipboardList /> },
  done:        { label: "Done",        color: "bg-green-400",  textColor: "text-green-600", icon: <LuCircleCheck /> },
};

const TaskStatsSection = ({ stats, loading, title }) => {
  const statuses = ["todo", "in_progress", "review", "done"];
  const total = stats?.total || 0;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 mt-6">
      <h3 className="text-base font-semibold text-gray-700 mb-4">{title}</h3>

      {/* Progress bar */}
      {total > 0 && (
        <div className="flex rounded-full overflow-hidden h-3 mb-5 gap-0.5">
          {statuses.map((s) => {
            const count = stats?.[s] || 0;
            const pct = total > 0 ? (count / total) * 100 : 0;
            return pct > 0 ? (
              <div
                key={s}
                className={`${statusMeta[s].color} transition-all duration-500`}
                style={{ width: `${pct}%` }}
                title={`${statusMeta[s].label}: ${count}`}
              />
            ) : null;
          })}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {statuses.map((s) => {
          const meta = statusMeta[s];
          const count = stats?.[s] || 0;
          return (
            <div
              key={s}
              className="flex flex-col items-center justify-center p-3 rounded-lg bg-gray-50 border border-gray-100"
            >
              <span className={`text-2xl mb-1 ${meta.textColor}`}>
                {meta.icon}
              </span>
              <p className="text-2xl font-bold text-gray-800">
                {loading ? (
                  <span className="inline-block w-8 h-6 bg-gray-200 animate-pulse rounded" />
                ) : (
                  count
                )}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">{meta.label}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const QuickLinks = ({ links }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 mt-6">
    <h3 className="text-base font-semibold text-gray-700 mb-3">Quick Links</h3>
    <div className="flex flex-wrap gap-3">
      {links.map(({ to, label }) => (
        <Link
          key={to}
          to={to}
          className="px-4 py-2 bg-gray-800 text-white text-sm rounded-md hover:bg-gray-700 transition-colors"
        >
          {label}
        </Link>
      ))}
    </div>
  </div>
);

const roleBanner = {
  manager:  { bg: "bg-orange-50 border-orange-200",  text: "text-orange-700", label: "Manager Dashboard" },
  teamLead: { bg: "bg-blue-50 border-blue-200",      text: "text-blue-700",   label: "Team Lead Dashboard" },
  developer:{ bg: "bg-green-50 border-green-200",    text: "text-green-700",  label: "Developer Dashboard" },
};

const ManagerDashboard = ({ user }) => {
  const [totalProjects, setTotalProjects] = useState(null);
  const [totalUsers, setTotalUsers]       = useState(null);
  const [taskStats, setTaskStats]         = useState(null);
  const [loading, setLoading]             = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [projRes, usersRes, statsRes] = await Promise.all([
          totalProjectsApi(),
          totalUsersApi(),
          taskStatsApi(),
        ]);
        setTotalProjects(projRes.total);
        setTotalUsers(usersRes.total);
        setTaskStats(statsRes.stats);
      } catch (err) {
        toast.error(err?.response?.data?.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <StatCard
          label="Total Projects"
          value={totalProjects}
          icon={<GoProjectSymlink className="text-orange-400" />}
          borderColor="border-orange-400"
          loading={loading}
        />
        <StatCard
          label="Total Users"
          value={totalUsers}
          icon={<FiUsers className="text-blue-400" />}
          borderColor="border-blue-400"
          loading={loading}
        />
        <StatCard
          label="Completed Tasks"
          value={taskStats?.done}
          icon={<LuClipboardCheck className="text-green-400" />}
          borderColor="border-green-400"
          loading={loading}
        />
      </div>

      <TaskStatsSection stats={taskStats} loading={loading} title="All Tasks Overview" />

      <QuickLinks
        links={[
          { to: "/projects",    label: "View Projects" },
          { to: "/add-project", label: "Create Project" },
          { to: "/tasks",       label: "View Tasks" },
        ]}
      />
    </>
  );
};

// ─── Team Lead Dashboard ──────────────────────────────────────────────────────
const TeamLeadDashboard = ({ user }) => {
  const [totalProjects, setTotalProjects] = useState(null);
  const [taskStats, setTaskStats]         = useState(null);
  const [loading, setLoading]             = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [projRes, statsRes] = await Promise.all([
          totalProjectsApi(),
          taskStatsApi(),
        ]);
        setTotalProjects(projRes.total);
        setTaskStats(statsRes.stats);
      } catch (err) {
        toast.error(err?.response?.data?.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <StatCard
          label="My Projects"
          value={totalProjects}
          icon={<GoProjectSymlink className="text-blue-400" />}
          borderColor="border-blue-400"
          loading={loading}
        />
        <StatCard
          label="Total Tasks"
          value={taskStats?.total}
          icon={<LuClipboardList className="text-purple-400" />}
          borderColor="border-purple-400"
          loading={loading}
        />
        <StatCard
          label="Completed Tasks"
          value={taskStats?.done}
          icon={<LuClipboardCheck className="text-green-400" />}
          borderColor="border-green-400"
          loading={loading}
        />
      </div>

      <TaskStatsSection stats={taskStats} loading={loading} title="Team Tasks Overview" />

      <QuickLinks
        links={[
          { to: "/projects",    label: "View Projects" },
          { to: "/tasks",       label: "View Tasks" },
          { to: "/tasks/create",label: "Create Task" },
        ]}
      />
    </>
  );
};

const DeveloperDashboard = ({ user }) => {
  const [taskStats, setTaskStats] = useState(null);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await taskStatsApi();
        setTaskStats(res.stats);
      } catch (err) {
        toast.error(err?.response?.data?.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <StatCard
          label="My Tasks"
          value={taskStats?.total}
          icon={<LuClipboardList className="text-blue-400" />}
          borderColor="border-blue-400"
          loading={loading}
        />
        <StatCard
          label="In Progress"
          value={taskStats?.in_progress}
          icon={<LuLoader className="text-yellow-400" />}
          borderColor="border-yellow-400"
          loading={loading}
        />
        <StatCard
          label="Completed"
          value={taskStats?.done}
          icon={<LuClipboardCheck className="text-green-400" />}
          borderColor="border-green-400"
          loading={loading}
        />
      </div>

      <TaskStatsSection stats={taskStats} loading={loading} title="My Task Breakdown" />

      <QuickLinks links={[{ to: "/tasks", label: "View My Tasks" }]} />
    </>
  );
};

// ─── Root Dashboard ───────────────────────────────────────────────────────────
const Dashboard = () => {
  const { user } = useAuth();
  const role = user?.role;
  const banner = roleBanner[role] || roleBanner.developer;

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header banner */}
      <div className={`rounded-lg border p-4 mb-6 ${banner.bg}`}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-xl font-bold ${banner.text}`}>
              {banner.label}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Welcome back,{" "}
              <span className="font-medium text-gray-700">
                {user?.first_name} {user?.last_name}
              </span>
            </p>
          </div>
          <span
            className={`text-xs font-semibold px-3 py-1 rounded-full border ${banner.bg} ${banner.text} capitalize`}
          >
            {role}
          </span>
        </div>
      </div>

      {role === "manager"  && <ManagerDashboard  user={user} />}
      {role === "teamLead" && <TeamLeadDashboard user={user} />}
      {role === "developer"&& <DeveloperDashboard user={user} />}
    </div>
  );
};

export default Dashboard;
