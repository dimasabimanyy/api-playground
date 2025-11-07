'use client'

import { useState, useRef, useEffect } from 'react';
import { Edit3, Check, X, Code, Copy, Download } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { getThemeClasses } from '@/lib/theme';

/**
 * Inline editable code block component for documentation
 * Supports syntax highlighting and different languages
 */
export default function EditableCodeBlock({
  value = '',
  language = 'json',
  placeholder = 'Click to add code example...',
  onSave,
  onCancel,
  disabled = false,
  showEditIcon = true,
  showCopyButton = true,
  showLanguageSelector = false,
  availableLanguages = ['json', 'javascript', 'python', 'curl', 'xml'],
  title = '',
  className = '',
}) {
  const { isDark } = useTheme();
  const themeClasses = getThemeClasses(isDark);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [editLanguage, setEditLanguage] = useState(language);
  const [isHovered, setIsHovered] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const textareaRef = useRef(null);

  // Update edit value when prop value changes
  useEffect(() => {
    if (!isEditing) {
      setEditValue(value);
      setEditLanguage(language);
    }
  }, [value, language, isEditing]);

  // Auto-focus when editing starts
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      // Move cursor to end
      const element = textareaRef.current;
      element.setSelectionRange(element.value.length, element.value.length);
    }
  }, [isEditing]);

  // Auto-resize textarea
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      const textarea = textareaRef.current;
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.max(textarea.scrollHeight, 120)}px`;
    }
  }, [editValue, isEditing]);

  const handleStartEdit = () => {
    if (disabled) return;
    setIsEditing(true);
    setEditValue(value);
    setEditLanguage(language);
  };

  const handleSave = () => {
    const trimmedValue = editValue.trim();
    if (onSave) {
      onSave(trimmedValue, editLanguage);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value);
    setEditLanguage(language);
    setIsEditing(false);
    if (onCancel) {
      onCancel();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const newValue = editValue.substring(0, start) + '  ' + editValue.substring(end);
      setEditValue(newValue);
      // Set cursor position after the inserted spaces
      setTimeout(() => {
        e.target.selectionStart = e.target.selectionEnd = start + 2;
      }, 0);
    } else if (e.key === 'Enter' && e.metaKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([value], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `example.${getFileExtension(language)}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getFileExtension = (lang) => {
    const extensions = {
      javascript: 'js',
      python: 'py',
      json: 'json',
      curl: 'sh',
      xml: 'xml',
      yaml: 'yml',
    };
    return extensions[lang] || 'txt';
  };

  const getLanguageLabel = (lang) => {
    const labels = {
      javascript: 'JavaScript',
      python: 'Python',
      json: 'JSON',
      curl: 'cURL',
      xml: 'XML',
      yaml: 'YAML',
    };
    return labels[lang] || lang.toUpperCase();
  };

  const isEmpty = !value || value.trim().length === 0;
  const hasChanges = editValue.trim() !== value || editLanguage !== language;

  if (isEditing) {
    return (
      <div className={`relative border rounded-lg overflow-hidden ${
        isDark ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-white'
      }`}
        style={{ borderRadius: '12px' }}
      >
        {/* Header */}
        <div className={`flex items-center justify-between px-4 py-2 border-b ${
          isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'
        }`}>
          <div className="flex items-center gap-3">
            {showLanguageSelector ? (
              <select
                value={editLanguage}
                onChange={(e) => setEditLanguage(e.target.value)}
                className={`text-sm font-medium bg-transparent border-none focus:outline-none ${
                  isDark ? 'text-gray-300' : 'text-gray-600'
                }`}
              >
                {availableLanguages.map(lang => (
                  <option key={lang} value={lang}>
                    {getLanguageLabel(lang)}
                  </option>
                ))}
              </select>
            ) : (
              <span className={`text-sm font-medium ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>
                {getLanguageLabel(editLanguage)}
              </span>
            )}
            {title && (
              <span className={`text-sm ${themeClasses.text.secondary}`}>
                {title}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-1">
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
          </div>
        </div>
        
        {/* Editor */}
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={`w-full resize-none border-none px-4 py-3 font-mono text-sm leading-relaxed focus:outline-none ${
              isDark 
                ? 'bg-gray-900 text-gray-100 placeholder-gray-500' 
                : 'bg-white text-gray-900 placeholder-gray-400'
            }`}
            style={{ 
              minHeight: '120px',
              tabSize: 2,
            }}
            spellCheck={false}
          />
          
          {/* Helper text */}
          <div className={`absolute bottom-2 right-2 text-xs ${themeClasses.text.tertiary} bg-opacity-75 px-2 py-1 rounded ${
            isDark ? 'bg-gray-800' : 'bg-white'
          }`}>
            ⌘ + Enter to save • Esc to cancel • Tab for indent
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`group relative ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`border rounded-lg overflow-hidden transition-all duration-200 ${
        isDark ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-50'
      } ${isHovered && !disabled ? isDark ? 'border-gray-600' : 'border-gray-300' : ''}`}
        style={{ borderRadius: '12px' }}
      >
        {/* Header */}
        <div className={`flex items-center justify-between px-4 py-2 border-b ${
          isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
        }`}>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <span className={`text-sm font-medium ${
              isDark ? 'text-gray-300' : 'text-gray-600'
            }`}>
              {getLanguageLabel(language)}
            </span>
            {title && (
              <span className={`text-sm ${themeClasses.text.secondary}`}>
                {title}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            {showEditIcon && isHovered && !disabled && (
              <button
                onClick={handleStartEdit}
                className={`p-1 rounded transition-colors ${
                  isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                }`}
                title="Edit code"
              >
                <Edit3 className="w-3 h-3" />
              </button>
            )}
            
            {showCopyButton && !isEmpty && (
              <button
                onClick={handleCopy}
                className={`p-1 rounded transition-colors ${
                  isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                }`}
                title={copySuccess ? 'Copied!' : 'Copy code'}
              >
                {copySuccess ? (
                  <Check className="w-3 h-3 text-green-500" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </button>
            )}
            
            {!isEmpty && (
              <button
                onClick={handleDownload}
                className={`p-1 rounded transition-colors ${
                  isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                }`}
                title="Download code"
              >
                <Download className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
        
        {/* Content */}
        <div 
          className={`cursor-pointer ${disabled ? 'cursor-default' : ''}`}
          onClick={disabled ? undefined : handleStartEdit}
        >
          {isEmpty ? (
            <div className={`p-4 text-center ${themeClasses.text.tertiary} italic flex items-center justify-center gap-2`}>
              <Code className="w-4 h-4 opacity-50" />
              {placeholder}
            </div>
          ) : (
            <pre className={`p-4 font-mono text-sm leading-relaxed overflow-x-auto ${
              isDark ? 'text-gray-100' : 'text-gray-900'
            }`}>
              <code>{value}</code>
            </pre>
          )}
        </div>
      </div>
      
      {/* Edit hint overlay */}
      {isHovered && !disabled && !isEmpty && showEditIcon && (
        <div className={`absolute inset-0 border-2 border-dashed rounded-lg transition-opacity pointer-events-none ${
          isDark ? 'border-gray-500' : 'border-gray-400'
        }`}
          style={{ borderRadius: '12px' }}
        />
      )}
    </div>
  );
}