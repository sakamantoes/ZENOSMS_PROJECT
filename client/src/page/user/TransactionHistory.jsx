// TransactionHistory.jsx

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  RefreshCw,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  Copy,
  Check,
  Eye,
  EyeOff,
  Wallet,
  Banknote,
  Calendar,
  Hash,
  User,
  Mail,
  Building2,
  TrendingUp
} from 'lucide-react';
import { getWalletBalance, getAllUserDeposits } from '../../Service/wallet';
import useWallet from '../../Hooks/UseWallet';

const TransactionHistory = () => {
  const { wallet, balance, isLoading: walletLoading, refetch } = useWallet();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState(false);

  // Fetch transactions
  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAllUserDeposits();
      
      // Check if response is successful and has data
      if (response && response.success && response.data) {
        const deposits = Array.isArray(response.data) ? response.data : [];
        
        // Transform deposits to match transaction format
        const formattedTransactions = deposits.map(deposit => ({
          id: deposit._id || deposit.id || `deposit_${Date.now()}_${Math.random()}`,
          type: 'deposit',
          amount: parseFloat(deposit.amount) || parseFloat(deposit.totalDeposit) || 0,
          totalDeposit: parseFloat(deposit.totalDeposit) || 0,
          fee: parseFloat(deposit.fee) || 0,
          status: deposit.status?.toLowerCase() || 'pending',
          date: deposit.createdAt || deposit.date || deposit.created_at || new Date().toISOString(),
          description: deposit.description || deposit.note || 'Wallet deposit',
          reference: deposit.referenceId || deposit.reference || deposit.trx_ref || deposit.transaction_id || 'N/A',
          method: deposit.provider || deposit.paymentMethod || deposit.method || deposit.payment_method || 'Bank Transfer',
          depositorName: deposit.depositorName || 'N/A',
          depositorEmail: deposit.depositorEmail || 'N/A',
          accountNumber: deposit.accountNumber || 'N/A',
          currency: deposit.currency || 'NGN',
          metadata: deposit.metadata || {},
          user: deposit.user || deposit.userId || null
        }));
        
        setTransactions(formattedTransactions);
      } else if (response && Array.isArray(response)) {
        // If response is directly an array
        const formattedTransactions = response.map(deposit => ({
          id: deposit._id || deposit.id || `deposit_${Date.now()}_${Math.random()}`,
          type: 'deposit',
          amount: parseFloat(deposit.amount) || parseFloat(deposit.totalDeposit) || 0,
          totalDeposit: parseFloat(deposit.totalDeposit) || 0,
          fee: parseFloat(deposit.fee) || 0,
          status: deposit.status?.toLowerCase() || 'pending',
          date: deposit.createdAt || deposit.date || deposit.created_at || new Date().toISOString(),
          description: deposit.description || deposit.note || 'Wallet deposit',
          reference: deposit.referenceId || deposit.reference || deposit.trx_ref || deposit.transaction_id || 'N/A',
          method: deposit.provider || deposit.paymentMethod || deposit.method || deposit.payment_method || 'Bank Transfer',
          depositorName: deposit.depositorName || 'N/A',
          depositorEmail: deposit.depositorEmail || 'N/A',
          accountNumber: deposit.accountNumber || 'N/A',
          currency: deposit.currency || 'NGN',
          metadata: deposit.metadata || {},
          user: deposit.user || deposit.userId || null
        }));
        
        setTransactions(formattedTransactions);
      } else {
        setTransactions([]);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setError(error.message || 'Failed to load transactions');
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null || isNaN(amount)) return '₦0.00';
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      return new Intl.DateTimeFormat('en-NG', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
    } catch {
      return 'Invalid Date';
    }
  };

  const getStatusConfig = (status) => {
    const normalizedStatus = status?.toLowerCase() || 'pending';
    const configs = {
      success: {
        icon: CheckCircle,
        color: 'text-green-500',
        bg: 'bg-green-500/10',
        border: 'border-green-500/20',
        label: 'Successful'
      },
      completed: {
        icon: CheckCircle,
        color: 'text-green-500',
        bg: 'bg-green-500/10',
        border: 'border-green-500/20',
        label: 'Completed'
      },
      pending: {
        icon: Clock,
        color: 'text-yellow-500',
        bg: 'bg-yellow-500/10',
        border: 'border-yellow-500/20',
        label: 'Pending'
      },
      failed: {
        icon: XCircle,
        color: 'text-red-500',
        bg: 'bg-red-500/10',
        border: 'border-red-500/20',
        label: 'Failed'
      },
      processing: {
        icon: AlertCircle,
        color: 'text-blue-500',
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/20',
        label: 'Processing'
      },
      cancelled: {
        icon: XCircle,
        color: 'text-gray-500',
        bg: 'bg-gray-500/10',
        border: 'border-gray-500/20',
        label: 'Cancelled'
      }
    };
    return configs[normalizedStatus] || configs.pending;
  };

  const handleCopy = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleRefresh = () => {
    fetchTransactions();
    refetch();
  };

  // Filter and sort transactions
  const filteredTransactions = transactions
    .filter(txn => {
      if (!txn) return false;
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        (txn.description?.toLowerCase() || '').includes(searchLower) ||
        (txn.reference?.toLowerCase() || '').includes(searchLower) ||
        (txn.method?.toLowerCase() || '').includes(searchLower) ||
        (txn.depositorName?.toLowerCase() || '').includes(searchLower) ||
        (txn.accountNumber || '').includes(searchLower);
      const matchesType = filterType === 'all' || txn.type === filterType;
      const matchesStatus = filterStatus === 'all' || (txn.status?.toLowerCase() === filterStatus.toLowerCase());
      return matchesSearch && matchesType && matchesStatus;
    })
    .sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

  // Stats - Using real data
  const totalDeposits = transactions
    .filter(t => t?.status?.toLowerCase() === 'success' || t?.status?.toLowerCase() === 'completed')
    .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

  const pendingDeposits = transactions
    .filter(t => t?.status?.toLowerCase() === 'pending')
    .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

  const failedDeposits = transactions
    .filter(t => t?.status?.toLowerCase() === 'failed' || t?.status?.toLowerCase() === 'cancelled')
    .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

  const successfulCount = transactions
    .filter(t => t?.status?.toLowerCase() === 'success' || t?.status?.toLowerCase() === 'completed').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black/95 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"
        >
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-medium text-green-400">Transaction History</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white font-['Space_Grotesk']">
              Deposit History
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              View and manage all your deposit transactions
            </p>
          </div>
          <button
            onClick={handleRefresh}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white transition-all duration-300 hover:border-green-500/30"
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            <span className="text-sm">{loading ? 'Loading...' : 'Refresh'}</span>
          </button>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2"
          >
            <AlertCircle size={16} />
            <span>{error}</span>
            <button
              onClick={fetchTransactions}
              className="ml-auto text-red-400 hover:text-red-300 underline"
            >
              Retry
            </button>
          </motion.div>
        )}

        {/* Stats Cards - Real Data */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 hover:border-green-500/30 transition-all duration-300">
            <div className="flex items-center justify-between">
              <p className="text-gray-400 text-sm">Total Deposits</p>
              <TrendingUp className="text-green-500 text-lg" />
            </div>
            <p className="text-xl md:text-2xl font-bold text-white mt-2 font-['Space_Grotesk']">
              {formatCurrency(totalDeposits)}
            </p>
            <p className="text-xs text-gray-500 mt-1">{successfulCount} successful deposits</p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 hover:border-yellow-500/30 transition-all duration-300">
            <div className="flex items-center justify-between">
              <p className="text-gray-400 text-sm">Pending Deposits</p>
              <Clock className="text-yellow-500 text-lg" />
            </div>
            <p className="text-xl md:text-2xl font-bold text-white mt-2 font-['Space_Grotesk']">
              {formatCurrency(pendingDeposits)}
            </p>
            <p className="text-xs text-gray-500 mt-1">Awaiting confirmation</p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 hover:border-red-500/30 transition-all duration-300">
            <div className="flex items-center justify-between">
              <p className="text-gray-400 text-sm">Failed Deposits</p>
              <XCircle className="text-red-500 text-lg" />
            </div>
            <p className="text-xl md:text-2xl font-bold text-white mt-2 font-['Space_Grotesk']">
              {formatCurrency(failedDeposits)}
            </p>
            <p className="text-xs text-gray-500 mt-1">Failed or cancelled</p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 hover:border-blue-500/30 transition-all duration-300">
            <div className="flex items-center justify-between">
              <p className="text-gray-400 text-sm">Total Transactions</p>
              <Filter className="text-blue-500 text-lg" />
            </div>
            <p className="text-xl md:text-2xl font-bold text-white mt-2 font-['Space_Grotesk']">
              {transactions.length}
            </p>
            <p className="text-xs text-gray-500 mt-1">All deposits</p>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-4 mb-6"
        >
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={16} />
            <input
              type="text"
              placeholder="Search by description, reference, name or account..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-green-500/50 transition-all duration-300"
            />
          </div>

          {/* Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2.5 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white focus:outline-none focus:border-green-500/50 transition-all duration-300"
          >
            <option value="all">All Types</option>
            <option value="deposit">Deposits</option>
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white focus:outline-none focus:border-green-500/50 transition-all duration-300"
          >
            <option value="all">All Status</option>
            <option value="success">Successful</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="processing">Processing</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {/* Sort */}
          <button
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white hover:border-green-500/30 transition-all duration-300"
          >
            <span className="text-sm">Sort</span>
            {sortOrder === 'desc' ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </button>
        </motion.div>

        {/* Transactions List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden"
        >
          {loading ? (
            <div className="p-8 text-center">
              <RefreshCw className="animate-spin text-green-500 mx-auto mb-4" size={32} />
              <p className="text-gray-400">Loading transactions...</p>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
                <Search className="text-gray-500" size={24} />
              </div>
              <p className="text-white font-semibold">No transactions found</p>
              <p className="text-gray-400 text-sm mt-1">
                {searchTerm || filterStatus !== 'all' || filterType !== 'all' 
                  ? 'Try adjusting your search or filters' 
                  : 'You have no deposit transactions yet'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-white/10">
                  <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <th className="px-4 py-3">Transaction</th>
                    <th className="px-4 py-3 hidden md:table-cell">Reference</th>
                    <th className="px-4 py-3 hidden sm:table-cell">Date</th>
                    <th className="px-4 py-3 hidden lg:table-cell">Method</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <AnimatePresence>
                    {filteredTransactions.map((txn, index) => {
                      const statusConfig = getStatusConfig(txn.status);
                      const StatusIcon = statusConfig.icon;
                      
                      return (
                        <motion.tr
                          key={txn.id || index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.02 }}
                          className="hover:bg-white/5 transition-colors duration-200 cursor-pointer"
                          onClick={() => {
                            setSelectedTransaction(txn);
                            setShowDetails(true);
                          }}
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${txn.status?.toLowerCase() === 'success' || txn.status?.toLowerCase() === 'completed' ? 'bg-green-500/10 border border-green-500/20' : 'bg-yellow-500/10 border border-yellow-500/20'}`}>
                                <ArrowUpRight className={txn.status?.toLowerCase() === 'success' || txn.status?.toLowerCase() === 'completed' ? 'text-green-500' : 'text-yellow-500'} size={16} />
                              </div>
                              <div>
                                <p className="text-white font-medium text-sm truncate max-w-[150px]">
                                  {txn.description || 'Deposit'}
                                </p>
                                {txn.depositorName && txn.depositorName !== 'N/A' && (
                                  <p className="text-gray-500 text-xs truncate max-w-[120px]">
                                    {txn.depositorName}
                                  </p>
                                )}
                                <p className="text-gray-500 text-xs md:hidden">
                                  {formatDate(txn.date)}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 hidden md:table-cell">
                            <div className="flex items-center gap-2">
                              <span className="text-gray-400 text-sm font-mono truncate max-w-[100px]">
                                {txn.reference?.slice(0, 12) || 'N/A'}
                              </span>
                              {txn.reference && txn.reference !== 'N/A' && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCopy(txn.reference);
                                  }}
                                  className="p-1 rounded hover:bg-white/10 transition-colors flex-shrink-0"
                                >
                                  {copied ? (
                                    <Check className="text-green-500" size={12} />
                                  ) : (
                                    <Copy className="text-gray-500" size={12} />
                                  )}
                                </button>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 hidden sm:table-cell">
                            <span className="text-gray-400 text-sm">{formatDate(txn.date)}</span>
                          </td>
                          <td className="px-4 py-3 hidden lg:table-cell">
                            <span className="text-gray-400 text-sm">{txn.method || 'N/A'}</span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex justify-center">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.color} border ${statusConfig.border}`}>
                                <StatusIcon size={10} />
                                {statusConfig.label}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className="text-white font-semibold">
                              {formatCurrency(txn.amount)}
                            </span>
                            {txn.fee > 0 && (
                              <p className="text-xs text-gray-500">Fee: {formatCurrency(txn.fee)}</p>
                            )}
                          </td>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}

          {/* Footer */}
          <div className="border-t border-white/10 px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-xs text-gray-500">
              Showing {filteredTransactions.length} of {transactions.length} transactions
            </p>
            <button
              onClick={handleRefresh}
              className="text-xs text-gray-400 hover:text-white transition-colors"
            >
              Refresh data
            </button>
          </div>
        </motion.div>
      </div>

      {/* Transaction Details Modal */}
      <AnimatePresence>
        {showDetails && selectedTransaction && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDetails(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 z-50 max-w-md w-full bg-gray-900 border border-white/10 rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white font-['Space_Grotesk']">
                  Transaction Details
                </h3>
                <button
                  onClick={() => setShowDetails(false)}
                  className="p-1 rounded hover:bg-white/10 transition-colors"
                >
                  <XCircle className="text-gray-500" size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className={`p-2 rounded-lg ${selectedTransaction.status?.toLowerCase() === 'success' || selectedTransaction.status?.toLowerCase() === 'completed' ? 'bg-green-500/10 border border-green-500/20' : 'bg-yellow-500/10 border border-yellow-500/20'}`}>
                    <ArrowUpRight className={selectedTransaction.status?.toLowerCase() === 'success' || selectedTransaction.status?.toLowerCase() === 'completed' ? 'text-green-500' : 'text-yellow-500'} size={20} />
                  </div>
                  <div>
                    <p className="text-white font-semibold">{selectedTransaction.description || 'Deposit'}</p>
                    <p className="text-2xl font-bold text-white font-['Space_Grotesk']">
                      {formatCurrency(selectedTransaction.amount)}
                    </p>
                    {selectedTransaction.fee > 0 && (
                      <p className="text-xs text-gray-500">Fee: {formatCurrency(selectedTransaction.fee)}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-gray-500 text-xs">Status</p>
                    {(() => {
                      const config = getStatusConfig(selectedTransaction.status);
                      const Icon = config.icon;
                      return (
                        <p className={`flex items-center gap-1.5 text-sm font-semibold ${config.color} mt-1`}>
                          <Icon size={14} />
                          {config.label}
                        </p>
                      );
                    })()}
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-gray-500 text-xs">Method</p>
                    <p className="text-white text-sm font-semibold mt-1">{selectedTransaction.method || 'N/A'}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-gray-500 text-xs">Currency</p>
                    <p className="text-white text-sm font-semibold mt-1">{selectedTransaction.currency || 'NGN'}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-gray-500 text-xs">Total Deposit</p>
                    <p className="text-white text-sm font-semibold mt-1">{formatCurrency(selectedTransaction.totalDeposit || selectedTransaction.amount)}</p>
                  </div>
                  {selectedTransaction.depositorName && selectedTransaction.depositorName !== 'N/A' && (
                    <>
                      <div className="p-3 rounded-xl bg-white/5 border border-white/10 col-span-2">
                        <p className="text-gray-500 text-xs">Depositor</p>
                        <p className="text-white text-sm font-semibold mt-1">{selectedTransaction.depositorName}</p>
                      </div>
                      {selectedTransaction.depositorEmail && selectedTransaction.depositorEmail !== 'N/A' && (
                        <div className="p-3 rounded-xl bg-white/5 border border-white/10 col-span-2">
                          <p className="text-gray-500 text-xs">Email</p>
                          <p className="text-white text-sm font-semibold mt-1">{selectedTransaction.depositorEmail}</p>
                        </div>
                      )}
                      {selectedTransaction.accountNumber && selectedTransaction.accountNumber !== 'N/A' && (
                        <div className="p-3 rounded-xl bg-white/5 border border-white/10 col-span-2">
                          <p className="text-gray-500 text-xs">Account Number</p>
                          <p className="text-white text-sm font-semibold mt-1">{selectedTransaction.accountNumber}</p>
                        </div>
                      )}
                    </>
                  )}
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10 col-span-2">
                    <p className="text-gray-500 text-xs">Reference</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-white text-sm font-mono truncate flex-1">
                        {selectedTransaction.reference || 'N/A'}
                      </span>
                      {selectedTransaction.reference && selectedTransaction.reference !== 'N/A' && (
                        <button
                          onClick={() => handleCopy(selectedTransaction.reference)}
                          className="p-1 rounded hover:bg-white/10 transition-colors flex-shrink-0"
                        >
                          {copied ? (
                            <Check className="text-green-500" size={14} />
                          ) : (
                            <Copy className="text-gray-500" size={14} />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10 col-span-2">
                    <p className="text-gray-500 text-xs">Date</p>
                    <p className="text-white text-sm font-semibold mt-1">{formatDate(selectedTransaction.date)}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TransactionHistory;