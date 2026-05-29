import axios from "axios";
import { refreshToken as refreshTokenUrl } from "../constants/urls";

// Create Axios instance
const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL ||
    "http://localhost:5173",

  timeout: 10000,

  headers: {
    "Content-Type": "application/json",
  },

  withCredentials: true, // IMPORTANT
});

export default api;

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  },

  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      error.response?.data?.message ===
        "Access token expired" &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        // Refresh token automatically sent via cookie
        const res = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL || "http://localhost:9000"}${refreshTokenUrl}`,
          {},
          {
            withCredentials: true,
          }
        );

        const newAccessToken =
          res.data.accessToken;

        // Save new token
        localStorage.setItem(
          "token",
          newAccessToken
        );

        // Retry request
        originalRequest.headers.Authorization =
          `Bearer ${newAccessToken}`;

        return api(originalRequest);

      } catch (refreshError) {

        localStorage.removeItem("token");

        window.location.href = "/login";

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);