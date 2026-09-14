import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  Gift,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Upload,
  X,
} from "lucide-react";
import { getErrorMessage } from "../../utils/getErrorMessage.js";
import {
  getProductCategoryBySlug,
  getProductsByCategory,
  createProduct,
  updateProduct,
  uploadToolImage,
  deleteToolImage,
} from "../../Service/admin.js";
import GiftProductCard from "../../Components/GiftProductCard.jsx";

const EMPTY_PRODUCT_FORM = {
  name: "",
  description: "",
  price: "",
  stock: "",
};

const cleanupStagedImage = async (path) => {
  if (!path) return;
  try {
    await deleteToolImage(path);
  } catch {
    // best-effort cleanup
  }
};

const GiftCategoryProducts = () => {
  const { categorySlug } = useParams();
  const navigate = useNavigate();

  const [category, setCategory] = useState(null);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [categoryError, setCategoryError] = useState("");

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

  const fetchCategory = async () => {
    setCategoryLoading(true);
    setCategoryError("");
    try {
      const res = await getProductCategoryBySlug(categorySlug);
      setCategory(res.data ?? null);
    } catch (err) {
      setCategoryError(getErrorMessage(err, "Unable to fetch category."));
      setCategory(null);
    } finally {
      setCategoryLoading(false);
    }
  };

  const fetchProducts = async () => {
    setProductsLoading(true);
    setProductsError("");
    try {
      const res = await getProductsByCategory(categorySlug, {
        page: productPage,
        limit: 20,
        search: productSearch,
      });
      setProducts(res.data ?? []);
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
    fetchCategory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categorySlug]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categorySlug, productPage, productSearch]);

  const handleBackToCategories = () => {
    navigate("/a/manage-gift-products");
  };

  // ---------- Create/Edit Product modal ----------
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState(EMPTY_PRODUCT_FORM);
  const [productFormErrors, setProductFormErrors] = useState({});
  const [productSubmitting, setProductSubmitting] = useState(false);
  const [productSubmitError, setProductSubmitError] = useState("");
  const [productImages, setProductImages] = useState([]);
  const [stagedProductImagePaths, setStagedProductImagePaths] = useState([]);
  const [productImageUploading, setProductImageUploading] = useState(false);
  const [productImageUploadError, setProductImageUploadError] = useState("");
  const productFileInputRef = useRef(null);

  const openCreateProduct = () => {
    setEditingProduct(null);
    setProductForm(EMPTY_PRODUCT_FORM);
    setProductFormErrors({});
    setProductSubmitError("");
    setProductImages([]);
    setStagedProductImagePaths([]);
    setProductImageUploadError("");
    setProductModalOpen(true);
  };

  const openEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name ?? "",
      description: product.description ?? "",
      price: String(product.price ?? ""),
      stock: product.stock != null ? String(product.stock) : "",
    });
    setProductFormErrors({});
    setProductSubmitError("");
    setProductImages(
      (product.images ?? []).map((img) => ({
        url: img.url,
        path: img.publicId,
      })),
    );
    setStagedProductImagePaths([]);
    setProductImageUploadError("");
    setProductModalOpen(true);
  };

  const closeProductModal = async () => {
    await Promise.all(stagedProductImagePaths.map(cleanupStagedImage));
    setProductModalOpen(false);
    setEditingProduct(null);
    setProductImages([]);
    setStagedProductImagePaths([]);
  };

  const handleProductFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (productFileInputRef.current) productFileInputRef.current.value = "";

    setProductImageUploadError("");
    setProductImageUploading(true);

    try {
      const res = await uploadToolImage(file);
      const { url, path } = res.data;
      setProductImages((prev) => [...prev, { url, path }]);
      setStagedProductImagePaths((prev) => [...prev, path]);
    } catch (err) {
      setProductImageUploadError(getErrorMessage(err, "Image upload failed."));
    } finally {
      setProductImageUploading(false);
    }
  };

  const handleRemoveProductImage = async (path) => {
    // Only delete from storage if this image was uploaded in the current
    // session — an already-saved product image must not be hard-deleted
    // until the edit is actually submitted (or never, since removing it
    // from the form just detaches it from the product).
    if (stagedProductImagePaths.includes(path)) {
      await cleanupStagedImage(path);
      setStagedProductImagePaths((prev) => prev.filter((p) => p !== path));
    }
    setProductImages((prev) => prev.filter((img) => img.path !== path));
  };

  const validateProductForm = () => {
    const errs = {};
    if (!productForm.name.trim()) errs.name = "Name is required.";
    if (!productForm.description.trim())
      errs.description = "Description is required.";
    if (
      productForm.price === "" ||
      isNaN(Number(productForm.price)) ||
      Number(productForm.price) < 0
    )
      errs.price = "Valid non-negative price is required.";
    if (
      productForm.stock !== "" &&
      (isNaN(Number(productForm.stock)) ||
        !Number.isInteger(Number(productForm.stock)) ||
        Number(productForm.stock) < 0)
    )
      errs.stock = "Must be a non-negative whole number.";
    return errs;
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    const errs = validateProductForm();
    if (Object.keys(errs).length) {
      setProductFormErrors(errs);
      return;
    }
    setProductFormErrors({});
    setProductSubmitError("");
    setProductSubmitting(true);
    try {
      const payload = {
        name: productForm.name.trim(),
        description: productForm.description.trim(),
        price: Number(productForm.price),
        stock: productForm.stock !== "" ? Number(productForm.stock) : 0,
        images: productImages.map((img, i) => ({
          url: img.url,
          publicId: img.path,
          isPrimary: i === 0,
        })),
      };
      if (editingProduct) {
        const res = await updateProduct(editingProduct._id, payload);
        setProducts((prev) =>
          prev.map((p) => (p._id === editingProduct._id ? res.data : p)),
        );
      } else {
        const res = await createProduct(categorySlug, payload);
        setProducts((prev) => [res.data, ...prev]);
      }
      setStagedProductImagePaths([]);
      setProductModalOpen(false);
      setEditingProduct(null);
      setProductImages([]);
    } catch (err) {
      const serverErrors = err?.response?.data?.error;
      if (serverErrors && typeof serverErrors === "object") {
        setProductFormErrors(serverErrors);
      } else {
        setProductSubmitError(getErrorMessage(err, "Something went wrong."));
      }
    } finally {
      setProductSubmitting(false);
    }
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
              {categoryLoading
                ? "Loading…"
                : category?.name ?? categorySlug}
            </h1>
            <p className="text-xs text-gray-400">Products in this category</p>
          </div>
        </div>
        <button
          type="button"
          onClick={openCreateProduct}
          className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-xl border border-[#00CBCF]/30 bg-[#00CBCF]/10 px-4 text-xs font-semibold text-[#00CBCF] transition-colors hover:bg-[#00CBCF]/20"
        >
          <Plus size={14} />
          New Product
        </button>
      </div>

      {categoryError && (
        <div className="flex items-start gap-2.5 rounded-xl border border-red-500/20 bg-red-500/10 p-4">
          <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-400" />
          <p className="text-sm text-red-300">{categoryError}</p>
        </div>
      )}

      {/* Product search */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative min-w-48 flex-1">
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
          <button
            type="button"
            onClick={fetchProducts}
            disabled={productsLoading}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 text-xs font-semibold text-gray-200 transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={13}
              className={productsLoading ? "animate-spin" : ""}
            />
            Refresh
          </button>
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
                    : "No products yet"}
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  {productSearch
                    ? "Try adjusting your search."
                    : 'Click "New Product" to create the first one.'}
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
                  onEdit={openEditProduct}
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

      {/* Create/Edit Product Modal */}
      {productModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-white/10 bg-[#0d0d0d] p-6 shadow-2xl">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#00CBCF]/20 bg-[#00CBCF]/10">
                  <Gift size={15} className="text-[#00CBCF]" />
                </div>
                <h2 className="text-base font-semibold text-white">
                  {editingProduct ? "Edit Product" : "New Product"}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeProductModal}
                disabled={productImageUploading}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-gray-400 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50"
              >
                <X size={14} />
              </button>
            </div>

            <form onSubmit={handleProductSubmit} className="mt-5 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-400">
                  Product Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={productForm.name}
                  onChange={(e) =>
                    setProductForm((p) => ({ ...p, name: e.target.value }))
                  }
                  placeholder="e.g. Scented Candle Set"
                  className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white outline-none transition-colors placeholder:text-gray-600 focus:border-[#00CBCF]/60 focus:bg-black/30"
                />
                {productFormErrors.name && (
                  <p className="mt-1 text-xs text-red-400">
                    {productFormErrors.name}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-400">
                  Description <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={productForm.description}
                  onChange={(e) =>
                    setProductForm((p) => ({
                      ...p,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Describe the product…"
                  rows={3}
                  className="w-full resize-none rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none transition-colors placeholder:text-gray-600 focus:border-[#00CBCF]/60 focus:bg-black/30"
                />
                {productFormErrors.description && (
                  <p className="mt-1 text-xs text-red-400">
                    {productFormErrors.description}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-400">
                    Price (NGN) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={productForm.price}
                    onChange={(e) =>
                      setProductForm((p) => ({ ...p, price: e.target.value }))
                    }
                    placeholder="0.00"
                    className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white outline-none transition-colors placeholder:text-gray-600 focus:border-[#00CBCF]/60 focus:bg-black/30"
                  />
                  {productFormErrors.price && (
                    <p className="mt-1 text-xs text-red-400">
                      {productFormErrors.price}
                    </p>
                  )}
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-400">
                    Stock
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={productForm.stock}
                    onChange={(e) =>
                      setProductForm((p) => ({ ...p, stock: e.target.value }))
                    }
                    placeholder="0"
                    className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white outline-none transition-colors placeholder:text-gray-600 focus:border-[#00CBCF]/60 focus:bg-black/30"
                  />
                  {productFormErrors.stock && (
                    <p className="mt-1 text-xs text-red-400">
                      {productFormErrors.stock}
                    </p>
                  )}
                </div>
              </div>

              {/* Product images upload */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-400">
                  Product Images
                </label>

                {productImages.length > 0 && (
                  <div className="mb-2 grid grid-cols-3 gap-2">
                    {productImages.map((img) => (
                      <div
                        key={img.path}
                        className="relative overflow-hidden rounded-lg border border-white/10 bg-black/30"
                      >
                        <img
                          src={img.url}
                          alt="Product"
                          className="h-20 w-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveProductImage(img.path)}
                          className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full border border-red-500/30 bg-red-500/80 text-white transition-colors hover:bg-red-500"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => productFileInputRef.current?.click()}
                  disabled={productImageUploading}
                  className="flex h-20 w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-white/20 bg-white/5 text-gray-400 transition-colors hover:border-[#00CBCF]/40 hover:bg-[#00CBCF]/5 hover:text-[#00CBCF] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {productImageUploading ? (
                    <>
                      <Loader2
                        size={18}
                        className="animate-spin text-[#00CBCF]"
                      />
                      <span className="text-xs">Uploading…</span>
                    </>
                  ) : (
                    <>
                      <Upload size={18} />
                      <span className="text-xs">Click to add an image</span>
                    </>
                  )}
                </button>

                <input
                  ref={productFileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleProductFileChange}
                />

                {productImageUploadError && (
                  <p className="mt-1.5 text-xs text-red-400">
                    {productImageUploadError}
                  </p>
                )}
              </div>

              {productSubmitError && (
                <div className="flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2.5">
                  <AlertCircle
                    size={14}
                    className="mt-0.5 shrink-0 text-red-400"
                  />
                  <p className="text-xs text-red-300">{productSubmitError}</p>
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={closeProductModal}
                  disabled={productImageUploading}
                  className="h-10 flex-1 rounded-lg border border-white/10 bg-white/5 text-sm font-semibold text-gray-300 transition-colors hover:bg-white/10 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={productSubmitting || productImageUploading}
                  className="h-10 flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-[#00CBCF]/30 bg-[#00CBCF]/10 text-sm font-semibold text-[#00CBCF] transition-colors hover:bg-[#00CBCF]/20 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {productSubmitting ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : editingProduct ? (
                    "Save Changes"
                  ) : (
                    "Create Product"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GiftCategoryProducts;
