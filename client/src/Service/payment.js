// service/payment.js

import api from "./api";

/**
 * ==============================
 * PAYMENT SERVICE API
 * ==============================
 */

/**
 * 1. INITIALIZE DEPOSIT ACCOUNT
 * 
 * Endpoint: POST /api/payment/initialize-deposit
 * 
 * Request Body:
 * {
 *   amount: number,        // Required - Amount to deposit
 *   paymentMethod: string  // Required - "SQUAD" or "MANUAL_TRANSFER"
 * }
 */
export const initializeDeposit = async (data) => {
  const response = await api.post("/api/payment/initialize-deposit", data);
  return response.data;
};

/**
 * 2. GET PAYMENT STATUS
 * 
 * Endpoint: POST /api/payment/status
 * 
 * Request Body:
 * {
 *   referenceId: string  // Required - Transaction reference ID
 * }
 */
export const getPaymentStatus = async (referenceId) => {
  const response = await api.post("/api/payment/status", {
    referenceId,
  });
  return response.data;
};

/**
 * 3. WEBHOOK (BACKEND ONLY)
 */
export const sendWebhookData = async (payload) => {
  const response = await api.post("/api/payment/webhook", payload);
  return response.data;
};