'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Zap, 
  BookOpen, 
  Moon, 
  Sun, 
  Github, 
  ArrowRight,
  Compass,
  FileText,
  Palette,
  CheckCircle,
  Play
} from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import { useAuth } from '@/contexts/AuthContext'
import { getThemeClasses } from '@/lib/theme'

export default function LandingPage() {
  const { theme, toggleTheme, isDark } = useTheme()
  const { user, loading: authLoading } = useAuth()
  const themeClasses = getThemeClasses(isDark)
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleEmailSubmit = (e) => {
    e.preventDefault()
    // Handle email submission here
    setIsSubmitted(true)
    setTimeout(() => setIsSubmitted(false), 3000)
  }

  const features = [
    {
      icon: Compass,
      title: "Minimal Interface",
      description: "Focus on the API, not the clutter. Clean design that gets out of your way."
    },
    {
      icon: Zap,
      title: "Fast & Functional", 
      description: "Real-time response rendering with smooth interactions and quick workflows."
    },
    {
      icon: BookOpen,
      title: "Auto Documentation",
      description: "Generate clean, shareable API documentation automatically from your requests."
    },
    {
      icon: Palette,
      title: "Beautiful Themes",
      description: "Gorgeous in both dark and light mode with consistent, professional styling."
    }
  ]

  return (
    <div className={`min-h-screen transition-colors duration-300 ${themeClasses.bg.primary}`}>
      {/* Header */}
      <header className={`border-b ${themeClasses.border.primary} ${themeClasses.bg.glass}`}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className={`text-lg font-semibold ${themeClasses.text.primary}`}>
              API Playground
            </span>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded transition-all duration-200 ${themeClasses.button.ghost}`}
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            
            {authLoading ? (
              <div className="h-8 w-8 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
            ) : user ? (
              <div className="flex items-center space-x-3">
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center ${
                    isDark
                      ? "bg-gradient-to-br from-blue-600 to-blue-700"
                      : "bg-gradient-to-br from-blue-500 to-blue-600"
                  } text-white font-medium text-sm`}
                >
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
                  <Button className={`${themeClasses.button.primary}`}>
                    Open Playground
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link href="/login">
                  <Button variant="outline" className={`${themeClasses.button.secondary}`}>
                    Sign In
                  </Button>
                </Link>
                <Link href="/playground">
                  <Button className={`${themeClasses.button.primary}`}>
                    Try Free
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className={`absolute inset-0 ${isDark 
          ? 'bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5' 
          : 'bg-gradient-to-br from-blue-50/50 via-transparent to-purple-50/50'
        }`}></div>
        
        <div className="relative max-w-7xl mx-auto px-6 py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Hero Content */}
            <div className="space-y-8">
              <div className="space-y-6">
                <h1 className={`text-5xl lg:text-6xl font-bold leading-tight ${themeClasses.text.primary}`}>
                  A modern, lightweight 
                  <span className={`block ${themeClasses.text.accent}`}>
                    API playground
                  </span>
                </h1>
                <p className={`text-xl leading-relaxed max-w-lg ${themeClasses.text.secondary}`}>
                  Send requests, organize collections, and generate clean API docs — all in one place.
                </p>
              </div>
              
              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/playground">
                  <Button 
                    size="lg"
                    className={`${themeClasses.button.primary} group`}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Try It Now
                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  size="lg"
                  className={`${themeClasses.button.secondary}`}
                  onClick={() => document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Join Waitlist
                </Button>
              </div>
            </div>
            
            {/* Product Preview */}
            <div className="relative">
              <div className={`relative rounded-xl overflow-hidden border ${themeClasses.border.primary} ${themeClasses.bg.glass} shadow-2xl`}>
                <div className={`h-8 flex items-center px-4 border-b ${themeClasses.border.primary}`}>
                  <div className="flex space-x-2">
                    <div className="h-3 w-3 rounded-full bg-red-500"></div>
                    <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                    <div className="h-3 w-3 rounded-full bg-green-500"></div>
                  </div>
                </div>
                <div className={`p-4 ${themeClasses.bg.secondary}`}>
                  <div className="space-y-3">
                    {/* Header */}
                    <div className={`flex items-center justify-between py-2 border-b ${themeClasses.border.primary}`}>
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                          <Zap className="h-3 w-3 text-white" />
                        </div>
                        <span className={`text-xs font-medium ${themeClasses.text.primary}`}>API Playground</span>
                      </div>
                      <div className="flex space-x-1">
                        <div className="h-2 w-2 rounded-full bg-red-500"></div>
                        <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                        <div className="h-2 w-2 rounded-full bg-green-500"></div>
                      </div>
                    </div>
                    
                    {/* URL Bar */}
                    <div className="flex items-center gap-2">
                      <div className={`px-2 py-1 rounded text-xs font-bold ${isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700'}`}>
                        GET
                      </div>
                      <div className={`flex-1 h-7 rounded ${themeClasses.input.base} px-2 flex items-center text-xs`}>
                        https://api.example.com/users
                      </div>
                      <div className={`px-3 py-1 rounded text-xs ${themeClasses.button.primary}`}>
                        Send
                      </div>
                    </div>
                    
                    {/* Sidebar and Content */}
                    <div className="flex gap-3 h-32">
                      {/* Mini Sidebar */}
                      <div className={`w-16 rounded ${themeClasses.card.base} p-2`}>
                        <div className="space-y-2">
                          <div className={`h-6 rounded flex items-center justify-center ${isDark ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
                            <div className={`h-1 w-1 rounded-full ${isDark ? 'bg-blue-400' : 'bg-blue-600'}`}></div>
                          </div>
                          <div className={`h-4 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
                          <div className={`h-4 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
                        </div>
                      </div>
                      
                      {/* Main Content */}
                      <div className="flex-1 grid grid-cols-2 gap-3">
                        <div className={`p-2 rounded ${themeClasses.card.base}`}>
                          <div className={`text-xs ${themeClasses.text.tertiary} mb-2`}>Request</div>
                          <div className="space-y-1">
                            <div className={`h-1.5 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
                            <div className={`h-1.5 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-200'} w-3/4`}></div>
                            <div className={`h-1.5 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-200'} w-1/2`}></div>
                          </div>
                        </div>
                        <div className={`p-2 rounded ${themeClasses.card.base}`}>
                          <div className={`text-xs ${themeClasses.text.tertiary} mb-2 flex items-center gap-1`}>
                            Response 
                            <div className={`px-1 py-0.5 rounded text-xs ${isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700'}`}>
                              200
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className={`h-1.5 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
                            <div className={`h-1.5 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-200'} w-4/5`}></div>
                            <div className={`h-1.5 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-200'} w-2/3`}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={`py-24 border-t ${themeClasses.border.primary}`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className={`text-3xl lg:text-4xl font-bold mb-4 ${themeClasses.text.primary}`}>
              Built for developers who value simplicity
            </h2>
            <p className={`text-lg max-w-2xl mx-auto ${themeClasses.text.secondary}`}>
              Every feature designed to help you work faster and more efficiently
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div key={index} className={`p-6 rounded-xl ${themeClasses.card.base} group hover:scale-105 transition-all duration-300`}>
                  <div className={`h-12 w-12 rounded-lg flex items-center justify-center mb-4 ${isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className={`text-lg font-semibold mb-2 ${themeClasses.text.primary}`}>
                    {feature.title}
                  </h3>
                  <p className={`text-sm ${themeClasses.text.secondary}`}>
                    {feature.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Product Preview Section */}
      <section className={`py-24 border-t ${themeClasses.border.primary} ${isDark ? 'bg-gray-900/20' : 'bg-gray-50/50'}`}>
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className={`text-3xl lg:text-4xl font-bold mb-4 ${themeClasses.text.primary}`}>
            Familiar like Postman, but faster and cleaner
          </h2>
          <p className={`text-lg mb-12 max-w-2xl mx-auto ${themeClasses.text.secondary}`}>
            All the functionality you need, none of the bloat you don't
          </p>
          
          <div className={`relative rounded-xl overflow-hidden border ${themeClasses.border.primary} ${themeClasses.bg.glass} shadow-2xl max-w-5xl mx-auto`}>
            <div className={`aspect-video ${themeClasses.bg.secondary} flex items-center justify-center`}>
              <div className="text-center">
                <FileText className={`h-16 w-16 mx-auto mb-4 ${themeClasses.text.tertiary}`} />
                <p className={`text-lg ${themeClasses.text.secondary}`}>
                  Interactive demo coming soon
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Differentiation Section */}
      <section className={`py-24 border-t ${themeClasses.border.primary}`}>
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="space-y-6">
            <h2 className={`text-3xl lg:text-4xl font-bold ${themeClasses.text.primary}`}>
              Why we built this
            </h2>
            <p className={`text-xl leading-relaxed ${themeClasses.text.secondary}`}>
              We built this because existing API tools feel heavy. This one's built to be 
              lightweight, beautiful, and developer-focused. No unnecessary features, no 
              cluttered interface — just the essentials, done exceptionally well.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="waitlist" className={`py-24 border-t ${themeClasses.border.primary} ${isDark ? 'bg-blue-500/5' : 'bg-blue-50/50'}`}>
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className={`text-3xl lg:text-4xl font-bold mb-6 ${themeClasses.text.primary}`}>
            Ready to try it?
          </h2>
          <p className={`text-lg mb-8 ${themeClasses.text.secondary}`}>
            Join early access and be the first to experience the future of API testing
          </p>
          
          <div className="space-y-4">
            <form onSubmit={handleEmailSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`flex-1 ${themeClasses.input.base}`}
                required
              />
              <Button 
                type="submit" 
                className={`${themeClasses.button.primary} group`}
                disabled={isSubmitted}
              >
                {isSubmitted ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Added!
                  </>
                ) : (
                  <>
                    Join Waitlist
                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </form>
            
            <div className="pt-4">
              <Link href="/playground">
                <Button 
                  variant="ghost" 
                  className={`${themeClasses.button.ghost} group`}
                >
                  Or try the playground now
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`border-t ${themeClasses.border.primary} ${themeClasses.bg.glass}`}>
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col lg:flex-row justify-between items-center space-y-6 lg:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <Zap className="h-4 w-4 text-white" />
              </div>
              <span className={`text-lg font-semibold ${themeClasses.text.primary}`}>
                API Playground
              </span>
            </div>
            
            <div className="flex items-center space-x-8">
              <Link href="/about" className={`text-sm ${themeClasses.text.secondary} hover:${themeClasses.text.primary} transition-colors`}>
                About
              </Link>
              <Link href="/docs" className={`text-sm ${themeClasses.text.secondary} hover:${themeClasses.text.primary} transition-colors`}>
                Docs
              </Link>
              <Link href="https://github.com" className={`text-sm ${themeClasses.text.secondary} hover:${themeClasses.text.primary} transition-colors flex items-center gap-2`}>
                <Github className="h-4 w-4" />
                GitHub
              </Link>
              <Link href="/privacy" className={`text-sm ${themeClasses.text.secondary} hover:${themeClasses.text.primary} transition-colors`}>
                Privacy
              </Link>
              <Link href="/terms" className={`text-sm ${themeClasses.text.secondary} hover:${themeClasses.text.primary} transition-colors`}>
                Terms
              </Link>
            </div>
          </div>
          
          <div className={`mt-8 pt-8 border-t ${themeClasses.border.primary} text-center`}>
            <p className={`text-sm ${themeClasses.text.tertiary}`}>
              © 2024 API Playground. Built with care for developers.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}