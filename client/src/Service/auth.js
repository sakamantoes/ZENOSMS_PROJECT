// service/auth.js
import api from './api';

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
    return response.data;
  } catch (error) {
    throw error;
  }
};

// NEW: Google login function
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


export const forgotPassword = async (data) => {
  const res = await api.post("api/auth/forgot/password", data);

  return res.data;
};

export const resetPassword = async (token, data) => {
  const res = await api.post(`api/auth/reset-password/${token}`, data);

  return res.data;
};


export const VerifyCallback = async (data) => {
  const res = await api.post("api/payment/callback", data);

  return res.data;
};

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