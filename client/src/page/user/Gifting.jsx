import React from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, Gift, Loader2, ShoppingCart } from "lucide-react";
import { getGiftCategories } from "../../Service/gifting.js";
import useProductCategories from "../../Hooks/useProductCategories.js";
import useCart from "../../Hooks/useCart.js";
import CategoryCard from "../../Components/CategoryCard.jsx";

const Gifting = () => {
  const navigate = useNavigate();
  const {
    categories,
    isLoading: categoriesLoading,
    error: categoriesError,
    refetch: refetchCategories,
  } = useProductCategories({ limit: 100, fetcher: getGiftCategories });
  const { cartCount } = useCart();

  const handleSelectCategory = (category) => {
    navigate(`/f/gift_sending/${category.slug}`);
  };

  return (
    <div className="space-y-6 py-2">
      {/* Page header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#07cf00]/20 bg-[#07cf00]/10">
            <Gift size={18} className="text-[#07cf00]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Gifting</h1>
            <p className="mt-1 text-sm text-gray-400">
              Browse gift categories and send something thoughtful.
            </p>
          </div>
        </div>
        <div className="inline-flex h-9 shrink-0 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 text-xs font-semibold text-gray-200">
          <ShoppingCart size={14} className="text-[#07cf00]" />
          {cartCount} in cart
        </div>
      </div>

      {/* Loading */}
      {categoriesLoading && (
        <div className="flex items-center justify-center gap-2.5 rounded-xl border border-white/10 bg-black/20 p-10 text-sm text-gray-300">
          <Loader2 size={18} className="animate-spin text-[#00CBCF]" />
          Loading categories…
        </div>
      )}

      {/* Error */}
      {!categoriesLoading && categoriesError && (
        <div className="flex items-start gap-2.5 rounded-xl border border-red-500/20 bg-red-500/10 p-4">
          <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-400" />
          <div>
            <p className="text-sm text-red-300">{categoriesError}</p>
            <button
              type="button"
              onClick={refetchCategories}
              className="mt-2 text-xs font-semibold text-red-300 underline"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* Categories grid */}
      {!categoriesLoading && !categoriesError && (
        <>
          {categories.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-10 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                <Gift size={18} className="text-gray-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">
                  No gift categories yet
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  Check back soon — new categories are added regularly.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {categories.map((category, index) => (
                <CategoryCard
                  key={category._id}
                  category={category}
                  index={index}
                  onClick={handleSelectCategory}
                  heightClassName="h-[400px]"
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Gifting;
