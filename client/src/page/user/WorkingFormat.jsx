/**
 * WorkingFormat.jsx
 * ---------------
 * FIXES:
 *  1. fetchFormats() now calls getWorkingFormats() — NOT workImageAndFormatePurchase().
 *  2. workImageAndFormatePurchase() is only called after the user confirms in the modal.
 *  3. parseApiError() converts every backend error shape to a plain string — never an object.
 *  4. formats.error is always null or a string — React will never crash rendering it.
 *  5. Purchase loading state is independent (purchaseLoading) from fetch loading/refreshing.
 *  6. On successful purchase: refetchBalance(), fetchFormats(true), setBuyItem(null).
 *  7. Pre-flight guard: validates selectedFormat._id before calling the buy API.
 *  8. Readable error messages shown for every failure scenario.
 *  9. useMemo used for filtered list to avoid unnecessary recomputation.
 * 10. Clean imports — only what is used.
 * 11. Success state with Telegram notification and order details.
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, RefreshCw, Wallet, AlertCircle,
  BookOpen, Package, X, Store,
} from 'lucide-react';

// ✅ FIX 1: import getWorkingFormats for fetching; keep workImageAndFormatePurchase for buying
import {
  getWorkingFormats,
  workImageAndFormatePurchase,
} from '../../Service/workingFormat';

import useWallet from '../../Hooks/UseWallet';
import FormatProductCard from '../../Components/FormatProductCard';
import SkeletonCard from '../../Components/SkeletonCard';
import BuyComingSoonModal from '../../Components/BuyComingSoonModal';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Format a number as Nigerian Naira currency string */
const formatCurrency = (amount) => {
  const n = Number(amount);
  if (!Number.isFinite(n)) return '₦0.00';
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
};

/**
 * parseApiError
 * ✅ FIX 3 & 8: Converts ANY backend or Axios error into a plain readable string.
 * This prevents React from ever trying to render an object as a child.
 *
 * Handles:
 *  - Plain strings
 *  - Axios errors with response.data.message (string or object)
 *  - Axios errors with response.data.error (string or object)
 *  - Generic Error objects
 *  - Unknown shapes
 */
const parseApiError = (err) => {
  // Already a plain string
  if (typeof err === 'string') return err;

  const data = err?.response?.data;

  if (data) {
    // message is a plain string
    if (typeof data.message === 'string') return data.message;

    // error is a plain string
    if (typeof data.error === 'string') return data.error;

    // message is an object e.g. { id: "id must be a valid format id" }
    if (typeof data.message === 'object' && data.message !== null)
      return Object.values(data.message).join(', ');

    // error is an object e.g. { id: "id must be a valid format id" }
    if (typeof data.error === 'object' && data.error !== null)
      return Object.values(data.error).join(', ');
  }

  // Native Error object
  if (typeof err?.message === 'string') return err.message;

  return 'Something went wrong. Please try again.';
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const WorkingFormat = () => {
  // ✅ FIX 4: error is always null or a STRING — never an object
  const [formats, setFormats] = useState({
    data: [],
    loading: true,
    refreshing: false,
    error: null,       // string | null
  });

  const [search, setSearch] = useState('');

  // The format the user clicked Buy on; passed to the modal
  const [buyItem, setBuyItem] = useState(null);

  // ✅ FIX 5: purchase loading is independent from format-fetch loading
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [purchaseError, setPurchaseError] = useState(null); // string | null
  
  // ✅ NEW: Success state for purchase
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [purchaseData, setPurchaseData] = useState(null);

  const { balance, refetch: refetchBalance } = useWallet();

  // -----------------------------------------------------------------------
  // ✅ FIX 1: fetchFormats uses getWorkingFormats() — the correct endpoint
  // -----------------------------------------------------------------------
  const fetchFormats = useCallback(async (isRefresh = false) => {
    setFormats((prev) => ({
      ...prev,
      [isRefresh ? 'refreshing' : 'loading']: true,
      error: null,
    }));

    try {
      const res = await getWorkingFormats(); // ✅ correct API — NOT the buy endpoint
      setFormats((prev) => ({
        ...prev,
        data: Array.isArray(res?.data) ? res.data : [],
      }));
    } catch (err) {
      // ✅ FIX 4: always convert to string before storing
      setFormats((prev) => ({
        ...prev,
        error: parseApiError(err),
      }));
    } finally {
      setFormats((prev) => ({ ...prev, loading: false, refreshing: false }));
    }
  }, []);

  // Fetch on mount
  useEffect(() => {
    fetchFormats();
  }, [fetchFormats]);

  // -----------------------------------------------------------------------
  // ✅ FIX 2 & 7: handleConfirmPurchase — only called from within the modal
  //    on user confirmation, never on page load
  // -----------------------------------------------------------------------
  const handleConfirmPurchase = useCallback(async (item) => {
    // ✅ FIX 7: pre-flight validation — do NOT call the API without a valid _id
    if (!item?._id) {
      setPurchaseError('Invalid format selected. Please close and try again.');
      return;
    }

    setPurchaseLoading(true);
    setPurchaseError(null);
    setPurchaseSuccess(false);
    setPurchaseData(null);

    try {
      // ✅ FIX 2: pass item._id (the string), not item (object), not undefined
      const response = await workImageAndFormatePurchase(item._id);
      
      // ✅ NEW: Store purchase data for success display
      setPurchaseData({
        orderId: response?.data?.order?._id || response?.data?.order?.id || item._id,
        receiptNo: response?.data?.receipt?.receiptNo || 'N/A',
        amount: response?.data?.receipt?.amount || item.sellingPrice,
        productName: item.productName,
        type: item.type,
      });

      // ✅ FIX 6: refresh wallet immediately after purchase
      await refetchBalance();

      // ✅ FIX 7: refresh format list after purchase (silent background refresh)
      await fetchFormats(true);

      // ✅ NEW: Set success state
      setPurchaseSuccess(true);
      setPurchaseError(null);
      
      // ✅ FIX 8: Keep modal open to show success (don't close immediately)
      // The modal will show success state with Telegram button
      
    } catch (err) {
      // ✅ FIX 8 & 3: readable error string — never an object
      setPurchaseError(parseApiError(err));
      setPurchaseSuccess(false);
      setPurchaseData(null);
    } finally {
      setPurchaseLoading(false);
    }
  }, [refetchBalance, fetchFormats]);

  /**
   * Handle modal close
   * Resets all purchase states
   */
  const handleModalClose = useCallback(() => {
    setBuyItem(null);
    setPurchaseError(null);
    setPurchaseSuccess(false);
    setPurchaseData(null);
  }, []);

  // -----------------------------------------------------------------------
  // ✅ FIX 9: useMemo to avoid recomputing filtered list on every render
  // -----------------------------------------------------------------------
  const filtered = useMemo(() => {
    return formats.data
      .map((f) => ({ ...f, type: f.type ?? 'format' }))
      .filter((item) => {
        const q = search.toLowerCase();
        return (
          !search ||
          item.productName?.toLowerCase().includes(q) ||
          item.productDescription?.toLowerCase().includes(q)
        );
      });
  }, [formats.data, search]);

  // -----------------------------------------------------------------------
  // Loading skeleton (initial load only)
  // -----------------------------------------------------------------------
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
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // -----------------------------------------------------------------------
  // Main render
  // -----------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black/95 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">

        {/* Header -------------------------------------------------------- */}
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
              <span className="text-sm text-white font-medium">
                {formatCurrency(balance)}
              </span>
            </div>
            <button
              onClick={() => { fetchFormats(true); refetchBalance(); }}
              disabled={formats.refreshing || purchaseLoading}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              title="Refresh"
            >
              <RefreshCw className={`w-5 h-5 ${formats.refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </motion.div>

        {/* Fetch error banner -------------------------------------------- */}
        <AnimatePresence>
          {/* ✅ FIX 4: formats.error is always a string — safe to render directly */}
          {formats.error && !purchaseSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-2"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{formats.error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats + Search row -------------------------------------------- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
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

        {/* Results count ------------------------------------------------- */}
        <div className="mb-4 flex items-center gap-2 text-sm text-gray-400">
          <span>
            Showing{' '}
            <span className="text-white font-medium">{filtered.length}</span>{' '}
            {filtered.length === 1 ? 'format' : 'formats'}
          </span>
          {search && (
            <span>
              for{' '}
              <span className="text-emerald-400 font-medium">"{search}"</span>
            </span>
          )}
        </div>

        {/* Format grid ----------------------------------------------------- */}
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        >
          <AnimatePresence mode="popLayout">
            {filtered.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
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
                  // ✅ FIX 2: clicking Buy only stores the item and opens the modal.
                  //    The buy API is NOT called here.
                  onBuy={(i) => {
                    setPurchaseError(null); // clear any previous purchase error
                    setPurchaseSuccess(false);
                    setPurchaseData(null);
                    setBuyItem(i);
                  }}
                />
              ))
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Buy modal ------------------------------------------------------- */}
      <AnimatePresence>
        {buyItem && (
          <BuyComingSoonModal
            item={buyItem}
            // ✅ FIX 8: close modal when user cancels
            onClose={handleModalClose}
            // ✅ FIX 2: onConfirm triggers the actual API call with item._id
            onConfirm={handleConfirmPurchase}
            // Pass loading and error state so the modal can display them
            isLoading={purchaseLoading}
            error={purchaseError}
            // ✅ NEW: Pass success state and data
            success={purchaseSuccess}
            purchaseData={purchaseData}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default WorkingFormat;