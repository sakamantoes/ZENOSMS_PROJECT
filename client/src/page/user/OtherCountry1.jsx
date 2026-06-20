import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  RefreshCw,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  ChevronDown,
  ChevronRight,
  Download,
  Printer,
  Calendar,
  DollarSign,
  User,
  CreditCard,
  Activity,
  TrendingUp,
  TrendingDown,
  Wallet,
  Zap,
  Loader2,
  Ban,
  Check,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  MoreVertical,
  UserCheck,
  Users,
  FileText,
  BarChart3,
  PieChart,
  Award,
  Star,
  MessageSquare,
  Mail,
  Phone,
  MapPin,
  Globe,
  Shield,
  Settings,
  Bell,
  UserPlus,
  LogOut,
  Menu,
  X,
  Home,
  Layout,
  List,
  Package,
  TrendingUp as TrendingUpIcon,
  DollarSign as DollarSignIcon,
  BarChart,
  PieChart as PieChartIcon,
  Calendar as CalendarIcon,
  Clock as ClockIcon,
  Coins,
  ShoppingBag,
  Tag,
  Percent,
  Filter as FilterIcon,
  Grid,
  List as ListIcon,
  Minus,
  Plus,
  Info,
  Bookmark,
  BookmarkCheck,
  Sparkles,
  Rocket,
  Crown,
  ShieldCheck,
  Smartphone,
  Map,
  Flag,
  Server
} from 'lucide-react';
import { 
  getPlatformServices, 
  buyBowerService,
  getUserBalance 
} from '../../service/number';

const OtherCountry1 = () => {
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('ALL');
  const [selectedProvider, setSelectedProvider] = useState('ALL');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [buying, setBuying] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [userBalance, setUserBalance] = useState(0);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [selectedServiceToBuy, setSelectedServiceToBuy] = useState(null);
  const [serviceStats, setServiceStats] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [totalPages, setTotalPages] = useState(1);
  const [pagination, setPagination] = useState(null);

  // Get unique services for dropdown
  const uniqueServices = useMemo(() => {
    const servicesSet = new Set(services.map(s => s.internalService).filter(Boolean));
    return Array.from(servicesSet).sort();
  }, [services]);

  const uniqueCountries = useMemo(() => {
    const countriesSet = new Set(services.map(s => s.internalCountry).filter(Boolean));
    return Array.from(countriesSet).sort();
  }, [services]);

  const uniqueProviders = useMemo(() => {
    const providersSet = new Set(services.map(s => s.provider).filter(Boolean));
    return Array.from(providersSet).sort();
  }, [services]);

  // Fetch services
  const fetchServices = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getPlatformServices();
      
      if (response.success && response.data) {
        setServices(response.data);
        setServiceStats(response.services || []);
        setPagination(response.pagination);
        setTotalPages(response.pagination?.totalPages || 1);
        
        // Auto-select first service if none selected
        if (!selectedService && response.data.length > 0) {
          const firstService = response.data[0].internalService;
          setSelectedService(firstService);
        }
      } else {
        setError('Failed to load services');
      }
    } catch (err) {
      console.error('Error fetching services:', err);
      setError(err.message || 'Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  // Fetch user balance
  const fetchUserBalance = async () => {
    try {
      const response = await getUserBalance();
      if (response.success && response.data) {
        setUserBalance(response.data.balance || 0);
      }
    } catch (err) {
      console.error('Error fetching balance:', err);
    }
  };

  useEffect(() => {
    fetchServices();
    fetchUserBalance();
  }, []);

  // Filter services based on selected service and other filters
  useEffect(() => {
    let result = [...services];

    // Only show selected service
    if (selectedService && selectedService !== '') {
      result = result.filter(s => s.internalService === selectedService);
    } else {
      // If no service selected, show all but will be filtered by dropdown
      result = result;
    }

    // Search filter (within selected service)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(s => 
        s.internalCountry?.toLowerCase().includes(term) ||
        s.provider?.toLowerCase().includes(term)
      );
    }

    // Country filter
    if (selectedCountry && selectedCountry !== 'ALL') {
      result = result.filter(s => s.internalCountry === selectedCountry);
    }

    // Provider filter
    if (selectedProvider && selectedProvider !== 'ALL') {
      result = result.filter(s => s.provider === selectedProvider);
    }

    setFilteredServices(result);
    setCurrentPage(1);
  }, [services, searchTerm, selectedService, selectedCountry, selectedProvider]);

  // Handle service selection from dropdown
  const handleServiceSelect = (serviceName) => {
    setSelectedService(serviceName);
    setSearchTerm('');
    setSelectedCountry('ALL');
    setSelectedProvider('ALL');
  };

  // Handle buying
  const handleBuy = async (service) => {
    setSelectedServiceToBuy(service);
    setShowBuyModal(true);
  };

  const confirmPurchase = async () => {
    if (!selectedServiceToBuy) return;
    
    try {
      setBuying(true);
      setError(null);
      
      const payload = {
        service: selectedServiceToBuy.internalService,
        country: selectedServiceToBuy.internalCountry,
        id: selectedServiceToBuy._id
      };
      
      const response = await buyBowerService(payload);
      
      if (response.success) {
        setSuccessMessage(`Successfully purchased ${selectedServiceToBuy.internalService} number for ${selectedServiceToBuy.internalCountry}!`);
        setTimeout(() => setSuccessMessage(null), 5000);
        setShowBuyModal(false);
        setSelectedServiceToBuy(null);
        await fetchUserBalance();
        await fetchServices();
      } else {
        setError(response.message || 'Purchase failed');
        setTimeout(() => setError(null), 3000);
      }
    } catch (err) {
      console.error('Error purchasing service:', err);
      setError(err.message || 'Failed to purchase service');
      setTimeout(() => setError(null), 3000);
    } finally {
      setBuying(false);
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return '₦0.00';
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Get status color
  const getAvailabilityColor = (stock, active) => {
    if (!active) return 'bg-red-500/10 text-red-400 border-red-500/20';
    if (stock > 100) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    if (stock > 10) return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
    return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
  };

  // Get stock status label
  const getStockLabel = (stock, active) => {
    if (!active) return 'Unavailable';
    if (stock > 100) return 'In Stock';
    if (stock > 10) return 'Low Stock';
    if (stock > 0) return 'Very Low';
    return 'Out of Stock';
  };

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredServices.slice(indexOfFirstItem, indexOfLastItem);
  const totalPagesCalculated = Math.ceil(filteredServices.length / itemsPerPage);

  // Buy Modal
  const BuyModal = ({ service, onClose, onConfirm, loading }) => {
    if (!service) return null;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="relative w-full max-w-md rounded-2xl bg-gradient-to-br from-gray-900/95 to-gray-950/95 backdrop-blur-xl border border-white/10 shadow-2xl p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
          >
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
              <span className="text-sm text-white font-medium">{service.internalCountry}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
              <span className="text-sm text-gray-400">Provider</span>
              <span className="text-sm text-white font-medium">{service.provider || 'SMSBower'}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
              <span className="text-sm text-gray-400">Price</span>
              <span className="text-lg font-bold text-emerald-400">{formatCurrency(service.sellingPrice)}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
              <span className="text-sm text-gray-400">Your Balance</span>
              <span className={`text-sm font-medium ${userBalance >= service.sellingPrice ? 'text-emerald-400' : 'text-red-400'}`}>
                {formatCurrency(userBalance)}
              </span>
            </div>
          </div>

          {userBalance < service.sellingPrice && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-4">
              Insufficient balance. Please fund your wallet.
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold transition-all"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading || userBalance < service.sellingPrice}
              className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-semibold transition-all shadow-lg shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Confirm Purchase
                </>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    );
  };

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
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-center justify-between gap-4 mb-6"
        >
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
            <button
              onClick={fetchServices}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white transition-all"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </motion.div>

        {/* Success/Error Messages */}
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center gap-2"
          >
            <CheckCircle className="w-5 h-5" />
            {successMessage}
          </motion.div>
        )}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-2"
          >
            <AlertCircle className="w-5 h-5" />
            {error}
          </motion.div>
        )}

        {/* Service Selector Dropdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-xl bg-white/5 border border-white/10"
        >
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <FilterIcon className="w-4 h-4 text-emerald-400" />
              <span className="text-sm text-gray-400">Select Service:</span>
            </div>
            <div className="flex-1 min-w-[200px]">
              <select
                value={selectedService}
                onChange={(e) => handleServiceSelect(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500/50 transition-colors"
              >
                <option value="">Select a Service...</option>
                {uniqueServices.map(service => (
                  <option key={service} value={service}>{service}</option>
                ))}
              </select>
            </div>

            {selectedService && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-xs text-emerald-400">
                  Showing: {selectedService}
                </span>
                <button
                  onClick={() => handleServiceSelect('')}
                  className="ml-1 text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Additional Filters - Only show when service is selected */}
          {selectedService && (
            <div className="flex flex-wrap items-center gap-3 mt-3 pt-3 border-t border-white/5">
              <div className="flex items-center gap-2">
                <Map className="w-3.5 h-3.5 text-gray-500" />
                <span className="text-xs text-gray-400">Country:</span>
              </div>
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-300 text-xs focus:outline-none focus:border-emerald-500/50 transition-colors"
              >
                <option value="ALL">All Countries</option>
                {uniqueCountries.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>

              <div className="flex items-center gap-2 ml-2">
                <Server className="w-3.5 h-3.5 text-gray-500" />
                <span className="text-xs text-gray-400">Provider:</span>
              </div>
              <select
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-300 text-xs focus:outline-none focus:border-emerald-500/50 transition-colors"
              >
                <option value="ALL">All Providers</option>
                {uniqueProviders.map(provider => (
                  <option key={provider} value={provider}>{provider}</option>
                ))}
              </select>

              <div className="flex-1" />

              <div className="relative flex-1 min-w-[150px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search countries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-emerald-500/50 transition-colors"
                />
              </div>

              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCountry('ALL');
                  setSelectedProvider('ALL');
                }}
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white transition-colors text-xs"
              >
                Clear Filters
              </button>
            </div>
          )}
        </motion.div>

        {/* Services Grid/List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`grid ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'} gap-4`}
        >
          {!selectedService ? (
            <div className="col-span-full text-center py-16">
              <div className="flex flex-col items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <Smartphone className="w-10 h-10 text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold text-white font-['Space_Grotesk']">Select a Service</h3>
                <p className="text-gray-400 max-w-md">
                  Choose a service from the dropdown above to view available numbers and countries.
                </p>
              </div>
            </div>
          ) : currentItems.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <div className="flex flex-col items-center gap-3">
                <AlertCircle className="w-16 h-16 text-gray-600" />
                <p className="text-gray-400">No services available for {selectedService}</p>
                <p className="text-sm text-gray-500">Try adjusting your filters or select a different service</p>
              </div>
            </div>
          ) : (
            currentItems.map((service, index) => {
              const availabilityColor = getAvailabilityColor(service.stock, service.active);
              const stockLabel = getStockLabel(service.stock, service.active);
              const isAvailable = service.active && service.stock > 0;

              return (
                <motion.div
                  key={service._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`group relative rounded-xl bg-gradient-to-br from-gray-900/80 to-gray-950/80 backdrop-blur-xl border border-white/10 p-4 transition-all hover:translate-y-[-4px] hover:border-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/5 ${viewMode === 'list' ? 'flex items-center gap-6' : ''}`}
                >
                  {/* Service Icon */}
                  <div className={`${viewMode === 'list' ? 'flex-shrink-0' : ''}`}>
                    <div className={`rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 p-3 border border-emerald-500/20 ${viewMode === 'list' ? '' : 'mb-3'}`}>
                      {service.internalService === 'WhatsApp' ? (
                        <MessageSquare className="w-6 h-6 text-emerald-400" />
                      ) : service.internalService === 'Cash App' ? (
                        <DollarSign className="w-6 h-6 text-emerald-400" />
                      ) : (
                        <Smartphone className="w-6 h-6 text-emerald-400" />
                      )}
                    </div>
                  </div>

                  <div className={`flex-1 min-w-0 ${viewMode === 'list' ? 'flex items-center justify-between flex-wrap gap-3' : ''}`}>
                    <div>
                      <h3 className="font-semibold text-white truncate">{service.internalService}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <MapPin className="w-3 h-3 text-gray-500" />
                        <span className="text-sm text-gray-400 truncate">{service.internalCountry}</span>
                      </div>
                    </div>

                    <div className={`${viewMode === 'list' ? 'flex items-center gap-6' : 'mt-3 space-y-2'}`}>
                      <div className="flex items-center gap-2">
                        <Tag className="w-3 h-3 text-gray-500" />
                        <span className="text-sm font-bold text-emerald-400">{formatCurrency(service.sellingPrice)}</span>
                      </div>

                      <div className={`px-2 py-1 rounded-full text-xs border flex items-center gap-1 ${availabilityColor}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${service.active && service.stock > 0 ? 'bg-emerald-400' : 'bg-red-400'}`} />
                        {stockLabel}
                      </div>

                      {/* Show Provider Name */}
                      <div className="flex items-center gap-1.5 text-xs text-gray-400">
                        <Server className="w-3 h-3" />
                        <span className="font-medium text-gray-300">{service.provider || 'SMSBower'}</span>
                      </div>
                    </div>

                    <div className={`${viewMode === 'list' ? 'flex-shrink-0' : 'mt-3'}`}>
                      <button
                        onClick={() => isAvailable && handleBuy(service)}
                        disabled={!isAvailable}
                        className={`w-full px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                          isAvailable
                            ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40'
                            : 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {isAvailable ? (
                          <>
                            <ShoppingBag className="w-4 h-4" />
                            Buy Now
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4" />
                            Unavailable
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Stock count badge */}
                  {service.stock > 0 && service.active && (
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-400">
                      {service.stock} available
                    </div>
                  )}
                </motion.div>
              );
            })
          )}
        </motion.div>

        {/* Pagination */}
        {selectedService && filteredServices.length > itemsPerPage && (
          <div className="flex items-center justify-between p-4 mt-4 border-t border-white/5">
            <p className="text-sm text-gray-400">
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredServices.length)} of {filteredServices.length} services
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed text-gray-400 hover:text-white transition-colors"
              >
                <ChevronRight className="w-4 h-4 rotate-180" />
              </button>
              <span className="text-sm text-gray-400">
                Page {currentPage} of {totalPagesCalculated}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPagesCalculated))}
                disabled={currentPage === totalPagesCalculated}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed text-gray-400 hover:text-white transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Buy Modal */}
        <AnimatePresence>
          {showBuyModal && selectedServiceToBuy && (
            <BuyModal
              service={selectedServiceToBuy}
              onClose={() => {
                setShowBuyModal(false);
                setSelectedServiceToBuy(null);
              }}
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