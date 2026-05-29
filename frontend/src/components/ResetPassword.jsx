import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { resetPasswordApi } from "../helpers/apiRequest";
import { AiOutlineEyeInvisible, AiOutlineEye } from "react-icons/ai";

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(1, "Password is required")
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(
        /[@$!%*?&]/,
        "Password must contain at least one special character",
      ),
    confirmPassword: z.string().min(1, "Confirm Password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data) => {
    try {
      setLoading(true);

      const response = await resetPasswordApi({
        token,
        password: data.password,
      });

      toast.success(response.message || "Password reset successful");

      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 md:block md:p-0">
      <div className="w-full max-w-[544px] p-6 bg-white shadow-2xl rounded-xl md:absolute md:top-1/2 md:left-1/2 md:transform md:-translate-x-1/2 md:-translate-y-1/2 md:w-[544px] md:p-4">
        <div className="w-full md:w-[513px] gap-7 bg-white">
          <div className="header flex flex-col gap-2">
            <h1 className="text-black text-3xl font-extrabold">
              Reset Password
            </h1>

            <p className="text-sm text-gray-500 mb-3">
              Enter your new password below
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Password */}
            <div>
              <label className="text-sm font-semibold">New Password</label>

              <div className="relative mt-1">
                <input
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Enter new password"
                />

                <span
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 cursor-pointer"
                >
                  {showPassword ? (
                    <AiOutlineEyeInvisible size={22} />
                  ) : (
                    <AiOutlineEye size={22} />
                  )}
                </span>
              </div>

              {errors.password && (
                <p className="text-red-500 text-xs mt-1 font-semibold">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="text-sm font-semibold">Confirm Password</label>

              <div className="relative mt-1">
                <input
                  type={showConfirm ? "text" : "password"}
                  {...register("confirmPassword")}
                  className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Confirm password"
                />

                <span
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-2.5 cursor-pointer"
                >
                  {showConfirm ? (
                    <AiOutlineEyeInvisible size={22} />
                  ) : (
                    <AiOutlineEye size={22} />
                  )}
                </span>
              </div>

              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1 font-semibold">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Button */}
            <div className="flex gap-4 mt-6 mb-2">
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="w-full bg-gray-500 text-white py-2 rounded-md font-semibold hover:bg-gray-600 cursor-pointer"
              >
                Back to Login
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-500 text-white py-2 rounded-md font-semibold hover:bg-blue-600 disabled:opacity-50 cursor-pointer"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
