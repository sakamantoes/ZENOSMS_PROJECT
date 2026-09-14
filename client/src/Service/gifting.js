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

export const addProductToCart = async (productId, quantity = 1) => {
  const res = await api.post("/api/user/cart/add", { productId, quantity });
  return res.data;
};

export const getCart = async () => {
  const res = await api.get("/api/user/cart");
  return res.data;
};

export const removeCartItem = async (productId) => {
  const res = await api.delete(`/api/user/cart/${productId}`);
  return res.data;
};

export const increaseCartItemQuantity = async (productId) => {
  const res = await api.patch(`/api/user/cart/${productId}/increase`);
  return res.data;
};

export const decreaseCartItemQuantity = async (productId) => {
  const res = await api.patch(`/api/user/cart/${productId}/decrease`);
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
