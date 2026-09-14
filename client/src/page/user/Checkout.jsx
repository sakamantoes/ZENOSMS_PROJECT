import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Gift,
  Loader2,
  ShoppingCart,
  Truck,
} from "lucide-react";
import { toast } from "react-toastify";
import { getErrorMessage } from "../../utils/getErrorMessage.js";
import { getGiftDeliveryRates, placeGiftOrder } from "../../Service/gifting.js";
import useCart from "../../Hooks/useCart.js";

const EMPTY_FORM = {
  deliveryRateId: "",
  shippingFullName: "",
  shippingPhone: "",
  shippingAddress: "",
  shippingCity: "",
  shippingState: "",
  shippingPostalCode: "",
  shippingAdditionalInfo: "",
};

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

const Checkout = () => {
  const navigate = useNavigate();
  const {
    cart,
    items: cartItems,
    isLoading: cartLoading,
    error: cartError,
    refetch: refetchCart,
  } = useCart();

  const [rates, setRates] = useState([]);
  const [ratesLoading, setRatesLoading] = useState(false);
  const [ratesError, setRatesError] = useState("");

  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [placedOrder, setPlacedOrder] = useState(null);

  const fetchRates = async () => {
    setRatesLoading(true);
    setRatesError("");
    try {
      const res = await getGiftDeliveryRates();
      setRates(res.data ?? []);
    } catch (err) {
      setRatesError(getErrorMessage(err, "Unable to fetch delivery options."));
    } finally {
      setRatesLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchRates();
  }, []);

  const selectedRate = rates.find((r) => r._id === form.deliveryRateId);
  const itemsSubtotal = cartItems.reduce(
    (sum, item) => sum + (item.productId?.price ?? 0) * item.quantity,
    0,
  );
  const deliveryFee = selectedRate?.deliveryFee ?? 0;
  const grandTotal = itemsSubtotal + deliveryFee;

  const validateForm = () => {
    const errs = {};
    if (!form.deliveryRateId)
      errs.deliveryRateId = "Select a delivery option.";
    if (!form.shippingFullName.trim())
      errs.shippingFullName = "Full name is required.";
    if (!form.shippingPhone.trim())
      errs.shippingPhone = "Phone number is required.";
    if (!form.shippingAddress.trim())
      errs.shippingAddress = "Address is required.";
    if (!form.shippingCity.trim()) errs.shippingCity = "City is required.";
    if (!form.shippingState.trim()) errs.shippingState = "State is required.";
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
        cartId: cart._id,
        deliveryRateId: form.deliveryRateId,
        shippingFullName: form.shippingFullName.trim(),
        shippingPhone: form.shippingPhone.trim(),
        shippingAddress: form.shippingAddress.trim(),
        shippingCity: form.shippingCity.trim(),
        shippingState: form.shippingState.trim(),
        ...(form.shippingPostalCode.trim()
          ? { shippingPostalCode: form.shippingPostalCode.trim() }
          : {}),
        ...(form.shippingAdditionalInfo.trim()
          ? { shippingAdditionalInfo: form.shippingAdditionalInfo.trim() }
          : {}),
      };
      const res = await placeGiftOrder(payload);
      setPlacedOrder(res.data?.order ?? null);
      toast.success(res.message || "Order placed successfully");
      refetchCart();
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

  const handleBack = () => {
    navigate("/f/gift_sending");
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 py-2">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleBack}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
          aria-label="Back to gifting"
        >
          <ArrowLeft size={16} />
        </button>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#00CBCF]/20 bg-[#00CBCF]/10">
            <ShoppingCart size={18} className="text-[#00CBCF]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Checkout</h1>
            <p className="mt-1 text-sm text-gray-400">
              Confirm your delivery details and place your order.
            </p>
          </div>
        </div>
      </div>

      {/* Order placed success */}
      {placedOrder ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-[#00CBCF]/20 bg-[#00CBCF]/5 p-10 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[#00CBCF]/30 bg-[#00CBCF]/10">
            <CheckCircle2 size={28} className="text-[#00CBCF]" />
          </div>
          <div>
            <p className="text-lg font-semibold text-white">
              Order placed successfully
            </p>
            <p className="mt-1 text-sm text-gray-400">
              Tracking ID:{" "}
              <span className="font-mono text-[#00CBCF]">
                {placedOrder.trackingId}
              </span>
            </p>
            <p className="mt-1 text-sm text-gray-400">
              Total charged: {formatCurrency(placedOrder.total)}
            </p>
          </div>
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[#00CBCF]/30 bg-[#00CBCF]/10 px-5 text-sm font-semibold text-[#00CBCF] transition-colors hover:bg-[#00CBCF]/20"
          >
            Continue Shopping
          </button>
        </div>
      ) : (
        <>
          {/* Loading */}
          {cartLoading && (
            <div className="flex items-center justify-center gap-2.5 rounded-xl border border-white/10 bg-black/20 p-10 text-sm text-gray-300">
              <Loader2 size={18} className="animate-spin text-[#00CBCF]" />
              Loading your cart…
            </div>
          )}

          {/* Cart error */}
          {!cartLoading && cartError && (
            <div className="flex items-start gap-2.5 rounded-xl border border-red-500/20 bg-red-500/10 p-4">
              <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-400" />
              <p className="text-sm text-red-300">{cartError}</p>
            </div>
          )}

          {/* Empty cart */}
          {!cartLoading && !cartError && cartItems.length === 0 && (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-10 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                <Gift size={18} className="text-gray-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">
                  Your cart is empty
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  You can't check out with an empty cart — add some products
                  first.
                </p>
              </div>
              <button
                type="button"
                onClick={handleBack}
                className="mt-2 inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-[#00CBCF]/30 bg-[#00CBCF]/10 px-4 text-xs font-semibold text-[#00CBCF] transition-colors hover:bg-[#00CBCF]/20"
              >
                Browse Gifts
              </button>
            </div>
          )}

          {/* Checkout form */}
          {!cartLoading && !cartError && cartItems.length > 0 && (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Order summary */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <h2 className="text-sm font-semibold text-white">
                  Order Summary
                </h2>
                <div className="mt-3 space-y-2">
                  {cartItems.map((item) => (
                    <div
                      key={item.productId?._id}
                      className="flex items-center justify-between gap-3 text-sm"
                    >
                      <span className="min-w-0 flex-1 truncate text-gray-300">
                        {item.productId?.name ?? "Product"}{" "}
                        <span className="text-gray-500">
                          × {item.quantity}
                        </span>
                      </span>
                      <span className="shrink-0 text-white">
                        {formatCurrency(
                          (item.productId?.price ?? 0) * item.quantity,
                        )}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 space-y-1.5 border-t border-white/5 pt-3 text-sm">
                  <div className="flex items-center justify-between text-gray-400">
                    <span>Subtotal</span>
                    <span>{formatCurrency(itemsSubtotal)}</span>
                  </div>
                  <div className="flex items-center justify-between text-gray-400">
                    <span>Delivery Fee</span>
                    <span>
                      {selectedRate ? formatCurrency(deliveryFee) : "—"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-1 text-base font-bold text-white">
                    <span>Total</span>
                    <span className="text-[#00CBCF]">
                      {formatCurrency(grandTotal)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Delivery rate */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
                  <Truck size={14} className="text-[#00CBCF]" />
                  Delivery Option
                </h2>

                {ratesLoading && (
                  <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
                    <Loader2 size={14} className="animate-spin text-[#00CBCF]" />
                    Loading delivery options…
                  </div>
                )}

                {!ratesLoading && ratesError && (
                  <p className="mt-3 text-xs text-red-400">{ratesError}</p>
                )}

                {!ratesLoading && !ratesError && (
                  <div className="mt-3">
                    <select
                      value={form.deliveryRateId}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          deliveryRateId: e.target.value,
                        }))
                      }
                      className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white outline-none transition-colors focus:border-[#00CBCF]/60 focus:bg-black/30"
                    >
                      <option value="">Select a delivery destination…</option>
                      {rates.map((rate) => (
                        <option key={rate._id} value={rate._id}>
                          {rate.country} — {formatCurrency(rate.deliveryFee)} (
                          {rate.estimatedDeliveryDays} day
                          {rate.estimatedDeliveryDays !== 1 ? "s" : ""})
                        </option>
                      ))}
                    </select>
                    {rates.length === 0 && (
                      <p className="mt-1.5 text-xs text-gray-500">
                        No delivery options available right now.
                      </p>
                    )}
                    {formErrors.deliveryRateId && (
                      <p className="mt-1.5 text-xs text-red-400">
                        {formErrors.deliveryRateId}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Shipping address */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <h2 className="text-sm font-semibold text-white">
                  Shipping Address
                </h2>
                <div className="mt-3 space-y-3">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-400">
                      Full Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.shippingFullName}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          shippingFullName: e.target.value,
                        }))
                      }
                      placeholder="e.g. Jane Doe"
                      className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white outline-none transition-colors placeholder:text-gray-600 focus:border-[#00CBCF]/60 focus:bg-black/30"
                    />
                    {formErrors.shippingFullName && (
                      <p className="mt-1 text-xs text-red-400">
                        {formErrors.shippingFullName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-400">
                      Phone Number <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.shippingPhone}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          shippingPhone: e.target.value,
                        }))
                      }
                      placeholder="e.g. +234 800 000 0000"
                      className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white outline-none transition-colors placeholder:text-gray-600 focus:border-[#00CBCF]/60 focus:bg-black/30"
                    />
                    {formErrors.shippingPhone && (
                      <p className="mt-1 text-xs text-red-400">
                        {formErrors.shippingPhone}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-400">
                      Address <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      value={form.shippingAddress}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          shippingAddress: e.target.value,
                        }))
                      }
                      placeholder="Street address"
                      rows={2}
                      className="w-full resize-none rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none transition-colors placeholder:text-gray-600 focus:border-[#00CBCF]/60 focus:bg-black/30"
                    />
                    {formErrors.shippingAddress && (
                      <p className="mt-1 text-xs text-red-400">
                        {formErrors.shippingAddress}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-gray-400">
                        City <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={form.shippingCity}
                        onChange={(e) =>
                          setForm((p) => ({
                            ...p,
                            shippingCity: e.target.value,
                          }))
                        }
                        placeholder="e.g. Lagos"
                        className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white outline-none transition-colors placeholder:text-gray-600 focus:border-[#00CBCF]/60 focus:bg-black/30"
                      />
                      {formErrors.shippingCity && (
                        <p className="mt-1 text-xs text-red-400">
                          {formErrors.shippingCity}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-gray-400">
                        State <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={form.shippingState}
                        onChange={(e) =>
                          setForm((p) => ({
                            ...p,
                            shippingState: e.target.value,
                          }))
                        }
                        placeholder="e.g. Lagos State"
                        className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white outline-none transition-colors placeholder:text-gray-600 focus:border-[#00CBCF]/60 focus:bg-black/30"
                      />
                      {formErrors.shippingState && (
                        <p className="mt-1 text-xs text-red-400">
                          {formErrors.shippingState}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-400">
                      Postal Code
                    </label>
                    <input
                      type="text"
                      value={form.shippingPostalCode}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          shippingPostalCode: e.target.value,
                        }))
                      }
                      placeholder="Optional"
                      className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white outline-none transition-colors placeholder:text-gray-600 focus:border-[#00CBCF]/60 focus:bg-black/30"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-400">
                      Additional Info
                    </label>
                    <textarea
                      value={form.shippingAdditionalInfo}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          shippingAdditionalInfo: e.target.value,
                        }))
                      }
                      placeholder="Delivery instructions, landmark, etc. (optional)"
                      rows={2}
                      className="w-full resize-none rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none transition-colors placeholder:text-gray-600 focus:border-[#00CBCF]/60 focus:bg-black/30"
                    />
                  </div>
                </div>
              </div>

              {submitError && (
                <div className="flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2.5">
                  <AlertCircle
                    size={14}
                    className="mt-0.5 shrink-0 text-red-400"
                  />
                  <p className="text-xs text-red-300">{submitError}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="h-11 w-full inline-flex items-center justify-center gap-2 rounded-xl border border-[#00CBCF]/30 bg-[#00CBCF]/10 text-sm font-semibold text-[#00CBCF] transition-colors hover:bg-[#00CBCF]/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  `Place Order — ${formatCurrency(grandTotal)}`
                )}
              </button>
            </form>
          )}
        </>
      )}
    </div>
  );
};

export default Checkout;
