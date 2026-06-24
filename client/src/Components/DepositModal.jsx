// components/DepositModal.jsx

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Wallet,
  Loader2,
  CheckCircle,
  AlertCircle,
  Clock,
  Copy,
  RefreshCw,
  Building2,
  User,
  DollarSign,
  Zap,
  Shield,
  Info,
} from "lucide-react";
import { initializeDeposit, getPaymentStatus } from "../Service/payment";

// ─── Constants ────────────────────────────────────────────────────────────────
const POLLING_INTERVAL = 10000; // 10 seconds
const MAX_RETRY_ATTEMPTS = 3;
const STATUS = {
  PENDING: "PENDING",
  SUCCESS: "SUCCESS",
  FAILED: "FAILED",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return "₦0";
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// ─── Error Parser ─────────────────────────────────────────────────────────────
const parseError = (err) => {
  // Handle validation errors (422)
  if (err?.response?.data?.error) {
    const errorData = err.response.data.error;
    if (typeof errorData === "object") {
      // Join all error messages
      const messages = Object.values(errorData).filter(Boolean);
      return messages.join(". ") || "Validation failed";
    }
    return String(errorData);
  }

  // Handle message field
  if (err?.response?.data?.message) {
    const msg = err.response.data.message;
    if (typeof msg === "object") {
      const messages = Object.values(msg).filter(Boolean);
      return messages.join(". ") || "Something went wrong";
    }
    return String(msg);
  }

  // Fallback
  return err?.message || "An unexpected error occurred";
};

// ─── Main Component ──────────────────────────────────────────────────────────
const DepositModal = ({
  isOpen,
  onClose,
  onSuccess,
  amount = 0,
  paymentMethod = "SQUAD",
}) => {
  // ─── State ──────────────────────────────────────────────────────────────────
  const [step, setStep] = useState("INITIALIZING");
  const [loading, setLoading] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [status, setStatus] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [pollingInterval, setPollingInterval] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [copiedField, setCopiedField] = useState(null);

  const modalRef = useRef(null);
  const hasInitialized = useRef(false);
  const isMounted = useRef(true);

  // ─── Cleanup ─────────────────────────────────────────────────────────────────
  const stopPolling = useCallback(() => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
  }, [pollingInterval]);

  const resetState = useCallback(() => {
    stopPolling();
    hasInitialized.current = false;
    setStep("INITIALIZING");
    setPaymentData(null);
    setStatus(null);
    setStatusMessage("");
    setError(null);
    setCheckingStatus(false);
    setRetryCount(0);
    setCopied(false);
    setCopiedField(null);
  }, [stopPolling]);

  // ─── Payment Status Check ──────────────────────────────────────────────────
  const checkPaymentStatus = useCallback(
    async (referenceId) => {
      if (!referenceId || !isMounted.current) return false;

      try {
        const response = await getPaymentStatus(referenceId);

        if (response?.success && response?.data) {
          const statusData = response.data;
          const currentStatus =
            statusData.status?.toUpperCase() || STATUS.PENDING;

          if (!isMounted.current) return false;

          setStatus(currentStatus);
          setStatusMessage(statusData.message || "");
          setPaymentData((prev) => ({ ...prev, ...statusData }));

          if (currentStatus === STATUS.SUCCESS) {
            stopPolling();
            setStep("COMPLETED");
            if (onSuccess) onSuccess(statusData);
            return true;
          } else if (currentStatus === STATUS.FAILED) {
            stopPolling();
            setStep("COMPLETED");
            return true;
          }
        }
        return false;
      } catch (err) {
        console.error("Status check error:", err);
        if (!isMounted.current) return false;

        if (retryCount < MAX_RETRY_ATTEMPTS) {
          setRetryCount((prev) => prev + 1);
          return false;
        }

        setError("Failed to check payment status. Please try again manually.");
        return false;
      }
    },
    [onSuccess, retryCount, stopPolling],
  );

  // ─── Start Polling ──────────────────────────────────────────────────────────
  const startPolling = useCallback(
    (referenceId) => {
      stopPolling();

      const interval = setInterval(async () => {
        if (!isMounted.current) {
          clearInterval(interval);
          return;
        }
        const completed = await checkPaymentStatus(referenceId);
        if (completed) {
          clearInterval(interval);
        }
      }, POLLING_INTERVAL);

      setPollingInterval(interval);
    },
    [checkPaymentStatus, stopPolling],
  );

  // ─── Initialize Payment ─────────────────────────────────────────────────────
  const initializePayment = useCallback(async () => {
    if (!isOpen || hasInitialized.current || !isMounted.current) return;

    setLoading(true);
    setError(null);
    setStep("INITIALIZING");

    try {
      // ── FIX: Send amount and paymentMethod ────────────────────────────────
      const payload = {
        amount: amount > 0 ? amount : 100, // Default to 100 if no amount
        paymentMethod: paymentMethod,
      };

      const response = await initializeDeposit(payload);

      if (!isMounted.current) return;

      if (response?.success && response?.data) {
        const data = response.data;
        setPaymentData(data);
        setStep("ACCOUNT_DETAILS");
        setStatus(STATUS.PENDING);
        setStatusMessage("Awaiting payment confirmation");
        hasInitialized.current = true;

        if (data.referenceId) {
          startPolling(data.referenceId);
        }
      } else {
        // ── FIX: Handle validation errors from backend ──────────────────────
        const errorMsg =
          response?.message ||
          response?.error ||
          "Failed to initialize payment";
        setError(
          typeof errorMsg === "object" ? JSON.stringify(errorMsg) : errorMsg,
        );
        setStep("INITIALIZING");
      }
    } catch (err) {
      console.error("Initialize payment error:", err);
      if (!isMounted.current) return;

      // ── FIX: Parse error messages properly ────────────────────────────────
      const errorMsg = parseError(err);
      setError(errorMsg);
      setStep("INITIALIZING");
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [isOpen, amount, paymentMethod, startPolling]);

  // ─── Manual Status Check ────────────────────────────────────────────────────
  const handleCheckStatus = async () => {
    if (!paymentData?.referenceId || checkingStatus) return;

    setCheckingStatus(true);
    setError(null);
    setRetryCount(0);

    try {
      const completed = await checkPaymentStatus(paymentData.referenceId);
      if (!completed && isMounted.current) {
        setStatusMessage("Still waiting for payment confirmation...");
      }
    } catch (err) {
      if (isMounted.current) {
        setError(parseError(err));
      }
    } finally {
      if (isMounted.current) {
        setCheckingStatus(false);
      }
    }
  };

  // ─── Copy to Clipboard ──────────────────────────────────────────────────────
  const handleCopy = useCallback((text, field) => {
    if (!text) return;

    navigator.clipboard
      .writeText(String(text))
      .then(() => {
        setCopied(true);
        setCopiedField(field);
        setTimeout(() => {
          setCopied(false);
          setCopiedField(null);
        }, 3000);
      })
      .catch(() => {
        // Fallback
        const textArea = document.createElement("textarea");
        textArea.value = String(text);
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        setCopied(true);
        setCopiedField(field);
        setTimeout(() => {
          setCopied(false);
          setCopiedField(null);
        }, 3000);
      });
  }, []);

  // ─── Handle Close ──────────────────────────────────────────────────────────
  const handleClose = useCallback(() => {
    stopPolling();
    resetState();
    onClose();
  }, [stopPolling, resetState, onClose]);

  // ─── Handle Overlay Click ──────────────────────────────────────────────────
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  // ─── Effects ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    isMounted.current = true;

    if (isOpen) {
      initializePayment();
    } else {
      resetState();
    }

    return () => {
      isMounted.current = false;
      stopPolling();
    };
  }, [isOpen, initializePayment, resetState, stopPolling]);

  // ─── Keyboard Escape ────────────────────────────────────────────────────────
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, handleClose]);

  // ─── Status Display Helpers ─────────────────────────────────────────────────
  const getStatusIcon = () => {
    if (status === STATUS.SUCCESS)
      return <CheckCircle className="w-6 h-6 text-green-500" />;
    if (status === STATUS.FAILED)
      return <AlertCircle className="w-6 h-6 text-red-500" />;
    return <Clock className="w-6 h-6 text-yellow-500" />;
  };

  const getStatusColor = () => {
    if (status === STATUS.SUCCESS) return "text-green-500";
    if (status === STATUS.FAILED) return "text-red-500";
    return "text-yellow-500";
  };

  const getStatusBg = () => {
    if (status === STATUS.SUCCESS) return "bg-green-500/10 border-green-500/20";
    if (status === STATUS.FAILED) return "bg-red-500/10 border-red-500/20";
    return "bg-yellow-500/10 border-yellow-500/20";
  };

  const getStatusLabel = () => {
    if (status === STATUS.SUCCESS) return "Payment Successful!";
    if (status === STATUS.FAILED) return "Payment Failed";
    return "Awaiting Payment";
  };

  // ─── Render Loading ────────────────────────────────────────────────────────
  if (step === "INITIALIZING" && loading) {
    return (
      <AnimatePresence>
        {isOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={handleOverlayClick}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md rounded-2xl bg-gradient-to-br from-gray-900 to-gray-950 border border-white/10 shadow-2xl p-8"
            >
              <div className="text-center">
                <Loader2 className="w-12 h-12 text-green-500 animate-spin mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white font-['Space_Grotesk']">
                  Initializing Deposit
                </h3>
                <p className="text-gray-400 text-sm mt-2">
                  Please wait while we set up your payment...
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    );
  }

  if (error && step === "INITIALIZING") {
    return (
      <AnimatePresence>
        {isOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={handleOverlayClick}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md rounded-2xl bg-gradient-to-br from-gray-900 to-gray-950 border border-white/10 shadow-2xl p-8"
            >
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white font-['Space_Grotesk']">
                  Something went wrong
                </h3>
                <div className="text-red-400 text-sm mt-2 break-words">
                  {typeof error === "string" ? error : JSON.stringify(error)}
                </div>
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => {
                      setError(null);
                      hasInitialized.current = false;
                      initializePayment();
                    }}
                    className="flex-1 px-6 py-2.5 rounded-lg bg-gradient-to-r from-green-600 to-green-500 text-white font-semibold hover:from-green-500 hover:to-green-400 transition-all shadow-lg shadow-green-500/25"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={handleClose}
                    className="flex-1 px-6 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    );
  }

  // ─── Render Main Modal ──────────────────────────────────────────────────────
  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={handleOverlayClick}
        >
          <motion.div
            ref={modalRef}
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-md rounded-2xl bg-gradient-to-br from-gray-900 to-gray-950 border border-white/10 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-white/5 bg-gray-900/95 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-green-600 to-green-500 shadow-lg shadow-green-500/20">
                  <Wallet className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white font-['Space_Grotesk']">
                    Deposit Funds
                  </h3>
                  <p className="text-xs text-gray-400">
                    {amount > 0
                      ? `Amount: ${formatCurrency(amount)}`
                      : "Transfer to your wallet"}
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                disabled={status === STATUS.SUCCESS}
                className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              {/* Account Details */}
              {paymentData && step === "ACCOUNT_DETAILS" && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/5 border border-green-500/20">
                    <div className="flex items-center gap-2 text-green-400 text-sm mb-3">
                      <Zap className="w-4 h-4" />
                      <span className="font-medium">
                        Transfer to this account
                      </span>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-400">Bank</span>
                        </div>
                        <span className="text-sm text-white font-medium">
                          {paymentData.bankName}
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 group">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-400">
                            Account Number
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-mono text-white font-bold">
                            {paymentData.accountNumber}
                          </span>
                          <button
                            onClick={() =>
                              handleCopy(paymentData.accountNumber, "account")
                            }
                            className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                            aria-label="Copy account number"
                          >
                            {copied && copiedField === "account" ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-400">
                            Account Name
                          </span>
                        </div>
                        <span className="text-sm text-white font-medium">
                          {paymentData.accountName}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default DepositModal;
