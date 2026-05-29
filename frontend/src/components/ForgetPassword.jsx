import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { forgetPasswordApi } from "../helpers/apiRequest";

// validation schema
const forgotPasswordValidation = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email"),
});

const ForgetPassword = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(forgotPasswordValidation),
  });

  const onSubmit = async (data) => {
    try {
      setLoading(true);

      const response = await forgetPasswordApi(data.email);

      toast.success(response.message || "Reset link sent successfully");

      reset();
    } catch (error) {
      console.log(error);

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
              Forgot Password
            </h1>

            <p className="text-sm text-gray-500">
              Enter your registered email address
            </p>
          </div>

          <form className="form gap-5 mt-6" onSubmit={handleSubmit(onSubmit)}>
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="email"
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              autoComplete="off"
              {...register("email")}
              className="w-full h-12 px-4 mb-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {errors.email && (
              <p className="text-red-500 text-xs font-semibold mb-3">
                {errors.email.message}
              </p>
            )}

            <div className="flex gap-4 mt-6 mb-2">
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="flex-1 h-10 bg-gray-500 text-white font-bold rounded-md hover:bg-gray-600 transition duration-300 text-sm cursor-pointer"
              >
                Back to Login
              </button>

              <button
                type="submit"
                disabled={loading}
                className="flex-1 h-10 bg-blue-500 text-white font-bold rounded-md hover:bg-blue-600 transition duration-300 text-sm disabled:opacity-50 cursor-pointer"
              >
                {loading ? "Sending..." : "Submit"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgetPassword;
