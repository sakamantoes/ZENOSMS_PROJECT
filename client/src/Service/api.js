// config/api.js
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL || "http://localhost:3000",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// Request interceptor - add token to headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("zenosms_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;
    const isAuthRequest = originalRequest?.url?.includes("/auth/");
    
    // Handle expired token or unauthorized
    if (error.response?.status === 401 && !isAuthRequest && !originalRequest?._retry) {
      originalRequest._retry = true;
      
      // Clear all auth data
      localStorage.removeItem("zenosms_token");
      localStorage.removeItem("zenosms_user");
      
      // Redirect to auth page
      window.location.href = "/auth";
    }
    
    // Handle JWT expired error (500 with specific message)
    if (error.response?.status === 500 && 
        error.response?.data?.error?.includes("jwt expired") &&
        !isAuthRequest) {
      localStorage.removeItem("zenosms_token");
      localStorage.removeItem("zenosms_user");
      window.location.href = "/auth";
    }
    
    return Promise.reject(error);
  }
);

export default api;