// service/auth.js
import api from './api';

export const login = async (credentials) => {
  try {
    const response = await api.post("/auth/login", credentials);
    
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
    const response = await api.post("/auth/signup", userData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getAuthUser = async () => {
  try {
    const response = await api.get("/auth/me");
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const logout = async () => {
  try {
    const response = await api.post("/auth/logout");
    localStorage.removeItem("zenosms_token");
    localStorage.removeItem("zenosms_user");
    return response.data;
  } catch (error) {
    throw error;
  }
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