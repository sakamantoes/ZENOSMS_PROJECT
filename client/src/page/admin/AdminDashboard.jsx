import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  ShoppingBag,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  Calendar,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  Eye,
  EyeOff,
  Download,
  RefreshCw,
  Filter,
  Search,
  MoreVertical,
  ChevronDown,
  ChevronUp,
  UserPlus,
  Package,
  CreditCard,
  Wallet,
  BarChart3,
  PieChart,
  LineChart,
  Settings,
  Bell,
  LogOut,
  Menu,
  X,
  Home,
  Layers,
  FileText,
  MessageCircle,
  HelpCircle,
  Shield,
  Star,
  Award,
  Zap,
  Target,
  Users as UsersIcon,
  Briefcase,
  Phone,
  Mail,
  MapPin,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock as ClockIcon
} from 'lucide-react';
import { Link } from 'react-router-dom';

// Mock Data
const mockStats = {
  totalUsers: 1247,
  totalOrders: 856,
  totalRevenue: 2847500,
  activeUsers: 892,
  newUsersToday: 23,
  ordersToday: 45,
  revenueToday: 125600,
  conversionRate: 3.8,
  avgOrderValue: 3326,
  customerLifetime: 28400,
  growthRate: 12.5,
  churnRate: 2.1
};

const mockRecentOrders = [
  {
    id: 'ORD-2026-001',
    customer: 'John Doe',
    email: 'john@example.com',
    amount: 12500,
    status: 'completed',
    date: '2026-06-18T10:30:00',
    items: 3,
    paymentMethod: 'Card'
  },
  {
    id: 'ORD-2026-002',
    customer: 'Jane Smith',
    email: 'jane@example.com',
    amount: 8400,
    status: 'pending',
    date: '2026-06-18T09:15:00',
    items: 2,
    paymentMethod: 'Bank Transfer'
  },
  {
    id: 'ORD-2026-003',
    customer: 'Michael Johnson',
    email: 'michael@example.com',
    amount: 22300,
    status: 'processing',
    date: '2026-06-18T08:45:00',
    items: 5,
    paymentMethod: 'Card'
  },
  {
    id: 'ORD-2026-004',
    customer: 'Sarah Williams',
    email: 'sarah@example.com',
    amount: 5600,
    status: 'completed',
    date: '2026-06-17T16:20:00',
    items: 1,
    paymentMethod: 'Wallet'
  },
  {
    id: 'ORD-2026-005',
    customer: 'David Brown',
    email: 'david@example.com',
    amount: 18900,
    status: 'failed',
    date: '2026-06-17T14:10:00',
    items: 4,
    paymentMethod: 'Card'
  },
  {
    id: 'ORD-2026-006',
    customer: 'Emily Davis',
    email: 'emily@example.com',
    amount: 7200,
    status: 'completed',
    date: '2026-06-17T11:30:00',
    items: 2,
    paymentMethod: 'Bank Transfer'
  }
];

const mockUsers = [
  {
    id: 'USR-001',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    phone: '+234 801 234 5678',
    status: 'active',
    joinDate: '2026-01-15',
    orders: 12,
    totalSpent: 245600,
    location: 'Lagos, Nigeria'
  },
  {
    id: 'USR-002',
    name: 'Bob Smith',
    email: 'bob@example.com',
    phone: '+234 802 345 6789',
    status: 'active',
    joinDate: '2026-02-20',
    orders: 8,
    totalSpent: 156200,
    location: 'Abuja, Nigeria'
  },
  {
    id: 'USR-003',
    name: 'Carol White',
    email: 'carol@example.com',
    phone: '+234 803 456 7890',
    status: 'inactive',
    joinDate: '2025-11-10',
    orders: 3,
    totalSpent: 43200,
    location: 'Port Harcourt, Nigeria'
  },
  {
    id: 'USR-004',
    name: 'David Green',
    email: 'david@example.com',
    phone: '+234 804 567 8901',
    status: 'active',
    joinDate: '2026-03-05',
    orders: 15,
    totalSpent: 342800,
    location: 'Ibadan, Nigeria'
  },
  {
    id: 'USR-005',
    name: 'Eva Black',
    email: 'eva@example.com',
    phone: '+234 805 678 9012',
    status: 'suspended',
    joinDate: '2025-12-01',
    orders: 6,
    totalSpent: 89100,
    location: 'Enugu, Nigeria'
  }
];

const mockRevenueData = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  datasets: [
    {
      label: 'Revenue',
      data: [45000, 52000, 48000, 61000, 58000, 72000, 68000]
    },
    {
      label: 'Orders',
      data: [12, 15, 14, 18, 16, 22, 20]
    }
  ]
};

const AdminDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [showBalance, setShowBalance] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'New order #ORD-2026-002', time: '5 mins ago', read: false },
    { id: 2, message: 'Payment failed for order #ORD-2026-005', time: '1 hour ago', read: false },
    { id: 3, message: 'New user registered: Eva Black', time: '3 hours ago', read: true },
    { id: 4, message: 'Monthly report ready for download', time: '1 day ago', read: true }
  ]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [timeRange, setTimeRange] = useState('week');

  // Simulate loading
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Filter and sort orders
  const getFilteredOrders = () => {
    let filtered = mockRecentOrders;
    
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(order => order.status === selectedStatus);
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(order => 
        order.customer.toLowerCase().includes(term) ||
        order.id.toLowerCase().includes(term) ||
        order.email.toLowerCase().includes(term)
      );
    }
    
    // Sort
    filtered.sort((a, b) => {
      switch(sortBy) {
        case 'date':
          return sortOrder === 'desc' 
            ? new Date(b.date) - new Date(a.date)
            : new Date(a.date) - new Date(b.date);
        case 'amount':
          return sortOrder === 'desc' ? b.amount - a.amount : a.amount - b.amount;
        case 'customer':
          return sortOrder === 'desc' 
            ? b.customer.localeCompare(a.customer)
            : a.customer.localeCompare(b.customer);
        default:
          return 0;
      }
    });
    
    return filtered;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-NG', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return 'text-green-400 bg-green-500/10 border-green-500/20';
      case 'pending': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'processing': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'failed': return 'text-red-400 bg-red-500/10 border-red-500/20';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'completed': return <CheckCircle className="w-3.5 h-3.5" />;
      case 'pending': return <ClockIcon className="w-3.5 h-3.5" />;
      case 'processing': return <RefreshCw className="w-3.5 h-3.5" />;
      case 'failed': return <XCircle className="w-3.5 h-3.5" />;
      default: return <AlertCircle className="w-3.5 h-3.5" />;
    }
  };

  const getStatusLabel = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const StatCard = ({ icon: Icon, label, value, change, changeType, color }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className="p-5 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all"
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2.5 rounded-lg bg-${color}-500/10`}>
          <Icon className={`w-5 h-5 text-${color}-400`} />
        </div>
        {change && (
          <span className={`text-xs font-medium flex items-center gap-0.5 px-2 py-0.5 rounded-full ${
            changeType === 'up' ? 'text-green-400 bg-green-500/10' : 'text-red-400 bg-red-500/10'
          }`}>
            {changeType === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownLeft className="w-3 h-3" />}
            {Math.abs(change)}%
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-white font-['Space_Grotesk']">
        {typeof value === 'number' ? (label === 'Revenue' || label === 'Avg Order' ? formatCurrency(value) : value.toLocaleString()) : value}
      </p>
      <p className="text-xs text-gray-400 mt-1">{label}</p>
    </motion.div>
  );

  const Sidebar = () => (
    <motion.div
      initial={{ x: -280 }}
      animate={{ x: isSidebarOpen ? 0 : -280 }}
      transition={{ duration: 0.3 }}
      className="fixed top-0 left-0 h-full w-64 bg-gray-900/95 backdrop-blur-xl border-r border-white/10 z-50 flex flex-col"
    >
      <div className="p-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-600 to-green-500 flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white font-['Space_Grotesk']">Admin Panel</h2>
            <p className="text-xs text-gray-400">Dashboard v2.0</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="space-y-1">
          <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider px-3 mb-3">Main Menu</p>
          {[
            { icon: Home, label: 'Overview', id: 'overview' },
            { icon: ShoppingBag, label: 'Orders', id: 'orders' },
            { icon: Users, label: 'Users', id: 'users' },
            { icon: BarChart3, label: 'Analytics', id: 'analytics' },
            { icon: Wallet, label: 'Transactions', id: 'transactions' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm ${
                activeTab === item.id
                  ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        <div className="mt-8 pt-8 border-t border-white/5">
          <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider px-3 mb-3">System</p>
          {[
            { icon: Settings, label: 'Settings', id: 'settings' },
            { icon: HelpCircle, label: 'Help Center', id: 'help' },
            { icon: LogOut, label: 'Logout', id: 'logout' }
          ].map((item) => (
            <button
              key={item.id}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all"
            >
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 border-t border-white/5">
        <div className="p-3 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/5 border border-green-500/20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-600 to-green-500 flex items-center justify-center">
              <Award className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-xs text-white font-medium">Admin Pro</p>
              <p className="text-[10px] text-gray-400">All access enabled</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const Header = () => (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-900/50 backdrop-blur-xl border-b border-white/10 px-6 py-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-white font-['Space_Grotesk']">
              {activeTab === 'overview' && 'Dashboard Overview'}
              {activeTab === 'orders' && 'Order Management'}
              {activeTab === 'users' && 'User Management'}
              {activeTab === 'analytics' && 'Analytics'}
              {activeTab === 'transactions' && 'Transactions'}
            </h1>
            <span className="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded-full border border-white/5">
              Live
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none outline-none text-sm text-white w-40 placeholder-gray-500"
            />
          </div>
          
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors relative"
            >
              <Bell className="w-5 h-5" />
              {notifications.filter(n => !n.read).length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 text-[10px] font-bold rounded-full bg-red-500 text-white flex items-center justify-center">
                  {notifications.filter(n => !n.read).length}
                </span>
              )}
            </button>
            
            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-y-auto rounded-xl bg-gray-900/95 backdrop-blur-xl border border-white/10 shadow-2xl z-50"
                >
                  <div className="p-4 border-b border-white/5">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-white">Notifications</p>
                      <button className="text-xs text-green-400 hover:text-green-300">
                        Mark all read
                      </button>
                    </div>
                  </div>
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`px-4 py-3 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors ${
                        !notif.read ? 'bg-green-500/5' : ''
                      }`}
                    >
                      <p className="text-sm text-gray-300">{notif.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{notif.time}</p>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-3 ml-3 pl-3 border-l border-white/10">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-600 to-green-500 flex items-center justify-center">
              <span className="text-white text-sm font-semibold">A</span>
            </div>
            <div className="hidden md:block">
              <p className="text-sm text-white font-medium">Admin User</p>
              <p className="text-xs text-gray-400">admin@company.com</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const OverviewTab = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={DollarSign}
          label="Revenue"
          value={mockStats.totalRevenue}
          change={mockStats.growthRate}
          changeType="up"
          color="green"
        />
        <StatCard
          icon={ShoppingBag}
          label="Total Orders"
          value={mockStats.totalOrders}
          change={12}
          changeType="up"
          color="blue"
        />
        <StatCard
          icon={Users}
          label="Active Users"
          value={mockStats.activeUsers}
          change={8}
          changeType="up"
          color="purple"
        />
        <StatCard
          icon={TrendingUp}
          label="Avg Order"
          value={mockStats.avgOrderValue}
          change={3.5}
          changeType="up"
          color="orange"
        />
      </div>

      {/* Revenue Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-xl bg-white/5 border border-white/10"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-sm font-medium text-white">Revenue Overview</h3>
            <p className="text-xs text-gray-400">Weekly performance</p>
          </div>
          <div className="flex gap-2">
            {['day', 'week', 'month'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  timeRange === range
                    ? 'bg-green-500 text-white'
                    : 'bg-white/5 text-gray-400 hover:text-white'
                }`}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </button>
            ))}
          </div>
        </div>
        
        {/* Simple Bar Chart */}
        <div className="h-48 flex items-end gap-2">
          {mockRevenueData.datasets[0].data.map((value, index) => {
            const max = Math.max(...mockRevenueData.datasets[0].data);
            const height = (value / max) * 100;
            return (
              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  className="w-full max-w-[40px] rounded-t-lg bg-gradient-to-t from-green-500 to-green-400 relative group"
                  style={{ height: `${height}%`, minHeight: '10px' }}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 px-2 py-0.5 rounded text-[10px] text-white whitespace-nowrap">
                    {formatCurrency(value)}
                  </div>
                </motion.div>
                <span className="text-[10px] text-gray-500">{mockRevenueData.labels[index]}</span>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Recent Orders */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="p-6 rounded-xl bg-white/5 border border-white/10"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-sm font-medium text-white">Recent Orders</h3>
            <p className="text-xs text-gray-400">Latest transactions</p>
          </div>
          <button
            onClick={() => setActiveTab('orders')}
            className="text-xs text-green-400 hover:text-green-300 transition-colors"
          >
            View all →
          </button>
        </div>

        <div className="space-y-3">
          {mockRecentOrders.slice(0, 5).map((order) => (
            <div
              key={order.id}
              className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className={`p-2 rounded-lg ${getStatusColor(order.status)}`}>
                  {getStatusIcon(order.status)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate">{order.customer}</p>
                  <p className="text-xs text-gray-400">{order.id}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-white">{formatCurrency(order.amount)}</p>
                  <p className="text-xs text-gray-400">{formatDate(order.date)}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                  {getStatusLabel(order.status)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );

  const OrdersTab = () => {
    const filteredOrders = getFilteredOrders();
    
    return (
      <div className="space-y-6">
        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10"
        >
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-400">Filters:</span>
          </div>
          
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-green-500/50"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="failed">Failed</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-green-500/50"
          >
            <option value="date">Sort by Date</option>
            <option value="amount">Sort by Amount</option>
            <option value="customer">Sort by Customer</option>
          </select>

          <button
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-colors"
          >
            {sortOrder === 'desc' ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>

          <div className="flex-1"></div>

          <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-400 hover:text-white transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
        </motion.div>

        {/* Orders Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="overflow-hidden rounded-xl bg-white/5 border border-white/10"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Order</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Payment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredOrders.map((order) => (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    whileHover={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
                    className="cursor-pointer transition-colors"
                    onClick={() => {
                      setSelectedOrder(order);
                      setShowOrderDetails(true);
                    }}
                  >
                    <td className="px-4 py-3">
                      <span className="text-sm text-white font-medium">{order.id}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm text-white">{order.customer}</p>
                        <p className="text-xs text-gray-400">{order.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400">{formatDate(order.date)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-white font-medium">{formatCurrency(order.amount)}</td>
                    <td className="px-4 py-3 text-sm text-gray-400">{order.paymentMethod}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredOrders.length === 0 && (
            <div className="text-center py-12">
              <Inbox className="w-12 h-12 text-gray-500 mx-auto mb-3" />
              <p className="text-gray-400">No orders found</p>
            </div>
          )}
        </motion.div>
      </div>
    );
  };

  const UsersTab = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-xl bg-white/5 border border-white/10"
    >
      <div className="p-4 border-b border-white/5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-white">All Users</h3>
            <p className="text-xs text-gray-400">Total: {mockUsers.length} users</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-green-600 to-green-500 text-white text-sm font-semibold hover:from-green-500 hover:to-green-400 transition-all">
            <UserPlus className="w-4 h-4" />
            Add User
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-white/5 border-b border-white/10">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">User</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Contact</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Location</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Orders</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Total Spent</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {mockUsers.map((user) => (
              <tr key={user.id} className="hover:bg-white/5 transition-colors">
                <td className="px-4 py-3">
                  <div>
                    <p className="text-sm text-white font-medium">{user.name}</p>
                    <p className="text-xs text-gray-400">{user.id}</p>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div>
                    <p className="text-sm text-gray-300">{user.email}</p>
                    <p className="text-xs text-gray-400">{user.phone}</p>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-400">{user.location}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    user.status === 'active' ? 'text-green-400 bg-green-500/10 border border-green-500/20' :
                    user.status === 'inactive' ? 'text-gray-400 bg-gray-500/10 border border-gray-500/20' :
                    'text-red-400 bg-red-500/10 border border-red-500/20'
                  }`}>
                    {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-white">{user.orders}</td>
                <td className="px-4 py-3 text-sm text-white font-medium">{formatCurrency(user.totalSpent)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );

  // Order Details Modal
  const OrderDetailsModal = () => {
    if (!selectedOrder) return null;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        onClick={() => setShowOrderDetails(false)}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="max-w-lg w-full p-6 rounded-2xl bg-gray-900/95 backdrop-blur-xl border border-white/10 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-white font-['Space_Grotesk']">{selectedOrder.id}</h3>
              <p className="text-sm text-gray-400">{selectedOrder.customer}</p>
            </div>
            <button
              onClick={() => setShowOrderDetails(false)}
              className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-white/5">
              <div>
                <p className="text-xs text-gray-400">Status</p>
                <span className={`text-sm px-2 py-1 rounded-full ${getStatusColor(selectedOrder.status)}`}>
                  {getStatusLabel(selectedOrder.status)}
                </span>
              </div>
              <div>
                <p className="text-xs text-gray-400">Amount</p>
                <p className="text-sm text-white font-semibold">{formatCurrency(selectedOrder.amount)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Payment Method</p>
                <p className="text-sm text-white">{selectedOrder.paymentMethod}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Items</p>
                <p className="text-sm text-white">{selectedOrder.items} items</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-gray-400">Date</p>
                <p className="text-sm text-white">{formatDate(selectedOrder.date)}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-green-600 to-green-500 text-white font-semibold hover:from-green-500 hover:to-green-400 transition-all">
                Update Status
              </button>
              <button className="flex-1 px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white font-semibold hover:bg-white/10 transition-all">
                Contact Customer
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black/95">
      <Sidebar />
      <div className={`transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
        <Header />
        <main className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
            </div>
          ) : (
            <>
              {activeTab === 'overview' && <OverviewTab />}
              {activeTab === 'orders' && <OrdersTab />}
              {activeTab === 'users' && <UsersTab />}
              {activeTab === 'analytics' && (
                <div className="text-center py-20 text-gray-400">
                  <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-500" />
                  <p>Analytics dashboard coming soon</p>
                </div>
              )}
              {activeTab === 'transactions' && (
                <div className="text-center py-20 text-gray-400">
                  <CreditCard className="w-12 h-12 mx-auto mb-4 text-gray-500" />
                  <p>Transactions view coming soon</p>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      <AnimatePresence>
        {showOrderDetails && <OrderDetailsModal />}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;