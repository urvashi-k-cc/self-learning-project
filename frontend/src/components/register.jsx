import React from "react";
import { useState } from "react";
import { AiOutlineEyeInvisible, AiOutlineEye } from "react-icons/ai";
import { useForm } from "react-hook-form";
import { registrationValidation } from "./schema/registrationValidation";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerUserApi } from "../helpers/apiRequest";
import { toast } from "sonner";
const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(registrationValidation) });
  
  const onSubmit = async (data) => {
    try {
      console.log("Register button clicked");
      console.log("Form Data>>>>>>>>>>>>>>>>>>>", data);
      const response = await registerUserApi(data);
      console.log("API Response:", response);

      if (response.success) {
        toast.success(response.message || "Registration successful!");
        navigate("/login");
      }
    } catch (error) {
      const msg = error.response?.data?.message;
      console.log("API Error:", msg);
      toast.error(msg || "Registration failed");
    }
  };
  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 md:block md:p-0">
      <div className="w-full max-w-[544px] p-6 bg-white shadow-2xl rounded-xl md:absolute md:top-2.5 md:left-1/2 md:transform md:-translate-x-1/2 md:w-[544px] md:h-[565px] md:p-3.5">
        <div className="w-full md:w-[513px] md:h-[327px] gap-7 bg-white">
          <div className="header flex flex-col gap-2">
            <h1 className="text-black text-3xl font-extrabold line-clamp-4">
              Sign up
            </h1>{" "}
          </div>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="form gap-5 mt-4"
            autoComplete="off"
          >
            {/* First Name */}
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="firstName"
            >
              First Name
            </label>
            <input
              id="firstName"
              type="text"
              placeholder="Enter your first name"
              autoComplete="new-first-name"
              className={`w-full h-12 px-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.first_name
                  ? "border-red-500 mb-1"
                  : "border-gray-300 mb-3"
              }`}
              {...register("first_name")}
            />
            {errors.first_name && (
              <p className="text-red-500 text-xs font-semibold mb-2 ml-1">
                {errors.first_name.message}
              </p>
            )}
            {/* Last Name */}
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="lastName"
            >
              Last Name
            </label>
            <input
              id="lastName"
              type="text"
              placeholder="Enter your last name"
              autoComplete="new-last-name"
              className={`w-full h-12 px-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.last_name
                  ? "border-red-500 mb-1"
                  : "border-gray-300 mb-3"
              }`}
              {...register("last_name")}
            />
            {errors.last_name && (
              <p className="text-red-500 text-xs font-semibold mb-2 ml-1">
                {errors.last_name.message}
              </p>
            )}

            {/* Email */}
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
              className={`w-full h-12 px-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.email ? "border-red-500 mb-1" : "border-gray-300 mb-3"
              }`}
              {...register("email")}
            />
            {errors.email && (
              <p className="text-red-500 text-xs font-semibold mb-2 ml-1">
                {errors.email.message}
              </p>
            )}

            {/* Password */}
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="password"
            >
              Password
            </label>
            <div className={`relative ${errors.password ? "mb-1" : "mb-5"}`}>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                autoComplete="new-password"
                className={`w-full h-12 px-4 pr-12 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.password ? "border-red-500" : "border-gray-300"
                }`}
                {...register("password")}
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
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs font-semibold mb-4 ml-1">
                {errors.password.message}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-2 px-4 h-10 bg-gray-800 text-white font-bold rounded-md hover:bg-gray-700 transition duration-300 cursor-pointer"
            >
              Sign Up
            </button>
            <p className="text-center text-gray-600 font-bold text-[13px] mt-4 ">
              Already have an account?{" "}
              <a href="/login" className="text-gray-800 hover:underline">
                Sign In
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
