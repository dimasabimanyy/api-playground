"use client";

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { getThemeClasses } from '@/lib/theme';
import { Zap, Chrome } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const { signInWithGoogle } = useAuth();
  const { isDark } = useTheme();
  const themeClasses = getThemeClasses(isDark);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
    <div className={`min-h-screen transition-colors duration-300 ${themeClasses.bg.primary}`}>
      {/* Header */}
      <header className={`border-b ${themeClasses.border.primary} ${themeClasses.bg.glass}`}>
        <div className="max-w-6xl mx-auto px-6 py-4">
          <Link href="/" className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <h1 className={`text-lg font-semibold tracking-tight ${themeClasses.text.primary}`}>
              API Playground
            </h1>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-6 py-12">
        <div className="max-w-md w-full">
          <div className={`rounded-xl border ${themeClasses.border.primary} ${themeClasses.card.base} p-8 shadow-lg`}>
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm rounded-full border border-blue-200 dark:border-blue-800 mb-4">
                <Zap className="h-3 w-3" />
                Welcome back
              </div>
              
              <h1 className={`text-2xl font-bold ${themeClasses.text.primary} mb-2`}>
                Sign in to API Playground
              </h1>
              
              <p className={`text-sm ${themeClasses.text.secondary}`}>
                Access your saved requests and collections
              </p>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg mb-6 text-sm">
                {error}
              </div>
            )}

            {/* Google Sign In */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className={`w-full flex items-center justify-center gap-3 px-4 py-3 border ${themeClasses.border.primary} rounded-lg hover:${isDark ? 'bg-gray-800' : 'bg-gray-50'} transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer`}
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-200 dark:border-gray-600 border-t-2 border-t-blue-600"></div>
              ) : (
                <Chrome className="h-5 w-5" />
              )}
              <span className={`font-medium ${themeClasses.text.primary}`}>
                {loading ? 'Signing in...' : 'Continue with Google'}
              </span>
            </button>

            {/* Footer */}
            <div className="mt-6 text-center">
              <p className={`text-sm ${themeClasses.text.tertiary}`}>
                New to API Playground?{' '}
                <Link 
                  href="/playground" 
                  className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors"
                >
                  Try it without signing in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}