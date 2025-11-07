"use client";

import { useState, useEffect } from "react";
import {
  CheckCircle,
  Code,
  FileText,
  Globe,
  Copy,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Play,
  Save,
  RotateCcw,
  Eye,
  EyeOff,
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { getThemeClasses, getMethodColors } from "@/lib/theme";
import { Button } from "@/components/ui/button";
import EditableText from "../inline-editing/EditableText";
import EditableCodeBlock from "../inline-editing/EditableCodeBlock";
import ParameterEditor from "../inline-editing/ParameterEditor";
import { DocsMetadata } from "@/lib/docs-storage";

const EditableModernTemplate = ({ docData, isEditMode = false, onDataChange }) => {
  const { isDark } = useTheme();
  const themeClasses = getThemeClasses(isDark);
  const [expandedEndpoints, setExpandedEndpoints] = useState(new Set());
  const [activeTab, setActiveTab] = useState({});
  const [editableDocData, setEditableDocData] = useState(docData);
  const [hasChanges, setHasChanges] = useState(false);
  const [isEditingMode, setIsEditingMode] = useState(isEditMode);

  // Update local state when docData changes
  useEffect(() => {
    setEditableDocData(docData);
  }, [docData]);

  // Check for changes
  useEffect(() => {
    const hasDataChanges = JSON.stringify(editableDocData) !== JSON.stringify(docData);
    setHasChanges(hasDataChanges);
  }, [editableDocData, docData]);

  const toggleEndpoint = (endpointId) => {
    const newExpanded = new Set(expandedEndpoints);
    if (newExpanded.has(endpointId)) {
      newExpanded.delete(endpointId);
    } else {
      newExpanded.add(endpointId);
    }
    setExpandedEndpoints(newExpanded);
  };

  const setEndpointTab = (endpointId, tab) => {
    setActiveTab(prev => ({ ...prev, [endpointId]: tab }));
  };

  const getEndpointTab = (endpointId) => {
    return activeTab[endpointId] || 'overview';
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const generateCurlExample = (request) => {
    let curl = `curl -X ${request.method} "${editableDocData.customization?.baseUrl || 'https://api.example.com'}${request.url}"`;
    
    if (request.headers && Object.keys(request.headers).length > 0) {
      Object.entries(request.headers).forEach(([key, value]) => {
        curl += ` \\\n  -H "${key}: ${value}"`;
      });
    }
    
    if (request.method !== 'GET' && request.body) {
      curl += ` \\\n  -d '${request.body}'`;
    }
    
    return curl;
  };

  // Update functions for different parts of the documentation
  const updateProjectInfo = (field, value) => {
    const updated = {
      ...editableDocData,
      customization: {
        ...editableDocData.customization,
        [field]: value
      }
    };
    setEditableDocData(updated);
    if (onDataChange) onDataChange(updated);
  };

  const updateCollectionDocs = (collectionId, field, value) => {
    const updated = {
      ...editableDocData,
      collections: editableDocData.collections.map(collection => 
        collection.id === collectionId 
          ? {
              ...collection,
              docs: {
                ...collection.docs,
                [field]: value,
                lastModified: new Date().toISOString(),
              }
            }
          : collection
      )
    };
    setEditableDocData(updated);
    if (onDataChange) onDataChange(updated);
    
    // Save to persistent storage
    DocsMetadata.saveCollection(collectionId, {
      ...updated.collections.find(c => c.id === collectionId).docs
    });
  };

  const updateRequestDocs = (collectionId, requestId, field, value) => {
    const updated = {
      ...editableDocData,
      collections: editableDocData.collections.map(collection => 
        collection.id === collectionId 
          ? {
              ...collection,
              requests: collection.requests.map(request =>
                request.id === requestId
                  ? {
                      ...request,
                      docs: {
                        ...request.docs,
                        [field]: value,
                        lastModified: new Date().toISOString(),
                      }
                    }
                  : request
              )
            }
          : collection
      )
    };
    setEditableDocData(updated);
    if (onDataChange) onDataChange(updated);
    
    // Save to persistent storage
    const collection = updated.collections.find(c => c.id === collectionId);
    const request = collection.requests.find(r => r.id === requestId);
    DocsMetadata.saveRequest(requestId, { ...request.docs });
  };

  const updateRequestParameters = (collectionId, requestId, parameterType, parameters) => {
    updateRequestDocs(collectionId, requestId, 'parameters', {
      ...editableDocData.collections
        .find(c => c.id === collectionId)
        .requests.find(r => r.id === requestId)
        .docs?.parameters || {},
      [parameterType]: parameters
    });
  };

  const updateRequestExample = (collectionId, requestId, language, code) => {
    const currentExamples = editableDocData.collections
      .find(c => c.id === collectionId)
      .requests.find(r => r.id === requestId)
      .docs?.examples || {};

    updateRequestDocs(collectionId, requestId, 'examples', {
      ...currentExamples,
      [language]: code
    });
  };

  const saveAllChanges = () => {
    if (onDataChange) {
      onDataChange(editableDocData);
    }
    setHasChanges(false);
    
    // Save all metadata to persistent storage
    editableDocData.collections.forEach(collection => {
      DocsMetadata.saveCollection(collection.id, collection.docs);
      
      if (collection.requests) {
        collection.requests.forEach(request => {
          DocsMetadata.saveRequest(request.id, request.docs);
        });
      }
    });
  };

  const resetChanges = () => {
    setEditableDocData(docData);
    setHasChanges(false);
  };

  const toggleEditMode = () => {
    setIsEditingMode(!isEditingMode);
  };

  return (
    <div className={`min-h-screen ${themeClasses.bg.primary}`}>
      {/* Edit Mode Controls */}
      {isEditingMode && (
        <div className={`sticky top-0 z-50 border-b ${themeClasses.border.primary} ${
          isDark ? 'bg-gray-900/95 backdrop-blur-sm' : 'bg-white/95 backdrop-blur-sm'
        }`}>
          <div className="max-w-6xl mx-auto px-6 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`px-2 py-1 rounded text-xs font-medium ${
                  isDark ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-700'
                }`}>
                  Edit Mode
                </div>
                {hasChanges && (
                  <div className={`px-2 py-1 rounded text-xs font-medium ${
                    isDark ? 'bg-orange-900/50 text-orange-300' : 'bg-orange-100 text-orange-700'
                  }`}>
                    Unsaved Changes
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetChanges}
                  disabled={!hasChanges}
                  className="text-xs"
                >
                  <RotateCcw className="w-3 h-3 mr-1" />
                  Reset
                </Button>
                
                <Button
                  size="sm"
                  onClick={saveAllChanges}
                  disabled={!hasChanges}
                  className="text-xs"
                >
                  <Save className="w-3 h-3 mr-1" />
                  Save Changes
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleEditMode}
                  className="text-xs"
                >
                  <Eye className="w-3 h-3 mr-1" />
                  Preview
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Edit Mode Button (when not in edit mode) */}
      {!isEditingMode && (
        <div className="fixed top-4 right-4 z-50">
          <Button
            onClick={toggleEditMode}
            className={`shadow-lg ${
              isDark ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'
            }`}
            variant="outline"
            size="sm"
          >
            <EyeOff className="w-3 h-3 mr-1" />
            Edit Mode
          </Button>
        </div>
      )}

      {/* Hero Section */}
      <div className={`${isDark ? 'bg-gradient-to-b from-gray-900 via-gray-900 to-gray-800' : 'bg-gradient-to-b from-blue-50 via-white to-gray-50'} border-b ${themeClasses.border.primary}`}>
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium mb-6">
              <Globe className="w-4 h-4" />
              API Documentation
            </div>
            
            {/* Editable Title */}
            <div className="mb-4">
              {isEditingMode ? (
                <EditableText
                  value={editableDocData.customization?.title || 'API Documentation'}
                  onSave={(value) => updateProjectInfo('title', value)}
                  variant="title"
                  placeholder="Documentation title..."
                  className="text-4xl md:text-5xl font-bold"
                />
              ) : (
                <h1 className={`text-4xl md:text-5xl font-bold ${themeClasses.text.primary}`}>
                  {editableDocData.customization?.title || 'API Documentation'}
                </h1>
              )}
            </div>
            
            {/* Editable Description */}
            <div className="mb-8">
              {isEditingMode ? (
                <EditableText
                  value={editableDocData.customization?.description || 'Complete API reference for your application'}
                  onSave={(value) => updateProjectInfo('description', value)}
                  variant="subtitle"
                  placeholder="Documentation description..."
                  multiline
                  className="text-xl max-w-2xl mx-auto"
                />
              ) : (
                <p className={`text-xl ${themeClasses.text.secondary} max-w-2xl mx-auto`}>
                  {editableDocData.customization?.description || 'Complete API reference for your application'}
                </p>
              )}
            </div>

            {/* Base URL */}
            {editableDocData.customization?.baseUrl && (
              <div className={`inline-flex items-center gap-3 px-4 py-3 rounded-lg ${themeClasses.card.base} ${themeClasses.border.primary} border`}>
                <span className={`text-sm font-medium ${themeClasses.text.secondary}`}>Base URL:</span>
                {isEditingMode ? (
                  <EditableText
                    value={editableDocData.customization.baseUrl}
                    onSave={(value) => updateProjectInfo('baseUrl', value)}
                    variant="body"
                    placeholder="Base URL..."
                    className="font-mono text-sm"
                  />
                ) : (
                  <code className={`text-sm font-mono ${themeClasses.text.accent} bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded`}>
                    {editableDocData.customization.baseUrl}
                  </code>
                )}
                <button
                  onClick={() => copyToClipboard(editableDocData.customization.baseUrl)}
                  className={`p-1 rounded transition-colors ${themeClasses.button.ghost}`}
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                label: 'Collections',
                value: editableDocData.collections?.length || 0,
                icon: FileText,
                color: 'blue'
              },
              {
                label: 'Endpoints',
                value: editableDocData.collections?.reduce((acc, col) => acc + (col.requests?.length || 0), 0) || 0,
                icon: Globe,
                color: 'green'
              },
              {
                label: 'Methods',
                value: new Set(editableDocData.collections?.flatMap(col => col.requests?.map(req => req.method) || [])).size || 0,
                icon: Code,
                color: 'purple'
              }
            ].map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div key={idx} className={`p-6 rounded-xl ${themeClasses.card.base} border ${themeClasses.border.primary} text-center`}>
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg mb-4 ${
                    stat.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/30' :
                    stat.color === 'green' ? 'bg-green-100 dark:bg-green-900/30' :
                    'bg-purple-100 dark:bg-purple-900/30'
                  }`}>
                    <Icon className={`w-6 h-6 ${
                      stat.color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                      stat.color === 'green' ? 'text-green-600 dark:text-green-400' :
                      'text-purple-600 dark:text-purple-400'
                    }`} />
                  </div>
                  <div className={`text-2xl font-bold ${themeClasses.text.primary} mb-1`}>
                    {stat.value}
                  </div>
                  <div className={`text-sm ${themeClasses.text.secondary}`}>
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        {editableDocData.collections?.map((collection) => (
          <div key={collection.id} className="mb-16">
            {/* Collection Header */}
            <div className="mb-8">
              {/* Editable Collection Title */}
              {isEditingMode ? (
                <EditableText
                  value={collection.docs?.title || collection.name}
                  onSave={(value) => updateCollectionDocs(collection.id, 'title', value)}
                  variant="title"
                  placeholder="Collection title..."
                  className="text-2xl font-bold mb-2"
                />
              ) : (
                <h2 className={`text-2xl font-bold ${themeClasses.text.primary} mb-2`}>
                  {collection.docs?.title || collection.name}
                </h2>
              )}

              {/* Editable Collection Description */}
              {isEditingMode ? (
                <EditableText
                  value={collection.docs?.description || collection.description || ''}
                  onSave={(value) => updateCollectionDocs(collection.id, 'description', value)}
                  variant="body"
                  placeholder="Collection description..."
                  multiline
                  className="mb-2"
                />
              ) : (
                collection.docs?.description && (
                  <p className={`text-lg ${themeClasses.text.secondary} mb-2`}>
                    {collection.docs.description}
                  </p>
                )
              )}

              <p className={`text-lg ${themeClasses.text.secondary}`}>
                {collection.requests?.length || 0} endpoint{(collection.requests?.length || 0) !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Endpoints */}
            <div className="space-y-6">
              {collection.requests?.map((request) => {
                const endpointId = `${collection.id}-${request.id}`;
                const isExpanded = expandedEndpoints.has(endpointId);
                const currentTab = getEndpointTab(endpointId);
                const methodColors = getMethodColors(request.method, isDark);

                return (
                  <div
                    key={request.id}
                    className={`rounded-xl border ${themeClasses.border.primary} ${themeClasses.card.base} overflow-hidden`}
                  >
                    {/* Endpoint Header */}
                    <div
                      className={`p-6 cursor-pointer transition-colors hover:${isDark ? 'bg-gray-800/50' : 'bg-gray-50/50'}`}
                      onClick={() => toggleEndpoint(endpointId)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`px-3 py-1.5 rounded-md text-sm font-semibold ${methodColors.bg} ${methodColors.text}`}>
                            {request.method}
                          </div>
                          <div>
                            {/* Editable Request Title */}
                            {isEditingMode && isExpanded ? (
                              <div onClick={(e) => e.stopPropagation()}>
                                <EditableText
                                  value={request.docs?.title || request.name}
                                  onSave={(value) => updateRequestDocs(collection.id, request.id, 'title', value)}
                                  variant="subtitle"
                                  placeholder="Request title..."
                                />
                              </div>
                            ) : (
                              <h3 className={`text-lg font-semibold ${themeClasses.text.primary}`}>
                                {request.docs?.title || request.name}
                              </h3>
                            )}
                            <code className={`text-sm ${themeClasses.text.secondary} font-mono`}>
                              {request.url}
                            </code>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <Play className="w-4 h-4 mr-1" />
                            Try It
                          </Button>
                          {isExpanded ? (
                            <ChevronDown className={`w-5 h-5 ${themeClasses.text.tertiary}`} />
                          ) : (
                            <ChevronRight className={`w-5 h-5 ${themeClasses.text.tertiary}`} />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <div className={`border-t ${themeClasses.border.primary}`}>
                        {/* Tabs */}
                        <div className={`border-b ${themeClasses.border.primary} ${themeClasses.bg.secondary}`}>
                          <div className="flex">
                            {['overview', 'parameters', 'headers', 'response', 'examples'].map((tab) => (
                              <button
                                key={tab}
                                onClick={() => setEndpointTab(endpointId, tab)}
                                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                                  currentTab === tab
                                    ? `border-blue-500 ${themeClasses.text.accent}`
                                    : `border-transparent ${themeClasses.text.secondary} hover:${themeClasses.text.primary}`
                                }`}
                              >
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Tab Content */}
                        <div className="p-6">
                          {currentTab === 'overview' && (
                            <div className="space-y-6">
                              {/* Editable Description */}
                              <div>
                                <h4 className={`text-lg font-semibold ${themeClasses.text.primary} mb-2`}>
                                  Description
                                </h4>
                                {isEditingMode ? (
                                  <EditableText
                                    value={request.docs?.description || ''}
                                    onSave={(value) => updateRequestDocs(collection.id, request.id, 'description', value)}
                                    variant="body"
                                    placeholder="Request description..."
                                    multiline
                                  />
                                ) : (
                                  <p className={`${themeClasses.text.secondary}`}>
                                    {request.docs?.description || `${request.method} request to ${request.url}`}
                                  </p>
                                )}
                              </div>

                              <div>
                                <h4 className={`text-lg font-semibold ${themeClasses.text.primary} mb-4`}>
                                  Endpoint Details
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className={`p-4 rounded-lg ${themeClasses.bg.secondary}`}>
                                    <div className={`text-sm font-medium ${themeClasses.text.secondary} mb-1`}>
                                      Method
                                    </div>
                                    <div className={`text-lg font-semibold ${themeClasses.text.primary}`}>
                                      {request.method}
                                    </div>
                                  </div>
                                  <div className={`p-4 rounded-lg ${themeClasses.bg.secondary}`}>
                                    <div className={`text-sm font-medium ${themeClasses.text.secondary} mb-1`}>
                                      Endpoint
                                    </div>
                                    <code className={`text-lg font-mono ${themeClasses.text.primary}`}>
                                      {request.url}
                                    </code>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {currentTab === 'parameters' && (
                            <div className="space-y-6">
                              {/* Query Parameters */}
                              <div>
                                <h4 className={`text-lg font-semibold ${themeClasses.text.primary} mb-4`}>
                                  Query Parameters
                                </h4>
                                <ParameterEditor
                                  parameters={request.docs?.parameters?.query || []}
                                  onSave={(parameters) => updateRequestParameters(collection.id, request.id, 'query', parameters)}
                                  parameterType="query"
                                  disabled={!isEditingMode}
                                />
                              </div>

                              {/* Path Parameters */}
                              <div>
                                <h4 className={`text-lg font-semibold ${themeClasses.text.primary} mb-4`}>
                                  Path Parameters
                                </h4>
                                <ParameterEditor
                                  parameters={request.docs?.parameters?.path || []}
                                  onSave={(parameters) => updateRequestParameters(collection.id, request.id, 'path', parameters)}
                                  parameterType="path"
                                  disabled={!isEditingMode}
                                />
                              </div>
                            </div>
                          )}

                          {currentTab === 'headers' && (
                            <div>
                              <h4 className={`text-lg font-semibold ${themeClasses.text.primary} mb-4`}>
                                Headers
                              </h4>
                              {request.headers && Object.keys(request.headers).length > 0 ? (
                                <div className="space-y-3">
                                  {Object.entries(request.headers).map(([key, value]) => (
                                    <div key={key} className={`p-4 rounded-lg ${themeClasses.bg.secondary} border ${themeClasses.border.primary}`}>
                                      <div className="flex items-center justify-between">
                                        <div>
                                          <code className={`text-sm font-semibold ${themeClasses.text.accent}`}>
                                            {key}
                                          </code>
                                          <div className={`text-sm ${themeClasses.text.secondary} mt-1`}>
                                            {value}
                                          </div>
                                        </div>
                                        <button
                                          onClick={() => copyToClipboard(`${key}: ${value}`)}
                                          className={`p-1 rounded transition-colors ${themeClasses.button.ghost}`}
                                        >
                                          <Copy className="w-4 h-4" />
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className={`text-center py-8 ${themeClasses.text.tertiary}`}>
                                  <FileText className={`h-8 w-8 mx-auto mb-2 ${themeClasses.text.tertiary}`} />
                                  <p className={`text-sm ${themeClasses.text.secondary}`}>
                                    No headers configured
                                  </p>
                                </div>
                              )}
                            </div>
                          )}

                          {currentTab === 'response' && (
                            <div>
                              <h4 className={`text-lg font-semibold ${themeClasses.text.primary} mb-4`}>
                                Response Format
                              </h4>
                              <div className={`text-center py-8 ${themeClasses.text.tertiary}`}>
                                <Code className={`h-8 w-8 mx-auto mb-2 ${themeClasses.text.tertiary}`} />
                                <p className={`text-sm ${themeClasses.text.secondary}`}>
                                  Response documentation coming soon
                                </p>
                              </div>
                            </div>
                          )}

                          {currentTab === 'examples' && (
                            <div className="space-y-6">
                              <h4 className={`text-lg font-semibold ${themeClasses.text.primary} mb-4`}>
                                Code Examples
                              </h4>
                              
                              {/* cURL Example */}
                              <EditableCodeBlock
                                value={request.docs?.examples?.curl || generateCurlExample(request)}
                                language="curl"
                                title="cURL"
                                onSave={(code) => updateRequestExample(collection.id, request.id, 'curl', code)}
                                disabled={!isEditingMode}
                                showEditIcon={isEditingMode}
                                showLanguageSelector={isEditingMode}
                                availableLanguages={['curl', 'javascript', 'python', 'php']}
                              />

                              {/* JavaScript Example */}
                              {(isEditingMode || request.docs?.examples?.javascript) && (
                                <EditableCodeBlock
                                  value={request.docs?.examples?.javascript || ''}
                                  language="javascript"
                                  title="JavaScript"
                                  onSave={(code) => updateRequestExample(collection.id, request.id, 'javascript', code)}
                                  disabled={!isEditingMode}
                                  showEditIcon={isEditingMode}
                                  placeholder="// Add JavaScript example..."
                                />
                              )}

                              {/* Python Example */}
                              {(isEditingMode || request.docs?.examples?.python) && (
                                <EditableCodeBlock
                                  value={request.docs?.examples?.python || ''}
                                  language="python"
                                  title="Python"
                                  onSave={(code) => updateRequestExample(collection.id, request.id, 'python', code)}
                                  disabled={!isEditingMode}
                                  showEditIcon={isEditingMode}
                                  placeholder="# Add Python example..."
                                />
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Footer */}
        <div className={`text-center py-12 border-t ${themeClasses.border.primary}`}>
          <p className={`text-sm ${themeClasses.text.tertiary}`}>
            Generated with API Playground • {new Date().toLocaleDateString()}
            {isEditingMode && (
              <span className="ml-2 text-blue-500">• Edit Mode Active</span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default EditableModernTemplate;