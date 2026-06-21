import api from "./api";

/**
 * ==============================
 * PAYMENT SERVICE API
 * ==============================
 *
 * This file handles all payment-related requests:
 * 1. Initialize Virtual Deposit Account
 * 2. Check Payment Status
 * 3. Webhook (backend-only - NOT used in frontend normally)
 *
 * Base URL: /payment
 * Requires: JWT token in headers (except webhook)
 */

/**
 * ==============================
 * 1. INITIALIZE DEPOSIT ACCOUNT
 * ==============================
 *
 * Endpoint: POST /payment/initialize-deposit
 *
 * Description:
 * - Creates a virtual bank account for the logged-in user
 * - If account already exists, returns existing account instead
 *
 * Headers:
 * - Authorization: Bearer <token>
 *
 * Response Example:
 * {
 *   success: true,
 *   message: "Account created successfully",
 *   data: {
 *     accountNumber: "1234567890",
 *     accountName: "JOHN DOE",
 *     bankName: "WEMA BANK"
 *   }
 * }
 */
export const initializeDeposit = async () => {
  const response = await api.post("/payment/initialize-deposit");
  return response.data;
};

/**
 * ==============================
 * 2. GET PAYMENT STATUS
 * ==============================
 *
 * Endpoint: POST /payment/status
 *
 * Description:
 * - Fetches the status of a deposit transaction
 * - Used to check if payment is still PENDING, SUCCESS, or FAILED
 *
 * Body:
 * {
 *   referenceId: "TRX123456"
 * }
 *
 * Response Example:
 * {
 *   success: true,
 *   message: "Payment status fetched",
 *   data: {
 *     referenceId: "TRX123456",
 *     status: "PENDING"
 *   }
 * }
 */
export const getPaymentStatus = async (referenceId) => {
  const response = await api.post("/payment/status", {
    referenceId,
  });

  return response.data;
};

/**
 * ==============================
 * 3. WEBHOOK (BACKEND ONLY)
 * ==============================
 *
 * Endpoint: POST /payment/webhook
 *
 * Description:
 * - Called automatically by DsocioPay when payment is received
 * - NOT meant to be used by frontend
 *
 * Payload Example:
 * {
 *   event: "payment_received",
 *   data: {
 *     transaction_id: "TRX123",
 *     amount: 5000,
 *     settlement: 4900,
 *     fee: 100,
 *     currency: "NGN",
 *     customer: {
 *       name: "John Doe",
 *       email: "john@gmail.com",
 *       account_number: "1234567890"
 *     }
 *   }
 * }
 *
 * Behavior:
 * - Finds user via virtual account number
 * - Prevents duplicate transactions
 * - Creates wallet transaction record
 */
export const sendWebhookData = async (payload) => {
  const response = await api.post("/payment/webhook", payload);
  return response.data;
};