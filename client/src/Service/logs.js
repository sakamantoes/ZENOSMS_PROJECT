import api from "./api";

export const createLog = async (payload) => {
  const res = await api.post("/api/logs/send", payload);
  return res.data;
};

export const getLogs = async () => {
  const res = await api.get("/api/logs");
  return res.data;
};

export const buyLog = async (id) => {
  const res = await api.post(`/api/logs/buy/${id}`);
  return res.data;
};

export const updateLog = async (id, payload) => {
  const res = await api.put(`/api/logs/${id}`, payload);
  return res.data;
};

export const deleteLog = async (id) => {
  const res = await api.delete(`/api/logs/${id}`);
  return res.data;
};

export const getMyPurchasedLogs = async () => {
  const res = await api.get("/api/logs/my-purchased");
  return res.data;
};

export const getLogById = async (id) => {
  const res = await api.get(`/api/logs/${id}`);
  return res.data;
};