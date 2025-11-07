'use client'

import { useState, useRef, useEffect } from 'react';
import { Plus, Minus, Edit3, Check, X, Type, Hash, Calendar, Mail, Link as LinkIcon, ToggleLeft, List } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { getThemeClasses } from '@/lib/theme';

/**
 * Parameter documentation editor component
 * Allows editing of request parameters with detailed schemas
 */
export default function ParameterEditor({
  parameters = [],
  onSave,
  onCancel,
  disabled = false,
  parameterType = 'query', // 'query', 'path', 'header', 'cookie'
  className = '',
}) {
  const { isDark } = useTheme();
  const themeClasses = getThemeClasses(isDark);
  const [isEditing, setIsEditing] = useState(false);
  const [editParameters, setEditParameters] = useState(parameters);
  const [expandedParams, setExpandedParams] = useState(new Set());

  // Update edit parameters when prop parameters change
  useEffect(() => {
    if (!isEditing) {
      setEditParameters(parameters);
    }
  }, [parameters, isEditing]);

  const handleStartEdit = () => {
    if (disabled) return;
    setIsEditing(true);
    setEditParameters([...parameters]);
  };

  const handleSave = () => {
    const validParameters = editParameters.filter(param => param.name.trim() !== '');
    if (onSave) {
      onSave(validParameters);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditParameters([...parameters]);
    setIsEditing(false);
    if (onCancel) {
      onCancel();
    }
  };

  const addParameter = () => {
    const newParam = {
      name: '',
      in: parameterType,
      description: '',
      required: false,
      deprecated: false,
      schema: {
        type: 'string',
        example: '',
      },
    };
    setEditParameters([...editParameters, newParam]);
  };

  const removeParameter = (index) => {
    setEditParameters(editParameters.filter((_, i) => i !== index));
  };

  const updateParameter = (index, updates) => {
    const updated = editParameters.map((param, i) => 
      i === index ? { ...param, ...updates } : param
    );
    setEditParameters(updated);
  };

  const updateParameterSchema = (index, schemaUpdates) => {
    const updated = editParameters.map((param, i) => 
      i === index 
        ? { ...param, schema: { ...param.schema, ...schemaUpdates } }
        : param
    );
    setEditParameters(updated);
  };

  const toggleExpanded = (index) => {
    const newExpanded = new Set(expandedParams);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedParams(newExpanded);
  };

  const getTypeIcon = (type) => {
    const icons = {
      string: Type,
      number: Hash,
      integer: Hash,
      boolean: ToggleLeft,
      array: List,
      object: '{}',
      'date-time': Calendar,
      email: Mail,
      uri: LinkIcon,
    };
    return icons[type] || Type;
  };

  const getParameterTypeLabel = () => {
    const labels = {
      query: 'Query Parameters',
      path: 'Path Parameters',
      header: 'Header Parameters',
      cookie: 'Cookie Parameters',
    };
    return labels[parameterType] || 'Parameters';
  };

  const isEmpty = !parameters || parameters.length === 0;
  const hasChanges = JSON.stringify(editParameters) !== JSON.stringify(parameters);

  if (isEditing) {
    return (
      <div className={`border rounded-lg overflow-hidden ${
        isDark ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-white'
      } ${className}`}
        style={{ borderRadius: '12px' }}
      >
        {/* Header */}
        <div className={`flex items-center justify-between px-4 py-3 border-b ${
          isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'
        }`}>
          <h4 className={`text-sm font-semibold ${themeClasses.text.primary}`}>
            Edit {getParameterTypeLabel()}
          </h4>
          
          <div className="flex items-center gap-2">
            <button
              onClick={addParameter}
              className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                isDark
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
              style={{ borderRadius: '4px' }}
            >
              <Plus className="w-3 h-3" />
              Add Parameter
            </button>
            
            <button
              onClick={handleSave}
              disabled={!hasChanges}
              className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                hasChanges
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
        
        {/* Parameters List */}
        <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
          {editParameters.length === 0 ? (
            <div className={`text-center py-8 ${themeClasses.text.tertiary}`}>
              <Type className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No parameters yet. Click "Add Parameter" to get started.</p>
            </div>
          ) : (
            editParameters.map((param, index) => {
              const isExpanded = expandedParams.has(index);
              const TypeIcon = getTypeIcon(param.schema?.type);
              
              return (
                <div key={index} className={`border rounded-lg ${
                  isDark ? 'border-gray-600 bg-gray-800' : 'border-gray-200 bg-gray-50'
                }`}
                  style={{ borderRadius: '8px' }}
                >
                  {/* Parameter Header */}
                  <div className="p-3">
                    <div className="flex items-center gap-3">
                      <input
                        type="text"
                        value={param.name}
                        onChange={(e) => updateParameter(index, { name: e.target.value })}
                        placeholder="Parameter name"
                        className={`flex-1 bg-transparent text-sm font-mono focus:outline-none placeholder-gray-400 ${
                          isDark ? 'text-gray-100' : 'text-gray-900'
                        }`}
                      />
                      
                      <div className="flex items-center gap-2">
                        <label className="flex items-center gap-1 text-xs">
                          <input
                            type="checkbox"
                            checked={param.required}
                            onChange={(e) => updateParameter(index, { required: e.target.checked })}
                            className="w-3 h-3"
                          />
                          Required
                        </label>
                        
                        <button
                          onClick={() => toggleExpanded(index)}
                          className={`p-1 rounded transition-colors ${
                            isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
                          }`}
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                        
                        <button
                          onClick={() => removeParameter(index)}
                          className={`p-1 rounded transition-colors text-red-500 hover:bg-red-500/10`}
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    
                    <input
                      type="text"
                      value={param.description}
                      onChange={(e) => updateParameter(index, { description: e.target.value })}
                      placeholder="Parameter description"
                      className={`w-full mt-2 bg-transparent text-sm focus:outline-none placeholder-gray-400 ${
                        isDark ? 'text-gray-300' : 'text-gray-600'
                      }`}
                    />
                  </div>
                  
                  {/* Expanded Schema Editor */}
                  {isExpanded && (
                    <div className={`border-t px-3 py-3 space-y-3 ${
                      isDark ? 'border-gray-600 bg-gray-750' : 'border-gray-200 bg-white'
                    }`}>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className={`block text-xs font-medium mb-1 ${themeClasses.text.secondary}`}>
                            Type
                          </label>
                          <select
                            value={param.schema?.type || 'string'}
                            onChange={(e) => updateParameterSchema(index, { type: e.target.value })}
                            className={`w-full text-sm border rounded px-2 py-1 ${
                              isDark 
                                ? 'bg-gray-700 border-gray-600 text-white' 
                                : 'bg-white border-gray-300 text-gray-900'
                            }`}
                            style={{ borderRadius: '4px' }}
                          >
                            <option value="string">String</option>
                            <option value="number">Number</option>
                            <option value="integer">Integer</option>
                            <option value="boolean">Boolean</option>
                            <option value="array">Array</option>
                            <option value="object">Object</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className={`block text-xs font-medium mb-1 ${themeClasses.text.secondary}`}>
                            Example
                          </label>
                          <input
                            type="text"
                            value={param.schema?.example || ''}
                            onChange={(e) => updateParameterSchema(index, { example: e.target.value })}
                            placeholder="Example value"
                            className={`w-full text-sm border rounded px-2 py-1 ${
                              isDark 
                                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                            }`}
                            style={{ borderRadius: '4px' }}
                          />
                        </div>
                      </div>
                      
                      {param.schema?.type === 'string' && (
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className={`block text-xs font-medium mb-1 ${themeClasses.text.secondary}`}>
                              Min Length
                            </label>
                            <input
                              type="number"
                              value={param.schema?.minLength || ''}
                              onChange={(e) => updateParameterSchema(index, { 
                                minLength: e.target.value ? parseInt(e.target.value) : null 
                              })}
                              className={`w-full text-sm border rounded px-2 py-1 ${
                                isDark 
                                  ? 'bg-gray-700 border-gray-600 text-white' 
                                  : 'bg-white border-gray-300 text-gray-900'
                              }`}
                              style={{ borderRadius: '4px' }}
                            />
                          </div>
                          
                          <div>
                            <label className={`block text-xs font-medium mb-1 ${themeClasses.text.secondary}`}>
                              Max Length
                            </label>
                            <input
                              type="number"
                              value={param.schema?.maxLength || ''}
                              onChange={(e) => updateParameterSchema(index, { 
                                maxLength: e.target.value ? parseInt(e.target.value) : null 
                              })}
                              className={`w-full text-sm border rounded px-2 py-1 ${
                                isDark 
                                  ? 'bg-gray-700 border-gray-600 text-white' 
                                  : 'bg-white border-gray-300 text-gray-900'
                              }`}
                              style={{ borderRadius: '4px' }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`group cursor-pointer transition-all duration-200 ${className}`}
      onClick={handleStartEdit}
    >
      {isEmpty ? (
        <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDark 
            ? 'border-gray-600 hover:border-gray-500 bg-gray-800/30' 
            : 'border-gray-300 hover:border-gray-400 bg-gray-50/50'
        }`}
          style={{ borderRadius: '12px' }}
        >
          <Type className={`w-8 h-8 mx-auto mb-2 ${themeClasses.text.tertiary} opacity-50`} />
          <p className={`text-sm ${themeClasses.text.tertiary}`}>
            Click to add {getParameterTypeLabel().toLowerCase()}
          </p>
        </div>
      ) : (
        <div className={`border rounded-lg overflow-hidden ${
          isDark ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-50'
        } group-hover:${isDark ? 'border-gray-600' : 'border-gray-300'}`}
          style={{ borderRadius: '12px' }}
        >
          {/* Header */}
          <div className={`flex items-center justify-between px-4 py-3 border-b ${
            isDark ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <h4 className={`text-sm font-semibold ${themeClasses.text.primary}`}>
              {getParameterTypeLabel()} ({parameters.length})
            </h4>
            
            <Edit3 className={`w-4 h-4 ${themeClasses.text.tertiary} opacity-0 group-hover:opacity-100 transition-opacity`} />
          </div>
          
          {/* Parameters List */}
          <div className="p-4 space-y-2">
            {parameters.map((param, index) => {
              const TypeIcon = getTypeIcon(param.schema?.type);
              
              return (
                <div key={index} className="flex items-center gap-3 text-sm">
                  <TypeIcon className={`w-4 h-4 ${themeClasses.text.tertiary}`} />
                  <code className={`font-mono ${themeClasses.text.accent}`}>
                    {param.name}
                  </code>
                  <span className={`text-xs px-1 rounded ${
                    param.required 
                      ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                  }`}>
                    {param.required ? 'required' : 'optional'}
                  </span>
                  {param.description && (
                    <span className={`flex-1 ${themeClasses.text.secondary} truncate`}>
                      {param.description}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}