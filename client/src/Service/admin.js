import api from "./api.js";

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
    `/api/admin/service/getatext/${service}/active`,
    {
      active,
    },
  );
  return res.data;
};

export const toggleSmsBowerServiceActiveStatus = async (service, active) => {
  const res = await api.patch(`/api/admin/service/bower/${service}/active`, {
    active,
  });
  return res.data;
};

export const setCustomPriceOnService = async (id, customPrice) => {
  const res = await api.patch(
    `/api/admin/platform/service/${id}/custom-price`,
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
