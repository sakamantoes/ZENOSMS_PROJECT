import { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle,
  Copy,
  Loader2,
  RefreshCw,
  Smartphone,
  XCircle,
} from "lucide-react";
import {
  cancelGetatextService,
  cancelActivation,
  checkGetatextOtpStatus,
  checkOtpOrderStatus,
  getUserOtpOrders,
} from "../Service/number";

const isSuccess = (res) => Boolean(res?.success ?? res?.sucess ?? false);

const formatCurrency = (amount) => {
  const n = Number(amount);
  if (!Number.isFinite(n)) return "NGN 0.00";
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

const statusClass = (status) => {
  if (["OTP_RECEIVED", "COMPLETED"].includes(status)) {
    return "border-emerald-500/20 bg-emerald-500/10 text-emerald-400";
  }
  if (["WAITING_FOR_SMS", "PENDING"].includes(status)) {
    return "border-yellow-500/20 bg-yellow-500/10 text-yellow-400";
  }
  if (["CANCELLED", "FAILED"].includes(status)) {
    return "border-red-500/20 bg-red-500/10 text-red-400";
  }
  return "border-white/10 bg-white/5 text-gray-400";
};

const OtpOrdersTable = ({
  title = "Recent numbers",
  emptyMessage = "No number orders found.",
  filters = {},
  refreshKey = 0,
}) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [checkingId, setCheckingId] = useState("");
  const [cancellingId, setCancellingId] = useState("");

  const fetchOrders = useCallback(async () => {
    try {
      setError("");
      const response = await getUserOtpOrders(filters);
      if (isSuccess(response)) {
        setOrders(response.data ?? []);
      } else {
        setOrders([]);
        setError(response?.message || "Unable to load number orders.");
      }
    } catch (requestError) {
      setOrders([]);
      setError(
        requestError?.response?.data?.message ||
          requestError?.message ||
          "Unable to load number orders.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filters]);

  useEffect(() => {
    setLoading(true);
    fetchOrders();
  }, [fetchOrders, refreshKey]);

  const showSuccess = (message) => {
    setSuccess(message);
    setTimeout(() => setSuccess(""), 2500);
  };

  const copyValue = async (value, label) => {
    if (!value) return;
    await navigator.clipboard.writeText(value);
    showSuccess(`${label} copied.`);
  };

  const checkOrder = async (order) => {
    try {
      setCheckingId(order._id);
      setError("");
      const response = order.isUsaNumber
        ? await checkGetatextOtpStatus(order._id)
        : await checkOtpOrderStatus(order._id);

      if (!isSuccess(response)) {
        setError(response?.message || "Unable to check OTP status.");
        return;
      }

      showSuccess("OTP status updated.");
      await fetchOrders();
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          requestError?.message ||
          "Unable to check OTP status.",
      );
    } finally {
      setCheckingId("");
    }
  };

  const cancelOrder = async (order) => {
    if (!window.confirm("Are you sure you want to cancel this OTP order?")) {
      return;
    }

    try {
      setCancellingId(order._id);
      setError("");
      const response = order.isUsaNumber
        ? await cancelGetatextService(order.activationId)
        : await cancelActivation(order.activationId);

      if (!isSuccess(response)) {
        setError(response?.message || "Unable to cancel order.");
        return;
      }

      showSuccess("OTP order cancelled.");
      await fetchOrders();
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          requestError?.message ||
          "Unable to cancel order.",
      );
    } finally {
      setCancellingId("");
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
  };

  return (
    <section className="mt-8 rounded-xl border border-white/10 bg-gradient-to-br from-gray-900/80 to-gray-950/80">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 p-4">
        <div className="flex items-center gap-3">
          <Smartphone className="h-5 w-5 text-emerald-400" />
          <div>
            <h2 className="font-semibold text-white">{title}</h2>
            <p className="text-xs text-gray-500">{orders.length} record(s)</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleRefresh}
          disabled={loading || refreshing}
          className="inline-flex h-9 items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 text-xs font-semibold text-gray-200 hover:bg-white/10 disabled:opacity-50"
        >
          <RefreshCw
            size={14}
            className={loading || refreshing ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      {success && (
        <div className="m-4 flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-400">
          <CheckCircle size={16} />
          {success}
        </div>
      )}

      {error && (
        <div className="m-4 flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center p-10">
          <Loader2 className="animate-spin text-emerald-400" />
        </div>
      ) : orders.length === 0 ? (
        <div className="flex items-center justify-center p-10 text-sm text-gray-500">
          {emptyMessage}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px]">
            <thead className="border-b border-white/5 bg-white/5">
              <tr>
                <th className="p-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                  Service
                </th>
                <th className="p-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                  Country
                </th>
                <th className="p-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                  Number
                </th>
                <th className="p-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                  Status
                </th>
                <th className="p-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                  OTP
                </th>
                <th className="p-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                  Price
                </th>
                <th className="p-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                  Date
                </th>
                <th className="p-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {orders.map((order) => (
                <tr key={order._id} className="text-sm text-gray-300">
                  <td className="p-3">{order.service}</td>
                  <td className="p-3">{order.country}</td>
                  <td className="p-3">
                    <button
                      type="button"
                      onClick={() => copyValue(order.phoneNumber, "Number")}
                      className="inline-flex items-center gap-2 font-mono text-gray-200 hover:text-white"
                    >
                      {order.phoneNumber}
                      <Copy size={13} />
                    </button>
                  </td>
                  <td className="p-3">
                    <span
                      className={`inline-flex rounded-full border px-2 py-1 text-xs ${statusClass(
                        order.status,
                      )}`}
                    >
                      {order.status?.replaceAll("_", " ") || "UNKNOWN"}
                    </span>
                  </td>
                  <td className="p-3">
                    {order.otpCode ? (
                      <button
                        type="button"
                        onClick={() => copyValue(order.otpCode, "OTP")}
                        className="inline-flex items-center gap-2 font-mono font-semibold text-emerald-400 hover:text-emerald-300"
                      >
                        {order.otpCode}
                        <Copy size={13} />
                      </button>
                    ) : (
                      <span className="text-gray-500">Waiting</span>
                    )}
                  </td>
                  <td className="p-3 font-semibold text-emerald-400">
                    {formatCurrency(order.sellingPrice)}
                  </td>
                  <td className="p-3 text-xs text-gray-400">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-2">
                      {order.canCheckOtp && (
                        <button
                          type="button"
                          onClick={() => checkOrder(order)}
                          disabled={checkingId === order._id}
                          className="inline-flex h-8 items-center gap-1 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/20 disabled:opacity-50"
                        >
                          {checkingId === order._id ? (
                            <Loader2 size={13} className="animate-spin" />
                          ) : (
                            <RefreshCw size={13} />
                          )}
                          Check
                        </button>
                      )}
                      {order.canCancel && (
                        <button
                          type="button"
                          onClick={() => cancelOrder(order)}
                          disabled={cancellingId === order._id}
                          className="inline-flex h-8 items-center gap-1 rounded-lg border border-red-500/20 bg-red-500/10 px-3 text-xs font-semibold text-red-400 hover:bg-red-500/20 disabled:opacity-50"
                        >
                          {cancellingId === order._id ? (
                            <Loader2 size={13} className="animate-spin" />
                          ) : (
                            <XCircle size={13} />
                          )}
                          Cancel
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default OtpOrdersTable;
