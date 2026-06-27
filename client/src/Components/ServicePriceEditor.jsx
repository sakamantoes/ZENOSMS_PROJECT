import React, { useEffect, useState } from "react";
import { CheckCircle, Loader2, Save } from "lucide-react";
import { formatNaira, formatUsd } from "../utils/formatMoney.js";

const ServicePriceEditor = ({ service, saving, status, error, onSave }) => {
  const [value, setValue] = useState("");

  useEffect(() => {
    setValue(service.customPrice ?? service.displayPrice ?? "");
  }, [service.id, service.customPrice, service.displayPrice]);

  const handleSave = () => {
    const nextValue = value === "" ? null : Number(value);
    onSave(service, nextValue);
  };

  return (
    <div
      className="rounded-xl border border-white/10 bg-black/20 p-4 transition-colors"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-sm font-semibold capitalize text-white">
              {service.country || service.providerCountry || "Unknown country"}
            </p>
            {!service.isActive && (
              <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-semibold text-gray-500">
                Inactive
              </span>
            )}
          </div>

          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400">
            <span>
              Cost:{" "}
              <span className="text-gray-300">{formatNaira(service.costPrice)}</span>
            </span>
            <span>
              Selling:{" "}
              <span className="text-gray-300">{formatNaira(service.sellingPrice)}</span>
            </span>
            <span>
              Provider:{" "}
              <span className="text-blue-300">{formatUsd(service.providerPrice)}</span>
            </span>
            <span>
              Stock:{" "}
              <span className="text-gray-300">{service.stock.toLocaleString()}</span>
            </span>
          </div>
        </div>

        <div className="flex w-full items-center gap-2 sm:w-auto">
          <input
            type="number"
            min="0"
            step="1"
            value={value}
            disabled={saving}
            onChange={(event) => setValue(event.target.value)}
            onBlur={handleSave}
            className="h-10 min-w-0 flex-1 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white outline-none transition-colors placeholder:text-gray-500 focus:border-green-500/60 focus:bg-black/30 sm:w-32 sm:flex-none"
            placeholder="Custom price"
          />
          <button
            type="button"
            disabled={saving}
            onClick={handleSave}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-gray-300 transition-colors hover:border-green-500/40 hover:bg-green-500/10 hover:text-green-400 disabled:cursor-not-allowed disabled:opacity-60"
            aria-label="Save custom price"
          >
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          </button>
        </div>
      </div>

      {status === "saved" && (
        <div className="mt-2.5 flex items-center gap-1 text-xs text-green-400">
          <CheckCircle size={12} /> Saved
        </div>
      )}

      {error && (
        <p className="mt-3 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-300">
          {error}
        </p>
      )}
    </div>
  );
};

export default ServicePriceEditor;
