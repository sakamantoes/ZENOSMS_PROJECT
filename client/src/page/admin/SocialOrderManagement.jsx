import React, { useEffect, useState } from "react";
import {
  AlertCircle,
  Eye,
  ExternalLink,
  Loader2,
  RefreshCw,
  Search,
  Share2,
  X,
} from "lucide-react";
import { getErrorMessage } from "../../utils/getErrorMessage.js";
import { getSocialOrders } from "../../Service/admin.js";
import { getPlatform, getStatus } from "../../Components/socialOrderHelpers.js";
import { formatCurrency, formatDate } from "../../Components/formatHelpers.js";

const STATUS_OPTIONS = [
  "pending",
  "processing",
  "completed",
  "partial",
  "cancelled",
  "failed",
];

const StatCard = ({ label, value, active, onClick }) => {
  const meta = getStatus(label === "Total" ? "" : label);
  const isTotal = label === "Total";
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-start gap-1.5 rounded-xl border p-3.5 text-left transition-colors ${
        isTotal
          ? "border-[#07cf00]/20 bg-[#07cf00]/10"
          : `${meta.border} ${meta.bg}`
      } ${active ? "ring-1 ring-[#07cf00]/60" : ""}`}
    >
      <span
        className={`text-[10px] font-medium uppercase tracking-wider ${
          isTotal ? "text-[#07cf00]" : meta.color
        }`}
      >
        {label}
      </span>
      <span className="text-xl font-bold text-white">{value ?? 0}</span>
    </button>
  );
};

const StatusBadge = ({ status }) => {
  const meta = getStatus(status);
  const Icon = meta.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${meta.border} ${meta.bg} ${meta.color}`}
    >
      <Icon size={10} />
      {meta.label}
    </span>
  );
};

const SocialOrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  const fetchOrders = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getSocialOrders({
        page,
        limit: 20,
        search,
        status: statusFilter,
      });
      setOrders(res.data ?? []);
      setStats(res.stats ?? {});
      setPagination(
        res.pagination ?? { page: 1, limit: 20, total: 0, totalPages: 0 },
      );
    } catch (err) {
      setError(getErrorMessage(err, "Unable to fetch social orders."));
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, statusFilter]);

  const [selectedOrder, setSelectedOrder] = useState(null);

  return (
    <div className="space-y-6 py-2">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#07cf00]/20 bg-[#07cf00]/10">
            <Share2 size={18} className="text-[#07cf00]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Social Orders</h1>
            <p className="mt-1 text-sm text-gray-400">
              Monitor social media boosting orders placed by customers.
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
        <StatCard
          label="Total"
          value={pagination.total}
          active={statusFilter === ""}
          onClick={() => {
            setPage(1);
            setStatusFilter("");
          }}
        />
        {STATUS_OPTIONS.map((s) => (
          <StatCard
            key={s}
            label={s}
            value={stats[s]}
            active={statusFilter === s}
            onClick={() => {
              setPage(1);
              setStatusFilter(s);
            }}
          />
        ))}
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
              placeholder="Search by service, link, or receipt no…"
              className="h-9 w-full rounded-lg border border-white/10 bg-white/5 pl-8 pr-3 text-sm text-white outline-none transition-colors placeholder:text-gray-500 focus:border-[#07cf00]/60 focus:bg-black/30"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setPage(1);
              setStatusFilter(e.target.value);
            }}
            className="h-9 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-gray-300 outline-none transition-colors focus:border-[#07cf00]/60"
          >
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {getStatus(s).label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={fetchOrders}
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
          Loading social orders…
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
          {orders.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-10 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                <Share2 size={18} className="text-gray-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">
                  No social orders found
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  Try adjusting your search or filters.
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
                        Service
                      </th>
                      <th className="p-4 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                        Customer
                      </th>
                      <th className="p-4 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                        Date
                      </th>
                      <th className="p-4 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                        Qty
                      </th>
                      <th className="p-4 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                        Amount
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
                    {orders.map((order) => {
                      const platform = getPlatform(order.serviceName);
                      const PlatformIcon = platform.icon;
                      return (
                        <tr
                          key={order._id}
                          className="transition-colors hover:bg-white/5"
                        >
                          <td className="p-4">
                            <div className="flex items-center gap-2.5">
                              <div
                                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${platform.border} ${platform.bg}`}
                              >
                                <PlatformIcon
                                  size={14}
                                  className={platform.color}
                                />
                              </div>
                              <div className="min-w-0">
                                <p className="truncate text-sm text-white">
                                  {order.serviceName}
                                </p>
                                <p className="font-mono text-[10px] text-gray-500">
                                  {order.receiptNo}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-sm text-gray-300">
                            <p className="text-white">
                              {order.userId?.username ?? "Unknown"}
                            </p>
                            <p className="text-xs text-gray-500">
                              {order.userId?.email}
                            </p>
                          </td>
                          <td className="p-4 text-sm text-gray-300">
                            {formatDate(order.createdAt)}
                          </td>
                          <td className="p-4 text-sm text-gray-300">
                            {order.quantity}
                          </td>
                          <td className="p-4 text-sm font-semibold text-white">
                            {formatCurrency(order.amount)}
                          </td>
                          <td className="p-4">
                            <StatusBadge status={order.status} />
                          </td>
                          <td className="p-4">
                            <button
                              type="button"
                              onClick={() => setSelectedOrder(order)}
                              className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
                              aria-label="View order details"
                            >
                              <Eye size={12} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
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

      {/* Detail modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/10 bg-[#0d0d0d] p-6 shadow-2xl">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#07cf00]/20 bg-[#07cf00]/10">
                  <Share2 size={15} className="text-[#07cf00]" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-white">
                    Social Order Details
                  </h2>
                  <p className="font-mono text-[10px] text-gray-500">
                    {selectedOrder.receiptNo}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
              >
                <X size={14} />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={selectedOrder.status} />
                <span className="text-xs text-gray-500">
                  Placed {formatDate(selectedOrder.createdAt)}
                </span>
              </div>

              <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Customer
                </p>
                <p className="text-sm font-medium text-white">
                  {selectedOrder.userId?.username ?? "Unknown"}
                </p>
                <p className="text-xs text-gray-400">
                  {selectedOrder.userId?.email}
                </p>
              </div>

              <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Service
                </p>
                <p className="text-sm text-white">
                  {selectedOrder.serviceName}
                </p>
                <a
                  href={selectedOrder.link}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1.5 inline-flex items-center gap-1 text-xs text-[#07cf00] hover:underline"
                >
                  <ExternalLink size={11} />
                  <span className="truncate">{selectedOrder.link}</span>
                </a>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                  <p className="text-[11px] text-gray-500">Provider</p>
                  <p className="text-sm font-semibold text-white">
                    {selectedOrder.provider}
                  </p>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                  <p className="text-[11px] text-gray-500">Provider Order ID</p>
                  <p className="text-sm font-semibold text-white">
                    {selectedOrder.providerOrderId ?? "—"}
                  </p>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                  <p className="text-[11px] text-gray-500">Quantity</p>
                  <p className="text-sm font-semibold text-white">
                    {selectedOrder.quantity}
                  </p>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                  <p className="text-[11px] text-gray-500">Amount</p>
                  <p className="text-sm font-semibold text-white">
                    {formatCurrency(selectedOrder.amount)}
                  </p>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                  <p className="text-[11px] text-gray-500">Start Count</p>
                  <p className="text-sm font-semibold text-white">
                    {selectedOrder.startCount ?? "—"}
                  </p>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                  <p className="text-[11px] text-gray-500">Remains</p>
                  <p className="text-sm font-semibold text-white">
                    {selectedOrder.remains ?? "—"}
                  </p>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                  <p className="text-[11px] text-gray-500">Completed</p>
                  <p className="text-xs font-medium text-white">
                    {formatDate(selectedOrder.completedAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SocialOrderManagement;
