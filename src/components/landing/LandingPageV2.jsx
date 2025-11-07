'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { 
  ArrowRight, 
  ArrowUpRight,
  Play,
  Zap,
  Github,
  Sun,
  Moon
} from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import { useAuth } from '@/contexts/AuthContext'

export default function LandingPageV2() {
  const { theme, toggleTheme, isDark } = useTheme()
  const { user, loading: authLoading } = useAuth()

  const features = [
    "Send HTTP requests",
    "Organize in collections", 
    "Environment variables",
    "Auto-generate docs",
    "Export & share"
  ]

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDark ? 'bg-black text-white' : 'bg-white text-black'
    }`}>
      
      {/* Header */}
      <header className={`border-b transition-colors duration-300 ${
        isDark ? 'border-gray-800' : 'border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 hover:opacity-75 transition-opacity">
            <div className={`h-6 w-6 rounded ${
              isDark ? 'bg-white' : 'bg-black'
            } flex items-center justify-center`}>
              <Zap className={`h-3 w-3 ${
                isDark ? 'text-black' : 'text-white'
              }`} />
            </div>
            <span className="font-medium">API Playground</span>
          </Link>
          
          {/* Navigation */}
          <div className="flex items-center gap-6">
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/docs" className={`text-sm transition-colors ${
                isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-black'
              }`}>
                Docs
              </Link>
              <Link href="/pricing" className={`text-sm transition-colors ${
                isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-black'
              }`}>
                Pricing
              </Link>
              <Link href="https://github.com" className={`text-sm transition-colors ${
                isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-black'
              } flex items-center gap-1`}>
                <Github className="h-4 w-4" />
                GitHub
              </Link>
            </nav>

            <div className="flex items-center gap-3">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-md transition-all duration-200 ${
                  isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                }`}
                style={{ borderRadius: '6px' }}
              >
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>

              {authLoading ? (
                <div className={`h-8 w-8 rounded animate-pulse ${
                  isDark ? 'bg-gray-800' : 'bg-gray-200'
                }`} />
              ) : user ? (
                <div className="flex items-center gap-3">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                    isDark ? 'bg-white text-black' : 'bg-black text-white'
                  } text-sm font-medium`}>
                    {user.user_metadata?.avatar_url ? (
                      <img 
                        src={user.user_metadata.avatar_url} 
                        alt="User avatar"
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      user.user_metadata?.full_name?.charAt(0)?.toUpperCase() || 
                      user.email?.charAt(0)?.toUpperCase() || 
                      'U'
                    )}
                  </div>
                  <Link href="/playground">
                    <Button 
                      className={`h-8 px-3 text-sm ${
                        isDark 
                          ? 'bg-white text-black hover:bg-gray-200' 
                          : 'bg-black text-white hover:bg-gray-800'
                      }`}
                      style={{ borderRadius: '6px' }}
                    >
                      Open Playground
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link href="/login">
                    <button className={`text-sm px-3 py-2 transition-colors ${
                      isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-black'
                    }`}>
                      Sign In
                    </button>
                  </Link>
                  <Link href="/playground">
                    <Button 
                      className={`h-8 px-3 text-sm ${
                        isDark 
                          ? 'bg-white text-black hover:bg-gray-200' 
                          : 'bg-black text-white hover:bg-gray-800'
                      }`}
                      style={{ borderRadius: '6px' }}
                    >
                      Try Free
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-6">
        <section className="pt-24 pb-16">
          <div className="max-w-3xl">
            {/* Badge */}
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs mb-8 border ${
              isDark 
                ? 'bg-gray-900 border-gray-800 text-gray-400' 
                : 'bg-gray-50 border-gray-200 text-gray-600'
            }`}>
              <div className={`h-1.5 w-1.5 rounded-full ${
                isDark ? 'bg-green-500' : 'bg-green-600'
              }`} />
              Now in beta
            </div>

            {/* Headline */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-semibold leading-none tracking-tight mb-6">
              The API playground
              <br />
              for developers
            </h1>

            {/* Description */}
            <p className={`text-lg mb-8 max-w-2xl ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Test APIs, organize requests, and generate documentation. 
              Built with the same principles as Vercel—fast, simple, and beautiful.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link href="/playground">
                <Button 
                  className={`h-12 px-6 text-base font-medium ${
                    isDark 
                      ? 'bg-white text-black hover:bg-gray-200' 
                      : 'bg-black text-white hover:bg-gray-800'
                  } group`}
                  style={{ borderRadius: '6px' }}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start building
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/docs">
                <Button 
                  variant="outline" 
                  className={`h-12 px-6 text-base font-medium border ${
                    isDark 
                      ? 'border-gray-800 hover:bg-gray-900 hover:border-gray-700' 
                      : 'border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                  } group`}
                  style={{ borderRadius: '6px' }}
                >
                  Documentation
                  <ArrowUpRight className="h-4 w-4 ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </Button>
              </Link>
            </div>

            {/* Feature List */}
            <div className="flex flex-wrap gap-6">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className={`h-1.5 w-1.5 rounded-full ${
                    isDark ? 'bg-gray-600' : 'bg-gray-400'
                  }`} />
                  <span className={`text-sm ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {feature}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Product Preview */}
        <section className="pb-24">
          <div className={`relative rounded-lg overflow-hidden border ${
            isDark ? 'border-gray-800 bg-gray-950' : 'border-gray-200 bg-gray-50'
          }`}
            style={{ borderRadius: '12px' }}>
            
            {/* Browser Chrome */}
            <div className={`h-12 border-b flex items-center px-4 ${
              isDark ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-white'
            }`}>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500" />
                <div className="h-3 w-3 rounded-full bg-yellow-500" />
                <div className="h-3 w-3 rounded-full bg-green-500" />
              </div>
              <div className={`ml-4 text-xs ${
                isDark ? 'text-gray-500' : 'text-gray-400'
              }`}>
                api-playground.app
              </div>
            </div>

            {/* App Content */}
            <div className="h-96 p-6 flex gap-6">
              {/* Sidebar */}
              <div className={`w-64 rounded border ${
                isDark ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-white'
              }`}
                style={{ borderRadius: '6px' }}>
                <div className="p-4 space-y-3">
                  <div className={`h-8 rounded flex items-center px-3 ${
                    isDark ? 'bg-gray-800 text-white' : 'bg-black text-white'
                  }`}
                    style={{ borderRadius: '6px' }}>
                    <div className="text-xs font-medium">Add New...</div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className={`text-xs font-medium ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    } px-2`}>
                      Collections
                    </div>
                    <div className={`h-6 rounded px-2 flex items-center text-xs ${
                      isDark ? 'bg-gray-800/50 text-gray-300' : 'bg-gray-100 text-gray-700'
                    }`}>
                      Users API
                    </div>
                    <div className={`h-6 rounded px-2 flex items-center text-xs ${
                      isDark ? 'text-gray-500' : 'text-gray-500'
                    }`}>
                      Payment API
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Content */}
              <div className="flex-1 grid grid-rows-2 gap-4">
                {/* Request Panel */}
                <div className={`rounded border ${
                  isDark ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-white'
                }`}
                  style={{ borderRadius: '6px' }}>
                  <div className={`p-4 border-b ${
                    isDark ? 'border-gray-800' : 'border-gray-200'
                  }`}>
                    <div className="text-xs font-medium mb-3">Request</div>
                    <div className="flex gap-2">
                      <div className={`px-2 py-1 rounded text-xs font-bold ${
                        isDark 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-green-100 text-green-700'
                      }`}>
                        GET
                      </div>
                      <div className={`flex-1 h-6 rounded px-2 flex items-center text-xs ${
                        isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'
                      }`}>
                        https://api.example.com/users
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="space-y-2">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className={`h-2 rounded ${
                          isDark ? 'bg-gray-800' : 'bg-gray-200'
                        }`}
                          style={{ width: `${60 + i * 10}%` }} />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Response Panel */}
                <div className={`rounded border ${
                  isDark ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-white'
                }`}
                  style={{ borderRadius: '6px' }}>
                  <div className={`p-4 border-b ${
                    isDark ? 'border-gray-800' : 'border-gray-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-medium">Response</div>
                      <div className={`px-2 py-1 rounded text-xs font-bold ${
                        isDark 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-green-100 text-green-700'
                      }`}>
                        200 OK
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="space-y-2">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className={`h-2 rounded ${
                          isDark ? 'bg-gray-800' : 'bg-gray-200'
                        }`}
                          style={{ width: `${70 - i * 5}%` }} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="pb-24">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-medium mb-3">Fast & Lightweight</h3>
              <p className={`text-sm ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Built for speed. No bloated features or unnecessary complexity.
                Just the essentials, done exceptionally well.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-3">Developer First</h3>
              <p className={`text-sm ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Keyboard shortcuts, dark mode, and a clean interface designed
                by developers, for developers.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-3">Open Source</h3>
              <p className={`text-sm ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Fully open source and extensible. Build on top of it,
                customize it, make it your own.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="pb-24">
          <div className={`rounded-lg border p-12 text-center ${
            isDark ? 'border-gray-800 bg-gray-950' : 'border-gray-200 bg-gray-50'
          }`}
            style={{ borderRadius: '12px' }}>
            <h2 className="text-3xl font-semibold mb-4">
              Ready to build?
            </h2>
            <p className={`text-lg mb-8 ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Start testing your APIs in seconds.
            </p>
            <Link href="/playground">
              <Button 
                className={`h-12 px-8 text-base font-medium ${
                  isDark 
                    ? 'bg-white text-black hover:bg-gray-200' 
                    : 'bg-black text-white hover:bg-gray-800'
                } group`}
                style={{ borderRadius: '6px' }}
              >
                <Play className="h-4 w-4 mr-2" />
                Get started
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className={`border-t ${
        isDark ? 'border-gray-800' : 'border-gray-200'
      }`}>
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className={`h-6 w-6 rounded ${
                isDark ? 'bg-white' : 'bg-black'
              } flex items-center justify-center`}>
                <Zap className={`h-3 w-3 ${
                  isDark ? 'text-black' : 'text-white'
                }`} />
              </div>
              <span className="font-medium">API Playground</span>
            </div>

            {/* Links */}
            <nav className="grid grid-cols-2 md:flex md:items-center gap-6 md:gap-8">
              <Link href="/docs" className={`text-sm transition-colors ${
                isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-black'
              }`}>
                Documentation
              </Link>
              <Link href="/pricing" className={`text-sm transition-colors ${
                isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-black'
              }`}>
                Pricing
              </Link>
              <Link href="https://github.com" className={`text-sm transition-colors ${
                isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-black'
              }`}>
                GitHub
              </Link>
              <Link href="/privacy" className={`text-sm transition-colors ${
                isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-black'
              }`}>
                Privacy
              </Link>
            </nav>
          </div>
          
          <div className={`mt-12 pt-8 border-t text-center ${
            isDark ? 'border-gray-800' : 'border-gray-200'
          }`}>
            <p className={`text-xs ${
              isDark ? 'text-gray-500' : 'text-gray-400'
            }`}>
              © 2024 API Playground. Made with ♥ for developers.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}