"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { getThemeClasses } from "@/lib/theme";
import {
  Zap,
  Chrome,
  ArrowRight,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Shield,
  Globe,
} from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const { signInWithGoogle } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const themeClasses = getThemeClasses(isDark);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError("");
      await signInWithGoogle();
    } catch (err) {
      setError(err.message || "Failed to sign in with Google");
      setLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen relative overflow-hidden ${
        isDark
          ? "bg-gradient-to-br from-[#0a0a0a] via-[#0d0d0d] to-[#0a0a0a]"
          : "bg-gradient-to-br from-gray-50 via-white to-gray-100"
      }`}
    >
      {/* Sophisticated Background Layers */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Noise texture overlay */}
        <div
          className={`absolute inset-0 opacity-30 ${
            isDark
              ? `bg-[url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='1' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.02'/%3E%3C/svg%3E")]`
              : `bg-[url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='1' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.01'/%3E%3C/svg%3E")]`
          }`}
        />

        {/* Radial gradient overlay for depth */}
        <div
          className={`absolute inset-0 ${
            isDark
              ? "bg-radial-gradient from-transparent via-black/5 to-black/20"
              : "bg-radial-gradient from-transparent via-gray-900/2 to-gray-900/5"
          }`}
          style={{
            background: isDark
              ? "radial-gradient(circle at 50% 50%, transparent 0%, rgba(0,0,0,0.05) 50%, rgba(0,0,0,0.2) 100%)"
              : "radial-gradient(circle at 50% 50%, transparent 0%, rgba(0,0,0,0.02) 50%, rgba(0,0,0,0.05) 100%)",
          }}
        />

        {/* Grid pattern with fade */}
        <div
          className={`absolute inset-0 ${
            isDark
              ? "bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)]"
              : "bg-[linear-gradient(rgba(0,0,0,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.015)_1px,transparent_1px)]"
          } bg-[size:48px_48px]`}
          style={{
            maskImage:
              "radial-gradient(circle at center, black 0%, transparent 70%)",
            WebkitMaskImage:
              "radial-gradient(circle at center, black 0%, transparent 70%)",
          }}
        />

        {/* Premium ambient lighting */}
        <div
          className={`absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] ${
            isDark ? "bg-blue-500/3" : "bg-blue-500/2"
          } rounded-full blur-3xl`}
        />
        <div
          className={`absolute bottom-1/4 right-1/3 w-[600px] h-[400px] ${
            isDark ? "bg-violet-500/4" : "bg-violet-500/2"
          } rounded-full blur-3xl`}
        />
        <div
          className={`absolute top-1/2 left-1/4 w-[300px] h-[300px] ${
            isDark ? "bg-emerald-500/2" : "bg-emerald-500/1"
          } rounded-full blur-3xl`}
        />

        {/* Floating particles */}
        <div
          className="absolute top-1/4 right-1/4 w-1 h-1 bg-blue-400/40 rounded-full animate-pulse"
          style={{ animationDelay: "0s", animationDuration: "3s" }}
        />
        <div
          className="absolute top-1/3 left-1/3 w-0.5 h-0.5 bg-violet-400/30 rounded-full animate-pulse"
          style={{ animationDelay: "1s", animationDuration: "4s" }}
        />
        <div
          className="absolute bottom-1/3 right-1/3 w-1.5 h-1.5 bg-emerald-400/20 rounded-full animate-pulse"
          style={{ animationDelay: "2s", animationDuration: "5s" }}
        />
        <div
          className="absolute bottom-1/4 left-1/2 w-0.5 h-0.5 bg-blue-400/25 rounded-full animate-pulse"
          style={{ animationDelay: "3s", animationDuration: "3.5s" }}
        />

        {/* Dot pattern overlay */}
        <div
          className={`absolute inset-0 ${
            isDark
              ? "bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.02)_1px,transparent_0)]"
              : "bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.01)_1px,transparent_0)]"
          } bg-[size:24px_24px]`}
          style={{
            maskImage:
              "radial-gradient(ellipse at center, black 0%, transparent 60%)",
            WebkitMaskImage:
              "radial-gradient(ellipse at center, black 0%, transparent 60%)",
          }}
        />
      </div>

      {/* Header */}
      <header
        className={`relative z-10 border-b ${
          isDark
            ? "border-gray-800/50 bg-black/20"
            : "border-gray-100 bg-white/80"
        } backdrop-blur-xl`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/playground" className="flex items-center gap-3 group">
            <div
              className={`relative h-8 w-8 rounded-lg ${
                isDark
                  ? "bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/25"
                  : "bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/15"
              } flex items-center justify-center transition-all duration-300 group-hover:scale-105`}
            >
              <Zap className="h-4 w-4 text-white" />
              <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            </div>
            <div className="space-y-0">
              <h1
                className={`text-lg font-bold tracking-tight ${themeClasses.text.primary} group-hover:text-blue-600 transition-colors`}
              >
                API Playground
              </h1>
              <p
                className={`text-xs ${themeClasses.text.tertiary} leading-none`}
              >
                Developer Tools
              </p>
            </div>
          </Link>

          <button
            onClick={toggleTheme}
            className={`p-2 rounded-lg transition-all duration-200 ${
              isDark
                ? "hover:bg-gray-800 text-gray-400 hover:text-white"
                : "hover:bg-gray-100 text-gray-600 hover:text-gray-900"
            }`}
          >
            {isDark ? "☀️" : "🌙"}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-80px)] px-6 py-12">
        <div className="w-full max-w-[480px] space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-6">
            <div className="space-y-3">
              <div
                className={`inline-flex items-center gap-2 px-3 py-1.5 ${
                  isDark
                    ? "bg-blue-500/10 border-blue-500/20 text-blue-400"
                    : "bg-blue-50 border-blue-200 text-blue-600"
                } border rounded-full text-sm font-medium`}
              >
                <Globe className="h-3 w-3" />
                Join 10,000+ developers
              </div>

              <h1
                className={`text-3xl font-bold tracking-tight ${themeClasses.text.primary}`}
              >
                Welcome back
              </h1>
              <p
                className={`text-lg ${themeClasses.text.secondary} max-w-md mx-auto leading-relaxed`}
              >
                Sign in to access your API collections, saved requests, and
                development workspace.
              </p>
            </div>
          </div>

          {/* Login Card */}
          <div
            className={`relative group ${
              isDark
                ? "bg-gray-900/60 border-gray-800/60"
                : "bg-white/90 border-gray-200/60"
            } backdrop-blur-2xl border rounded-2xl p-8 shadow-2xl ${
              isDark ? "shadow-black/40" : "shadow-gray-900/15"
            }`}
            style={{
              boxShadow: isDark
                ? "0 25px 50px -12px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.1)"
                : "0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.9)",
            }}
          >
            {/* Multi-layer glow effects */}
            <div
              className={`absolute -inset-0.5 ${
                isDark
                  ? "bg-gradient-to-br from-blue-500/20 via-violet-500/20 to-emerald-500/20"
                  : "bg-gradient-to-br from-blue-500/10 via-violet-500/10 to-emerald-500/10"
              } rounded-2xl blur-xl -z-30 opacity-60`}
            />
            <div
              className={`absolute -inset-1 ${
                isDark
                  ? "bg-gradient-to-br from-blue-500/10 via-violet-500/10 to-emerald-500/10"
                  : "bg-gradient-to-br from-blue-500/5 via-violet-500/5 to-emerald-500/5"
              } rounded-2xl blur-2xl -z-20 opacity-40`}
            />

            {/* Card inner glow */}
            <div
              className={`absolute inset-0 ${
                isDark
                  ? "bg-gradient-to-br from-blue-500/[0.03] via-transparent to-violet-500/[0.03]"
                  : "bg-gradient-to-br from-blue-500/[0.015] via-transparent to-violet-500/[0.015]"
              } rounded-2xl -z-10`}
            />

            {/* Ambient light reflection */}
            <div
              className={`absolute top-0 left-1/2 transform -translate-x-1/2 w-1/2 h-px ${
                isDark
                  ? "bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  : "bg-gradient-to-r from-transparent via-white/60 to-transparent"
              }`}
            />

            <div className="space-y-6">
              {/* Header */}
              <div className="text-center space-y-2">
                <h2
                  className={`text-xl font-semibold ${themeClasses.text.primary}`}
                >
                  {isSignUp ? "Create your account" : "Sign in to your account"}
                </h2>
                <p className={`text-sm ${themeClasses.text.secondary}`}>
                  {isSignUp
                    ? "Get started with API Playground today"
                    : "Continue where you left off"}
                </p>
              </div>

              {/* Error Display */}
              {error && (
                <div
                  className={`${
                    isDark
                      ? "bg-red-500/10 border-red-500/20 text-red-400"
                      : "bg-red-50 border-red-200 text-red-600"
                  } border rounded-xl px-4 py-3 text-sm font-medium flex items-center gap-2`}
                >
                  <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0" />
                  {error}
                </div>
              )}

              {/* Form */}
              <div className="space-y-4">
                {/* Email Input */}
                <div className="space-y-2">
                  <label
                    className={`text-sm font-medium ${themeClasses.text.primary} transition-colors`}
                  >
                    Email address
                  </label>
                  <div className="relative group">
                    <Mail
                      className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${themeClasses.text.tertiary} transition-all duration-300 group-focus-within:text-blue-500 group-focus-within:scale-110`}
                    />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className={`w-full pl-10 pr-4 py-3 ${
                        isDark
                          ? "bg-gray-800/40 border-gray-700/60 text-white placeholder-gray-400 focus:border-blue-500/80 focus:bg-gray-800/60"
                          : "bg-gray-50/50 border-gray-200/60 text-gray-900 placeholder-gray-500 focus:border-blue-500/80 focus:bg-white/80"
                      } border rounded-xl text-sm transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:shadow-lg ${
                        isDark
                          ? "focus:shadow-blue-500/20"
                          : "focus:shadow-blue-500/10"
                      } hover:border-gray-600 dark:hover:border-gray-600`}
                      style={{
                        backdropFilter: "blur(16px)",
                      }}
                    />
                    {/* Input glow effect on focus */}
                    <div
                      className={`absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-violet-500/0 opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 -z-10 blur-xl`}
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="space-y-2">
                  <label
                    className={`text-sm font-medium ${themeClasses.text.primary} transition-colors`}
                  >
                    Password
                  </label>
                  <div className="relative group">
                    <Lock
                      className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${themeClasses.text.tertiary} transition-all duration-300 group-focus-within:text-blue-500 group-focus-within:scale-110`}
                    />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className={`w-full pl-10 pr-12 py-3 ${
                        isDark
                          ? "bg-gray-800/40 border-gray-700/60 text-white placeholder-gray-400 focus:border-blue-500/80 focus:bg-gray-800/60"
                          : "bg-gray-50/50 border-gray-200/60 text-gray-900 placeholder-gray-500 focus:border-blue-500/80 focus:bg-white/80"
                      } border rounded-xl text-sm transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:shadow-lg ${
                        isDark
                          ? "focus:shadow-blue-500/20"
                          : "focus:shadow-blue-500/10"
                      } hover:border-gray-600 dark:hover:border-gray-600`}
                      style={{
                        backdropFilter: "blur(16px)",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={`absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${themeClasses.text.tertiary} hover:${themeClasses.text.secondary} transition-all duration-200 hover:scale-110`}
                    >
                      {showPassword ? <EyeOff /> : <Eye />}
                    </button>
                    {/* Input glow effect on focus */}
                    <div
                      className={`absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-violet-500/0 opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 -z-10 blur-xl`}
                    />
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
                <div className="relative">
                  <button
                    type="submit"
                    disabled={!email || !password}
                    className={`relative w-full flex items-center justify-center gap-2 px-6 py-3 ${
                      isDark
                        ? "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white"
                        : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
                    } rounded-xl font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] hover:shadow-lg ${
                      isDark
                        ? "hover:shadow-blue-500/25"
                        : "hover:shadow-blue-500/20"
                    } group overflow-hidden`}
                    style={{
                      boxShadow: isDark
                        ? "0 4px 14px 0 rgba(59, 130, 246, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.2)"
                        : "0 4px 14px 0 rgba(59, 130, 246, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.3)",
                    }}
                  >
                    {/* Button shimmer effect */}
                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />

                    <span className="relative z-10">
                      {isSignUp ? "Create account" : "Sign in"}
                    </span>
                    <ArrowRight className="relative z-10 h-4 w-4 group-hover:translate-x-0.5 transition-transform duration-300" />
                  </button>

                  {/* Button glow effect */}
                  <div
                    className={`absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 opacity-0 group-hover:opacity-20 transition-opacity duration-300 -z-10 blur-xl`}
                  />
                </div>
              </div>

              {/* Divider */}
              <div className="relative flex items-center">
                <div
                  className={`flex-1 border-t ${
                    isDark ? "border-gray-800" : "border-gray-200"
                  }`}
                />
                <span
                  className={`px-4 text-sm ${themeClasses.text.tertiary} bg-inherit`}
                >
                  or continue with
                </span>
                <div
                  className={`flex-1 border-t ${
                    isDark ? "border-gray-800" : "border-gray-200"
                  }`}
                />
              </div>

              {/* Google Sign In */}
              <div className="relative group">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className={`relative w-full flex items-center justify-center gap-3 px-6 py-3 ${
                    isDark
                      ? "bg-gray-800/60 border-gray-700/60 hover:bg-gray-800/80 text-white"
                      : "bg-white/80 border-gray-200/60 hover:bg-white text-gray-900"
                  } border rounded-xl font-medium transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] hover:shadow-lg ${
                    isDark
                      ? "hover:shadow-gray-900/50"
                      : "hover:shadow-gray-500/10"
                  } backdrop-blur-xl overflow-hidden`}
                  style={{
                    boxShadow: isDark
                      ? "0 4px 14px 0 rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)"
                      : "0 4px 14px 0 rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8)",
                  }}
                >
                  {/* Button shimmer effect */}
                  <div
                    className={`absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ${
                      isDark
                        ? "bg-gradient-to-r from-transparent via-white/10 to-transparent"
                        : "bg-gradient-to-r from-transparent via-gray-900/5 to-transparent"
                    } skew-x-12`}
                  />

                  {loading ? (
                    <div className="relative z-10 animate-spin rounded-full h-5 w-5 border-2 border-current border-t-transparent" />
                  ) : (
                    <Chrome className="relative z-10 h-5 w-5 transition-transform group-hover:scale-110" />
                  )}
                  <span className="relative z-10">
                    {loading ? "Signing in..." : "Continue with Google"}
                  </span>
                </button>

                {/* Button ambient glow */}
                <div
                  className={`absolute inset-0 rounded-xl ${
                    isDark ? "bg-white/5" : "bg-gray-900/5"
                  } opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-xl`}
                />
              </div>

              {/* Security Badge */}
              <div
                className={`flex items-center justify-center gap-2 pt-4 border-t ${
                  isDark ? "border-gray-800" : "border-gray-200"
                }`}
              >
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
              {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className={`font-medium ${themeClasses.text.accent} hover:underline transition-colors`}
              >
                {isSignUp ? "Sign in" : "Create account"}
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
            <div
              className={`h-1 w-1 rounded-full ${themeClasses.text.tertiary}`}
            />
            <Link
              href="/terms"
              className={`${themeClasses.text.tertiary} hover:${themeClasses.text.secondary} transition-colors`}
            >
              Terms of Service
            </Link>
            <div
              className={`h-1 w-1 rounded-full ${themeClasses.text.tertiary}`}
            />
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
