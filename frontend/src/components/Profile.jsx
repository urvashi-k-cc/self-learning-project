import { useEffect, useState } from "react";
import { getUserProfileApi } from "../helpers/apiRequest";

const Profile = () => {
  const [user, setUser] = useState({
    first_name: "",
    last_name: "",
    email: "",
    role: ""
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const res = await getUserProfileApi();
        console.log("User Profile Response----------------->>>>>>>>>>>", res);
        setUser(res.user);
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
      }
    };
    fetchUserProfile();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-2xl bg-white shadow-lg rounded-2xl p-6 md:p-10">
        {/* Header */}
        <div className="mb-6 border-b pb-4">
          <h1 className="text-2xl font-bold text-gray-800">
            Welcome, {user.first_name} {user.last_name}
          </h1>
          <p className="text-gray-500 text-sm">
            Manage your profile information
          </p>
        </div>

        {/* Profile Info */}
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600 font-medium">Name</span>
            <span className="text-gray-900">
              {user.first_name} {user.last_name}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600 font-medium">Email</span>
            <span className="text-gray-900">{user.email}</span>
            
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600 font-medium">Role</span>
            <span className="text-gray-900">{user.role}</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Profile;