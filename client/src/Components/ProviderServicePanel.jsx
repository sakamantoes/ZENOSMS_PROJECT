import React, { useEffect, useImperativeHandle, useState } from "react";
import { AlertCircle, Loader2, RefreshCw } from "lucide-react";
import ServiceDetailPanel from "./ServiceDetailPanel.jsx";
import ServiceList from "./ServiceList.jsx";
import { setCustomPriceOnService } from "../Service/admin.js";
import {
  normalizeServiceDetailResponse,
  normalizeServiceNameResponse,
} from "../utils/adminServiceNormalizers.js";
import { getErrorMessage } from "../utils/getErrorMessage.js";

const INITIAL_LIST_STATE = {
  items: [],
  loading: false,
  error: "",
};

const INITIAL_DETAIL_STATE = {
  selected: null,
  entries: [],
  loading: false,
  error: "",
};

const INITIAL_ACTIVATION_STATE = {
  loadingId: "",
  errors: {},
};

const INITIAL_PRICE_STATE = {
  savingId: "",
  statuses: {},
  errors: {},
};

const ProviderServicePanel = React.forwardRef(
  (
    {
      provider,
      providerConfig,
      getServiceNames,
      getServiceEntries,
      toggleServiceActive,
    },
    ref,
  ) => {
    const [listState, setListState] = useState(INITIAL_LIST_STATE);
    const [detailState, setDetailState] = useState(INITIAL_DETAIL_STATE);
    const [activationState, setActivationState] = useState(
      INITIAL_ACTIVATION_STATE,
    );
    const [priceState, setPriceState] = useState(INITIAL_PRICE_STATE);

    const fetchServiceNames = async () => {
      setListState((current) => ({ ...current, loading: true, error: "" }));
      setDetailState(INITIAL_DETAIL_STATE);

      try {
        const response = await getServiceNames();
        setListState({
          items: normalizeServiceNameResponse(response, provider),
          loading: false,
          error: "",
        });
      } catch (error) {
        setListState({
          items: [],
          loading: false,
          error: getErrorMessage(
            error,
            "Unable to fetch service names right now.",
          ),
        });
      }
    };

    const fetchServiceEntries = async (service) => {
      setDetailState({
        selected: service,
        entries: [],
        loading: true,
        error: "",
      });
      setPriceState(INITIAL_PRICE_STATE);

      try {
        const response = await getServiceEntries({
          page: 1,
          limit: 100,
          service: service.name,
        });
        setDetailState({
          selected: service,
          entries: normalizeServiceDetailResponse(response, provider),
          loading: false,
          error: "",
        });
      } catch (error) {
        setDetailState((current) => ({
          ...current,
          loading: false,
          error: getErrorMessage(
            error,
            "Unable to fetch this service's entries.",
          ),
        }));
      }
    };

    useEffect(() => {
      fetchServiceNames();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [provider]);

    useImperativeHandle(ref, () => ({
      refreshSelectedService: async () => {
        if (detailState.selected) {
          await fetchServiceEntries(detailState.selected);
        }
      },
    }));

    const handleToggleActivation = async (service, active) => {
      if (!providerConfig.supportsActivationToggle || !toggleServiceActive) return;

      setActivationState((current) => ({
        ...current,
        loadingId: service.id,
        errors: { ...current.errors, [service.id]: "" },
      }));

      try {
        await toggleServiceActive(service.name, active);
        setListState((current) => ({
          ...current,
          items: current.items.map((item) =>
            item.id === service.id
              ? {
                  ...item,
                  isActive: active,
                  activeCount: active ? item.totalListings : 0,
                }
              : item,
          ),
        }));

        setDetailState((current) => ({
          ...current,
          selected:
            current.selected?.id === service.id
              ? { ...current.selected, isActive: active }
              : current.selected,
        }));
      } catch (error) {
        setActivationState((current) => ({
          ...current,
          errors: {
            ...current.errors,
            [service.id]: getErrorMessage(
              error,
              "Unable to update this service status.",
            ),
          },
        }));
      } finally {
        setActivationState((current) => ({ ...current, loadingId: "" }));
      }
    };

    const handleSavePrice = async (service, customPrice) => {
      if (
        customPrice !== null &&
        (!Number.isFinite(customPrice) || customPrice <= 0)
      ) {
        setPriceState((current) => ({
          ...current,
          errors: {
            ...current.errors,
            [service.id]:
              "Enter a valid positive price, or clear the field to use global pricing.",
          },
        }));
        return;
      }

      setPriceState((current) => ({
        ...current,
        savingId: service.id,
        statuses: { ...current.statuses, [service.id]: "" },
        errors: { ...current.errors, [service.id]: "" },
      }));

      try {
        const response = await setCustomPriceOnService(service.id, customPrice);
        const updated = normalizeServiceDetailResponse(
          { data: [response.data] },
          provider,
        )[0];

        setDetailState((current) => ({
          ...current,
          entries: current.entries.map((item) =>
            item.id === service.id ? updated : item,
          ),
        }));
        setPriceState((current) => ({
          ...current,
          statuses: { ...current.statuses, [service.id]: "saved" },
        }));
      } catch (error) {
        setPriceState((current) => ({
          ...current,
          errors: {
            ...current.errors,
            [service.id]: getErrorMessage(
              error,
              "Unable to save this custom price.",
            ),
          },
        }));
      } finally {
        setPriceState((current) => ({ ...current, savingId: "" }));
      }
    };

    return (
      <div className="space-y-5">
        {!providerConfig.supportsActivationToggle && (
          <div className="flex items-start gap-2.5 rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 py-2.5">
            <AlertCircle size={15} className="mt-0.5 shrink-0 text-amber-400" />
            <p className="text-sm text-amber-200">
              <span className="font-semibold">{providerConfig.providerName}:</span>{" "}
              Service activation toggling is not available for this provider.
            </p>
          </div>
        )}

        <div className="flex items-center justify-between gap-3">
          {!listState.loading && !listState.error && listState.items.length > 0 && (
            <p className="text-xs text-gray-400">
              <span className="font-semibold text-white">{listState.items.length}</span>{" "}
              {listState.items.length === 1 ? "service" : "services"} — click one to edit prices
            </p>
          )}
          {(listState.loading || listState.error || listState.items.length === 0) && (
            <span />
          )}
          <button
            type="button"
            onClick={fetchServiceNames}
            disabled={listState.loading}
            className="ml-auto inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 text-xs font-semibold text-gray-200 transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={13}
              className={listState.loading ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        {listState.loading && (
          <div className="flex items-center justify-center gap-2.5 rounded-xl border border-white/10 bg-black/20 p-10 text-sm text-gray-300">
            <Loader2 size={18} className="animate-spin text-green-400" />
            Loading {providerConfig.label.toLowerCase()}…
          </div>
        )}

        {!listState.loading && listState.error && (
          <div className="flex items-start gap-2.5 rounded-xl border border-red-500/20 bg-red-500/10 p-4">
            <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-400" />
            <p className="text-sm text-red-300">{listState.error}</p>
          </div>
        )}

        {!listState.loading && !listState.error && (
          <ServiceList
            services={listState.items}
            selectedServiceId={detailState.selected?.id}
            canToggleActivation={providerConfig.supportsActivationToggle}
            activationLoadingId={activationState.loadingId}
            activationErrors={activationState.errors}
            onSelect={fetchServiceEntries}
            onToggleActivation={handleToggleActivation}
          />
        )}

        <ServiceDetailPanel
          service={detailState.selected}
          items={detailState.entries}
          loading={detailState.loading}
          error={detailState.error}
          savingPriceId={priceState.savingId}
          priceStatuses={priceState.statuses}
          priceErrors={priceState.errors}
          onClose={() => setDetailState(INITIAL_DETAIL_STATE)}
          onSavePrice={handleSavePrice}
        />
      </div>
    );
  },
);

ProviderServicePanel.displayName = "ProviderServicePanel";

export default ProviderServicePanel;
