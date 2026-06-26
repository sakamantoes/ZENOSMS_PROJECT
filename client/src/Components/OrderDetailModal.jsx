import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Copy, Check, ExternalLink } from 'lucide-react';
import { formatCurrency, formatDate, fmtNum } from './formatHelpers';
import { getPlatform, getStatus } from './socialOrderHelpers';

const OrderDetailModal = ({ order, onClose }) => {
  const [copied, setCopied] = useState(null);
  if (!order) return null;

  const status   = getStatus(order.status);
  const platform = getPlatform(order.serviceName);
  const StatusIcon   = status.icon;
  const PlatformIcon = platform.icon;

  const delivered = order.quantity - (order.remains ?? order.quantity);
  const progress  = order.quantity > 0 ? Math.min((delivered / order.quantity) * 100, 100) : 0;

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
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-white font-['Space_Grotesk']">Order Details</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Service + amount */}
        <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 mb-4">
          <div className={`p-2.5 rounded-xl ${platform.bg} border ${platform.border} flex-shrink-0`}>
            <PlatformIcon className={`w-6 h-6 ${platform.color}`} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-sm truncate">{order.serviceName}</p>
            <p className="text-2xl font-bold text-white font-['Space_Grotesk']">
              {formatCurrency(order.amount)}
            </p>
          </div>
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${status.bg} ${status.color} ${status.border} flex-shrink-0`}>
            <StatusIcon className="w-3 h-3" />
            {status.label}
          </div>
        </div>

        {/* Delivery progress */}
        {order.remains != null && (
          <div className="mb-4 p-3 rounded-xl bg-white/5 border border-white/10">
            <div className="flex justify-between text-xs text-gray-400 mb-1.5">
              <span>Delivery progress</span>
              <span>{fmtNum(delivered)} / {fmtNum(order.quantity)}</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-[11px] text-gray-500 mt-1">{fmtNum(order.remains)} remaining</p>
          </div>
        )}

        {/* Details grid */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <p className="text-[11px] text-gray-500 mb-0.5">Quantity</p>
            <p className="text-white text-sm font-semibold">{fmtNum(order.quantity)}</p>
          </div>
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <p className="text-[11px] text-gray-500 mb-0.5">Start Count</p>
            <p className="text-white text-sm font-semibold">{fmtNum(order.startCount)}</p>
          </div>

          <div className="col-span-2 p-3 rounded-xl bg-white/5 border border-white/10">
            <p className="text-[11px] text-gray-500 mb-1">Receipt No.</p>
            <div className="flex items-center gap-2">
              <span className="text-white text-sm font-mono flex-1 truncate">{order.receiptNo}</span>
              <button
                onClick={() => copy(order.receiptNo, 'receipt')}
                className="p-1 rounded hover:bg-white/10 transition-colors flex-shrink-0"
              >
                {copied === 'receipt'
                  ? <Check className="w-3.5 h-3.5 text-emerald-400" />
                  : <Copy className="w-3.5 h-3.5 text-gray-500" />}
              </button>
            </div>
          </div>

          <div className="col-span-2 p-3 rounded-xl bg-white/5 border border-white/10">
            <p className="text-[11px] text-gray-500 mb-1">Link</p>
            <div className="flex items-center gap-2">
              <span className="text-white text-sm truncate flex-1">{order.link}</span>
              <button
                onClick={() => copy(order.link, 'link')}
                className="p-1 rounded hover:bg-white/10 transition-colors flex-shrink-0"
              >
                {copied === 'link'
                  ? <Check className="w-3.5 h-3.5 text-emerald-400" />
                  : <Copy className="w-3.5 h-3.5 text-gray-500" />}
              </button>
              <a
                href={order.link}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 rounded hover:bg-white/10 transition-colors flex-shrink-0"
              >
                <ExternalLink className="w-3.5 h-3.5 text-gray-500 hover:text-white transition-colors" />
              </a>
            </div>
          </div>

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

export default OrderDetailModal;
