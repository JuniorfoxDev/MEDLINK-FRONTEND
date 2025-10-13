// src/api/axiosInstance.js
import axios from "axios";
import { toast } from "react-toastify";

// ✅ Use Vite env variable (VITE_API_BASE_URL) — not process.env
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

// ✅ Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false,
  timeout: 10000,
});

// ✅ Request Interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("🪪 Token attached to request");
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Response Interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      toast.error("Session expired. Please log in again.");
      localStorage.removeItem("token");
      window.location.href = "/login";
    } else if (status === 403) {
      toast.error("Access denied.");
    } else if (status >= 500) {
      toast.error("Server error. Try again later.");
    }

    return Promise.reject(error);
  }
);

export default api;
