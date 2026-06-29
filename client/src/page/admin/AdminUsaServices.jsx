import React, { useEffect, useMemo, useState } from "react";
import { AlertCircle, Loader2, Phone, RefreshCw, Search, X } from "lucide-react";
import {
  getGetatextServices,
  getGetatextServiceNames,
  toogleGetatextService,
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

const AdminUsaServices = () => {
  const [list, setList] = useState(INITIAL_LIST);
  const [detail, setDetail] = useState(INITIAL_DETAIL);
  const [activation, setActivation] = useState(INITIAL_ACTIVATION);
  const [price, setPrice] = useState(INITIAL_PRICE);
  const [searchQuery, setSearchQuery] = useState("");

  const loadServiceNames = async () => {
    setList((s) => ({ ...s, loading: true, error: "" }));
    setDetail(INITIAL_DETAIL);
    try {
      const res = await getGetatextServices();
      setList({
        items: normalizeServiceNameResponse(res, "getatext"),
        loading: false,
        error: "",
      });
    } catch (err) {
      setList({
        items: [],
        loading: false,
        error: getErrorMessage(err, "Unable to fetch USA services."),
      });
    }
  };

  const loadServiceEntries = async (service) => {
    setDetail({ selected: service, entries: [], loading: true, error: "" });
    setPrice(INITIAL_PRICE);
    try {
      const res = await getGetatextServiceNames({
        page: 1,
        limit: 100,
        service: service.name,
      });
      setDetail({
        selected: service,
        entries: normalizeServiceDetailResponse(res, "getatext"),
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

  const handleToggle = async (service, active) => {
    setActivation((s) => ({
      ...s,
      loadingId: service.id,
      errors: { ...s.errors, [service.id]: "" },
    }));
    try {
      await toogleGetatextService(service.name, active);
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
        "getatext",
      )[0];
      setDetail((s) => ({
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

  const filteredServices = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return list.items;
    return list.items.filter((service) =>
      service.name.toLowerCase().includes(q),
    );
  }, [list.items, searchQuery]);

  return (
    <div className="space-y-6 py-2">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-500/10 border border-green-500/20">
          <Phone size={18} className="text-green-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">USA Services</h1>
          <p className="mt-1 text-sm text-gray-400">
            Manage GetAText USA number services — toggle activation and set
            custom prices.
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
              placeholder="Search services by name…"
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

          <div className="flex items-center justify-between gap-3 sm:justify-end">
            {!list.loading && !list.error && list.items.length > 0 && (
              <p className="text-xs text-gray-400">
                <span className="font-semibold text-white">
                  {filteredServices.length}
                </span>
                {searchQuery ? ` of ${list.items.length}` : ""}{" "}
                {filteredServices.length === 1 ? "service" : "services"}
              </p>
            )}
            <button
              type="button"
              onClick={loadServiceNames}
              disabled={list.loading}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 text-xs font-semibold text-gray-200 transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                size={13}
                className={list.loading ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>
        </div>

        {list.loading && (
          <div className="flex items-center justify-center gap-2.5 rounded-xl border border-white/10 bg-black/20 p-10 text-sm text-gray-300">
            <Loader2 size={18} className="animate-spin text-green-400" />
            Loading USA services…
          </div>
        )}

        {!list.loading && list.error && (
          <div className="flex items-start gap-2.5 rounded-xl border border-red-500/20 bg-red-500/10 p-4">
            <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-400" />
            <p className="text-sm text-red-300">{list.error}</p>
          </div>
        )}

        {!list.loading && !list.error && (
          <ServiceList
            services={filteredServices}
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
      </div>
    </div>
  );
};

export default AdminUsaServices;
