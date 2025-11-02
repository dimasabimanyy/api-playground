"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
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

            <TabsContent value="params" className="px-6 py-3 h-full flex flex-col space-y-4">
              {/* Add Parameter Section */}
              <div className="space-y-3">
                {/* <div className="flex items-center justify-end">
                  <h4 className={`text-sm font-medium ${themeClasses.text.primary}`}>Query Parameters</h4>
                  <span className={`text-xs px-2 py-1 rounded-full ${isDark ? 'bg-gray-800/60 text-gray-400' : 'bg-gray-100 text-gray-600'}`}>
                    0 parameters
                  </span>
                </div> */}
                
                {/* Parameter Input - Simplified Vercel Style */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className={`text-xs font-medium ${themeClasses.text.secondary}`}>Key</label>
                    <input
                      type="text"
                      placeholder="Key"
                      className={`w-full h-9 px-3 text-sm rounded-md border ${themeClasses.border.primary} ${isDark ? 'bg-transparent' : 'bg-white'} ${themeClasses.text.primary} placeholder:${themeClasses.text.tertiary} focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all`}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className={`text-xs font-medium ${themeClasses.text.secondary}`}>Value</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="1"
                        className={`flex-1 h-9 px-3 text-sm rounded-md border ${themeClasses.border.primary} ${isDark ? 'bg-transparent' : 'bg-white'} ${themeClasses.text.primary} placeholder:${themeClasses.text.tertiary} focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all`}
                      />
                      <button
                        className={`h-9 w-9 rounded-md border ${themeClasses.border.primary} flex items-center justify-center transition-all duration-200 ${isDark ? 'text-gray-400 hover:text-white hover:bg-gray-800' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

            </TabsContent>

            <TabsContent value="headers" className="px-6 py-3 h-full flex flex-col space-y-4">
              {/* Add Header Section */}
              <div className="space-y-3">
                {/* <div className="flex items-center justify-between">
                  <h4 className={`text-sm font-medium ${themeClasses.text.primary}`}>Request Headers</h4>
                  <span className={`text-xs px-2 py-1 rounded-full ${isDark ? 'bg-gray-800/60 text-gray-400' : 'bg-gray-100 text-gray-600'}`}>
                    {Object.keys(safeRequest.headers || {}).length} headers
                  </span>
                </div> */}
                
                {/* Header Input - Simplified Vercel Style */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className={`text-xs font-medium ${themeClasses.text.secondary}`}>Key</label>
                    <input
                      type="text"
                      placeholder="Content-Type"
                      value={newHeaderKey}
                      onChange={(e) => setNewHeaderKey(e.target.value)}
                      className={`w-full h-9 px-3 text-sm rounded-md border ${themeClasses.border.primary} ${isDark ? 'bg-transparent' : 'bg-white'} ${themeClasses.text.primary} placeholder:${themeClasses.text.tertiary} focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all`}
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
                        className={`flex-1 h-9 px-3 text-sm rounded-md border ${themeClasses.border.primary} ${isDark ? 'bg-transparent' : 'bg-white'} ${themeClasses.text.primary} placeholder:${themeClasses.text.tertiary} focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all`}
                      />
                      <button
                        onClick={addHeader}
                        disabled={!newHeaderKey || !newHeaderValue}
                        className={`h-9 w-9 rounded-md border ${themeClasses.border.primary} flex items-center justify-center transition-all duration-200 ${
                          newHeaderKey && newHeaderValue
                            ? `${isDark ? 'text-gray-400 hover:text-white hover:bg-gray-800' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`
                            : `${isDark ? 'text-gray-600 cursor-not-allowed' : 'text-gray-400 cursor-not-allowed'}`
                        }`}
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Headers List - Simplified */}
              <div className="flex-1 space-y-3 overflow-y-auto">
                {Object.entries(safeRequest.headers || {}).map(([key, value]) => (
                  <div
                    key={key}
                    className={`grid grid-cols-1 md:grid-cols-2 gap-3 p-3 rounded-md border ${themeClasses.border.primary} group hover:${isDark ? 'bg-gray-900/20' : 'bg-gray-50'} transition-all`}
                  >
                    <div className="space-y-1">
                      <span className={`text-xs font-medium ${themeClasses.text.secondary}`}>Key</span>
                      <p className={`text-sm font-mono ${themeClasses.text.primary} break-all`}>{key}</p>
                    </div>
                    <div className="space-y-1 flex justify-between items-start">
                      <div className="flex-1">
                        <span className={`text-xs font-medium ${themeClasses.text.secondary}`}>Value</span>
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
                
              </div>
            </TabsContent>

            <TabsContent value="body" className="px-6 py-3 h-full flex flex-col space-y-4">
              {/* Body Configuration */}
              <div className="space-y-3">
                {/* <div className="flex items-center justify-between">
                  <h4 className={`text-sm font-medium ${themeClasses.text.primary}`}>Request Body</h4>
                  {safeRequest.body && (
                    <span className={`text-xs px-2 py-1 rounded-full ${isDark ? 'bg-gray-800/60 text-gray-400' : 'bg-gray-100 text-gray-600'}`}>
                      {new Blob([safeRequest.body]).size} bytes
                    </span>
                  )}
                </div> */}
                
                {/* Content Type Radio Buttons - Postman Style */}
                <div className="flex items-center gap-4">
                  {[
                    { value: 'json', label: 'JSON' },
                    { value: 'text', label: 'Text' },
                    { value: 'xml', label: 'XML' },
                    { value: 'form', label: 'Form' }
                  ].map(({ value, label }) => (
                    <label key={value} className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="contentType"
                        value={value}
                        defaultChecked={value === 'json'}
                        className={`w-3 h-3 text-blue-600 ${isDark ? 'bg-transparent border-gray-600' : 'bg-white border-gray-300'} focus:ring-blue-500 focus:ring-1`}
                      />
                      <span className={`text-xs ${themeClasses.text.primary}`}>{label}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              {/* Body Editor - Clean */}
              <div className="flex-1">
                <Textarea
                  placeholder="Request body content..."
                  value={safeRequest.body || ''}
                  onChange={(e) => updateRequest("body", e.target.value)}
                  className={`w-full h-full min-h-[300px] text-sm resize-none rounded-md border ${themeClasses.border.primary} ${isDark ? 'bg-transparent' : 'bg-white'} ${themeClasses.text.primary} placeholder:${themeClasses.text.tertiary} focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 p-4 transition-all`}
                />
              </div>
            </TabsContent>

            <TabsContent value="auth" className="px-6 py-3 h-full flex flex-col space-y-4">
              <div className="space-y-3">
                {/* Auth Type Select - Simplified */}
                <div className="space-y-1.5">
                  <label className={`text-xs font-medium ${themeClasses.text.secondary}`}>
                    Authentication Type
                  </label>
                  <select
                    value={authType}
                    onChange={(e) => setAuthType(e.target.value)}
                    className={`w-full h-9 px-3 text-sm rounded-md border ${themeClasses.border.primary} ${isDark ? 'bg-transparent' : 'bg-white'} ${themeClasses.text.primary} focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all`}
                  >
                    <option value="none">No Authentication</option>
                    <option value="bearer">Bearer Token</option>
                    <option value="api-key">API Key</option>
                    <option value="basic">Basic Auth</option>
                  </select>
                </div>

                {/* Auth Forms - Simplified */}
                {authType === 'bearer' && (
                  <div className="space-y-2">
                    <div className="space-y-1.5">
                      <label className={`text-xs font-medium ${themeClasses.text.secondary}`}>Bearer Token</label>
                      <div className="relative">
                        <input
                          type={showBearerToken ? "text" : "password"}
                          placeholder="Enter your bearer token"
                          value={bearerToken}
                          onChange={(e) => setBearerToken(e.target.value)}
                          className={`w-full h-9 px-3 pr-10 text-sm rounded-md border ${themeClasses.border.primary} ${isDark ? 'bg-transparent' : 'bg-white'} ${themeClasses.text.primary} placeholder:${themeClasses.text.tertiary} focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowBearerToken(!showBearerToken)}
                          className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded transition-colors ${themeClasses.text.tertiary} hover:${themeClasses.text.secondary}`}
                        >
                          {showBearerToken ? (
                            <EyeOff className="h-3.5 w-3.5" />
                          ) : (
                            <Eye className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {authType === 'api-key' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className={`text-xs font-medium ${themeClasses.text.secondary}`}>Header Name</label>
                      <input
                        placeholder="X-API-Key"
                        value={apiKeyHeader}
                        onChange={(e) => setApiKeyHeader(e.target.value)}
                        className={`w-full h-9 px-3 text-sm rounded-md border ${themeClasses.border.primary} ${isDark ? 'bg-transparent' : 'bg-white'} ${themeClasses.text.primary} placeholder:${themeClasses.text.tertiary} focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all`}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className={`text-xs font-medium ${themeClasses.text.secondary}`}>API Key</label>
                      <input
                        type="password"
                        placeholder="API key value"
                        value={apiKeyValue}
                        onChange={(e) => setApiKeyValue(e.target.value)}
                        className={`w-full h-9 px-3 text-sm rounded-md border ${themeClasses.border.primary} ${isDark ? 'bg-transparent' : 'bg-white'} ${themeClasses.text.primary} placeholder:${themeClasses.text.tertiary} focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all`}
                      />
                    </div>
                  </div>
                )}

                {authType === 'basic' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className={`text-xs font-medium ${themeClasses.text.secondary}`}>Username</label>
                      <input
                        placeholder="Username"
                        value={basicUsername}
                        onChange={(e) => setBasicUsername(e.target.value)}
                        className={`w-full h-9 px-3 text-sm rounded-md border ${themeClasses.border.primary} ${isDark ? 'bg-transparent' : 'bg-white'} ${themeClasses.text.primary} placeholder:${themeClasses.text.tertiary} focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all`}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className={`text-xs font-medium ${themeClasses.text.secondary}`}>Password</label>
                      <input
                        type="password"
                        placeholder="Password"
                        value={basicPassword}
                        onChange={(e) => setBasicPassword(e.target.value)}
                        className={`w-full h-9 px-3 text-sm rounded-md border ${themeClasses.border.primary} ${isDark ? 'bg-transparent' : 'bg-white'} ${themeClasses.text.primary} placeholder:${themeClasses.text.tertiary} focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all`}
                      />
                    </div>
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