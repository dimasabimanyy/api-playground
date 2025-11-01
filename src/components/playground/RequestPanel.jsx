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
            <div className={`border-b ${themeClasses.border.primary} flex justify-between items-center`}>
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

            <TabsContent value="params" className="p-6">
              <div className={`text-sm mb-6 ${themeClasses.text.secondary}`}>
                Query parameters are appended to the request URL.
              </div>
              <div
                className={`text-center py-12 ${themeClasses.text.tertiary}`}
              >
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4 ${themeClasses.card.base}`}
                >
                  <Plus className={`h-6 w-6 ${themeClasses.text.tertiary}`} />
                </div>
                <p className={`text-sm mb-2 ${themeClasses.text.primary}`}>
                  No query parameters yet
                </p>
                <p className={`text-xs ${themeClasses.text.tertiary}`}>
                  Add parameters to customize your request
                </p>
              </div>
            </TabsContent>

            <TabsContent value="headers" className="p-6">
              <div className="space-y-6">
                {/* Headers Table Header */}
                <div
                  className={`grid grid-cols-12 gap-3 text-xs font-medium pb-3 border-b ${themeClasses.text.tertiary} ${themeClasses.border.primary}`}
                >
                  <div className="col-span-5">Key</div>
                  <div className="col-span-6">Value</div>
                  <div className="col-span-1"></div>
                </div>

                {/* Add New Header */}
                <div className="grid grid-cols-12 gap-3">
                  <Input
                    placeholder="Content-Type"
                    value={newHeaderKey || ''}
                    onChange={(e) => setNewHeaderKey(e.target.value)}
                    className={`col-span-5 h-9 text-sm rounded backdrop-blur-sm ${themeClasses.input.base}`}
                  />
                  <Input
                    placeholder="application/json"
                    value={newHeaderValue || ''}
                    onChange={(e) => setNewHeaderValue(e.target.value)}
                    className={`col-span-6 h-9 text-sm rounded backdrop-blur-sm ${themeClasses.input.base}`}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={addHeader}
                    className={`col-span-1 h-9 w-9 p-0 rounded-lg transition-all duration-200 ${themeClasses.button.ghost}`}
                    disabled={!newHeaderKey || !newHeaderValue}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {/* Existing Headers */}
                {Object.entries(safeRequest.headers || {}).length === 0 ? (
                  <div
                    className={`text-center py-12 ${themeClasses.text.tertiary}`}
                  >
                    <div
                      className={`w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4 ${themeClasses.card.base}`}
                    >
                      <Plus
                        className={`h-6 w-6 ${themeClasses.text.tertiary}`}
                      />
                    </div>
                    <p className={`text-sm mb-2 ${themeClasses.text.primary}`}>
                      No headers added yet
                    </p>
                    <p className={`text-xs ${themeClasses.text.tertiary}`}>
                      Add custom headers to your request
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {Object.entries(safeRequest.headers || {}).map(([key, value]) => (
                      <div
                        key={key}
                        className={`grid grid-cols-12 gap-3 p-3 rounded-lg ${themeClasses.card.base}`}
                      >
                        <Input
                          value={key || ''}
                          disabled
                          className={`col-span-5 h-8 text-sm ${themeClasses.input.disabled}`}
                        />
                        <Input
                          value={value || ''}
                          disabled
                          className={`col-span-6 h-8 text-sm ${themeClasses.input.disabled}`}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeHeader(key)}
                          className={`col-span-1 h-8 w-8 p-0 rounded transition-all duration-200 ${
                            themeClasses.text.tertiary
                          } hover:text-red-400 ${
                            isDark ? "hover:bg-red-500/20" : "hover:bg-red-100"
                          }`}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="body" className="p-6">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <label
                    className={`text-sm font-medium ${themeClasses.text.secondary}`}
                  >
                    Body type:
                  </label>
                  <select
                    className={`rounded px-3 py-2 text-sm backdrop-blur-sm ${themeClasses.input.base}`}
                  >
                    <option value="raw">raw</option>
                    <option value="form-data">form-data</option>
                    <option value="x-www-form-urlencoded">
                      x-www-form-urlencoded
                    </option>
                    <option value="binary">binary</option>
                  </select>
                  <select
                    className={`rounded px-3 py-2 text-sm backdrop-blur-sm ${themeClasses.input.base}`}
                  >
                    <option value="json">JSON</option>
                    <option value="text">Text</option>
                    <option value="xml">XML</option>
                    <option value="html">HTML</option>
                  </select>
                </div>
                <div className="relative">
                  <Textarea
                    placeholder={`{\n  "name": "John Doe",\n  "email": "john@example.com"\n}`}
                    value={safeRequest.body || ''}
                    onChange={(e) => updateRequest("body", e.target.value)}
                    className={`min-h-64 font-mono text-sm rounded resize-none backdrop-blur-sm ${themeClasses.input.base}`}
                  />
                  {request.body && (
                    <div
                      className={`absolute bottom-3 right-3 text-xs px-2 py-1 rounded backdrop-blur-sm ${
                        isDark
                          ? "text-gray-400 bg-gray-900/80"
                          : "text-gray-600 bg-white/80"
                      }`}
                    >
                      {new Blob([request.body]).size} bytes
                    </div>
                  )}
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