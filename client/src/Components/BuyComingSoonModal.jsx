import { motion } from 'framer-motion';
import { ShoppingBag, Sparkles, X, Wrench, BookOpen } from 'lucide-react';

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

const BuyComingSoonModal = ({ item, onClose }) => {
  if (!item) return null;
  const isTool = item.type === 'tool';

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
        className="relative w-full max-w-sm rounded-2xl bg-gradient-to-br from-gray-900/95 to-gray-950/95 backdrop-blur-xl border border-white/10 shadow-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center mb-5">
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 border ${
              isTool
                ? 'bg-violet-500/10 border-violet-500/20'
                : 'bg-emerald-500/10 border-emerald-500/20'
            }`}
          >
            <ShoppingBag
              className={`w-7 h-7 ${isTool ? 'text-violet-400' : 'text-emerald-400'}`}
            />
          </div>
          <h3 className="text-lg font-bold text-white font-['Space_Grotesk']">
            {item.productName}
          </h3>
          <div
            className={`inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full text-xs border ${
              isTool
                ? 'bg-violet-500/10 border-violet-500/20 text-violet-300'
                : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            Purchase Coming Soon
          </div>
        </div>

        <div className="space-y-2 mb-5">
          <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
            <span className="text-sm text-gray-400">Type</span>
            <span className="text-sm text-white font-medium capitalize">{item.type}</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
            <span className="text-sm text-gray-400">Price</span>
            <span
              className={`text-base font-bold ${isTool ? 'text-violet-400' : 'text-emerald-400'}`}
            >
              {formatCurrency(item.sellingPrice)}
            </span>
          </div>
        </div>

        <p className="text-center text-xs text-gray-500 mb-4">
          The purchase endpoint is being set up. Check back soon!
        </p>

        <button
          onClick={onClose}
          className="w-full px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-sm transition-all"
        >
          Close
        </button>
      </motion.div>
    </motion.div>
  );
};

export default BuyComingSoonModal;
