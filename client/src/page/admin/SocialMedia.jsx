import React, { useEffect, useState } from "react";
import {
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
  RefreshCw,
  Search,
  Share2,
} from "lucide-react";
import { formatNaira } from "../../utils/formatMoney.js";
import { getErrorMessage } from "../../utils/getErrorMessage.js";
import {
  getSocialServices,
  updateSocialServiceVisibility,
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
}) => {
  const hasCustomPrice = service.customPrice != null;

  const displaySellingPrice = service.sellingPrice ?? service.customPrice;

  return (
    <div
      className={`rounded-xl border p-4 transition-colors ${
        !service.isVisible
          ? "border-red-500/15 bg-red-500/5 opacity-75"
          : hasCustomPrice
            ? "border-green-500/20 bg-green-500/5"
            : "border-white/10 bg-white/5"
      }`}
    >
      {/* Name + visibility toggle */}
      <div className="flex items-start justify-between gap-2">
        <p className="line-clamp-2 flex-1 text-sm font-semibold leading-snug text-white">
          {service.name}
        </p>
        <button
          type="button"
          disabled={visibilityLoading}
          onClick={() => onToggleVisibility(service)}
          className={`inline-flex h-7 shrink-0 items-center gap-1.5 rounded-lg border px-2.5 text-[10px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
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

      {/* Selling price + Cost price */}
      <div className="mt-3 flex items-center gap-4">
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

      {/* Error */}
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

  return (
    <div className="space-y-6 py-2">
      {/* Page header */}
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-green-500/20 bg-green-500/10">
          <Share2 size={18} className="text-green-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">
            Social Media Boosting
          </h1>
          <p className="mt-1 text-sm text-gray-400">
            Manage social media services — control visibility, set custom
            prices, and configure what users can order.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative min-w-48 flex-1">
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
          <select
            value={filters.platform}
            onChange={(e) => handleFilterChange("platform", e.target.value)}
            className="h-9 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-gray-300 outline-none transition-colors focus:border-green-500/60"
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
            className="h-9 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-gray-300 outline-none transition-colors focus:border-green-500/60"
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
            className="h-9 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-gray-300 outline-none transition-colors focus:border-green-500/60"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <select
            value={filters.isVisible}
            onChange={(e) => handleFilterChange("isVisible", e.target.value)}
            className="h-9 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-gray-300 outline-none transition-colors focus:border-green-500/60"
          >
            <option value="">All Visibility</option>
            <option value="true">Visible</option>
            <option value="false">Hidden</option>
          </select>
          <button
            type="button"
            onClick={fetchServices}
            disabled={loading}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 text-xs font-semibold text-gray-200 transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center gap-2.5 rounded-xl border border-white/10 bg-black/20 p-10 text-sm text-gray-300">
          <Loader2 size={18} className="animate-spin text-green-400" />
          Loading social services…
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="flex items-start gap-2.5 rounded-xl border border-red-500/20 bg-red-500/10 p-4">
          <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-400" />
          <p className="text-sm text-red-300">{error}</p>
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
            <div className="flex flex-col items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-10 text-center">
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
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {services.map((service) => (
                <SocialServiceCard
                  key={service._id}
                  service={service}
                  visibilityLoading={!!visibilityLoading[service._id]}
                  visibilityError={visibilityErrors[service._id] ?? ""}
                  onToggleVisibility={handleToggleVisibility}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                disabled={filters.page <= 1}
                onClick={() => handlePageChange(filters.page - 1)}
                className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 text-xs font-semibold text-gray-200 transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
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
                className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 text-xs font-semibold text-gray-200 transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SocialMedia;
