import React, { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  ImageIcon,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Upload,
  X,
} from "lucide-react";
import { formatNaira } from "../../utils/formatMoney.js";
import { getErrorMessage } from "../../utils/getErrorMessage.js";
import {
  getWorkingTools,
  createWorkingTool,
  updateWorkingItemDetails,
  updateWorkingItemStatus,
  uploadToolImage,
  deleteToolImage,
} from "../../Service/admin.js";

const ToolCard = ({ tool, statusLoading, statusError, onToggleStatus, onEdit }) => {
  const isActive = tool.status === "active";

  return (
    <div
      className={`rounded-xl border p-4 transition-colors ${
        isActive
          ? "border-white/10 bg-white/5"
          : "border-red-500/15 bg-red-500/5 opacity-75"
      }`}
    >
      {/* Image preview */}
      {tool.imageUrl && (
        <div className="mb-3 h-32 w-full overflow-hidden rounded-lg border border-white/10 bg-black/30">
          <img
            src={tool.imageUrl}
            alt={tool.productName}
            className="h-full w-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        </div>
      )}

      {/* Name + edit */}
      <div className="flex items-start justify-between gap-2">
        <p className="line-clamp-2 flex-1 text-sm font-semibold leading-snug text-white">
          {tool.productName}
        </p>
        <button
          type="button"
          onClick={() => onEdit(tool)}
          className="inline-flex h-7 shrink-0 items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 text-[10px] font-semibold text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
          aria-label="Edit tool"
        >
          <Pencil size={11} />
          Edit
        </button>
      </div>

      {/* Description */}
      {tool.productDescription && (
        <p className="mt-2 line-clamp-2 text-xs leading-5 text-gray-400">
          {tool.productDescription}
        </p>
      )}

      {/* Price */}
      <div className="mt-3">
        <p className="text-base font-bold text-white">
          {formatNaira(tool.sellingPrice)}
        </p>
        <p className="text-[10px] text-gray-500">Selling price</p>
      </div>

      {/* Stock counts */}
      {(tool.stockPics != null || tool.stockImg != null) && (
        <div className="mt-2 flex items-center gap-4">
          {tool.stockPics != null && (
            <div>
              <p className="text-sm font-semibold text-white">
                {tool.stockPics.toLocaleString()}
              </p>
              <p className="text-[10px] text-gray-500">Stock Pics</p>
            </div>
          )}
          {tool.stockImg != null && (
            <div>
              <p className="text-sm font-semibold text-white">
                {tool.stockImg.toLocaleString()}
              </p>
              <p className="text-[10px] text-gray-500">Stock Img</p>
            </div>
          )}
        </div>
      )}

      {/* Status row */}
      <div className="mt-3 flex items-center justify-between gap-2 border-t border-white/5 pt-3">
        <span
          className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
            isActive
              ? "border-green-500/20 bg-green-500/10 text-green-400"
              : "border-white/10 bg-white/5 text-gray-500"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              isActive ? "bg-green-400" : "bg-gray-500"
            }`}
          />
          {tool.status}
        </span>
        <button
          type="button"
          disabled={statusLoading}
          onClick={() => onToggleStatus(tool)}
          className={`inline-flex h-7 shrink-0 items-center gap-1.5 rounded-lg border px-2.5 text-[10px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
            isActive
              ? "border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20"
              : "border-green-500/20 bg-green-500/10 text-green-400 hover:bg-green-500/20"
          }`}
        >
          {statusLoading ? (
            <Loader2 size={11} className="animate-spin" />
          ) : isActive ? (
            "Deactivate"
          ) : (
            "Activate"
          )}
        </button>
      </div>

      {statusError && (
        <p className="mt-2.5 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-300">
          {statusError}
        </p>
      )}
    </div>
  );
};

const EMPTY_FORM = {
  productName: "",
  productDescription: "",
  sellingPrice: "",
  stockPics: "",
  stockImg: "",
  imageUrl: "",
  imageId: "",
};

const WorkingPhoto = () => {
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [statusLoading, setStatusLoading] = useState({});
  const [statusErrors, setStatusErrors] = useState({});

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTool, setEditingTool] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Tracks the path of an image uploaded in this modal session that hasn't been saved yet
  const [stagedImagePath, setStagedImagePath] = useState(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [imageUploadError, setImageUploadError] = useState("");

  const fileInputRef = useRef(null);

  const fetchTools = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getWorkingTools();
      setTools(res.data ?? []);
    } catch (err) {
      setError(getErrorMessage(err, "Unable to fetch tools."));
      setTools([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTools();
  }, []);

  const filtered = tools.filter((t) => {
    const matchSearch =
      !search ||
      t.productName?.toLowerCase().includes(search.toLowerCase()) ||
      t.productDescription?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleToggleStatus = async (tool) => {
    const id = tool._id;
    const nextStatus = tool.status === "active" ? "inactive" : "active";
    setStatusLoading((p) => ({ ...p, [id]: true }));
    setStatusErrors((p) => ({ ...p, [id]: "" }));
    try {
      const res = await updateWorkingItemStatus(id, nextStatus);
      setTools((prev) =>
        prev.map((t) => (t._id === id ? { ...t, ...res.data } : t))
      );
    } catch (err) {
      setStatusErrors((p) => ({
        ...p,
        [id]: getErrorMessage(err, "Unable to update status."),
      }));
    } finally {
      setStatusLoading((p) => ({ ...p, [id]: false }));
    }
  };

  const openCreate = () => {
    setEditingTool(null);
    setForm(EMPTY_FORM);
    setFormErrors({});
    setSubmitError("");
    setStagedImagePath(null);
    setImageUploadError("");
    setModalOpen(true);
  };

  const openEdit = (tool) => {
    setEditingTool(tool);
    setForm({
      productName: tool.productName ?? "",
      productDescription: tool.productDescription ?? "",
      sellingPrice: String(tool.sellingPrice ?? ""),
      stockPics: tool.stockPics != null ? String(tool.stockPics) : "",
      stockImg: tool.stockImg != null ? String(tool.stockImg) : "",
      imageUrl: tool.imageUrl ?? "",
      imageId: tool.imageId ?? "",
    });
    setFormErrors({});
    setSubmitError("");
    setStagedImagePath(null);
    setImageUploadError("");
    setModalOpen(true);
  };

  const cleanupStagedImage = async (path) => {
    if (!path) return;
    try {
      await deleteToolImage(path);
    } catch {
      // best-effort cleanup
    }
  };

  const closeModal = async () => {
    // Delete any image uploaded this session that wasn't saved
    if (stagedImagePath) {
      await cleanupStagedImage(stagedImagePath);
    }
    setModalOpen(false);
    setEditingTool(null);
    setStagedImagePath(null);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset the input so the same file can be re-selected if needed
    if (fileInputRef.current) fileInputRef.current.value = "";

    setImageUploadError("");
    setImageUploading(true);

    // Delete the previously staged image from this session before uploading a new one
    if (stagedImagePath) {
      await cleanupStagedImage(stagedImagePath);
      setStagedImagePath(null);
    }

    try {
      const res = await uploadToolImage(file);
      const { url, path } = res.data;
      setStagedImagePath(path);
      setForm((p) => ({ ...p, imageUrl: url, imageId: path }));
      setFormErrors((p) => ({ ...p, imageUrl: undefined, imageId: undefined }));
    } catch (err) {
      setImageUploadError(getErrorMessage(err, "Image upload failed."));
    } finally {
      setImageUploading(false);
    }
  };

  const handleRemoveImage = async () => {
    if (stagedImagePath) {
      await cleanupStagedImage(stagedImagePath);
      setStagedImagePath(null);
    }
    setForm((p) => ({ ...p, imageUrl: "", imageId: "" }));
    setImageUploadError("");
  };

  const isNonNegativeInt = (val) =>
    val === "" ||
    (!isNaN(Number(val)) && Number.isInteger(Number(val)) && Number(val) >= 0);

  const validateForm = () => {
    const errs = {};
    if (!form.productName.trim()) errs.productName = "Name is required.";
    if (
      form.sellingPrice === "" ||
      isNaN(Number(form.sellingPrice)) ||
      Number(form.sellingPrice) < 0
    )
      errs.sellingPrice = "Valid non-negative price is required.";
    if (!isNonNegativeInt(form.stockPics))
      errs.stockPics = "Must be a non-negative whole number.";
    if (!isNonNegativeInt(form.stockImg))
      errs.stockImg = "Must be a non-negative whole number.";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validateForm();
    if (Object.keys(errs).length) {
      setFormErrors(errs);
      return;
    }
    setFormErrors({});
    setSubmitError("");
    setSubmitting(true);
    try {
      const payload = {
        productName: form.productName.trim(),
        sellingPrice: Number(form.sellingPrice),
        ...(form.productDescription.trim()
          ? { productDescription: form.productDescription.trim() }
          : {}),
        ...(form.stockPics !== "" ? { stockPics: Number(form.stockPics) } : {}),
        ...(form.stockImg !== "" ? { stockImg: Number(form.stockImg) } : {}),
        ...(form.imageUrl ? { imageUrl: form.imageUrl } : {}),
        ...(form.imageId ? { imageId: form.imageId } : {}),
      };
      if (editingTool) {
        const res = await updateWorkingItemDetails(editingTool._id, payload);
        setTools((prev) =>
          prev.map((t) => (t._id === editingTool._id ? { ...t, ...res.data } : t))
        );
      } else {
        const res = await createWorkingTool(payload);
        setTools((prev) => [res.data, ...prev]);
      }
      // Saved — the staged image is now committed, so don't delete it on close
      setStagedImagePath(null);
      setModalOpen(false);
      setEditingTool(null);
    } catch (err) {
      const serverErrors = err?.response?.data?.error;
      if (serverErrors && typeof serverErrors === "object") {
        setFormErrors(serverErrors);
      } else {
        setSubmitError(getErrorMessage(err, "Something went wrong."));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 py-2">
      {/* Page header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-green-500/20 bg-green-500/10">
            <ImageIcon size={18} className="text-green-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Working Tools</h1>
            <p className="mt-1 text-sm text-gray-400">
              Manage tool products — create, update pricing, track stock, and
              control availability for users.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-xl border border-green-500/30 bg-green-500/10 px-4 text-xs font-semibold text-green-400 transition-colors hover:bg-green-500/20"
        >
          <Plus size={14} />
          New Tool
        </button>
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative min-w-48 flex-1">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tools…"
              className="h-9 w-full rounded-lg border border-white/10 bg-white/5 pl-8 pr-3 text-sm text-white outline-none transition-colors placeholder:text-gray-500 focus:border-green-500/60 focus:bg-black/30"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-gray-300 outline-none transition-colors focus:border-green-500/60"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <button
            type="button"
            onClick={fetchTools}
            disabled={loading}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 text-xs font-semibold text-gray-200 transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center gap-2.5 rounded-xl border border-white/10 bg-black/20 p-10 text-sm text-gray-300">
          <Loader2 size={18} className="animate-spin text-green-400" />
          Loading tools…
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="flex items-start gap-2.5 rounded-xl border border-red-500/20 bg-red-500/10 p-4">
          <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-400" />
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {/* Content */}
      {!loading && !error && (
        <>
          {filtered.length > 0 && (
            <p className="text-xs text-gray-400">
              Showing{" "}
              <span className="font-semibold text-white">{filtered.length}</span>
              {filtered.length !== tools.length && (
                <>
                  {" "}of{" "}
                  <span className="font-semibold text-white">{tools.length}</span>
                </>
              )}{" "}
              tool{tools.length !== 1 ? "s" : ""}
            </p>
          )}

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-10 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                <ImageIcon size={18} className="text-gray-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">
                  {search || statusFilter
                    ? "No tools match your filters"
                    : "No tools yet"}
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  {search || statusFilter
                    ? "Try adjusting your search or filters."
                    : 'Click "New Tool" to create the first one.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {filtered.map((tool) => (
                <ToolCard
                  key={tool._id}
                  tool={tool}
                  statusLoading={!!statusLoading[tool._id]}
                  statusError={statusErrors[tool._id] ?? ""}
                  onToggleStatus={handleToggleStatus}
                  onEdit={openEdit}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0d0d0d] p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-green-500/20 bg-green-500/10">
                  <ImageIcon size={15} className="text-green-400" />
                </div>
                <h2 className="text-base font-semibold text-white">
                  {editingTool ? "Edit Tool" : "New Tool"}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeModal}
                disabled={imageUploading}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-gray-400 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50"
              >
                <X size={14} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              {/* productName */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-400">
                  Product Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.productName}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, productName: e.target.value }))
                  }
                  placeholder="e.g. Hacking Tool Pro"
                  className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white outline-none transition-colors placeholder:text-gray-600 focus:border-green-500/60 focus:bg-black/30"
                />
                {formErrors.productName && (
                  <p className="mt-1 text-xs text-red-400">
                    {formErrors.productName}
                  </p>
                )}
              </div>

              {/* productDescription */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-400">
                  Description
                </label>
                <textarea
                  value={form.productDescription}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      productDescription: e.target.value,
                    }))
                  }
                  placeholder="Optional description…"
                  rows={3}
                  className="w-full resize-none rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none transition-colors placeholder:text-gray-600 focus:border-green-500/60 focus:bg-black/30"
                />
              </div>

              {/* sellingPrice */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-400">
                  Selling Price (NGN) <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.sellingPrice}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, sellingPrice: e.target.value }))
                  }
                  placeholder="0.00"
                  className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white outline-none transition-colors placeholder:text-gray-600 focus:border-green-500/60 focus:bg-black/30"
                />
                {formErrors.sellingPrice && (
                  <p className="mt-1 text-xs text-red-400">
                    {formErrors.sellingPrice}
                  </p>
                )}
              </div>

              {/* Stock row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-400">
                    Stock Pics
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={form.stockPics}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, stockPics: e.target.value }))
                    }
                    placeholder="0"
                    className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white outline-none transition-colors placeholder:text-gray-600 focus:border-green-500/60 focus:bg-black/30"
                  />
                  {formErrors.stockPics && (
                    <p className="mt-1 text-xs text-red-400">
                      {formErrors.stockPics}
                    </p>
                  )}
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-400">
                    Stock Img
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={form.stockImg}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, stockImg: e.target.value }))
                    }
                    placeholder="0"
                    className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white outline-none transition-colors placeholder:text-gray-600 focus:border-green-500/60 focus:bg-black/30"
                  />
                  {formErrors.stockImg && (
                    <p className="mt-1 text-xs text-red-400">
                      {formErrors.stockImg}
                    </p>
                  )}
                </div>
              </div>

              {/* Image upload */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-400">
                  Product Image
                </label>

                {form.imageUrl ? (
                  /* Preview with replace/remove controls */
                  <div className="relative overflow-hidden rounded-lg border border-white/10 bg-black/30">
                    <img
                      src={form.imageUrl}
                      alt="Preview"
                      className="h-36 w-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-end gap-2 bg-gradient-to-t from-black/70 to-transparent p-3">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={imageUploading}
                        className="inline-flex h-7 items-center gap-1.5 rounded-lg border border-white/20 bg-white/10 px-2.5 text-[10px] font-semibold text-white transition-colors hover:bg-white/20 disabled:opacity-50"
                      >
                        {imageUploading ? (
                          <Loader2 size={10} className="animate-spin" />
                        ) : (
                          <Upload size={10} />
                        )}
                        {imageUploading ? "Uploading…" : "Replace"}
                      </button>
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        disabled={imageUploading}
                        className="inline-flex h-7 items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/20 px-2.5 text-[10px] font-semibold text-red-300 transition-colors hover:bg-red-500/30 disabled:opacity-50"
                      >
                        <X size={10} />
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Upload drop zone */
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={imageUploading}
                    className="flex h-24 w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-white/20 bg-white/5 text-gray-400 transition-colors hover:border-green-500/40 hover:bg-green-500/5 hover:text-green-400 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {imageUploading ? (
                      <>
                        <Loader2 size={20} className="animate-spin text-green-400" />
                        <span className="text-xs">Uploading…</span>
                      </>
                    ) : (
                      <>
                        <Upload size={20} />
                        <span className="text-xs">Click to upload image</span>
                        <span className="text-[10px] text-gray-600">Max 1 MB</span>
                      </>
                    )}
                  </button>
                )}

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />

                {imageUploadError && (
                  <p className="mt-1.5 text-xs text-red-400">{imageUploadError}</p>
                )}
              </div>

              {/* Submit error */}
              {submitError && (
                <div className="flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2.5">
                  <AlertCircle size={14} className="mt-0.5 shrink-0 text-red-400" />
                  <p className="text-xs text-red-300">{submitError}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={imageUploading}
                  className="h-10 flex-1 rounded-lg border border-white/10 bg-white/5 text-sm font-semibold text-gray-300 transition-colors hover:bg-white/10 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || imageUploading}
                  className="h-10 flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 text-sm font-semibold text-green-400 transition-colors hover:bg-green-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : editingTool ? (
                    "Save Changes"
                  ) : (
                    "Create Tool"
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

export default WorkingPhoto;
