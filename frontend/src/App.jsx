import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import PublicLayout from "./layout/PublicLayout";
import ProtectedLayout from "./layout/PrivateLayout";
import Register from "./components/register";
import Dashboard from "./components/dashboard";
import Login from "./components/login";
import ForgotPassword from "./components/ForgetPassword";
import ResetPassword from "./components/ResetPassword";
import { Toaster } from "sonner";
import Profile from "./components/Profile";
import ManagerRoute from "./components/ManagerRoute";
import CreateProject from "./components/CreateEditProject";
import ProjectList from "./components/ProjectList";
import TeamsList from "./components/TeamList";
import TaskList from "./components/TaskList";
import RoleRoute from "./components/RoleRoute";
import NotFound from "./components/NotFound";
import CreateEditTask from "./components/CreateEditTask";
import ViewTaskDetails from "./components/ViewTask";


export default function App() {
  return (
    <>
      <Toaster
        position="top-right"
        richColors
        toastOptions={{ style: { zIndex: 9999 } }}
        duration={2000}
      />
      <BrowserRouter>
        <Routes>
          {/* Default Route */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          {/* Public Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
          </Route>

          {/* Protected Routes */}
          <Route element={<ProtectedLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route
              path="/projects"
              element={
                <RoleRoute allowedRoles={["manager", "teamLead"]}>
                  <ProjectList />
                </RoleRoute>
              }
            />
            {/* <Route
              path="/teams"
              element={
                <ManagerRoute>
                  <TeamsList />
                </ManagerRoute>
              }
            /> */}
            <Route
              path="/tasks"
              element={
                <RoleRoute allowedRoles={["teamLead", "developer" ,"manager"]}>
                  <TaskList />
                </RoleRoute>
              }
            />
            <Route path="/tasks/create" element={
              <RoleRoute allowedRoles={["teamLead", "manager"]}>
                <CreateEditTask />
              </RoleRoute>
            } />

              <Route path="/tasks/edit/:id" element={ 
              <RoleRoute allowedRoles={["teamLead", "manager"]}>
                <CreateEditTask />
              </RoleRoute>
            } />

            <Route path="/tasks/:id" element={
              <RoleRoute allowedRoles={["teamLead", "developer" ,"manager"]}>
                <ViewTaskDetails />
              </RoleRoute>
            } />

            <Route
              path="/add-project"
              element={
                <ManagerRoute>
                  <CreateProject />
                </ManagerRoute>
              }
            />
            <Route
              path="/edit-project/:id"
              element={
                <ManagerRoute>
                  <CreateProject />
                </ManagerRoute>
              }
            />
          </Route>

          {/* Invalid Routes */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}
