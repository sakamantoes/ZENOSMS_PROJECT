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

export const getGetatextServices = async () => {
  const res = await api.get("/api/admin/all/getatext/services");
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
