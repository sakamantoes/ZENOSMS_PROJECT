export const ADMIN_SERVICE_PROVIDERS = {
  getatext: {
    id: "getatext",
    label: "USA Services",
    providerName: "GetAText",
    supportsActivationToggle: true,
  },
  smsbower: {
    id: "smsbower",
    label: "Other Country Services",
    providerName: "SMSBower",
    supportsActivationToggle: true,
  },
};

export const ADMIN_PROVIDER_OPTIONS = [
  ADMIN_SERVICE_PROVIDERS.getatext,
  ADMIN_SERVICE_PROVIDERS.smsbower,
];
