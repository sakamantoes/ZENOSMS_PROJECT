// page/Login.jsx  (or wherever AuthComponent lives)
// ─── Fixed auth flow ──────────────────────────────────────────────────────────
//
// TRACE OF THE BUG:
//   auth.js login() does:    return response.data
//   response.data =          { status, success, message, data: { user, token } }
//   So login() returns:      { status, success, message, data: { user, token } }
//
//   AuthComponent then did:  const userData = response.data   ← WRONG (one level too deep)
//   It should read:          const { user, token } = response.data
//   OR (safer):              const payload = response?.data ?? response
//
// This file fixes that and handles role-based redirects cleanly.

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, User, Loader2,
  Phone,
} from 'lucide-react';
import { login, signup } from '../service/auth';
import useAuth from '../store/useAuth';
import imageObject from '../utils/image';

// ─── Role → path map ─────────────────────────────────────────────────────────
// Adjust keys to match EXACTLY what your backend returns in user.role
const ROLE_PATH = {
  admin:       '/a/dashboard',
  user:        '/f/dashboard',
  // add more as needed, e.g.:
  // moderator: '/m/dashboard',
};

const getRolePath = (role) => ROLE_PATH[role?.toLowerCase?.() ?? ''] ?? '/f/dashboard';

// ─── Field wrapper ────────────────────────────────────────────────────────────
const Field = ({ label, error, children }) => (
  <div>
    <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>
    {children}
    {error && (
      <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
        <AlertCircle className="w-3 h-3 flex-shrink-0" />{error}
      </p>
    )}
  </div>
);

// ─── Input ────────────────────────────────────────────────────────────────────
const Input = ({ error, icon: Icon, right, ...props }) => (
  <div className="relative">
    {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />}
    <input
      {...props}
      className={`w-full py-3 bg-gray-900/50 border rounded-lg text-white
        placeholder-gray-600 outline-none transition-all duration-200
        focus:border-green-500/60 focus:bg-gray-900/70
        ${Icon ? 'pl-10' : 'pl-4'} ${right ? 'pr-10' : 'pr-4'}
        ${error ? 'border-red-500/50' : 'border-white/10'}`}
    />
    {right}
  </div>
);

// ─── Main component ────────────────────────────────────────────────────────────
const AuthComponent = () => {
  const navigate    = useNavigate();
  const { setAuthUser } = useAuth();

  const [isLogin,   setIsLogin]   = useState(true);
  const [showPass,  setShowPass]  = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [errors,    setErrors]    = useState({});

  const [form, setForm] = useState({
    username: '', email: '', password: '', confirmPassword: '',
  });

  // ── Helpers ──────────────────────────────────────────────
  const setField = (k) => (e) => {
    setForm(p => ({ ...p, [k]: e.target.value }));
    if (errors[k]) setErrors(p => ({ ...p, [k]: '' }));
  };

  const clearForm = () => {
    setForm({ username: '', email: '', password: '', confirmPassword: '' });
    setErrors({});
  };

  const switchMode = () => { setIsLogin(p => !p); clearForm(); setShowPass(false); };

  // ── Validation ───────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!form.email)    e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email address';

    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'Min. 6 characters';

    if (!isLogin) {
      if (!form.username || form.username.length < 3) e.username = 'Username must be at least 3 characters';
      if (form.password !== form.confirmPassword)     e.confirmPassword = 'Passwords do not match';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Parse backend errors ─────────────────────────────────
  const handleBackendError = (err) => {
    const data = err.response?.data;
    const msg  = data?.message || data?.error || 'Authentication failed';

    // Structured field errors
    if (data?.errors && typeof data.errors === 'object') {
      setErrors(data.errors);
      const first = Object.values(data.errors)[0];
      if (first) toast.error(typeof first === 'string' ? first : first[0]);
      return;
    }
    // Specific field hints
    if (typeof msg === 'string') {
      const lower = msg.toLowerCase();
      if (lower.includes('email'))    setErrors({ email: msg });
      if (lower.includes('password')) setErrors({ password: msg });
      if (lower.includes('username')) setErrors({ username: msg });
    }
    toast.error(typeof msg === 'string' ? msg : 'Something went wrong');
  };

  // ── Submit ───────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    try {
      if (isLogin) {
        // ── LOGIN ────────────────────────────────────────
        // auth.js returns response.data = { status, success, message, data: { user, token } }
        const res = await login({ email: form.email, password: form.password });

        // Extract user + token — handle both shapes defensively
        const payload = res?.data ?? res;  // { user, token }
        const user    = payload?.user  ?? payload;
        const token   = payload?.token;

        if (!user?.role) throw new Error('No user data returned from server');

        // Persist token if not already done by auth.js
        if (token && !localStorage.getItem('zenosms_token')) {
          localStorage.setItem('zenosms_token', token);
        }

        setAuthUser({ ...user, token });
        toast.success(`Welcome back, ${user.username || user.email}!`);
        navigate(getRolePath(user.role), { replace: true });

      } else {
        // ── SIGNUP ───────────────────────────────────────
        await signup({ username: form.username, email: form.email, password: form.password });
        toast.success('Account created! Signing you in…');

        // Auto-login after signup
        const res  = await login({ email: form.email, password: form.password });
        const payload = res?.data ?? res;
        const user    = payload?.user  ?? payload;
        const token   = payload?.token;

        if (!user?.role) throw new Error('Login after signup failed');

        if (token && !localStorage.getItem('zenosms_token')) {
          localStorage.setItem('zenosms_token', token);
        }

        setAuthUser({ ...user, token });
        navigate(getRolePath(user.role), { replace: true });
      }
    } catch (err) {
      console.error('[Auth]', err);
      handleBackendError(err);
    } finally {
      setLoading(false);
    }
  };

  // ── Eye toggle button ────────────────────────────────────
  const eyeBtn = (
    <button type="button" tabIndex={-1}
      onClick={() => setShowPass(p => !p)}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
    </button>
  );

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16 relative bg-black">

      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -left-20 w-72 h-72 bg-green-500/8 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 -right-20 w-72 h-72 bg-blue-500/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Back button */}
      <button onClick={() => navigate('/')}
        className="absolute top-4 left-4 z-10 flex items-center gap-2 px-4 py-2 bg-gray-900/60 backdrop-blur-sm border border-white/10 rounded-lg text-gray-400 hover:text-green-400 hover:border-green-500/40 transition-all text-sm">
        <ArrowRight className="w-4 h-4 rotate-180" />
        Back to Home
      </button>

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md">

        {/* Header with properly aligned logo */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center mb-4">
            <div className=" rounded-2xl bg-gradient-to-br from-green-600 to-green-500 flex items-center justify-center shadow-lg shadow-green-500/30">
              <img src={imageObject.Logo3} className="rounded-xl w-16 h-16 object-cover" alt="ZenoSMS Logo" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-gray-500 text-sm">
            {isLogin ? 'Sign in to access your dashboard' : 'Join thousands of users growing globally'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>

            {/* Username (signup only) */}
            <AnimatePresence>
              {!isLogin && (
                <motion.div key="username"
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }}
                  className="overflow-hidden">
                  <Field label="Username" error={errors.username}>
                    <Input icon={User} type="text" placeholder="your_username"
                      value={form.username} onChange={setField('username')} error={errors.username} />
                  </Field>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email */}
            <Field label="Email Address" error={errors.email}>
              <Input icon={Mail} type="email" placeholder="you@example.com"
                value={form.email} onChange={setField('email')} error={errors.email} />
            </Field>

            {/* Password */}
            <Field label="Password" error={errors.password}>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={setField('password')}
                  className={`w-full pl-10 pr-10 py-3 bg-gray-900/50 border rounded-lg text-white
                    placeholder-gray-600 outline-none transition-all focus:border-green-500/60
                    ${errors.password ? 'border-red-500/50' : 'border-white/10'}`}
                />
                {eyeBtn}
              </div>
            </Field>

            {/* Confirm password (signup only) */}
            <AnimatePresence>
              {!isLogin && (
                <motion.div key="confirm"
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }}
                  className="overflow-hidden">
                  <Field label="Confirm Password" error={errors.confirmPassword}>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                      <input
                        type={showPass ? 'text' : 'password'}
                        placeholder="Repeat password"
                        value={form.confirmPassword}
                        onChange={setField('confirmPassword')}
                        className={`w-full pl-10 pr-4 py-3 bg-gray-900/50 border rounded-lg text-white
                          placeholder-gray-600 outline-none transition-all focus:border-green-500/60
                          ${errors.confirmPassword ? 'border-red-500/50' : 'border-white/10'}`}
                      />
                    </div>
                  </Field>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Remember me / Forgot (login only) */}
            {isLogin && (
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input type="checkbox" className="w-4 h-4 rounded border-white/20 bg-gray-900/50 accent-green-500" />
                  <span className="text-sm text-gray-400">Remember me</span>
                </label>
                <button type="button" className="text-sm text-green-500 hover:text-green-400 transition-colors">
                  Forgot password?
                </button>
              </div>
            )}

            {/* Submit */}
            <button type="submit" disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-green-600 to-green-500
                hover:from-green-500 hover:to-green-400 text-white font-semibold rounded-lg
                transition-all duration-200 shadow-lg shadow-green-500/20
                disabled:opacity-50 disabled:cursor-not-allowed
                flex items-center justify-center gap-2 mt-2">
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin" />{isLogin ? 'Signing in…' : 'Creating account…'}</>
                : <>{isLogin ? 'Sign In' : 'Create Account'} <ArrowRight className="w-4 h-4" /></>
              }
            </button>

            {/* Divider */}
            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-3 bg-gray-900/50 text-gray-600 text-sm">or</span>
              </div>
            </div>

            {/* Google */}
            <button type="button"
              className="w-full py-2.5 bg-gray-900/50 border border-white/10 rounded-lg
                text-gray-300 hover:bg-gray-800/60 hover:border-green-500/30
                transition-all flex items-center justify-center gap-2 text-sm">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            {/* Toggle */}
            <p className="text-center text-sm text-gray-500 pt-2">
              {isLogin ? "New to Zenosms? " : "Already have an account? "}
              <button type="button" onClick={switchMode}
                className="text-green-500 hover:text-green-400 font-semibold transition-colors">
                {isLogin ? ' Create an account ' : 'Sign In here'}
              </button>
            </p>
          </form>

          {/* Security Badges */}
          <div className="flex items-center justify-between bg-green-900/30 p-4 rounded-2xl gap-4 mt-8">
            <div className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-green-500" />
              <span className="text-xs text-gray-500">Secure Login</span>
            </div>
            <div className="flex items-center justify-center gap-1">
              <div className='bg-green-600 w-2 h-2 rounded-full'></div>
              <span className='text-white text-[11px]'>Online</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthComponent;