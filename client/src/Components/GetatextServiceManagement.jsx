import React from "react";
import {
  getGetatextServiceNames,
  getGetatextServices,
  toogleGetatextService,
} from "../Service/admin.js";
import { ADMIN_SERVICE_PROVIDERS } from "../utils/adminServiceProviders.js";
import ProviderServicePanel from "./ProviderServicePanel.jsx";

const GetatextServiceManagement = React.forwardRef((props, ref) => (
  <ProviderServicePanel
    ref={ref}
    provider="getatext"
    providerConfig={ADMIN_SERVICE_PROVIDERS.getatext}
    getServiceNames={getGetatextServiceNames}
    getServiceEntries={getGetatextServices}
    toggleServiceActive={toogleGetatextService}
    {...props}
  />
));

GetatextServiceManagement.displayName = "GetatextServiceManagement";

export default GetatextServiceManagement;
