import React from "react";
import { AlertCircle, Globe, Layers, Loader2, X } from "lucide-react";
import ServicePriceEditor from "./ServicePriceEditor.jsx";

const StatBadge = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5">
    <Icon size={12} className="shrink-0 text-gray-500" />
    <span className="text-xs text-gray-400">
      <span className="font-semibold text-white">{value}</span> {label}
    </span>
  </div>
);

const ServiceDetailPanel = ({
  service,
  items,
  loading,
  error,
  savingPriceId,
  priceStatuses,
  priceErrors,
  onClose,
  onSavePrice,
}) => {
  if (!service) return null;

const activeCount = items.filter((i) => i.isActive).length;
const customPriceCount = items.filter((i) => i.customPrice != null).length;
const totalCountries = service.totalCountries ?? items.length;
const totalStock =
  service.totalStock ?? items.reduce((sum, i) => sum + (i.stock ?? 0), 0);
  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-2xl">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-base font-bold capitalize text-white">
            {service.name}
          </h3>
          <p className="mt-0.5 text-xs text-gray-400">
            Country listings — edit custom prices or leave blank to use global pricing.
          </p>

          {!loading && !error && items.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              <StatBadge icon={Globe} label="countries" value={totalCountries} />
              <StatBadge icon={Layers} label="stock" value={totalStock.toLocaleString()} />
              {customPriceCount > 0 && (
                <div className="flex items-center gap-1.5 rounded-lg border border-green-500/20 bg-green-500/10 px-2.5 py-1.5">
                  <span className="text-xs text-green-300">
                    <span className="font-semibold">{customPriceCount}</span> custom{" "}
                    {customPriceCount === 1 ? "price" : "prices"} set
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
          aria-label="Close service details"
        >
          <X size={17} />
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center gap-2.5 rounded-xl border border-white/10 bg-black/20 p-10 text-sm text-gray-300">
          <Loader2 size={18} className="animate-spin text-green-400" />
          Loading country listings…
        </div>
      )}

      {!loading && error && (
        <div className="flex items-start gap-2.5 rounded-xl border border-red-500/20 bg-red-500/10 p-4">
          <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-400" />
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {!loading && !error && !items.length && (
        <div className="rounded-xl border border-white/10 bg-black/20 p-8 text-center text-sm text-gray-400">
          No country listings found for this service.
        </div>
      )}

      {!loading && !error && items.length > 0 && (
        <div className="grid gap-2.5">
          {items.map((item) => (
            <ServicePriceEditor
              key={item.id}
              service={item}
              saving={savingPriceId === item.id}
              status={priceStatuses[item.id]}
              error={priceErrors[item.id]}
              onSave={onSavePrice}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default ServiceDetailPanel;
