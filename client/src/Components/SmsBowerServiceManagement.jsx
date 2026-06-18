import React from "react";
import {
  getSmsBowerServiceNames,
  getSmsBowerServices,
  toggleSmsBowerServiceActiveStatus,
} from "../Service/admin.js";
import { ADMIN_SERVICE_PROVIDERS } from "../utils/adminServiceProviders.js";
import ProviderServicePanel from "./ProviderServicePanel.jsx";

const SmsBowerServiceManagement = React.forwardRef((props, ref) => (
  <ProviderServicePanel
    ref={ref}
    provider="smsbower"
    providerConfig={ADMIN_SERVICE_PROVIDERS.smsbower}
    getServiceNames={getSmsBowerServiceNames}
    getServiceEntries={getSmsBowerServices}
    toggleServiceActive={toggleSmsBowerServiceActiveStatus}
    {...props}
  />
));

SmsBowerServiceManagement.displayName = "SmsBowerServiceManagement";

export default SmsBowerServiceManagement;
