import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RefreshCw, Search, AlertCircle, TrendingUp,
  ChevronDown, ChevronUp, Package, BarChart3,CheckCircle,
} from 'lucide-react';
import { getSocialOrders } from '../../Service/social';
import { formatCurrency, fmtNum } from '../../Components/formatHelpers';
import { getStatus } from '../../Components/socialOrderHelpers';
import OrderDetailModal from '../../Components/OrderDetailModal';

// ─── Main Component ────────────────────────────────────────────────────────────
const BoostingHistory = () => {
  const [orders, setOrders]           = useState({ data: [], loading: true, refreshing: false, error: null });
  const [search, setSearch]           = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortOrder, setSortOrder]     = useState('desc');
  const [selected, setSelected]       = useState(null);

  const fetchOrders = useCallback(async (isRefresh = false) => {
    setOrders(prev => ({ ...prev, [isRefresh ? 'refreshing' : 'loading']: true, error: null }));
    try {
      const res = await getSocialOrders();
      setOrders(prev => ({ ...prev, data: Array.isArray(res?.data) ? res.data : [] }));
    } catch (err) {
      setOrders(prev => ({
        ...prev,
        error: err?.response?.data?.message || err?.message || 'Failed to load orders',
      }));
    } finally {
      setOrders(prev => ({ ...prev, loading: false, refreshing: false }));
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Derived stats
  const totalSpent     = orders.data.reduce((s, o) => s + (Number(o.amount) || 0), 0);
  const completedCount = orders.data.filter(o => o.status === 'completed').length;
  const activeCount    = orders.data.filter(o => o.status === 'pending' || o.status === 'processing').length;

  // Filtered + sorted list
  const filtered = orders.data
    .filter((o) => {
      const q = search.toLowerCase();
      const matchSearch =
        !search ||
        o.serviceName?.toLowerCase().includes(q) ||
        o.receiptNo?.toLowerCase().includes(q) ||
        o.link?.toLowerCase().includes(q);
      return matchSearch && (filterStatus === 'all' || o.status === filterStatus);
    })
    .sort((a, b) => {
      const d = new Date(b.createdAt) - new Date(a.createdAt);
      return sortOrder === 'desc' ? d : -d;
    });

  // ─── Loading ────────────────────────────────────────────────────────────────
  if (orders.loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black/95 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-10 h-10 text-emerald-500 animate-spin mx-auto mb-3" />
          <p className="text-gray-400">Loading order history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black/95 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
        >
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-medium text-emerald-400">Boosting History</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white font-['Space_Grotesk']">Social Orders</h1>
            <p className="text-gray-400 text-sm mt-1">Track the status of all your boosting orders</p>
          </div>
          <button
            onClick={() => fetchOrders(true)}
            disabled={orders.refreshing}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white transition-all hover:border-emerald-500/30 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${orders.refreshing ? 'animate-spin' : ''}`} />
            <span className="text-sm">{orders.refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </motion.div>

        {/* Error */}
        <AnimatePresence>
          {orders.error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {orders.error}
              <button onClick={() => fetchOrders()} className="ml-auto underline hover:text-red-300 transition-colors">
                Retry
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          {[
            { label: 'Total Spent',   value: formatCurrency(totalSpent), sub: `${orders.data.length} orders`, icon: TrendingUp,  color: 'text-emerald-400', hover: 'hover:border-emerald-500/30' },
            { label: 'Completed',     value: completedCount,             sub: 'Fully delivered',              icon: CheckCircle, color: 'text-green-400',   hover: 'hover:border-green-500/30'   },
            { label: 'Active',        value: activeCount,                sub: 'Pending & processing',         icon: Zap,         color: 'text-yellow-400',  hover: 'hover:border-yellow-500/30'  },
            { label: 'Total Orders',  value: orders.data.length,         sub: 'All time',                     icon: Package,     color: 'text-blue-400',    hover: 'hover:border-blue-500/30'    },
          ].map(({ label, value, sub, icon: Icon, color, hover }) => (
            <div key={label} className={`bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 transition-all duration-300 ${hover}`}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-400 text-sm">{label}</p>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <p className="text-xl font-bold text-white font-['Space_Grotesk']">{value}</p>
              <p className="text-xs text-gray-500 mt-1">{sub}</p>
            </div>
          ))}
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-3 mb-6"
        >
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by service, receipt or link..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 text-sm outline-none focus:border-emerald-500/50 transition-colors"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm outline-none focus:border-emerald-500/50 transition-colors"
            style={{ color: 'white' }}
          >
            <option value="all"        className="bg-gray-900">All Status</option>
            <option value="pending"    className="bg-gray-900">Pending</option>
            <option value="processing" className="bg-gray-900">Processing</option>
            <option value="completed"  className="bg-gray-900">Completed</option>
            <option value="partial"    className="bg-gray-900">Partial</option>
            <option value="cancelled"  className="bg-gray-900">Cancelled</option>
            <option value="failed"     className="bg-gray-900">Failed</option>
          </select>
          <button
            onClick={() => setSortOrder(s => s === 'desc' ? 'asc' : 'desc')}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm hover:border-emerald-500/30 transition-colors"
          >
            <span>Sort</span>
            {sortOrder === 'desc' ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </motion.div>

        {/* Orders table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden"
        >
          {filtered.length === 0 ? (
            <div className="p-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-gray-600" />
              </div>
              <p className="text-white font-semibold font-['Space_Grotesk']">No orders found</p>
              <p className="text-gray-400 text-sm mt-1">
                {search || filterStatus !== 'all'
                  ? 'Try adjusting your filters'
                  : "You haven't placed any boosting orders yet"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-white/10">
                  <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <th className="px-4 py-3">Service</th>
                    <th className="px-4 py-3 hidden md:table-cell">Link</th>
                    <th className="px-4 py-3 hidden sm:table-cell">Quantity</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 hidden lg:table-cell">Date</th>
                    <th className="px-4 py-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <AnimatePresence>
                    {filtered.map((order, index) => {
                      const status   = getStatus(order.status);
                      const platform = getPlatform(order.serviceName);
                      const StatusIcon   = status.icon;
                      const PlatformIcon = platform.icon;

                      return (
                        <motion.tr
                          key={order._id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.02 }}
                          onClick={() => setSelected(order)}
                          className="hover:bg-white/5 transition-colors cursor-pointer"
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${platform.bg} border ${platform.border} flex-shrink-0`}>
                                <PlatformIcon className={`w-4 h-4 ${platform.color}`} />
                              </div>
                              <div className="min-w-0">
                                <p className="text-white text-sm font-medium truncate max-w-[140px]">{order.serviceName}</p>
                                <p className="text-gray-500 text-xs font-mono truncate max-w-[120px]">{order.receiptNo}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 hidden md:table-cell">
                            <p className="text-gray-400 text-sm truncate max-w-[160px]">{order.link}</p>
                          </td>
                          <td className="px-4 py-3 hidden sm:table-cell">
                            <p className="text-white text-sm">{fmtNum(order.quantity)}</p>
                            {order.remains != null && (
                              <p className="text-gray-500 text-xs">{fmtNum(order.remains)} left</p>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex justify-center">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${status.bg} ${status.color} ${status.border}`}>
                                <StatusIcon className="w-3 h-3" />
                                {status.label}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 hidden lg:table-cell">
                            <p className="text-gray-400 text-sm">{formatDate(order.createdAt)}</p>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <p className="text-white font-semibold text-sm">{formatCurrency(order.amount)}</p>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}

          <div className="border-t border-white/10 px-4 py-3 flex items-center justify-between">
            <p className="text-xs text-gray-500">
              Showing {filtered.length} of {orders.data.length} orders
            </p>
            <button onClick={() => fetchOrders(true)} className="text-xs text-gray-400 hover:text-white transition-colors">
              Refresh data
            </button>
          </div>
        </motion.div>
      </div>

      {/* Detail modal */}
      <AnimatePresence>
        {selected && <OrderDetailModal order={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </div>
  );
};

export default BoostingHistory;
