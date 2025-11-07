'use client'

import { useState, useRef, useEffect } from 'react';
import { Edit3, Check, X, Type } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { getThemeClasses } from '@/lib/theme';

/**
 * Inline editable text component for documentation
 * Supports both single-line and multi-line editing
 */
export default function EditableText({
  value = '',
  placeholder = 'Click to add description...',
  onSave,
  onCancel,
  multiline = false,
  maxLength = null,
  disabled = false,
  variant = 'body', // 'title', 'subtitle', 'body', 'caption'
  showEditIcon = true,
  autoFocus = false,
  className = '',
}) {
  const { isDark } = useTheme();
  const themeClasses = getThemeClasses(isDark);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [isHovered, setIsHovered] = useState(false);
  const textareaRef = useRef(null);
  const inputRef = useRef(null);

  // Update edit value when prop value changes
  useEffect(() => {
    if (!isEditing) {
      setEditValue(value);
    }
  }, [value, isEditing]);

  // Auto-focus when editing starts
  useEffect(() => {
    if (isEditing && (multiline ? textareaRef.current : inputRef.current)) {
      const element = multiline ? textareaRef.current : inputRef.current;
      element.focus();
      
      // Select all text for easy replacement
      if (element.select) {
        element.select();
      }
    }
  }, [isEditing, multiline]);

  // Auto-resize textarea
  useEffect(() => {
    if (isEditing && multiline && textareaRef.current) {
      const textarea = textareaRef.current;
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.max(textarea.scrollHeight, 40)}px`;
    }
  }, [editValue, isEditing, multiline]);

  const handleStartEdit = () => {
    if (disabled) return;
    setIsEditing(true);
    setEditValue(value);
  };

  const handleSave = () => {
    const trimmedValue = editValue.trim();
    if (onSave) {
      onSave(trimmedValue);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
    if (onCancel) {
      onCancel();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Enter' && e.metaKey && multiline) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  // Get variant-specific styles
  const getVariantStyles = () => {
    switch (variant) {
      case 'title':
        return 'text-2xl font-bold';
      case 'subtitle':
        return 'text-lg font-semibold';
      case 'body':
        return 'text-base';
      case 'caption':
        return 'text-sm opacity-75';
      default:
        return 'text-base';
    }
  };

  const isEmpty = !value || value.trim().length === 0;
  const hasChanges = editValue.trim() !== value;

  if (isEditing) {
    return (
      <div className="relative group">
        {multiline ? (
          <textarea
            ref={textareaRef}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            maxLength={maxLength}
            className={`w-full resize-none border rounded-md px-3 py-2 text-sm transition-colors ${
              isDark 
                ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-400 focus:border-gray-500' 
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-gray-400'
            } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
            style={{ 
              minHeight: '40px',
              borderRadius: '6px'
            }}
          />
        ) : (
          <input
            ref={inputRef}
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            maxLength={maxLength}
            className={`w-full border rounded-md px-3 py-2 text-sm transition-colors ${
              isDark 
                ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-400 focus:border-gray-500' 
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-gray-400'
            } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
            style={{ borderRadius: '6px' }}
          />
        )}
        
        {/* Action buttons */}
        <div className="flex items-center gap-1 mt-2">
          <button
            onClick={handleSave}
            disabled={!hasChanges && !isEmpty}
            className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
              hasChanges || isEmpty
                ? isDark
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-green-600 text-white hover:bg-green-700'
                : isDark
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
            style={{ borderRadius: '4px' }}
          >
            <Check className="w-3 h-3" />
            Save
          </button>
          
          <button
            onClick={handleCancel}
            className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
              isDark
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
            style={{ borderRadius: '4px' }}
          >
            <X className="w-3 h-3" />
            Cancel
          </button>
          
          {multiline && (
            <span className={`text-xs ${themeClasses.text.tertiary} ml-auto`}>
              ⌘ + Enter to save, Esc to cancel
            </span>
          )}
        </div>
        
        {maxLength && (
          <div className={`text-xs ${themeClasses.text.tertiary} mt-1`}>
            {editValue.length}/{maxLength}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={`group relative cursor-pointer transition-all duration-200 ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleStartEdit}
    >
      {isEmpty ? (
        <div className={`${getVariantStyles()} ${themeClasses.text.tertiary} italic flex items-center gap-2 py-1`}>
          <Type className="w-4 h-4 opacity-50" />
          {placeholder}
          {showEditIcon && isHovered && (
            <Edit3 className="w-3 h-3 opacity-50 ml-1" />
          )}
        </div>
      ) : (
        <div className={`${getVariantStyles()} ${themeClasses.text.primary} flex items-start gap-2 py-1`}>
          <span className="flex-1">{value}</span>
          {showEditIcon && isHovered && !disabled && (
            <Edit3 className={`w-3 h-3 opacity-50 mt-0.5 transition-opacity ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`} />
          )}
        </div>
      )}
      
      {/* Hover indicator */}
      {isHovered && !disabled && !isEmpty && (
        <div className={`absolute inset-0 border border-dashed rounded transition-opacity ${
          isDark ? 'border-gray-600' : 'border-gray-300'
        } pointer-events-none`} 
          style={{ borderRadius: '6px' }}
        />
      )}
    </div>
  );
}