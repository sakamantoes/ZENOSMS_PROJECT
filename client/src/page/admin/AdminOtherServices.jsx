import React, { useEffect, useState } from "react";
import {
  AlertCircle,
  Globe,
  Loader2,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import {
  getSmsBowerServiceNames,
  getSmsBowerServices,
  toggleSmsBowerServiceActiveStatus,
  setCustomPriceOnService,
} from "../../Service/admin.js";
import {
  normalizeServiceNameResponse,
  normalizeServiceDetailResponse,
} from "../../utils/adminServiceNormalizers.js";
import { getErrorMessage } from "../../utils/getErrorMessage.js";
import ServiceList from "../../Components/ServiceList.jsx";
import ServiceDetailPanel from "../../Components/ServiceDetailPanel.jsx";

const INITIAL_LIST = { items: [], loading: false, error: "" };
const INITIAL_DETAIL = {
  selected: null,
  entries: [],
  loading: false,
  error: "",
};
const INITIAL_ACTIVATION = { loadingId: "", errors: {} };
const INITIAL_PRICE = { savingId: "", statuses: {}, errors: {} };
const INITIAL_SEARCH = { entries: [], loading: false, error: "" };

const AdminOtherServices = () => {
  const [list, setList] = useState(INITIAL_LIST);
  const [detail, setDetail] = useState(INITIAL_DETAIL);
  const [activation, setActivation] = useState(INITIAL_ACTIVATION);
  const [price, setPrice] = useState(INITIAL_PRICE);

  const [searchQuery, setSearchQuery] = useState("");
  const [search, setSearch] = useState(INITIAL_SEARCH);

  const loadServiceNames = async () => {
    setList((s) => ({ ...s, loading: true, error: "" }));
    setDetail(INITIAL_DETAIL);
    try {
      const res = await getSmsBowerServiceNames();
      setList({
        items: normalizeServiceNameResponse(res, "smsbower"),
        loading: false,
        error: "",
      });
    } catch (err) {
      setList({
        items: [],
        loading: false,
        error: getErrorMessage(err, "Unable to fetch other services."),
      });
    }
  };

  const loadServiceEntries = async (service) => {
    setDetail({ selected: service, entries: [], loading: true, error: "" });
    setPrice(INITIAL_PRICE);
    try {
      const res = await getSmsBowerServices({
        page: 1,
        limit: 100,
        service: service.name,
      });
      setDetail({
        selected: service,
        entries: normalizeServiceDetailResponse(res, "smsbower"),
        loading: false,
        error: "",
      });
    } catch (err) {
      setDetail((s) => ({
        ...s,
        loading: false,
        error: getErrorMessage(err, "Unable to fetch service entries."),
      }));
    }
  };

  useEffect(() => {
    loadServiceNames();
  }, []);

  // Debounced search against getSmsBowerServices' own `search` param
  useEffect(() => {
    const query = searchQuery.trim();
    if (!query) {
      setSearch(INITIAL_SEARCH);
      return;
    }
    setSearch((s) => ({ ...s, loading: true, error: "" }));
    const timeoutId = setTimeout(async () => {
      try {
        const res = await getSmsBowerServices({
          page: 1,
          limit: 100,
          search: query,
        });
        setSearch({
          entries: normalizeServiceDetailResponse(res, "smsbower"),
          loading: false,
          error: "",
        });
      } catch (err) {
        setSearch({
          entries: [],
          loading: false,
          error: getErrorMessage(err, "Unable to search services."),
        });
      }
    }, 400);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleToggle = async (service, active) => {
    setActivation((s) => ({
      ...s,
      loadingId: service.id,
      errors: { ...s.errors, [service.id]: "" },
    }));
    try {
      await toggleSmsBowerServiceActiveStatus(service.name, active);
      setList((s) => ({
        ...s,
        items: s.items.map((item) =>
          item.id === service.id
            ? {
                ...item,
                isActive: active,
                activeCount: active ? item.totalListings : 0,
              }
            : item,
        ),
      }));
      setDetail((s) => ({
        ...s,
        selected:
          s.selected?.id === service.id
            ? { ...s.selected, isActive: active }
            : s.selected,
      }));
    } catch (err) {
      setActivation((s) => ({
        ...s,
        errors: {
          ...s.errors,
          [service.id]: getErrorMessage(
            err,
            "Unable to update service status.",
          ),
        },
      }));
    } finally {
      setActivation((s) => ({ ...s, loadingId: "" }));
    }
  };

  const handleSavePrice = async (service, customPrice) => {
    if (
      customPrice !== null &&
      (!Number.isFinite(customPrice) || customPrice <= 0)
    ) {
      setPrice((s) => ({
        ...s,
        errors: {
          ...s.errors,
          [service.id]:
            "Enter a valid positive price, or clear to use global pricing.",
        },
      }));
      return;
    }
    setPrice((s) => ({
      ...s,
      savingId: service.id,
      statuses: { ...s.statuses, [service.id]: "" },
      errors: { ...s.errors, [service.id]: "" },
    }));
    try {
      const res = await setCustomPriceOnService(service.id, customPrice);
      const updated = normalizeServiceDetailResponse(
        { data: [res.data] },
        "smsbower",
      )[0];
      // Update whichever list is currently displaying this entry
      setDetail((s) => ({
        ...s,
        entries: s.entries.map((e) => (e.id === service.id ? updated : e)),
      }));
      setSearch((s) => ({
        ...s,
        entries: s.entries.map((e) => (e.id === service.id ? updated : e)),
      }));
      setPrice((s) => ({
        ...s,
        statuses: { ...s.statuses, [service.id]: "saved" },
      }));
    } catch (err) {
      setPrice((s) => ({
        ...s,
        errors: {
          ...s.errors,
          [service.id]: getErrorMessage(err, "Unable to save custom price."),
        },
      }));
    } finally {
      setPrice((s) => ({ ...s, savingId: "" }));
    }
  };

  const isSearching = Boolean(searchQuery.trim());

  return (
    <div className="space-y-6 py-2">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-500/10 border border-green-500/20">
          <Globe size={18} className="text-green-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Other Services</h1>
          <p className="mt-1 text-sm text-gray-400">
            Manage SMSBower international number services — toggle activation
            and set custom prices per country.
          </p>
        </div>
      </div>

      <div className="space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 sm:max-w-xs">
            <Search
              size={14}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search services…"
              className="h-9 w-full rounded-xl border border-white/10 bg-white/5 pl-9 pr-9 text-xs text-white placeholder:text-gray-500 focus:border-green-500/40 focus:outline-none focus:ring-1 focus:ring-green-500/30"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {!isSearching &&
              !list.loading &&
              !list.error &&
              list.items.length > 0 && (
                <p className="text-xs text-gray-400">
                  <span className="font-semibold text-white">
                    {list.items.length}
                  </span>{" "}
                  {list.items.length === 1 ? "service" : "services"} — click one
                  to edit prices
                </p>
              )}
            <button
              type="button"
              onClick={loadServiceNames}
              disabled={list.loading}
              className="ml-auto inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 text-xs font-semibold text-gray-200 transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                size={13}
                className={list.loading ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>
        </div>

        {isSearching ? (
          <ServiceDetailPanel
            service={{
              id: "search-results",
              name: `Results for "${searchQuery.trim()}"`,
            }}
            items={search.entries}
            loading={search.loading}
            error={search.error}
            savingPriceId={price.savingId}
            priceStatuses={price.statuses}
            priceErrors={price.errors}
            onClose={() => setSearchQuery("")}
            onSavePrice={handleSavePrice}
          />
        ) : (
          <>
            {list.loading && (
              <div className="flex items-center justify-center gap-2.5 rounded-xl border border-white/10 bg-black/20 p-10 text-sm text-gray-300">
                <Loader2 size={18} className="animate-spin text-green-400" />
                Loading other services…
              </div>
            )}

            {!list.loading && list.error && (
              <div className="flex items-start gap-2.5 rounded-xl border border-red-500/20 bg-red-500/10 p-4">
                <AlertCircle
                  size={16}
                  className="mt-0.5 shrink-0 text-red-400"
                />
                <p className="text-sm text-red-300">{list.error}</p>
              </div>
            )}

            {!list.loading && !list.error && (
              <ServiceList
                services={list.items}
                selectedServiceId={detail.selected?.id}
                canToggleActivation={true}
                activationLoadingId={activation.loadingId}
                activationErrors={activation.errors}
                onSelect={loadServiceEntries}
                onToggleActivation={handleToggle}
              />
            )}

            <ServiceDetailPanel
              service={detail.selected}
              items={detail.entries}
              loading={detail.loading}
              error={detail.error}
              savingPriceId={price.savingId}
              priceStatuses={price.statuses}
              priceErrors={price.errors}
              onClose={() => setDetail(INITIAL_DETAIL)}
              onSavePrice={handleSavePrice}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default AdminOtherServices;
