import React, { useState } from "react";
import { Loader2, Save, TrendingUp } from "lucide-react";
import { updateGlobalPricingSettings } from "../Service/admin.js";
import { getErrorMessage } from "../utils/getErrorMessage.js";

const INITIAL_PRICING_FORM = {
  nairaRate: "",
  markupType: "percentage",
  markupValue: "",
};

const INITIAL_SUBMIT_STATE = {
  loading: false,
  status: "",
  error: "",
};

const GlobalPricingSettings = ({ onUpdated }) => {
  const [form, setForm] = useState(INITIAL_PRICING_FORM);
  const [submitState, setSubmitState] = useState(INITIAL_SUBMIT_STATE);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitState({ loading: true, status: "", error: "" });

    try {
      const data = {
        nairaRate: form.nairaRate,
        markupType: form.markupType,
        markupValue: form.markupValue,
      };

      await updateGlobalPricingSettings(data);
      setSubmitState({
        loading: false,
        status: "Global pricing updated successfully.",
        error: "",
      });
      onUpdated?.();
    } catch (error) {
      setSubmitState({
        loading: false,
        status: "",
        error: getErrorMessage(
          error,
          "Unable to update global pricing settings.",
        ),
      });
    }
  };

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-2xl">
      <div className="mb-5 flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-green-500/10 border border-green-500/20">
          <TrendingUp size={16} className="text-green-400" />
        </div>
        <div>
          <h2 className="text-base font-bold text-white">Global Pricing Settings</h2>
          <p className="mt-0.5 text-xs text-gray-400">
            USD → NGN rate and markup applied across all service prices.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid gap-4 lg:grid-cols-[1fr_1fr_1fr_auto]"
      >
        <label className="grid gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            Naira rate (USD → NGN)
          </span>
          <input
            name="nairaRate"
            value={form.nairaRate}
            onChange={handleChange}
            placeholder="e.g. 1620"
            className="h-11 rounded-xl border border-white/10 bg-black/30 px-3 text-sm text-white outline-none transition-colors placeholder:text-gray-600 focus:border-green-500/60 focus:bg-black/40"
          />
        </label>

        <label className="grid gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            Markup type
          </span>
          <select
            name="markupType"
            value={form.markupType}
            onChange={handleChange}
            className="h-11 rounded-xl border border-white/10 bg-black/30 px-3 text-sm text-white outline-none transition-colors focus:border-green-500/60 focus:bg-black/40"
          >
            <option value="percentage">Percentage (%)</option>
            <option value="fixed">Fixed (NGN)</option>
          </select>
        </label>

        <label className="grid gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            Markup value
          </span>
          <input
            name="markupValue"
            value={form.markupValue}
            onChange={handleChange}
            placeholder={form.markupType === "percentage" ? "e.g. 15" : "e.g. 200"}
            className="h-11 rounded-xl border border-white/10 bg-black/30 px-3 text-sm text-white outline-none transition-colors placeholder:text-gray-600 focus:border-green-500/60 focus:bg-black/40"
          />
        </label>

        <button
          type="submit"
          disabled={submitState.loading}
          className="flex h-11 items-center justify-center gap-2 rounded-xl bg-green-500 px-5 text-sm font-semibold text-white shadow-lg shadow-green-500/20 transition-colors hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-60 lg:self-end"
        >
          {submitState.loading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Save size={16} />
          )}
          Save
        </button>
      </form>

      {(submitState.status || submitState.error) && (
        <p
          className={`mt-4 rounded-xl border px-3 py-2.5 text-sm ${
            submitState.error
              ? "border-red-500/20 bg-red-500/10 text-red-300"
              : "border-green-500/20 bg-green-500/10 text-green-300"
          }`}
        >
          {submitState.error || submitState.status}
        </p>
      )}
    </section>
  );
};

export default GlobalPricingSettings;
