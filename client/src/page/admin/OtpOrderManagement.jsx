import React, { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Eye,
  Loader2,
  MessageSquare,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import { getErrorMessage } from "../../utils/getErrorMessage.js";
import { getOtpOrders } from "../../Service/admin.js";
import { formatCurrency, formatDate } from "../../Components/formatHelpers.js";

const STATUS_OPTIONS = [
  "PENDING",
  "WAITING_FOR_SMS",
  "OTP_RECEIVED",
  "COMPLETED",
  "CANCELLED",
  "FAILED",
];

const STATUS_STYLES = {
  PENDING: "border-white/10 bg-white/5 text-gray-400",
  WAITING_FOR_SMS: "border-amber-500/20 bg-amber-500/10 text-amber-400",
  OTP_RECEIVED: "border-[#07cf00]/20 bg-[#07cf00]/10 text-[#07cf00]",
  COMPLETED: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
  CANCELLED: "border-white/10 bg-white/5 text-gray-400",
  FAILED: "border-red-500/20 bg-red-500/10 text-red-400",
};

const StatusBadge = ({ status }) => (
  <span
    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold capitalize ${
      STATUS_STYLES[status] ?? "border-white/10 bg-white/5 text-gray-400"
    }`}
  >
    {status?.replaceAll("_", " ").toLowerCase() ?? "unknown"}
  </span>
);

const StatCard = ({ label, value, cls, active, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex flex-col items-start gap-1.5 rounded-xl border p-3.5 text-left transition-colors ${cls} ${
      active ? "ring-1 ring-[#07cf00]/60" : ""
    }`}
  >
    <span className="text-[10px] font-medium uppercase tracking-wider opacity-80">
      {label.replaceAll("_", " ")}
    </span>
    <span className="text-xl font-bold text-white">{value ?? 0}</span>
  </button>
);

const OtpOrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const fetchOrders = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getOtpOrders();
      setOrders(res.data?.otpOrders ?? []);
      setStats(res.data?.stats ?? {});
    } catch (err) {
      setError(getErrorMessage(err, "Unable to fetch OTP orders."));
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    const term = search.trim().toLowerCase();
    return orders.filter((order) => {
      if (statusFilter && order.status !== statusFilter) return false;
      if (!term) return true;
      return (
        order.service?.toLowerCase().includes(term) ||
        order.country?.toLowerCase().includes(term) ||
        order.provider?.toLowerCase().includes(term) ||
        order.userId?.username?.toLowerCase().includes(term) ||
        order.userId?.email?.toLowerCase().includes(term)
      );
    });
  }, [orders, search, statusFilter]);

  const [selectedOrder, setSelectedOrder] = useState(null);

  return (
    <div className="space-y-6 py-2">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#07cf00]/20 bg-[#07cf00]/10">
            <MessageSquare size={18} className="text-[#07cf00]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">OTP Orders</h1>
            <p className="mt-1 text-sm text-gray-400">
              Track number rentals and OTP verification orders.
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
        <StatCard
          label="Total"
          value={stats.total}
          cls="border-[#07cf00]/20 bg-[#07cf00]/10 text-[#07cf00]"
          active={statusFilter === ""}
          onClick={() => setStatusFilter("")}
        />
        {STATUS_OPTIONS.map((s) => (
          <StatCard
            key={s}
            label={s}
            value={stats[s]}
            cls={STATUS_STYLES[s]}
            active={statusFilter === s}
            onClick={() => setStatusFilter(s)}
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
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by service, country, provider, or customer…"
              className="h-9 w-full rounded-lg border border-white/10 bg-white/5 pl-8 pr-3 text-sm text-white outline-none transition-colors placeholder:text-gray-500 focus:border-[#07cf00]/60 focus:bg-black/30"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-gray-300 outline-none transition-colors focus:border-[#07cf00]/60"
          >
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s.replaceAll("_", " ")}
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
          Loading OTP orders…
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
          {filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-10 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                <MessageSquare size={18} className="text-gray-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">
                  No OTP orders found
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
                        Customer
                      </th>
                      <th className="p-4 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                        Provider
                      </th>
                      <th className="p-4 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                        Service
                      </th>
                      <th className="p-4 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                        Country
                      </th>
                      <th className="p-4 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                        Date
                      </th>
                      <th className="p-4 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                        Price
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
                    {filteredOrders.map((order) => (
                      <tr
                        key={order._id}
                        className="transition-colors hover:bg-white/5"
                      >
                        <td className="p-4 text-sm text-gray-300">
                          <p className="text-white">
                            {order.userId?.username ?? "Unknown"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {order.userId?.email}
                          </p>
                        </td>
                        <td className="p-4 text-sm capitalize text-gray-300">
                          {order.provider}
                        </td>
                        <td className="p-4 text-sm text-white">
                          {order.service}
                        </td>
                        <td className="p-4 text-sm text-gray-300">
                          {order.country}
                        </td>
                        <td className="p-4 text-sm text-gray-300">
                          {formatDate(order.createdAt)}
                        </td>
                        <td className="p-4 text-sm font-semibold text-white">
                          {formatCurrency(order.sellingPrice)}
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
                    ))}
                  </tbody>
                </table>
              </div>
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
                  <MessageSquare size={15} className="text-[#07cf00]" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-white">
                    OTP Order Details
                  </h2>
                  <p className="font-mono text-[10px] text-gray-500">
                    {selectedOrder.service} — {selectedOrder.country}
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
                  Purchased {formatDate(selectedOrder.purchasedAt)}
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

              <div className="grid grid-cols-2 gap-2.5">
                <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                  <p className="text-[11px] text-gray-500">Provider</p>
                  <p className="text-sm font-semibold capitalize text-white">
                    {selectedOrder.provider}
                  </p>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                  <p className="text-[11px] text-gray-500">Operator</p>
                  <p className="text-sm font-semibold text-white">
                    {selectedOrder.activationOperator ?? "—"}
                  </p>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                  <p className="text-[11px] text-gray-500">Service</p>
                  <p className="text-sm font-semibold text-white">
                    {selectedOrder.service}
                  </p>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                  <p className="text-[11px] text-gray-500">Country</p>
                  <p className="text-sm font-semibold text-white">
                    {selectedOrder.country}
                  </p>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                  <p className="text-[11px] text-gray-500">Selling Price</p>
                  <p className="text-sm font-semibold text-white">
                    {formatCurrency(selectedOrder.sellingPrice)}
                  </p>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                  <p className="text-[11px] text-gray-500">Can Resend SMS</p>
                  <p className="text-sm font-semibold text-white">
                    {selectedOrder.canGetAnotherSms ? "Yes" : "No"}
                  </p>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                  <p className="text-[11px] text-gray-500">Expires</p>
                  <p className="text-xs font-medium text-white">
                    {formatDate(selectedOrder.expiresAt)}
                  </p>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                  <p className="text-[11px] text-gray-500">Completed</p>
                  <p className="text-xs font-medium text-white">
                    {formatDate(selectedOrder.completedAt)}
                  </p>
                </div>
              </div>

              {selectedOrder.cancelReason && (
                <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-red-400">
                    Cancel Reason
                  </p>
                  <p className="text-sm text-red-300">
                    {selectedOrder.cancelReason}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OtpOrderManagement;
