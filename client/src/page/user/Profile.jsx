import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  Edit2,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
  Shield,
  Calendar,
  ArrowLeft,
} from 'lucide-react';
import useAuth from '../../store/useAuth.js';
import { updateUsername, updatePhoneNumber, getUser, getAuthUser } from '../../Service/auth.js';
import api from '../../Service/api.js';

// Helper function to format date
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch {
    return 'N/A';
  }
};

// Helper function to get error message
const getErrorMessage = (error, defaultMessage = 'An error occurred') => {
  if (!error) return defaultMessage;
  
  if (typeof error === 'string') return error;
  
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  
  if (error.message) return error.message;
  
  return defaultMessage;
};

const Profile = () => {
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    id: '',
    email: '',
    username: '',
    phoneNumber: '',
    role: '',
  });

  const [originalData, setOriginalData] = useState({});

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    setError('');
    try {
      // Get user from localStorage first
      const localUser = getUser();
      
      if (localUser) {
        const formattedData = {
          id: localUser.id || '',
          email: localUser.email || '',
          username: localUser.username || '',
          phoneNumber: localUser.phoneNumber || localUser.phone || '',
          role: localUser.role || 'user',
        };
        
        setProfileData(formattedData);
        setOriginalData(formattedData);
      }
      
      // Try to get fresh user data from API
      try {
        const res = await getAuthUser();
        const apiData = res?.data || res;
        
        if (apiData) {
          const formattedData = {
            id: apiData.id || profileData.id,
            email: apiData.email || profileData.email,
            username: apiData.username || profileData.username,
            phoneNumber: apiData.phoneNumber || apiData.phone || profileData.phoneNumber,
            role: apiData.role || profileData.role,
          };
          
          setProfileData(formattedData);
          setOriginalData(formattedData);
          
          // Update local storage
          const userStr = localStorage.getItem("zenosms_user");
          if (userStr) {
            try {
              const currentUser = JSON.parse(userStr);
              const updatedUser = { ...currentUser, ...apiData };
              localStorage.setItem("zenosms_user", JSON.stringify(updatedUser));
            } catch (e) {
              // Ignore parsing errors
            }
          }
        }
      } catch (apiError) {
        console.log('Using cached user data');
      }
      
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load profile data.'));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const updates = [];
      
      // Update username if changed
      if (profileData.username !== originalData.username) {
        await updateUsername(profileData.username);
        updates.push('username');
      }
      
      // Update phone number if changed
      if (profileData.phoneNumber !== originalData.phoneNumber) {
        await updatePhoneNumber(profileData.phoneNumber);
        updates.push('phone number');
      }
      
      // Update auth context and local storage
      const updatedUser = {
        ...getUser(),
        username: profileData.username,
        phoneNumber: profileData.phoneNumber,
        email: profileData.email,
        id: profileData.id,
        role: profileData.role,
      };
      
      localStorage.setItem("zenosms_user", JSON.stringify(updatedUser));
      
      if (setUser) {
        setUser(updatedUser);
      }
      
      setOriginalData(profileData);
      setIsEditing(false);
      setSuccess(`Profile updated successfully! ${updates.length > 0 ? `(${updates.join(', ')})` : ''}`);
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to update profile.'));
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setProfileData(originalData);
    setIsEditing(false);
    setError('');
  };

  const getInitials = () => {
    const username = profileData.username || '';
    return username.charAt(0).toUpperCase() || 'U';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black/95 p-4 md:p-8 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
          <p className="text-sm text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black/95 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-center justify-between gap-4 mb-8"
        >
          <div className="flex items-center gap-4">
            <button
              onClick={() => window.history.back()}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white font-['Space_Grotesk'] flex items-center gap-3">
                <User className="w-8 h-8 text-emerald-500" />
                My Profile
              </h1>
              <p className="text-sm text-gray-400 mt-1">
                Manage your account information
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-semibold text-sm transition-all shadow-lg shadow-emerald-500/25"
              >
                <Edit2 className="w-4 h-4" />
                Edit Profile
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white font-semibold text-sm transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-semibold text-sm transition-all shadow-lg shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Success/Error Messages */}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center gap-2"
          >
            <CheckCircle className="w-5 h-5 shrink-0" />
            {success}
          </motion.div>
        )}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-2"
          >
            <AlertCircle className="w-5 h-5 shrink-0" />
            {error}
          </motion.div>
        )}

        {/* Profile Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl bg-gradient-to-br from-gray-900/80 to-gray-950/80 backdrop-blur-xl border border-white/10 p-6 sticky top-6">
              {/* Avatar */}
              <div className="w-32 h-32 mx-auto mb-4">
                <div className="w-full h-full rounded-full bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 border-2 border-emerald-500/30 flex items-center justify-center">
                  <span className="text-4xl font-bold text-emerald-400 font-['Space_Grotesk']">
                    {getInitials()}
                  </span>
                </div>
              </div>

              <div className="text-center">
                <h2 className="text-xl font-bold text-white font-['Space_Grotesk']">
                  @{profileData.username}
                </h2>
                <p className="text-sm text-gray-400 mt-1">{profileData.email}</p>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                    <Shield className="w-3 h-3" />
                    {profileData.role?.charAt(0).toUpperCase() + profileData.role?.slice(1) || 'User'}
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-white/10 space-y-3">
                {profileData.phoneNumber && (
                  <div className="flex items-center gap-3 text-sm text-gray-400">
                    <Phone className="w-4 h-4 text-emerald-400" />
                    <span>{profileData.phoneNumber}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-sm text-gray-400">
                  <Mail className="w-4 h-4 text-emerald-400" />
                  <span>{profileData.email}</span>
                </div>
              </div>

              {/* Stats */}
              <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-2 gap-3">
                <div className="text-center p-3 rounded-xl bg-white/5 border border-white/5">
                  <p className="text-xs text-gray-500">Status</p>
                  <p className="text-sm font-semibold text-emerald-400 mt-1">Active</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-white/5 border border-white/5">
                  <p className="text-xs text-gray-500">Role</p>
                  <p className="text-sm font-semibold text-white mt-1 capitalize">
                    {profileData.role || 'User'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Profile Details */}
          <div className="lg:col-span-2">
            {/* Account Information */}
            <div className="rounded-2xl bg-gradient-to-br from-gray-900/80 to-gray-950/80 backdrop-blur-xl border border-white/10 p-6">
              <h3 className="text-lg font-bold text-white font-['Space_Grotesk'] mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-emerald-400" />
                Account Information
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    Username
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="username"
                      value={profileData.username}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-gray-500 outline-none transition-colors focus:border-emerald-500/50"
                      placeholder="Username"
                    />
                  ) : (
                    <p className="text-sm text-white px-4 py-2.5 rounded-xl bg-white/5 border border-white/10">
                      @{profileData.username}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    Email Address
                  </label>
                  <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <p className="text-sm text-white">{profileData.email}</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1.5">Email cannot be changed</p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    Phone Number
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={profileData.phoneNumber}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-gray-500 outline-none transition-colors focus:border-emerald-500/50"
                      placeholder="Phone number"
                    />
                  ) : (
                    <p className="text-sm text-white px-4 py-2.5 rounded-xl bg-white/5 border border-white/10">
                      {profileData.phoneNumber || 'Not set'}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    Role
                  </label>
                  <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10">
                    <Shield className="w-4 h-4 text-gray-500" />
                    <p className="text-sm text-white capitalize">{profileData.role || 'User'}</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1.5">Role cannot be changed</p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    User ID
                  </label>
                  <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-sm text-gray-400 font-mono">{profileData.id}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;