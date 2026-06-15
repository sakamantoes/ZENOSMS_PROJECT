import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight,
  Globe,
  Shield,
  CheckCircle,
  AlertCircle,
  Phone,
  Home,
  ArrowLeft
} from 'lucide-react';
import imageObject from '../utils/image';

const AuthComponent = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (!isLogin) {
      if (!formData.name) {
        newErrors.name = 'Name is required';
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log('Form submitted:', { ...formData, isLogin });
      setIsLoading(false);
      // Here you would connect to your backend
      // Example: await axios.post('/api/auth/auth', { email, password })
    }, 1500);
  };

  // Switch between login and signup
  const handleSwitchMode = () => {
    setIsLogin(!isLogin);
    setErrors({});
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      name: ''
    });
    setShowPassword(false);
  };

  // Navigate to home page
  const goToHomePage = () => {
    window.location.href = '/';
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const inputVariants = {
    focus: { scale: 1.02, transition: { duration: 0.2 } }
  };

  return (
    <div className="min-h-screen flex items-center justify-center flex-col px-4 py-20 relative">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -left-20 w-72 h-72 bg-green-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 -right-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Back to Home Button */}
      <div className="absolute top-3 left-3 z-50">
        <button
          onClick={goToHomePage}
          className="flex items-center gap-2 px-4 py-2 bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-lg text-gray-300 hover:text-green-500 hover:border-green-500/50 transition-all duration-300 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:translate-x-[-2px] transition-transform" />
          <span className="text-sm font-medium">Back to Home</span>
        </button>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md"
      >
        {/* Brand Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-17 h-15 rounded-xl bg-gradient-to-br from-green-600 to-green-500 flex items-center justify-center">
              <img src={imageObject.Logo3} className='rounded-xl w-17 h-15'/>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-gray-400 text-sm">
            {isLogin 
              ? 'Sign in to access your dashboard' 
              : 'Join thousands of users growing globally'}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-gradient-to-br from-gray-900/50 to-gray-950/50 backdrop-blur-sm border border-white/10 rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Field (Signup only) */}
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
              >
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 bg-gray-900/50 border ${errors.name ? 'border-red-500/50' : 'border-white/10'} rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500/50 transition-all duration-300`}
                    placeholder="John Doe"
                  />
                </div>
                {errors.name && (
                  <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.name}
                  </p>
                )}
              </motion.div>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 bg-gray-900/50 border ${errors.email ? 'border-red-500/50' : 'border-white/10'} rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500/50 transition-all duration-300`}
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && (
                <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-12 py-3 bg-gray-900/50 border ${errors.password ? 'border-red-500/50' : 'border-white/10'} rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500/50 transition-all duration-300`}
                  placeholder="••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password (Signup only) */}
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
              >
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 bg-gray-900/50 border ${errors.confirmPassword ? 'border-red-500/50' : 'border-white/10'} rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500/50 transition-all duration-300`}
                    placeholder="Confirm password"
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.confirmPassword}
                  </p>
                )}
              </motion.div>
            )}

            {/* Remember Me & Forgot Password (Login only) */}
            {isLogin && (
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-white/20 bg-gray-900/50 text-green-500 focus:ring-green-500 focus:ring-offset-0"
                  />
                  <span className="text-sm text-gray-400">Remember me</span>
                </label>
                <button
                  type="button"
                  className="text-sm text-green-500 hover:text-green-400 transition-colors"
                >
                  Forgot password?
                </button>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-600 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg shadow-green-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{isLogin ? 'Signing in...' : 'Creating account...'}</span>
                </>
              ) : (
                <>
                  <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-gray-900/50 text-gray-500">or</span>
              </div>
            </div>

            {/* Social Login Buttons */}
            <div className="grid grid-cols-1 gap-3">
              <button
                type="button"
                className="py-2.5 bg-gray-900/50 border border-white/10 rounded-lg text-gray-300 hover:bg-gray-800/50 hover:border-green-500/30 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <span className="text-sm">Google</span>
              </button>
            
            </div>

            {/* Toggle between Login and Signup */}
            <div className="text-center pt-4">
              <p className="text-sm text-gray-400">
                {isLogin ? "New to ZenoSMS? " : "Already have an account? "}
                <button
                  type="button"
                  onClick={handleSwitchMode}
                  className="text-green-500 hover:text-green-400 font-semibold transition-colors"
                >
                  {isLogin ? 'Sign Up' : 'Sign In'}
                </button>
              </p>
            </div>
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