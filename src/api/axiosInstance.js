// src/api/axiosInstance.js
import axios from "axios";
import { toast } from "react-toastify";

// ✅ Load backend URL safely
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL
  ? import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "")
  : "http://localhost:5000";

// ✅ Construct API base URL
const API_BASE_URL = `${BACKEND_URL}/api`;

// 🧩 Debug log (for safety)
console.log("✅ Using API base URL:", API_BASE_URL);

// ✅ Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
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
