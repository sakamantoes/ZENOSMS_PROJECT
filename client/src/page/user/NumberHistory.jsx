// pages/user/OtpBox.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RefreshCw, CheckCircle, XCircle, AlertCircle,
  Clock, Smartphone, MessageSquare, DollarSign,
  Loader2, Eye, Copy, Trash2, Ban, Check,
  ExternalLink, Calendar, User, Hash, Phone,
  Shield, Zap, Globe, Clock as ClockIcon,
  Download, Printer, Share2
} from 'lucide-react';
import {
  getUserOtpOrders,
  checkOtpOrderStatus,
  cancelOtpAndRefund,
  cancelGetatextService,
  checkGetatextOtpStatus
} from '../../Service/number';
import { getWalletBalance } from '../../service/wallet';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const isSuccess = (res) => Boolean(res?.success ?? res?.sucess ?? false);

const formatCurrency = (amount) => {
  const n = Number(amount);
  if (!Number.isFinite(n)) return '₦0.00';
  return new Intl.NumberFormat('en-NG', {
    style: 'currency', currency: 'NGN', minimumFractionDigits: 2, maximumFractionDigits: 2,
  }).format(n);
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-NG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).format(date);
};

const getStatusBadge = (status) => {
  const statusMap = {
    'WAITING_FOR_SMS': {
      label: 'Waiting',
      className: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
      icon: <Clock className="w-3 h-3" />
    },
    'OTP_RECEIVED': {
      label: 'OTP Received',
      className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      icon: <CheckCircle className="w-3 h-3" />
    },
    'COMPLETED': {
      label: 'Completed',
      className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      icon: <CheckCircle className="w-3 h-3" />
    },
    'CANCELLED': {
      label: 'Cancelled',
      className: 'bg-red-500/10 text-red-400 border-red-500/20',
      icon: <XCircle className="w-3 h-3" />
    },
    'FAILED': {
      label: 'Failed',
      className: 'bg-red-500/10 text-red-400 border-red-500/20',
      icon: <AlertCircle className="w-3 h-3" />
    },
    'PENDING': {
      label: 'Pending',
      className: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
      icon: <Clock className="w-3 h-3" />
    }
  };
  return statusMap[status] || {
    label: status || 'Unknown',
    className: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    icon: <AlertCircle className="w-3 h-3" />
  };
};

// ─── Main component ────────────────────────────────────────────────────────────
const OtpBox = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const [checkingId, setCheckingId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('ALL');
  const [userBalance, setUserBalance] = useState(0);
  const [cancelWarning, setCancelWarning] = useState(null);

  // ── Fetch orders ────────────────────────────────────────────────────────────
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getUserOtpOrders();
      
      if (isSuccess(response) && Array.isArray(response.data)) {
        setOrders(response.data);
      } else {
        setOrders([]);
        setError(response?.message || 'Failed to load OTP orders');
      }
    } catch (err) {
      console.error('Error fetching OTP orders:', err);
      setOrders([]);
      setError(err?.response?.data?.message || err?.message || 'Failed to load OTP orders');
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Fetch balance ───────────────────────────────────────────────────────────
  const fetchBalance = useCallback(async () => {
    try {
      const response = await getWalletBalance();
      if (isSuccess(response)) {
        const data = response?.data?.data || response?.data || response;
        const balance = typeof data === 'number' ? data : data?.balance || 0;
        setUserBalance(balance);
      }
    } catch (error) {
      console.error('Failed to fetch balance:', error);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    fetchBalance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Check OTP status ────────────────────────────────────────────────────────
  const handleCheckStatus = async (order) => {
    setCheckingId(order._id);
    setError(null);
    setSuccessMessage(null);

    try {
      let response;
      if (order.provider === 'smsbower') {
        response = await checkOtpOrderStatus(order._id);
      } else if (order.provider === 'getatext') {
        response = await checkGetatextOtpStatus(order._id);
      }

      if (isSuccess(response)) {
        setSuccessMessage('Status checked successfully!');
        await fetchOrders();
        await fetchBalance();
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(response?.message || 'Failed to check status');
        setTimeout(() => setError(null), 3000);
      }
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to check status');
      setTimeout(() => setError(null), 3000);
    } finally {
      setCheckingId(null);
    }
  };

  // ── Cancel OTP ──────────────────────────────────────────────────────────────
  const handleCancel = async (order) => {
    // ── FIX: Warn user about 60-second wait for GetAtext ──────────────────
    if (order.provider === 'getatext') {
      const purchasedAt = new Date(order.purchasedAt);
      const now = new Date();
      const secondsElapsed = Math.floor((now - purchasedAt) / 1000);
      const waitSeconds = 60 - secondsElapsed;

      if (waitSeconds > 0) {
        setCancelWarning({
          message: `Please wait ${waitSeconds} more second(s) before cancelling this GetAtext OTP.`,
          type: 'warning'
        });
        setTimeout(() => setCancelWarning(null), 5000);
        return;
      }
    }

    // ── FIX: Hide provider from user ──────────────────────────────────────
    if (!window.confirm(`Are you sure you want to cancel this OTP order? You will get a full refund.`)) {
      return;
    }

    setProcessingId(order._id);
    setError(null);
    setSuccessMessage(null);

    try {
      let response;
      if (order.provider === 'smsbower') {
        response = await cancelOtpAndRefund(order.activationId);
      } else if (order.provider === 'getatext') {
        response = await cancelGetatextService(order.activationId);
      }

      if (isSuccess(response)) {
        setSuccessMessage('OTP cancelled and refunded successfully!');
        await fetchOrders();
        await fetchBalance();
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(response?.message || 'Failed to cancel OTP');
        setTimeout(() => setError(null), 3000);
      }
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to cancel OTP');
      setTimeout(() => setError(null), 3000);
    } finally {
      setProcessingId(null);
    }
  };

  // ── Refresh ─────────────────────────────────────────────────────────────────
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    await fetchBalance();
    setRefreshing(false);
  };

  // ── Filter orders ──────────────────────────────────────────────────────────
  const filteredOrders = orders.filter(order => {
    if (filter === 'ALL') return true;
    if (filter === 'ACTIVE') return ['WAITING_FOR_SMS', 'PENDING'].includes(order.status);
    if (filter === 'RECEIVED') return ['OTP_RECEIVED', 'COMPLETED'].includes(order.status);
    if (filter === 'CANCELLED') return order.status === 'CANCELLED';
    if (filter === 'FAILED') return order.status === 'FAILED';
    return true;
  });

  // ── Stats ──────────────────────────────────────────────────────────────────
  const stats = {
    total: orders.length,
    waiting: orders.filter(o => o.status === 'WAITING_FOR_SMS' || o.status === 'PENDING').length,
    received: orders.filter(o => o.status === 'OTP_RECEIVED' || o.status === 'COMPLETED').length,
    cancelled: orders.filter(o => o.status === 'CANCELLED').length,
    failed: orders.filter(o => o.status === 'FAILED').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading OTP orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-950 via-gray-900 to-black/95 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-center justify-between gap-4 mb-6"
        >
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white font-['Space_Grotesk'] flex items-center gap-3">
              <Smartphone className="w-8 h-8 text-emerald-500" />
              OTP Orders
            </h1>
            <p className="text-sm text-gray-400 mt-1">Manage and monitor your OTP verification orders</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span className="text-sm text-white font-medium">{formatCurrency(userBalance)}</span>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </motion.div>

        {/* Messages */}
        <AnimatePresence>
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              {successMessage}
            </motion.div>
          )}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-2"
            >
              <AlertCircle className="w-5 h-5" />
              {error}
            </motion.div>
          )}
          {cancelWarning && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-4 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 flex items-center gap-2"
            >
              <Clock className="w-5 h-5" />
              {cancelWarning.message}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 mb-6"
        >
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <p className="text-xs text-gray-400">Total</p>
            <p className="text-xl font-bold text-white">{stats.total}</p>
          </div>
          <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
            <p className="text-xs text-gray-400">Waiting</p>
            <p className="text-xl font-bold text-yellow-400">{stats.waiting}</p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <p className="text-xs text-gray-400">Received</p>
            <p className="text-xl font-bold text-emerald-400">{stats.received}</p>
          </div>
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
            <p className="text-xs text-gray-400">Cancelled</p>
            <p className="text-xl font-bold text-red-400">{stats.cancelled}</p>
          </div>
          <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20">
            <p className="text-xs text-gray-400">Failed</p>
            <p className="text-xl font-bold text-orange-400">{stats.failed}</p>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex flex-wrap items-center gap-3 mb-6"
        >
          <span className="text-sm text-gray-400">Filter:</span>
          {['ALL', 'ACTIVE', 'RECEIVED', 'CANCELLED', 'FAILED'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filter === f
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              {f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
        </motion.div>

        {/* Table - Provider column removed */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl bg-gradient-to-br from-gray-900/80 to-gray-950/80 backdrop-blur-xl border border-white/10 overflow-hidden"
        >
          {filteredOrders.length === 0 ? (
            <div className="text-center py-16">
              <div className="flex flex-col items-center gap-4">
                <Smartphone className="w-16 h-16 text-gray-600" />
                <h3 className="text-xl font-bold text-white font-['Space_Grotesk']">No OTP orders found</h3>
                <p className="text-gray-400 max-w-md">
                  {orders.length === 0
                    ? 'You haven\'t made any OTP purchases yet.'
                    : 'No orders match your current filter.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5 border-b border-white/5">
                  <tr>
                    <th className="text-left p-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Service</th>
                    <th className="text-left p-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Number</th>
                    <th className="text-left p-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="text-left p-3 text-xs font-medium text-gray-400 uppercase tracking-wider">OTP Code</th>
                    <th className="text-left p-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Price</th>
                    <th className="text-left p-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                    <th className="text-left p-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredOrders.map((order, index) => {
                    const status = getStatusBadge(order.status);
                    const canCheck = ['WAITING_FOR_SMS', 'PENDING'].includes(order.status);
                    const canCancel = ['WAITING_FOR_SMS', 'PENDING'].includes(order.status);
                    const isProcessing = processingId === order._id;
                    const isChecking = checkingId === order._id;

                    // Check if GetAtext and if 60 seconds have passed
                    const isGetAtext = order.provider === 'getatext';
                    const purchasedAt = new Date(order.purchasedAt);
                    const now = new Date();
                    const secondsElapsed = Math.floor((now - purchasedAt) / 1000);
                    const needsWait = isGetAtext && secondsElapsed < 60;
                    const waitSeconds = needsWait ? 60 - secondsElapsed : 0;

                    return (
                      <motion.tr
                        key={order._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-white/5 transition-colors group"
                      >
                        <td className="p-3">
                          <span className="text-sm text-gray-300">{order.service}</span>
                          {isGetAtext && (
                            <span className="ml-2 text-xs text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">USA</span>
                          )}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-mono text-gray-300">{order.phoneNumber}</span>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(order.phoneNumber);
                                setSuccessMessage('Number copied!');
                                setTimeout(() => setSuccessMessage(null), 2000);
                              }}
                              className="p-1 rounded hover:bg-white/10 text-gray-500 hover:text-white transition-colors"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-full text-xs border inline-flex items-center gap-1 ${status.className}`}>
                            {status.icon}
                            {status.label}
                          </span>
                        </td>
                        <td className="p-3">
                          {order.otpCode ? (
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-mono font-bold text-emerald-400">{order.otpCode}</span>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(order.otpCode);
                                  setSuccessMessage('OTP copied!');
                                  setTimeout(() => setSuccessMessage(null), 2000);
                                }}
                                className="p-1 rounded hover:bg-white/10 text-gray-500 hover:text-white transition-colors"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-500">—</span>
                          )}
                        </td>
                        <td className="p-3">
                          <span className="text-sm text-emerald-400 font-medium">{formatCurrency(order.sellingPrice)}</span>
                        </td>
                        <td className="p-3">
                          <div className="flex flex-col">
                            <span className="text-xs text-gray-400">{formatDate(order.createdAt)}</span>
                            {order.expiresAt && (
                              <span className="text-xs text-gray-500">Expires: {formatDate(order.expiresAt)}</span>
                            )}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            {canCheck && (
                              <button
                                onClick={() => handleCheckStatus(order)}
                                disabled={isChecking}
                                className="p-1.5 rounded-lg hover:bg-emerald-500/10 text-emerald-400 hover:text-emerald-300 transition-colors disabled:opacity-50"
                                title="Check OTP"
                              >
                                {isChecking ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <RefreshCw className="w-4 h-4" />
                                )}
                              </button>
                            )}
                            {canCancel && (
                              <button
                                onClick={() => handleCancel(order)}
                                disabled={isProcessing || needsWait}
                                className={`p-1.5 rounded-lg transition-colors ${
                                  needsWait
                                    ? 'text-gray-500 cursor-not-allowed'
                                    : 'hover:bg-red-500/10 text-red-400 hover:text-red-300'
                                }`}
                                title={needsWait ? `Wait ${waitSeconds}s before cancelling` : "Cancel Order"}
                              >
                                {isProcessing ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <XCircle className="w-4 h-4" />
                                )}
                              </button>
                            )}
                            {order.otpCode && (
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(order.otpCode);
                                  setSuccessMessage('OTP copied!');
                                  setTimeout(() => setSuccessMessage(null), 2000);
                                }}
                                className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                                title="Copy OTP"
                              >
                                <Copy className="w-4 h-4" />
                              </button>
                            )}
                            {needsWait && canCancel && (
                              <span className="text-[10px] text-yellow-400 whitespace-nowrap">
                                Wait {waitSeconds}s
                              </span>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default OtpBox;