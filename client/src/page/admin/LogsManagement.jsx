import { useEffect, useState } from "react";
import { Loader2, Pencil, RefreshCw, Save, Search, X } from "lucide-react";
import { getAdminLogs, updateLogSellingPrice } from "../../Service/logs";

const formatCurrency = (amount) => {
  const value = Number(amount);
  if (!Number.isFinite(value)) return "₦0.00";
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

const AdminLogsManagement = () => {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState("");
  const [editingId, setEditingId] = useState("");
  const [priceInput, setPriceInput] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchLogs = async (page = pagination.page, currentSearch = search) => {
    try {
      setLoading(true);
      setError("");
      const response = await getAdminLogs({
        page,
        limit: pagination.limit,
        search: currentSearch,
      });
      setLogs(response?.data ?? []);
      setPagination(
        response?.pagination ?? {
          page,
          limit: pagination.limit,
          total: 0,
          totalPages: 1,
        },
      );
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Unable to load platform logs."));
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(1, "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submitSearch = (event) => {
    event.preventDefault();
    const nextSearch = searchInput.trim();
    setSearch(nextSearch);
    fetchLogs(1, nextSearch);
  };

  const clearSearch = () => {
    setSearchInput("");
    setSearch("");
    fetchLogs(1, "");
  };

  const startEditing = (log) => {
    setEditingId(log._id);
    setPriceInput(log.sellingPrice ?? "");
    setError("");
    setSuccess("");
  };

  const cancelEditing = () => {
    setEditingId("");
    setPriceInput("");
  };

  const savePrice = async (log) => {
    const price = Number(priceInput);
    if (!Number.isFinite(price) || price < 0) {
      setError("Selling price must be a valid non-negative number.");
      return;
    }

    try {
      setSavingId(log._id);
      setError("");
      setSuccess("");
      await updateLogSellingPrice(log._id, price);
      setLogs((current) =>
        current.map((item) =>
          item._id === log._id ? { ...item, sellingPrice: price } : item,
        ),
      );
      setSuccess("Selling price updated successfully.");
      cancelEditing();
    } catch (requestError) {
      setError(
        getErrorMessage(requestError, "Unable to update selling price."),
      );
    } finally {
      setSavingId("");
    }
  };

  const goToPage = (page) => {
    if (page < 1 || page > pagination.totalPages || page === pagination.page) {
      return;
    }
    fetchLogs(page);
  };

  return (
    <div className="space-y-6 py-2">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-green-400">
            Admin workspace
          </p>
          <h1 className="mt-2 text-2xl font-bold text-white">Log Management</h1>
          <p className="mt-1 text-sm text-gray-400">
            Review synced platform logs and manage their selling prices.
          </p>
        </div>
        <button
          type="button"
          onClick={() => fetchLogs(pagination.page)}
          disabled={loading}
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white transition hover:bg-white/10 disabled:opacity-60"
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      <form
        onSubmit={submitSearch}
        className="rounded-2xl border border-white/10 bg-white/5 p-4"
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
            />
            <input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search by name, category, provider, or account ID"
              className="h-10 w-full rounded-xl border border-white/10 bg-black/20 pl-9 pr-3 text-sm text-white outline-none placeholder:text-gray-500 focus:border-green-500/50"
            />
          </div>
          <button
            type="submit"
            className="h-10 rounded-xl bg-green-500 px-5 text-sm font-semibold text-black transition hover:bg-green-400"
          >
            Search
          </button>
          {search && (
            <button
              type="button"
              onClick={clearSearch}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-semibold text-gray-200 hover:bg-white/10"
            >
              <X size={14} /> Clear
            </button>
          )}
        </div>
      </form>

      {error && (
        <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      )}
      {success && (
        <p className="rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-300">
          {success}
        </p>
      )}

      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-white">Platform logs</h2>
            <p className="mt-1 text-xs text-gray-500">
              {pagination.total} total records
            </p>
          </div>
          <span className="rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-xs font-semibold text-green-300">
            Page {pagination.page} of {pagination.totalPages}
          </span>
        </div>

        {loading ? (
          <div className="flex min-h-56 items-center justify-center">
            <Loader2 className="animate-spin text-green-400" />
          </div>
        ) : logs.length === 0 ? (
          <div className="flex min-h-56 items-center justify-center rounded-xl border border-dashed border-white/10 text-sm text-gray-500">
            No platform logs found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left">
              <thead className="border-b border-white/10 text-xs uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-3 py-3 font-medium">Name</th>
                  <th className="px-3 py-3 font-medium">Description</th>
                  <th className="px-3 py-3 font-medium">Category</th>
                  <th className="px-3 py-3 font-medium">Quantity</th>
                  <th className="px-3 py-3 font-medium">Provider ID</th>
                  <th className="px-3 py-3 font-medium">Type</th>
                  <th className="px-3 py-3 font-medium">Status</th>
                  <th className="px-3 py-3 text-right font-medium">
                    Provider price
                  </th>
                  <th className="px-3 py-3 text-right font-medium">
                    Selling price
                  </th>
                  <th className="px-3 py-3 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {logs.map((log) => (
                  <tr key={log._id} className="text-sm text-gray-300">
                    <td className="px-3 py-4 font-semibold text-white">
                      {log.name || "-"}
                    </td>
                    <td className="max-w-xs px-3 py-4 text-gray-400">
                      <span className="line-clamp-2">
                        {log.description || "-"}
                      </span>
                    </td>
                    <td className="px-3 py-4">{log.category || "-"}</td>
                    <td className="px-3 py-4">{log.quantity ?? 0}</td>
                    <td className="px-3 py-4 font-mono text-xs">
                      {log.providerAccountId || "-"}
                    </td>
                    <td className="px-3 py-4">{log.productType || "-"}</td>
                    <td className="px-3 py-4">
                      <span className="rounded-full bg-green-500/10 px-2 py-1 text-xs text-green-300">
                        {log.status || "-"}
                      </span>
                    </td>
                    <td className="px-3 py-4 text-right text-gray-300">
                      {formatCurrency(log.providerPrice)}
                    </td>
                    <td className="px-3 py-4 text-right font-semibold text-green-300">
                      {editingId === log._id ? (
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={priceInput}
                          onChange={(event) =>
                            setPriceInput(event.target.value)
                          }
                          className="w-32 rounded-lg border border-green-500/40 bg-black/30 px-2 py-1.5 text-right text-sm text-white outline-none"
                          autoFocus
                        />
                      ) : (
                        formatCurrency(log.sellingPrice ?? 0)
                      )}
                    </td>
                    <td className="px-3 py-4 text-right">
                      {editingId === log._id ? (
                        <span className="inline-flex gap-2">
                          <button
                            type="button"
                            onClick={() => savePrice(log)}
                            disabled={savingId === log._id}
                            className="rounded-lg bg-green-500 p-2 text-black hover:bg-green-400 disabled:opacity-60"
                            title="Save price"
                          >
                            {savingId === log._id ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <Save size={14} />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={cancelEditing}
                            className="rounded-lg border border-white/10 bg-white/5 p-2 text-gray-300 hover:bg-white/10"
                            title="Cancel"
                          >
                            <X size={14} />
                          </button>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => startEditing(log)}
                          className="rounded-lg border border-white/10 bg-white/5 p-2 text-gray-300 hover:bg-white/10 hover:text-white"
                          title="Edit selling price"
                        >
                          <Pencil size={14} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
          <button
            type="button"
            onClick={() => goToPage(pagination.page - 1)}
            disabled={pagination.page <= 1 || loading}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-gray-200 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-xs text-gray-500">
            {pagination.total} records
          </span>
          <button
            type="button"
            onClick={() => goToPage(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages || loading}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-gray-200 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLogsManagement;
