import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Gift,
  Loader2,
  Truck,
} from "lucide-react";
import { toast } from "react-toastify";
import { getErrorMessage } from "../../utils/getErrorMessage.js";
import {
  getGiftDeliveryRates,
  getGiftProductBySlug,
  placeGiftOrder,
} from "../../Service/gifting.js";

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

const getStorageKey = (productSlug) => `gift-checkout:${productSlug}`;

const GiftCheckout = () => {
  const { productSlug } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [rates, setRates] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [placedOrder, setPlacedOrder] = useState(null);
  const [summaryOpen, setSummaryOpen] = useState(false);

  useEffect(() => {
    let active = true;
    const loadCheckout = async () => {
      setLoading(true);
      setError("");
      try {
        const [productResponse, ratesResponse] = await Promise.all([
          getGiftProductBySlug(productSlug),
          getGiftDeliveryRates(),
        ]);
        if (!active) return;
        setProduct(productResponse.data ?? null);
        setRates(ratesResponse.data ?? []);
        const saved = sessionStorage.getItem(getStorageKey(productSlug));
        if (saved) setForm({ ...EMPTY_FORM, ...JSON.parse(saved) });
      } catch (err) {
        if (active) setError(getErrorMessage(err, "Unable to load checkout."));
      } finally {
        if (active) setLoading(false);
      }
    };
    loadCheckout();
    return () => {
      active = false;
    };
  }, [productSlug]);

  const selectedRate = rates.find((rate) => rate._id === form.deliveryRateId);
  const subtotal = Number(product?.price ?? 0);
  const deliveryFee = Number(selectedRate?.deliveryFee ?? 0);
  const total = subtotal + deliveryFee;

  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setFormErrors((current) => ({ ...current, [field]: "" }));
  };

  const validateForm = () => {
    const errors = {};
    if (!form.deliveryRateId)
      errors.deliveryRateId = "Select a delivery option.";
    if (!form.shippingFullName.trim())
      errors.shippingFullName = "Full name is required.";
    if (!form.shippingPhone.trim())
      errors.shippingPhone = "Phone number is required.";
    if (!form.shippingAddress.trim())
      errors.shippingAddress = "Address is required.";
    if (!form.shippingCity.trim()) errors.shippingCity = "City is required.";
    if (!form.shippingState.trim()) errors.shippingState = "State is required.";
    return errors;
  };

  const handlePurchase = async (event) => {
    event?.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length) {
      setFormErrors(errors);
      return;
    }
    sessionStorage.setItem(getStorageKey(productSlug), JSON.stringify(form));
    setSubmitting(true);
    setError("");
    try {
      const response = await placeGiftOrder({
        productId: product._id,
        quantity: 1,
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
      });
      sessionStorage.removeItem(getStorageKey(productSlug));
      setPlacedOrder(response.data?.order ?? null);
      toast.success(response.message || "Order placed successfully");
    } catch (err) {
      setError(getErrorMessage(err, "Unable to place your order."));
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => navigate("/f/gift_sending");

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2.5 rounded-xl border border-white/10 bg-black/20 p-10 text-sm text-gray-300">
        <Loader2 size={18} className="animate-spin text-[#00CBCF]" />
        Loading checkout…
      </div>
    );
  }

  if (error && !product) {
    return (
      <div className="space-y-4">
        <div className="flex items-start gap-2.5 rounded-xl border border-red-500/20 bg-red-500/10 p-4">
          <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-400" />
          <p className="text-sm text-red-300">{error}</p>
        </div>
        <button
          type="button"
          onClick={handleBack}
          className="text-sm text-[#00CBCF]"
        >
          Back to gifts
        </button>
      </div>
    );
  }

  if (placedOrder) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-[#00CBCF]/20 bg-[#00CBCF]/5 p-10 text-center">
        <CheckCircle2 size={30} className="mx-auto text-[#00CBCF]" />
        <h1 className="mt-4 text-xl font-semibold text-white">
          Order placed successfully
        </h1>
        <p className="mt-2 text-sm text-gray-400">
          Tracking ID:{" "}
          <span className="font-mono text-[#00CBCF]">
            {placedOrder.trackingId}
          </span>
        </p>
        <p className="mt-1 text-sm text-gray-400">
          Total charged: {formatCurrency(placedOrder.total)}
        </p>
        <button
          type="button"
          onClick={handleBack}
          className="mt-6 h-10 rounded-xl border border-[#00CBCF]/30 bg-[#00CBCF]/10 px-5 text-sm font-semibold text-[#00CBCF]"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  const cardClass = "rounded-2xl border border-white/10 bg-white/5 p-5";
  const inputClass =
    "h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-white outline-none placeholder:text-gray-600 transition-colors focus:border-[#00CBCF]/60 focus:bg-black/30";
  const errorText = (field) =>
    formErrors[field] && (
      <p className="mt-1 text-xs text-red-400">{formErrors[field]}</p>
    );

  return (
    <div className="mx-auto max-w-6xl space-y-6 py-2 pb-24 lg:pb-2">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() =>
            navigate(`/f/gift_sending/${product?.category?.slug ?? ""}`)
          }
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-gray-300"
          aria-label="Go back"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">Checkout</h1>
          <p className="mt-1 text-sm text-gray-400">
            Complete delivery details and review your gift order.
          </p>
        </div>
      </div>

      <div className={`${cardClass} lg:hidden`}>
        <button
          type="button"
          onClick={() => setSummaryOpen((open) => !open)}
          className="flex w-full items-center justify-between gap-4 text-left"
        >
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
              Order total
            </p>
            <p className="mt-1 text-2xl font-bold text-[#00CBCF]">
              {formatCurrency(total)}
            </p>
          </div>
          <span className="text-xs font-semibold text-gray-400">
            {summaryOpen ? "Hide details" : "View details"}
          </span>
        </button>
        {summaryOpen && (
          <div className="mt-5 border-t border-white/10 pt-5">
            <SummaryContent
              product={product}
              subtotal={subtotal}
              deliveryFee={deliveryFee}
              selectedRate={selectedRate}
              total={total}
              form={form}
            />
          </div>
        )}
      </div>

      <form id="gift-checkout-form" onSubmit={handlePurchase}>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(320px,2fr)]">
          <div className="space-y-5">
            <div className={cardClass}>
              <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
                <Truck size={14} className="text-[#00CBCF]" /> Delivery option
              </h2>
              <select
                value={form.deliveryRateId}
                onChange={(event) =>
                  updateForm("deliveryRateId", event.target.value)
                }
                className={`${inputClass} mt-3`}
              >
                <option value="">Select a delivery destination…</option>
                {rates.map((rate) => (
                  <option key={rate._id} value={rate._id}>
                    {rate.country} — {formatCurrency(rate.deliveryFee)} (
                    {rate.estimatedDeliveryDays} day
                    {rate.estimatedDeliveryDays === 1 ? "" : "s"})
                  </option>
                ))}
              </select>
              {errorText("deliveryRateId")}
            </div>
            <div className={cardClass}>
              <h2 className="text-sm font-semibold text-white">
                Recipient information
              </h2>
              <div className="mt-3 space-y-3">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-400">
                    Full Name *
                  </label>
                  <input
                    className={inputClass}
                    value={form.shippingFullName}
                    onChange={(event) =>
                      updateForm("shippingFullName", event.target.value)
                    }
                    placeholder="e.g. Jane Doe"
                  />
                  {errorText("shippingFullName")}
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-400">
                    Phone Number *
                  </label>
                  <input
                    className={inputClass}
                    value={form.shippingPhone}
                    onChange={(event) =>
                      updateForm("shippingPhone", event.target.value)
                    }
                    placeholder="e.g. +234 800 000 0000"
                  />
                  {errorText("shippingPhone")}
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-400">
                    Address *
                  </label>
                  <textarea
                    className="w-full resize-none rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none placeholder:text-gray-600 focus:border-[#00CBCF]/60"
                    rows={2}
                    value={form.shippingAddress}
                    onChange={(event) =>
                      updateForm("shippingAddress", event.target.value)
                    }
                    placeholder="Street address"
                  />
                  {errorText("shippingAddress")}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-400">
                      City *
                    </label>
                    <input
                      className={inputClass}
                      value={form.shippingCity}
                      onChange={(event) =>
                        updateForm("shippingCity", event.target.value)
                      }
                      placeholder="e.g. Lagos"
                    />
                    {errorText("shippingCity")}
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-400">
                      State *
                    </label>
                    <input
                      className={inputClass}
                      value={form.shippingState}
                      onChange={(event) =>
                        updateForm("shippingState", event.target.value)
                      }
                      placeholder="e.g. Lagos State"
                    />
                    {errorText("shippingState")}
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-400">
                    Postal Code
                  </label>
                  <input
                    className={inputClass}
                    value={form.shippingPostalCode}
                    onChange={(event) =>
                      updateForm("shippingPostalCode", event.target.value)
                    }
                    placeholder="Optional"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-400">
                    Additional Info
                  </label>
                  <textarea
                    className="w-full resize-none rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none placeholder:text-gray-600 focus:border-[#00CBCF]/60"
                    rows={2}
                    value={form.shippingAdditionalInfo}
                    onChange={(event) =>
                      updateForm("shippingAdditionalInfo", event.target.value)
                    }
                    placeholder="Delivery instructions, landmark, etc. (optional)"
                  />
                </div>
              </div>
            </div>

            {error && (
              <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-xs text-red-300">
                {error}
              </p>
            )}
          </div>

          <aside className="hidden lg:block">
            <div className={`${cardClass} sticky top-6`}>
              <SummaryContent
                product={product}
                subtotal={subtotal}
                deliveryFee={deliveryFee}
                selectedRate={selectedRate}
                total={total}
                form={form}
              />
              <PurchaseButton
                submitting={submitting}
                disabled={!selectedRate}
                total={total}
              />
            </div>
          </aside>
        </div>
      </form>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-black/95 p-3 backdrop-blur-xl lg:hidden">
        <div className="mx-auto flex max-w-6xl items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] uppercase tracking-wider text-gray-500">
              Total
            </p>
            <p className="truncate text-lg font-bold text-[#00CBCF]">
              {formatCurrency(total)}
            </p>
          </div>
          <div className="w-1/2 max-w-xs">
            <PurchaseButton
              form="gift-checkout-form"
              submitting={submitting}
              disabled={!selectedRate}
              total={total}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const SummaryContent = ({
  product,
  subtotal,
  deliveryFee,
  selectedRate,
  total,
  form,
}) => (
  <div className="space-y-5 text-sm">
    <div>
      <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
        Gift
      </p>
      <p className="mt-1 text-base font-semibold text-white">{product.name}</p>
      <p className="mt-1 text-xs text-gray-400">Quantity: 1</p>
    </div>
    <div className="space-y-2 border-t border-white/10 pt-4">
      <div className="flex justify-between text-gray-400">
        <span>Price</span>
        <span>{formatCurrency(subtotal)}</span>
      </div>
      <div className="flex justify-between text-gray-400">
        <span>Delivery</span>
        <span>
          {selectedRate ? formatCurrency(deliveryFee) : "Unavailable"}
        </span>
      </div>
      <div className="flex items-end justify-between gap-3 border-t border-white/10 pt-4">
        <span className="font-semibold text-white">Total</span>
        <span className="text-3xl font-bold text-[#00CBCF]">
          {formatCurrency(total)}
        </span>
      </div>
    </div>
    <div className="border-t border-white/10 pt-4 text-gray-300">
      <div className="mb-2 flex items-center gap-2 font-semibold text-white">
        <Truck size={15} className="text-[#00CBCF]" /> Delivery to
      </div>
      <p>
        {form.shippingFullName || "Recipient name"} ·{" "}
        {form.shippingPhone || "Phone number"}
      </p>
      <p className="mt-1">
        {form.shippingAddress || "Address"}, {form.shippingCity || "City"},{" "}
        {form.shippingState || "State"}
      </p>
      {form.shippingAdditionalInfo && (
        <p className="mt-1 text-gray-400">{form.shippingAdditionalInfo}</p>
      )}
    </div>
  </div>
);

const PurchaseButton = ({ form, submitting, disabled, total }) => (
  <button
    type="submit"
    form={form}
    disabled={submitting || disabled}
    className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#00a5a8] to-[#00CBCF] px-4 text-sm font-semibold text-white shadow-lg shadow-[#00CBCF]/20 transition-all hover:from-[#00CBCF] hover:to-[#00e0e4] hover:shadow-[#00CBCF]/35 disabled:cursor-not-allowed disabled:opacity-60"
  >
    {submitting ? (
      <Loader2 size={17} className="animate-spin" />
    ) : (
      `Purchase Gift — ${formatCurrency(total)}`
    )}
  </button>
);

export default GiftCheckout;
