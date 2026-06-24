// service/payment.js

import api from "./api";

export const initializeDeposit = async (data) => {
  const response = await api.post("/api/payment/initialize-deposit", data);
  return response.data;
};

export const getPaymentStatus = async (referenceId) => {
  const response = await api.post("/api/payment/status", {
    referenceId,
  });
  return response.data;
};

export const getAlluserPurchaseReceipt = async () => {
  const res = await api.get("/api/user/purchase/receipt");

  return res.data;
};
