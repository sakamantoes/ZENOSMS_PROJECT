import api from "./api";

export const createLog = async (payload) => {
  const res = await api.post("/api/logs/send", payload);
  return res.data;
};

export const getAdminLogs = async ({
  page = 1,
  limit = 20,
  search = "",
} = {}) => {
  const res = await api.get("/api/logs", {
    params: { page, limit, search },
  });
  return res.data;
};

export const getActivePlatformLogs = async ({
  page = 1,
  limit = 20,
  name = "",
  category = "",
} = {}) => {
  const res = await api.get("/api/logs/active", {
    params: { page, limit, name, category },
  });
  return res.data;
};

export const updateLogSellingPrice = async (id, sellingPrice) => {
  const res = await api.patch(`/api/logs/${id}/price`, { sellingPrice });
  return res.data;
};

export const buyLog = async (id) => {
  const res = await api.post(`/api/logs/buy/${id}`);
  return res.data;
};

export const buyActiveLog = async ({ logId, quantity = 1 }) => {
  const res = await api.post("/api/logs/active/buy", { logId, quantity });
  return res.data;
};

export const getUserAccountOrders = async ({
  page = 1,
  limit = 20,
  search = "",
  purchaseStatus = "",
  deliveryStatus = "",
} = {}) => {
  const res = await api.get("/api/logs/orders", {
    params: { page, limit, search, purchaseStatus, deliveryStatus },
  });
  return res.data;
};

export const getUserAccountOrderById = async (id) => {
  const res = await api.get(`/api/logs/orders/${id}`);
  return res.data;
};

export const getAdminAccountOrders = async ({
  page = 1,
  limit = 20,
  search = "",
  userId = "",
  purchaseStatus = "",
  deliveryStatus = "",
} = {}) => {
  const res = await api.get("/api/logs/admin/orders", {
    params: { page, limit, search, userId, purchaseStatus, deliveryStatus },
  });
  return res.data;
};

export const getAdminAccountOrderById = async (id) => {
  const res = await api.get(`/api/logs/admin/orders/${id}`);
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
