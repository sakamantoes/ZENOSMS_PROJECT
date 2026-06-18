import React from "react";
import { ADMIN_PROVIDER_OPTIONS } from "../utils/adminServiceProviders.js";

const ProviderToggle = ({ activeProvider, onChange, disabled = false }) => {
  return (
    <div className="inline-flex w-full rounded-xl border border-white/10 bg-white/5 p-1 sm:w-auto">
      {ADMIN_PROVIDER_OPTIONS.map((provider) => {
        const isActive = activeProvider === provider.id;

        return (
          <button
            key={provider.id}
            type="button"
            disabled={disabled}
            onClick={() => onChange(provider.id)}
            className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition-all duration-200 sm:flex-none sm:px-4 ${
              isActive
                ? "bg-green-500 text-white shadow-lg shadow-green-500/20"
                : "text-gray-400 hover:bg-white/5 hover:text-white"
            } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
          >
            {provider.label}
          </button>
        );
      })}
    </div>
  );
};

export default ProviderToggle;
