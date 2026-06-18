import React, { useRef } from "react";
import { Tag } from "lucide-react";
import AdminProviderServices from "../../Components/AdminProviderServices.jsx";
import GlobalPricingSettings from "../../Components/GlobalPricingSettings.jsx";

const Servicesprice = () => {
  const providerServicesRef = useRef(null);

  return (
    <div className="space-y-6 py-2">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-500/10 border border-green-500/20">
          <Tag size={18} className="text-green-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Services &amp; Pricing</h1>
          <p className="mt-1 text-sm text-gray-400">
            Manage available services, toggle activation, and configure global pricing.
          </p>
        </div>
      </div>

      <GlobalPricingSettings
        onUpdated={() =>
          providerServicesRef.current?.refreshSelectedService?.()
        }
      />

      <AdminProviderServices ref={providerServicesRef} />
    </div>
  );
};

export default Servicesprice;
