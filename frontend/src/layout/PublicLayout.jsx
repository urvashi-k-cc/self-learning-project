import { Outlet } from "react-router-dom";

const PublicLayout = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Outlet />
    </div>
  );
};

export default PublicLayout;
