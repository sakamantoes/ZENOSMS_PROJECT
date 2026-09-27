import api from "./api.js";

export const getGiftCategories = async () => {
  const res = await api.get("/api/user/products/categories");
  return res.data;
};

export const getGiftProductsByCategory = async (
  slug,
  { page = 1, limit = 20, search = "" } = {},
) => {
  const res = await api.get(`/api/user/products/category/${slug}`, {
    params: { page, limit, search },
  });
  return res.data;
};

export const getGiftProductBySlug = async (slug) => {
  const res = await api.get(`/api/user/products/${slug}`);
  return res.data;
};

export const getGiftDeliveryRates = async () => {
  const res = await api.get("/api/user/delivery-rates");
  return res.data;
};

export const placeGiftOrder = async (payload) => {
  const res = await api.post("/api/user/gift/orders", payload);
  return res.data;
};

export const getGiftOrderHistory = async ({ search = "" } = {}) => {
  const res = await api.get("/api/user/gift/orders", { params: { search } });
  return res.data;
};
