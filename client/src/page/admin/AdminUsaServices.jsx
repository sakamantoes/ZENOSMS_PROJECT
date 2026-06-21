import React, { useRef } from "react";
import { Phone } from "lucide-react";
import GetatextServiceManagement from "../../Components/GetatextServiceManagement.jsx";

const AdminUsaServices = () => {
  const panelRef = useRef(null);

  return (
    <div className="space-y-6 py-2">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-500/10 border border-green-500/20">
          <Phone size={18} className="text-green-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">USA Services</h1>
          <p className="mt-1 text-sm text-gray-400">
            Manage GetAText USA number services — toggle activation and set custom prices per country.
          </p>
        </div>
      </div>

      <GetatextServiceManagement ref={panelRef} />
    </div>
  );
};

export default AdminUsaServices;
