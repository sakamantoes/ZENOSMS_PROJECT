import React from 'react';
import { motion } from 'framer-motion';
import { 
  ShoppingBag, 
  Sparkles, 
  X, 
  Wrench, 
  BookOpen,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';

/**
 * Format currency for display
 * @param {number} amount - The amount to format
 * @returns {string} Formatted currency string
 */
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
 * BuyComingSoonModal Component
 * Handles tool/format purchase with loading states, errors, and success states
 */
const BuyComingSoonModal = ({ 
  item, 
  onClose, 
  onConfirm, 
  isLoading = false,
  error = null,
  success = false
}) => {
  // If no item is provided, render nothing
  if (!item) return null;

  // Determine if this is a tool or format
  const isTool = item.type === 'tool' || item.type === 'Tool';
  const isFormat = item.type === 'format' || item.type === 'Format';

  // Get icon based on type
  const getIcon = () => {
    if (isTool) return Wrench;
    if (isFormat) return BookOpen;
    return ShoppingBag;
  };

  const Icon = getIcon();

  // Get color scheme based on type
  const getColorScheme = () => {
    if (isTool) {
      return {
        bg: 'bg-violet-500/10',
        border: 'border-violet-500/20',
        text: 'text-violet-400',
        hover: 'hover:bg-violet-500/20',
        button: 'from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500',
        shadow: 'shadow-violet-500/20',
        badge: 'bg-violet-500/10 border-violet-500/20 text-violet-300',
        price: 'text-violet-400',
        loading: 'border-violet-500/30 border-t-violet-500',
      };
    }
    if (isFormat) {
      return {
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/20',
        text: 'text-emerald-400',
        hover: 'hover:bg-emerald-500/20',
        button: 'from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500',
        shadow: 'shadow-emerald-500/20',
        badge: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300',
        price: 'text-emerald-400',
        loading: 'border-emerald-500/30 border-t-emerald-500',
      };
    }
    return {
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
      text: 'text-blue-400',
      hover: 'hover:bg-blue-500/20',
      button: 'from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500',
      shadow: 'shadow-blue-500/20',
      badge: 'bg-blue-500/10 border-blue-500/20 text-blue-300',
      price: 'text-blue-400',
      loading: 'border-blue-500/30 border-t-blue-500',
    };
  };

  const colors = getColorScheme();

  /**
   * Handle confirm purchase
   */
  const handleConfirm = () => {
    if (onConfirm && !isLoading) {
      onConfirm(item);
    }
  };

  /**
   * Handle backdrop click
   */
  const handleBackdropClick = () => {
    if (!isLoading) {
      onClose();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="relative w-full max-w-sm rounded-2xl bg-gradient-to-br from-gray-900/95 to-gray-950/95 backdrop-blur-xl border border-white/10 shadow-2xl p-6 overflow-y-auto max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header with Icon */}
        <div className="text-center mb-5">
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 border ${colors.bg} ${colors.border}`}
          >
            <Icon className={`w-7 h-7 ${colors.text}`} />
          </div>
          
          <h3 className="text-lg font-bold text-white font-['Space_Grotesk'] line-clamp-2">
            {item.productName || 'Unnamed Product'}
          </h3>
          
          <div className={`inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full text-xs border ${colors.badge}`}>
            {isLoading ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin" />
                Processing Purchase...
              </>
            ) : success ? (
              <>
                <CheckCircle className="w-3 h-3" />
                Purchase Successful!
              </>
            ) : (
              <>
                <Sparkles className="w-3 h-3" />
                Confirm Purchase
              </>
            )}
          </div>
        </div>

        {/* Product Details */}
        <div className="space-y-2 mb-5">
          {item.productDescription && (
            <div className="p-3 rounded-xl bg-white/5 border border-white/5">
              <p className="text-sm text-gray-300 line-clamp-3">
                {item.productDescription}
              </p>
            </div>
          )}
          
          <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
            <span className="text-sm text-gray-400">Type</span>
            <span className="text-sm text-white font-medium capitalize">
              {item.type || 'Tool'}
            </span>
          </div>
          
          <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
            <span className="text-sm text-gray-400">Price</span>
            <span className={`text-base font-bold ${colors.price}`}>
              {formatCurrency(item.sellingPrice)}
            </span>
          </div>

          {item._id && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
              <span className="text-sm text-gray-400">ID</span>
              <span className="text-xs text-gray-500 font-mono truncate max-w-[150px]">
                {item._id}
              </span>
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-2 p-3 mb-4 rounded-xl bg-red-500/10 border border-red-500/20"
          >
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-400">{error}</p>
          </motion.div>
        )}

        {/* Success Message */}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 p-3 mb-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20"
          >
            <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <p className="text-sm text-emerald-400">
              Your purchase was successful!
            </p>
          </motion.div>
        )}

        {/* Info Text */}
        {!success && !error && (
          <p className="text-center text-xs text-gray-500 mb-4">
            By confirming, you agree to purchase this {item.type || 'tool'}.
            This action is final and cannot be undone.
          </p>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {success ? 'Close' : 'Cancel'}
          </button>
          
          {!success && (
            <button
              onClick={handleConfirm}
              disabled={isLoading}
              className={`flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r ${colors.button} text-white font-medium text-sm transition-all shadow-lg ${colors.shadow} disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Confirm Purchase'
              )}
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default BuyComingSoonModal;