import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  ArrowLeft,
  Plus,
} from 'lucide-react';
import useAuth from '../../store/useAuth.js';
import { updateUsername, updatePhoneNumber, getUser, getAuthUser } from '../../Service/auth.js';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const getErrorMessage = (error, defaultMessage = 'An error occurred') => {
  if (!error) return defaultMessage;
  if (typeof error === 'string') return error;
  if (error.response?.data?.message) return error.response.data.message;
  if (error.response?.data?.error) return error.response.data.error;
  if (error.message) return error.message;
  return defaultMessage;
};

// Strips spaces, dashes, dots and brackets: "+234 (803) 000-0000" -> "+2348030000000"
const normalizePhone = (value) =>
  String(value ?? '')
    .trim()
    .replace(/[\s\-().]/g, '');

// Optional leading +, then 7–15 digits (E.164 length range)
const PHONE_PATTERN = /^\+?\d{7,15}$/;

const getPhoneError = (value) => {
  const phone = normalizePhone(value);
  if (!phone) return 'Enter a phone number.';
  if (!PHONE_PATTERN.test(phone)) {
    return 'Use 7–15 digits. Include the country code, e.g. +2348030000000.';
  }
  return '';
};

const roleLabel = (role) => {
  if (!role) return 'User';
  return role.charAt(0).toUpperCase() + role.slice(1);
};

const toProfile = (source, fallback = {}) => ({
  id: source?.id || fallback.id || '',
  email: source?.email || fallback.email || '',
  username: source?.username || fallback.username || '',
  phoneNumber:
    source?.phoneNumber || source?.phone || fallback.phoneNumber || '',
  role: source?.role || fallback.role || 'user',
});

const EMPTY_PROFILE = {
  id: '',
  email: '',
  username: '',
  phoneNumber: '',
  role: '',
};

const inputBase =
  'w-full px-4 py-2.5 rounded-xl bg-white/5 border text-white text-sm placeholder-gray-500 outline-none transition-colors';

// ─── Component ───────────────────────────────────────────────────────────────

const Profile = () => {
  const { setUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [focusTarget, setFocusTarget] = useState(null);
  const [profileData, setProfileData] = useState(EMPTY_PROFILE);
  const [originalData, setOriginalData] = useState(EMPTY_PROFILE);

  const usernameRef = useRef(null);
  const phoneRef = useRef(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  // Focus the requested field once edit mode is on
  useEffect(() => {
    if (!isEditing || !focusTarget) return;
    const el = focusTarget === 'phone' ? phoneRef.current : usernameRef.current;
    el?.focus();
    setFocusTarget(null);
  }, [isEditing, focusTarget]);

  const fetchProfile = async () => {
    setLoading(true);
    setError('');

    // Cached user first so the page renders immediately
    let base = EMPTY_PROFILE;
    const localUser = getUser();
    if (localUser) {
      base = toProfile(localUser);
      setProfileData(base);
      setOriginalData(base);
    }

    try {
      const res = await getAuthUser();
      const apiData = res?.data || res;

      if (apiData) {
        const fresh = toProfile(apiData, base);
        setProfileData(fresh);
        setOriginalData(fresh);

        const userStr = localStorage.getItem('zenosms_user');
        if (userStr) {
          try {
            const currentUser = JSON.parse(userStr);
            localStorage.setItem(
              'zenosms_user',
              JSON.stringify({ ...currentUser, ...apiData })
            );
          } catch {
            // Ignore parsing errors
          }
        }
      }
    } catch (apiError) {
      if (!localUser) {
        setError(getErrorMessage(apiError, 'Failed to load profile data.'));
      }
    } finally {
      setLoading(false);
    }
  };

  // ─── Derived state ─────────────────────────────────────────────────────────

  const usernameChanged =
    profileData.username.trim() !== originalData.username;
  const phoneChanged =
    normalizePhone(profileData.phoneNumber) !==
    normalizePhone(originalData.phoneNumber);
  const hasChanges = usernameChanged || phoneChanged;

  const usernameError = useMemo(() => {
    if (!isEditing || !usernameChanged) return '';
    return profileData.username.trim() ? '' : 'Enter a username.';
  }, [isEditing, usernameChanged, profileData.username]);

  const phoneError = useMemo(() => {
    if (!isEditing || !phoneChanged) return '';
    return getPhoneError(profileData.phoneNumber);
  }, [isEditing, phoneChanged, profileData.phoneNumber]);

  const canSave = hasChanges && !usernameError && !phoneError && !saving;

  // ─── Handlers ──────────────────────────────────────────────────────────────

  const startEditing = (field = 'username') => {
    setError('');
    setSuccess('');
    setFocusTarget(field);
    setIsEditing(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCancel = () => {
    setProfileData(originalData);
    setIsEditing(false);
    setError('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && canSave) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const handleSave = async () => {
    if (!canSave) return;

    setSaving(true);
    setError('');
    setSuccess('');

    const nextUsername = profileData.username.trim();
    const nextPhone = normalizePhone(profileData.phoneNumber);

    const committed = { ...originalData };
    const updated = [];
    const failures = [];
    let usernameFailed = false;
    let phoneFailed = false;

    // Each field saves independently so one failure doesn't lose the other
    if (usernameChanged) {
      try {
        await updateUsername(nextUsername);
        committed.username = nextUsername;
        updated.push('username');
      } catch (err) {
        usernameFailed = true;
        failures.push(`Username: ${getErrorMessage(err, 'could not be updated.')}`);
      }
    }

    if (phoneChanged) {
      try {
        await updatePhoneNumber(nextPhone);
        committed.phoneNumber = nextPhone;
        updated.push('phone number');
      } catch (err) {
        phoneFailed = true;
        failures.push(`Phone number: ${getErrorMessage(err, 'could not be updated.')}`);
      }
    }

    if (updated.length > 0) {
      const updatedUser = {
        ...getUser(),
        username: committed.username,
        phoneNumber: committed.phoneNumber,
      };

      localStorage.setItem('zenosms_user', JSON.stringify(updatedUser));
      if (setUser) setUser(updatedUser);

      setOriginalData(committed);
    }

    // Keep what the user typed for any field that failed, so they can retry
    setProfileData((prev) => ({
      ...prev,
      username: usernameFailed ? prev.username : committed.username,
      phoneNumber: phoneFailed ? prev.phoneNumber : committed.phoneNumber,
    }));

    if (failures.length > 0) {
      setError(failures.join(' '));
      if (updated.length > 0) {
        setSuccess(`Saved ${updated.join(' and ')}.`);
      }
    } else {
      setIsEditing(false);
      setSuccess(`Profile updated successfully! (${updated.join(', ')})`);
      setTimeout(() => setSuccess(''), 5000);
    }

    setSaving(false);
  };

  const getInitials = () => {
    const username = profileData.username || '';
    return username.charAt(0).toUpperCase() || 'U';
  };

  // ─── Render ────────────────────────────────────────────────────────────────

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
              aria-label="Go back"
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
                onClick={() => startEditing('username')}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-semibold text-sm transition-all shadow-lg shadow-emerald-500/25"
              >
                <Edit2 className="w-4 h-4" />
                Edit Profile
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCancel}
                  disabled={saving}
                  className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white font-semibold text-sm transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={!canSave}
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
            role="status"
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
            role="alert"
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
                  @{originalData.username}
                </h2>
                <p className="text-sm text-gray-400 mt-1">{originalData.email}</p>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                    <Shield className="w-3 h-3" />
                    {roleLabel(originalData.role)}
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-white/10 space-y-3">
                {originalData.phoneNumber ? (
                  <div className="flex items-center gap-3 text-sm text-gray-400">
                    <Phone className="w-4 h-4 text-emerald-400" />
                    <span className="flex-1">{originalData.phoneNumber}</span>
                    <button
                      onClick={() => startEditing('phone')}
                      aria-label="Edit phone number"
                      className="p-1.5 rounded-lg text-gray-500 hover:text-emerald-400 hover:bg-white/5 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => startEditing('phone')}
                    className="w-full flex items-center gap-3 text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add phone number</span>
                  </button>
                )}
                <div className="flex items-center gap-3 text-sm text-gray-400">
                  <Mail className="w-4 h-4 text-emerald-400" />
                  <span>{originalData.email}</span>
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
                    {originalData.role || 'User'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Profile Details */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl bg-gradient-to-br from-gray-900/80 to-gray-950/80 backdrop-blur-xl border border-white/10 p-6">
              <h3 className="text-lg font-bold text-white font-['Space_Grotesk'] mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-emerald-400" />
                Account Information
              </h3>
              <div className="space-y-4">
                {/* Username */}
                <div>
                  <label
                    htmlFor="profile-username"
                    className="block text-xs font-medium text-gray-500 mb-1.5"
                  >
                    Username
                  </label>
                  {isEditing ? (
                    <>
                      <input
                        id="profile-username"
                        ref={usernameRef}
                        type="text"
                        name="username"
                        value={profileData.username}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        disabled={saving}
                        autoComplete="username"
                        aria-invalid={!!usernameError}
                        className={`${inputBase} ${
                          usernameError
                            ? 'border-red-500/50 focus:border-red-500/70'
                            : 'border-white/10 focus:border-emerald-500/50'
                        } disabled:opacity-60`}
                        placeholder="Username"
                      />
                      {usernameError && (
                        <p className="text-xs text-red-400 mt-1.5">{usernameError}</p>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-white px-4 py-2.5 rounded-xl bg-white/5 border border-white/10">
                      @{profileData.username}
                    </p>
                  )}
                </div>

                {/* Email */}
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

                {/* Phone */}
                <div>
                  <label
                    htmlFor="profile-phone"
                    className="block text-xs font-medium text-gray-500 mb-1.5"
                  >
                    Phone Number
                  </label>
                  {isEditing ? (
                    <>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                        <input
                          id="profile-phone"
                          ref={phoneRef}
                          type="tel"
                          inputMode="tel"
                          name="phoneNumber"
                          value={profileData.phoneNumber}
                          onChange={handleInputChange}
                          onKeyDown={handleKeyDown}
                          disabled={saving}
                          autoComplete="tel"
                          aria-invalid={!!phoneError}
                          aria-describedby="profile-phone-hint"
                          className={`${inputBase} pl-10 ${
                            phoneError
                              ? 'border-red-500/50 focus:border-red-500/70'
                              : 'border-white/10 focus:border-emerald-500/50'
                          } disabled:opacity-60`}
                          placeholder="+234 803 000 0000"
                        />
                      </div>
                      <p
                        id="profile-phone-hint"
                        className={`text-xs mt-1.5 ${
                          phoneError ? 'text-red-400' : 'text-gray-500'
                        }`}
                      >
                        {phoneError ||
                          'Spaces and dashes are removed when you save.'}
                      </p>
                    </>
                  ) : (
                    <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <p className="text-sm text-white flex-1">
                        {profileData.phoneNumber || 'Not set'}
                      </p>
                      <button
                        onClick={() => startEditing('phone')}
                        aria-label={
                          profileData.phoneNumber
                            ? 'Edit phone number'
                            : 'Add phone number'
                        }
                        className="p-1.5 -mr-1.5 rounded-lg text-gray-500 hover:text-emerald-400 hover:bg-white/5 transition-colors"
                      >
                        {profileData.phoneNumber ? (
                          <Edit2 className="w-3.5 h-3.5" />
                        ) : (
                          <Plus className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {/* Role */}
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

                {/* User ID */}
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
