import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Gift, Loader2, PackageX, Pencil, ShoppingCart } from "lucide-react";

const SLIDE_INTERVAL_MS = 3000;

const formatCurrency = (amount) => {
  const n = Number(amount);
  if (!Number.isFinite(n)) return "₦0.00";
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
};

const GiftProductCard = ({
  product,
  index = 0,
  onClick,
  onAddToCart,
  addingToCart = false,
  onEdit,
}) => {
  const images = (product.images ?? []).filter((img) => img?.url);
  const orderedImages = images.length
    ? [...images].sort((a, b) => (a.isPrimary === b.isPrimary ? 0 : a.isPrimary ? -1 : 1))
    : [];

  const [slideIndex, setSlideIndex] = useState(0);
  const [erroredIndexes, setErroredIndexes] = useState(() => new Set());

  useEffect(() => {
    if (orderedImages.length <= 1) return;
    const timer = setInterval(() => {
      setSlideIndex((i) => (i + 1) % orderedImages.length);
    }, SLIDE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [orderedImages.length]);

  const activeImage = orderedImages[slideIndex];
  const hasValidImage = activeImage && !erroredIndexes.has(slideIndex);
  const outOfStock = Number(product.stock) <= 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.06, 0.5) }}
      onClick={() => onClick?.(product)}
      className={`group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-gray-900 to-gray-950 transition-all duration-300 hover:-translate-y-1.5 hover:border-white/20 hover:shadow-2xl hover:shadow-black/50 ${
        onClick ? "cursor-pointer" : ""
      }`}
    >
      <div className="relative aspect-square shrink-0 overflow-hidden">
        {hasValidImage ? (
          <AnimatePresence mode="sync">
            <motion.img
              key={activeImage.url}
              src={activeImage.url}
              alt={product.name}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={() =>
                setErroredIndexes((prev) => new Set(prev).add(slideIndex))
              }
            />
          </AnimatePresence>
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#00CBCF]/10 via-gray-900 to-gray-950">
            <Gift className="h-10 w-10 text-[#00CBCF]/40" />
          </div>
        )}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-gray-950 to-transparent" />

        {orderedImages.length > 1 && (
          <div className="absolute inset-x-0 bottom-2 z-10 flex items-center justify-center gap-1">
            {orderedImages.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === slideIndex ? "w-4 bg-[#00CBCF]" : "w-1.5 bg-white/40"
                }`}
              />
            ))}
          </div>
        )}

        {product.isFeatured && (
          <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full border border-[#00CBCF]/30 bg-[#00CBCF]/20 px-2.5 py-1 text-xs font-semibold text-[#00CBCF] backdrop-blur-md">
            Featured
          </div>
        )}
        <div className="absolute right-3 top-3 z-10 flex flex-col items-end gap-2">
          {outOfStock && (
            <div className="flex items-center gap-1 rounded-full border border-red-500/30 bg-red-500/20 px-2.5 py-1 text-[10px] font-semibold text-red-300 backdrop-blur-md">
              <PackageX size={10} />
              Out of stock
            </div>
          )}
          {onEdit && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(product);
              }}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/20 bg-black/40 text-white backdrop-blur-md transition-colors hover:bg-black/60"
              aria-label={`Edit ${product.name}`}
            >
              <Pencil size={12} />
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3
          className="line-clamp-2 text-sm font-bold leading-snug text-white"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          {product.name}
        </h3>
        {product.description && (
          <p className="line-clamp-2 text-xs leading-relaxed text-gray-400">
            {product.description}
          </p>
        )}
        <div className="mt-auto flex items-center justify-between gap-2 border-t border-white/5 pt-3">
          <div>
            <p className="mb-0.5 text-[10px] uppercase tracking-wider text-gray-500">
              Price
            </p>
            <p className="text-base font-bold text-[#00CBCF]">
              {formatCurrency(product.price)}
            </p>
          </div>
          {onAddToCart ? (
            <button
              type="button"
              disabled={outOfStock || addingToCart}
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart(product);
              }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#00CBCF] to-[#00a5a8] px-3 py-2 text-xs font-semibold text-white shadow-lg shadow-[#00CBCF]/20 transition-all duration-200 hover:from-[#00e0e4] hover:to-[#00CBCF] hover:shadow-[#00CBCF]/35 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
            >
              {addingToCart ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <ShoppingCart className="h-3.5 w-3.5" />
              )}
              Add to Cart
            </button>
          ) : (
            <span className="text-[11px] text-gray-500">
              {product.stock ?? 0} in stock
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default GiftProductCard;
