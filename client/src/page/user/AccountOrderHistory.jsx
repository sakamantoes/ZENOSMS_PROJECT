import { useEffect, useState } from "react";
import {
  AlertCircle,
  Copy,
  Eye,
  Loader2,
  PackageCheck,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import {
  getUserAccountOrderById,
  getUserAccountOrders,
} from "../../Service/logs";
import { getErrorMessage } from "../../utils/getErrorMessage.js";

const DEFAULT_PAGINATION = {
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 1,
};

const STATUS_STYLES = {
  pending: "border-amber-500/20 bg-amber-500/10 text-amber-300",
  processing: "border-cyan-500/20 bg-cyan-500/10 text-cyan-300",
  completed: "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
  delivered: "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
  failed: "border-red-500/20 bg-red-500/10 text-red-300",
  cancelled: "border-white/10 bg-white/5 text-gray-300",
};

const formatCurrency = (amount) => {
  const value = Number(amount);
  if (!Number.isFinite(value)) return "NGN 0.00";
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  }).format(value);
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

const StatusBadge = ({ value }) => (
  <span
    className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold capitalize ${
      STATUS_STYLES[value] ?? "border-white/10 bg-white/5 text-gray-300"
    }`}
  >
    {value ?? "unknown"}
  </span>
);

const CREDENTIAL_FIELDS = [
  { key: "username", label: "Username" },
  { key: "password", label: "Password" },
  { key: "email", label: "Email" },
  { key: "emailPassword", label: "Email password" },
  { key: "cookies", label: "Cookies" },
];

const getCredentialItems = (order) => {
  if (Array.isArray(order?.credentialItems) && order.credentialItems.length > 0) {
    return order.credentialItems;
  }

  if (
    order?.credentials &&
    Object.values(order.credentials).some((value) => String(value ?? "").trim())
  ) {
    return [{ label: "Account 1", ...order.credentials }];
  }

  return [];
};

const AccountOrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState(DEFAULT_PAGINATION);
  const [search, setSearch] = useState("");
  const [purchaseStatus, setPurchaseStatus] = useState("");
  const [deliveryStatus, setDeliveryStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchOrders = async (page = pagination.page) => {
    try {
      setLoading(true);
      setError("");
      const response = await getUserAccountOrders({
        page,
        limit: pagination.limit,
        search,
        purchaseStatus,
        deliveryStatus,
      });
      setOrders(response?.data ?? []);
      setPagination(response?.pagination ?? { ...DEFAULT_PAGINATION, page });
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Unable to load account orders."));
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, purchaseStatus, deliveryStatus]);

  const openDetails = async (order) => {
    try {
      setSelectedOrder(order);
      setDetailLoading(true);
      const response = await getUserAccountOrderById(order._id);
      setSelectedOrder(response?.data ?? order);
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Unable to load order details."));
    } finally {
      setDetailLoading(false);
    }
  };

  const copyText = async (text) => {
    const value = String(text ?? "").trim();

    if (!value) return;
    await navigator.clipboard.writeText(value);
  };

  const copyCredentials = async (items) => {
    const text = items
      .map((item, index) => {
        const title = item.label || `Account ${index + 1}`;
        const fields = CREDENTIAL_FIELDS
          .filter(({ key }) => String(item[key] ?? "").trim())
          .map(({ key, label }) => `${label}: ${item[key]}`)
          .join("\n");

        return fields ? `${title}\n${fields}` : "";
      })
      .filter(Boolean)
      .join("\n\n");

    await copyText(text);
  };

  return (
    <div className="space-y-6 py-2">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-green-500/20 bg-green-500/10">
            <PackageCheck size={18} className="text-green-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">
              Account Order History
            </h1>
            <p className="mt-1 text-sm text-gray-400">
              View purchased accounts and delivery details.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => fetchOrders(pagination.page)}
          disabled={loading}
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white hover:bg-white/10 disabled:opacity-60"
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
          <label className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search receipt or status"
              className="h-10 w-full rounded-xl border border-white/10 bg-black/20 pl-9 pr-3 text-sm text-white outline-none placeholder:text-gray-500 focus:border-green-500/50"
            />
          </label>
          <select
            value={purchaseStatus}
            onChange={(event) => setPurchaseStatus(event.target.value)}
            className="h-10 rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-gray-200 outline-none focus:border-green-500/50"
          >
            <option value="">All purchase statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select
            value={deliveryStatus}
            onChange={(event) => setDeliveryStatus(event.target.value)}
            className="h-10 rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-gray-200 outline-none focus:border-green-500/50"
          >
            <option value="">All delivery statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="delivered">Delivered</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex min-h-56 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
          <Loader2 className="animate-spin text-green-400" />
        </div>
      ) : orders.length === 0 ? (
        <div className="flex min-h-56 items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/5 text-sm text-gray-400">
          No account orders found.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left">
              <thead className="border-b border-white/10 text-xs uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Receipt</th>
                  <th className="px-4 py-3 font-medium">Account</th>
                  <th className="px-4 py-3 font-medium">Quantity</th>
                  <th className="px-4 py-3 font-medium">Amount</th>
                  <th className="px-4 py-3 font-medium">Purchase</th>
                  <th className="px-4 py-3 font-medium">Delivery</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {orders.map((order) => (
                  <tr key={order._id} className="text-sm text-gray-300">
                    <td className="px-4 py-4 font-mono text-xs text-white">
                      {order.receiptNo}
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-semibold text-white">
                        {order.accountListingId?.name ?? "Account"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {order.accountListingId?.category ?? "-"}
                      </p>
                    </td>
                    <td className="px-4 py-4">{order.quantity}</td>
                    <td className="px-4 py-4 font-semibold text-white">
                      {formatCurrency(order.amount)}
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge value={order.purchaseStatus} />
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge value={order.deliveryStatus} />
                    </td>
                    <td className="px-4 py-4 text-xs text-gray-400">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => openDetails(order)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white"
                        aria-label="View account order"
                      >
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between border-t border-white/10 pt-4">
        <button
          type="button"
          onClick={() => fetchOrders(pagination.page - 1)}
          disabled={pagination.page <= 1 || loading}
          className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-gray-200 hover:bg-white/10 disabled:opacity-40"
        >
          Previous
        </button>
        <span className="text-xs text-gray-500">
          Page {pagination.page} of {pagination.totalPages}
        </span>
        <button
          type="button"
          onClick={() => fetchOrders(pagination.page + 1)}
          disabled={pagination.page >= pagination.totalPages || loading}
          className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-gray-200 hover:bg-white/10 disabled:opacity-40"
        >
          Next
        </button>
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black/70 p-3 backdrop-blur-sm sm:p-4">
          <div className="max-h-[90vh] w-full max-w-2xl min-w-0 overflow-y-auto overflow-x-hidden rounded-2xl border border-white/10 bg-[#0d0d0d] p-4 shadow-2xl sm:p-6">
            <div className="flex min-w-0 items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="text-lg font-semibold text-white">
                  Account order
                </h2>
                <p className="mt-1 truncate font-mono text-xs text-gray-500">
                  {selectedOrder.receiptNo}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
              >
                <X size={15} />
              </button>
            </div>

            {detailLoading ? (
              <div className="mt-6 flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 p-8 text-sm text-gray-300">
                <Loader2 size={16} className="animate-spin text-green-400" />
                Loading order details...
              </div>
            ) : (
              <div className="mt-6 min-w-0 space-y-4">
                <div className="grid min-w-0 gap-3 sm:grid-cols-2">
                  <div className="min-w-0 rounded-xl border border-white/10 bg-white/5 p-3">
                    <p className="text-xs uppercase text-gray-500">Amount</p>
                    <p className="mt-1 font-semibold text-white">
                      {formatCurrency(selectedOrder.amount)}
                    </p>
                  </div>
                  <div className="min-w-0 rounded-xl border border-white/10 bg-white/5 p-3">
                    <p className="text-xs uppercase text-gray-500">Status</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <StatusBadge value={selectedOrder.purchaseStatus} />
                      <StatusBadge value={selectedOrder.deliveryStatus} />
                    </div>
                  </div>
                </div>

                <div className="min-w-0 rounded-xl border border-white/10 bg-white/5 p-3 sm:p-4">
                  <div className="flex min-w-0 items-center justify-between gap-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Account credentials
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        copyCredentials(getCredentialItems(selectedOrder))
                      }
                      disabled={getCredentialItems(selectedOrder).length === 0}
                      className="inline-flex h-8 items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 text-xs font-semibold text-gray-200 hover:bg-white/10 disabled:opacity-40"
                    >
                      <Copy size={13} />
                      Copy all
                    </button>
                  </div>

                  <div className="mt-3 min-w-0 space-y-3">
                    {getCredentialItems(selectedOrder).length === 0 ? (
                      <p className="text-sm text-gray-500">
                        Account credentials are not available yet.
                      </p>
                    ) : (
                      getCredentialItems(selectedOrder).map((item, index) => (
                        <div
                          key={`${item.label ?? "account"}-${index}`}
                          className="min-w-0 rounded-lg border border-white/10 bg-black/20 p-3"
                        >
                          <p className="truncate text-xs font-semibold text-green-300">
                            {item.label || `Account ${index + 1}`}
                          </p>

                          <div className="mt-3 grid min-w-0 gap-2">
                            {CREDENTIAL_FIELDS.map(({ key, label }) => {
                              const value = String(item[key] ?? "").trim();

                              if (!value) return null;

                              return (
                                <div
                                  key={key}
                                  className="min-w-0 rounded-lg border border-white/10 bg-black/20 p-3"
                                >
                                  <div className="flex min-w-0 items-center justify-between gap-2">
                                    <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                                      {label}
                                    </p>
                                    <button
                                      type="button"
                                      onClick={() => copyText(value)}
                                      className="inline-flex h-7 items-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-2 text-[11px] font-semibold text-gray-300 hover:bg-white/10 hover:text-white"
                                    >
                                      <Copy size={12} />
                                      Copy
                                    </button>
                                  </div>
                                  <p className="mt-2 max-w-full break-all font-mono text-xs leading-relaxed text-gray-300">
                                    {value}
                                  </p>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountOrderHistory;
