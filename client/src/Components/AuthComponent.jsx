// components/AuthComponent.jsx

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  User,
  Loader2,
  Phone,
  CheckCircle,
  Database,
} from "lucide-react";
import { login, signup, googleAuthVercel } from "../Service/auth"; // ← Changed from googleLogin to googleAuthVercel
import useAuth from "../store/useAuth";
import imageObject from "../utils/image";

// ─── Role → path map ─────────────────────────────────────────────────────────
const ROLE_PATH = {
  admin: "/a/dashboard",
  user: "/f/dashboard",
};

const getRolePath = (role) =>
  ROLE_PATH[role?.toLowerCase?.() ?? ""] ?? "/f/dashboard";

// ─── Phone Number Validation ─────────────────────────────────────────────────
const validatePhoneNumber = (phone) => {
  if (!phone) return true; // Phone is optional
  // Remove all non-digit characters for validation
  const digits = phone.replace(/\D/g, "");
  // Check if it has at least 10 digits (international format)
  return digits.length >= 10 && digits.length <= 15;
};

// ─── Field wrapper ────────────────────────────────────────────────────────────
const Field = ({ label, error, children }) => (
  <div>
    <label className="block text-sm font-medium text-gray-300 mb-2">
      {label}
    </label>
    {children}
    {error && (
      <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
        <AlertCircle className="w-3 h-3 flex-shrink-0" />
        {error}
      </p>
    )}
  </div>
);

// ─── Input ────────────────────────────────────────────────────────────────────
const Input = ({ error, icon: Icon, right, ...props }) => (
  <div className="relative">
    {Icon && (
      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
    )}
    <input
      {...props}
      className={`w-full py-3 bg-gray-900/50 border rounded-lg text-white
        placeholder-gray-600 outline-none transition-all duration-200
        focus:border-green-500/60 focus:bg-gray-900/70
        ${Icon ? "pl-10" : "pl-4"} ${right ? "pr-10" : "pr-4"}
        ${error ? "border-red-500/50" : "border-white/10"}`}
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
        <svg
          className="absolute inset-0 w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="loadingGrid"
              width="60"
              height="60"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 60 0 L 0 0 0 60"
                fill="none"
                stroke="rgba(34,197,94,0.05)"
                strokeWidth="0.5"
              />
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
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1.5,
          }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-blue-500/8 blur-3xl"
        />
      </div>

      <div className="text-center max-w-md mx-auto px-6 relative z-10">
        {/* Animated Logo */}
        <motion.div
          animate={{
            scale: [1, 1.05, 1],
            rotate: [0, 3, -3, 0],
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
              <img
                src={imageObject.Logo3}
                className="rounded-xl w-24 h-24 object-cover"
                alt="ZenoSMS Logo"
              />
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
          <h2
            className="text-2xl font-bold text-white"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
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
            initial={{ width: "0%" }}
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

// ─── Custom Google Button Component ──────────────────────────────────────────
const CustomGoogleButton = ({ onClick, isLoading }) => {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={isLoading}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="relative w-full py-3.5 px-4 bg-white hover:bg-gray-50 
        border border-gray-200 rounded-lg transition-all duration-200
        shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed
        flex items-center justify-center gap-3 group"
    >
      {/* Google Icon */}
      <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>

      {/* Button Text */}
      <span className="text-gray-700 font-medium text-sm">
        {isLoading ? "Connecting..." : "Continue with Google"}
      </span>

      {/* Hover Arrow */}
      <motion.div
        initial={{ x: 0, opacity: 0 }}
        whileHover={{ x: 5, opacity: 1 }}
        className="absolute right-4 text-gray-400 group-hover:text-gray-600"
      >
        <ArrowRight className="w-4 h-4" />
      </motion.div>

      {/* Loading Spinner */}
      {isLoading && (
        <div className="absolute right-4">
          <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
        </div>
      )}
    </motion.button>
  );
};

// ─── Main component ────────────────────────────────────────────────────────────
const AuthComponent = () => {
  const navigate = useNavigate();
  const { setAuthUser } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showLoadingScreen, setShowLoadingScreen] = useState(false);
  const [progress, setProgress] = useState(0);

  const [form, setForm] = useState({
    username: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  });

  // ── Helpers ──────────────────────────────────────────────
  const setField = (k) => (e) => {
    setForm((p) => ({ ...p, [k]: e.target.value }));
    if (errors[k]) setErrors((p) => ({ ...p, [k]: "" }));
  };

  const clearForm = () => {
    setForm({
      username: "",
      email: "",
      phoneNumber: "",
      password: "",
      confirmPassword: "",
    });
    setErrors({});
  };

  const switchMode = () => {
    setIsLogin((p) => !p);
    clearForm();
    setShowPass(false);
  };

  // ── Validation ───────────────────────────────────────────
  const validate = () => {
    const e = {};

    if (!form.email) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email))
      e.email = "Invalid email address";

    if (!form.password) e.password = "Password is required";
    else if (form.password.length < 6) e.password = "Min. 6 characters";

    if (form.phoneNumber && !validatePhoneNumber(form.phoneNumber)) {
      e.phoneNumber = "Please enter a valid phone number (min. 10 digits)";
    }

    if (!isLogin) {
      if (!form.username || form.username.length < 3) {
        e.username = "Username must be at least 3 characters";
      }
      if (form.password !== form.confirmPassword) {
        e.confirmPassword = "Passwords do not match";
      }
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Parse backend errors ─────────────────────────────────
  const handleBackendError = (err) => {
    const data = err.response?.data;
    const msg = data?.message || data?.error || "Authentication failed";

    if (data?.errors && typeof data.errors === "object") {
      setErrors(data.errors);
      const first = Object.values(data.errors)[0];
      if (first) toast.error(typeof first === "string" ? first : first[0]);
      return;
    }
    if (typeof msg === "string") {
      const lower = msg.toLowerCase();
      if (lower.includes("email")) setErrors({ email: msg });
      if (lower.includes("password")) setErrors({ password: msg });
      if (lower.includes("username")) setErrors({ username: msg });
      if (lower.includes("phone")) setErrors({ phoneNumber: msg });
    }
    toast.error(typeof msg === "string" ? msg : "Something went wrong");
  };

  // ── Simulate loading progress ─────────────────────────────
  const simulateProgress = () => {
    setProgress(0);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 2) {
          clearInterval(progressInterval);
          return 2;
        }
        return prev + 1;
      });
    }, 2000);

    return { progressInterval };
  };

  // ── Handle Google Login Success (UPDATED to use googleAuthVercel) ──────────
  const handleGoogleSuccess = async (credentialResponse) => {
    const token = credentialResponse.credential;

    setGoogleLoading(true);
    setShowLoadingScreen(true);
    setProgress(0);

    const { progressInterval } = simulateProgress();

    try {
      // Using googleAuthVercel instead of googleLogin
      const response = await googleAuthVercel(token);

      if (response.status === 200 || response.status === 201 || response.data) {
        const authToken = response.data?.data?.token || response.data.token;
        const userData =
          response.data?.data?.user || response.data?.data || response.data;

        if (authToken) {
          localStorage.setItem("zenosms_token", authToken);
        }

        if (!userData?.role) {
          throw new Error("No user data returned from server");
        }

        setAuthUser({ ...userData, token: authToken });
        toast.success(`Welcome ${userData.username || userData.email}!`);

        clearInterval(progressInterval);
        setProgress(2);

        setTimeout(() => {
          setShowLoadingScreen(false);
          setGoogleLoading(false);
          navigate(getRolePath(userData.role), { replace: true });
        }, 1500);
      } else {
        throw new Error(response.data?.message || "Google login failed");
      }
    } catch (err) {
      console.error("[Google Auth]", err);
      clearInterval(progressInterval);
      setShowLoadingScreen(false);

      // Handle the error similar to how googleLogin would
      if (err.response) {
        handleBackendError(err);
      } else {
        toast.error(err.message || "Google login failed");
      }
      setGoogleLoading(false);
    }
  };

  // ── Handle Google Login Error ────────────────────────────
  const handleGoogleError = () => {
    toast.error("Google login failed. Please try again.");
    setGoogleLoading(false);
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

        if (!user?.role) throw new Error("No user data returned from server");

        if (token && !localStorage.getItem("zenosms_token")) {
          localStorage.setItem("zenosms_token", token);
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
        const signupData = {
          username: form.username,
          email: form.email,
          password: form.password,
          phoneNumber: form.phoneNumber || undefined,
        };

        await signup(signupData);
        toast.success("Account created! Signing you in…");

        const res = await login({ email: form.email, password: form.password });
        const payload = res?.data ?? res;
        const user = payload?.user ?? payload;
        const token = payload?.token;

        if (!user?.role) throw new Error("Login after signup failed");

        if (token && !localStorage.getItem("zenosms_token")) {
          localStorage.setItem("zenosms_token", token);
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
      console.error("[Auth]", err);
      clearInterval(progressInterval);
      setShowLoadingScreen(false);
      handleBackendError(err);
      setLoading(false);
    }
  };

  const eyeBtn = (
    <button
      type="button"
      tabIndex={-1}
      onClick={() => setShowPass((p) => !p)}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
    >
      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
    </button>
  );

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <>
        <AnimatePresence mode="wait">
          {showLoadingScreen && (
            <LoadingScreen key="loading-screen" progress={progress} />
          )}
        </AnimatePresence>

        <div
          className={`min-h-screen flex items-center justify-center px-4 py-16 relative bg-transparent ${showLoadingScreen ? "opacity-0 pointer-events-none" : "opacity-100"}`}
        >
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 -left-20 w-72 h-72 bg-green-500/8 rounded-full blur-3xl animate-pulse" />
            <div
              className="absolute bottom-20 -right-20 w-72 h-72 bg-blue-500/8 rounded-full blur-3xl animate-pulse"
              style={{ animationDelay: "1s" }}
            />
          </div>

          <button
            onClick={() => navigate("/")}
            className="absolute top-4 left-4 z-10 flex items-center gap-2 px-4 py-2 bg-gray-900/60 backdrop-blur-sm border border-white/10 rounded-lg text-gray-400 hover:text-green-400 hover:border-green-500/40 transition-all text-sm"
          >
            <ArrowRight className="w-4 h-4 rotate-180" />
            Back to Home
          </button>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-full max-w-md"
          >
            <div className="text-center mb-8">
              <div className="flex justify-center items-center mb-4">
                <div className="rounded-2xl bg-gradient-to-br from-green-600 to-green-500 flex items-center justify-center shadow-lg shadow-green-500/30">
                  <img
                    src={imageObject.Logo3}
                    className="rounded-xl w-16 h-16 object-cover"
                    alt="ZenoSMS Logo"
                  />
                </div>
              </div>
              <h1
                className="text-3xl font-bold text-white mb-2"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {isLogin ? "Welcome Back" : "Create Account"}
              </h1>
              <p className="text-gray-500 text-sm">
                {isLogin
                  ? "Sign in to access your dashboard"
                  : "Join thousands of users growing globally"}
              </p>
            </div>

            <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-2xl p-8 shadow-2xl">
              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                <AnimatePresence>
                  {!isLogin && (
                    <motion.div
                      key="signup-fields"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden space-y-5"
                    >
                      <Field label="Username" error={errors.username}>
                        <Input
                          icon={User}
                          type="text"
                          placeholder="your_username"
                          value={form.username}
                          onChange={setField("username")}
                          error={errors.username}
                        />
                      </Field>

                      <Field label="Phone Number" error={errors.phoneNumber}>
                        <Input
                          icon={Phone}
                          type="tel"
                          placeholder="+234 801 234 5678"
                          value={form.phoneNumber}
                          onChange={setField("phoneNumber")}
                          error={errors.phoneNumber}
                        />
                      </Field>
                    </motion.div>
                  )}
                </AnimatePresence>

                <Field label="Email Address" error={errors.email}>
                  <Input
                    icon={Mail}
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={setField("email")}
                    error={errors.email}
                  />
                </Field>

                <Field label="Password" error={errors.password}>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                    <input
                      type={showPass ? "text" : "password"}
                      placeholder="••••••••"
                      value={form.password}
                      onChange={setField("password")}
                      className={`w-full pl-10 pr-10 py-3 bg-gray-900/50 border rounded-lg text-white
                        placeholder-gray-600 outline-none transition-all focus:border-green-500/60
                        ${errors.password ? "border-red-500/50" : "border-white/10"}`}
                    />
                    {eyeBtn}
                  </div>
                </Field>

                <AnimatePresence>
                  {!isLogin && (
                    <motion.div
                      key="confirm"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <Field
                        label="Confirm Password"
                        error={errors.confirmPassword}
                      >
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                          <input
                            type={showPass ? "text" : "password"}
                            placeholder="Repeat password"
                            value={form.confirmPassword}
                            onChange={setField("confirmPassword")}
                            className={`w-full pl-10 pr-4 py-3 bg-gray-900/50 border rounded-lg text-white
                              placeholder-gray-600 outline-none transition-all focus:border-green-500/60
                              ${errors.confirmPassword ? "border-red-500/50" : "border-white/10"}`}
                          />
                        </div>
                      </Field>
                    </motion.div>
                  )}
                </AnimatePresence>

                {isLogin && (
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-white/20 bg-gray-900/50 accent-green-500"
                      />
                      <span className="text-sm text-gray-400">Remember me</span>
                    </label>
                    <Link to="/forgotten-password">
                      {" "}
                      <button
                        type="button"
                        className="text-sm text-green-500 hover:text-green-400 transition-colors"
                      >
                        Forgot password?
                      </button>
                    </Link>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-green-600 to-green-500
                    hover:from-green-500 hover:to-green-400 text-white font-semibold rounded-lg
                    transition-all duration-200 shadow-lg shadow-green-500/20
                    disabled:opacity-50 disabled:cursor-not-allowed
                    flex items-center justify-center gap-2 mt-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {isLogin ? "Signing in…" : "Creating account…"}
                    </>
                  ) : (
                    <>
                      {isLogin ? "Sign In" : "Create Account"}{" "}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="relative my-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-3 bg-gray-900/50 text-gray-600 text-sm">
                      or continue with
                    </span>
                  </div>
                </div>

                {/* Custom Google Login Button - UPDATED to match GoogleButton behavior */}
                <div className="flex justify-center">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    useOneTap
                    theme="outline"
                    size="large"
                    width="100%"
                    text="continue_with"
                    shape="rectangular"
                    logo_alignment="center"
                    render={(renderProps) => (
                      <CustomGoogleButton
                        onClick={renderProps.onClick}
                        isLoading={googleLoading}
                      />
                    )}
                  />
                </div>

                <p className="text-center text-sm text-gray-500 pt-2">
                  {isLogin ? "New to Zenosms? " : "Already have an account? "}
                  <button
                    type="button"
                    onClick={switchMode}
                    className="text-green-500 hover:text-green-400 font-semibold transition-colors"
                  >
                    {isLogin ? " Create an account " : "Sign In here"}
                  </button>
                </p>
              </form>

              <div className="flex items-center justify-between bg-green-900/30 p-4 rounded-2xl gap-4 mt-8">
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-green-500" />
                  <span className="text-xs text-gray-500">Secure Login</span>
                </div>
                <div className="flex items-center justify-center gap-1">
                  <div className="bg-green-600 w-2 h-2 rounded-full"></div>
                  <span className="text-white text-[11px]">Online</span>
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
