import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Copy, Check, Package2 } from 'lucide-react';
import { formatCurrency, formatDate } from './formatHelpers';

const STATUS_STYLES = {
  COMPLETED: { label: 'Completed', cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  PENDING:   { label: 'Pending',   cls: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
  FAILED:    { label: 'Failed',    cls: 'bg-red-500/10 text-red-400 border-red-500/20' },
  REFUNDED:  { label: 'Refunded',  cls: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
};

const getStatusStyle = (s) =>
  STATUS_STYLES[s] || { label: s || 'Unknown', cls: 'bg-gray-500/10 text-gray-400 border-gray-500/20' };

const WorkingOrderDetailModal = ({ order, onClose }) => {
  const [copied, setCopied] = useState(null);
  if (!order) return null;

  const status = getStatusStyle(order.status);

  const copy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
        className="relative w-full max-w-md rounded-2xl bg-gradient-to-br from-gray-900/95 to-gray-950/95 border border-white/10 shadow-2xl p-6 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-white font-['Space_Grotesk']">Order Details</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 mb-4">
          {order.imageUrl ? (
            <img
              src={order.imageUrl}
              alt={order.productName}
              className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
              <Package2 className="w-6 h-6 text-gray-600" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-sm truncate">{order.productName}</p>
            <p className="text-2xl font-bold text-white font-['Space_Grotesk']">
              {formatCurrency(order.sellingPrice)}
            </p>
          </div>
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium border flex-shrink-0 ${status.cls}`}>
            {status.label}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div className="col-span-2 p-3 rounded-xl bg-white/5 border border-white/10">
            <p className="text-[11px] text-gray-500 mb-1">Order Reference</p>
            <div className="flex items-center gap-2">
              <span className="text-white text-sm font-mono flex-1 truncate">{order.orderRef}</span>
              <button
                onClick={() => copy(order.orderRef, 'ref')}
                className="p-1 rounded hover:bg-white/10 transition-colors flex-shrink-0"
              >
                {copied === 'ref'
                  ? <Check className="w-3.5 h-3.5 text-emerald-400" />
                  : <Copy className="w-3.5 h-3.5 text-gray-500" />}
              </button>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <p className="text-[11px] text-gray-500 mb-0.5">Balance Before</p>
            <p className="text-white text-sm font-semibold">{formatCurrency(order.balanceBefore)}</p>
          </div>
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <p className="text-[11px] text-gray-500 mb-0.5">Balance After</p>
            <p className="text-white text-sm font-semibold">{formatCurrency(order.balanceAfter)}</p>
          </div>

          {(order.stockPics != null || order.stockImg != null) && (
            <>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <p className="text-[11px] text-gray-500 mb-0.5">Stock Pics</p>
                <p className="text-white text-sm font-semibold">{order.stockPics ?? '—'}</p>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <p className="text-[11px] text-gray-500 mb-0.5">Stock Imgs</p>
                <p className="text-white text-sm font-semibold">{order.stockImg ?? '—'}</p>
              </div>
            </>
          )}

          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <p className="text-[11px] text-gray-500 mb-0.5">Placed</p>
            <p className="text-white text-xs font-medium">{formatDate(order.createdAt)}</p>
          </div>
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <p className="text-[11px] text-gray-500 mb-0.5">Completed</p>
            <p className="text-white text-xs font-medium">{formatDate(order.completedAt)}</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default WorkingOrderDetailModal;
