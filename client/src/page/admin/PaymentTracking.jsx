import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  RefreshCw,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  ChevronDown,
  ChevronRight,
  Download,
  Printer,
  Calendar,
  DollarSign,
  User,
  CreditCard,
  Activity,
  TrendingUp,
  TrendingDown,
  Wallet,
  Zap,
  Loader2,
  Ban,
  Check,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  MoreVertical,
  UserCheck,
  Users,
  FileText,
  BarChart3,
  PieChart,
  Award,
  Star,
  MessageSquare,
  Mail,
  Phone,
  MapPin,
  Globe,
  Shield,
  Settings,
  Bell,
  UserPlus,
  LogOut,
  Menu,
  X,
  Home,
  Layout,
  List,
  Package,
  TrendingUp as TrendingUpIcon,
  DollarSign as DollarSignIcon,
  BarChart,
  PieChart as PieChartIcon,
  Calendar as CalendarIcon,
  Clock as ClockIcon,
  Coins,
  Building2
} from 'lucide-react';
import { getPlatformDeposits, updatePlatformDepositStatus } from '../../Service/admin.js';

const PaymentTracking = () => {
  const [deposits, setDeposits] = useState([]);
  const [filteredDeposits, setFilteredDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterProvider, setFilterProvider] = useState('ALL');
  const [selectedDeposit, setSelectedDeposit] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [stats, setStats] = useState({
    total: 0,
    success: 0,
    pending: 0,
    failed: 0,
    totalAmount: 0,
    successAmount: 0,
    pendingAmount: 0,
    failedAmount: 0
  });

  // Fetch deposits
  const fetchDeposits = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getPlatformDeposits();
      
      let depositsData = [];
      if (response?.data && Array.isArray(response.data)) {
        depositsData = response.data;
      } else if (Array.isArray(response)) {
        depositsData = response;
      } else if (response?.data?.data && Array.isArray(response.data.data)) {
        depositsData = response.data.data;
      } else {
        depositsData = [];
      }
      
      setDeposits(depositsData);
      calculateStats(depositsData);
    } catch (err) {
      console.error('Error fetching deposits:', err);
      setError(err.message || 'Failed to load deposit data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeposits();
  }, []);

  // Calculate statistics
  const calculateStats = (data) => {
    const total = data.length;
    const success = data.filter(d => d.status?.toUpperCase() === 'SUCCESS').length;
    const pending = data.filter(d => d.status?.toUpperCase() === 'PENDING').length;
    const failed = data.filter(d => d.status?.toUpperCase() === 'FAILED').length;
    
    const totalAmount = data.reduce((sum, d) => sum + (d.totalDeposit || d.amount || 0), 0);
    const successAmount = data.filter(d => d.status?.toUpperCase() === 'SUCCESS')
      .reduce((sum, d) => sum + (d.totalDeposit || d.amount || 0), 0);
    const pendingAmount = data.filter(d => d.status?.toUpperCase() === 'PENDING')
      .reduce((sum, d) => sum + (d.totalDeposit || d.amount || 0), 0);
    const failedAmount = data.filter(d => d.status?.toUpperCase() === 'FAILED')
      .reduce((sum, d) => sum + (d.totalDeposit || d.amount || 0), 0);
    
    setStats({
      total,
      success,
      pending,
      failed,
      totalAmount,
      successAmount,
      pendingAmount,
      failedAmount
    });
  };

  // Filter and search deposits
  useEffect(() => {
    let result = [...deposits];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(deposit => 
        deposit.depositorName?.toLowerCase().includes(term) ||
        deposit.referenceId?.toLowerCase().includes(term) ||
        deposit._id?.toLowerCase().includes(term) ||
        deposit.userId?.toLowerCase().includes(term) ||
        deposit.provider?.toLowerCase().includes(term) ||
        deposit.accountNumber?.toLowerCase().includes(term)
      );
    }

    // Status filter
    if (filterStatus !== 'ALL') {
      result = result.filter(deposit => deposit.status?.toUpperCase() === filterStatus);
    }

    // Provider filter
    if (filterProvider !== 'ALL') {
      result = result.filter(deposit => deposit.provider === filterProvider);
    }

    // Sort
    result.sort((a, b) => {
      let aVal = a[sortBy] || '';
      let bVal = b[sortBy] || '';
      
      if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      }
      
      if (sortBy === 'amount' || sortBy === 'totalDeposit') {
        aVal = Number(aVal || 0);
        bVal = Number(bVal || 0);
      }
      
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredDeposits(result);
    setCurrentPage(1);
  }, [deposits, searchTerm, filterStatus, filterProvider, sortBy, sortOrder]);

  // Update deposit status
  const handleUpdateStatus = async (id, newStatus) => {
    if (!window.confirm(`Are you sure you want to mark this deposit as ${newStatus}?`)) {
      return;
    }

    try {
      setUpdatingStatus(true);
      const response = await updatePlatformDepositStatus(id, newStatus);
      
      if (response.success) {
        // Update local state
        setDeposits(prev => 
          prev.map(deposit => 
            deposit._id === id 
              ? { ...deposit, status: newStatus.toUpperCase(), updatedAt: new Date().toISOString() }
              : deposit
          )
        );
        setSuccessMessage(`Deposit status updated to ${newStatus} successfully!`);
        setTimeout(() => setSuccessMessage(null), 3000);
        
        // Close details if open
        if (selectedDeposit?._id === id) {
          setSelectedDeposit({ ...selectedDeposit, status: newStatus.toUpperCase() });
        }
      } else {
        throw new Error(response.message || 'Failed to update status');
      }
    } catch (err) {
      console.error('Error updating deposit status:', err);
      setError(err.message || 'Failed to update deposit status');
      setTimeout(() => setError(null), 3000);
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Format date
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

  // Format currency
  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return '₦0.00';
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const statusMap = {
      'SUCCESS': {
        label: 'Success',
        className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        icon: <CheckCircle className="w-3 h-3" />
      },
      'PENDING': {
        label: 'Pending',
        className: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
        icon: <Clock className="w-3 h-3" />
      },
      'FAILED': {
        label: 'Failed',
        className: 'bg-red-500/10 text-red-400 border-red-500/20',
        icon: <XCircle className="w-3 h-3" />
      }
    };
    return statusMap[status?.toUpperCase()] || {
      label: status || 'Unknown',
      className: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
      icon: <AlertCircle className="w-3 h-3" />
    };
  };

  // Get provider badge
  const getProviderBadge = (provider) => {
    const providerMap = {
      'dsociopay': { label: 'Dsociopay', className: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
      'squad': { label: 'Squad', className: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
      'quest': { label: 'Quest', className: 'bg-orange-500/10 text-orange-400 border-orange-500/20' }
    };
    return providerMap[provider?.toLowerCase()] || { 
      label: provider || 'Unknown', 
      className: 'bg-gray-500/10 text-gray-400 border-gray-500/20' 
    };
  };

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredDeposits.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredDeposits.length / itemsPerPage);

  // Get unique providers for filter dropdown
  const uniqueProviders = [...new Set(deposits.map(d => d.provider).filter(Boolean))];

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black/95 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading payment data...</p>
        </div>
      </div>
    );
  }

  // Deposit Details Modal
  const DepositDetailsModal = ({ deposit, onClose }) => {
    if (!deposit) return null;
    const status = getStatusBadge(deposit.status);
    const provider = getProviderBadge(deposit.provider);

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="relative w-full max-w-2xl rounded-2xl bg-gradient-to-br from-gray-900/95 to-gray-950/95 backdrop-blur-xl border border-white/10 shadow-2xl p-6 max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
          >
            <XCircle className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <Wallet className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white font-['Space_Grotesk']">Deposit Details</h3>
              <p className="text-sm text-gray-400">Reference: {deposit.referenceId}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-3 rounded-xl bg-white/5 border border-white/5">
              <p className="text-xs text-gray-400">Total Deposit</p>
              <p className="text-lg font-bold text-emerald-400">{formatCurrency(deposit.totalDeposit || deposit.amount)}</p>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/5">
              <p className="text-xs text-gray-400">Amount Credited</p>
              <p className="text-lg font-bold text-white">{formatCurrency(deposit.amount)}</p>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/5">
              <p className="text-xs text-gray-400">Fee</p>
              <p className="text-lg font-bold text-orange-400">{formatCurrency(deposit.fee)}</p>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/5">
              <p className="text-xs text-gray-400">Status</p>
              <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs border mt-1 ${status.className}`}>
                {status.icon}
                {status.label}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/5">
              <p className="text-xs text-gray-400">Provider</p>
              <span className={`inline-block px-2 py-1 rounded-full text-xs border mt-1 ${provider.className}`}>
                {provider.label}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/5">
              <p className="text-xs text-gray-400">Account Number</p>
              <p className="text-sm text-white font-medium truncate">{deposit.accountNumber}</p>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/5 col-span-2">
              <p className="text-xs text-gray-400">Depositor</p>
              <p className="text-sm text-white font-medium">{deposit.depositorName}</p>
              <p className="text-xs text-gray-500">{deposit.depositorEmail}</p>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/5 col-span-2">
              <p className="text-xs text-gray-400">Date</p>
              <p className="text-sm text-white">{formatDate(deposit.createdAt)}</p>
            </div>
          </div>

          {/* Status Update Actions */}
          <div className="border-t border-white/5 pt-4">
            <p className="text-xs text-gray-400 mb-3">Update Status</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  handleUpdateStatus(deposit._id, 'SUCCESS');
                  onClose();
                }}
                disabled={updatingStatus || deposit.status === 'SUCCESS'}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Check className="w-4 h-4" />
                Mark as Success
              </button>
              <button
                onClick={() => {
                  handleUpdateStatus(deposit._id, 'PENDING');
                  onClose();
                }}
                disabled={updatingStatus || deposit.status === 'PENDING'}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/20 text-yellow-400 font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Clock className="w-4 h-4" />
                Mark as Pending
              </button>
              <button
                onClick={() => {
                  handleUpdateStatus(deposit._id, 'FAILED');
                  onClose();
                }}
                disabled={updatingStatus || deposit.status === 'FAILED'}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Ban className="w-4 h-4" />
                Mark as Failed
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black/95 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-center justify-between gap-4 mb-6"
        >
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white font-['Space_Grotesk'] flex items-center gap-3">
              <Wallet className="w-8 h-8 text-emerald-500" />
              Payment Tracking
            </h1>
            <p className="text-sm text-gray-400 mt-1">Monitor and manage all platform deposits</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchDeposits}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white transition-all"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-semibold text-sm hover:from-emerald-500 hover:to-emerald-400 transition-all shadow-lg shadow-emerald-500/25 flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </motion.div>

        {/* Success/Error Messages */}
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
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
            className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-2"
          >
            <AlertCircle className="w-5 h-5" />
            {error}
          </motion.div>
        )}

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6"
        >
          <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20">
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-400">Total Deposits</p>
              <Wallet className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-2xl font-bold text-white">{stats.total}</p>
            <p className="text-xs text-gray-500 mt-1">{formatCurrency(stats.totalAmount)}</p>
          </div>

          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-400">Successful</p>
              <CheckCircle className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-bold text-emerald-400">{stats.success}</p>
            <p className="text-xs text-gray-500 mt-1">{formatCurrency(stats.successAmount)}</p>
          </div>

          <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-400">Pending</p>
              <Clock className="w-4 h-4 text-yellow-400" />
            </div>
            <p className="text-2xl font-bold text-yellow-400">{stats.pending}</p>
            <p className="text-xs text-gray-500 mt-1">{formatCurrency(stats.pendingAmount)}</p>
          </div>

          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-400">Failed</p>
              <XCircle className="w-4 h-4 text-red-400" />
            </div>
            <p className="text-2xl font-bold text-red-400">{stats.failed}</p>
            <p className="text-xs text-gray-500 mt-1">{formatCurrency(stats.failedAmount)}</p>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex flex-wrap items-center gap-4 mb-6 p-4 rounded-xl bg-white/5 border border-white/10"
        >
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search by name, reference, ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-emerald-500/50 transition-colors"
              />
            </div>
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 text-sm focus:outline-none focus:border-emerald-500/50 transition-colors"
          >
            <option value="ALL">All Status</option>
            <option value="SUCCESS">Success</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Failed</option>
          </select>

          <select
            value={filterProvider}
            onChange={(e) => setFilterProvider(e.target.value)}
            className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 text-sm focus:outline-none focus:border-emerald-500/50 transition-colors"
          >
            <option value="ALL">All Providers</option>
            {uniqueProviders.map(provider => (
              <option key={provider} value={provider}>
                {provider?.charAt(0).toUpperCase() + provider?.slice(1) || provider}
              </option>
            ))}
          </select>

          <button
            onClick={() => {
              setSearchTerm('');
              setFilterStatus('ALL');
              setFilterProvider('ALL');
            }}
            className="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white transition-colors text-sm"
          >
            Clear Filters
          </button>
        </motion.div>

        {/* Deposits Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl bg-gradient-to-br from-gray-900/80 to-gray-950/80 backdrop-blur-xl border border-white/10 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5 border-b border-white/5">
                <tr>
                  <th className="text-left p-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Depositor</th>
                  <th className="text-left p-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Total Deposit</th>
                  <th className="text-left p-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Credited</th>
                  <th className="text-left p-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Provider</th>
                  <th className="text-left p-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="text-left p-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                  <th className="text-left p-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {currentItems.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-gray-400">
                      <div className="flex flex-col items-center gap-2">
                        <Wallet className="w-12 h-12 text-gray-600" />
                        <p>No deposits found</p>
                        <p className="text-sm text-gray-500">Try adjusting your filters</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentItems.map((deposit, index) => {
                    const status = getStatusBadge(deposit.status);
                    const provider = getProviderBadge(deposit.provider);
                    return (
                      <motion.tr
                        key={deposit._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-white/5 transition-colors group"
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 flex items-center justify-center text-emerald-400 font-bold text-sm border border-emerald-500/20">
                              {deposit.depositorName?.[0]?.toUpperCase() || 'U'}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-white truncate max-w-[150px]">
                                {deposit.depositorName || 'Unknown'}
                              </p>
                              <p className="text-xs text-gray-500 truncate max-w-[120px]">
                                {deposit.referenceId?.slice(0, 16) || 'No ref'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <p className="text-sm font-bold text-emerald-400">{formatCurrency(deposit.totalDeposit || deposit.amount)}</p>
                          <p className="text-xs text-gray-500">{deposit.currency || 'NGN'}</p>
                        </td>
                        <td className="p-4">
                          <p className="text-sm font-bold text-white">{formatCurrency(deposit.amount)}</p>
                          <p className="text-xs text-gray-500">Fee: {formatCurrency(deposit.fee)}</p>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-xs border inline-flex items-center gap-1 ${provider.className}`}>
                            <Building2 className="w-3 h-3" />
                            {provider.label}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-xs border inline-flex items-center gap-1 ${status.className}`}>
                            {status.icon}
                            {status.label}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3 h-3 text-gray-500" />
                            <span className="text-sm text-gray-400">{formatDate(deposit.createdAt)}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedDeposit(deposit);
                                setShowDetails(true);
                              }}
                              className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {deposit.status?.toUpperCase() !== 'SUCCESS' && (
                              <button
                                onClick={() => handleUpdateStatus(deposit._id, 'SUCCESS')}
                                disabled={updatingStatus}
                                className="p-1.5 rounded-lg hover:bg-emerald-500/10 text-emerald-400 hover:text-emerald-300 transition-colors"
                                title="Mark as Success"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            )}
                            {deposit.status?.toUpperCase() !== 'FAILED' && (
                              <button
                                onClick={() => handleUpdateStatus(deposit._id, 'FAILED')}
                                disabled={updatingStatus}
                                className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-colors"
                                title="Mark as Failed"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredDeposits.length > itemsPerPage && (
            <div className="flex items-center justify-between p-4 border-t border-white/5">
              <p className="text-sm text-gray-400">
                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredDeposits.length)} of {filteredDeposits.length} deposits
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed text-gray-400 hover:text-white transition-colors"
                >
                  <ChevronRight className="w-4 h-4 rotate-180" />
                </button>
                <span className="text-sm text-gray-400">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed text-gray-400 hover:text-white transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </motion.div>

        {/* Deposit Details Modal */}
        <AnimatePresence>
          {showDetails && selectedDeposit && (
            <DepositDetailsModal
              deposit={selectedDeposit}
              onClose={() => {
                setShowDetails(false);
                setSelectedDeposit(null);
              }}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PaymentTracking;