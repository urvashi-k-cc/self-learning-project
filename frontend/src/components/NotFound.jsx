import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-6xl font-bold text-gray-800">404</h1>
      <p className="text-gray-500 mt-2">Page Not Found</p>

      <Link
        to="/"
        className="mt-4 px-4 py-2 bg-gray-900 text-white rounded">
        Go Home
      </Link>
    </div>
  );
};

export default NotFound;