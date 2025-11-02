"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, X, Eye, EyeOff } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { getThemeClasses } from "@/lib/theme";

export default function RequestPanel({
  request = { method: 'GET', url: '', headers: {}, body: '' },
  setRequest,
}) {
  // Ensure request always has the required properties
  const safeRequest = {
    method: 'GET',
    url: '',
    headers: {},
    body: '',
    ...request
  };
  const { isDark } = useTheme();
  const themeClasses = getThemeClasses(isDark);
  const [newHeaderKey, setNewHeaderKey] = useState("");
  const [newHeaderValue, setNewHeaderValue] = useState("");
  
  // Simple authentication state
  const [authType, setAuthType] = useState('none');
  const [bearerToken, setBearerToken] = useState('');
  const [showBearerToken, setShowBearerToken] = useState(true);
  const [apiKeyHeader, setApiKeyHeader] = useState('X-API-Key');
  const [apiKeyValue, setApiKeyValue] = useState('');
  const [basicUsername, setBasicUsername] = useState('');
  const [basicPassword, setBasicPassword] = useState('');

  const updateRequest = (field, value) => {
    const updatedRequest = { ...safeRequest, [field]: value };
    setRequest(updatedRequest);
  };

  const addHeader = () => {
    if (newHeaderKey && newHeaderValue) {
      updateRequest("headers", {
        ...(safeRequest.headers || {}),
        [newHeaderKey]: newHeaderValue,
      });
      setNewHeaderKey("");
      setNewHeaderValue("");
    }
  };

  const removeHeader = (key) => {
    const { [key]: removed, ...rest } = safeRequest.headers || {};
    updateRequest("headers", rest);
  };
  
  // Simple authentication functions
  const applyAuthentication = () => {
    let updatedHeaders = { ...safeRequest.headers };
    
    // Clean up any existing auth headers
    delete updatedHeaders['Authorization'];
    delete updatedHeaders['X-API-Key'];
    delete updatedHeaders['API-Key'];
    delete updatedHeaders[apiKeyHeader]; // Remove custom API key header
    
    // Apply authentication based on type
    switch (authType) {
      case 'bearer':
        if (bearerToken.trim()) {
          updatedHeaders['Authorization'] = `Bearer ${bearerToken.trim()}`;
        }
        break;
        
      case 'api-key':
        if (apiKeyHeader.trim() && apiKeyValue.trim()) {
          updatedHeaders[apiKeyHeader.trim()] = apiKeyValue.trim();
        }
        break;
        
      case 'basic':
        if (basicUsername.trim() && basicPassword.trim()) {
          const credentials = btoa(`${basicUsername.trim()}:${basicPassword.trim()}`);
          updatedHeaders['Authorization'] = `Basic ${credentials}`;
        }
        break;
    }
    
    updateRequest('headers', updatedHeaders);
  };
  
  // Auto-apply authentication when values change
  useEffect(() => {
    applyAuthentication();
  }, [authType, bearerToken, apiKeyHeader, apiKeyValue, basicUsername, basicPassword]);


  return (
    <div
      className={`flex-1 h-full flex flex-col border-r transition-all duration-300 ${themeClasses.border.primary} ${themeClasses.bg.glass}`}
    >
      <div
        className={`flex-1 overflow-y-auto transition-colors duration-300 ${themeClasses.bg.primary}`}
      >
        {/* Request Configuration Tabs - Theme Aware */}
        <div>
          <Tabs defaultValue="headers" className="w-full">
            <div className="flex justify-between items-center px-6">
              <TabsList className="flex h-8 bg-transparent p-0 border-none gap-6">
                {[
                  { value: "params", label: "Params" },
                  {
                    value: "headers",
                    label: "Headers",
                    count: Object.keys(safeRequest.headers || {}).length,
                  },
                  {
                    value: "body",
                    label: "Body",
                    dot: !!safeRequest.body,
                  },
                  { 
                    value: "auth", 
                    label: "Authorization",
                    dot: authType !== 'none'
                  },
                ].map(({ value, label, count, dot }) => (
                  <TabsTrigger
                    key={value}
                    value={value}
                    className={`
          relative text-xs py-2 rounded-none border-none bg-transparent
          transition-all duration-200
          ${themeClasses.tab.inactive}
          hover:bg-transparent hover:text-blue-500
          data-[state=active]:text-blue-500
          after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-blue-500 after:transition-all after:duration-300
          data-[state=active]:after:w-full hover:after:w-full
        `}
                  >
                    {label}
                    {count > 0 && (
                      <span
                        className={`ml-1.5 text-xs px-1.5 py-0.5 rounded border ${themeClasses.status.info}`}
                      >
                        {count}
                      </span>
                    )}
                    {dot && (
                      <div
                        className={`ml-1.5 h-2 w-2 rounded-full ${
                          isDark ? "bg-blue-500" : "bg-blue-600"
                        }`}
                      />
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              {/* Right side space for future features */}
              <div className="flex items-center gap-2">
                {/* Future content can go here */}
              </div>
            </div>

            <TabsContent value="params" className="px-6 py-0 h-full flex flex-col space-y-4">
              {/* Add Parameter Section */}
              <div className="space-y-3">
                {/* <div className="flex items-center justify-end">
                  <h4 className={`text-sm font-medium ${themeClasses.text.primary}`}>Query Parameters</h4>
                  <span className={`text-xs px-2 py-1 rounded-full ${isDark ? 'bg-gray-800/60 text-gray-400' : 'bg-gray-100 text-gray-600'}`}>
                    0 parameters
                  </span>
                </div> */}
                
                {/* Parameter Input Card */}
                <div className={`rounded-xl border ${themeClasses.border.primary} ${isDark ? 'bg-gray-900/20' : 'bg-white'} p-4`}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className={`text-xs font-medium ${themeClasses.text.secondary}`}>Parameter Name</label>
                      <input
                        type="text"
                        placeholder="page"
                        className={`w-full h-9 px-3 text-sm rounded-lg border ${themeClasses.border.primary} ${isDark ? 'bg-gray-800/30' : 'bg-gray-50/50'} ${themeClasses.text.primary} placeholder:${themeClasses.text.tertiary} focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all font-mono`}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className={`text-xs font-medium ${themeClasses.text.secondary}`}>Value</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="1"
                          className={`flex-1 h-9 px-3 text-sm rounded-lg border ${themeClasses.border.primary} ${isDark ? 'bg-gray-800/30' : 'bg-gray-50/50'} ${themeClasses.text.primary} placeholder:${themeClasses.text.tertiary} focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all font-mono`}
                        />
                        <button
                          className={`h-9 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${isDark ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'} focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </TabsContent>

            <TabsContent value="headers" className="p-6 h-full flex flex-col space-y-4">
              {/* Add Header Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className={`text-sm font-medium ${themeClasses.text.primary}`}>Request Headers</h4>
                  <span className={`text-xs px-2 py-1 rounded-full ${isDark ? 'bg-gray-800/60 text-gray-400' : 'bg-gray-100 text-gray-600'}`}>
                    {Object.keys(safeRequest.headers || {}).length} headers
                  </span>
                </div>
                
                {/* Header Input Card */}
                <div className={`rounded-xl border ${themeClasses.border.primary} ${isDark ? 'bg-gray-900/20' : 'bg-white'} p-4`}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className={`text-xs font-medium ${themeClasses.text.secondary}`}>Header Name</label>
                      <input
                        type="text"
                        placeholder="Content-Type"
                        value={newHeaderKey}
                        onChange={(e) => setNewHeaderKey(e.target.value)}
                        className={`w-full h-9 px-3 text-sm rounded-lg border ${themeClasses.border.primary} ${isDark ? 'bg-gray-800/30' : 'bg-gray-50/50'} ${themeClasses.text.primary} placeholder:${themeClasses.text.tertiary} focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all font-mono`}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className={`text-xs font-medium ${themeClasses.text.secondary}`}>Value</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="application/json"
                          value={newHeaderValue}
                          onChange={(e) => setNewHeaderValue(e.target.value)}
                          className={`flex-1 h-9 px-3 text-sm rounded-lg border ${themeClasses.border.primary} ${isDark ? 'bg-gray-800/30' : 'bg-gray-50/50'} ${themeClasses.text.primary} placeholder:${themeClasses.text.tertiary} focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all font-mono`}
                        />
                        <button
                          onClick={addHeader}
                          disabled={!newHeaderKey || !newHeaderValue}
                          className={`h-9 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                            newHeaderKey && newHeaderValue
                              ? `${isDark ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'} focus:outline-none focus:ring-2 focus:ring-blue-500/20`
                              : `${isDark ? 'bg-gray-800/50 text-gray-500' : 'bg-gray-200 text-gray-400'} cursor-not-allowed`
                          }`}
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Headers List */}
              <div className="flex-1 space-y-2 overflow-y-auto">
                {Object.entries(safeRequest.headers || {}).map(([key, value]) => (
                  <div
                    key={key}
                    className={`rounded-lg border ${themeClasses.border.primary} ${isDark ? 'bg-gray-900/20' : 'bg-white'} p-3 group hover:${isDark ? 'bg-gray-900/40' : 'bg-gray-50'} transition-all`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs font-medium ${themeClasses.text.secondary}`}>Header</span>
                        </div>
                        <p className={`text-sm font-mono ${themeClasses.text.primary} break-all`}>{key}</p>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs font-medium ${themeClasses.text.secondary}`}>Value</span>
                        </div>
                        <p className={`text-sm font-mono ${themeClasses.text.secondary} break-all`}>{value}</p>
                      </div>
                      <button
                        onClick={() => removeHeader(key)}
                        className={`opacity-0 group-hover:opacity-100 p-1 rounded-md transition-all duration-200 ${themeClasses.text.tertiary} hover:text-red-500 ${isDark ? 'hover:bg-red-500/20' : 'hover:bg-red-100'}`}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
                
                {/* Empty state */}
                {Object.keys(safeRequest.headers || {}).length === 0 && (
                  <div className={`text-center py-8 ${themeClasses.text.tertiary}`}>
                    <p className="text-sm">Add headers above to customize your request</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="body" className="p-6 h-full flex flex-col space-y-4">
              {/* Body Configuration */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className={`text-sm font-medium ${themeClasses.text.primary}`}>Request Body</h4>
                  {safeRequest.body && (
                    <span className={`text-xs px-2 py-1 rounded-full ${isDark ? 'bg-gray-800/60 text-gray-400' : 'bg-gray-100 text-gray-600'}`}>
                      {new Blob([safeRequest.body]).size} bytes
                    </span>
                  )}
                </div>
                
                {/* Body Type Controls */}
                <div className={`rounded-xl border ${themeClasses.border.primary} ${isDark ? 'bg-gray-900/20' : 'bg-white'} p-4`}>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className={`text-xs font-medium ${themeClasses.text.secondary}`}>Body Type</label>
                      <select
                        className={`w-full h-9 px-3 text-sm rounded-lg border ${themeClasses.border.primary} ${isDark ? 'bg-gray-800/30' : 'bg-gray-50/50'} ${themeClasses.text.primary} focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all`}
                      >
                        <option value="raw">Raw</option>
                        <option value="form-data">Form Data</option>
                        <option value="x-www-form-urlencoded">URL Encoded</option>
                        <option value="binary">Binary</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className={`text-xs font-medium ${themeClasses.text.secondary}`}>Content Type</label>
                      <select
                        className={`w-full h-9 px-3 text-sm rounded-lg border ${themeClasses.border.primary} ${isDark ? 'bg-gray-800/30' : 'bg-gray-50/50'} ${themeClasses.text.primary} focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all`}
                      >
                        <option value="json">JSON</option>
                        <option value="text">Text</option>
                        <option value="xml">XML</option>
                        <option value="html">HTML</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Body Editor */}
              <div className="flex-1 space-y-2">
                <label className={`text-xs font-medium ${themeClasses.text.secondary}`}>Content</label>
                <div className={`flex-1 rounded-xl border ${themeClasses.border.primary} ${isDark ? 'bg-gray-900/20' : 'bg-white'} overflow-hidden`}>
                  <Textarea
                    placeholder={`{\n  "name": "John Doe",\n  "email": "john@example.com",\n  "role": "developer"\n}`}
                    value={safeRequest.body || ''}
                    onChange={(e) => updateRequest("body", e.target.value)}
                    className={`w-full h-full min-h-[300px] font-mono text-sm resize-none border-0 ${isDark ? 'bg-gray-900/20' : 'bg-white'} ${themeClasses.text.primary} placeholder:${themeClasses.text.tertiary} focus:outline-none focus:ring-2 focus:ring-blue-500/20 p-4 transition-all`}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="auth" className="p-6">
              <div className="space-y-6">
                {/* Auth Type Select */}
                <div>
                  <label className={`text-sm font-medium ${themeClasses.text.secondary} block mb-2`}>
                    Authentication Type
                  </label>
                  <select
                    value={authType}
                    onChange={(e) => setAuthType(e.target.value)}
                    className={`w-full rounded-lg px-3 py-3 text-sm ${themeClasses.input.base}`}
                  >
                    <option value="none">No Authentication</option>
                    <option value="bearer">Bearer Token</option>
                    <option value="api-key">API Key</option>
                    <option value="basic">Basic Auth</option>
                  </select>
                </div>

                {/* Auth Forms - Simplified */}
                {authType === 'bearer' && (
                  <div className="space-y-3">
                    <div className="relative">
                      <Input
                        type={showBearerToken ? "text" : "password"}
                        placeholder="Enter your bearer token"
                        value={bearerToken}
                        onChange={(e) => setBearerToken(e.target.value)}
                        className={`h-12 text-sm pr-12 ${themeClasses.input.base}`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowBearerToken(!showBearerToken)}
                        className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${themeClasses.text.tertiary} hover:${themeClasses.text.secondary} transition-colors`}
                      >
                        {showBearerToken ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    <p className={`text-xs ${themeClasses.text.tertiary}`}>
                      Will add Authorization header with Bearer token
                    </p>
                  </div>
                )}

                {authType === 'api-key' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        placeholder="Header name (e.g., X-API-Key)"
                        value={apiKeyHeader}
                        onChange={(e) => setApiKeyHeader(e.target.value)}
                        className={`h-12 text-sm ${themeClasses.input.base}`}
                      />
                      <Input
                        type="password"
                        placeholder="API key value"
                        value={apiKeyValue}
                        onChange={(e) => setApiKeyValue(e.target.value)}
                        className={`h-12 text-sm ${themeClasses.input.base}`}
                      />
                    </div>
                    <p className={`text-xs ${themeClasses.text.tertiary}`}>
                      Will add custom header with your API key
                    </p>
                  </div>
                )}

                {authType === 'basic' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        placeholder="Username"
                        value={basicUsername}
                        onChange={(e) => setBasicUsername(e.target.value)}
                        className={`h-12 text-sm ${themeClasses.input.base}`}
                      />
                      <Input
                        type="password"
                        placeholder="Password"
                        value={basicPassword}
                        onChange={(e) => setBasicPassword(e.target.value)}
                        className={`h-12 text-sm ${themeClasses.input.base}`}
                      />
                    </div>
                    <p className={`text-xs ${themeClasses.text.tertiary}`}>
                      Will add Authorization header with Basic auth
                    </p>
                  </div>
                )}

                {authType === 'none' && (
                  <div className={`text-center py-12 ${themeClasses.text.tertiary}`}>
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4 ${themeClasses.card.base}`}>
                      <div className={`w-6 h-6 rounded-full border-2 ${themeClasses.border.primary}`} />
                    </div>
                    <p className={`text-sm ${themeClasses.text.primary} mb-1`}>No authentication</p>
                    <p className={`text-xs ${themeClasses.text.tertiary}`}>Select an auth method above</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}