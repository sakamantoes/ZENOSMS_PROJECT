import api from "./api";

export const updateGlobalPricingSettings = async (payload) => {
  const res = await api.post("/api/admin/pricing/setting", payload);
  return res.data;
};

export const getSmsBowerServices = async ({
  page = 1,
  limit = 25,
  service = "",
  search = "",
} = {}) => {
  const res = await api.get("/api/admin/all/bower/services", {
    params: { page, limit, service, search },
  });
  return res.data;
};

export const getSmsBowerServiceNames = async () => {
  const res = await api.get("/api/admin/all/bower/service-name");
  return res.data;
};

export const getGetatextServiceNames = async ({
  page = 1,
  limit = 25,
  service = "",
  search = "",
} = {}) => {
  const res = await api.get("/api/admin/all/getatext/service-name", {
    params: { page, limit, service, search },
  });
  return res.data;
};

export const getGetatextServices = async ({
  page = 1,
  limit = 100,
  service = "",
} = {}) => {
  const res = await api.get("/api/admin/all/getatext/services", {
    params: { page, limit, service },
  });
  return res.data;
};

export const toogleGetatextService = async (service, active) => {
  const res = await api.patch(
    `/api/admin/Service/getatext/${service}/active`,
    {
      active,
    },
  );
  return res.data;
};

export const toggleSmsBowerServiceActiveStatus = async (service, active) => {
  const res = await api.patch(`/api/admin/Service/bower/${service}/active`, {
    active,
  });
  return res.data;
};

export const setCustomPriceOnService = async (id, customPrice) => {
  const res = await api.patch(
    `/api/admin/platform/Service/${id}/custom-price`,
    {
      customPrice,
    },
  );
  return res.data;
};

export const getOtpOrder = async () => {
  const res = await api.get("/api/admin/pending/otp");
  return res.data;
};

export const getGetatextProviderBalance = async () => {
  const res = await api.get("/api/admin/getatext/balance");
  return res.data;
};

export const getPlatformDeposits = async () => {
  const res = await api.post("/api/admin/deposit");

  return res.data;
};

export const updatePlatformDepositStatus = async (id, status) => {
  const res = await api.patch(`/api/admin/deposit/${id}`, {
    status: String(status).toLowerCase(),
  });

  return res.data;
};

export const getSocialServices = async ({
  platform = "",
  category = "",
  status = "",
  isVisible = "",
  search = "",
  page = 1,
  limit = 20,
} = {}) => {
  const params = { page, limit };
  if (platform) params.platform = platform;
  if (category) params.category = category;
  if (status) params.status = status;
  if (isVisible !== "") params.isVisible = isVisible;
  if (search) params.search = search;

  const res = await api.get("/api/admin/social/services", { params });
  return res.data;
};

export const updateSocialServiceVisibility = async (id, isVisible) => {
  const res = await api.patch(`/api/admin/social/services/${id}/visibility`, {
    isVisible,
  });
  return res.data;
};

export const updateSocialServiceCustomPrice = async (id, customPrice) => {
  const res = await api.patch(
    `/api/admin/social/services/${id}/custom-price`,
    { customPrice },
  );
  return res.data;
};

export const getWorkingFormats = async () => {
  const res = await api.get("/api/admin/working/formats");
  return res.data;
};

export const createWorkingFormat = async (payload) => {
  const res = await api.post("/api/admin/working/formats", payload);
  return res.data;
};

export const updateWorkingItemDetails = async (id, payload) => {
  const res = await api.patch(`/api/admin/working/${id}/details`, payload);
  return res.data;
};

export const updateWorkingItemStatus = async (id, status) => {
  const res = await api.patch(`/api/admin/working/${id}/status`, { status });
  return res.data;
};

export const getWorkingTools = async () => {
  const res = await api.get("/api/admin/working/tools");
  return res.data;
};

export const createWorkingTool = async (payload) => {
  const res = await api.post("/api/admin/working/tools", payload);
  return res.data;
};

export const uploadToolImage = async (file) => {
  const formData = new FormData();
  formData.append("image", file);
  const res = await api.post("/api/file/upload-logo", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const deleteToolImage = async (path) => {
  const res = await api.delete("/api/file/delete-logo", { data: { path } });
  return res.data;
};


export const getProductCategories = async ({
  page = 1,
  limit = 20,
  search = "",
} = {}) => {
  const res = await api.get("/api/admin/product/categories", {
    params: { page, limit, search },
  });
  return res.data;
};

export const createProductCategory = async (payload) => {
  const res = await api.post("/api/admin/product/category", payload);
  return res.data;
};

export const updateProductCategory = async (id, payload) => {
  const res = await api.patch(`/api/admin/product/category/${id}`, payload);
  return res.data;
};

export const getProductCategoryBySlug = async (slug) => {
  const res = await api.get(`/api/admin/product/category/${slug}`);
  return res.data;
};

export const getProductsByCategory = async (
  categorySlug,
  { page = 1, limit = 20, search = "" } = {},
) => {
  const res = await api.get(`/api/admin/products/${categorySlug}`, {
    params: { page, limit, search },
  });
  return res.data;
};

export const getSocialOrders = async ({
  userId = "",
  status = "",
  provider = "",
  search = "",
  page = 1,
  limit = 20,
} = {}) => {
  const params = { page, limit };
  if (userId) params.userId = userId;
  if (status) params.status = status;
  if (provider) params.provider = provider;
  if (search) params.search = search;

  const res = await api.get("/api/admin/social/orders", { params });
  return res.data;
};

export const getWorkingOrders = async () => {
  const res = await api.get("/api/admin/working/orders");
  return res.data;
};


export const getOtpOrders = async () => {
  const res = await api.get("/api/admin/otp/orders");
  return res.data;
};

export const createProduct = async (categorySlug, payload) => {
  const res = await api.post(`/api/admin/product/${categorySlug}`, payload);
  return res.data;
};

export const updateProduct = async (id, payload) => {
  const res = await api.patch(`/api/admin/product/${id}`, payload);
  return res.data;
};

export const createDeliveryRate = async (payload) => {
  const res = await api.post("/api/admin/delivery-rate", payload);
  return res.data;
};

export const getDeliveryRates = async ({
  page = 1,
  limit = 20,
  search = "",
} = {}) => {
  const res = await api.get("/api/admin/delivery-rates", {
    params: { page, limit, search },
  });
  return res.data;
};

export const updateDeliveryRate = async (id, payload) => {
  const res = await api.patch(`/api/admin/delivery-rate/${id}`, payload);
  return res.data;
};

export const deleteDeliveryRate = async (id) => {
  const res = await api.delete(`/api/admin/delivery-rate/${id}`);
  return res.data;
};

export const getTrackedOrders = async ({
  page = 1,
  limit = 20,
  search = "",
  orderStatus = "",
  paymentStatus = "",
} = {}) => {
  const res = await api.get("/api/admin/orders", {
    params: { page, limit, search, orderStatus, paymentStatus },
  });
  return res.data;
};

export const getOrderById = async (id) => {
  const res = await api.get(`/api/admin/order/${id}`);
  return res.data;
};

export const updateOrderStatus = async (id, payload) => {
  const res = await api.patch(`/api/admin/order/${id}/status`, payload);
  return res.data;
};

export const cancelOrder = async (id, payload) => {
  const res = await api.patch(`/api/admin/order/${id}/cancel`, payload);
  return res.data;
};

