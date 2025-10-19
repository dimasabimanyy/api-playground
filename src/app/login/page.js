"use client";

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { getThemeClasses } from '@/lib/theme';
import { Zap, Chrome, ArrowRight, Mail, Lock, Eye, EyeOff, Shield, Globe } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const { signInWithGoogle } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const themeClasses = getThemeClasses(isDark);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError('');
      await signInWithGoogle();
    } catch (err) {
      setError(err.message || 'Failed to sign in with Google');
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen relative overflow-hidden ${
      isDark 
        ? 'bg-[#0a0a0a]' 
        : 'bg-white'
    }`}>
      
      {/* Geometric Background Pattern */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Grid overlay */}
        <div className={`absolute inset-0 ${
          isDark 
            ? 'bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)]' 
            : 'bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)]'
        } bg-[size:32px_32px]`} />
        
        {/* Gradient orbs */}
        <div className={`absolute top-0 left-1/4 w-[500px] h-[500px] ${
          isDark ? 'bg-blue-500/5' : 'bg-blue-500/3'
        } rounded-full blur-3xl animate-pulse`} />
        <div className={`absolute bottom-0 right-1/4 w-[400px] h-[400px] ${
          isDark ? 'bg-violet-500/5' : 'bg-violet-500/3'
        } rounded-full blur-3xl animate-pulse`} style={{animationDelay: '1s'}} />
        
        {/* Geometric shapes */}
        <div className="absolute top-1/4 right-1/4 w-2 h-2 bg-blue-500/20 rounded-full animate-ping" style={{animationDelay: '2s'}} />
        <div className="absolute bottom-1/3 left-1/3 w-1 h-1 bg-violet-500/30 rounded-full animate-ping" style={{animationDelay: '3s'}} />
      </div>

      {/* Header */}
      <header className={`relative z-10 border-b ${
        isDark ? 'border-gray-800/50 bg-black/20' : 'border-gray-100 bg-white/80'
      } backdrop-blur-xl`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/playground" className="flex items-center gap-3 group">
            <div className={`relative h-8 w-8 rounded-lg ${
              isDark 
                ? 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/25' 
                : 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/15'
            } flex items-center justify-center transition-all duration-300 group-hover:scale-105`}>
              <Zap className="h-4 w-4 text-white" />
              <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            </div>
            <div className="space-y-0">
              <h1 className={`text-lg font-bold tracking-tight ${themeClasses.text.primary} group-hover:text-blue-600 transition-colors`}>
                API Playground
              </h1>
              <p className={`text-xs ${themeClasses.text.tertiary} leading-none`}>
                Developer Tools
              </p>
            </div>
          </Link>
          
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-lg transition-all duration-200 ${
              isDark 
                ? 'hover:bg-gray-800 text-gray-400 hover:text-white' 
                : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
            }`}
          >
            {isDark ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-80px)] px-6 py-12">
        <div className="w-full max-w-[480px] space-y-8">
          
          {/* Hero Section */}
          <div className="text-center space-y-6">
            <div className="space-y-3">
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 ${
                isDark 
                  ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' 
                  : 'bg-blue-50 border-blue-200 text-blue-600'
              } border rounded-full text-sm font-medium`}>
                <Globe className="h-3 w-3" />
                Join 10,000+ developers
              </div>
              
              <h1 className={`text-3xl font-bold tracking-tight ${themeClasses.text.primary}`}>
                Welcome back
              </h1>
              <p className={`text-lg ${themeClasses.text.secondary} max-w-md mx-auto leading-relaxed`}>
                Sign in to access your API collections, saved requests, and development workspace.
              </p>
            </div>
          </div>

          {/* Login Card */}
          <div className={`relative ${
            isDark 
              ? 'bg-gray-900/50 border-gray-800/50' 
              : 'bg-white border-gray-200'
          } backdrop-blur-xl border rounded-2xl p-8 shadow-2xl ${
            isDark ? 'shadow-black/25' : 'shadow-gray-900/10'
          }`}>
            
            {/* Glow effect */}
            <div className={`absolute inset-0 ${
              isDark ? 'bg-gradient-to-br from-blue-500/5 to-violet-500/5' : 'bg-gradient-to-br from-blue-500/2 to-violet-500/2'
            } rounded-2xl -z-10`} />
            
            <div className="space-y-6">
              {/* Header */}
              <div className="text-center space-y-2">
                <h2 className={`text-xl font-semibold ${themeClasses.text.primary}`}>
                  {isSignUp ? 'Create your account' : 'Sign in to your account'}
                </h2>
                <p className={`text-sm ${themeClasses.text.secondary}`}>
                  {isSignUp ? 'Get started with API Playground today' : 'Continue where you left off'}
                </p>
              </div>

              {/* Error Display */}
              {error && (
                <div className={`${
                  isDark 
                    ? 'bg-red-500/10 border-red-500/20 text-red-400' 
                    : 'bg-red-50 border-red-200 text-red-600'
                } border rounded-xl px-4 py-3 text-sm font-medium flex items-center gap-2`}>
                  <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0" />
                  {error}
                </div>
              )}

              {/* Form */}
              <div className="space-y-4">
                {/* Email Input */}
                <div className="space-y-2">
                  <label className={`text-sm font-medium ${themeClasses.text.primary}`}>
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${themeClasses.text.tertiary}`} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className={`w-full pl-10 pr-4 py-3 ${
                        isDark 
                          ? 'bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 focus:border-blue-500 focus:bg-gray-800' 
                          : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:bg-white'
                      } border rounded-xl text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="space-y-2">
                  <label className={`text-sm font-medium ${themeClasses.text.primary}`}>
                    Password
                  </label>
                  <div className="relative">
                    <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${themeClasses.text.tertiary}`} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className={`w-full pl-10 pr-12 py-3 ${
                        isDark 
                          ? 'bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 focus:border-blue-500 focus:bg-gray-800' 
                          : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:bg-white'
                      } border rounded-xl text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={`absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${themeClasses.text.tertiary} hover:${themeClasses.text.secondary} transition-colors`}
                    >
                      {showPassword ? <EyeOff /> : <Eye />}
                    </button>
                  </div>
                </div>

                {/* Forgot Password */}
                {!isSignUp && (
                  <div className="flex justify-end">
                    <Link 
                      href="/forgot-password" 
                      className={`text-sm font-medium ${themeClasses.text.accent} hover:underline transition-colors`}
                    >
                      Forgot password?
                    </Link>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={!email || !password}
                  className={`w-full flex items-center justify-center gap-2 px-6 py-3 ${
                    isDark 
                      ? 'bg-blue-600 hover:bg-blue-500 text-white' 
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  } rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] group`}
                >
                  <span>{isSignUp ? 'Create account' : 'Sign in'}</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>

              {/* Divider */}
              <div className="relative flex items-center">
                <div className={`flex-1 border-t ${isDark ? 'border-gray-800' : 'border-gray-200'}`} />
                <span className={`px-4 text-sm ${themeClasses.text.tertiary} bg-inherit`}>
                  or continue with
                </span>
                <div className={`flex-1 border-t ${isDark ? 'border-gray-800' : 'border-gray-200'}`} />
              </div>

              {/* Google Sign In */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className={`group w-full flex items-center justify-center gap-3 px-6 py-3 ${
                  isDark 
                    ? 'bg-gray-800/50 border-gray-700 hover:bg-gray-800 text-white' 
                    : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-900'
                } border rounded-xl font-medium transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]`}
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-current border-t-transparent" />
                ) : (
                  <Chrome className="h-5 w-5" />
                )}
                <span>
                  {loading ? 'Signing in...' : 'Continue with Google'}
                </span>
              </button>

              {/* Security Badge */}
              <div className={`flex items-center justify-center gap-2 pt-4 border-t ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
                <Shield className={`h-4 w-4 ${themeClasses.text.accent}`} />
                <span className={`text-xs ${themeClasses.text.tertiary}`}>
                  Protected by enterprise-grade security
                </span>
              </div>
            </div>
          </div>

          {/* Toggle Sign Up */}
          <div className="text-center">
            <p className={`text-sm ${themeClasses.text.secondary}`}>
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className={`font-medium ${themeClasses.text.accent} hover:underline transition-colors`}
              >
                {isSignUp ? 'Sign in' : 'Create account'}
              </button>
            </p>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-center gap-6 text-xs">
            <Link 
              href="/privacy" 
              className={`${themeClasses.text.tertiary} hover:${themeClasses.text.secondary} transition-colors`}
            >
              Privacy Policy
            </Link>
            <div className={`h-1 w-1 rounded-full ${themeClasses.text.tertiary}`} />
            <Link 
              href="/terms" 
              className={`${themeClasses.text.tertiary} hover:${themeClasses.text.secondary} transition-colors`}
            >
              Terms of Service
            </Link>
            <div className={`h-1 w-1 rounded-full ${themeClasses.text.tertiary}`} />
            <Link 
              href="/support" 
              className={`${themeClasses.text.tertiary} hover:${themeClasses.text.secondary} transition-colors`}
            >
              Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}