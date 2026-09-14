import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
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
  createProductCategory,
  updateProductCategory,
  uploadToolImage,
  deleteToolImage,
} from "../../Service/admin.js";
import useProductCategories from "../../Hooks/useProductCategories.js";
import CategoryCard from "../../Components/CategoryCard.jsx";

const EMPTY_CATEGORY_FORM = {
  name: "",
  description: "",
  image: "",
  imageId: "",
};

const cleanupStagedImage = async (path) => {
  if (!path) return;
  try {
    await deleteToolImage(path);
  } catch {
    // best-effort cleanup
  }
};

const GiftProductManagement = () => {
  const navigate = useNavigate();
  const [categorySearch, setCategorySearch] = useState("");
  const {
    categories,
    isLoading: categoriesLoading,
    error: categoriesError,
    refetch: refetchCategories,
  } = useProductCategories({ limit: 100, search: categorySearch });

  const handleSelectCategory = (category) => {
    navigate(`/a/manage-gift-products/${category.slug}`);
  };

  // ---------- Create/Edit Category modal ----------
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryForm, setCategoryForm] = useState(EMPTY_CATEGORY_FORM);
  const [categoryFormErrors, setCategoryFormErrors] = useState({});
  const [categorySubmitting, setCategorySubmitting] = useState(false);
  const [categorySubmitError, setCategorySubmitError] = useState("");
  const [stagedCategoryImagePath, setStagedCategoryImagePath] =
    useState(null);
  const [categoryImageUploading, setCategoryImageUploading] = useState(false);
  const [categoryImageUploadError, setCategoryImageUploadError] =
    useState("");
  const categoryFileInputRef = useRef(null);

  const openCreateCategory = () => {
    setEditingCategory(null);
    setCategoryForm(EMPTY_CATEGORY_FORM);
    setCategoryFormErrors({});
    setCategorySubmitError("");
    setStagedCategoryImagePath(null);
    setCategoryImageUploadError("");
    setCategoryModalOpen(true);
  };

  const openEditCategory = (category) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name ?? "",
      description: category.description ?? "",
      image: category.image ?? "",
      imageId: category.imageId ?? "",
    });
    setCategoryFormErrors({});
    setCategorySubmitError("");
    setStagedCategoryImagePath(null);
    setCategoryImageUploadError("");
    setCategoryModalOpen(true);
  };

  const closeCategoryModal = async () => {
    if (stagedCategoryImagePath) {
      await cleanupStagedImage(stagedCategoryImagePath);
    }
    setCategoryModalOpen(false);
    setEditingCategory(null);
    setStagedCategoryImagePath(null);
  };

  const handleCategoryFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (categoryFileInputRef.current) categoryFileInputRef.current.value = "";

    setCategoryImageUploadError("");
    setCategoryImageUploading(true);

    if (stagedCategoryImagePath) {
      await cleanupStagedImage(stagedCategoryImagePath);
      setStagedCategoryImagePath(null);
    }

    try {
      const res = await uploadToolImage(file);
      const { url, path } = res.data;
      setStagedCategoryImagePath(path);
      setCategoryForm((p) => ({ ...p, image: url, imageId: path }));
    } catch (err) {
      setCategoryImageUploadError(getErrorMessage(err, "Image upload failed."));
    } finally {
      setCategoryImageUploading(false);
    }
  };

  const handleRemoveCategoryImage = async () => {
    if (stagedCategoryImagePath) {
      await cleanupStagedImage(stagedCategoryImagePath);
      setStagedCategoryImagePath(null);
    }
    setCategoryForm((p) => ({ ...p, image: "", imageId: "" }));
    setCategoryImageUploadError("");
  };

  const validateCategoryForm = () => {
    const errs = {};
    if (!categoryForm.name.trim()) errs.name = "Name is required.";
    return errs;
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    const errs = validateCategoryForm();
    if (Object.keys(errs).length) {
      setCategoryFormErrors(errs);
      return;
    }
    setCategoryFormErrors({});
    setCategorySubmitError("");
    setCategorySubmitting(true);
    try {
      const payload = {
        name: categoryForm.name.trim(),
        description: categoryForm.description.trim(),
        image: categoryForm.image,
        imageId: categoryForm.imageId,
      };
      if (editingCategory) {
        await updateProductCategory(editingCategory._id, payload);
      } else {
        await createProductCategory(payload);
      }
      setStagedCategoryImagePath(null);
      setCategoryModalOpen(false);
      setEditingCategory(null);
      refetchCategories();
    } catch (err) {
      const serverErrors = err?.response?.data?.error;
      if (serverErrors && typeof serverErrors === "object") {
        setCategoryFormErrors(serverErrors);
      } else {
        setCategorySubmitError(getErrorMessage(err, "Something went wrong."));
      }
    } finally {
      setCategorySubmitting(false);
    }
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
            <h1 className="text-2xl font-bold text-white">
              Gift Product Management
            </h1>
            <p className="mt-1 text-sm text-gray-400">
              Manage gift categories — open a category to view or add its
              products.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={openCreateCategory}
          className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-xl border border-[#07cf00]/30 bg-[#07cf00]/10 px-4 text-xs font-semibold text-[#07cf00] transition-colors hover:bg-[#07cf00]/20"
        >
          <Plus size={14} />
          New Category
        </button>
      </div>

      {/* Category filters */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative min-w-48 flex-1">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
            />
            <input
              type="text"
              value={categorySearch}
              onChange={(e) => setCategorySearch(e.target.value)}
              placeholder="Search categories…"
              className="h-9 w-full rounded-lg border border-white/10 bg-white/5 pl-8 pr-3 text-sm text-white outline-none transition-colors placeholder:text-gray-500 focus:border-[#07cf00]/60 focus:bg-black/30"
            />
          </div>
          <button
            type="button"
            onClick={refetchCategories}
            disabled={categoriesLoading}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 text-xs font-semibold text-gray-200 transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={13}
              className={categoriesLoading ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>
      </div>

      {/* Loading */}
      {categoriesLoading && (
        <div className="flex items-center justify-center gap-2.5 rounded-xl border border-white/10 bg-black/20 p-10 text-sm text-gray-300">
          <Loader2 size={18} className="animate-spin text-[#07cf00]" />
          Loading categories…
        </div>
      )}

      {/* Error */}
      {!categoriesLoading && categoriesError && (
        <div className="flex items-start gap-2.5 rounded-xl border border-red-500/20 bg-red-500/10 p-4">
          <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-400" />
          <p className="text-sm text-red-300">{categoriesError}</p>
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
                  {categorySearch
                    ? "No categories match your search"
                    : "No categories yet"}
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  {categorySearch
                    ? "Try adjusting your search."
                    : 'Click "New Category" to create the first one.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {categories.map((category, index) => (
                <CategoryCard
                  key={category._id}
                  category={category}
                  index={index}
                  onClick={handleSelectCategory}
                  onEdit={openEditCategory}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Create/Edit Category Modal */}
      {categoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-white/10 bg-[#0d0d0d] p-6 shadow-2xl">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#07cf00]/20 bg-[#07cf00]/10">
                  <Gift size={15} className="text-[#07cf00]" />
                </div>
                <h2 className="text-base font-semibold text-white">
                  {editingCategory ? "Edit Category" : "New Category"}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeCategoryModal}
                disabled={categoryImageUploading}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-gray-400 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50"
              >
                <X size={14} />
              </button>
            </div>

            <form onSubmit={handleCategorySubmit} className="mt-5 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-400">
                  Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={(e) =>
                    setCategoryForm((p) => ({ ...p, name: e.target.value }))
                  }
                  placeholder="e.g. Birthday Gifts"
                  className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white outline-none transition-colors placeholder:text-gray-600 focus:border-[#07cf00]/60 focus:bg-black/30"
                />
                {categoryFormErrors.name && (
                  <p className="mt-1 text-xs text-red-400">
                    {categoryFormErrors.name}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-400">
                  Description
                </label>
                <textarea
                  value={categoryForm.description}
                  onChange={(e) =>
                    setCategoryForm((p) => ({
                      ...p,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Optional description…"
                  rows={3}
                  className="w-full resize-none rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none transition-colors placeholder:text-gray-600 focus:border-[#07cf00]/60 focus:bg-black/30"
                />
              </div>

              {/* Banner image upload */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-400">
                  Banner Image
                </label>

                {categoryForm.image ? (
                  <div className="relative overflow-hidden rounded-lg border border-white/10 bg-black/30">
                    <img
                      src={categoryForm.image}
                      alt="Preview"
                      className="h-36 w-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-end gap-2 bg-gradient-to-t from-black/70 to-transparent p-3">
                      <button
                        type="button"
                        onClick={() => categoryFileInputRef.current?.click()}
                        disabled={categoryImageUploading}
                        className="inline-flex h-7 items-center gap-1.5 rounded-lg border border-white/20 bg-white/10 px-2.5 text-[10px] font-semibold text-white transition-colors hover:bg-white/20 disabled:opacity-50"
                      >
                        {categoryImageUploading ? (
                          <Loader2 size={10} className="animate-spin" />
                        ) : (
                          <Upload size={10} />
                        )}
                        {categoryImageUploading ? "Uploading…" : "Replace"}
                      </button>
                      <button
                        type="button"
                        onClick={handleRemoveCategoryImage}
                        disabled={categoryImageUploading}
                        className="inline-flex h-7 items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/20 px-2.5 text-[10px] font-semibold text-red-300 transition-colors hover:bg-red-500/30 disabled:opacity-50"
                      >
                        <X size={10} />
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => categoryFileInputRef.current?.click()}
                    disabled={categoryImageUploading}
                    className="flex h-24 w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-white/20 bg-white/5 text-gray-400 transition-colors hover:border-[#07cf00]/40 hover:bg-[#07cf00]/5 hover:text-[#07cf00] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {categoryImageUploading ? (
                      <>
                        <Loader2
                          size={20}
                          className="animate-spin text-[#07cf00]"
                        />
                        <span className="text-xs">Uploading…</span>
                      </>
                    ) : (
                      <>
                        <Upload size={20} />
                        <span className="text-xs">Click to upload image</span>
                        <span className="text-[10px] text-gray-600">
                          Max 1 MB
                        </span>
                      </>
                    )}
                  </button>
                )}

                <input
                  ref={categoryFileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleCategoryFileChange}
                />

                {categoryImageUploadError && (
                  <p className="mt-1.5 text-xs text-red-400">
                    {categoryImageUploadError}
                  </p>
                )}
              </div>

              {categorySubmitError && (
                <div className="flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2.5">
                  <AlertCircle
                    size={14}
                    className="mt-0.5 shrink-0 text-red-400"
                  />
                  <p className="text-xs text-red-300">{categorySubmitError}</p>
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={closeCategoryModal}
                  disabled={categoryImageUploading}
                  className="h-10 flex-1 rounded-lg border border-white/10 bg-white/5 text-sm font-semibold text-gray-300 transition-colors hover:bg-white/10 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={categorySubmitting || categoryImageUploading}
                  className="h-10 flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-[#00CBCF]/30 bg-[#00CBCF]/10 text-sm font-semibold text-[#00CBCF] transition-colors hover:bg-[#00CBCF]/20 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {categorySubmitting ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : editingCategory ? (
                    "Save Changes"
                  ) : (
                    "Create Category"
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

export default GiftProductManagement;
