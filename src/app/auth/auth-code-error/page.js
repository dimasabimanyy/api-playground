"use client";

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { AlertCircle } from 'lucide-react'

export default function AuthCodeError() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
            <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Authentication Error
          </h1>
          
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-6 space-y-2">
            <p>Sorry, there was an error during the authentication process.</p>
            
            {error && (
              <div className="text-left bg-gray-50 dark:bg-gray-900 p-3 rounded border">
                <p className="font-medium text-gray-900 dark:text-white">Error:</p>
                <p className="text-red-600 dark:text-red-400">{error}</p>
                {errorDescription && (
                  <>
                    <p className="font-medium text-gray-900 dark:text-white mt-2">Description:</p>
                    <p className="text-gray-700 dark:text-gray-300">{errorDescription}</p>
                  </>
                )}
              </div>
            )}
            
            <p>Please check the following:</p>
            <ul className="text-left list-disc list-inside space-y-1 text-xs">
              <li>Your Supabase project is properly configured</li>
              <li>Google OAuth is enabled in Supabase</li>
              <li>Redirect URLs are correctly set</li>
              <li>Environment variables are properly configured</li>
            </ul>
          </div>
          
          <div className="space-y-3">
            <Link
              href="/login"
              className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Try Again
            </Link>
            <Link
              href="/"
              className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Go Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}