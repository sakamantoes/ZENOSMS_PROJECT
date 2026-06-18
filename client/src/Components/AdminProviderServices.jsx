import React, { useRef, useState } from "react";
import { Layers } from "lucide-react";
import GetatextServiceManagement from "./GetatextServiceManagement.jsx";
import ProviderToggle from "./ProviderToggle.jsx";
import SmsBowerServiceManagement from "./SmsBowerServiceManagement.jsx";

const AdminProviderServices = React.forwardRef((props, ref) => {
  const [activeProvider, setActiveProvider] = useState("getatext");
  const activePanelRef = useRef(null);

  React.useImperativeHandle(ref, () => ({
    refreshSelectedService: () =>
      activePanelRef.current?.refreshSelectedService?.(),
  }));

  return (
    <section className="space-y-5 rounded-2xl border border-white/10 bg-white/5 p-5 shadow-2xl">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-green-500/10 border border-green-500/20">
            <Layers size={16} className="text-green-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Provider Services</h2>
            <p className="mt-0.5 text-xs text-gray-400">
              Select a provider, pick a service, then adjust prices per country.
            </p>
          </div>
        </div>

        <ProviderToggle
          activeProvider={activeProvider}
          onChange={setActiveProvider}
        />
      </div>

      {activeProvider === "getatext" ? (
        <GetatextServiceManagement ref={activePanelRef} {...props} />
      ) : (
        <SmsBowerServiceManagement ref={activePanelRef} {...props} />
      )}
    </section>
  );
});

AdminProviderServices.displayName = "AdminProviderServices";

export default AdminProviderServices;
