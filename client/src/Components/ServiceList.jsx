import React from "react";
import { Package } from "lucide-react";
import ServiceListItem from "./ServiceListItem.jsx";

const ServiceList = ({
  services,
  selectedServiceId,
  canToggleActivation,
  activationLoadingId,
  activationErrors,
  onSelect,
  onToggleActivation,
}) => {
  if (!services.length) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-10 text-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/10">
          <Package size={18} className="text-gray-500" />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">No services found</p>
          <p className="mt-1 text-xs text-gray-400">
            Try switching providers or clicking Refresh.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {services.map((service) => (
        <ServiceListItem
          key={service.id}
          service={service}
          isSelected={selectedServiceId === service.id}
          canToggleActivation={canToggleActivation}
          activationLoading={activationLoadingId === service.id}
          activationError={activationErrors[service.id]}
          onSelect={onSelect}
          onToggleActivation={(active) => onToggleActivation(service, active)}
        />
      ))}
    </div>
  );
};

export default ServiceList;
