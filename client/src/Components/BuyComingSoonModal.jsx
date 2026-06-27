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
  Loader2,
  Send,
  Download,
  Check,
  ArrowRight
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
  success = false,
  purchaseData = null
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
        successBg: 'bg-violet-500/20',
        telegram: 'from-violet-600 to-indigo-600',
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
        successBg: 'bg-emerald-500/20',
        telegram: 'from-emerald-600 to-teal-600',
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
      successBg: 'bg-blue-500/20',
      telegram: 'from-blue-600 to-cyan-600',
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

  /**
   * Handle close after success
   */
  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  /**
   * Handle Telegram redirect
   */
  const handleTelegramRedirect = () => {
    // Replace with your actual Telegram group/channel link
    const telegramLink = 'https://t.me/yourtelegramgroup';
    window.open(telegramLink, '_blank');
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
          onClick={handleClose}
          disabled={isLoading}
          className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header with Icon */}
        <div className="text-center mb-5">
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 border ${
              success ? `${colors.successBg} border-green-500/30` : `${colors.bg} ${colors.border}`
            }`}
          >
            {success ? (
              <CheckCircle className="w-8 h-8 text-green-400" />
            ) : (
              <Icon className={`w-7 h-7 ${colors.text}`} />
            )}
          </div>
          
          <h3 className="text-lg font-bold text-white font-['Space_Grotesk'] line-clamp-2">
            {success ? 'Purchase Successful!' : (item.productName || 'Unnamed Product')}
          </h3>
          
          <div className={`inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full text-xs border ${
            success ? 'bg-green-500/10 border-green-500/30 text-green-300' : colors.badge
          }`}>
            {isLoading ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin" />
                Processing Purchase...
              </>
            ) : success ? (
              <>
                <Check className="w-3 h-3" />
                Purchase Completed
              </>
            ) : (
              <>
                <Sparkles className="w-3 h-3" />
                Confirm Purchase
              </>
            )}
          </div>
        </div>

        {/* Success State - Telegram Notification */}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4 mb-5"
          >
            {/* Success Message */}
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-emerald-300 font-medium">
                    Your purchase was successful!
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    You can now access your purchased {item.type || 'tool'}.
                  </p>
                </div>
              </div>
            </div>

            {/* Telegram Notification */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-violet-500/10 border border-blue-500/20">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <Send className="w-4 h-4 text-blue-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-white font-medium">
                    Get Your Files on Telegram
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Your purchased images and files have been sent to our Telegram group.
                    Join now to download them.
                  </p>
                </div>
              </div>
            </div>

            {/* Order Details */}
            {purchaseData && (
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="space-y-2">
                  {purchaseData.orderId && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">Order ID</span>
                      <span className="text-gray-300 font-mono">{purchaseData.orderId}</span>
                    </div>
                  )}
                  {purchaseData.receiptNo && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">Receipt No</span>
                      <span className="text-gray-300 font-mono">{purchaseData.receiptNo}</span>
                    </div>
                  )}
                  {purchaseData.amount && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">Amount Paid</span>
                      <span className="text-green-400 font-medium">{formatCurrency(purchaseData.amount)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons for Success */}
            <div className="flex flex-col gap-2">
              <button
                onClick={handleTelegramRedirect}
                className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-medium text-sm transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                Go to Telegram to Download
                <ArrowRight className="w-4 h-4" />
              </button>
              
              <button
                onClick={handleClose}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white transition-colors font-medium text-sm"
              >
                Close
              </button>
            </div>
          </motion.div>
        )}

        {/* Product Details (shown only when not in success state) */}
        {!success && (
          <>
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

            {/* Info Text */}
            {!error && (
              <p className="text-center text-xs text-gray-500 mb-4">
                By confirming, you agree to purchase this {item.type || 'tool'}.
                This action is final and cannot be undone.
              </p>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleClose}
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              
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
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
};

export default BuyComingSoonModal;