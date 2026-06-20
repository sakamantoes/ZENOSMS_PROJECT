// pages/user/OtherCountry1.jsx
//

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, RefreshCw, CheckCircle, XCircle, AlertCircle,
  ChevronRight, Tag, ShoppingBag, Wallet, Loader2,
  Check, Smartphone, Map, MessageSquare, DollarSign, X,
  Grid, List as ListIcon, Filter as FilterIcon, Globe,
} from 'lucide-react';
import {
  getPlatformServices,
  buyBowerService,
} from '../../service/number';
import { getWalletBalance } from '../../service/wallet';

// ─── Country name -> ISO alpha-2 lookup (for flag emoji) ─────────────────────
// Covers the sample dataset plus common countries likely in the full catalog.
// Add more entries here as new internalCountry values appear from the API.
const COUNTRY_ISO = {
  'united kingdom': 'GB',
  'argentinas': 'AR',
  'argentina': 'AR',
  'australia': 'AU',
  'austria': 'AT',
  'brazil': 'BR',
  'bulgaria': 'BG',
  'cameroon': 'CM',
  'canada': 'CA',
  'chile': 'CL',
  'colombia': 'CO',
  'congo': 'CG',
  "cote d`ivoire ivory coast": 'CI',
  "cote d'ivoire": 'CI',
  'ivory coast': 'CI',
  'united states': 'US',
  'usa': 'US',
  'us': 'US',
  'nigeria': 'NG',
  'ghana': 'GH',
  'kenya': 'KE',
  'south africa': 'ZA',
  'egypt': 'EG',
  'morocco': 'MA',
  'india': 'IN',
  'pakistan': 'PK',
  'bangladesh': 'BD',
  'indonesia': 'ID',
  'philippines': 'PH',
  'vietnam': 'VN',
  'thailand': 'TH',
  'malaysia': 'MY',
  'singapore': 'SG',
  'china': 'CN',
  'japan': 'JP',
  'south korea': 'KR',
  'germany': 'DE',
  'france': 'FR',
  'spain': 'ES',
  'italy': 'IT',
  'portugal': 'PT',
  'netherlands': 'NL',
  'belgium': 'BE',
  'poland': 'PL',
  'romania': 'RO',
  'greece': 'GR',
  'turkey': 'TR',
  'russia': 'RU',
  'ukraine': 'UA',
  'mexico': 'MX',
  'peru': 'PE',
  'venezuela': 'VE',
  'ecuador': 'EC',
  'bolivia': 'BO',
  'paraguay': 'PY',
  'uruguay': 'UY',
  'saudi arabia': 'SA',
  'united arab emirates': 'AE',
  'uae': 'AE',
  'israel': 'IL',
  'iraq': 'IQ',
  'iran': 'IR',
  'pakistan': 'PK',
  'sri lanka': 'LK',
  'myanmar': 'MM',
  'cambodia': 'KH',
  'laos': 'LA',
  'mongolia': 'MN',
  'kazakhstan': 'KZ',
  'uzbekistan': 'UZ',
  'algeria': 'DZ',
  'tunisia': 'TN',
  'libya': 'LY',
  'sudan': 'SD',
  'ethiopia': 'ET',
  'tanzania': 'TZ',
  'uganda': 'UG',
  'zambia': 'ZM',
  'zimbabwe': 'ZW',
  'mozambique': 'MZ',
  'angola': 'AO',
  'senegal': 'SN',
  'mali': 'ML',
  'niger': 'NE',
  'chad': 'TD',
  'somalia': 'SO',
  'rwanda': 'RW',
  'burundi': 'BI',
  'ireland': 'IE',
  'switzerland': 'CH',
  'sweden': 'SE',
  'norway': 'NO',
  'denmark': 'DK',
  'finland': 'FI',
  'iceland': 'IS',
  'czech republic': 'CZ',
  'slovakia': 'SK',
  'hungary': 'HU',
  'croatia': 'HR',
  'serbia': 'RS',
  'slovenia': 'SI',
  'bosnia and herzegovina': 'BA',
  'albania': 'AL',
  'moldova': 'MD',
  'belarus': 'BY',
  'lithuania': 'LT',
  'latvia': 'LV',
  'estonia': 'EE',
  'new zealand': 'NZ',
  'taiwan': 'TW',
  'hong kong': 'HK',
};

// FIX: convert a 2-letter ISO code into its flag emoji via the Unicode
// regional-indicator-symbol codepoint trick: 'A'->🇦 is U+1F1E6, offset from
// 'A' (U+0041) by +127397. No images, no network calls.
const isoToFlagEmoji = (iso2) => {
  if (!iso2 || iso2.length !== 2) return null;
  const codePoints = iso2
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
};

const getCountryFlag = (countryName) => {
  if (!countryName) return null;
  const iso = COUNTRY_ISO[countryName.trim().toLowerCase()];
  return iso ? isoToFlagEmoji(iso) : null;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const isSuccess = (res) => Boolean(res?.success ?? res?.sucess ?? false);

const formatCurrency = (amount) => {
  const n = Number(amount);
  if (!Number.isFinite(n)) return '₦0.00';
  return new Intl.NumberFormat('en-NG', {
    style: 'currency', currency: 'NGN', minimumFractionDigits: 2, maximumFractionDigits: 2,
  }).format(n);
};

const parseBalance = (res) => {
  const data = res?.data?.data || res?.data || res;
  if (typeof data === 'number') return data;
  if (typeof data?.balance === 'number') return data.balance;
  if (typeof data?.wallet?.balance === 'number') return data.wallet.balance;
  if (typeof data?.balance === 'string') return parseFloat(data.balance) || 0;
  if (typeof res?.balance === 'number') return res.balance;
  return 0;
};

const getAvailabilityColor = (stock, active) => {
  if (!active) return 'bg-red-500/10 text-red-400 border-red-500/20';
  if (stock > 100) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
  if (stock > 10) return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
  return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
};

const getStockLabel = (stock, active) => {
  if (!active) return 'Unavailable';
  if (stock > 100) return 'In Stock';
  if (stock > 10) return 'Low Stock';
  if (stock > 0) return 'Very Low';
  return 'Out of Stock';
};

const ServiceIcon = ({ name, className }) => {
  if (name === 'WhatsApp') return <MessageSquare className={className} />;
  if (name === 'Cash App') return <DollarSign className={className} />;
  return <Smartphone className={className} />;
};

// FIX: country label now renders its flag (emoji) before the name, with a
// graceful globe-icon fallback when no flag mapping exists for that name.
const CountryLabel = ({ name, className = '' }) => {
  const flag = getCountryFlag(name);
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      {flag ? <span className="text-base leading-none">{flag}</span> : <Globe className="w-3 h-3 text-gray-500" />}
      <span className="truncate">{name}</span>
    </span>
  );
};

// ─── Buy confirmation modal ─────────────────────────────────────────────────
const BuyModal = ({ service, balance, onClose, onConfirm, loading }) => {
  if (!service) return null;
  const canAfford = balance >= service.sellingPrice;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}>
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
        className="relative w-full max-w-md rounded-2xl bg-gradient-to-br from-gray-900/95 to-gray-950/95 backdrop-blur-xl border border-white/10 shadow-2xl p-6"
        onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
          <XCircle className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 flex items-center justify-center mx-auto mb-3 border border-emerald-500/30">
            <ShoppingBag className="w-8 h-8 text-emerald-400" />
          </div>
          <h3 className="text-xl font-bold text-white font-['Space_Grotesk']">Confirm Purchase</h3>
          <p className="text-sm text-gray-400 mt-1">You are about to purchase a number</p>
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
            <span className="text-sm text-gray-400">Service</span>
            <span className="text-sm text-white font-medium">{service.internalService}</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
            <span className="text-sm text-gray-400">Country</span>
            <CountryLabel name={service.internalCountry} className="text-sm text-white font-medium" />
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
            <span className="text-sm text-gray-400">Price</span>
            <span className="text-lg font-bold text-emerald-400">{formatCurrency(service.sellingPrice)}</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
            <span className="text-sm text-gray-400">Your Balance</span>
            <span className={`text-sm font-medium ${canAfford ? 'text-emerald-400' : 'text-red-400'}`}>
              {formatCurrency(balance)}
            </span>
          </div>
        </div>

        {!canAfford && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-4">
            Insufficient balance. Please fund your wallet.
          </div>
        )}

        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold transition-all">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={loading || !canAfford}
            className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-semibold transition-all shadow-lg shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {loading ? (<><Loader2 className="w-4 h-4 animate-spin" />Processing...</>) : (<><Check className="w-4 h-4" />Confirm Purchase</>)}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─── Service card ──────────────────────────────────────────────────────────────
const ServiceCard = ({ service, viewMode, onBuy }) => {
  const availabilityColor = getAvailabilityColor(service.stock, service.active);
  const stockLabel = getStockLabel(service.stock, service.active);
  const isAvailable = service.active && service.stock > 0;

  return (
    <motion.div layout initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className={`group relative rounded-xl bg-gradient-to-br from-gray-900/80 to-gray-950/80 backdrop-blur-xl border border-white/10 p-4 transition-all hover:translate-y-[-4px] hover:border-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/5 ${viewMode === 'list' ? 'flex items-center gap-6' : ''}`}>

      <div className={viewMode === 'list' ? 'flex-shrink-0' : ''}>
        <div className={`rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 p-3 border border-emerald-500/20 ${viewMode === 'list' ? '' : 'mb-3'}`}>
          <ServiceIcon name={service.internalService} className="w-6 h-6 text-emerald-400" />
        </div>
      </div>

      <div className={`flex-1 min-w-0 ${viewMode === 'list' ? 'flex items-center justify-between flex-wrap gap-3' : ''}`}>
        <div>
          <h3 className="font-semibold text-white truncate">{service.internalService}</h3>
          {/* FIX: flag now renders next to the country name */}
          <CountryLabel name={service.internalCountry} className="text-sm text-gray-400 mt-0.5" />
        </div>

        <div className={viewMode === 'list' ? 'flex items-center gap-6' : 'mt-3 space-y-2'}>
          <div className="flex items-center gap-2">
            <Tag className="w-3 h-3 text-gray-500" />
            <span className="text-sm font-bold text-emerald-400">{formatCurrency(service.sellingPrice)}</span>
          </div>
          <div className={`px-2 py-1 rounded-full text-xs border flex items-center gap-1 w-fit ${availabilityColor}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${isAvailable ? 'bg-emerald-400' : 'bg-red-400'}`} />
            {stockLabel}
          </div>
        </div>

        <div className={viewMode === 'list' ? 'flex-shrink-0' : 'mt-3'}>
          <button onClick={() => isAvailable && onBuy(service)} disabled={!isAvailable}
            className={`w-full px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
              isAvailable
                ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40'
                : 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
            }`}>
            {isAvailable ? (<><ShoppingBag className="w-4 h-4" />Buy Now</>) : (<><XCircle className="w-4 h-4" />Unavailable</>)}
          </button>
        </div>
      </div>

      {isAvailable && (
        <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-400">
          {service.stock} available
        </div>
      )}
    </motion.div>
  );
};

// ─── Main component ────────────────────────────────────────────────────────────
const OtherCountry1 = () => {
  const [services, setServices] = useState([]);
  const [serviceStats, setServiceStats] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, totalPages: 1 });

  const [loading, setLoading] = useState(true);
  const [fetchingPage, setFetchingPage] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('ALL');
  const [viewMode, setViewMode] = useState('grid');
  const [currentPage, setCurrentPage] = useState(1);

  const [buying, setBuying] = useState(false);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [selectedServiceToBuy, setSelectedServiceToBuy] = useState(null);

  const [userBalance, setUserBalance] = useState(0);

  const debounceRef = useRef(null);

  // ── Debounce search input -> searchTerm ──────────────────────────────────
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearchTerm(searchInput.trim());
      setCurrentPage(1);
      // FIX: a fresh search term should clear any stale country quick-filter
      // from a previous search, otherwise results can look empty for no
      // visible reason (e.g. searched "Brazil", country filter still set
      // to "Canada" from before -> 0 results, looks like search is broken).
      setSelectedCountry('ALL');
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [searchInput]);

  // ── Fetch services from the server ──────────────────────────────────────
  // FIX: searchTerm is now sent as the documented `search` query param,
  // which the API searches "across country, service, or provider" — so
  // this is a REAL server-side search, not just a label for the dropdown.
  const fetchServices = useCallback(async ({ page = 1, isInitial = false } = {}) => {
    isInitial ? setLoading(true) : setFetchingPage(true);
    setError(null);
    try {
      const response = await getPlatformServices({
        page,
        limit: pagination.limit,
        service: selectedService || undefined,
        search: searchTerm || undefined,
      });

      if (isSuccess(response) && Array.isArray(response.data)) {
        setServices(response.data);
        if (Array.isArray(response.services)) setServiceStats(response.services);
        if (response.pagination) {
          setPagination(prev => ({ ...prev, ...response.pagination }));
        }
      } else {
        setServices([]);
        setError(response?.message || 'Failed to load services');
      }
    } catch (err) {
      setServices([]);
      setError(err?.response?.data?.message || err?.message || 'Failed to load services');
    } finally {
      setLoading(false);
      setFetchingPage(false);
    }
  }, [pagination.limit, selectedService, searchTerm]);

  const fetchUserBalance = useCallback(async () => {
    try {
      const response = await getWalletBalance();
      if (isSuccess(response)) setUserBalance(parseBalance(response));
    } catch (error) {
      console.error('Failed to fetch balance:', error);
    }
  }, []);

  useEffect(() => {
    fetchServices({ page: 1, isInitial: true });
    fetchUserBalance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const didMountRef = useRef(false);
  useEffect(() => {
    if (!didMountRef.current) { didMountRef.current = true; return; }
    fetchServices({ page: currentPage });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedService, searchTerm, currentPage]);

  const serviceOptions = useMemo(
    () => serviceStats.map(s => s.internalService).filter(Boolean).sort(),
    [serviceStats]
  );

  // Countries available within the current (service+search)-filtered,
  // server-side result page — used as a quick-select shortcut.
  const countryOptions = useMemo(() => {
    const set = new Set(services.map(s => s.internalCountry).filter(Boolean));
    return Array.from(set).sort();
  }, [services]);

  const visibleServices = useMemo(() => {
    if (selectedCountry === 'ALL') return services;
    return services.filter(s => s.internalCountry === selectedCountry);
  }, [services, selectedCountry]);

  const handleServiceSelect = (name) => {
    setSelectedService(name);
    setSelectedCountry('ALL');
    setCurrentPage(1);
  };

  const clearServiceSelection = () => {
    setSelectedService('');
    setSearchInput('');
    setSearchTerm('');
    setSelectedCountry('ALL');
    setCurrentPage(1);
  };

  const handleBuy = (service) => {
    setSelectedServiceToBuy(service);
    setShowBuyModal(true);
  };

  const confirmPurchase = async () => {
    if (!selectedServiceToBuy) return;
    setBuying(true);
    setError(null);
    try {
      const payload = {
        service: selectedServiceToBuy.internalService,
        country: selectedServiceToBuy.internalCountry,
        id: selectedServiceToBuy._id,
      };
      const response = await buyBowerService(payload);

      if (isSuccess(response)) {
        setSuccessMessage(`Successfully purchased ${selectedServiceToBuy.internalService} number for ${selectedServiceToBuy.internalCountry}!`);
        setTimeout(() => setSuccessMessage(null), 5000);
        setShowBuyModal(false);
        setSelectedServiceToBuy(null);
        await fetchUserBalance();
        await fetchServices({ page: currentPage });
      } else {
        setError(response?.message || 'Purchase failed');
        setTimeout(() => setError(null), 4000);
      }
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to purchase service');
      setTimeout(() => setError(null), 4000);
    } finally {
      setBuying(false);
    }
  };

  const totalPages = pagination.totalPages || 1;
  // FIX: distinguish "nothing selected yet" from "search/filter returned 0"
  const hasActiveFilter = Boolean(selectedService || searchTerm);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black/95 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading available services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black/95 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white font-['Space_Grotesk'] flex items-center gap-3">
              <Smartphone className="w-8 h-8 text-emerald-500" />
              Virtual Numbers
            </h1>
            <p className="text-sm text-gray-400 mt-1">Browse and purchase virtual numbers for OTP verification</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <Wallet className="w-4 h-4 text-emerald-400" />
              <span className="text-sm text-white font-medium">{formatCurrency(userBalance)}</span>
            </div>
            <div className="flex items-center bg-white/5 border border-white/10 rounded-lg p-1">
              <button onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-emerald-500/20 text-emerald-400' : 'text-gray-500 hover:text-white'}`}
                title="Grid view">
                <Grid className="w-4 h-4" />
              </button>
              <button onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-emerald-500/20 text-emerald-400' : 'text-gray-500 hover:text-white'}`}
                title="List view">
                <ListIcon className="w-4 h-4" />
              </button>
            </div>
            <button onClick={() => fetchServices({ page: currentPage })} disabled={fetchingPage}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white transition-all disabled:opacity-50">
              <RefreshCw className={`w-5 h-5 ${fetchingPage ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </motion.div>

        {/* Messages */}
        <AnimatePresence>
          {successMessage && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="mb-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />{successMessage}
            </motion.div>
          )}
          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />{error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filters */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-xl bg-white/5 border border-white/10">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <FilterIcon className="w-4 h-4 text-emerald-400" />
              <span className="text-sm text-gray-400 font-medium">Select Service:</span>
            </div>
            <div className="flex-1 min-w-[200px]">
              <select
                value={selectedService}
                onChange={(e) => handleServiceSelect(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500/50 transition-colors"
                style={{ color: 'white' }}
              >
                <option value="" className="text-gray-400 bg-gray-900">All Services</option>
                {serviceOptions.map(s => (
                  <option key={s} value={s} className="text-white bg-gray-900">{s}</option>
                ))}
              </select>
            </div>

            {selectedService && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-xs text-emerald-400">Showing: {selectedService}</span>
                <button onClick={clearServiceSelection} className="ml-1 text-gray-400 hover:text-white transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-3 pt-3 border-t border-white/5">
            <div className="flex items-center gap-2">
              <Map className="w-3.5 h-3.5 text-gray-500" />
              <span className="text-xs text-gray-400 font-medium">Country:</span>
            </div>
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-300 text-xs focus:outline-none focus:border-emerald-500/50 transition-colors"
              style={{ color: 'white' }}
            >
              <option value="ALL" className="text-gray-400 bg-gray-900">All Countries</option>
              {countryOptions.map(c => (
                <option key={c} value={c} className="text-white bg-gray-900">
                  {getCountryFlag(c) ? `${getCountryFlag(c)} ${c}` : c}
                </option>
              ))}
            </select>

            <div className="flex-1" />

            {/* FIX: this input now performs a real search against the
               server (country, service, or provider), not just a local
               filter over the country dropdown. */}
            <div className="relative flex-1 min-w-[180px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
              <input
                type="text"
                placeholder="Search by country or service..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-8 pr-8 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-emerald-500/50 transition-colors"
              />
              {fetchingPage && searchInput && (
                <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-emerald-400 animate-spin" />
              )}
            </div>

            <button onClick={() => { setSearchInput(''); setSearchTerm(''); setSelectedCountry('ALL'); }}
              className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white transition-colors text-xs">
              Clear Filters
            </button>
          </div>
        </motion.div>

        {/* Grid / List */}
        <motion.div layout
          className={`grid ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'} gap-4 relative`}>
          {fetchingPage && (
            <div className="col-span-full flex items-center justify-center py-6">
              <Loader2 className="w-5 h-5 text-emerald-500 animate-spin" />
            </div>
          )}

          {!fetchingPage && visibleServices.length === 0 ? (
            <div className="col-span-full text-center py-16">
              <div className="flex flex-col items-center gap-4">
                <AlertCircle className="w-16 h-16 text-gray-600" />
                <h3 className="text-xl font-bold text-white font-['Space_Grotesk']">No services found</h3>
                <p className="text-gray-400 max-w-md">
                  {hasActiveFilter
                    ? 'No results match your current search or filters. Try a different service, country, or search term.'
                    : 'Select a service or search above to browse available numbers.'}
                </p>
              </div>
            </div>
          ) : !fetchingPage && (
            <AnimatePresence mode="popLayout">
              {visibleServices.map((service) => (
                <ServiceCard key={service._id} service={service} viewMode={viewMode} onBuy={handleBuy} />
              ))}
            </AnimatePresence>
          )}
        </motion.div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 mt-4 border-t border-white/5 flex-wrap gap-3">
            <p className="text-sm text-gray-400">
              Page {pagination.page} of {totalPages} · {pagination.total} total
            </p>
            <div className="flex items-center gap-2">
              <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1 || fetchingPage}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed text-gray-400 hover:text-white transition-colors">
                <ChevronRight className="w-4 h-4 rotate-180" />
              </button>
              <span className="text-sm text-gray-400">Page {currentPage} of {totalPages}</span>
              <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages || fetchingPage}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed text-gray-400 hover:text-white transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Buy modal */}
        <AnimatePresence>
          {showBuyModal && selectedServiceToBuy && (
            <BuyModal
              service={selectedServiceToBuy}
              balance={userBalance}
              onClose={() => { setShowBuyModal(false); setSelectedServiceToBuy(null); }}
              onConfirm={confirmPurchase}
              loading={buying}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default OtherCountry1;