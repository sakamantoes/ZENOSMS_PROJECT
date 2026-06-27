import React, { useEffect, useState } from "react";
import {
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
  RefreshCw,
  Search,
  Share2,
  Pencil,
  Check,
  X,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import { formatNaira } from "../../utils/formatMoney.js";
import { getErrorMessage } from "../../utils/getErrorMessage.js";
import {
  getSocialServices,
  updateSocialServiceVisibility,
  updateSocialServiceCustomPrice,
} from "../../Service/admin.js";

const PLATFORMS = [
  "instagram",
  "tiktok",
  "youtube",
  "facebook",
  "twitter",
  "telegram",
  "spotify",
];

const CATEGORIES = [
  "followers",
  "likes",
  "views",
  "comments",
  "shares",
  "subscribers",
  "plays",
];

const PLATFORM_COLORS = {
  instagram: "bg-pink-500/10 border-pink-500/20 text-pink-400",
  tiktok: "bg-purple-500/10 border-purple-500/20 text-purple-400",
  youtube: "bg-red-500/10 border-red-500/20 text-red-400",
  facebook: "bg-blue-500/10 border-blue-500/20 text-blue-400",
  twitter: "bg-sky-500/10 border-sky-500/20 text-sky-400",
  telegram: "bg-cyan-500/10 border-cyan-500/20 text-cyan-400",
  spotify: "bg-green-500/10 border-green-500/20 text-green-400",
};

const PLATFORM_ICONS = {
  instagram: "📸",
  tiktok: "🎵",
  youtube: "▶️",
  facebook: "👍",
  twitter: "🐦",
  telegram: "✈️",
  spotify: "🎧",
};

const INITIAL_FILTERS = {
  platform: "",
  category: "",
  status: "",
  isVisible: "",
  search: "",
  page: 1,
  limit: 20,
};

const PlatformBadge = ({ platform }) => {
  const cls =
    PLATFORM_COLORS[platform?.toLowerCase()] ??
    "bg-white/5 border-white/10 text-gray-400";
  const icon = PLATFORM_ICONS[platform?.toLowerCase()] || "📱";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold capitalize ${cls}`}
    >
      <span className="text-xs">{icon}</span>
      {platform}
    </span>
  );
};

const SocialServiceCard = ({
  service,
  visibilityLoading,
  visibilityError,
  onToggleVisibility,
  onUpdateCustomPrice,
  customPriceLoading,
  customPriceError,
}) => {
  const [isEditingPrice, setIsEditingPrice] = useState(false);
  const [editPriceValue, setEditPriceValue] = useState("");
  const hasCustomPrice = service.customPrice != null;

  const displaySellingPrice = service.sellingPrice ?? service.customPrice;

  const handleEditClick = () => {
    setIsEditingPrice(true);
    setEditPriceValue(service.customPrice?.toString() || "");
  };

  const handleCancelEdit = () => {
    setIsEditingPrice(false);
    setEditPriceValue("");
  };

  const handleSavePrice = async () => {
    const price = parseFloat(editPriceValue);
    if (isNaN(price) || price < 0) {
      return;
    }
    await onUpdateCustomPrice(service, price);
    setIsEditingPrice(false);
    setEditPriceValue("");
  };

  // Calculate profit margin if both prices exist
  const profitMargin = service.costPrice && displaySellingPrice 
    ? ((displaySellingPrice - service.costPrice) / service.costPrice * 100)
    : null;

  return (
    <div
      className={`group relative overflow-hidden rounded-xl border transition-all duration-300 hover:shadow-lg hover:shadow-green-500/5 ${
        !service.isVisible
          ? "border-red-500/15 bg-red-500/5 opacity-75 hover:opacity-100"
          : hasCustomPrice
            ? "border-green-500/20 bg-gradient-to-br from-green-500/5 to-transparent hover:border-green-500/40"
            : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
      }`}
    >
      {/* Top accent bar */}
      <div
        className={`h-1 w-full ${
          service.status === "active"
            ? "bg-gradient-to-r from-green-400 to-emerald-500"
            : "bg-gradient-to-r from-gray-500 to-gray-600"
        }`}
      />

      <div className="p-4">
        {/* Header: Name + visibility toggle */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-2">
              <h3 className="text-sm font-semibold text-white line-clamp-2 leading-tight">
                {service.name}
              </h3>
              {hasCustomPrice && (
                <span className="inline-flex items-center gap-1 rounded-full bg-green-500/20 px-2 py-0.5 text-[8px] font-bold uppercase text-green-400 border border-green-500/30 shrink-0 mt-0.5">
                  <Pencil size={8} />
                  Custom
                </span>
              )}
            </div>
          </div>
          <button
            type="button"
            disabled={visibilityLoading}
            onClick={() => onToggleVisibility(service)}
            className={`inline-flex h-7 shrink-0 items-center gap-1.5 rounded-lg border px-3 text-[10px] font-semibold transition-all duration-200 hover:scale-105 ${
              service.isVisible
                ? "border-green-500/30 bg-green-500/10 text-green-400 hover:bg-green-500/20"
                : "border-white/10 bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
            }`}
          >
            {visibilityLoading ? (
              <Loader2 size={11} className="animate-spin" />
            ) : service.isVisible ? (
              <Eye size={11} />
            ) : (
              <EyeOff size={11} />
            )}
            <span className="hidden sm:inline">
              {service.isVisible ? "Visible" : "Hidden"}
            </span>
          </button>
        </div>

        {/* Badges row */}
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          <PlatformBadge platform={service.platform} />
          <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[10px] font-medium capitalize text-gray-300">
            {service.category}
          </span>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${
              service.status === "active"
                ? "border-green-500/30 bg-green-500/10 text-green-400"
                : "border-white/10 bg-white/5 text-gray-500"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                service.status === "active" ? "bg-green-400 animate-pulse" : "bg-gray-500"
              }`}
            />
            {service.status}
          </span>
        </div>

        {/* Pricing section - Improved design */}
        <div className="mt-4 grid grid-cols-2 gap-3 rounded-lg bg-black/20 p-3 border border-white/5">
          <div>
            <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Selling Price</p>
            <p className="text-lg font-bold text-white mt-0.5 transition-all duration-300">
              {displaySellingPrice != null
                ? formatNaira(displaySellingPrice)
                : "—"}
            </p>
          </div>
          {service.costPrice != null && (
            <div className="relative">
              <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Cost Price</p>
              <p className="text-lg font-bold text-gray-300 mt-0.5">
                {formatNaira(service.costPrice)}
              </p>
              {profitMargin !== null && (
                <div className="absolute -top-1 -right-1">
                  <span className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[8px] font-bold ${
                    profitMargin > 20
                      ? "bg-green-500/20 text-green-400"
                      : profitMargin > 0
                      ? "bg-yellow-500/20 text-yellow-400"
                      : "bg-red-500/20 text-red-400"
                  }`}>
                    {profitMargin > 0 ? (
                      <TrendingUp size={8} />
                    ) : profitMargin < 0 ? (
                      <TrendingDown size={8} />
                    ) : (
                      <Minus size={8} />
                    )}
                    {Math.abs(profitMargin).toFixed(0)}%
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Custom price editor */}
        <div className="mt-3">
          {isEditingPrice ? (
            <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2">
              <input
                type="number"
                value={editPriceValue}
                onChange={(e) => setEditPriceValue(e.target.value)}
                placeholder="Enter custom price"
                className="flex-1 rounded-lg border border-green-500/30 bg-black/40 px-3 py-2 text-sm text-white outline-none transition-all focus:border-green-500/60 focus:ring-1 focus:ring-green-500/20"
                autoFocus
                min="0"
                step="0.01"
              />
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleSavePrice}
                  disabled={customPriceLoading}
                  className="flex-1 xs:flex-none inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-green-500/20 px-4 text-xs font-semibold text-green-400 transition-all hover:bg-green-500/30 hover:scale-105 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {customPriceLoading ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <>
                      <Check size={14} />
                      <span className="xs:hidden">Save</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="flex-1 xs:flex-none inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 text-xs font-semibold text-gray-400 transition-all hover:bg-white/10 hover:text-white"
                >
                  <X size={14} />
                  <span className="xs:hidden">Cancel</span>
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleEditClick}
              className={`inline-flex w-full items-center justify-center gap-2 rounded-lg border px-4 py-2 text-xs font-semibold transition-all hover:scale-[1.02] ${
                hasCustomPrice
                  ? "border-green-500/30 bg-green-500/10 text-green-400 hover:bg-green-500/20"
                  : "border-white/10 bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Pencil size={13} />
              {hasCustomPrice ? "Edit Custom Price" : "Set Custom Price"}
            </button>
          )}
          {customPriceError && (
            <p className="mt-1.5 text-xs text-red-300 bg-red-500/10 rounded-lg px-3 py-1.5 border border-red-500/20">
              {customPriceError}
            </p>
          )}
        </div>

        {/* Service details */}
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <span className="text-gray-600">Provider:</span>
            <span className="text-gray-300 font-mono">
              ${service.providerPrice?.toFixed(4) ?? "—"}
            </span>
          </span>
          <span className="flex items-center gap-1">
            <span className="text-gray-600">Min:</span>
            <span className="text-gray-300">
              {service.min?.toLocaleString() ?? "—"}
            </span>
          </span>
          <span className="flex items-center gap-1">
            <span className="text-gray-600">Max:</span>
            <span className="text-gray-300">
              {service.max?.toLocaleString() ?? "—"}
            </span>
          </span>
        </div>

        {/* Feature tags */}
        {(service.refill || service.cancel || service.dripfeed) && (
          <div className="mt-2.5 flex flex-wrap gap-1.5 pt-2.5 border-t border-white/5">
            {service.refill && (
              <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 py-0.5 text-[10px] font-medium text-blue-400">
                🔄 Refill
              </span>
            )}
            {service.cancel && (
              <span className="rounded-full border border-red-500/30 bg-red-500/10 px-2.5 py-0.5 text-[10px] font-medium text-red-400">
                ⏹ Cancel
              </span>
            )}
            {service.dripfeed && (
              <span className="rounded-full border border-purple-500/30 bg-purple-500/10 px-2.5 py-0.5 text-[10px] font-medium text-purple-400">
                💧 Drip Feed
              </span>
            )}
          </div>
        )}

        {/* Visibility Error */}
        {visibilityError && (
          <p className="mt-3 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-300">
            {visibilityError}
          </p>
        )}
      </div>
    </div>
  );
};

const SocialMedia = () => {
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [services, setServices] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [visibilityLoading, setVisibilityLoading] = useState({});
  const [visibilityErrors, setVisibilityErrors] = useState({});

  const [customPriceLoading, setCustomPriceLoading] = useState({});
  const [customPriceErrors, setCustomPriceErrors] = useState({});

  const fetchServices = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getSocialServices(filters);
      setServices(res.data ?? []);
      setPagination(
        res.pagination ?? { page: 1, limit: 20, total: 0, totalPages: 0 },
      );
    } catch (err) {
      setError(getErrorMessage(err, "Unable to fetch social services."));
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (page) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handleToggleVisibility = async (service) => {
    const id = service._id;
    setVisibilityLoading((prev) => ({ ...prev, [id]: true }));
    setVisibilityErrors((prev) => ({ ...prev, [id]: "" }));
    try {
      const res = await updateSocialServiceVisibility(id, !service.isVisible);
      // Update the service in the local state with the response data
      setServices((prev) =>
        prev.map((s) => {
          if (s._id === id) {
            // Merge the updated data with existing service data
            return { ...s, ...res.data };
          }
          return s;
        })
      );
    } catch (err) {
      setVisibilityErrors((prev) => ({
        ...prev,
        [id]: getErrorMessage(err, "Unable to update visibility."),
      }));
    } finally {
      setVisibilityLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleUpdateCustomPrice = async (service, customPrice) => {
    const id = service._id;
    setCustomPriceLoading((prev) => ({ ...prev, [id]: true }));
    setCustomPriceErrors((prev) => ({ ...prev, [id]: "" }));
    try {
      const res = await updateSocialServiceCustomPrice(id, customPrice);
      // Immediately update the service in the local state with the response
      setServices((prev) =>
        prev.map((s) => {
          if (s._id === id) {
            // Merge the updated data with existing service data
            return { ...s, ...res.data };
          }
          return s;
        })
      );
    } catch (err) {
      setCustomPriceErrors((prev) => ({
        ...prev,
        [id]: getErrorMessage(err, "Unable to update custom price."),
      }));
      // Re-throw the error so the card component knows it failed
      throw err;
    } finally {
      setCustomPriceLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 py-2 px-2 sm:px-4">
      {/* Page header */}
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-green-500/20 bg-gradient-to-br from-green-500/20 to-green-500/5">
          <Share2 size={20} className="text-green-400" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">
            Social Media Boosting
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-400">
            Manage social media services — control visibility, set custom
            prices, and configure what users can order.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-3 sm:p-4 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3">
          <div className="relative w-full sm:min-w-48 sm:flex-1">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
            />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              placeholder="Search services…"
              className="h-9 w-full rounded-lg border border-white/10 bg-white/5 pl-8 pr-3 text-sm text-white outline-none transition-colors placeholder:text-gray-500 focus:border-green-500/60 focus:bg-black/30 focus:ring-1 focus:ring-green-500/20"
            />
          </div>
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-3 w-full sm:w-auto">
            <select
              value={filters.platform}
              onChange={(e) => handleFilterChange("platform", e.target.value)}
              className="h-9 rounded-lg border border-white/10 bg-white/5 px-2 sm:px-3 text-xs sm:text-sm text-gray-300 outline-none transition-colors focus:border-green-500/60 focus:ring-1 focus:ring-green-500/20"
            >
              <option value="">All Platforms</option>
              {PLATFORMS.map((p) => (
                <option key={p} value={p}>
                  {PLATFORM_ICONS[p]} {p.charAt(0).toUpperCase() + p.slice(1)}
                </option>
              ))}
            </select>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange("category", e.target.value)}
              className="h-9 rounded-lg border border-white/10 bg-white/5 px-2 sm:px-3 text-xs sm:text-sm text-gray-300 outline-none transition-colors focus:border-green-500/60 focus:ring-1 focus:ring-green-500/20"
            >
              <option value="">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </option>
              ))}
            </select>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className="h-9 rounded-lg border border-white/10 bg-white/5 px-2 sm:px-3 text-xs sm:text-sm text-gray-300 outline-none transition-colors focus:border-green-500/60 focus:ring-1 focus:ring-green-500/20"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <select
              value={filters.isVisible}
              onChange={(e) => handleFilterChange("isVisible", e.target.value)}
              className="h-9 rounded-lg border border-white/10 bg-white/5 px-2 sm:px-3 text-xs sm:text-sm text-gray-300 outline-none transition-colors focus:border-green-500/60 focus:ring-1 focus:ring-green-500/20"
            >
              <option value="">All Visibility</option>
              <option value="true">Visible</option>
              <option value="false">Hidden</option>
            </select>
            <button
              type="button"
              onClick={fetchServices}
              disabled={loading}
              className="col-span-2 sm:col-span-1 inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 text-xs font-semibold text-gray-200 transition-colors hover:bg-white/10 hover:border-white/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
              <span className="hidden xs:inline">Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center gap-2.5 rounded-xl border border-white/10 bg-black/20 p-8 sm:p-10 text-sm text-gray-300 backdrop-blur-sm">
          <Loader2 size={20} className="animate-spin text-green-400" />
          Loading social services…
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="flex items-start gap-2.5 rounded-xl border border-red-500/20 bg-red-500/10 p-3 sm:p-4 backdrop-blur-sm">
          <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-400" />
          <p className="text-xs sm:text-sm text-red-300">{error}</p>
        </div>
      )}

      {/* Results */}
      {!loading && !error && (
        <>
          {services.length > 0 && (
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-400">
                Showing{" "}
                <span className="font-semibold text-white">
                  {services.length}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-white">
                  {pagination.total}
                </span>{" "}
                services
              </p>
              <div className="text-xs text-gray-500">
                <span className="hidden sm:inline">• </span>
                {pagination.totalPages} page{pagination.totalPages > 1 ? 's' : ''}
              </div>
            </div>
          )}

          {services.length === 0 ? (
            <div className="flex flex-col items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-8 sm:p-12 text-center backdrop-blur-sm">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                <Share2 size={24} className="text-gray-500" />
              </div>
              <div>
                <p className="text-base font-semibold text-white">
                  No services found
                </p>
                <p className="mt-1 text-sm text-gray-400">
                  Try adjusting your filters or click Refresh.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 sm:gap-5 md:grid-cols-2 xl:grid-cols-3">
              {services.map((service) => (
                <SocialServiceCard
                  key={service._id}
                  service={service}
                  visibilityLoading={!!visibilityLoading[service._id]}
                  visibilityError={visibilityErrors[service._id] ?? ""}
                  onToggleVisibility={handleToggleVisibility}
                  onUpdateCustomPrice={handleUpdateCustomPrice}
                  customPriceLoading={!!customPriceLoading[service._id]}
                  customPriceError={customPriceErrors[service._id] ?? ""}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 pt-3">
              <button
                type="button"
                disabled={filters.page <= 1}
                onClick={() => handlePageChange(filters.page - 1)}
                className="inline-flex h-8 sm:h-9 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 sm:px-4 text-xs font-semibold text-gray-200 transition-all hover:bg-white/10 hover:border-white/20 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <span className="hidden xs:inline">Previous</span>
                <span className="xs:hidden">Prev</span>
              </button>
              <span className="text-xs text-gray-400 px-2">
                Page{" "}
                <span className="font-semibold text-white">
                  {pagination.page}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-white">
                  {pagination.totalPages}
                </span>
              </span>
              <button
                type="button"
                disabled={filters.page >= pagination.totalPages}
                onClick={() => handlePageChange(filters.page + 1)}
                className="inline-flex h-8 sm:h-9 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 sm:px-4 text-xs font-semibold text-gray-200 transition-all hover:bg-white/10 hover:border-white/20 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <span className="hidden xs:inline">Next</span>
                <span className="xs:hidden">Next</span>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SocialMedia;