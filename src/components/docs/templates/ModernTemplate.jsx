"use client";

import { useState } from "react";
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
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { getThemeClasses, getMethodColors } from "@/lib/theme";
import { Button } from "@/components/ui/button";

const ModernTemplate = ({ docData }) => {
  const { isDark } = useTheme();
  const themeClasses = getThemeClasses(isDark);
  const [expandedEndpoints, setExpandedEndpoints] = useState(new Set());
  const [activeTab, setActiveTab] = useState({});

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
    let curl = `curl -X ${request.method} "${docData.customization?.baseUrl || 'https://api.example.com'}${request.url}"`;
    
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

  return (
    <div className={`min-h-screen ${themeClasses.bg.primary}`}>
      {/* Hero Section */}
      <div className={`${isDark ? 'bg-gradient-to-b from-gray-900 via-gray-900 to-gray-800' : 'bg-gradient-to-b from-blue-50 via-white to-gray-50'} border-b ${themeClasses.border.primary}`}>
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium mb-6">
              <Globe className="w-4 h-4" />
              API Documentation
            </div>
            
            <h1 className={`text-4xl md:text-5xl font-bold mb-4 ${themeClasses.text.primary}`}>
              {docData.customization?.title || 'API Documentation'}
            </h1>
            
            <p className={`text-xl ${themeClasses.text.secondary} max-w-2xl mx-auto mb-8`}>
              {docData.customization?.description || 'Complete API reference for your application'}
            </p>

            {docData.customization?.baseUrl && (
              <div className={`inline-flex items-center gap-3 px-4 py-3 rounded-lg ${themeClasses.card.base} ${themeClasses.border.primary} border`}>
                <span className={`text-sm font-medium ${themeClasses.text.secondary}`}>Base URL:</span>
                <code className={`text-sm font-mono ${themeClasses.text.accent} bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded`}>
                  {docData.customization.baseUrl}
                </code>
                <button
                  onClick={() => copyToClipboard(docData.customization.baseUrl)}
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
                value: docData.collections?.length || 0,
                icon: FileText,
                color: 'blue'
              },
              {
                label: 'Endpoints',
                value: docData.collections?.reduce((acc, col) => acc + (col.requests?.length || 0), 0) || 0,
                icon: Globe,
                color: 'green'
              },
              {
                label: 'Methods',
                value: new Set(docData.collections?.flatMap(col => col.requests?.map(req => req.method) || [])).size || 0,
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
        {docData.collections?.map((collection) => (
          <div key={collection.id} className="mb-16">
            {/* Collection Header */}
            <div className="mb-8">
              <h2 className={`text-2xl font-bold ${themeClasses.text.primary} mb-2`}>
                {collection.name}
              </h2>
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
                            <h3 className={`text-lg font-semibold ${themeClasses.text.primary}`}>
                              {request.name}
                            </h3>
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
                              <div>
                                <h4 className={`text-lg font-semibold ${themeClasses.text.primary} mb-2`}>
                                  Description
                                </h4>
                                <p className={`${themeClasses.text.secondary}`}>
                                  {request.description || `${request.method} request to ${request.url}`}
                                </p>
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
                            <div>
                              <h4 className={`text-lg font-semibold ${themeClasses.text.primary} mb-4`}>
                                Parameters
                              </h4>
                              <div className={`text-center py-8 ${themeClasses.text.tertiary}`}>
                                <FileText className={`h-8 w-8 mx-auto mb-2 ${themeClasses.text.tertiary}`} />
                                <p className={`text-sm ${themeClasses.text.secondary}`}>
                                  No parameters documented yet
                                </p>
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
                            <div>
                              <h4 className={`text-lg font-semibold ${themeClasses.text.primary} mb-4`}>
                                Code Examples
                              </h4>
                              
                              {/* cURL Example */}
                              <div className={`rounded-lg ${themeClasses.bg.secondary} border ${themeClasses.border.primary} overflow-hidden`}>
                                <div className={`px-4 py-3 border-b ${themeClasses.border.primary} flex items-center justify-between`}>
                                  <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                    <span className={`text-sm font-medium ${themeClasses.text.secondary} ml-2`}>
                                      cURL
                                    </span>
                                  </div>
                                  <button
                                    onClick={() => copyToClipboard(generateCurlExample(request))}
                                    className={`p-1 rounded transition-colors ${themeClasses.button.ghost}`}
                                  >
                                    <Copy className="w-4 h-4" />
                                  </button>
                                </div>
                                <div className="p-4">
                                  <pre className={`text-sm font-mono ${themeClasses.text.primary} overflow-x-auto`}>
                                    {generateCurlExample(request)}
                                  </pre>
                                </div>
                              </div>
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
          </p>
        </div>
      </div>
    </div>
  );
};

export default ModernTemplate;