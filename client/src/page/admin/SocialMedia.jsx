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
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold capitalize ${cls}`}
    >
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

  return (
    <div
      className={`rounded-xl border p-3 sm:p-4 transition-colors ${
        !service.isVisible
          ? "border-red-500/15 bg-red-500/5 opacity-75"
          : hasCustomPrice
            ? "border-green-500/20 bg-green-500/5"
            : "border-white/10 bg-white/5"
      }`}
    >
      {/* Name + visibility toggle */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <p className="line-clamp-2 flex-1 text-sm font-semibold leading-snug text-white">
          {service.name}
        </p>
        <button
          type="button"
          disabled={visibilityLoading}
          onClick={() => onToggleVisibility(service)}
          className={`inline-flex h-7 shrink-0 items-center gap-1.5 rounded-lg border px-2 text-[10px] sm:px-2.5 font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 w-full sm:w-auto justify-center ${
            service.isVisible
              ? "border-green-500/20 bg-green-500/10 text-green-400 hover:bg-green-500/20"
              : "border-white/10 bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
          }`}
          aria-label={service.isVisible ? "Hide service" : "Show service"}
        >
          {visibilityLoading ? (
            <Loader2 size={11} className="animate-spin" />
          ) : service.isVisible ? (
            <Eye size={11} />
          ) : (
            <EyeOff size={11} />
          )}
          {service.isVisible ? "Visible" : "Hidden"}
        </button>
      </div>

      {/* Badges */}
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <PlatformBadge platform={service.platform} />
        <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-medium capitalize text-gray-400">
          {service.category}
        </span>
        <span
          className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
            service.status === "active"
              ? "border-green-500/20 bg-green-500/10 text-green-400"
              : "border-white/10 bg-white/5 text-gray-500"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              service.status === "active" ? "bg-green-400" : "bg-gray-500"
            }`}
          />
          {service.status}
        </span>
      </div>

      {/* Selling price + Cost price + Custom price edit */}
      <div className="mt-3 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div>
            <p className="text-base font-bold text-white">
              {displaySellingPrice != null
                ? formatNaira(displaySellingPrice)
                : "—"}
            </p>
            <p className="text-[10px] text-gray-500">Selling price</p>
          </div>
          {service.costPrice != null && (
            <div>
              <p className="text-base font-bold text-gray-400">
                {formatNaira(service.costPrice)}
              </p>
              <p className="text-[10px] text-gray-500">Cost price</p>
            </div>
          )}
        </div>
        <div className="w-full sm:w-auto sm:ml-auto">
          {isEditingPrice ? (
            <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-1.5">
              <input
                type="number"
                value={editPriceValue}
                onChange={(e) => setEditPriceValue(e.target.value)}
                placeholder="Custom price"
                className="w-full xs:w-28 rounded-lg border border-white/10 bg-black/30 px-2 py-1.5 xs:py-1 text-xs text-white outline-none transition-colors focus:border-green-500/60"
                autoFocus
                min="0"
                step="0.01"
              />
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleSavePrice}
                  disabled={customPriceLoading}
                  className="flex-1 xs:flex-none inline-flex h-8 xs:h-7 items-center justify-center rounded-lg border border-green-500/20 bg-green-500/10 text-green-400 transition-colors hover:bg-green-500/20 disabled:cursor-not-allowed disabled:opacity-60 px-3 xs:px-0 xs:w-7"
                >
                  {customPriceLoading ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <>
                      <Check size={13} className="xs:hidden" />
                      <span className="xs:hidden text-xs font-medium">Save</span>
                      <Check size={13} className="hidden xs:block" />
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="flex-1 xs:flex-none inline-flex h-8 xs:h-7 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-gray-400 transition-colors hover:bg-white/10 hover:text-white px-3 xs:px-0 xs:w-7"
                >
                  <X size={13} />
                  <span className="xs:hidden text-xs font-medium ml-1">Cancel</span>
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleEditClick}
              className={`inline-flex items-center justify-center gap-1.5 rounded-lg border px-3 py-1.5 xs:py-1 w-full xs:w-auto text-[10px] font-semibold transition-colors ${
                hasCustomPrice
                  ? "border-green-500/20 bg-green-500/10 text-green-400 hover:bg-green-500/20"
                  : "border-white/10 bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Pencil size={11} />
              {hasCustomPrice ? "Edit Custom Price" : "Set Custom Price"}
            </button>
          )}
          {customPriceError && (
            <p className="mt-1 text-[10px] text-red-300">{customPriceError}</p>
          )}
        </div>
      </div>

      {/* Pricing meta */}
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400">
        <span>
          Provider:{" "}
          <span className="text-gray-300">
            ${service.providerPrice?.toFixed(4) ?? "—"}
          </span>
        </span>
        <span>
          Min:{" "}
          <span className="text-gray-300">
            {service.min?.toLocaleString() ?? "—"}
          </span>
        </span>
        <span>
          Max:{" "}
          <span className="text-gray-300">
            {service.max?.toLocaleString() ?? "—"}
          </span>
        </span>
      </div>

      {/* Feature tags */}
      {(service.refill || service.cancel || service.dripfeed) && (
        <div className="mt-2 flex flex-wrap gap-1">
          {service.refill && (
            <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-medium text-gray-400">
              Refill
            </span>
          )}
          {service.cancel && (
            <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-medium text-gray-400">
              Cancel
            </span>
          )}
          {service.dripfeed && (
            <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-medium text-gray-400">
              Drip Feed
            </span>
          )}
        </div>
      )}

      {/* Visibility Error */}
      {visibilityError && (
        <p className="mt-2.5 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-300">
          {visibilityError}
        </p>
      )}
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
      setServices((prev) =>
        prev.map((s) => (s._id === id ? { ...s, ...res.data } : s)),
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
      setServices((prev) =>
        prev.map((s) => (s._id === id ? { ...s, ...res.data } : s)),
      );
    } catch (err) {
      setCustomPriceErrors((prev) => ({
        ...prev,
        [id]: getErrorMessage(err, "Unable to update custom price."),
      }));
    } finally {
      setCustomPriceLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 py-2 px-2 sm:px-4">
      {/* Page header */}
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-green-500/20 bg-green-500/10">
          <Share2 size={18} className="text-green-400" />
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
      <div className="rounded-2xl border border-white/10 bg-white/5 p-3 sm:p-4">
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
              className="h-9 w-full rounded-lg border border-white/10 bg-white/5 pl-8 pr-3 text-sm text-white outline-none transition-colors placeholder:text-gray-500 focus:border-green-500/60 focus:bg-black/30"
            />
          </div>
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-3 w-full sm:w-auto">
            <select
              value={filters.platform}
              onChange={(e) => handleFilterChange("platform", e.target.value)}
              className="h-9 rounded-lg border border-white/10 bg-white/5 px-2 sm:px-3 text-xs sm:text-sm text-gray-300 outline-none transition-colors focus:border-green-500/60"
            >
              <option value="">All Platforms</option>
              {PLATFORMS.map((p) => (
                <option key={p} value={p}>
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </option>
              ))}
            </select>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange("category", e.target.value)}
              className="h-9 rounded-lg border border-white/10 bg-white/5 px-2 sm:px-3 text-xs sm:text-sm text-gray-300 outline-none transition-colors focus:border-green-500/60"
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
              className="h-9 rounded-lg border border-white/10 bg-white/5 px-2 sm:px-3 text-xs sm:text-sm text-gray-300 outline-none transition-colors focus:border-green-500/60"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <select
              value={filters.isVisible}
              onChange={(e) => handleFilterChange("isVisible", e.target.value)}
              className="h-9 rounded-lg border border-white/10 bg-white/5 px-2 sm:px-3 text-xs sm:text-sm text-gray-300 outline-none transition-colors focus:border-green-500/60"
            >
              <option value="">All Visibility</option>
              <option value="true">Visible</option>
              <option value="false">Hidden</option>
            </select>
            <button
              type="button"
              onClick={fetchServices}
              disabled={loading}
              className="col-span-2 sm:col-span-1 inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 text-xs font-semibold text-gray-200 transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
              <span className="hidden xs:inline">Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center gap-2.5 rounded-xl border border-white/10 bg-black/20 p-8 sm:p-10 text-sm text-gray-300">
          <Loader2 size={18} className="animate-spin text-green-400" />
          Loading social services…
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="flex items-start gap-2.5 rounded-xl border border-red-500/20 bg-red-500/10 p-3 sm:p-4">
          <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-400" />
          <p className="text-xs sm:text-sm text-red-300">{error}</p>
        </div>
      )}

      {/* Results */}
      {!loading && !error && (
        <>
          {services.length > 0 && (
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
          )}

          {services.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-8 sm:p-10 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                <Share2 size={18} className="text-gray-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">
                  No services found
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  Try adjusting your filters or click Refresh.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
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
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 pt-2">
              <button
                type="button"
                disabled={filters.page <= 1}
                onClick={() => handlePageChange(filters.page - 1)}
                className="inline-flex h-8 sm:h-9 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 sm:px-3.5 text-xs font-semibold text-gray-200 transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <span className="hidden xs:inline">Previous</span>
                <span className="xs:hidden">Prev</span>
              </button>
              <span className="text-xs text-gray-400">
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
                className="inline-flex h-8 sm:h-9 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 sm:px-3.5 text-xs font-semibold text-gray-200 transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
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