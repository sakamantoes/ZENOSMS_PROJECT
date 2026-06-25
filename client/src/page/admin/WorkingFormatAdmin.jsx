import React, { useEffect, useState } from "react";
import {
  AlertCircle,
  FileText,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import { formatNaira } from "../../utils/formatMoney.js";
import { getErrorMessage } from "../../utils/getErrorMessage.js";
import {
  getWorkingFormats,
  createWorkingFormat,
  updateWorkingItemDetails,
  updateWorkingItemStatus,
} from "../../Service/admin.js";

const FormatCard = ({ format, statusLoading, statusError, onToggleStatus, onEdit }) => {
  const isActive = format.status === "active";

  return (
    <div
      className={`rounded-xl border p-4 transition-colors ${
        isActive
          ? "border-white/10 bg-white/5"
          : "border-red-500/15 bg-red-500/5 opacity-75"
      }`}
    >
      {/* Name + edit */}
      <div className="flex items-start justify-between gap-2">
        <p className="line-clamp-2 flex-1 text-sm font-semibold leading-snug text-white">
          {format.productName}
        </p>
        <button
          type="button"
          onClick={() => onEdit(format)}
          className="inline-flex h-7 shrink-0 items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 text-[10px] font-semibold text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
          aria-label="Edit format"
        >
          <Pencil size={11} />
          Edit
        </button>
      </div>

      {/* Description */}
      {format.productDescription && (
        <p className="mt-2 line-clamp-2 text-xs leading-5 text-gray-400">
          {format.productDescription}
        </p>
      )}

      {/* Price */}
      <div className="mt-3">
        <p className="text-base font-bold text-white">
          {formatNaira(format.sellingPrice)}
        </p>
        <p className="text-[10px] text-gray-500">Selling price</p>
      </div>

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
          {format.status}
        </span>
        <button
          type="button"
          disabled={statusLoading}
          onClick={() => onToggleStatus(format)}
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

const EMPTY_FORM = { productName: "", productDescription: "", sellingPrice: "" };

const WorkingFormatAdmin = () => {
  const [formats, setFormats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [statusLoading, setStatusLoading] = useState({});
  const [statusErrors, setStatusErrors] = useState({});

  const [modalOpen, setModalOpen] = useState(false);
  const [editingFormat, setEditingFormat] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const fetchFormats = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getWorkingFormats();
      setFormats(res.data ?? []);
    } catch (err) {
      setError(getErrorMessage(err, "Unable to fetch formats."));
      setFormats([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFormats();
  }, []);

  const filtered = formats.filter((f) => {
    const matchSearch =
      !search ||
      f.productName?.toLowerCase().includes(search.toLowerCase()) ||
      f.productDescription?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || f.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleToggleStatus = async (format) => {
    const id = format._id;
    const nextStatus = format.status === "active" ? "inactive" : "active";
    setStatusLoading((p) => ({ ...p, [id]: true }));
    setStatusErrors((p) => ({ ...p, [id]: "" }));
    try {
      const res = await updateWorkingItemStatus(id, nextStatus);
      setFormats((prev) =>
        prev.map((f) => (f._id === id ? { ...f, ...res.data } : f))
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
    setEditingFormat(null);
    setForm(EMPTY_FORM);
    setFormErrors({});
    setSubmitError("");
    setModalOpen(true);
  };

  const openEdit = (format) => {
    setEditingFormat(format);
    setForm({
      productName: format.productName ?? "",
      productDescription: format.productDescription ?? "",
      sellingPrice: String(format.sellingPrice ?? ""),
    });
    setFormErrors({});
    setSubmitError("");
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingFormat(null);
  };

  const validateForm = () => {
    const errs = {};
    if (!form.productName.trim()) errs.productName = "Name is required.";
    if (
      form.sellingPrice === "" ||
      isNaN(Number(form.sellingPrice)) ||
      Number(form.sellingPrice) < 0
    )
      errs.sellingPrice = "Valid non-negative price is required.";
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
      };
      if (editingFormat) {
        const res = await updateWorkingItemDetails(editingFormat._id, payload);
        setFormats((prev) =>
          prev.map((f) => (f._id === editingFormat._id ? { ...f, ...res.data } : f))
        );
      } else {
        const res = await createWorkingFormat(payload);
        setFormats((prev) => [res.data, ...prev]);
      }
      closeModal();
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
            <FileText size={18} className="text-green-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Working Formats</h1>
            <p className="mt-1 text-sm text-gray-400">
              Manage format products — create, update pricing, and control
              availability for users.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-xl border border-green-500/30 bg-green-500/10 px-4 text-xs font-semibold text-green-400 transition-colors hover:bg-green-500/20"
        >
          <Plus size={14} />
          New Format
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
              placeholder="Search formats…"
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
            onClick={fetchFormats}
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
          Loading formats…
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
              {filtered.length !== formats.length && (
                <>
                  {" "}of{" "}
                  <span className="font-semibold text-white">{formats.length}</span>
                </>
              )}{" "}
              format{formats.length !== 1 ? "s" : ""}
            </p>
          )}

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-10 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                <FileText size={18} className="text-gray-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">
                  {search || statusFilter
                    ? "No formats match your filters"
                    : "No formats yet"}
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  {search || statusFilter
                    ? "Try adjusting your search or filters."
                    : 'Click "New Format" to create the first one.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {filtered.map((format) => (
                <FormatCard
                  key={format._id}
                  format={format}
                  statusLoading={!!statusLoading[format._id]}
                  statusError={statusErrors[format._id] ?? ""}
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
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0d0d0d] p-6 shadow-2xl">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-green-500/20 bg-green-500/10">
                  <FileText size={15} className="text-green-400" />
                </div>
                <h2 className="text-base font-semibold text-white">
                  {editingFormat ? "Edit Format" : "New Format"}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
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
                  placeholder="e.g. Premium Email Format"
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
                  className="h-10 flex-1 rounded-lg border border-white/10 bg-white/5 text-sm font-semibold text-gray-300 transition-colors hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="h-10 flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 text-sm font-semibold text-green-400 transition-colors hover:bg-green-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : editingFormat ? (
                    "Save Changes"
                  ) : (
                    "Create Format"
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

export default WorkingFormatAdmin;
