import api from "./api.js";

/**
 * Payload:
 * {
 *   nairaRate: string,
 *   markupType: "fixed" | "percentage",
 *   markupValue: string
 * }
 *
 * Returns:
 * {
 *   status: 200,
 *   success: true,
 *   message: "you have successfully updated product price",
 *   data: {
 *     _id: string,
 *     usdToNgnRate: string,
 *     globalMarkupType: "fixed" | "percentage",
 *     globalMarkupValue: string,
 *     createdAt: string,
 *     updatedAt: string
 *   }
 * }
 */
export const updateGlobalPricingSettings = async (payload) => {
  const res = await api.post("/api/admin/pricing/setting", payload);
  return res.data;
};

/**
 * Payload:
 * {
 *   page?: number,
 *   limit?: number
 * }
 *
 * Returns:
 * {
 *   status: 200,
 *   success: true,
 *   message: "success",
 *   data: {
 *     total: number,
 *     otpOrders: Array<{
 *       _id: string,
 *       userId: { _id: string, username: string, email: string },
 *       provider: "smsbower" | "getatext",
 *       service: string,
 *       country: string,
 *       phoneNumber: string,
 *       activationId: string,
 *       status: "WAITING_FOR_SMS",
 *       otpCode: string | null,
 *       otpMessage: string | null,
 *       sellingPrice: number,
 *       providerPrice: number,
 *       expiresAt: string,
 *       purchasedAt: string,
 *       createdAt: string,
 *       updatedAt: string
 *     }>
 *   }
 * }
 */
export const getOtpOrder = async ({ page = 1, limit = 5 } = {}) => {
  const res = await api.get("/api/admin/pending/otp", {
    params: { page, limit },
  });
  return res.data;
};

/**
 * Payload:
 * {
 *   page?: number,
 *   limit?: number,
 *   service?: string,
 *   search?: string
 * }
 *
 * Returns:
 * {
 *   status: 200,
 *   success: true,
 *   message: "services has been fetched",
 *   data: Array<{
 *     _id: string,
 *     providerService: string,
 *     providerCountry: string,
 *     provider: "smsbower",
 *     providerPrice: number,
 *     internalService: string,
 *     internalCountry: string,
 *     customPrice: number | null,
 *     stock: number,
 *     active: boolean,
 *     providerId: string,
 *     lastFetchedAt: string,
 *     availability: boolean,
 *     costPrice: number,
 *     sellingPrice: number
 *   }>,
 *   pagination: {
 *     page: number,
 *     limit: number,
 *     total: number,
 *     totalPages: number
 *   }
 * }
 */
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

/**
 * Payload:
 * No payload or query parameters.
 *
 * Returns:
 * {
 *   status: 200,
 *   success: true,
 *   message: "successfull",
 *   data: Array<{
 *     internalService: string,
 *     totalCountries: number,
 *     totalStock: number,
 *     activeCount: number,
 *     totalListings: number,
 *     active: boolean
 *   }>
 * }
 */
export const getSmsBowerServiceNames = async () => {
  const res = await api.get("/api/admin/all/bower/service-name");
  return res.data;
};

/**
 * Payload:
 * {
 *   page?: number,
 *   limit?: number,
 *   service?: string,
 *   search?: string
 * }
 *
 * Returns:
 * Same shape as getSmsBowerServices, but each service has provider: "getatext".
 */
export const getGetatextServices = async ({
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

/**
 * Payload:
 * No payload or query parameters.
 *
 * Returns:
 * Same shape as getSmsBowerServiceNames, but aggregated from getatext services.
 */
export const getGetatextServiceNames = async () => {
  const res = await api.get("/api/admin/all/getatext/services");
  return res.data;
};

/**
 * Payload:
 * {
 *   service: string,
 *   active: boolean
 * }
 *
 * Returns:
 * {
 *   status: 200,
 *   success: true,
 *   message: "service status updated successfully",
 *   data: {
 *     service: string,
 *     active: boolean,
 *     modifiedCount: number
 *   }
 * }
 */
export const toggleSmsBowerServiceActiveStatus = async (service, active) => {
  const res = await api.patch(`/api/admin/service/bower/${service}/active`, {
    active,
  });
  return res.data;
};

/**
 * Payload:
 * {
 *   id: string,
 *   customPrice: number | null | ""
 * }
 *
 * Returns:
 * {
 *   status: 200,
 *   success: true,
 *   message: "custom price updated successfully",
 *   data: {
 *     _id: string,
 *     providerService: string,
 *     providerCountry: string,
 *     provider: "smsbower" | "getatext",
 *     providerPrice: number,
 *     internalService: string,
 *     internalCountry: string,
 *     customPrice: number | null,
 *     stock: number,
 *     active: boolean,
 *     providerId: string,
 *     lastFetchedAt: string,
 *     availability: boolean,
 *     createdAt: string,
 *     updatedAt: string
 *   }
 * }
 */
export const setCustomPriceOnService = async (id, customPrice) => {
  const res = await api.patch(`/api/admin/platform/service/${id}/custom-price`, {
    customPrice,
  });
  return res.data;
};

/**
 * Payload:
 * No payload or query parameters.
 *
 * Returns:
 * {
 *   status: 200,
 *   success: true,
 *   message: "fetched SMSPool balance successfully",
 *   data: {
 *     balance: number,
 *     currency: "USD",
 *     raw: {
 *       status: string,
 *       balance: string
 *     }
 *   }
 * }
 */
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

export const getUsaServiceName = getGetatextServices;
export const getOtherServiceName = getSmsBowerServiceNames;
export const getUsaService = getGetatextServiceNames;
