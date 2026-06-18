import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import {
  Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, User, Loader2,
  Phone, CheckCircle, Database
} from 'lucide-react';
import { login, signup, googleLogin } from '../service/auth';
import useAuth from '../store/useAuth';
import imageObject from '../utils/image';

// ─── Role → path map ─────────────────────────────────────────────────────────
const ROLE_PATH = {
  admin: '/a/dashboard',
  user: '/f/dashboard',
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

// ─── Loading Screen Component ────────────────────────────────────────────────
const LoadingScreen = ({ progress }) => {
  const totalProgress = ((progress + 1) / 3) * 100;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed inset-0 z-[999] bg-black/95 backdrop-blur-2xl flex items-center justify-center overflow-hidden"
    >
      {/* Animated Background Grid */}
      <div className="absolute inset-0 pointer-events-none">
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="loadingGrid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(34,197,94,0.05)" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#loadingGrid)" />
        </svg>
      </div>

      {/* Glowing Orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.8, 1],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-green-500/10 blur-3xl"
        />
        
        <motion.div
          animate={{
            scale: [1, 2, 1],
            opacity: [0.15, 0.4, 0.15],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-blue-500/8 blur-3xl"
        />
      </div>

      <div className="text-center max-w-md mx-auto px-6 relative z-10">
        {/* Animated Logo */}
        <motion.div
          animate={{ 
            scale: [1, 1.05, 1],
            rotate: [0, 3, -3, 0]
          }}
          transition={{ duration: 3, repeat: Infinity }}
          className="flex justify-center mb-8"
        >
          <div className="relative">
            <motion.div
              animate={{
                scale: [1, 1.4, 1],
                opacity: [0.3, 0.7, 0.3],
              }}
              transition={{ duration: 2.5, repeat: Infinity }}
              className="absolute inset-0 rounded-2xl bg-green-500/20 blur-2xl"
            />
            <div className="relative w-28 h-28 rounded-2xl bg-gradient-to-br from-green-600 to-green-500 flex items-center justify-center shadow-2xl shadow-green-500/40">
              <img src={imageObject.Logo3} className="rounded-xl w-24 h-24 object-cover" alt="ZenoSMS Logo" />
            </div>
          </div>
        </motion.div>

        {/* Loading Title */}
        <div className="flex items-center justify-center gap-3 mb-3">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            <Database className="w-5 h-5 text-green-500" />
          </motion.div>
          <h2 className="text-2xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Synchronizing terminal
          </h2>
        </div>

        {/* Terminal Cursor Animation */}
        <div className="flex items-center justify-center gap-1 mb-8">
          <motion.span
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="text-gray-400 text-sm font-mono"
          >
            █
          </motion.span>
          <motion.span
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="text-gray-400 text-sm font-mono"
          >
            █
          </motion.span>
          <motion.span
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="text-gray-400 text-sm font-mono"
          >
            █
          </motion.span>
          <motion.span
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="text-gray-400 text-sm font-mono"
          >
            █
          </motion.span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-gray-800/50 rounded-full overflow-hidden backdrop-blur-sm">
          <motion.div
            className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full"
            initial={{ width: '0%' }}
            animate={{ width: `${totalProgress}%` }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          />
        </div>

        {/* Percentage */}
        <div className="mt-3 flex items-center justify-between text-xs">
          <span className="text-gray-500">Initializing...</span>
          <motion.span 
            key={Math.round(totalProgress)}
            initial={{ scale: 1.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-green-400 font-mono font-bold"
          >
            {Math.round(totalProgress)}%
          </motion.span>
        </div>
      </div>
    </motion.div>
  );
};

// ─── Main component ────────────────────────────────────────────────────────────
const AuthComponent = () => {
  const navigate = useNavigate();
  const { setAuthUser } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showLoadingScreen, setShowLoadingScreen] = useState(false);
  const [progress, setProgress] = useState(0);

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
    if (!form.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email address';

    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'Min. 6 characters';

    if (!isLogin) {
      if (!form.username || form.username.length < 3) e.username = 'Username must be at least 3 characters';
      if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Parse backend errors ─────────────────────────────────
  const handleBackendError = (err) => {
    const data = err.response?.data;
    const msg = data?.message || data?.error || 'Authentication failed';

    if (data?.errors && typeof data.errors === 'object') {
      setErrors(data.errors);
      const first = Object.values(data.errors)[0];
      if (first) toast.error(typeof first === 'string' ? first : first[0]);
      return;
    }
    if (typeof msg === 'string') {
      const lower = msg.toLowerCase();
      if (lower.includes('email')) setErrors({ email: msg });
      if (lower.includes('password')) setErrors({ password: msg });
      if (lower.includes('username')) setErrors({ username: msg });
    }
    toast.error(typeof msg === 'string' ? msg : 'Something went wrong');
  };

  // ── Simulate loading progress ─────────────────────────────
  const simulateProgress = () => {
    setProgress(0);
    
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 2) {
          clearInterval(progressInterval);
          return 2;
        }
        return prev + 1;
      });
    }, 2000);

    return { progressInterval };
  };

  // ── Handle Google Login Success ──────────────────────────
  const handleGoogleSuccess = async (credentialResponse) => {
    const { credential } = credentialResponse;
    
    setLoading(true);
    setShowLoadingScreen(true);
    setProgress(0);

    const { progressInterval } = simulateProgress();

    try {
      const res = await googleLogin(credential);
      
      const payload = res?.data ?? res;
      const user = payload?.user ?? payload;
      const token = payload?.token;

      if (!user?.role) throw new Error('No user data returned from server');

      if (token && !localStorage.getItem('zenosms_token')) {
        localStorage.setItem('zenosms_token', token);
      }

      setAuthUser({ ...user, token });
      toast.success(`Welcome ${user.username || user.email}!`);
      
      clearInterval(progressInterval);
      setProgress(2);
      
      setTimeout(() => {
        setShowLoadingScreen(false);
        setLoading(false);
        navigate(getRolePath(user.role), { replace: true });
      }, 1500);

    } catch (err) {
      console.error('[Google Auth]', err);
      clearInterval(progressInterval);
      setShowLoadingScreen(false);
      handleBackendError(err);
      setLoading(false);
    }
  };

  // ── Handle Google Login Error ────────────────────────────
  const handleGoogleError = () => {
    toast.error('Google login failed. Please try again.');
  };

  // ── Submit ───────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    setLoading(true);
    setShowLoadingScreen(true);
    setProgress(0);

    const { progressInterval } = simulateProgress();

    try {
      if (isLogin) {
        const res = await login({ email: form.email, password: form.password });

        const payload = res?.data ?? res;
        const user = payload?.user ?? payload;
        const token = payload?.token;

        if (!user?.role) throw new Error('No user data returned from server');

        if (token && !localStorage.getItem('zenosms_token')) {
          localStorage.setItem('zenosms_token', token);
        }

        setAuthUser({ ...user, token });
        toast.success(`Welcome back, ${user.username || user.email}!`);
        
        clearInterval(progressInterval);
        setProgress(2);
        
        setTimeout(() => {
          setShowLoadingScreen(false);
          setLoading(false);
          navigate(getRolePath(user.role), { replace: true });
        }, 1500);

      } else {
        await signup({ username: form.username, email: form.email, password: form.password });
        toast.success('Account created! Signing you in…');

        const res = await login({ email: form.email, password: form.password });
        const payload = res?.data ?? res;
        const user = payload?.user ?? payload;
        const token = payload?.token;

        if (!user?.role) throw new Error('Login after signup failed');

        if (token && !localStorage.getItem('zenosms_token')) {
          localStorage.setItem('zenosms_token', token);
        }

        setAuthUser({ ...user, token });
        
        clearInterval(progressInterval);
        setProgress(2);
        
        setTimeout(() => {
          setShowLoadingScreen(false);
          setLoading(false);
          navigate(getRolePath(user.role), { replace: true });
        }, 1500);
      }
    } catch (err) {
      console.error('[Auth]', err);
      clearInterval(progressInterval);
      setShowLoadingScreen(false);
      handleBackendError(err);
      setLoading(false);
    }
  };

  const eyeBtn = (
    <button type="button" tabIndex={-1}
      onClick={() => setShowPass(p => !p)}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
    </button>
  );

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <>
        <AnimatePresence mode="wait">
          {showLoadingScreen && (
            <LoadingScreen 
              key="loading-screen"
              progress={progress}
            />
          )}
        </AnimatePresence>

        <div className={`min-h-screen flex items-center justify-center px-4 py-16 relative bg-transparent ${showLoadingScreen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 -left-20 w-72 h-72 bg-green-500/8 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-20 -right-20 w-72 h-72 bg-blue-500/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          </div>

          <button onClick={() => navigate('/')}
            className="absolute top-4 left-4 z-10 flex items-center gap-2 px-4 py-2 bg-gray-900/60 backdrop-blur-sm border border-white/10 rounded-lg text-gray-400 hover:text-green-400 hover:border-green-500/40 transition-all text-sm">
            <ArrowRight className="w-4 h-4 rotate-180" />
            Back to Home
          </button>

          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="w-full max-w-md">

            <div className="text-center mb-8">
              <div className="flex justify-center items-center mb-4">
                <div className="rounded-2xl bg-gradient-to-br from-green-600 to-green-500 flex items-center justify-center shadow-lg shadow-green-500/30">
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

            <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-2xl p-8 shadow-2xl">
              <form onSubmit={handleSubmit} className="space-y-5" noValidate>

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

                <Field label="Email Address" error={errors.email}>
                  <Input icon={Mail} type="email" placeholder="you@example.com"
                    value={form.email} onChange={setField('email')} error={errors.email} />
                </Field>

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

                <div className="relative my-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-3 bg-gray-900/50 text-gray-600 text-sm">or</span>
                  </div>
                </div>

                {/* Google Login Button */}
                <div className="flex justify-center">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    useOneTap
                    theme="filled_black"
                    size="large"
                    width="100%"
                    text="continue_with"
                    shape="rectangular"
                    logo_alignment="center"
                  />
                </div>

                <p className="text-center text-sm text-gray-500 pt-2">
                  {isLogin ? "New to Zenosms? " : "Already have an account? "}
                  <button type="button" onClick={switchMode}
                    className="text-green-500 hover:text-green-400 font-semibold transition-colors">
                    {isLogin ? ' Create an account ' : 'Sign In here'}
                  </button>
                </p>
              </form>

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
      </>
    </GoogleOAuthProvider>
  );
};

export default AuthComponent;