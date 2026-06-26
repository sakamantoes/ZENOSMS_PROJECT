// service/auth.js

import api from './api';

// ─── Authentication ──────────────────────────────────────────────────────────

export const login = async (credentials) => {
  try {
    const response = await api.post("api/auth/login", credentials);
    
    if (response.data?.data?.token) {
      localStorage.setItem("zenosms_token", response.data.data.token);
      localStorage.setItem("zenosms_user", JSON.stringify(response.data.data));
    }
    
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const signup = async (userData) => {
  try {
    const response = await api.post("api/auth/signup", userData);
    
    // If signup returns token, store it
    if (response.data?.data?.token) {
      localStorage.setItem("zenosms_token", response.data.data.token);
      localStorage.setItem("zenosms_user", JSON.stringify(response.data.data));
    }
    
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Google login function
export const googleLogin = async (credential) => {
  try {
    const response = await api.post("api/auth/google", { token: credential });
    
    if (response.data?.data?.token) {
      localStorage.setItem("zenosms_token", response.data.data.token);
      localStorage.setItem("zenosms_user", JSON.stringify(response.data.data));
    }
    
    return response.data;
  } catch (error) {
    throw error;
  }
};

// New Google auth for Vercel integration
export const googleAuthVercel = async (token) => {
  const VERCEL_BASE = import.meta.env.VITE_VERCEL_URL; // e.g. https://your-app.vercel.app
  
  const response = await fetch(`${VERCEL_BASE}/api/google-auth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.message || "Google auth failed");
    error.response = { data, status: response.status };
    throw error;
  }

  // Return in same shape your existing code expects
  return { status: response.status, data };
};

export const getAuthUser = async () => {
  try {
    const response = await api.get("api/auth/me");
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const logout = async () => {
  try {
    const response = await api.post("api/auth/logout");
    localStorage.removeItem("zenosms_token");
    localStorage.removeItem("zenosms_user");
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ─── Password Management ──────────────────────────────────────────────────────

export const forgotPassword = async (data) => {
  const res = await api.post("api/auth/forgot/password", data);
  return res.data;
};

export const resetPassword = async (token, data) => {
  const res = await api.post(`api/auth/reset-password/${token}`, data);
  return res.data;
};

// ─── User Management ─────────────────────────────────────────────────────────

export const getAllUsers = async () => {
  const res = await api.get("/api/auth/allUsers");
  return res.data;
};

export const activateUser = async (id) => {
  const res = await api.put(`/api/auth/activate/${id}`);
  return res.data;
};

export const deactivateUser = async (id) => {
  const res = await api.put(`/api/auth/deactivate/${id}`);
  return res.data;
};

// ─── User Profile Updates ────────────────────────────────────────────────────

/**
 * Update user's username
 * @param {string} username - New username
 * @returns {Promise<Object>} Response with updated user data
 */
export const updateUsername = async (username) => {
  const res = await api.put("/api/auth/update-username", { username });
  
  // Update local storage if user data is returned
  if (res.data?.data) {
    const userStr = localStorage.getItem("zenosms_user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        const updatedUser = { ...user, username: res.data.data.username };
        localStorage.setItem("zenosms_user", JSON.stringify(updatedUser));
      } catch (e) {
        // Ignore parsing errors
      }
    }
  }
  
  return res.data;
};

/**
 * Update user's phone number
 * @param {string} phoneNumber - New phone number
 * @returns {Promise<Object>} Response with updated user data
 */
export const updatePhoneNumber = async (phoneNumber) => {
  const res = await api.put("/api/auth/update-phone", { phoneNumber });
  
  // Update local storage if user data is returned
  if (res.data?.data) {
    const userStr = localStorage.getItem("zenosms_user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        const updatedUser = { ...user, phoneNumber: res.data.data.phoneNumber };
        localStorage.setItem("zenosms_user", JSON.stringify(updatedUser));
      } catch (e) {
        // Ignore parsing errors
      }
    }
  }
  
  return res.data;
};

/**
 * Update user's password
 * @param {Object} data - Password data
 * @param {string} data.currentPassword - Current password
 * @param {string} data.newPassword - New password
 * @returns {Promise<Object>} Response with success message
 */
export const updatePassword = async (data) => {
  const res = await api.put("/api/auth/update-password", data);
  return res.data;
};

// ─── Payment Callback ────────────────────────────────────────────────────────

export const VerifyCallback = async (data) => {
  const res = await api.post("api/payment/callback", data);
  return res.data;
};

// ─── Utility Functions ──────────────────────────────────────────────────────

export const isAuthenticated = () => {
  const token = localStorage.getItem("zenosms_token");
  return !!token;
};

export const getUser = () => {
  const userStr = localStorage.getItem("zenosms_user");
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }
  return null;
};

/**
 * Get user's phone number from local storage
 * @returns {string|null} User's phone number or null
 */
export const getUserPhoneNumber = () => {
  const user = getUser();
  return user?.phoneNumber || null;
};

/**
 * Get user's email from local storage
 * @returns {string|null} User's email or null
 */
export const getUserEmail = () => {
  const user = getUser();
  return user?.email || null;
};

/**
 * Get user's username from local storage
 * @returns {string|null} User's username or null
 */
export const getUsername = () => {
  const user = getUser();
  return user?.username || null;
};