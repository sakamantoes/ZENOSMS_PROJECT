import React, { useEffect, useState } from "react";
import {
  AlertCircle,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Truck,
  X,
} from "lucide-react";
import { formatNaira } from "../../utils/formatMoney.js";
import { getErrorMessage } from "../../utils/getErrorMessage.js";
import {
  getDeliveryRates,
  createDeliveryRate,
  updateDeliveryRate,
  deleteDeliveryRate,
} from "../../Service/admin.js";

const EMPTY_FORM = {
  country: "",
  countryCode: "",
  deliveryFee: "",
  estimatedDeliveryDays: "",
  isActive: true,
};

const DeliveryRateSettings = () => {
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  const [statusLoading, setStatusLoading] = useState({});
  const [confirmingDeleteId, setConfirmingDeleteId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingRate, setEditingRate] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const fetchRates = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getDeliveryRates({ page, limit: 20, search });
      setRates(res.data ?? []);
      setPagination(
        res.pagination ?? { page: 1, limit: 20, total: 0, totalPages: 0 },
      );
    } catch (err) {
      setError(getErrorMessage(err, "Unable to fetch delivery rates."));
      setRates([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchRates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search]);

  const openCreate = () => {
    setEditingRate(null);
    setForm(EMPTY_FORM);
    setFormErrors({});
    setSubmitError("");
    setModalOpen(true);
  };

  const openEdit = (rate) => {
    setEditingRate(rate);
    setForm({
      country: rate.country ?? "",
      countryCode: rate.countryCode ?? "",
      deliveryFee: String(rate.deliveryFee ?? ""),
      estimatedDeliveryDays: String(rate.estimatedDeliveryDays ?? ""),
      isActive: rate.isActive ?? true,
    });
    setFormErrors({});
    setSubmitError("");
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingRate(null);
  };

  const validateForm = () => {
    const errs = {};
    if (!form.country.trim()) errs.country = "Country is required.";
    if (!/^[A-Za-z]{2}$/.test(form.countryCode.trim()))
      errs.countryCode = "Country code must be exactly 2 letters.";
    if (
      form.deliveryFee === "" ||
      isNaN(Number(form.deliveryFee)) ||
      Number(form.deliveryFee) < 0
    )
      errs.deliveryFee = "Valid non-negative fee is required.";
    if (
      form.estimatedDeliveryDays === "" ||
      !Number.isInteger(Number(form.estimatedDeliveryDays)) ||
      Number(form.estimatedDeliveryDays) < 1
    )
      errs.estimatedDeliveryDays = "Must be a whole number of at least 1.";
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
        country: form.country.trim(),
        countryCode: form.countryCode.trim().toUpperCase(),
        deliveryFee: Number(form.deliveryFee),
        estimatedDeliveryDays: Number(form.estimatedDeliveryDays),
        isActive: form.isActive,
      };
      if (editingRate) {
        await updateDeliveryRate(editingRate._id, payload);
      } else {
        await createDeliveryRate(payload);
      }
      setModalOpen(false);
      setEditingRate(null);
      fetchRates();
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

  const handleToggleStatus = async (rate) => {
    const id = rate._id;
    setStatusLoading((prev) => ({ ...prev, [id]: true }));
    try {
      await updateDeliveryRate(id, { isActive: !rate.isActive });
      setRates((prev) =>
        prev.map((r) => (r._id === id ? { ...r, isActive: !r.isActive } : r)),
      );
    } catch (err) {
      setError(getErrorMessage(err, "Unable to update status."));
    } finally {
      setStatusLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleDelete = async (id) => {
    if (confirmingDeleteId !== id) {
      setConfirmingDeleteId(id);
      return;
    }
    setDeletingId(id);
    try {
      await deleteDeliveryRate(id);
      setRates((prev) => prev.filter((r) => r._id !== id));
      setConfirmingDeleteId(null);
    } catch (err) {
      setError(getErrorMessage(err, "Unable to delete delivery rate."));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6 py-2">
      {/* Page header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#07cf00]/20 bg-[#07cf00]/10">
            <Truck size={18} className="text-[#07cf00]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">
              Delivery Rate Settings
            </h1>
            <p className="mt-1 text-sm text-gray-400">
               Manage per-country delivery fees and estimated delivery times.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-xl border border-[#07cf00]/30 bg-[#07cf00]/10 px-4 text-xs font-semibold text-[#07cf00] transition-colors hover:bg-[#07cf00]/20"
        >
          <Plus size={14} />
          New Rate
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
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
              placeholder="Search by country or code…"
              className="h-9 w-full rounded-lg border border-white/10 bg-white/5 pl-8 pr-3 text-sm text-white outline-none transition-colors placeholder:text-gray-500 focus:border-[#07cf00]/60 focus:bg-black/30"
            />
          </div>
          <button
            type="button"
            onClick={fetchRates}
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
          <Loader2 size={18} className="animate-spin text-[#07cf00]" />
          Loading delivery rates…
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="flex items-start gap-2.5 rounded-xl border border-red-500/20 bg-red-500/10 p-4">
          <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-400" />
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {/* Table */}
      {!loading && !error && (
        <>
          {rates.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-10 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                <Truck size={18} className="text-gray-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">
                  {search
                    ? "No delivery rates match your search"
                    : "No delivery rates yet"}
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  {search
                    ? "Try adjusting your search."
                    : 'Click "New Rate" to create the first one.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-white/5 bg-white/5">
                    <tr>
                      <th className="p-4 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                        Country
                      </th>
                      <th className="p-4 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                        Code
                      </th>
                      <th className="p-4 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                        Delivery Fee
                      </th>
                      <th className="p-4 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                        Est. Days
                      </th>
                      <th className="p-4 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                        Status
                      </th>
                      <th className="p-4 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {rates.map((rate) => (
                      <tr
                        key={rate._id}
                        className="transition-colors hover:bg-white/5"
                      >
                        <td className="p-4 text-sm font-medium text-white">
                          {rate.country}
                        </td>
                        <td className="p-4 text-sm text-gray-300">
                          {rate.countryCode}
                        </td>
                        <td className="p-4 text-sm text-gray-300">
                          {formatNaira(rate.deliveryFee)}
                        </td>
                        <td className="p-4 text-sm text-gray-300">
                          {rate.estimatedDeliveryDays} day
                          {rate.estimatedDeliveryDays !== 1 ? "s" : ""}
                        </td>
                        <td className="p-4">
                          <button
                            type="button"
                            disabled={!!statusLoading[rate._id]}
                            onClick={() => handleToggleStatus(rate)}
                            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                              rate.isActive
                                ? "border-[#07cf00]/20 bg-[#07cf00]/10 text-[#07cf00] hover:bg-[#07cf00]/20"
                                : "border-white/10 bg-white/5 text-gray-500 hover:bg-white/10"
                            }`}
                          >
                            {statusLoading[rate._id] ? (
                              <Loader2 size={10} className="animate-spin" />
                            ) : (
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${
                                  rate.isActive
                                    ? "bg-[#07cf00]"
                                    : "bg-gray-500"
                                }`}
                              />
                            )}
                            {rate.isActive ? "Active" : "Inactive"}
                          </button>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => openEdit(rate)}
                              className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
                              aria-label="Edit rate"
                            >
                              <Pencil size={12} />
                            </button>
                            <button
                              type="button"
                              disabled={deletingId === rate._id}
                              onClick={() => handleDelete(rate._id)}
                              onBlur={() => setConfirmingDeleteId(null)}
                              className={`inline-flex h-7 items-center gap-1 rounded-lg border px-2 text-[10px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                                confirmingDeleteId === rate._id
                                  ? "border-red-500/40 bg-red-500/20 text-red-300"
                                  : "border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20"
                              }`}
                            >
                              {deletingId === rate._id ? (
                                <Loader2 size={12} className="animate-spin" />
                              ) : (
                                <Trash2 size={12} />
                              )}
                              {confirmingDeleteId === rate._id
                                ? "Confirm?"
                                : ""}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 pt-3">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="inline-flex h-8 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 text-xs font-semibold text-gray-200 transition-all hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>
              <span className="px-2 text-xs text-gray-400">
                Page{" "}
                <span className="font-semibold text-white">
                  {pagination.page}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-white">
                  {pagination.totalPages}
                </span>
              </span>
              <button
                type="button"
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="inline-flex h-8 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 text-xs font-semibold text-gray-200 transition-all hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Create/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-white/10 bg-[#0d0d0d] p-6 shadow-2xl">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#07cf00]/20 bg-[#07cf00]/10">
                  <Truck size={15} className="text-[#07cf00]" />
                </div>
                <h2 className="text-base font-semibold text-white">
                  {editingRate ? "Edit Delivery Rate" : "New Delivery Rate"}
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
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-400">
                  Country <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.country}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, country: e.target.value }))
                  }
                  placeholder="e.g. Nigeria"
                  className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white outline-none transition-colors placeholder:text-gray-600 focus:border-[#07cf00]/60 focus:bg-black/30"
                />
                {formErrors.country && (
                  <p className="mt-1 text-xs text-red-400">
                    {formErrors.country}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-400">
                  Country Code <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.countryCode}
                  maxLength={2}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      countryCode: e.target.value.toUpperCase(),
                    }))
                  }
                  placeholder="e.g. NG"
                  className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm uppercase text-white outline-none transition-colors placeholder:text-gray-600 placeholder:normal-case focus:border-[#07cf00]/60 focus:bg-black/30"
                />
                {formErrors.countryCode && (
                  <p className="mt-1 text-xs text-red-400">
                    {formErrors.countryCode}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-400">
                    Delivery Fee (NGN) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.deliveryFee}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, deliveryFee: e.target.value }))
                    }
                    placeholder="0.00"
                    className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white outline-none transition-colors placeholder:text-gray-600 focus:border-[#07cf00]/60 focus:bg-black/30"
                  />
                  {formErrors.deliveryFee && (
                    <p className="mt-1 text-xs text-red-400">
                      {formErrors.deliveryFee}
                    </p>
                  )}
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-400">
                    Est. Days <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={form.estimatedDeliveryDays}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        estimatedDeliveryDays: e.target.value,
                      }))
                    }
                    placeholder="e.g. 3"
                    className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white outline-none transition-colors placeholder:text-gray-600 focus:border-[#07cf00]/60 focus:bg-black/30"
                  />
                  {formErrors.estimatedDeliveryDays && (
                    <p className="mt-1 text-xs text-red-400">
                      {formErrors.estimatedDeliveryDays}
                    </p>
                  )}
                </div>
              </div>

              <label className="flex items-center gap-2.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, isActive: e.target.checked }))
                  }
                  className="h-4 w-4 rounded border-white/20 bg-white/5 text-[#07cf00] focus:ring-[#07cf00]/60"
                />
                <span className="text-sm text-gray-300">
                  Active (visible to users at checkout)
                </span>
              </label>

              {submitError && (
                <div className="flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2.5">
                  <AlertCircle
                    size={14}
                    className="mt-0.5 shrink-0 text-red-400"
                  />
                  <p className="text-xs text-red-300">{submitError}</p>
                </div>
              )}

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
                  className="h-10 flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-[#07cf00]/30 bg-[#07cf00]/10 text-sm font-semibold text-[#07cf00] transition-colors hover:bg-[#07cf00]/20 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : editingRate ? (
                    "Save Changes"
                  ) : (
                    "Create Rate"
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

export default DeliveryRateSettings;