import { useEffect, useMemo, useState } from "react";
import {
  Loader2,
  ShoppingCart,
  Wallet,
  ShieldCheck,
  CheckCircle2,
  X,
  Eye,
} from "lucide-react";
import { getLogs, buyLog, getMyPurchasedLogs, getLogById } from "../../Service/logs";
import { getWalletBalance } from "../../Service/wallet";

const parseWalletBalance = (payload) => {
  if (payload === null || payload === undefined) return 0;

  if (typeof payload === "number") {
    return Number.isFinite(payload) ? payload : 0;
  }

  if (typeof payload === "string") {
    const parsed = Number(payload);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  if (typeof payload === "object") {
    const keys = ["walletBalance", "balance", "amount", "data"];
    for (const key of keys) {
      if (payload[key] !== undefined && payload[key] !== null) {
        return parseWalletBalance(payload[key]);
      }
    }
  }

  return 0;
};

const UserLogsMarketplace = () => {
  const [logs, setLogs] = useState([]);
  const [purchased, setPurchased] = useState([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [buyingId, setBuyingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Purchased log modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [logsResponse, walletResponse, purchasedResponse] = await Promise.all([
        getLogs(),
        getWalletBalance(),
        getMyPurchasedLogs(),
      ]);

      setLogs(logsResponse?.logs || []);
      setWalletBalance(parseWalletBalance(walletResponse));
      setPurchased(purchasedResponse?.data || []);
    } catch (err) {
      setError(
        err?.response?.data?.message || err?.message || "Unable to load marketplace."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const stats = useMemo(
    () => ({
      available: logs.length,
      bought: purchased.length,
      totalValue: logs.reduce((sum, item) => sum + Number(item.price || 0), 0),
    }),
    [logs, purchased]
  );

  const handleBuy = async (id) => {
    try {
      setBuyingId(id);
      setError("");
      setSuccess("");
      const response = await buyLog(id);
      setSuccess(response?.message || "Log purchased successfully.");
      await fetchData();
    } catch (err) {
      setError(
        err?.response?.data?.message || err?.message || "Unable to purchase this log."
      );
    } finally {
      setBuyingId(null);
    }
  };

  const openPurchasedLog = async (id) => {
    setModalOpen(true);
    setModalLoading(true);
    setError("");
    try {
      const response = await getLogById(id);
      setSelectedLog(response?.data || response);
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
  };

  return (
    <div className="space-y-6 p-4 lg:p-6">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-green-400">
              Marketplace
            </p>
            <h1 className="mt-2 text-3xl font-bold text-white">Log marketplace</h1>
          </div>
          <div className="inline-flex items-center gap-2 rounded-xl border border-green-500/20 bg-green-500/10 px-3 py-2 text-green-300">
            <Wallet className="h-4 w-4" />
            Wallet: ₦ {Number(walletBalance || 0).toFixed(2)}
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-[#111827]/70 p-4">
          <p className="text-sm text-slate-400">Available logs</p>
          <p className="mt-2 text-2xl font-bold text-white">{stats.available}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#111827]/70 p-4">
          <p className="text-sm text-slate-400">Purchased</p>
          <p className="mt-2 text-2xl font-bold text-emerald-400">{stats.bought}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#111827]/70 p-4">
          <p className="text-sm text-slate-400">Market value</p>
          <p className="mt-2 text-2xl font-bold text-green-400">
            ₦{stats.totalValue.toFixed(2)}
          </p>
        </div>
      </div>

      {error && (
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {String(error)}
        </p>
      )}
      {success && (
        <p className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          {String(success)}
        </p>
      )}

      {loading ? (
        <div className="flex min-h-60 items-center justify-center rounded-3xl border border-white/10 bg-[#111827]/70">
          <Loader2 className="h-7 w-7 animate-spin text-cyan-400" />
        </div>
      ) : logs.length === 0 ? (
        <div className="flex min-h-60 items-center justify-center rounded-3xl border border-dashed border-white/10 bg-[#111827]/70 text-slate-400">
          No available logs right now.
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {logs.map((log) => {
            const price = Number(log.price || 0);
            const balance = Number(walletBalance || 0);
            const canAfford = balance >= price;
            const isBuying = buyingId === log._id;

            return (
              <div
                key={log._id}
                className="rounded-3xl border border-white/10 bg-[#111827]/70 p-5 shadow-lg"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xl font-semibold text-white">{log.email}</p>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-400">
                      <span>{log.country}</span>
                      <span>•</span>
                      <span>{log.category}</span>
                    </div>
                  </div>
                  <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-sm font-medium text-emerald-300">
                    ₦{price.toFixed(2)}
                  </span>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2 text-sm text-slate-300">
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                    <p className="text-slate-400">Masked email</p>
                    <p className="mt-1 font-medium text-white">{log.email}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                    <p className="text-slate-400">Masked password</p>
                    <p className="mt-1 font-medium text-white">{log.password}</p>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between">
                  <div className="inline-flex items-center gap-2 text-xs text-slate-400">
                    <ShieldCheck className="h-4 w-4 text-emerald-400" />
                    Verified log listing.
                  </div>
                  <button
                    type="button"
                    onClick={() => handleBuy(log._id)}
                    disabled={isBuying || !canAfford}
                    className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2.5 font-medium text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isBuying ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ShoppingCart className="h-4 w-4" />
                    )}
                    {!canAfford ? "Insufficient balance" : "Buy now"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="rounded-3xl border border-white/10 bg-[#111827]/70 p-5">
        <div className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
          <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          My purchased logs
        </div>

        {purchased.length === 0 ? (
          <p className="text-slate-400">No purchased logs yet.</p>
        ) : (
          <div className="space-y-3">
            {purchased.map((log) => (
              <div
                key={log._id}
                className="rounded-2xl border border-white/10 bg-black/20 p-4"
              >
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-medium text-white">{log.email}</p>
                    <p className="text-sm text-slate-400">
                      {log.country} • {log.category}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-sm font-medium text-emerald-300">
                      ₦{Number(log.price || 0).toFixed(2)}
                    </span>
                    <button
                      type="button"
                      onClick={() => openPurchasedLog(log._id)}
                      className="inline-flex items-center gap-2 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 text-sm text-cyan-300 hover:bg-cyan-500/20"
                      title="View full credentials"
                    >
                      <Eye className="h-4 w-4" />
                      View
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ---------- PURCHASED LOG MODAL ---------- */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/10 bg-[#0f172a] p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-white">
                Purchased log credentials
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
                <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
              </div>
            ) : selectedLog ? (
              <div className="space-y-4">
                <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                  <p className="text-xs uppercase tracking-wider text-slate-400">
                    Email
                  </p>
                  <p className="mt-1 break-all font-mono text-base text-white">
                    {selectedLog.email}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                  <p className="text-xs uppercase tracking-wider text-slate-400">
                    Password
                  </p>
                  <p className="mt-1 break-all font-mono text-base text-white">
                    {selectedLog.password}
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                    <p className="text-xs uppercase tracking-wider text-slate-400">
                      Country
                    </p>
                    <p className="mt-1 text-base text-white">
                      {selectedLog.country}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                    <p className="text-xs uppercase tracking-wider text-slate-400">
                      Category
                    </p>
                    <p className="mt-1 text-base text-white">
                      {selectedLog.category}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                    <p className="text-xs uppercase tracking-wider text-slate-400">
                      Price
                    </p>
                    <p className="mt-1 text-base text-white">
                      ₦{Number(selectedLog.price || 0).toFixed(2)}
                    </p>
                  </div>
                </div>

                {selectedLog.purchasedAt && (
                  <p className="text-xs text-slate-400">
                    Purchased on{" "}
                    {new Date(selectedLog.purchasedAt).toLocaleString()}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-slate-400">No log data available.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserLogsMarketplace;
