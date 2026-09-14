import { useEffect, useMemo, useState } from "react";
import {
  Loader2,
  Plus,
  Trash2,
  RefreshCw,
  Eye,
  ShieldCheck,
  X,
  Save,
} from "lucide-react";
import { getLogs, deleteLog, createLog, getLogById, updateLog } from "../../Service/logs";

const emptyForm = {
  email: "",
  password: "",
  price: "",
  country: "",
  category: "",
};

const AdminLogsManagement = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState(emptyForm);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalSaving, setModalSaving] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [editForm, setEditForm] = useState(emptyForm);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getLogs();
      setLogs(response?.logs || []);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Unable to load logs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const totalValue = useMemo(
    () => logs.reduce((sum, log) => sum + Number(log.price || 0), 0),
    [logs]
  );

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleEditChange = (event) => {
    const { name, value } = event.target;
    setEditForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setSubmitting(true);
      setError("");
      setSuccess("");
      await createLog({
        ...form,
        price: Number(form.price),
      });
      setForm(emptyForm);
      setSuccess("Log added successfully.");
      await fetchLogs();
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Unable to add log.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setError("");
      await deleteLog(id);
      setSuccess("Log removed successfully.");
      await fetchLogs();
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Unable to delete log.");
    }
  };

  const openModal = async (id) => {
    setModalOpen(true);
    setModalLoading(true);
    setError("");
    try {
      const response = await getLogById(id);
      const log = response?.data || response;
      setSelectedLog(log);
      setEditForm({
        email: log?.email || "",
        password: log?.password || "",
        price: log?.price ?? "",
        country: log?.country || "",
        category: log?.category || "",
      });
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Unable to load log.");
      setModalOpen(false);
    } finally {
      setModalLoading(false);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedLog(null);
    setEditForm(emptyForm);
  };

  const handleSaveEdit = async () => {
    if (!selectedLog?._id) return;
    try {
      setModalSaving(true);
      setError("");
      setSuccess("");
      await updateLog(selectedLog._id, {
        ...editForm,
        price: Number(editForm.price),
      });
      setSuccess("Log updated successfully.");
      closeModal();
      await fetchLogs();
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Unable to update log.");
    } finally {
      setModalSaving(false);
    }
  };

  return (
    <div className="space-y-6 p-4 lg:p-6">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-emerald-400">
              Admin panel
            </p>
            <h1 className="mt-2 text-3xl font-bold text-white">Log inventory</h1>
          </div>
          <button
            type="button"
            onClick={fetchLogs}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white hover:bg-white/10"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-[#111827]/70 p-4">
          <p className="text-sm text-slate-400">Available logs</p>
          <p className="mt-2 text-2xl font-bold text-white">{logs.length}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#111827]/70 p-4">
          <p className="text-sm text-slate-400">Total value</p>
          <p className="mt-2 text-2xl font-bold text-emerald-400">
            ₦ {totalValue.toFixed(2)}
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#111827]/70 p-4">
          <p className="text-sm text-slate-400">Protection</p>
          <p className="mt-2 inline-flex items-center gap-2 text-lg font-semibold text-sky-400">
            <ShieldCheck className="h-5 w-5" />
            Production ready
          </p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-white/10 bg-[#111827]/70 p-5"
        >
          <div className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
            <Plus className="h-5 w-5 text-emerald-400" />
            Add a new log
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm text-slate-300">Email</label>
              <input
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-white outline-none focus:border-emerald-400"
                placeholder="user@example.com"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-slate-300">Password</label>
              <input
                name="password"
                type="text"
                value={form.password}
                onChange={handleChange}
                className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-white outline-none focus:border-emerald-400"
                placeholder="any password length"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm text-slate-300">Price</label>
                <input
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-white outline-none focus:border-emerald-400"
                  placeholder="49.99"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-slate-300">Country</label>
                <input
                  name="country"
                  value={form.country}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-white outline-none focus:border-emerald-400"
                  placeholder="US"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm text-slate-300">Category</label>
              <input
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-white outline-none focus:border-emerald-400"
                placeholder="Social, Gmail, Banking"
              />
            </div>

            {error && <p className="text-sm text-red-400">{String(error)}</p>}
            {success && <p className="text-sm text-emerald-400">{String(success)}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 font-medium text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              {submitting ? "Saving..." : "Add log"}
            </button>
          </div>
        </form>

        <div className="rounded-3xl border border-white/10 bg-[#111827]/70 p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Available logs</h2>
            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-300">
              {logs.length} records
            </span>
          </div>

          {loading ? (
            <div className="flex min-h-56 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-emerald-400" />
            </div>
          ) : logs.length === 0 ? (
            <div className="flex min-h-56 items-center justify-center rounded-2xl border border-dashed border-white/10 text-slate-400">
              No logs available.
            </div>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => (
                <div
                  key={log._id}
                  className="rounded-2xl border border-white/10 bg-black/20 p-4"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-base font-semibold text-white">
                        {log.email}
                      </p>
                      <div className="mt-1 flex flex-wrap gap-2 text-xs text-slate-400">
                        <span>{log.country}</span>
                        <span>•</span>
                        <span>{log.category}</span>
                        <span>•</span>
                        <span>{new Date(log.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-sm font-medium text-emerald-300">
                        ₦ {Number(log.price || 0).toFixed(2)}
                      </span>
                      <button
                        type="button"
                        onClick={() => openModal(log._id)}
                        className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 p-2 text-slate-300 hover:bg-white/10"
                        title="View / edit details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(log._id)}
                        className="inline-flex items-center gap-1 rounded-lg border border-red-500/30 bg-red-500/10 p-2 text-red-300 hover:bg-red-500/20"
                        title="Delete log"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ---------- MODAL ---------- */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/10 bg-[#0f172a] p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-white">
                Log details {selectedLog?.sold ? "(Sold)" : ""}
              </h3>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg border border-white/10 bg-white/5 p-2 text-slate-300 hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {modalLoading ? (
              <div className="flex min-h-40 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-emerald-400" />
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm text-slate-300">Email</label>
                  <input
                    name="email"
                    value={editForm.email}
                    onChange={handleEditChange}
                    disabled={selectedLog?.sold}
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-white outline-none focus:border-emerald-400 disabled:opacity-60"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm text-slate-300">
                    Password (full)
                  </label>
                  <input
                    name="password"
                    value={editForm.password}
                    onChange={handleEditChange}
                    disabled={selectedLog?.sold}
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-white outline-none focus:border-emerald-400 disabled:opacity-60"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm text-slate-300">Price</label>
                    <input
                      name="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={editForm.price}
                      onChange={handleEditChange}
                      disabled={selectedLog?.sold}
                      className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-white outline-none focus:border-emerald-400 disabled:opacity-60"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm text-slate-300">Country</label>
                    <input
                      name="country"
                      value={editForm.country}
                      onChange={handleEditChange}
                      disabled={selectedLog?.sold}
                      className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-white outline-none focus:border-emerald-400 disabled:opacity-60"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm text-slate-300">Category</label>
                  <input
                    name="category"
                    value={editForm.category}
                    onChange={handleEditChange}
                    disabled={selectedLog?.sold}
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-white outline-none focus:border-emerald-400 disabled:opacity-60"
                  />
                </div>

                {selectedLog?.sold && (
                  <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-300">
                    This log has been sold and cannot be edited.
                  </p>
                )}

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white hover:bg-white/10"
                  >
                    Close
                  </button>
                  {!selectedLog?.sold && (
                    <button
                      type="button"
                      onClick={handleSaveEdit}
                      disabled={modalSaving}
                      className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-medium text-slate-950 hover:bg-emerald-400 disabled:opacity-60"
                    >
                      {modalSaving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      {modalSaving ? "Saving..." : "Save changes"}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLogsManagement;