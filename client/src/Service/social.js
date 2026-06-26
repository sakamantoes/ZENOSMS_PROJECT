import api from "./api.js";

export const getSocialPlatforms = async () => {
  const res = await api.get("/api/user/social/platforms");
  return res.data;
};

export const getSocialCategories = async (platform) => {
  const res = await api.get("/api/user/social/categories", { params: { platform } });
  return res.data;
};

export const getSocialServicesByCategory = async (platform, category) => {
  const res = await api.get("/api/user/social/services", {
    params: { platform, category },
  });
  return res.data;
};

export const placeSocialOrder = async ({ id, link, quantity }) => {
  const res = await api.post("/api/user/social/order", { id, link, quantity });
  return res.data;
};

export const getSocialOrders = async () => {
  const res = await api.get("/api/user/social/orders");
  return res.data;
};
