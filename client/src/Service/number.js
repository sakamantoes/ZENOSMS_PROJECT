// services/number.js

import api from "./api";

// ================= COUNTRIES =================
export const getAllCountry = async () => {
  const res = await api.get("/api/otp/countrys");
  return res.data;
};

// ================= SERVICES =================
export const getAvailableServices = async () => {
  const res = await api.get("/api/user/platform/services");
  return res.data;
};

// ================= BUY NUMBER =================
export const buyNumber = async (payload) => {
  const res = await api.post("/api/user/buy/services", payload);
  return res.data;
};

// ================= CHECK OTP =================
export const checkOtpStatus = async (orderId) => {
  const res = await api.get(`/api/user/otp/status/${orderId}`);
  return res.data;
};

// ================= CANCEL ACTIVATION =================
export const cancelActivation = async (orderId) => {
  const res = await api.post(`/api/user/otp/cancel/${orderId}`);
  return res.data;
};

// ================= ORDER HISTORY =================
export const getMyOrders = async () => {
  const res = await api.get("/api/user/otp/orders");
  return res.data;
};

// ================= USER BALANCE =================
export const getUserBalance = async () => {
  const res = await api.get("/api/otp/my-balance");
  return res.data;
};

// ================= ORDER DETAILS =================
export const getOrderDetails = async (orderId) => {
  const res = await api.get(`/api/otp/order/${orderId}`);
  return res.data;
};

// ================= SMSBOWER BALANCE =================
export const getSmsBowerBalance = async () => {
  const res = await api.get("/api/otp/sms-balance");
  return res.data;
};

// ================= GETATEXT SERVICES =================
export const getGetatextServices = async () => {
  const res = await api.get("/api/user/getatext/services");
  return res.data;
};

// ================= BUY GETATEXT SERVICE =================
export const buyGetatextService = async (payload) => {
  const res = await api.post("/api/user/buy/getatext/service", payload);
  return res.data;
};

// ================= CANCEL GETATEXT SERVICE =================
export const cancelGetatextService = async (orderId) => {
  const res = await api.post(`/api/user/cancel-rental`, { id: orderId });
  return res.data;
};

// ================= GET PLATFORM SERVICES (BOWER) =================
export const getPlatformServices = async (params = {}) => {
  const res = await api.get("/api/user/bower/services", { params });
  return res.data;
};

// ================= BUY BOWER SERVICE =================
export const buyBowerService = async (payload) => {
  const res = await api.post("/api/user/buy/bower/services", payload);
  return res.data;
};

// ================= GET USER OTP ORDERS =================
export const getUserOtpOrders = async () => {
  const res = await api.get("/api/user/otp/orders");
  return res.data;
};

// ================= CHECK OTP ORDER STATUS (SMSBOWER) =================
export const checkOtpOrderStatus = async (orderId) => {
  const res = await api.get(`/api/user/otp/status/${orderId}`);
  return res.data;
};

// ================= CHECK GETATEXT OTP STATUS =================
export const checkGetatextOtpStatus = async (orderId) => {
  // POST with { id: orderId } as per the API documentation
  const res = await api.post(`/api/user/getatext/otp/status`, { id: orderId });
  return res.data;
};

// ================= CANCEL OTP AND REFUND =================
export const cancelOtpAndRefund = async (orderId) => {
  const res = await api.post(`/api/user/otp/cancel/${orderId}`);
  return res.data;
};

// ================= GET USER WALLET BALANCE =================
export const getUserWalletBalance = async () => {
  const res = await api.get("/api/user/wallet/balance");
  return res.data;
};

// ================= GET USER DEPOSITS =================
export const getUserDeposits = async () => {
  const res = await api.get("/api/user/wallet/deposits");
  return res.data;
};

// ================= GET PURCHASE HISTORY =================
export const getPurchaseHistory = async () => {
  const res = await api.get("/api/user/purchase/receipt");
  return res.data;
};

// ================= GET ALL USER DEPOSITS (ADMIN) =================
export const getAllUserDeposits = async () => {
  const res = await api.get("/api/admin/deposits");
  return res.data;
};

// ================= GET PLATFORM DEPOSITS (ADMIN) =================
export const getPlatformDeposits = async () => {
  const res = await api.get("/api/admin/platform/deposits");
  return res.data;
};

// ================= GET GETATEXT PROVIDER BALANCE =================
export const getGetatextProviderBalance = async () => {
  const res = await api.get("/api/otp/getatext-balance");
  return res.data;
};

// ================= GET SYSTEM NOTIFICATIONS =================
export const getSystemNotifications = async (limit = 10) => {
  const res = await api.get(`/api/admin/notifications?limit=${limit}`);
  return res.data;
};

// ================= GET RECENT SYSTEM NOTIFICATIONS =================
export const getRecentSystemNotifications = async (limit = 5) => {
  const res = await api.get(`/api/admin/notifications/recent?limit=${limit}`);
  return res.data;
};

// ================= GET ALL USERS (ADMIN) =================
export const getAllUsers = async () => {
  const res = await api.get("/api/admin/users");
  return res.data;
};

// ================= GET USER BY ID =================
export const getUserById = async (userId) => {
  const res = await api.get(`/api/admin/users/${userId}`);
  return res.data;
};

// ================= UPDATE USER STATUS =================
export const updateUserStatus = async (userId, status) => {
  const res = await api.patch(`/api/admin/users/${userId}/status`, { status });
  return res.data;
};

// ================= DELETE USER =================
export const deleteUser = async (userId) => {
  const res = await api.delete(`/api/admin/users/${userId}`);
  return res.data;
};

// ================= GET SYSTEM STATS (ADMIN) =================
export const getSystemStats = async () => {
  const res = await api.get("/api/admin/stats");
  return res.data;
};

// ================= GET ACTIVE OTP ORDERS =================
export const getActiveOtpOrders = async () => {
  const res = await api.get("/api/admin/otp/active");
  return res.data;
};

// ================= GET NUMBER INVENTORY =================
export const getNumberInventory = async () => {
  const res = await api.get("/api/admin/numbers/inventory");
  return res.data;
};

// ================= ADD NUMBERS TO INVENTORY =================
export const addNumbersToInventory = async (payload) => {
  const res = await api.post("/api/admin/numbers/add", payload);
  return res.data;
};