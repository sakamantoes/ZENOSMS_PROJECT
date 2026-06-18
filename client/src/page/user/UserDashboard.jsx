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
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import WalletBalanceCard from "../../Components/WalletBalanceCard";
import useAuth from "../../store/useAuth";
import { getAllUserDeposits } from "../../Service/wallet";

const UserDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showBalance, setShowBalance] = useState(true);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Mock data for stats (keep as fallback)
  const mockData = {
    stats: {
      totalDeposits: 1250.0,
      totalWithdrawals: 75.5,
      totalTransactions: 4,
      activeServices: 3,
      otpReceived: 47,
      imageBought: 12,
      activeOrders: 8,
    },
    recentServices: [
      { id: 1, name: "Virtual Number - USA", status: "active" },
      { id: 2, name: "Social Media Boost - Instagram", status: "active" },
      { id: 3, name: "OTP Verification", status: "active" },
      { id: 4, name: "Format and tools", status: "active" },
      { id: 5, name: "Working Image", status: "active" },
    ],
    quickActions: [
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
    ],
    notifications: [
      {
        id: 1,
        message: "Your number verification is complete",
        time: "2 hours ago",
        type: "success",
      },
      {
        id: 2,
        message: "New social media boost available",
        time: "5 hours ago",
        type: "info",
      },
      {
        id: 3,
        message: "Payment of $250.00 confirmed",
        time: "1 day ago",
        type: "success",
      },
    ],
  };

  // Fetch recent transactions
  const fetchRecentTransactions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAllUserDeposits();

      // Check if response has data
      if (response && response.data) {
        // Get only the last 4 transactions for recent view
        const transactions = Array.isArray(response.data)
          ? response.data.slice(0, 4)
          : response.data.transactions?.slice(0, 4) || [];
        setRecentTransactions(transactions);
      } else {
        // If no transactions, set empty array
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
  }, []);

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

  const getInitials = (name) => {
    return name?.charAt(0).toUpperCase() || "U";
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
              <p className="text-base sm:text-xl font-bold text-white">
                {mockData.stats.otpReceived}
              </p>
              <span className="text-[9px] sm:text-xs text-green-500 flex items-center gap-0.5 sm:gap-1 mt-0.5 sm:mt-1">
                <TrendingUp size={10} className="sm:w-3 sm:h-3" />{" "}
                <span className="hidden xs:inline">+8% this week</span>
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
              <p className="text-base sm:text-xl font-bold text-white">
                {mockData.stats.imageBought}
              </p>
              <span className="text-[9px] sm:text-xs text-blue-500 flex items-center gap-0.5 sm:gap-1 mt-0.5 sm:mt-1">
                <TrendingUp size={10} className="sm:w-3 sm:h-3" />{" "}
                <span className="hidden xs:inline">+3 this month</span>
              </span>
            </div>
        
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6 md:mb-8">
          {mockData.quickActions.map((action, index) => (
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
                {mockData.recentServices.map((service) => (
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
    </div>
  );
};

export default UserDashboard;
