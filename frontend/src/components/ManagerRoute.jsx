import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ManagerRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (user?.role !== "manager") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ManagerRoute;
