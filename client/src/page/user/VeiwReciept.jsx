// ViewReceipt.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Download, 
  Printer, 
  Share2, 
  CheckCircle, 
  Clock, 
  Calendar,
  CreditCard,
  Receipt as ReceiptIcon,
  Copy,
  ExternalLink,
  TrendingUp,
  TrendingDown,
  Package,
  Smartphone,
  Mail,
  User,
  Hash,
  DollarSign,
  FileText,
  Shield,
  Loader2,
  AlertCircle,
  Search,
  Filter,
  X,
  BarChart3,
  Activity,
  Wallet,
  Zap,
  RefreshCw,
  Inbox
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { getAlluserPurchaseReceipt } from '../../Service/payment';
import DepositModal from '../../Components/DepositModal'; // ← ADD THIS IMPORT

const ViewReceipt = () => {
  const location = useLocation();
  const [receiptData, setReceiptData] = useState(null);
  const [allReceipts, setAllReceipts] = useState([]);
  const [filteredReceipts, setFilteredReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [showAllReceipts, setShowAllReceipts] = useState(false);
  const [filterType, setFilterType] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // ─── Deposit Modal State ───────────────────────────────────────────────────
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState(0);

  // Stats state
  const [stats, setStats] = useState({
    totalSpent: 0,
    totalTransactions: 0,
    successRate: 0,
    avgTransaction: 0,
    logPurchases: 0,
    otpPurchases: 0,
    thisMonth: 0,
    lastMonth: 0
  });

  // Get receipt ID from URL params
  const getReceiptIdFromUrl = () => {
    const params = new URLSearchParams(location.search);
    return params.get('id');
  };

  // Calculate stats from receipts
  const calculateStats = useCallback((receipts) => {
    if (!receipts || receipts.length === 0) {
      return {
        totalSpent: 0,
        totalTransactions: 0,
        successRate: 0,
        avgTransaction: 0,
        logPurchases: 0,
        otpPurchases: 0,
        thisMonth: 0,
        lastMonth: 0
      };
    }

    const total = receipts.reduce((sum, r) => sum + (r.amount || 0), 0);
    const successful = receipts.filter(r => r.status === 'SUCCESS').length;
    const rate = (successful / receipts.length) * 100;
    const avg = total / receipts.length;
    
    const logCount = receipts.filter(r => r.purchaseType === 'LOG').length;
    const otpCount = receipts.filter(r => r.purchaseType === 'OTP').length;

    // Calculate monthly stats
    const now = new Date();
    const thisMonth = receipts.filter(r => {
      const date = new Date(r.createdAt);
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }).reduce((sum, r) => sum + (r.amount || 0), 0);

    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1);
    const lastMonth = receipts.filter(r => {
      const date = new Date(r.createdAt);
      return date.getMonth() === lastMonthDate.getMonth() && 
             date.getFullYear() === lastMonthDate.getFullYear();
    }).reduce((sum, r) => sum + (r.amount || 0), 0);

    return {
      totalSpent: total,
      totalTransactions: receipts.length,
      successRate: rate,
      avgTransaction: avg,
      logPurchases: logCount,
      otpPurchases: otpCount,
      thisMonth: thisMonth,
      lastMonth: lastMonth
    };
  }, []);

  const fetchReceipts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAlluserPurchaseReceipt();
      
      if (response.success && response.data) {
        setAllReceipts(response.data);
        setFilteredReceipts(response.data);
        
        // Calculate stats
        const newStats = calculateStats(response.data);
        setStats(newStats);
        
        // Check if a specific receipt ID is requested
        const receiptId = getReceiptIdFromUrl();
        if (receiptId) {
          const found = response.data.find(r => r._id === receiptId);
          if (found) {
            setSelectedReceipt(found);
            setReceiptData(found);
          } else {
            setError('Receipt not found');
          }
        } else if (response.data.length > 0) {
          setSelectedReceipt(response.data[0]);
          setReceiptData(response.data[0]);
        }
        setLastUpdated(new Date());
      } else {
        setError('No receipts found');
      }
    } catch (err) {
      console.error('Error fetching receipts:', err);
      setError(err.message || 'Failed to load receipts');
    } finally {
      setLoading(false);
    }
  }, [calculateStats]);

  // Real-time update - poll every 30 seconds
  useEffect(() => {
    fetchReceipts();
    
    const interval = setInterval(() => {
      fetchReceipts();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchReceipts]);

  // Filter receipts
  useEffect(() => {
    let filtered = allReceipts;

    if (filterType !== 'ALL') {
      filtered = filtered.filter(r => r.purchaseType === filterType);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(r => 
        r.receiptNo?.toLowerCase().includes(term) ||
        r.description?.toLowerCase().includes(term) ||
        r._id?.toLowerCase().includes(term)
      );
    }

    setFilteredReceipts(filtered);

    if (selectedReceipt && !filtered.some(r => r._id === selectedReceipt._id)) {
      if (filtered.length > 0) {
        setSelectedReceipt(filtered[0]);
        setReceiptData(filtered[0]);
      } else {
        setSelectedReceipt(null);
        setReceiptData(null);
      }
    }
  }, [allReceipts, filterType, searchTerm, selectedReceipt]);

  // ─── Handle Deposit from View Receipt ─────────────────────────────────────
  const handleDepositClick = () => {
    setDepositAmount(0);
    setShowDepositModal(true);
  };

  // ─── Handle Deposit Success ────────────────────────────────────────────────
  const handleDepositSuccess = async (data) => {
    console.log('Deposit successful:', data);
    // Refresh receipts after deposit
    await fetchReceipts();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-NG', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(date);
  };

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return '₦0.00';
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatCompactCurrency = (amount) => {
    if (amount >= 1000000) {
      return `₦${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `₦${(amount / 1000).toFixed(0)}K`;
    }
    return formatCurrency(amount);
  };

  const getStatusColor = (status) => {
    switch(status?.toUpperCase()) {
      case 'SUCCESS': return 'text-green-400 bg-green-500/10 border-green-500/20';
      case 'PENDING': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'FAILED': return 'text-red-400 bg-red-500/10 border-red-500/20';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
    }
  };

  const getPurchaseTypeIcon = (type) => {
    switch(type?.toUpperCase()) {
      case 'LOG': return <Package className="w-4 h-4" />;
      case 'OTP': return <Smartphone className="w-4 h-4" />;
      default: return <CreditCard className="w-4 h-4" />;
    }
  };

  const getPurchaseTypeLabel = (type) => {
    switch(type?.toUpperCase()) {
      case 'LOG': return 'Log Purchase';
      case 'OTP': return 'OTP Service';
      default: return type || 'Unknown';
    }
  };

  const handleCopy = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleReceiptSelect = (receipt) => {
    setSelectedReceipt(receipt);
    setReceiptData(receipt);
    setShowAllReceipts(false);
  };

  const handleRefresh = () => {
    fetchReceipts();
  };

  const clearFilters = () => {
    setFilterType('ALL');
    setSearchTerm('');
  };

  // Stats Cards Component
  const StatsCards = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6"
    >
      <div className="p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/5 border border-green-500/20">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-400">Total Spent</span>
          <Wallet className="w-4 h-4 text-green-500" />
        </div>
        <p className="text-xl font-bold text-white">{formatCompactCurrency(stats.totalSpent)}</p>
        <p className="text-xs text-gray-500 mt-1">{stats.totalTransactions} transactions</p>
      </div>

      <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-400">Success Rate</span>
          <Activity className="w-4 h-4 text-blue-400" />
        </div>
        <p className="text-xl font-bold text-white">{stats.successRate.toFixed(1)}%</p>
        <div className="w-full bg-white/5 rounded-full h-1.5 mt-2">
          <div 
            className="bg-green-500 h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${stats.successRate}%` }}
          />
        </div>
      </div>

      <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-400">Avg. Transaction</span>
          <BarChart3 className="w-4 h-4 text-purple-400" />
        </div>
        <p className="text-xl font-bold text-white">{formatCurrency(stats.avgTransaction)}</p>
        <p className="text-xs text-gray-500 mt-1">Per purchase</p>
      </div>

      <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-400">This Month</span>
          <Zap className="w-4 h-4 text-orange-400" />
        </div>
        <p className="text-xl font-bold text-white">{formatCompactCurrency(stats.thisMonth)}</p>
        <p className={`text-xs mt-1 ${stats.thisMonth > stats.lastMonth ? 'text-green-400' : 'text-gray-500'}`}>
          {stats.thisMonth > stats.lastMonth ? '↑' : '→'} {stats.lastMonth > 0 ? `${((stats.thisMonth - stats.lastMonth) / stats.lastMonth * 100).toFixed(1)}%` : '0%'} from last month
        </p>
      </div>
    </motion.div>
  );

  // Filter Bar
  const FilterBar = () => (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="mb-6 p-4 rounded-xl bg-white/5 border border-white/10"
    >
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-400">Filter by:</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {['ALL', 'LOG', 'OTP'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filterType === type
                  ? 'bg-green-500 text-white shadow-lg shadow-green-500/25'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              {type === 'ALL' ? 'All Types' : type}
            </button>
          ))}
        </div>

        <div className="flex-1 min-w-[150px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search receipts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-green-500/50 transition-colors"
            />
          </div>
        </div>

        {(filterType !== 'ALL' || searchTerm) && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            Clear
          </button>
        )}
      </div>
    </motion.div>
  );

  // No Receipt Component - Compact
  const NoReceiptDisplay = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900/80 to-gray-950/80 backdrop-blur-xl border border-white/10 shadow-2xl p-8 md:p-12 text-center"
    >
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-green-500/10 to-emerald-500/5 border border-green-500/20 mx-auto flex items-center justify-center mb-4">
          <Inbox className="w-10 h-10 text-green-500" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2 font-['Space_Grotesk']">No Receipts Found</h3>
        <p className="text-gray-400 text-sm max-w-md mx-auto">
          {filterType !== 'ALL' || searchTerm ? (
            <>
              No receipts match your current filters.
              <button
                onClick={clearFilters}
                className="block mx-auto mt-2 text-green-500 hover:text-green-400 transition-colors text-sm font-medium"
              >
                Clear filters
              </button>
            </>
          ) : (
            'You haven\'t made any purchases yet. Start your first transaction today!'
          )}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
          {/* ─── Updated: Deposit Button with onClick handler ─────────────── */}
          <button
            onClick={handleDepositClick}
            className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-green-600 to-green-500 text-white font-semibold hover:from-green-500 hover:to-green-400 transition-all shadow-lg shadow-green-500/25"
          >
            Make a Deposit
          </button>
          <button
            onClick={handleRefresh}
            className="px-6 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold transition-all"
          >
            <RefreshCw size={16} className="inline mr-2" />
            Refresh
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-4">
          Last checked: {lastUpdated.toLocaleTimeString()}
        </p>
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black/95 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-green-500 animate-spin mx-auto mb-4" />
              <p className="text-gray-400">Loading your receipts...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Check if no receipts
  const hasNoReceipts = allReceipts.length === 0 || filteredReceipts.length === 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black/95 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-center justify-between gap-4 mb-6"
        >
          <div className="flex items-center gap-4">
            <Link to="/f/deposits-history" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
              <ArrowLeft size={20} />
              <span className="text-sm font-medium">Back to History</span>
            </Link>
            {!hasNoReceipts && (
              <span className="text-xs text-gray-500 bg-white/5 px-3 py-1 rounded-full border border-white/5">
                {filteredReceipts.length} {filteredReceipts.length === 1 ? 'receipt' : 'receipts'}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-sm text-gray-300"
            >
              <Filter size={16} />
              <span>Filters</span>
              {(filterType !== 'ALL' || searchTerm) && (
                <span className="w-2 h-2 rounded-full bg-green-500" />
              )}
            </button>
            <button
              onClick={handleRefresh}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-gray-400 hover:text-white"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
            {!hasNoReceipts && (
              <>
                <button
                  onClick={() => {}}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-gray-400 hover:text-white"
                >
                  <Download size={18} />
                </button>
                <button
                  onClick={() => {}}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-gray-400 hover:text-white"
                >
                  <Printer size={18} />
                </button>
              </>
            )}
          </div>
        </motion.div>

        {/* Stats Cards - Show even when no receipts */}
        <StatsCards />

        {/* Filter Bar - Show even when no receipts */}
        <AnimatePresence>
          {showFilters && <FilterBar />}
        </AnimatePresence>

        {/* Main Content */}
        {hasNoReceipts ? (
          <NoReceiptDisplay />
        ) : (
          <>
            {/* Receipt Card */}
            {receiptData && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900/80 to-gray-950/80 backdrop-blur-xl border border-white/10 shadow-2xl"
              >
                {/* Background Decorations */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-500/5 rounded-full blur-3xl" />
                  <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-green-600/5 rounded-full blur-3xl" />
                </div>

                {/* Receipt Content */}
                <div className="relative z-10 p-6 md:p-8">
                  {/* Status Banner */}
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-6 border-b border-white/5">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-green-600 to-green-500 shadow-lg shadow-green-500/20">
                        <ReceiptIcon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h1 className="text-xl font-bold text-white font-['Space_Grotesk']">Payment Receipt</h1>
                        <p className="text-xs text-gray-400">{formatDate(receiptData.createdAt)}</p>
                      </div>
                    </div>
                    <div className={`px-4 py-2 rounded-full border text-xs font-medium flex items-center gap-2 ${getStatusColor(receiptData.status)}`}>
                      <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                      {receiptData.status || 'UNKNOWN'}
                    </div>
                  </div>

                  {/* Receipt Number */}
                  <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 mb-6">
                    <div className="flex items-center gap-3 min-w-0">
                      <Hash className="w-4 h-4 text-gray-500 flex-shrink-0" />
                      <span className="text-sm text-gray-400 flex-shrink-0">Receipt No.</span>
                      <span className="text-sm font-mono text-white font-medium truncate">{receiptData.receiptNo || 'N/A'}</span>
                    </div>
                    <button
                      onClick={() => handleCopy(receiptData.receiptNo)}
                      className="p-1.5 rounded-lg hover:bg-white/10 transition-all text-gray-400 hover:text-white flex-shrink-0"
                    >
                      {copied ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Main Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="space-y-4">
                      <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                        <div className="flex items-center gap-2 text-gray-400 text-xs mb-2">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Transaction Date</span>
                        </div>
                        <p className="text-sm text-white font-medium">{formatDate(receiptData.createdAt)}</p>
                      </div>

                      <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                        <div className="flex items-center gap-2 text-gray-400 text-xs mb-2">
                          <User className="w-3.5 h-3.5" />
                          <span>User ID</span>
                        </div>
                        <p className="text-sm font-mono text-white font-medium truncate">{receiptData.userId || 'N/A'}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                        <div className="flex items-center gap-2 text-gray-400 text-xs mb-2">
                          <Package className="w-3.5 h-3.5" />
                          <span>Purchase Type</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {getPurchaseTypeIcon(receiptData.purchaseType)}
                          <span className="text-sm text-white font-medium">{getPurchaseTypeLabel(receiptData.purchaseType)}</span>
                          <span className="text-xs text-gray-500">•</span>
                          <span className="text-xs text-gray-400">{receiptData.itemModel || 'N/A'}</span>
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                        <div className="flex items-center gap-2 text-gray-400 text-xs mb-2">
                          <FileText className="w-3.5 h-3.5" />
                          <span>Description</span>
                        </div>
                        <p className="text-sm text-white font-medium">{receiptData.description || 'No description'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Amount Section */}
                  <div className="p-6 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/5 border border-green-500/20 mb-8">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Total Amount</p>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-bold text-white font-['Space_Grotesk']">
                            {formatCurrency(receiptData.amount)}
                          </span>
                          <span className="text-xs text-green-400 font-medium px-2 py-1 rounded-full bg-green-500/20">
                            {receiptData.currency || 'NGN'}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400 mb-1">Balance</p>
                        <div className="flex flex-wrap items-center gap-3">
                          <div className="text-right">
                            <p className="text-xs text-gray-500">Before</p>
                            <p className="text-sm text-white font-medium">{formatCurrency(receiptData.balanceBefore)}</p>
                          </div>
                          <div className="text-green-500">→</div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500">After</p>
                            <p className="text-sm text-green-400 font-medium">{formatCurrency(receiptData.balanceAfter)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* ─── Updated: Top Up Wallet button with onClick handler ───── */}
                    <button
                      onClick={handleDepositClick}
                      className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-semibold transition-all duration-300 shadow-lg shadow-green-500/25 group"
                    >
                      <TrendingUp size={16} className="group-hover:scale-110 transition-transform" />
                      <span className="text-sm">Top Up Wallet</span>
                    </button>
                    <Link to="/f/deposits-history" className="w-full">
                      <button className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold transition-all duration-300 group">
                        <ExternalLink size={16} className="group-hover:translate-x-1 transition-transform" />
                        <span className="text-sm">View All History</span>
                      </button>
                    </Link>
                  </div>

                  {/* Footer */}
                  <div className="mt-8 pt-6 border-t border-white/5 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                      <span>Transaction verified • Secure</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>ID: {receiptData._id?.slice(0, 12) || 'N/A'}</span>
                      <span>•</span>
                      <span>v2.0</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Additional Info Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6"
            >
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Processing Time</span>
                </div>
                <p className="text-sm text-white font-medium">Instant</p>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Security Level</span>
                </div>
                <p className="text-sm text-green-400 font-medium">256-bit Encrypted</p>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>Currency</span>
                </div>
                <p className="text-sm text-white font-medium">{receiptData?.currency || 'Nigerian Naira (NGN)'}</p>
              </div>
            </motion.div>

            {/* Total Receipts Count */}
            {filteredReceipts.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 text-center"
              >
                <p className="text-xs text-gray-500">
                  Showing {filteredReceipts.length} of {allReceipts.length} receipts • 
                  <span className="text-green-500 ml-1">
                    {filterType !== 'ALL' ? `Filtered by: ${filterType}` : 'All types'}
                  </span>
                  {searchTerm && <span className="ml-1 text-gray-400">• Search: "{searchTerm}"</span>}
                  <span className="ml-2 text-gray-600">• Updated: {lastUpdated.toLocaleTimeString()}</span>
                </p>
              </motion.div>
            )}
          </>
        )}
      </div>

      {/* ─── Deposit Modal ─────────────────────────────────────────────────── */}
      <DepositModal
        isOpen={showDepositModal}
        onClose={() => setShowDepositModal(false)}
        onSuccess={handleDepositSuccess}
        amount={depositAmount}
        paymentMethod="SQUAD"
      />
    </div>
  );
};

export default ViewReceipt;