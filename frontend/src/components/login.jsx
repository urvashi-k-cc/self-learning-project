import React from "react";
import { Link } from "react-router-dom";
import GoogleSvg from "../assets/svg/GoogleSvg";
import MicrosoftSvg from "../assets/svg/MicrosoftSvg";
import { AiOutlineEyeInvisible, AiOutlineEye } from "react-icons/ai";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { loginValidation } from "./schema/loginValidation";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginUserApi, userGoogleLoginApi } from "../helpers/apiRequest";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { GoogleLogin } from "@react-oauth/google";
const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(loginValidation) });

  const handleGoogleLoginSuccess = async (credentialResponse) => {
    try {
      const tokenId = credentialResponse?.credential;
      if (!tokenId) {
        throw new Error("Google credential not received");
      }
      const response = await userGoogleLoginApi(tokenId);

      if (response.success === true) {
        localStorage.setItem("token", response.accessToken);
        setUser(response.user);
        navigate("/dashboard");
        toast.success(response.message || "Google login successful!");
      }
    } catch (error) {
      const msg = error.response?.data?.message || error.message || "Google login failed";
      console.error("Google Login error:", error);
      toast.error(msg);
    }
  };

  const handleGoogleLoginError = () => {
    toast.error("Google sign-in failed. Please try again.");
  };

  const onSubmit = async (data) => {
    console.log("Login button clicked");
    console.log("Form Data>>>>>>>>>>>>>>>>>>>", data);
    try {
      const response = await loginUserApi(data);
      console.log("API Response>>>>>>>>>>>>>>>>>", response);
      if (response.success === true) {
        localStorage.setItem("token", response.accessToken);
        
        setUser(response.user);
        navigate("/dashboard");
        toast.success(response.message || "Login successful!");
      }
    } catch (error) {
      const msg = error.response?.data?.message;
      console.log("API Error:", msg);
      toast.error(msg || "Login failed");
    }
  };
  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 md:block md:p-0">
      <div className="w-full max-w-[544px] p-6 bg-white shadow-2xl rounded-xl md:absolute md:top-5 md:left-1/2 md:transform md:-translate-x-1/2 md:w-[544px] md:h-[560px] md:p-4">
        <div className="w-full md:w-[513px] md:h-[327px] gap-7 bg-white">
          <div className="header flex flex-col gap-2">
            <h1 className="text-black text-3xl font-extrabold line-clamp-4">
              Sign in
            </h1>{" "}
          </div>
          <form
            className="form gap-5 mt-4"
            onSubmit={handleSubmit(onSubmit)}
            autoComplete="off"
          >
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="email"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="Email"
              autoComplete="new-email"
              className="w-full h-12 px-4 mb-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-red-500 text-xs font-semibold mb-2 ">
                {errors.email.message}
              </p>
            )}
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="password"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                autoComplete="new-password"
                {...register("password")}
                className="w-full h-12 px-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-[#24272A]"
              >
                {showPassword ? (
                  <AiOutlineEyeInvisible size={22} />
                ) : (
                  <AiOutlineEye size={22} />
                )}
              </span>

              {errors.password && (
                <p className="text-red-500 text-xs font-semibold mb-2 ml-1 mt-2">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="flex justify-between items-center mt-3 mb-6">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="remember"
                  className="w-4 h-4 mr-2 text-blue-600 bg-gray-100 border-[#D0D0D0] focus:ring-blue-500 rounded-md"
                />
                <label
                  htmlFor="remember"
                  className="text-sm  font-bold text-[#7C858E]"
                >
                  Remember me
                </label>
              </div>
              <Link
                to="/forgot-password"
                className="text-sm font-bold text-gray-800 hover:underline"
              >
                Forgot Password?
              </Link>
            </div>
            <button
              type="submit"
              className="w-full py-2 px-4 h-10 bg-gray-900 text-white font-bold rounded-md hover:bg-gray-800 transition duration-300 cursor-pointer"
            >
              Sign In
            </button>
            {/* Social Login */}
            <div className="flex flex-col items-center justify-center mt-6 p-3">
              <span className="text-sm font-medium text-[#A0A0A0]">
                Login with
              </span>
              <div className=" gap-4 my-3 items-center">
              <GoogleLogin
                onSuccess={handleGoogleLoginSuccess}
                onError={handleGoogleLoginError}
              />
              {/* <div className="bg-[#F5F5F5] p-5 relative w-6 h-6 rounded-full">
                <MicrosoftSvg className="absolute inset-0 m-auto w-6 h-6" />
              </div> */}
            </div>
            </div>

            <p className="text-center text-gray-600 font-bold text-[13px] mt-6">
              Don't have an account?{" "}
              <a href="/register" className="text-gray-900 hover:underline">
                Sign Up
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
