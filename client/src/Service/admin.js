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


export const getOtherServiceName = async () => {
  const res = await api.get("/api/admin/all/bower/service-name");
  return res.data;
};

export const getUsaServiceName = async ({
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

export const getUsaService = async () => {
  const res = await api.get("/api/admin/all/getatext/services");
  return res.data;
};

 
export const toggleSmsBowerServiceActiveStatus = async (service, active) => {
  const res = await api.patch(`/api/admin/service/bower/${service}/active`, {
    active,
  });
  return res.data;
};

export const setCustomPriceOnService = async (id, customPrice) => {
  const res = await api.patch(`/api/admin/platform/service/${id}/custom-price`, {
    customPrice,
  });
  return res.data;
};


export const getGetatextProviderBalance = async () => {
  const res = await api.get("/api/admin/getatext/balance");
  return res.data;
};