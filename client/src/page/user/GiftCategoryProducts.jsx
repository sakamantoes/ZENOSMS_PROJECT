import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  Gift,
  Loader2,
  Search,
  ShoppingCart,
} from "lucide-react";
import { toast } from "react-toastify";
import { getErrorMessage } from "../../utils/getErrorMessage.js";
import { getGiftProductsByCategory } from "../../Service/gifting.js";
import useCart from "../../Hooks/useCart.js";
import GiftProductCard from "../../Components/GiftProductCard.jsx";
import CartDrawer from "../../Components/CartDrawer.jsx";

const GiftCategoryProducts = () => {
  const { categorySlug } = useParams();
  const navigate = useNavigate();
  const {
    items: cartItems,
    cartCount,
    isLoading: cartFetchLoading,
    error: cartError,
    addToCart,
    removeItem,
    increaseQuantity,
    decreaseQuantity,
  } = useCart();
  const [cartOpen, setCartOpen] = useState(false);
  const [itemActionLoading, setItemActionLoading] = useState({});

  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsError, setProductsError] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [productPage, setProductPage] = useState(1);
  const [productsPagination, setProductsPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  const fetchProducts = async () => {
    setProductsLoading(true);
    setProductsError("");
    try {
      const res = await getGiftProductsByCategory(categorySlug, {
        page: productPage,
        limit: 20,
        search: productSearch,
      });
      setProducts(res.data ?? []);
      setCategory(res.category ?? null);
      setProductsPagination(
        res.pagination ?? { page: 1, limit: 20, total: 0, totalPages: 0 },
      );
    } catch (err) {
      setProductsError(getErrorMessage(err, "Unable to fetch products."));
      setProducts([]);
    } finally {
      setProductsLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categorySlug, productPage, productSearch]);

  const handleBackToCategories = () => {
    navigate("/f/gift_sending");
  };

  const [addingToCartIds, setAddingToCartIds] = useState({});

  const handleAddToCart = async (product) => {
    const id = product._id;
    setAddingToCartIds((prev) => ({ ...prev, [id]: true }));
    try {
      const res = await addToCart(id, 1);
      toast.success(res?.message || `${product.name} added to cart`);
    } catch (err) {
      toast.error(getErrorMessage(err, "Unable to add to cart."));
    } finally {
      setAddingToCartIds((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleIncreaseQuantity = async (productId) => {
    setItemActionLoading((prev) => ({
      ...prev,
      [productId]: { ...prev[productId], increasing: true },
    }));
    try {
      await increaseQuantity(productId);
    } catch (err) {
      toast.error(getErrorMessage(err, "Unable to update quantity."));
    } finally {
      setItemActionLoading((prev) => ({
        ...prev,
        [productId]: { ...prev[productId], increasing: false },
      }));
    }
  };

  const handleDecreaseQuantity = async (productId) => {
    setItemActionLoading((prev) => ({
      ...prev,
      [productId]: { ...prev[productId], decreasing: true },
    }));
    try {
      await decreaseQuantity(productId);
    } catch (err) {
      toast.error(getErrorMessage(err, "Unable to update quantity."));
    } finally {
      setItemActionLoading((prev) => ({
        ...prev,
        [productId]: { ...prev[productId], decreasing: false },
      }));
    }
  };

  const handleRemoveFromCart = async (productId) => {
    setItemActionLoading((prev) => ({
      ...prev,
      [productId]: { ...prev[productId], removing: true },
    }));
    try {
      await removeItem(productId);
    } catch (err) {
      toast.error(getErrorMessage(err, "Unable to remove item."));
    } finally {
      setItemActionLoading((prev) => ({
        ...prev,
        [productId]: { ...prev[productId], removing: false },
      }));
    }
  };

  const handleCheckout = () => {
    setCartOpen(false);
    navigate("/f/checkout");
  };

  return (
    <div className="space-y-6 py-2">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleBackToCategories}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Back to categories"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-lg font-semibold text-white">
              {category?.name ?? categorySlug}
            </h1>
            <p className="text-xs text-gray-400">Products in this category</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setCartOpen(true)}
          className="relative inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 text-xs font-semibold text-gray-200 transition-colors hover:bg-white/10"
        >
          <ShoppingCart size={14} className="text-[#00CBCF]" />
          Cart
          {cartCount > 0 && (
            <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-[#00CBCF] px-1 text-[10px] font-bold text-black">
              {cartCount}
            </span>
          )}
        </button>
      </div>

      {/* Product search */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
          />
          <input
            type="text"
            value={productSearch}
            onChange={(e) => {
              setProductPage(1);
              setProductSearch(e.target.value);
            }}
            placeholder="Search products…"
            className="h-9 w-full rounded-lg border border-white/10 bg-white/5 pl-8 pr-3 text-sm text-white outline-none transition-colors placeholder:text-gray-500 focus:border-[#00CBCF]/60 focus:bg-black/30"
          />
        </div>
      </div>

      {/* Loading */}
      {productsLoading && (
        <div className="flex items-center justify-center gap-2.5 rounded-xl border border-white/10 bg-black/20 p-10 text-sm text-gray-300">
          <Loader2 size={18} className="animate-spin text-[#00CBCF]" />
          Loading products…
        </div>
      )}

      {/* Error */}
      {!productsLoading && productsError && (
        <div className="flex items-start gap-2.5 rounded-xl border border-red-500/20 bg-red-500/10 p-4">
          <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-400" />
          <p className="text-sm text-red-300">{productsError}</p>
        </div>
      )}

      {/* Products grid */}
      {!productsLoading && !productsError && (
        <>
          {products.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-10 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                <Gift size={18} className="text-gray-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">
                  {productSearch
                    ? "No products match your search"
                    : "No products in this category yet"}
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  {productSearch
                    ? "Try adjusting your search."
                    : "Check back soon."}
                </p>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 sm:gap-5 md:grid-cols-2 xl:grid-cols-3">
              {products.map((product, index) => (
                <GiftProductCard
                  key={product._id}
                  product={product}
                  index={index}
                  onAddToCart={handleAddToCart}
                  addingToCart={!!addingToCartIds[product._id]}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {productsPagination.totalPages > 1 && (
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 pt-3">
              <button
                type="button"
                disabled={productPage <= 1}
                onClick={() => setProductPage((p) => p - 1)}
                className="inline-flex h-8 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 text-xs font-semibold text-gray-200 transition-all hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>
              <span className="px-2 text-xs text-gray-400">
                Page{" "}
                <span className="font-semibold text-white">
                  {productsPagination.page}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-white">
                  {productsPagination.totalPages}
                </span>
              </span>
              <button
                type="button"
                disabled={productPage >= productsPagination.totalPages}
                onClick={() => setProductPage((p) => p + 1)}
                className="inline-flex h-8 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 text-xs font-semibold text-gray-200 transition-all hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cartItems}
        isLoading={cartFetchLoading}
        error={cartError}
        onIncrease={handleIncreaseQuantity}
        onDecrease={handleDecreaseQuantity}
        onRemove={handleRemoveFromCart}
        onCheckout={handleCheckout}
        itemActionLoading={itemActionLoading}
      />
    </div>
  );
};

export default GiftCategoryProducts;
