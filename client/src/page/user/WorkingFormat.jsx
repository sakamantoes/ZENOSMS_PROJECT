import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, RefreshCw, Wallet, AlertCircle,
  BookOpen, Package, X, Store,
} from 'lucide-react';
import { getWorkingFormats } from '../../Service/workingFormat';
import useWallet from '../../Hooks/UseWallet';
import FormatProductCard from '../../Components/FormatProductCard';
import SkeletonCard from '../../Components/SkeletonCard';
import BuyComingSoonModal from '../../Components/BuyComingSoonModal';

const formatCurrency = (amount) => {
  const n = Number(amount);
  if (!Number.isFinite(n)) return '₦0.00';
  return new Intl.NumberFormat('en-NG', {
    style: 'currency', currency: 'NGN',
    minimumFractionDigits: 2, maximumFractionDigits: 2,
  }).format(n);
};

const WorkingFormat = () => {
  const [formats, setFormats] = useState({ data: [], loading: true, refreshing: false, error: null });
  const [search, setSearch]   = useState('');
  const [buyItem, setBuyItem] = useState(null);

  const { balance, refetch: refetchBalance } = useWallet();

  const fetchFormats = useCallback(async (isRefresh = false) => {
    setFormats(prev => ({ ...prev, [isRefresh ? 'refreshing' : 'loading']: true, error: null }));
    try {
      const res = await getWorkingFormats();
      setFormats(prev => ({ ...prev, data: Array.isArray(res?.data) ? res.data : [] }));
    } catch (err) {
      setFormats(prev => ({
        ...prev,
        error: err?.response?.data?.message || err?.message || 'Failed to load formats',
      }));
    } finally {
      setFormats(prev => ({ ...prev, loading: false, refreshing: false }));
    }
  }, []);

  useEffect(() => {
    fetchFormats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = formats.data
    .map((f) => ({ ...f, type: 'format' }))
    .filter((item) => {
      const q = search.toLowerCase();
      return (
        !search ||
        item.productName?.toLowerCase().includes(q) ||
        item.productDescription?.toLowerCase().includes(q)
      );
    });

  if (formats.loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black/95 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8 animate-pulse">
            <div className="space-y-2">
              <div className="h-8 bg-white/5 rounded-xl w-48" />
              <div className="h-4 bg-white/5 rounded-lg w-64" />
            </div>
            <div className="h-10 bg-white/5 rounded-xl w-36" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black/95 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-center justify-between gap-4 mb-6"
        >
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 mt-0.5">
              <Store className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white font-['Space_Grotesk']">
                Format Market
              </h1>
              <p className="text-sm text-gray-400 mt-0.5">
                Browse working formats uploaded by the admin
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <Wallet className="w-4 h-4 text-emerald-400" />
              <span className="text-sm text-white font-medium">{formatCurrency(balance)}</span>
            </div>
            <button
              onClick={() => { fetchFormats(true); refetchBalance(); }}
              disabled={formats.refreshing}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white transition-all disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw className={`w-5 h-5 ${formats.refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </motion.div>

        {/* Error */}
        <AnimatePresence>
          {formats.error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-2"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              {formats.error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats + Search row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
          className="mb-6 flex flex-wrap items-center justify-between gap-3"
        >
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/15">
            <div className="p-1.5 rounded-lg bg-emerald-500/10">
              <BookOpen className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <p className="text-[11px] text-gray-500">Total Formats</p>
              <p className="text-base font-bold text-white font-['Space_Grotesk'] leading-none">
                {formats.data.length}
              </p>
            </div>
          </div>

          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            <input
              type="text"
              placeholder="Search formats..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm outline-none focus:border-emerald-500/50 transition-colors"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </motion.div>

        {/* Results count */}
        <div className="mb-4 flex items-center gap-2 text-sm text-gray-400">
          <span>
            Showing <span className="text-white font-medium">{filtered.length}</span>{' '}
            {filtered.length === 1 ? 'format' : 'formats'}
          </span>
          {search && (
            <span>for <span className="text-emerald-400 font-medium">"{search}"</span></span>
          )}
        </div>

        {/* Grid */}
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <AnimatePresence mode="popLayout">
            {filtered.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="col-span-full flex flex-col items-center justify-center py-24 gap-4"
              >
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                  <Package className="w-12 h-12 text-gray-600" />
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold text-white font-['Space_Grotesk'] mb-1">
                    No formats found
                  </h3>
                  <p className="text-sm text-gray-400 max-w-sm">
                    {search
                      ? `No results for "${search}". Try a different keyword.`
                      : 'No active formats available right now. Check back soon.'}
                  </p>
                </div>
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-colors text-sm font-medium"
                  >
                    Clear Search
                  </button>
                )}
              </motion.div>
            ) : (
              filtered.map((item, index) => (
                <FormatProductCard
                  key={item._id}
                  item={item}
                  index={index}
                  onBuy={(i) => setBuyItem(i)}
                />
              ))
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      <AnimatePresence>
        {buyItem && (
          <BuyComingSoonModal item={buyItem} onClose={() => setBuyItem(null)} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default WorkingFormat;
