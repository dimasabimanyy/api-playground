// Theme-aware utility functions for consistent styling

export const getThemeClasses = (isDark) => ({
  // Background colors
  bg: {
    primary: isDark ? 'bg-[#111]' : 'bg-gray-50/30',
    secondary: isDark ? 'bg-[#1a1a1a]/50' : 'bg-gray-100/40',
    tertiary: isDark ? 'bg-gray-800/50' : 'bg-white/80',
    surface: isDark ? 'bg-[#1a1a1a]/80' : 'bg-gray-50/60',
    elevated: isDark ? 'bg-gray-800/30' : 'bg-white/90',
    glass: isDark ? 'bg-[#1a1a1a]/50 backdrop-blur-xl' : 'bg-white/60 backdrop-blur-xl',
  },
  
  // Text colors
  text: {
    primary: isDark ? 'text-white' : 'text-gray-800',
    secondary: isDark ? 'text-gray-300' : 'text-gray-600',
    tertiary: isDark ? 'text-gray-400' : 'text-gray-500',
    muted: isDark ? 'text-gray-500' : 'text-gray-400',
    accent: isDark ? 'text-blue-400' : 'text-blue-600',
  },
  
  // Border colors
  border: {
    primary: isDark ? 'border-gray-800/50' : 'border-gray-200/60',
    secondary: isDark ? 'border-gray-700/50' : 'border-gray-300/40',
    accent: isDark ? 'border-blue-500/50' : 'border-blue-400/50',
  },
  
  // Input/form styles
  input: {
    base: isDark 
      ? 'border border-gray-700/50 bg-gray-800/50 text-white placeholder-gray-400 focus:bg-gray-800/80 focus:border-blue-500/80 focus:ring-0 transition-all duration-200' 
      : 'border border-gray-300/60 bg-white/90 text-gray-800 placeholder-gray-500 focus:border-blue-500/80 focus:ring-0 transition-all duration-200',
    disabled: isDark 
      ? 'bg-gray-700/50 border-gray-700/50 text-gray-300' 
      : 'bg-gray-100/60 border-gray-200/60 text-gray-600',
  },
  
  // Button styles
  button: {
    primary: isDark 
      ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white shadow-lg hover:shadow-blue-500/25 cursor-pointer' 
      : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white shadow-md hover:shadow-blue-500/20 cursor-pointer',
    secondary: isDark 
      ? 'text-gray-300 hover:text-white hover:bg-gray-800/50 border border-gray-700/50 cursor-pointer' 
      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100/60 border border-gray-200/80 cursor-pointer',
    ghost: isDark 
      ? 'text-gray-400 hover:text-white hover:bg-gray-800/50 cursor-pointer' 
      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100/50 cursor-pointer',
  },
  
  // Card/panel styles
  card: {
    base: isDark 
      ? 'bg-gray-800/30 border border-gray-700/50' 
      : 'bg-white/80 border border-gray-200/70 shadow-sm',
    elevated: isDark 
      ? 'bg-gray-800/50 border border-gray-700/50 shadow-lg' 
      : 'bg-white/90 border border-gray-200/80 shadow-md',
  },
  
  // Tab styles
  tab: {
    inactive: isDark 
      ? 'text-gray-400 hover:text-white cursor-pointer' 
      : 'text-gray-500 hover:text-gray-700 cursor-pointer',
    active: isDark 
      ? 'text-blue-400 border-blue-500 cursor-pointer' 
      : 'text-blue-600 border-blue-500 cursor-pointer',
  },
  
  // Status indicators
  status: {
    success: isDark ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-emerald-100 text-emerald-700 border-emerald-300',
    warning: isDark ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' : 'bg-yellow-100 text-yellow-700 border-yellow-300',
    error: isDark ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-red-100 text-red-700 border-red-300',
    info: isDark ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'bg-blue-100 text-blue-700 border-blue-300',
  }
})

export const getMethodColors = (method, isDark) => {
  const colors = {
    GET: isDark 
      ? { text: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' }
      : { text: 'text-emerald-600', bg: 'bg-emerald-100 border-emerald-300' },
    POST: isDark 
      ? { text: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' }
      : { text: 'text-blue-600', bg: 'bg-blue-100 border-blue-300' },
    PUT: isDark 
      ? { text: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' }
      : { text: 'text-orange-600', bg: 'bg-orange-100 border-orange-300' },
    PATCH: isDark 
      ? { text: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' }
      : { text: 'text-yellow-600', bg: 'bg-yellow-100 border-yellow-300' },
    DELETE: isDark 
      ? { text: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' }
      : { text: 'text-red-600', bg: 'bg-red-100 border-red-300' },
  }
  return colors[method] || (isDark 
    ? { text: 'text-gray-400', bg: 'bg-gray-500/10 border-gray-500/20' }
    : { text: 'text-gray-600', bg: 'bg-gray-100 border-gray-300' }
  )
}

export const getStatusColors = (status, isDark) => {
  if (status >= 200 && status < 300) {
    return isDark ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-emerald-100 text-emerald-700 border-emerald-300'
  }
  if (status >= 300 && status < 400) {
    return isDark ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' : 'bg-yellow-100 text-yellow-700 border-yellow-300'
  }
  if (status >= 400 && status < 500) {
    return isDark ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' : 'bg-orange-100 text-orange-700 border-orange-300'
  }
  if (status >= 500) {
    return isDark ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-red-100 text-red-700 border-red-300'
  }
  return isDark ? 'bg-gray-500/20 text-gray-400 border-gray-500/30' : 'bg-gray-100 text-gray-700 border-gray-300'
}