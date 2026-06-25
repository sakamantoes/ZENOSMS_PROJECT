import React, { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle, ArrowUpRight, CheckCircle, Hash, Headphones, Heart,
  Link as LinkIcon, Loader2, MessageSquare, Music, Play, RefreshCw,
  RotateCcw, Send, Share2, ShoppingBag, TrendingUp, Users, Wallet, X,
} from "lucide-react";
import {
  getSocialCategories, getSocialPlatforms,
  getSocialServicesByCategory, placeSocialOrder,
} from "../../Service/social.js";
import { getWalletBalance } from "../../Service/wallet.js";
import DepositModal from "../../Components/DepositModal.jsx";
import { formatNaira } from "../../utils/formatMoney.js";
import { getErrorMessage } from "../../utils/getErrorMessage.js";

// ── Platform config ──────────────────────────────────────────────────────────
const PLATFORM_CONFIG = {
  instagram: { Icon: Heart,      gradient: "from-pink-500/20 to-purple-500/20",  border: "border-pink-500/30",   selectedBorder: "border-pink-400/60",   text: "text-pink-400",   bg: "bg-pink-500/10",   hover: "hover:border-pink-500/40" },
  tiktok:    { Icon: Music,      gradient: "from-purple-500/20 to-gray-900/40",  border: "border-purple-500/30", selectedBorder: "border-purple-400/60", text: "text-purple-400", bg: "bg-purple-500/10", hover: "hover:border-purple-500/40" },
  youtube:   { Icon: Play,       gradient: "from-red-500/20 to-red-900/20",      border: "border-red-500/30",    selectedBorder: "border-red-400/60",    text: "text-red-400",    bg: "bg-red-500/10",    hover: "hover:border-red-500/40" },
  facebook:  { Icon: Users,      gradient: "from-blue-500/20 to-blue-900/20",    border: "border-blue-500/30",   selectedBorder: "border-blue-400/60",   text: "text-blue-400",   bg: "bg-blue-500/10",   hover: "hover:border-blue-500/40" },
  twitter:   { Icon: MessageSquare, gradient: "from-sky-500/20 to-sky-900/20",   border: "border-sky-500/30",    selectedBorder: "border-sky-400/60",    text: "text-sky-400",    bg: "bg-sky-500/10",    hover: "hover:border-sky-500/40" },
  telegram:  { Icon: Send,       gradient: "from-cyan-500/20 to-cyan-900/20",    border: "border-cyan-500/30",   selectedBorder: "border-cyan-400/60",   text: "text-cyan-400",   bg: "bg-cyan-500/10",   hover: "hover:border-cyan-500/40" },
  spotify:   { Icon: Headphones, gradient: "from-green-500/20 to-green-900/20",  border: "border-green-500/30",  selectedBorder: "border-green-400/60",  text: "text-green-400",  bg: "bg-green-500/10",  hover: "hover:border-green-500/40" },
};

const FALLBACK_CONFIG = {
  Icon: Share2,
  gradient: "from-gray-500/20 to-gray-900/20", border: "border-gray-500/30",
  selectedBorder: "border-gray-400/60", text: "text-gray-400",
  bg: "bg-gray-500/10", hover: "hover:border-gray-500/40",
};

const cfg = (platform) => PLATFORM_CONFIG[platform?.toLowerCase()] ?? FALLBACK_CONFIG;

// ── Helpers ──────────────────────────────────────────────────────────────────
// FIX: the API returns balance as a string "6000000.00" — parseFloat handles
// that, then we also keep all the previous numeric-object shapes as fallbacks.
const parseBalance = (res) => {
  const d = res?.data?.data ?? res?.data ?? res;

  // String numeric value — the actual shape returned by this API
  if (typeof d === "string") {
    const n = parseFloat(d);
    return Number.isFinite(n) ? n : 0;
  }

  // Plain number
  if (typeof d === "number") return d;

  // Object shapes
  if (d && typeof d === "object") {
    if (typeof d.balance === "number") return d.balance;
    if (typeof d.balance === "string") {
      const n = parseFloat(d.balance);
      if (Number.isFinite(n)) return n;
    }
    if (typeof d.walletBalance === "number") return d.walletBalance;
    if (typeof d.walletBalance === "string") {
      const n = parseFloat(d.walletBalance);
      if (Number.isFinite(n)) return n;
    }
  }

  return 0;
};

// ── Order Modal ──────────────────────────────────────────────────────────────
const OrderModal = ({
  service, platform, category, balance, ordering, orderError,
  onClose, onConfirm, onDepositClick,
}) => {
  const [link, setLink]         = useState("");
  const [quantity, setQuantity] = useState(String(service.min));
  const [linkError, setLinkError] = useState("");

  const qty       = Number(quantity);
  const totalCost = Number.isFinite(qty) && qty > 0 ? (qty / 1000) * service.sellingPrice : 0;
  const canAfford = balance >= totalCost && totalCost > 0;
  const qtyValid  = Number.isFinite(qty) && qty >= service.min && qty <= service.max;

  const handleConfirm = () => {
    if (!link.trim()) { setLinkError("Please enter the target URL."); return; }
    setLinkError("");
    onConfirm({ link: link.trim(), quantity: qty });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}>
      <motion.div initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 20 }}
        className="relative w-full max-w-md rounded-2xl bg-gradient-to-br from-gray-900/95 to-gray-950/95 backdrop-blur-xl border border-white/10 shadow-2xl p-6 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
          <X className="w-4 h-4" />
        </button>

        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 flex items-center justify-center mx-auto mb-3 border border-emerald-500/30">
            <TrendingUp className="w-7 h-7 text-emerald-400" />
          </div>
          <h3 className="text-lg font-bold text-white font-['Space_Grotesk']">Place Boost Order</h3>
          <p className="text-sm text-gray-400 mt-1 capitalize">{platform} · {category}</p>
        </div>

        <div className="p-3 rounded-xl bg-white/5 border border-white/5 mb-4">
          <p className="text-xs text-gray-500">Service</p>
          <p className="text-sm font-semibold text-white mt-0.5">{service.name}</p>
        </div>

        <div className="mb-4">
          <label className="block text-xs text-gray-400 mb-1.5">Target URL <span className="text-red-400">*</span></label>
          <div className="relative">
            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input type="url" value={link}
              onChange={(e) => { setLink(e.target.value); setLinkError(""); }}
              placeholder={`https://www.${platform}.com/…`}
              className={`w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/5 border text-white text-sm placeholder-gray-500 outline-none transition-colors focus:border-emerald-500/50 ${linkError ? "border-red-500/40" : "border-white/10"}`}
            />
          </div>
          {linkError && <p className="mt-1 text-xs text-red-400">{linkError}</p>}
        </div>

        <div className="mb-4">
          <label className="block text-xs text-gray-400 mb-1.5">
            Quantity <span className="text-gray-600">(min {service.min.toLocaleString()} · max {service.max.toLocaleString()})</span>
          </label>
          <div className="relative">
            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input type="number" min={service.min} max={service.max} step="1" value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className={`w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/5 border text-white text-sm outline-none transition-colors focus:border-emerald-500/50 ${quantity && !qtyValid ? "border-red-500/40" : "border-white/10"}`}
            />
          </div>
          {quantity && !qtyValid && (
            <p className="mt-1 text-xs text-red-400">Must be between {service.min.toLocaleString()} and {service.max.toLocaleString()}.</p>
          )}
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5">
            <span className="text-sm text-gray-400">Rate</span>
            <span className="text-sm font-medium text-white">{formatNaira(service.sellingPrice)} / 1,000</span>
          </div>
          <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5">
            <span className="text-sm text-gray-400">Total Cost</span>
            <span className="text-base font-bold text-emerald-400">{formatNaira(totalCost)}</span>
          </div>
          <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5">
            <span className="text-sm text-gray-400">Your Balance</span>
            <span className={`text-sm font-semibold ${canAfford ? "text-emerald-400" : "text-red-400"}`}>
              {formatNaira(balance)}
            </span>
          </div>
        </div>

        {!canAfford && totalCost > 0 && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 mb-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-400">Insufficient Balance</p>
                <p className="text-xs text-gray-400 mt-0.5">You need {formatNaira(totalCost - balance)} more to place this order.</p>
                <button onClick={onDepositClick}
                  className="mt-2.5 w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-semibold text-sm transition-all shadow-lg shadow-green-500/25">
                  <ArrowUpRight className="w-4 h-4" />Deposit Now
                </button>
              </div>
            </div>
          </div>
        )}

        {orderError && (
          <div className="flex items-start gap-2.5 rounded-xl border border-red-500/20 bg-red-500/10 p-3 mb-4">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-400" />
            <p className="text-sm text-red-300">{orderError}</p>
          </div>
        )}

        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-sm transition-all">
            Cancel
          </button>
          <button onClick={handleConfirm} disabled={ordering || !canAfford || !qtyValid || !link.trim()}
            className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-semibold text-sm transition-all shadow-lg shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {ordering ? (<><Loader2 className="w-4 h-4 animate-spin" />Processing…</>) : (<><TrendingUp className="w-4 h-4" />Confirm Order</>)}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ── Service card ─────────────────────────────────────────────────────────────
const ServiceCard = ({ service, onOrder }) => (
  <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
    className="rounded-xl bg-gradient-to-br from-gray-900/80 to-gray-950/80 backdrop-blur-xl border border-white/10 p-4 flex flex-col transition-all hover:-translate-y-0.5 hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/5">
    <p className="text-sm font-semibold text-white leading-snug line-clamp-2 mb-3">{service.name}</p>
    <div className="mb-3">
      <p className="text-xl font-bold text-emerald-400">{formatNaira(service.sellingPrice)}</p>
      <p className="text-[10px] text-gray-500 mt-0.5">per 1,000 units</p>
    </div>
    <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-400 mb-3">
      <span>Min: <span className="text-gray-300">{service.min.toLocaleString()}</span></span>
      <span>Max: <span className="text-gray-300">{service.max.toLocaleString()}</span></span>
    </div>
    {(service.refill || service.cancel) && (
      <div className="flex flex-wrap gap-1.5 mb-3">
        {service.refill && (
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
            <RotateCcw className="w-2.5 h-2.5" />Refill
          </span>
        )}
        {service.cancel && (
          <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-medium text-gray-400">Cancel</span>
        )}
      </div>
    )}
    <button onClick={() => onOrder(service)}
      className="mt-auto w-full py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-semibold text-sm transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2">
      <ShoppingBag className="w-4 h-4" />Order Now
    </button>
  </motion.div>
);

// ── Main page ─────────────────────────────────────────────────────────────────
const Boosting = () => {
  const [platforms, setPlatforms]               = useState([]);
  const [selectedPlatform, setSelectedPlatform] = useState("");
  const [platformsLoading, setPlatformsLoading] = useState(true);
  const [platformsError, setPlatformsError]     = useState("");

  const [categories, setCategories]               = useState([]);
  const [selectedCategory, setSelectedCategory]   = useState("");
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categoriesError, setCategoriesError]     = useState("");

  const [services, setServices]           = useState([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [servicesError, setServicesError]   = useState("");

  const [userBalance, setUserBalance]           = useState(0);
  const [showDepositModal, setShowDepositModal] = useState(false);

  const [orderService, setOrderService] = useState(null);
  const [ordering, setOrdering]         = useState(false);
  const [orderError, setOrderError]     = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // FIX applied here — parseBalance now handles the string "6000000.00" shape
  const loadBalance = useCallback(async () => {
    try {
      const res = await getWalletBalance();
      setUserBalance(parseBalance(res));
    } catch {}
  }, []);

  const loadPlatforms = useCallback(async () => {
    setPlatformsLoading(true);
    setPlatformsError("");
    try {
      const res = await getSocialPlatforms();
      setPlatforms(res.data ?? []);
    } catch (err) {
      setPlatformsError(getErrorMessage(err, "Unable to load platforms."));
    } finally {
      setPlatformsLoading(false);
    }
  }, []);

  useEffect(() => { loadPlatforms(); loadBalance(); }, [loadPlatforms, loadBalance]);

  const handleSelectPlatform = async (platform) => {
    if (platform === selectedPlatform) return;
    setSelectedPlatform(platform);
    setSelectedCategory(""); setServices([]); setServicesError("");
    setCategories([]); setCategoriesError(""); setCategoriesLoading(true);
    try {
      const res = await getSocialCategories(platform);
      setCategories(res.data ?? []);
    } catch (err) {
      setCategoriesError(getErrorMessage(err, "Unable to load categories."));
    } finally {
      setCategoriesLoading(false);
    }
  };

  const handleSelectCategory = async (category) => {
    if (category === selectedCategory) return;
    setSelectedCategory(category); setServices([]); setServicesError(""); setServicesLoading(true);
    try {
      const res = await getSocialServicesByCategory(selectedPlatform, category);
      setServices(res.data ?? []);
    } catch (err) {
      setServicesError(getErrorMessage(err, "Unable to load services."));
    } finally {
      setServicesLoading(false);
    }
  };

  const handleConfirmOrder = async ({ link, quantity }) => {
    if (!orderService) return;
    setOrdering(true); setOrderError("");
    try {
      await placeSocialOrder({ id: orderService._id, link, quantity });
      setOrderService(null);
      setSuccessMessage("Order placed successfully! Your boost is being processed.");
      setTimeout(() => setSuccessMessage(""), 5000);
      await loadBalance();
    } catch (err) {
      setOrderError(getErrorMessage(err, "Failed to place order. Please try again."));
    } finally {
      setOrdering(false);
    }
  };

  const handleDepositFromModal = () => {
    setOrderService(null); setOrderError(""); setShowDepositModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black/95 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white font-['Space_Grotesk'] flex items-center gap-3">
              <Share2 className="w-8 h-8 text-emerald-500" />Social Media Boosting
            </h1>
            <p className="text-sm text-gray-400 mt-1">Grow your social presence with real engagement</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <Wallet className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-medium text-white">{formatNaira(userBalance)}</span>
            </div>
            <button onClick={() => { loadPlatforms(); loadBalance(); }} disabled={platformsLoading}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white transition-all disabled:opacity-50">
              <RefreshCw className={`w-5 h-5 ${platformsLoading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </motion.div>

        <AnimatePresence>
          {successMessage && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 shrink-0" />{successMessage}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step 1: Platforms */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-4">Step 1 — Choose Platform</p>

          {platformsLoading && (
            <div className="flex items-center justify-center gap-2.5 rounded-xl border border-white/10 bg-black/20 p-10 text-sm text-gray-300">
              <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />Loading platforms…
            </div>
          )}
          {!platformsLoading && platformsError && (
            <div className="flex items-start gap-2.5 rounded-xl border border-red-500/20 bg-red-500/10 p-4">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-400" />
              <p className="text-sm text-red-300">{platformsError}</p>
            </div>
          )}
          {!platformsLoading && !platformsError && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {platforms.map((platform) => {
                const c = cfg(platform);
                const isSelected = selectedPlatform === platform;
                return (
                  <motion.button key={platform} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    onClick={() => handleSelectPlatform(platform)}
                    className={`rounded-xl border p-4 flex flex-col items-center gap-2.5 transition-all ${
                      isSelected
                        ? `bg-gradient-to-br ${c.gradient} ${c.selectedBorder} shadow-lg`
                        : `bg-gradient-to-br from-gray-900/80 to-gray-950/80 ${c.border} ${c.hover} hover:shadow-md`
                    }`}>
                    <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center border ${c.border}`}>
                      <c.Icon className={`w-5 h-5 ${c.text}`} />
                    </div>
                    <span className={`text-sm font-semibold capitalize ${isSelected ? c.text : "text-gray-300"}`}>
                      {platform}
                    </span>
                    {isSelected && (
                      <span className={`text-[10px] font-medium rounded-full px-2 py-0.5 border ${c.bg} ${c.border} ${c.text}`}>
                        Selected
                      </span>
                    )}
                  </motion.button>
                );
              })}
            </div>
          )}
        </motion.section>

        {/* Step 2: Categories */}
        <AnimatePresence>
          {selectedPlatform && (
            <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="mb-8">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-4 capitalize flex items-center">
                Step 2 — Click to select <span className={`ml-1 mr-1 ${cfg(selectedPlatform).text}`}>{selectedPlatform}</span> Categories
              </p>
              {categoriesLoading && (
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />Loading categories…
                </div>
              )}
              {!categoriesLoading && categoriesError && (
                <div className="flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-3">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-400" />
                  <p className="text-sm text-red-300">{categoriesError}</p>
                </div>
              )}
              {!categoriesLoading && !categoriesError && (
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => {
                    const isSelected = selectedCategory === cat;
                    return (
                      <button key={cat} onClick={() => handleSelectCategory(cat)}
                        className={`px-4 py-2 rounded-xl border text-sm font-semibold capitalize transition-all ${
                          isSelected
                            ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400"
                            : "border-white/10 bg-white/5 text-gray-300 hover:border-emerald-500/30 hover:text-white"
                        }`}>
                        {cat}
                      </button>
                    );
                  })}
                </div>
              )}
            </motion.section>
          )}
        </AnimatePresence>

        {/* Step 3: Services */}
        <AnimatePresence>
          {selectedCategory && (
            <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 capitalize">
                  Step 3 — {selectedPlatform} {selectedCategory}
                </p>
                {!servicesLoading && services.length > 0 && (
                  <span className="text-xs text-gray-500">
                    <span className="font-semibold text-white">{services.length}</span> service{services.length !== 1 ? "s" : ""}
                  </span>
                )}
              </div>
              {servicesLoading && (
                <div className="flex items-center justify-center gap-2.5 rounded-xl border border-white/10 bg-black/20 p-10 text-sm text-gray-300">
                  <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />Loading services…
                </div>
              )}
              {!servicesLoading && servicesError && (
                <div className="flex items-start gap-2.5 rounded-xl border border-red-500/20 bg-red-500/10 p-4">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-400" />
                  <p className="text-sm text-red-300">{servicesError}</p>
                </div>
              )}
              {!servicesLoading && !servicesError && services.length === 0 && (
                <div className="flex flex-col items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-10 text-center">
                  <Share2 className="w-10 h-10 text-gray-600" />
                  <div>
                    <p className="text-sm font-semibold text-white">No services available</p>
                    <p className="mt-1 text-xs text-gray-400">No services found for this category right now.</p>
                  </div>
                </div>
              )}
              {!servicesLoading && !servicesError && services.length > 0 && (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {services.map((service) => (
                    <ServiceCard key={service._id} service={service} onOrder={setOrderService} />
                  ))}
                </div>
              )}
            </motion.section>
          )}
        </AnimatePresence>

        {/* Order modal */}
        <AnimatePresence>
          {orderService && (
            <OrderModal
              service={orderService} platform={selectedPlatform} category={selectedCategory}
              balance={userBalance} ordering={ordering} orderError={orderError}
              onClose={() => { setOrderService(null); setOrderError(""); }}
              onConfirm={handleConfirmOrder} onDepositClick={handleDepositFromModal}
            />
          )}
        </AnimatePresence>

        {/* Deposit modal */}
        <DepositModal isOpen={showDepositModal} onClose={() => setShowDepositModal(false)}
          onSuccess={async () => { await loadBalance(); }} amount={0} paymentMethod="SQUAD" />
      </div>
    </div>
  );
};

export default Boosting;
