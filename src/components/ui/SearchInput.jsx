'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

export default function SearchInput({
  value,
  onChange,
  onFocus,
  placeholder = "Find...",
  expandedPlaceholder,
  className = "",
  expandable = false,
  isDark = false,
  ...props
}) {
  const [isExpanded, setIsExpanded] = useState(false)

  const handleFocus = (e) => {
    if (expandable) {
      setIsExpanded(true)
    }
    onFocus?.(e)
  }

  const handleBlur = (e) => {
    if (expandable && !value) {
      setIsExpanded(false)
    }
    props.onBlur?.(e)
  }

  const containerWidth = expandable 
    ? isExpanded ? "w-64 sm:w-80" : "w-32 sm:w-40"
    : "w-full"

  const currentPlaceholder = expandable && isExpanded && expandedPlaceholder 
    ? expandedPlaceholder 
    : placeholder

  return (
    <div className={`relative ${expandable ? 'z-[99999] search-container' : ''}`}>
      <div className={`transition-all duration-300 ${containerWidth}`}>
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 z-10" />
        <Input
          placeholder={currentPlaceholder}
          value={value}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={`pl-10 py-1.5 text-sm focus:ring-0 focus:outline-none cursor-pointer transition-all duration-300 ${className}`}
          style={{
            borderRadius: "6px",
            borderColor: isDark ? "rgb(55, 65, 81)" : "rgb(235, 235, 235)",
            backgroundColor: isDark ? "rgb(17, 24, 39)" : "white",
            border: `1px solid ${isDark ? "rgb(55, 65, 81)" : "rgb(235, 235, 235)"}`,
            boxShadow: "none",
          }}
          {...props}
        />
      </div>
    </div>
  )
}