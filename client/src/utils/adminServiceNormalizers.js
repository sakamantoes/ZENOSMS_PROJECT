export const normalizeServiceNameResponse = (response, provider) => {
  const rows = Array.isArray(response?.data) ? response.data : [];

  return rows.map((item) => ({
    id: item.internalService,
    name: item.internalService,
    provider,
    isActive: Boolean(item.active),
    // Use aggregate fields when present (SmsBower/Getatext names endpoint);
    // fall back to flat-entry fields for providers that return individual records.
    totalCountries: Number(item.totalCountries ?? 1),
    totalStock: Number(item.totalStock ?? item.stock ?? 0),
    activeCount: Number(item.activeCount ?? (item.active ? 1 : 0)),
    totalListings: Number(item.totalListings ?? 1),
    raw: item,
  }));
};

export const normalizeServiceDetailResponse = (response, provider) => {
  const rows = Array.isArray(response?.data) ? response.data : [];

  return rows.map((item) => {
    const fallbackPrice = item.sellingPrice ?? item.costPrice ?? item.providerPrice ?? 0;

    return {
      id: item._id,
      provider,
      name: item.internalService,
      country: item.internalCountry,
      providerService: item.providerService,
      providerCountry: item.providerCountry,
      providerId: item.providerId,
      isActive: Boolean(item.active),
      // `availability` is a SmsBower concept; when absent, treat the entry as available.
      isAvailable: item.availability != null ? Boolean(item.availability) : true,
      stock: Number(item.stock || 0),
      providerPrice: Number(item.providerPrice || 0),
      costPrice: Number(item.costPrice || 0),
      sellingPrice: Number(fallbackPrice || 0),
      customPrice: item.customPrice ?? null,
      displayPrice: Number((item.customPrice ?? fallbackPrice) || 0),
      lastFetchedAt: item.lastFetchedAt,
      raw: item,
    };
  });
};
