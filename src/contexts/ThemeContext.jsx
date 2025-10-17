'use client'

import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext()

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('dark')

  useEffect(() => {
    // Load theme from localStorage
    const savedTheme = localStorage.getItem('api-playground-theme')
    if (savedTheme) {
      setTheme(savedTheme)
    } else {
      // Default to system preference
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      setTheme(systemTheme)
    }
  }, [])

  useEffect(() => {
    // Save theme to localStorage and update document class
    localStorage.setItem('api-playground-theme', theme)
    
    // Update document class for theme switching with smooth transitions
    document.documentElement.className = theme
    
    // Add smooth transition class if not already present
    if (!document.documentElement.classList.contains('transition-colors')) {
      document.documentElement.classList.add('transition-colors', 'duration-300')
    }
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark')
  }

  const value = {
    theme,
    toggleTheme,
    isDark: theme === 'dark',
    isLight: theme === 'light'
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}