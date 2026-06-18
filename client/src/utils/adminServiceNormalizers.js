export const normalizeServiceNameResponse = (response, provider) => {
  const rows = Array.isArray(response?.data) ? response.data : [];

  return rows.map((item) => ({
    id: item.internalService,
    name: item.internalService,
    provider,
    isActive: Boolean(item.active),
    totalCountries: Number(item.totalCountries || 0),
    totalStock: Number(item.totalStock || 0),
    activeCount: Number(item.activeCount || 0),
    totalListings: Number(item.totalListings || 0),
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
      isAvailable: Boolean(item.availability),
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
