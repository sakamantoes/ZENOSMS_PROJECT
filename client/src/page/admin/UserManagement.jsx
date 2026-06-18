import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Search,
  Filter,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  UserPlus,
  MoreVertical,
  ChevronDown,
  ChevronRight,
  Mail,
  Phone,
  Calendar,
  Shield,
  UserCheck,
  UserX,
  Activity,
  Download,
  Upload,
  Printer,
  Copy,
  Settings,
  MessageSquare,
  Star,
  Award,
  Clock,
  Ban,
  Unlock,
  ShieldCheck,
  UserMinus,
  UserPlus as UserAdd,
  ArrowUpDown,
  Loader2,
  Zap,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  Smartphone
} from 'lucide-react';
import { getAllUsers, activateUser, deactivateUser } from '../../Service/auth';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Fetch all users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllUsers();
      
      // Handle different response structures
      let usersData = [];
      if (response?.data?.users) {
        usersData = response.data.users;
      } else if (response?.users) {
        usersData = response.users;
      } else if (Array.isArray(response?.data)) {
        usersData = response.data;
      } else if (Array.isArray(response)) {
        usersData = response;
      } else {
        usersData = [];
      }
      
      setUsers(usersData);
      setFilteredUsers(usersData);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter and search users
  useEffect(() => {
    let result = [...users];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(user => 
        user.username?.toLowerCase().includes(term) ||
        user.email?.toLowerCase().includes(term) ||
        user.phoneNumber?.toLowerCase().includes(term) ||
        user._id?.toLowerCase().includes(term)
      );
    }

    // Role filter
    if (filterRole !== 'ALL') {
      result = result.filter(user => user.role === filterRole);
    }

    // Status filter
    if (filterStatus !== 'ALL') {
      result = result.filter(user => user.isActive === (filterStatus === 'ACTIVE'));
    }

    // Sort
    result.sort((a, b) => {
      let aVal = a[sortBy] || '';
      let bVal = b[sortBy] || '';
      
      if (sortBy === 'createdAt') {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      }
      
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredUsers(result);
    setCurrentPage(1);
  }, [users, searchTerm, filterRole, filterStatus, sortBy, sortOrder]);

  // Handle user activation
  const handleActivate = async (userId) => {
    try {
      setActionLoading(true);
      const response = await activateUser(userId);
      
      if (response.success) {
        // Update user in state
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user._id === userId 
              ? { ...user, isActive: true, activatedAt: new Date().toISOString() }
              : user
          )
        );
        setSuccessMessage('User activated successfully!');
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        throw new Error(response.message || 'Failed to activate user');
      }
    } catch (err) {
      console.error('Error activating user:', err);
      setError(err.message || 'Failed to activate user');
      setTimeout(() => setError(null), 3000);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle user deactivation
  const handleDeactivate = async (userId) => {
    if (!window.confirm('Are you sure you want to deactivate this user? They will lose access to their account.')) {
      return;
    }
    
    try {
      setActionLoading(true);
      const response = await deactivateUser(userId);
      
      if (response.success) {
        // Update user in state
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user._id === userId 
              ? { ...user, isActive: false, deactivatedAt: new Date().toISOString() }
              : user
          )
        );
        setSuccessMessage('User deactivated successfully!');
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        throw new Error(response.message || 'Failed to deactivate user');
      }
    } catch (err) {
      console.error('Error deactivating user:', err);
      setError(err.message || 'Failed to deactivate user');
      setTimeout(() => setError(null), 3000);
    } finally {
      setActionLoading(false);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Get status badge
  const getStatusBadge = (user) => {
    if (!user.isActive) {
      return {
        label: 'Inactive',
        className: 'bg-red-500/10 text-red-400 border-red-500/20',
        icon: <UserX className="w-3 h-3" />
      };
    }
    return {
      label: 'Active',
      className: 'bg-green-500/10 text-green-400 border-green-500/20',
      icon: <UserCheck className="w-3 h-3" />
    };
  };

  // Get role badge
  const getRoleBadge = (role) => {
    switch(role) {
      case 'admin':
        return { label: 'Admin', className: 'bg-purple-500/10 text-purple-400 border-purple-500/20' };
      case 'moderator':
        return { label: 'Moderator', className: 'bg-blue-500/10 text-blue-400 border-blue-500/20' };
      default:
        return { label: 'User', className: 'bg-gray-500/10 text-gray-400 border-gray-500/20' };
    }
  };

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  // Stats
  const stats = {
    total: users.length,
    active: users.filter(u => u.isActive).length,
    inactive: users.filter(u => !u.isActive).length,
    admins: users.filter(u => u.role === 'admin').length,
    moderators: users.filter(u => u.role === 'moderator').length,
  };

  // User Details Modal
  const UserDetailsModal = ({ user, onClose }) => {
    if (!user) return null;
    const status = getStatusBadge(user);
    const role = getRoleBadge(user.role);

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
          className="relative w-full max-w-2xl rounded-2xl bg-gradient-to-br from-gray-900/95 to-gray-950/95 backdrop-blur-xl border border-white/10 shadow-2xl p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
          >
            <XCircle className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-green-500/25">
              {user.username?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <h3 className="text-xl font-bold text-white font-['Space_Grotesk']">{user.username || 'Unknown'}</h3>
              <p className="text-sm text-gray-400">{user.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-2 py-0.5 rounded-full text-xs border flex items-center gap-1 ${status.className}`}>
                  {status.icon}
                  {status.label}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-xs border ${role.className}`}>
                  {role.label}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-3 rounded-xl bg-white/5 border border-white/5">
              <p className="text-xs text-gray-400">User ID</p>
              <p className="text-sm font-mono text-white truncate">{user._id}</p>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/5">
              <p className="text-xs text-gray-400">Phone</p>
              <p className="text-sm text-white">{user.phoneNumber || 'N/A'}</p>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/5">
              <p className="text-xs text-gray-400">Joined</p>
              <p className="text-sm text-white">{formatDate(user.createdAt)}</p>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/5">
              <p className="text-xs text-gray-400">Last Active</p>
              <p className="text-sm text-white">{formatDate(user.lastLogin) || 'N/A'}</p>
            </div>
          </div>

          <div className="flex gap-3">
            {user.isActive ? (
              <button
                onClick={() => {
                  handleDeactivate(user._id);
                  onClose();
                }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 font-semibold transition-all"
              >
                <UserX className="w-4 h-4" />
                Deactivate User
              </button>
            ) : (
              <button
                onClick={() => {
                  handleActivate(user._id);
                  onClose();
                }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 text-green-400 font-semibold transition-all"
              >
                <UserCheck className="w-4 h-4" />
                Activate User
              </button>
            )}
           
          </div>
        </motion.div>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black/95 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-green-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading users...</p>
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
              <Users className="w-8 h-8 text-green-500" />
              User Management
            </h1>
            <p className="text-sm text-gray-400 mt-1">Manage and monitor all platform users</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchUsers}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white transition-all"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
           
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-6"
        >
          <div className="p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/5 border border-green-500/20">
            <p className="text-xs text-gray-400">Total Users</p>
            <p className="text-2xl font-bold text-white">{stats.total}</p>
          </div>
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <p className="text-xs text-gray-400">Active</p>
            <p className="text-2xl font-bold text-emerald-400">{stats.active}</p>
          </div>
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
            <p className="text-xs text-gray-400">Inactive</p>
            <p className="text-2xl font-bold text-red-400">{stats.inactive}</p>
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

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex flex-wrap items-center gap-4 mb-6 p-4 rounded-xl bg-white/5 border border-white/10"
        >
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-green-500/50 transition-colors"
              />
            </div>
          </div>

          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 text-sm focus:outline-none focus:border-green-500/50 transition-colors"
          >
            <option value="ALL">All Users</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 text-sm focus:outline-none focus:border-green-500/50 transition-colors"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>

          <button
            onClick={() => {
              setSearchTerm('');
              setFilterRole('ALL');
              setFilterStatus('ALL');
            }}
            className="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white transition-colors text-sm"
          >
            Clear Filters
          </button>
        </motion.div>

        {/* Users Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl bg-gradient-to-br from-gray-900/80 to-gray-950/80 backdrop-blur-xl border border-white/10 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5 border-b border-white/5">
                <tr>
                  <th className="text-left p-4 text-xs font-medium text-gray-400 uppercase tracking-wider">User</th>
                  <th className="text-left p-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Email</th>
                  <th className="text-left p-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Role</th>
                  <th className="text-left p-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="text-left p-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Joined</th>
                  <th className="text-left p-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {currentItems.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-400">
                      <div className="flex flex-col items-center gap-2">
                        <Users className="w-12 h-12 text-gray-600" />
                        <p>No users found</p>
                        <p className="text-sm text-gray-500">Try adjusting your filters</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentItems.map((user, index) => {
                    const status = getStatusBadge(user);
                    const role = getRoleBadge(user.role);
                    return (
                      <motion.tr
                        key={user._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-white/5 transition-colors group"
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500/20 to-green-600/20 flex items-center justify-center text-green-400 font-bold text-sm border border-green-500/20">
                              {user.username?.[0]?.toUpperCase() || 'U'}
                            </div>
                            <span className="text-sm font-medium text-white truncate max-w-[150px]">
                              {user.username || 'Unknown'}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Mail className="w-3 h-3 text-gray-500" />
                            <span className="text-sm text-gray-300 truncate max-w-[150px]">{user.email || 'N/A'}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-xs border inline-flex items-center gap-1 ${role.className}`}>
                            {role.label}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-xs border inline-flex items-center gap-1 ${status.className}`}>
                            {status.icon}
                            {status.label}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3 h-3 text-gray-500" />
                            <span className="text-sm text-gray-400">{formatDate(user.createdAt)}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setShowDetails(true);
                              }}
                              className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {user.isActive ? (
                              <button
                                onClick={() => handleDeactivate(user._id)}
                                disabled={actionLoading}
                                className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-colors"
                                title="Deactivate User"
                              >
                                <UserX className="w-4 h-4" />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleActivate(user._id)}
                                disabled={actionLoading}
                                className="p-1.5 rounded-lg hover:bg-green-500/10 text-green-400 hover:text-green-300 transition-colors"
                                title="Activate User"
                              >
                                <UserCheck className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredUsers.length > itemsPerPage && (
            <div className="flex items-center justify-between p-4 border-t border-white/5">
              <p className="text-sm text-gray-400">
                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredUsers.length)} of {filteredUsers.length} users
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
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed text-gray-400 hover:text-white transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </motion.div>

        {/* User Details Modal */}
        <AnimatePresence>
          {showDetails && selectedUser && (
            <UserDetailsModal
              user={selectedUser}
              onClose={() => {
                setShowDetails(false);
                setSelectedUser(null);
              }}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default UserManagement;