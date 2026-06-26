import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, BookOpen, Wrench, Package, ImageIcon } from 'lucide-react';

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

const FormatProductCard = ({ item, index = 0, onBuy }) => {
  const [imgError, setImgError] = useState(false);
  const isTool = item.type === 'tool';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.06, 0.5) }}
      className="group flex flex-col rounded-2xl overflow-hidden bg-gradient-to-b from-gray-900 to-gray-950 border border-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-2xl hover:shadow-black/50 hover:-translate-y-1.5"
    >
      {/* Image / Preview */}
      <div className="relative h-44 overflow-hidden shrink-0">
        {item.imageUrl && !imgError ? (
          <img
            src={item.imageUrl}
            alt={item.productName}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setImgError(true)}
          />
        ) : (
          <div
            className={`w-full h-full flex items-center justify-center relative ${
              isTool
                ? 'bg-gradient-to-br from-violet-950/90 via-gray-900 to-gray-950'
                : 'bg-gradient-to-br from-emerald-950/90 via-gray-900 to-gray-950'
            }`}
          >
            {/* Dot grid background */}
            <div
              className="absolute inset-0 opacity-[0.07]"
              style={{
                backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
                backgroundSize: '18px 18px',
              }}
            />
            <div
              className={`relative z-10 p-5 rounded-2xl border ${
                isTool
                  ? 'bg-violet-500/10 border-violet-500/20'
                  : 'bg-emerald-500/10 border-emerald-500/20'
              }`}
            >
              {isTool ? (
                <Wrench className="w-10 h-10 text-violet-400" />
              ) : (
                <BookOpen className="w-10 h-10 text-emerald-400" />
              )}
            </div>
          </div>
        )}

        {/* Gradient fade at bottom */}
        <div className="absolute bottom-0 inset-x-0 h-1/2 bg-gradient-to-t from-gray-950 to-transparent pointer-events-none" />

        {/* Type badge */}
        <div
          className={`absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border backdrop-blur-md ${
            isTool
              ? 'bg-violet-500/20 border-violet-500/30 text-violet-300'
              : 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300'
          }`}
        >
          {isTool ? <Wrench className="w-3 h-3" /> : <BookOpen className="w-3 h-3" />}
          {isTool ? 'Tool' : 'Format'}
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        <div>
          <h3 className="font-bold text-white font-['Space_Grotesk'] text-sm leading-snug line-clamp-2">
            {item.productName}
          </h3>
          {item.productDescription && (
            <p className="text-xs text-gray-400 mt-1.5 line-clamp-2 leading-relaxed">
              {item.productDescription}
            </p>
          )}
        </div>

        {/* Stock chips */}
        {(item.stockPics != null || item.stockImg != null) && (
          <div className="flex flex-wrap gap-1.5">
            {item.stockPics != null && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[11px] text-gray-400">
                <Package className="w-2.5 h-2.5" />
                {item.stockPics} pics
              </span>
            )}
            {item.stockImg != null && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[11px] text-gray-400">
                <ImageIcon className="w-2.5 h-2.5" />
                {item.stockImg} imgs
              </span>
            )}
          </div>
        )}

        {/* Footer: price + buy */}
        <div className="mt-auto pt-3 border-t border-white/5 flex items-center justify-between gap-2">
          <div>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-0.5">Price</p>
            <p
              className={`text-base font-bold ${
                isTool ? 'text-violet-400' : 'text-emerald-400'
              }`}
            >
              {formatCurrency(item.sellingPrice)}
            </p>
          </div>
          <button
            onClick={() => onBuy(item)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 shadow-lg text-white whitespace-nowrap ${
              isTool
                ? 'bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 shadow-violet-500/20 hover:shadow-violet-500/35'
                : 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 shadow-emerald-500/20 hover:shadow-emerald-500/35'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            Buy Now
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default FormatProductCard;
