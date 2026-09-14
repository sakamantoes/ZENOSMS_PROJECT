import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  Loader2,
  Minus,
  Plus,
  ShoppingCart,
  Trash2,
  X,
} from "lucide-react";

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

const CartDrawer = ({
  open,
  onClose,
  items = [],
  isLoading = false,
  error = "",
  onIncrease,
  onDecrease,
  onRemove,
  onCheckout,
  itemActionLoading = {},
}) => {
  const total = items.reduce((sum, item) => {
    const price = item.productId?.price ?? 0;
    return sum + price * item.quantity;
  }, 0);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            aria-label="Close cart"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed top-0 left-0 w-full h-full z-50 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "tween", duration: 0.25 }}
            className="fixed inset-y-0 left-0 z-50 flex w-full max-w-sm flex-col border-l border-white/10 bg-[#0d0d0d] shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-3 border-b border-white/10 p-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#00CBCF]/20 bg-[#00CBCF]/10">
                  <ShoppingCart size={15} className="text-[#00CBCF]" />
                </div>
                <h2 className="text-base font-semibold text-white">
                  Your Cart
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
              >
                <X size={14} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-4">
              {isLoading && (
                <div className="flex items-center justify-center gap-2.5 rounded-xl border border-white/10 bg-black/20 p-8 text-sm text-gray-300">
                  <Loader2 size={18} className="animate-spin text-[#00CBCF]" />
                  Loading cart…
                </div>
              )}

              {!isLoading && error && (
                <div className="flex items-start gap-2.5 rounded-xl border border-red-500/20 bg-red-500/10 p-4">
                  <AlertCircle
                    size={16}
                    className="mt-0.5 shrink-0 text-red-400"
                  />
                  <p className="text-sm text-red-300">{error}</p>
                </div>
              )}

              {!isLoading && !error && items.length === 0 && (
                <div className="flex flex-col items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-10 text-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                    <ShoppingCart size={18} className="text-gray-500" />
                  </div>
                  <p className="text-sm font-semibold text-white">
                    Your cart is empty
                  </p>
                  <p className="text-xs text-gray-400">
                    Add products to see them here.
                  </p>
                </div>
              )}

              {!isLoading && !error && items.length > 0 && (
                <div className="space-y-3">
                  {items.map((item) => {
                    const product = item.productId;
                    const id = product?._id;
                    const loading = itemActionLoading[id] ?? {};
                    return (
                      <div
                        key={id}
                        className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-white">
                            {product?.name ?? "Product"}
                          </p>
                          <p className="text-xs text-gray-400">
                            {formatCurrency(product?.price)} × {item.quantity}
                          </p>
                        </div>
                        <button
                          type="button"
                          disabled={loading.decreasing}
                          onClick={() => onDecrease(id)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-gray-300 transition-colors hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                          aria-label="Decrease quantity"
                        >
                          {loading.decreasing ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : (
                            <Minus size={12} />
                          )}
                        </button>
                        <button
                          type="button"
                          disabled={loading.increasing}
                          onClick={() => onIncrease(id)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-gray-300 transition-colors hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                          aria-label="Increase quantity"
                        >
                          {loading.increasing ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : (
                            <Plus size={12} />
                          )}
                        </button>
                        <button
                          type="button"
                          disabled={loading.removing}
                          onClick={() => onRemove(id)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-red-500/20 bg-red-500/10 text-red-400 transition-colors hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                          aria-label="Remove from cart"
                        >
                          {loading.removing ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : (
                            <Trash2 size={12} />
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            {!isLoading && !error && items.length > 0 && (
              <div className="space-y-3 border-t border-white/10 p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Total</span>
                  <span className="text-base font-bold text-[#00CBCF]">
                    {formatCurrency(total)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={onCheckout}
                  className="h-10 w-full rounded-lg border border-[#00CBCF]/30 bg-[#00CBCF]/10 text-sm font-semibold text-[#00CBCF] transition-colors hover:bg-[#00CBCF]/20"
                >
                  Checkout
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
