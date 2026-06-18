import React from "react";
import { motion } from "framer-motion";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  Eye,
  EyeOff,
  Copy,
  CheckCircle,
  Clock,
  Shield,
  Zap,
  History,
} from "lucide-react";
import { Link } from "react-router-dom";
import useWallet from "../hooks/useWallet";

const WalletBalanceCard = () => {
  const { wallet, balance, isLoading, refetch } = useWallet();
  const [showBalance, setShowBalance] = React.useState(true);
  const [copied, setCopied] = React.useState(false);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Split balance into whole and decimal parts
  const formatBalanceParts = (amount) => {
    const formatted = formatCurrency(amount).replace("NGN", "").trim();
    const parts = formatted.split(".");
    return {
      whole: parts[0],
      decimal: parts[1] || "00",
    };
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(wallet?.address || "N/A");
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleRefresh = () => {
    refetch();
  };

  const balanceParts =
    !isLoading && showBalance ? formatBalanceParts(balance) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900/50 to-gray-950/50 backdrop-blur-sm border border-white/10 p-6 shadow-2xl min-h-[280px]"
    >
      {/* Large Dim Wallet Icon in Background */}
      <div className="absolute -right-10 -bottom-10 opacity-[0.04] pointer-events-none">
        <Wallet size={280} className="text-white" strokeWidth={0.5} />
      </div>
      <div className="absolute -left-20 -top-20 opacity-[0.02] pointer-events-none">
        <Wallet size={320} className="text-white" strokeWidth={0.3} />
      </div>

      {/* Animated Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-blue-500/5 pointer-events-none" />

      {/* Glowing Orbs */}
      <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-green-500/10 blur-3xl pointer-events-none animate-pulse" />
      <div
        className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-blue-500/5 blur-3xl pointer-events-none animate-pulse"
        style={{ animationDelay: "1s" }}
      />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-green-600 to-green-500 shadow-lg shadow-green-500/30">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-400">
                Total Balance
              </h3>
              <p className="text-xs text-gray-500">All wallets combined</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowBalance(!showBalance)}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-200 text-gray-400 hover:text-white"
              aria-label="Toggle balance visibility"
            >
              {showBalance ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
            <button
              onClick={handleRefresh}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-200 text-gray-400 hover:text-white"
              aria-label="Refresh balance"
            >
              <RefreshCw
                size={16}
                className={isLoading ? "animate-spin" : ""}
              />
            </button>
          </div>
        </div>

        {/* Balance Display */}
        <div className="mb-6">
          <div className="flex items-end gap-2">
            <span className="text-2xl font-light text-gray-400">₦</span>
            {isLoading ? (
              <div className="h-12 w-48 bg-gradient-to-r from-gray-800/50 to-gray-700/50 rounded-lg animate-pulse" />
            ) : showBalance && balanceParts ? (
              <div
                className="flex items-end"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                <span className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                  {balanceParts.whole}
                </span>
                <span className="text-2xl md:text-3xl font-bold text-green-400 tracking-tight ml-1">
                  .{balanceParts.decimal}
                </span>
              </div>
            ) : (
              <span
                className="text-4xl md:text-5xl font-bold text-white tracking-tight"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                ••••••
              </span>
            )}
          </div>
        </div>

        {/* Currency Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 mb-4">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
          <span className="text-xs text-green-400 font-medium">
            Naira (NGN)
          </span>
          <Zap className="w-3 h-3 text-green-500" />
        </div>

        {/* Wallet Address */}
        {wallet?.address && (
          <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 mb-4">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-xs text-gray-400 truncate font-mono">
                {wallet.address}
              </span>
            </div>
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-all duration-200 text-gray-400 hover:text-white flex-shrink-0"
            >
              {copied ? (
                <CheckCircle size={14} className="text-green-500" />
              ) : (
                <Copy size={14} />
              )}
            </button>
          </div>
        )}

        {/* Quick Actions */}
        {/* Quick Actions - Compact Version */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <Link to="/f/make-deposit" className="w-full">
            <button className="w-full flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-semibold transition-all duration-300 shadow-lg shadow-green-500/25 group text-sm">
              <ArrowUpRight
                size={14}
                className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0"
              />
              <span>Deposit</span>
            </button>
          </Link>

          <Link to="/f/deposits-history" className="w-full">
            <button className="w-full flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold transition-all duration-300 group text-sm">
              <History
                size={14}
                className="group-hover:rotate-12 transition-transform shrink-0"
              />
              <span>Transaction History</span>
            </button>
          </Link>
        </div>
        {/* Small decorative element */}
        <div className="absolute top-6 right-16 opacity-5 pointer-events-none">
          <div className="w-16 h-16 rounded-full border-2 border-green-500/30" />
          <div className="w-12 h-12 rounded-full border-2 border-green-500/20 -mt-10 ml-2" />
          <div className="w-8 h-8 rounded-full border-2 border-green-500/10 -mt-6 ml-4" />
        </div>
      </div>
    </motion.div>
  );
};

export default WalletBalanceCard;
