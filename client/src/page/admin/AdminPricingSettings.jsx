import React from "react";
import { TrendingUp } from "lucide-react";
import GlobalPricingSettings from "../../Components/GlobalPricingSettings.jsx";

const AdminPricingSettings = () => {
  return (
    <div className="space-y-6 py-2">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-500/10 border border-green-500/20">
          <TrendingUp size={18} className="text-green-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Global Pricing Settings</h1>
          <p className="mt-1 text-sm text-gray-400">
            Configure the USD → NGN exchange rate and markup applied across all service prices.
          </p>
        </div>
      </div>

      <GlobalPricingSettings />
    </div>
  );
};

export default AdminPricingSettings;
