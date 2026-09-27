import { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  RefreshCw,
  Search,
  ShoppingCart,
  Wallet,
  X,
} from "lucide-react";
import { buyActiveLog, getActivePlatformLogs } from "../../Service/logs";
import { getWalletBalance } from "../../Service/wallet";

const formatCurrency = (amount) => {
  const value = Number(amount);
  if (!Number.isFinite(value)) return "NGN 0.00";
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

const parseWalletBalance = (payload) => {
  if (payload === null || payload === undefined) return 0;
  if (typeof payload === "number")
    return Number.isFinite(payload) ? payload : 0;
  if (typeof payload === "string") {
    const value = Number(payload);
    return Number.isFinite(value) ? value : 0;
  }
  if (typeof payload === "object") {
    for (const key of ["walletBalance", "balance", "amount", "data"]) {
      if (payload[key] !== undefined && payload[key] !== null) {
        return parseWalletBalance(payload[key]);
      }
    }
  }
  return 0;
};

const DEFAULT_PAGINATION = {
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 1,
};

const UserLogsMarketplace = () => {
  const [logs, setLogs] = useState([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [pagination, setPagination] = useState(DEFAULT_PAGINATION);
  const [nameInput, setNameInput] = useState("");
  const [categoryInput, setCategoryInput] = useState("");
  const [filters, setFilters] = useState({ name: "", category: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [purchaseMessage, setPurchaseMessage] = useState("");
  const [quantities, setQuantities] = useState({});
  const [buyingLogId, setBuyingLogId] = useState("");
  const [selectedLog, setSelectedLog] = useState(null);

  const fetchLogs = async (
    page = pagination.page,
    currentFilters = filters,
  ) => {
    try {
      setLoading(true);
      setError("");
      const [logsResponse, walletResponse] = await Promise.all([
        getActivePlatformLogs({
          page,
          limit: pagination.limit,
          name: currentFilters.name,
          category: currentFilters.category,
        }),
        getWalletBalance(),
      ]);
      setLogs(logsResponse?.data ?? []);
      setPagination(
        logsResponse?.pagination ?? { ...DEFAULT_PAGINATION, page },
      );
      setWalletBalance(parseWalletBalance(walletResponse));
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          requestError?.message ||
          "Unable to load available logs.",
      );
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(1, { name: "", category: "" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submitSearch = (event) => {
    event.preventDefault();
    const nextFilters = {
      name: nameInput.trim(),
      category: categoryInput.trim(),
    };
    setFilters(nextFilters);
    setPurchaseMessage("");
    fetchLogs(1, nextFilters);
  };

  const clearSearch = () => {
    setNameInput("");
    setCategoryInput("");
    setFilters({ name: "", category: "" });
    setPurchaseMessage("");
    fetchLogs(1, { name: "", category: "" });
  };

  const goToPage = (page) => {
    if (page < 1 || page > pagination.totalPages || page === pagination.page) {
      return;
    }
    setPurchaseMessage("");
    fetchLogs(page);
  };

  const getQuantity = (log) => quantities[log._id] ?? 1;

  const updateQuantity = (log, value) => {
    const maxQuantity = Math.max(Number(log.quantity) || 1, 1);
    const nextQuantity = Math.min(
      Math.max(Number.parseInt(value, 10) || 1, 1),
      maxQuantity,
    );

    setQuantities((current) => ({
      ...current,
      [log._id]: nextQuantity,
    }));
  };

  const openPurchaseModal = (log) => {
    setError("");
    setPurchaseMessage("");
    setSelectedLog(log);
    setQuantities((current) => ({
      ...current,
      [log._id]: current[log._id] ?? 1,
    }));
  };

  const closePurchaseModal = () => {
    if (buyingLogId) return;
    setSelectedLog(null);
  };

  const handleBuy = async (log) => {
    const quantity = getQuantity(log);

    try {
      setBuyingLogId(log._id);
      setError("");
      setPurchaseMessage("");

      const response = await buyActiveLog({ logId: log._id, quantity });
      setPurchaseMessage(
        response?.message || "Purchase submitted successfully.",
      );
      setSelectedLog(null);
      await fetchLogs(pagination.page);
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          requestError?.message ||
          "Unable to complete purchase.",
      );
    } finally {
      setBuyingLogId("");
    }
  };

  return (
    <div className="space-y-6 p-4 lg:p-6">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-green-400">
              Marketplace
            </p>
            <h1 className="mt-2 text-3xl font-bold text-white">
              Log marketplace
            </h1>
            <p className="mt-1 text-sm text-gray-400">
              Browse active logs priced by the platform.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-xl border border-green-500/20 bg-green-500/10 px-3 py-2 text-green-300">
            <Wallet className="h-4 w-4" />
            Wallet: {formatCurrency(walletBalance)}
          </div>
        </div>
      </div>

      <form
        onSubmit={submitSearch}
        className="rounded-2xl border border-white/10 bg-white/5 p-4"
      >
        <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto_auto]">
          <label className="relative">
            <span className="sr-only">Search by name</span>
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
            />
            <input
              value={nameInput}
              onChange={(event) => setNameInput(event.target.value)}
              placeholder="Search by name"
              className="h-10 w-full rounded-xl border border-white/10 bg-black/20 pl-9 pr-3 text-sm text-white outline-none placeholder:text-gray-500 focus:border-green-500/50"
            />
          </label>
          <label>
            <span className="sr-only">Search by category</span>
            <input
              value={categoryInput}
              onChange={(event) => setCategoryInput(event.target.value)}
              placeholder="Search by category"
              className="h-10 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-white outline-none placeholder:text-gray-500 focus:border-green-500/50"
            />
          </label>
          <button
            type="submit"
            className="h-10 rounded-xl bg-green-500 px-5 text-sm font-semibold text-black transition hover:bg-green-400"
          >
            Search
          </button>
          <button
            type="button"
            onClick={clearSearch}
            disabled={
              !nameInput && !categoryInput && !filters.name && !filters.category
            }
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-semibold text-gray-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Clear
          </button>
        </div>
      </form>

      {error && (
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {String(error)}
        </p>
      )}

      {purchaseMessage && (
        <p className="rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-300">
          {purchaseMessage}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">Available logs</h2>
          <p className="mt-1 text-xs text-gray-500">
            {pagination.total} active listing{pagination.total === 1 ? "" : "s"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => fetchLogs(pagination.page)}
          disabled={loading}
          className="inline-flex h-9 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 text-xs font-semibold text-gray-200 transition hover:bg-white/10 disabled:opacity-60"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex min-h-60 items-center justify-center rounded-3xl border border-white/10 bg-[#111827]/70">
          <Loader2 className="h-7 w-7 animate-spin text-green-400" />
        </div>
      ) : logs.length === 0 ? (
        <div className="flex min-h-60 items-center justify-center rounded-3xl border border-dashed border-white/10 bg-[#111827]/70 text-slate-400">
          No active logs found.
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {logs.map((log) => {
            const availableQuantity = Number(log.quantity) || 0;
            const isBuying = buyingLogId === log._id;
            const cannotBuy = isBuying || availableQuantity < 1;

            return (
              <article
                key={log._id}
                className="rounded-3xl border border-white/10 bg-[#111827]/70 p-5 shadow-lg"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-semibold text-white">
                      {log.name || "Unnamed listing"}
                    </h3>
                    <p className="mt-2 text-sm text-gray-400">
                      {log.category || "Uncategorized"}
                    </p>
                  </div>
                  <span className="rounded-full border border-green-500/30 bg-green-500/10 px-2.5 py-1 text-sm font-semibold text-green-300">
                    {formatCurrency(log.sellingPrice)}
                  </span>
                </div>

                <div className="mt-4 grid gap-3 text-sm text-gray-300 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                    <p className="text-gray-500">Product type</p>
                    <p className="mt-1 font-medium text-white">
                      {log.productType || "-"}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                    <p className="text-gray-500">Category</p>
                    <p className="mt-1 font-medium text-white">
                      {log.category || "-"}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                    <p className="text-gray-500">Quantity available</p>
                    <p className="mt-1 font-medium text-white">
                      {availableQuantity}
                    </p>
                  </div>
                </div>

                {log.description && (
                  <p className="mt-4 text-sm leading-relaxed text-gray-400">
                    {log.description}
                  </p>
                )}

                <div className="mt-4 flex justify-end border-t border-white/10 pt-4">
                  <div className="flex flex-col gap-2 sm:items-end">
                    <button
                      type="button"
                      onClick={() => openPurchaseModal(log)}
                      disabled={cannotBuy}
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-green-500 px-4 text-sm font-semibold text-black transition hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isBuying ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <ShoppingCart size={16} />
                      )}
                      Buy now
                    </button>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4 text-xs text-gray-500">
                  <span>Active listing</span>
                  <span>
                    Updated{" "}
                    {log.updatedAt
                      ? new Date(log.updatedAt).toLocaleDateString()
                      : "-"}
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <div className="flex items-center justify-between border-t border-white/10 pt-4">
        <button
          type="button"
          onClick={() => goToPage(pagination.page - 1)}
          disabled={pagination.page <= 1 || loading}
          className="inline-flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-gray-200 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft size={14} /> Previous
        </button>
        <span className="text-xs text-gray-500">
          Page {pagination.page} of {pagination.totalPages}
        </span>
        <button
          type="button"
          onClick={() => goToPage(pagination.page + 1)}
          disabled={pagination.page >= pagination.totalPages || loading}
          className="inline-flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-gray-200 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next <ChevronRight size={14} />
        </button>
      </div>

      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0d0d0d] p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-green-400">
                  Confirm purchase
                </p>
                <h2 className="mt-2 text-xl font-bold text-white">
                  {selectedLog.name || "Account listing"}
                </h2>
                <p className="mt-1 text-sm text-gray-400">
                  {selectedLog.category || "Uncategorized"}
                </p>
              </div>
              <button
                type="button"
                onClick={closePurchaseModal}
                disabled={Boolean(buyingLogId)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-gray-400 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
                aria-label="Close confirmation"
              >
                <X size={15} />
              </button>
            </div>

            <div className="mt-5 grid gap-3 rounded-xl border border-white/10 bg-white/5 p-4 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="text-gray-400">Unit price</span>
                <span className="font-semibold text-white">
                  {formatCurrency(selectedLog.sellingPrice)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-gray-400">Available</span>
                <span className="font-semibold text-white">
                  {Number(selectedLog.quantity) || 0}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-gray-400">Wallet balance</span>
                <span className="font-semibold text-white">
                  {formatCurrency(walletBalance)}
                </span>
              </div>
            </div>

            <label className="mt-5 block">
              <span className="text-sm font-medium text-gray-300">
                Quantity
              </span>
              <input
                type="number"
                min="1"
                max={Math.max(Number(selectedLog.quantity) || 1, 1)}
                value={getQuantity(selectedLog)}
                onChange={(event) =>
                  updateQuantity(selectedLog, event.target.value)
                }
                disabled={Boolean(buyingLogId)}
                className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-black/30 px-3 text-sm text-white outline-none focus:border-green-500/50 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </label>

            {(() => {
              const quantity = getQuantity(selectedLog);
              const totalPrice =
                (Number(selectedLog.sellingPrice) || 0) * quantity;
              const hasInsufficientFunds = totalPrice > walletBalance;

              return (
                <>
                  <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
                    <span className="text-sm text-gray-400">Total</span>
                    <span className="text-lg font-bold text-green-300">
                      {formatCurrency(totalPrice)}
                    </span>
                  </div>

                  {hasInsufficientFunds && (
                    <p className="mt-3 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-300">
                      Your wallet balance is not enough for this quantity.
                    </p>
                  )}

                  <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      onClick={closePurchaseModal}
                      disabled={Boolean(buyingLogId)}
                      className="h-10 rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-semibold text-gray-200 transition hover:bg-white/10 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleBuy(selectedLog)}
                      disabled={Boolean(buyingLogId) || hasInsufficientFunds}
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-green-500 px-4 text-sm font-semibold text-black transition hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {buyingLogId ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <ShoppingCart size={16} />
                      )}
                      Confirm purchase
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserLogsMarketplace;
