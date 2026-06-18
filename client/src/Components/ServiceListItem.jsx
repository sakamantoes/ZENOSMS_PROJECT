import React from "react";
import { ChevronRight, Globe, Layers } from "lucide-react";
import ServiceActivationSwitch from "./ServiceActivationSwitch.jsx";

const ServiceListItem = ({
  service,
  isSelected,
  canToggleActivation,
  activationLoading,
  activationError,
  onSelect,
  onToggleActivation,
}) => {
  const allActive = service.activeCount === service.totalListings && service.totalListings > 0;
  const partialActive = service.activeCount > 0 && service.activeCount < service.totalListings;

  return (
    <div
      className={`rounded-xl border p-4 transition-all duration-200 ${
        isSelected
          ? "border-green-500/50 bg-green-500/10 shadow-lg shadow-green-500/10"
          : "border-white/10 bg-white/5 hover:border-green-500/30 hover:bg-white/[0.07]"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <button
          type="button"
          onClick={() => onSelect(service)}
          className="min-w-0 flex-1 text-left"
        >
          <span className="block truncate text-sm font-semibold capitalize text-white">
            {service.name}
          </span>

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="inline-flex items-center gap-1 text-xs text-gray-400">
              <Globe size={11} />
              {service.totalCountries} {service.totalCountries === 1 ? "country" : "countries"}
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-gray-400">
              <Layers size={11} />
              {service.totalStock.toLocaleString()} stock
            </span>
          </div>

          <div className="mt-2 flex items-center gap-1.5">
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                allActive
                  ? "bg-green-500/10 border border-green-500/20 text-green-400"
                  : partialActive
                  ? "bg-amber-500/10 border border-amber-500/20 text-amber-400"
                  : "bg-white/5 border border-white/10 text-gray-500"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  allActive ? "bg-green-400" : partialActive ? "bg-amber-400" : "bg-gray-500"
                }`}
              />
              {service.activeCount}/{service.totalListings} active
            </span>
          </div>
        </button>

        <div className="flex shrink-0 flex-col items-end gap-2">
          <ServiceActivationSwitch
            checked={service.isActive}
            loading={activationLoading}
            disabled={!canToggleActivation}
            title={
              canToggleActivation
                ? "Toggle service activation"
                : "Activation toggle is not available for this provider"
            }
            onChange={onToggleActivation}
          />
          <button
            type="button"
            onClick={() => onSelect(service)}
            className={`rounded-lg p-1.5 transition-colors ${
              isSelected
                ? "text-green-400 hover:bg-green-500/20"
                : "text-gray-400 hover:bg-white/10 hover:text-white"
            }`}
            aria-label={`Open ${service.name}`}
          >
            <ChevronRight size={15} />
          </button>
        </div>
      </div>

      {activationError && (
        <p className="mt-3 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-300">
          {activationError}
        </p>
      )}
    </div>
  );
};

export default ServiceListItem;
