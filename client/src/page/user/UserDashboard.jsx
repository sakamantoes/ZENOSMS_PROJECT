// pages/user/UserDashboard.jsx

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
  Calendar,
  ArrowUpRight,
  ArrowDownLeft,
  Zap,
  Shield,
  Users,
  Globe,
  Phone,
  Mail,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  Eye,
  EyeOff,
  Copy,
  RefreshCw,
  BarChart3,
  PieChart,
  DollarSign,
  CreditCard,
  Building2,
  User,
  Settings,
  Bell,
  HelpCircle,
  LogOut,
  Smartphone,
  Image,
  ShoppingBag,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import WalletBalanceCard from "../../Components/WalletBalanceCard";
import DepositModal from "../../Components/DepositModal";
import useAuth from "../../store/useAuth";
import { getAllUserDeposits } from "../../Service/wallet";
import { updatePhoneNumber, getUser } from "../../Service/auth.js";
import { getErrorMessage } from "../../utils/getErrorMessage.js";

const UserDashboard = () => {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const [showBalance, setShowBalance] = useState(true);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Phone number modal states
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [isUpdatingPhone, setIsUpdatingPhone] = useState(false);
  const [phoneUpdateSuccess, setPhoneUpdateSuccess] = useState("");

  // Active services data
  const activeServices = [
    { id: 1, name: "Virtual Number - USA", status: "active" },
    { id: 2, name: "Social Media Boost - Instagram", status: "active" },
    { id: 3, name: "OTP Verification", status: "active" },
    { id: 4, name: "Format and tools", status: "active" },
    { id: 5, name: "Working Image", status: "active" },
  ];

  // Quick actions
  const quickActions = [
    {
      label: "Buy Number",
      icon: Phone,
      color: "green",
      path: "/f/usa-numbers",
    },
    {
      label: "Social Boost",
      icon: TrendingUp,
      color: "blue",
      path: "/f/social-media-boosting",
    },
    {
      label: "Make Deposit",
      icon: Wallet,
      color: "purple",
      path: "/f/make-deposit",
    },
    {
      label: "History",
      icon: Clock,
      color: "orange",
      path: "/f/deposits-history",
    },
  ];

  // Fetch recent transactions
  const fetchRecentTransactions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAllUserDeposits();

      if (response && response.data) {
        const transactions = Array.isArray(response.data)
          ? response.data.slice(0, 4)
          : response.data.transactions?.slice(0, 4) || [];
        setRecentTransactions(transactions);
      } else {
        setRecentTransactions([]);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
      setError("Failed to load transactions");
      setRecentTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentTransactions();
    checkUserPhoneNumber();
  }, []);

  const checkUserPhoneNumber = () => {
    const currentUser = getUser();
    const userPhone = currentUser?.phoneNumber || user?.phoneNumber || user?.phone || "";
    
    // If no phone number, show the modal after a short delay
    if (!userPhone || userPhone.trim() === "") {
      setTimeout(() => {
        setShowPhoneModal(true);
      }, 1000);
    }
  };

  const handlePhoneSubmit = async () => {
    // Validate phone number
    if (!phoneNumber.trim()) {
      setPhoneError("Phone number is required");
      return;
    }

    // Basic phone number validation (at least 10 digits)
    const phoneRegex = /^[0-9+\-\s()]{10,}$/;
    if (!phoneRegex.test(phoneNumber.trim())) {
      setPhoneError("Please enter a valid phone number");
      return;
    }

    setPhoneError("");
    setIsUpdatingPhone(true);

    try {
      await updatePhoneNumber(phoneNumber.trim());
      
      // Update local storage
      const currentUser = getUser();
      if (currentUser) {
        const updatedUser = { ...currentUser, phoneNumber: phoneNumber.trim() };
        localStorage.setItem("zenosms_user", JSON.stringify(updatedUser));
        if (setUser) {
          setUser(updatedUser);
        }
      }

      setPhoneUpdateSuccess("Phone number updated successfully!");
      setTimeout(() => {
        setShowPhoneModal(false);
        setPhoneUpdateSuccess("");
        setPhoneNumber("");
      }, 2000);
    } catch (error) {
      setPhoneError(getErrorMessage(error, "Failed to update phone number"));
    } finally {
      setIsUpdatingPhone(false);
    }
  };

  const getStatusColor = (status) => {
    const statusMap = {
      completed: "text-green-500 bg-green-500/10",
      pending: "text-yellow-500 bg-yellow-500/10",
      failed: "text-red-500 bg-red-500/10",
      success: "text-green-500 bg-green-500/10",
      processing: "text-yellow-500 bg-yellow-500/10",
      rejected: "text-red-500 bg-red-500/10",
      approved: "text-green-500 bg-green-500/10",
    };
    return statusMap[status?.toLowerCase()] || "text-gray-500 bg-gray-500/10";
  };

  const getStatusText = (status) => {
    const statusMap = {
      completed: "Completed",
      pending: "Pending",
      failed: "Failed",
      success: "Success",
      processing: "Processing",
      rejected: "Rejected",
      approved: "Approved",
    };
    return statusMap[status?.toLowerCase()] || status || "Unknown";
  };

  const formatCurrency = (amount) => {
    if (!amount) return "$0.00";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <div className="min-h-screen pb-12">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 md:mb-8">
          <div>
            <h1
              className="text-xl sm:text-2xl md:text-3xl font-bold text-white"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              {getGreeting()}, {user?.username || "User"}
            </h1>
            <p className="text-gray-400 text-xs sm:text-sm mt-1">
              Welcome back to your dashboard
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
          {/* Wallet Balance Card - Full width on mobile, 2 columns on large screens */}
          <div className="w-full lg:col-span-2">
            <WalletBalanceCard />
          </div>

          {/* Quick Stats - OTP Received, Image Bought, Active Orders */}
          <div className="grid grid-cols-2 gap-2 sm:gap-2 md:gap-4 w-full">
            <div className="p-3 sm:p-4 rounded-xl bg-gradient-to-br from-gray-900/50 to-gray-950/50 backdrop-blur-sm border border-white/10">
              <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                <div className="p-1 sm:p-1.5 rounded-lg bg-green-500/10">
                  <Smartphone
                    size={14}
                    className="sm:w-4 sm:h-4 text-green-500"
                  />
                </div>
                <span className="text-[10px] sm:text-xs text-gray-500 whitespace-nowrap">
                  OTP Received
                </span>
              </div>
              <p className="text-base sm:text-xl font-bold text-white">0</p>
              <span className="text-[9px] sm:text-xs text-gray-500 flex items-center gap-0.5 sm:gap-1 mt-0.5 sm:mt-1">
                No data available
              </span>
            </div>
            <div className="p-3 sm:p-4 rounded-xl bg-gradient-to-br from-gray-900/50 to-gray-950/50 backdrop-blur-sm border border-white/10">
              <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                <div className="p-1 sm:p-1.5 rounded-lg bg-blue-500/10">
                  <Image size={14} className="sm:w-4 sm:h-4 text-blue-500" />
                </div>
                <span className="text-[10px] sm:text-xs text-gray-500 whitespace-nowrap">
                  Image Bought
                </span>
              </div>
              <p className="text-base sm:text-xl font-bold text-white">0</p>
              <span className="text-[9px] sm:text-xs text-gray-500 flex items-center gap-0.5 sm:gap-1 mt-0.5 sm:mt-1">
                No data available
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6 md:mb-8">
          {quickActions.map((action, index) => (
            <motion.button
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => navigate(action.path)}
              className="group p-3 sm:p-4 rounded-xl bg-gradient-to-br from-gray-900/50 to-gray-950/50 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105"
            >
              <div
                className={`p-1.5 sm:p-2 rounded-lg bg-${action.color}-500/10 group-hover:scale-110 transition-transform mb-1.5 sm:mb-2 inline-block`}
              >
                <action.icon
                  className={`w-4 h-4 sm:w-5 sm:h-5 text-${action.color}-500`}
                />
              </div>
              <p className="text-[11px] sm:text-sm font-medium text-gray-300 group-hover:text-white transition-colors">
                {action.label}
              </p>
            </motion.button>
          ))}
        </div>

        {/* Recent Activity Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Recent Transactions */}
          <div className="rounded-xl bg-gradient-to-br from-gray-900/50 to-gray-950/50 backdrop-blur-sm border border-white/10 p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                <h3
                  className="text-base sm:text-lg font-semibold text-white"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  Recent Transactions
                </h3>
              </div>
              <button
                onClick={() => navigate("/f/deposits-history")}
                className="text-[10px] sm:text-xs text-green-500 hover:text-green-400 transition-colors"
              >
                View All
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-green-500 border-t-transparent" />
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                <p className="text-red-400 text-sm">{error}</p>
                <button
                  onClick={fetchRecentTransactions}
                  className="mt-3 text-xs text-green-500 hover:text-green-400 transition-colors flex items-center gap-1 justify-center"
                >
                  <RefreshCw size={12} /> Try Again
                </button>
              </div>
            ) : recentTransactions.length === 0 ? (
              <div className="text-center py-8">
                <Activity className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">No transactions yet</p>
                <p className="text-gray-500 text-xs mt-1">
                  Your recent transactions will appear here
                </p>
              </div>
            ) : (
              <div className="space-y-2 sm:space-y-3">
                {recentTransactions.map((tx) => (
                  <div
                    key={tx._id || tx.id}
                    className="flex items-center justify-between p-2 sm:p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-200"
                  >
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                      <div
                        className={`p-1.5 sm:p-2 rounded-lg ${
                          tx.status?.toLowerCase() === "completed" ||
                          tx.status?.toLowerCase() === "approved"
                            ? "bg-green-500/10"
                            : "bg-orange-500/10"
                        }`}
                      >
                        {tx.status?.toLowerCase() === "completed" ||
                        tx.status?.toLowerCase() === "approved" ? (
                          <ArrowDownLeft className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                        ) : (
                          <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4 text-orange-500" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-white truncate">
                          {tx.description || tx.type || "Transaction"}
                        </p>
                        <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-0.5">
                          <span
                            className={`text-[9px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full ${getStatusColor(tx.status)}`}
                          >
                            {getStatusText(tx.status)}
                          </span>
                          <span className="text-[9px] sm:text-xs text-gray-500 truncate">
                            {formatDate(
                              tx.createdAt || tx.date || tx.timestamp,
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                    <span
                      className={`text-xs sm:text-sm font-semibold ${
                        tx.status?.toLowerCase() === "completed" ||
                        tx.status?.toLowerCase() === "approved"
                          ? "text-green-500"
                          : "text-orange-500"
                      } ml-1 sm:ml-2`}
                    >
                      {tx.status?.toLowerCase() === "completed" ||
                      tx.status?.toLowerCase() === "approved"
                        ? "+"
                        : ""}
                      {formatCurrency(tx.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Services & Notifications */}
          <div className="space-y-4 md:space-y-6">
            {/* Recent Services */}
            <div className="rounded-xl bg-gradient-to-br from-gray-900/50 to-gray-950/50 backdrop-blur-sm border border-white/10 p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                  <h3
                    className="text-base sm:text-lg font-semibold text-white"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    Active Services
                  </h3>
                </div>
              </div>

              <div className="space-y-2">
                {activeServices.map((service) => (
                  <div
                    key={service.id}
                    className="flex items-center justify-between p-2 sm:p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-200"
                  >
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-500 animate-pulse flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-white truncate">
                          {service.name}
                        </p>
                      </div>
                    </div>
                    <span className="text-[9px] sm:text-xs text-green-500 font-medium ml-1 sm:ml-2">
                      Active
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Phone Number Modal */}
      {showPhoneModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-md rounded-2xl bg-gradient-to-br from-gray-900/95 to-gray-950/95 backdrop-blur-xl border border-white/10 shadow-2xl p-6"
          >
            {/* Close button */}
            <button
              onClick={() => setShowPhoneModal(false)}
              className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Header */}
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 flex items-center justify-center mx-auto mb-3 border border-emerald-500/30">
                <Phone className="w-7 h-7 text-emerald-400" />
              </div>
              <h3 className="text-lg font-bold text-white font-['Space_Grotesk']">
                Update Phone Number
              </h3>
              <p className="text-sm text-gray-400 mt-1">
                Add your phone number to enable bank account funding
              </p>
            </div>

            {/* Phone Input */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                Phone Number <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => {
                    setPhoneNumber(e.target.value);
                    setPhoneError("");
                    setPhoneUpdateSuccess("");
                  }}
                  placeholder="Enter your phone number"
                  className={`w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/5 border text-white text-sm placeholder-gray-500 outline-none transition-colors focus:border-emerald-500/50 ${
                    phoneError ? "border-red-500/40" : "border-white/10"
                  }`}
                />
              </div>
              {phoneError && (
                <p className="mt-1 text-xs text-red-400">{phoneError}</p>
              )}
              {phoneUpdateSuccess && (
                <p className="mt-1 text-xs text-emerald-400">{phoneUpdateSuccess}</p>
              )}
            </div>

            {/* Info Box */}
            <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10 mb-4">
              <div className="flex items-start gap-2">
                <Wallet className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <p className="text-xs text-gray-400">
                  Your phone number is required to create a personal bank account
                  for funding your wallet. This information is secure and private.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowPhoneModal(false)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-sm transition-all"
              >
                Skip for Now
              </button>
              <button
                onClick={handlePhoneSubmit}
                disabled={isUpdatingPhone || !phoneNumber.trim()}
                className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-semibold text-sm transition-all shadow-lg shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isUpdatingPhone ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Update Phone
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;