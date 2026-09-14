import React, { useEffect, useState } from "react";
import {
  AlertCircle,
  Eye,
  Loader2,
  Package,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import { getErrorMessage } from "../../utils/getErrorMessage.js";
import { getGiftOrderHistory } from "../../Service/gifting.js";

const formatCurrency = (amount) => {
  const n = Number(amount);
  if (!Number.isFinite(n)) return "₦0.00";
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
};

const formatDate = (value) => {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";
  return new Intl.DateTimeFormat("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const ORDER_STATUS_STYLES = {
  PENDING: "border-white/10 bg-white/5 text-gray-400",
  CONFIRMED: "border-blue-500/20 bg-blue-500/10 text-blue-400",
  PACKING: "border-amber-500/20 bg-amber-500/10 text-amber-400",
  READY_FOR_DISPATCH: "border-amber-500/20 bg-amber-500/10 text-amber-400",
  IN_TRANSIT: "border-[#00CBCF]/20 bg-[#00CBCF]/10 text-[#00CBCF]",
  OUT_FOR_DELIVERY: "border-[#00CBCF]/20 bg-[#00CBCF]/10 text-[#00CBCF]",
  DELIVERED: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
  CANCELLED: "border-red-500/20 bg-red-500/10 text-red-400",
};

const PAYMENT_STATUS_STYLES = {
  PENDING: "border-amber-500/20 bg-amber-500/10 text-amber-400",
  PAID: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
  FAILED: "border-red-500/20 bg-red-500/10 text-red-400",
  REFUNDED: "border-white/10 bg-white/5 text-gray-400",
};

const StatusBadge = ({ status, styles }) => (
  <span
    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold capitalize ${
      styles[status] ?? "border-white/10 bg-white/5 text-gray-400"
    }`}
  >
    {status?.replaceAll("_", " ").toLowerCase() ?? "unknown"}
  </span>
);

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getGiftOrderHistory({ search });
      setOrders(res.data ?? []);
    } catch (err) {
      setError(getErrorMessage(err, "Unable to fetch your orders."));
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  return (
    <div className="space-y-6 py-2">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#07cf00]/20 bg-[#07cf00]/10">
            <Package size={18} className="text-[#07cf00]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Order History</h1>
            <p className="mt-1 text-sm text-gray-400">
              Track and review all your gift orders.
            </p>
          </div>
        </div>
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
              placeholder="Search by tracking ID or product…"
              className="h-9 w-full rounded-lg border border-white/10 bg-white/5 pl-8 pr-3 text-sm text-white outline-none transition-colors placeholder:text-gray-500 focus:border-[#00CBCF]/60 focus:bg-black/30"
            />
          </div>
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
          <Loader2 size={18} className="animate-spin text-[#00CBCF]" />
          Loading your orders…
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
                <Package size={18} className="text-gray-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">
                  {search
                    ? "No orders match your search"
                    : "No orders yet"}
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  {search
                    ? "Try adjusting your search."
                    : "Your placed gift orders will show up here."}
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
                        Tracking ID
                      </th>
                      <th className="p-4 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                        Date
                      </th>
                      <th className="p-4 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                        Items
                      </th>
                      <th className="p-4 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                        Total
                      </th>
                      <th className="p-4 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                        Payment
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
                    {orders.map((order) => (
                      <tr
                        key={order._id}
                        className="transition-colors hover:bg-white/5"
                      >
                        <td className="p-4 font-mono text-xs text-white">
                          {order.trackingId}
                        </td>
                        <td className="p-4 text-sm text-gray-300">
                          {formatDate(order.createdAt)}
                        </td>
                        <td className="p-4 text-sm text-gray-300">
                          {order.items?.length ?? 0} item
                          {order.items?.length !== 1 ? "s" : ""}
                        </td>
                        <td className="p-4 text-sm font-semibold text-white">
                          {formatCurrency(order.total)}
                        </td>
                        <td className="p-4">
                          <StatusBadge
                            status={order.paymentStatus}
                            styles={PAYMENT_STATUS_STYLES}
                          />
                        </td>
                        <td className="p-4">
                          <StatusBadge
                            status={order.orderStatus}
                            styles={ORDER_STATUS_STYLES}
                          />
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

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/10 bg-[#0d0d0d] p-6 shadow-2xl">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#00CBCF]/20 bg-[#00CBCF]/10">
                  <Package size={15} className="text-[#00CBCF]" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-white">
                    Order Details
                  </h2>
                  <p className="font-mono text-[10px] text-gray-500">
                    {selectedOrder.trackingId}
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
              {/* Status */}
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge
                  status={selectedOrder.orderStatus}
                  styles={ORDER_STATUS_STYLES}
                />
                <StatusBadge
                  status={selectedOrder.paymentStatus}
                  styles={PAYMENT_STATUS_STYLES}
                />
                <span className="text-xs text-gray-500">
                  Placed {formatDate(selectedOrder.createdAt)}
                </span>
              </div>

              {/* Tracking history */}
              <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Tracking History
                </p>
                {selectedOrder.trackingHistory?.length > 0 ? (
                  <div>
                    {selectedOrder.trackingHistory.map((event, i) => {
                      const isLast =
                        i === selectedOrder.trackingHistory.length - 1;
                      return (
                        <div
                          key={i}
                          className="relative flex gap-3 pb-4 last:pb-0"
                        >
                          {!isLast && (
                            <span className="absolute left-[4px] top-3 h-full w-px bg-white/10" />
                          )}
                          <span
                            className={`relative z-10 mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
                              isLast ? "bg-[#00CBCF]" : "bg-white/20"
                            }`}
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <StatusBadge
                                status={event.status}
                                styles={ORDER_STATUS_STYLES}
                              />
                              <span className="text-[10px] text-gray-500">
                                {formatDate(event.createdAt)}
                              </span>
                            </div>
                            <p className="mt-1 text-xs text-gray-400">
                              {event.message}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500">
                    No tracking updates yet.
                  </p>
                )}
              </div>

              {/* Items */}
              <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Items
                </p>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item, i) => (
                    <div
                      key={item._id ?? i}
                      className="flex items-center justify-between gap-3 text-sm"
                    >
                      <span className="min-w-0 flex-1 truncate text-gray-300">
                        {item.name}{" "}
                        <span className="text-gray-500">
                          × {item.quantity}
                        </span>
                      </span>
                      <span className="shrink-0 text-white">
                        {formatCurrency(item.subtotal)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 space-y-1 border-t border-white/5 pt-3 text-sm">
                  <div className="flex items-center justify-between text-gray-400">
                    <span>Subtotal</span>
                    <span>{formatCurrency(selectedOrder.subtotal)}</span>
                  </div>
                  <div className="flex items-center justify-between text-gray-400">
                    <span>Delivery Fee</span>
                    <span>{formatCurrency(selectedOrder.deliveryFee)}</span>
                  </div>
                  <div className="flex items-center justify-between text-base font-bold text-white">
                    <span>Total</span>
                    <span className="text-[#00CBCF]">
                      {formatCurrency(selectedOrder.total)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Delivery */}
              <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Delivery
                </p>
                <p className="text-sm text-gray-300">
                  {selectedOrder.deliveryCountry} (
                  {selectedOrder.deliveryCountryCode}) —{" "}
                  {selectedOrder.estimatedDeliveryDays} day
                  {selectedOrder.estimatedDeliveryDays !== 1 ? "s" : ""}{" "}
                  estimated
                </p>
              </div>

              {/* Shipping address */}
              <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Shipping Address
                </p>
                <p className="text-sm font-medium text-white">
                  {selectedOrder.shippingFullName}
                </p>
                <p className="text-sm text-gray-400">
                  {selectedOrder.shippingPhone}
                </p>
                <p className="mt-1 text-sm text-gray-400">
                  {selectedOrder.shippingAddress}, {selectedOrder.shippingCity}
                  , {selectedOrder.shippingState}
                  {selectedOrder.shippingPostalCode
                    ? `, ${selectedOrder.shippingPostalCode}`
                    : ""}
                </p>
                {selectedOrder.shippingAdditionalInfo && (
                  <p className="mt-1 text-xs text-gray-500">
                    {selectedOrder.shippingAdditionalInfo}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
