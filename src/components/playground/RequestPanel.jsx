"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, X } from "lucide-react";
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
  
  // Authentication state
  const [authType, setAuthType] = useState('none');
  const [authConfig, setAuthConfig] = useState({
    apiKey: { key: '', value: '', location: 'header' },
    bearer: { token: '' },
    basic: { username: '', password: '' },
    oauth2: { accessToken: '', tokenType: 'Bearer' }
  });
  
  // Token storage state
  const [savedTokens, setSavedTokens] = useState(() => {
    try {
      const saved = localStorage.getItem('api-playground-saved-tokens');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [showTokenManager, setShowTokenManager] = useState(false);
  const [newTokenName, setNewTokenName] = useState('');
  const [newTokenValue, setNewTokenValue] = useState('');

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
  
  // Authentication functions
  const applyAuthentication = () => {
    let updatedHeaders = { ...safeRequest.headers };
    
    // Remove existing auth headers first
    delete updatedHeaders['Authorization'];
    delete updatedHeaders['X-API-Key'];
    delete updatedHeaders['API-Key'];
    
    switch (authType) {
      case 'bearer':
        if (authConfig.bearer.token) {
          updatedHeaders['Authorization'] = `Bearer ${authConfig.bearer.token}`;
        }
        break;
        
      case 'api-key':
        if (authConfig.apiKey.key && authConfig.apiKey.value) {
          if (authConfig.apiKey.location === 'header') {
            updatedHeaders[authConfig.apiKey.key] = authConfig.apiKey.value;
          }
          // TODO: Add query parameter support for API keys
        }
        break;
        
      case 'basic':
        if (authConfig.basic.username && authConfig.basic.password) {
          const credentials = btoa(`${authConfig.basic.username}:${authConfig.basic.password}`);
          updatedHeaders['Authorization'] = `Basic ${credentials}`;
        }
        break;
        
      case 'oauth2':
        if (authConfig.oauth2.accessToken) {
          const tokenType = authConfig.oauth2.tokenType || 'Bearer';
          updatedHeaders['Authorization'] = `${tokenType} ${authConfig.oauth2.accessToken}`;
        }
        break;
        
      default:
        // 'none' - no authentication
        break;
    }
    
    updateRequest('headers', updatedHeaders);
  };
  
  const updateAuthConfig = (type, field, value) => {
    setAuthConfig(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: value
      }
    }));
  };
  
  // Auto-apply authentication when config changes
  useEffect(() => {
    if (authType !== 'none') {
      applyAuthentication();
    }
  }, [authType, authConfig]);
  
  // Token management functions
  const saveToken = () => {
    if (!newTokenName.trim() || !newTokenValue.trim()) return;
    
    const newToken = {
      id: Date.now().toString(),
      name: newTokenName.trim(),
      value: newTokenValue.trim(),
      type: authType,
      createdAt: new Date().toISOString()
    };
    
    const updatedTokens = [...savedTokens, newToken];
    setSavedTokens(updatedTokens);
    localStorage.setItem('api-playground-saved-tokens', JSON.stringify(updatedTokens));
    
    setNewTokenName('');
    setNewTokenValue('');
    setShowTokenManager(false);
  };
  
  const deleteToken = (tokenId) => {
    const updatedTokens = savedTokens.filter(token => token.id !== tokenId);
    setSavedTokens(updatedTokens);
    localStorage.setItem('api-playground-saved-tokens', JSON.stringify(updatedTokens));
  };
  
  const useToken = (token) => {
    setAuthType(token.type);
    
    switch (token.type) {
      case 'bearer':
        updateAuthConfig('bearer', 'token', token.value);
        break;
      case 'api-key':
        // For API keys, we'll use the saved value but user needs to set the key name
        updateAuthConfig('apiKey', 'value', token.value);
        break;
      case 'oauth2':
        updateAuthConfig('oauth2', 'accessToken', token.value);
        break;
    }
  };


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
            <div className={`border-b ${themeClasses.border.primary}`}>
              <TabsList className="grid w-full grid-cols-4 h-8 bg-transparent p-0 border-none">
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
                {/* Auth Type Selector */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <label className={`text-sm font-medium ${themeClasses.text.secondary}`}>
                      Type:
                    </label>
                    <select
                      value={authType}
                      onChange={(e) => setAuthType(e.target.value)}
                      className={`rounded-lg px-3 py-2 text-sm transition-all backdrop-blur-sm ${themeClasses.input.base}`}
                    >
                      <option value="none">No Auth</option>
                      <option value="bearer">Bearer Token</option>
                      <option value="api-key">API Key</option>
                      <option value="basic">Basic Auth</option>
                      <option value="oauth2">OAuth 2.0</option>
                    </select>
                  </div>
                  
                  {/* Saved Tokens Dropdown */}
                  {savedTokens.length > 0 && (
                    <div className="flex items-center gap-2">
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            const token = savedTokens.find(t => t.id === e.target.value);
                            if (token) useToken(token);
                            e.target.value = ''; // Reset dropdown
                          }
                        }}
                        className={`text-xs px-2 py-1 rounded ${themeClasses.input.base}`}
                      >
                        <option value="">Quick Select...</option>
                        {savedTokens.map(token => (
                          <option key={token.id} value={token.id}>
                            {token.name} ({token.type})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Dynamic Auth Configuration */}
                {authType === 'none' && (
                  <div className={`text-center py-12 ${themeClasses.text.tertiary}`}>
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4 ${themeClasses.card.base}`}>
                      <div className={`w-6 h-6 border-2 border-dashed rounded ${isDark ? "border-gray-600" : "border-gray-400"}`} />
                    </div>
                    <p className={`text-sm mb-2 ${themeClasses.text.primary}`}>No authorization configured</p>
                    <p className={`text-xs ${themeClasses.text.tertiary}`}>Select an auth type above to configure credentials</p>
                  </div>
                )}

                {/* Bearer Token */}
                {authType === 'bearer' && (
                  <div className="space-y-4">
                    <div className={`p-4 rounded-lg ${themeClasses.card.base} border ${themeClasses.border.primary}`}>
                      <h3 className={`text-sm font-medium ${themeClasses.text.primary} mb-3`}>Bearer Token Authentication</h3>
                      <div className="space-y-3">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className={`text-xs font-medium ${themeClasses.text.secondary}`}>Token</label>
                            <button
                              onClick={() => setShowTokenManager(true)}
                              className={`text-xs px-2 py-1 rounded transition-all ${themeClasses.button.ghost} ${themeClasses.text.accent}`}
                            >
                              💾 Save Token
                            </button>
                          </div>
                          <Input
                            type="password"
                            placeholder="your-bearer-token-here"
                            value={authConfig.bearer.token}
                            onChange={(e) => updateAuthConfig('bearer', 'token', e.target.value)}
                            className={`h-9 text-sm ${themeClasses.input.base}`}
                          />
                        </div>
                        <div className={`text-xs ${themeClasses.text.tertiary} flex items-start gap-2`}>
                          <div className="w-1 h-1 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                          <span>Will be sent as: <code className={`px-1 py-0.5 rounded text-xs font-mono ${themeClasses.bg.secondary}`}>Authorization: Bearer your-token</code></span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* API Key */}
                {authType === 'api-key' && (
                  <div className="space-y-4">
                    <div className={`p-4 rounded-lg ${themeClasses.card.base} border ${themeClasses.border.primary}`}>
                      <h3 className={`text-sm font-medium ${themeClasses.text.primary} mb-3`}>API Key Authentication</h3>
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className={`text-xs font-medium ${themeClasses.text.secondary} block mb-2`}>Key</label>
                            <Input
                              placeholder="X-API-Key"
                              value={authConfig.apiKey.key}
                              onChange={(e) => updateAuthConfig('apiKey', 'key', e.target.value)}
                              className={`h-9 text-sm ${themeClasses.input.base}`}
                            />
                          </div>
                          <div>
                            <label className={`text-xs font-medium ${themeClasses.text.secondary} block mb-2`}>Value</label>
                            <Input
                              type="password"
                              placeholder="your-api-key"
                              value={authConfig.apiKey.value}
                              onChange={(e) => updateAuthConfig('apiKey', 'value', e.target.value)}
                              className={`h-9 text-sm ${themeClasses.input.base}`}
                            />
                          </div>
                        </div>
                        <div>
                          <label className={`text-xs font-medium ${themeClasses.text.secondary} block mb-2`}>Add to</label>
                          <select
                            value={authConfig.apiKey.location}
                            onChange={(e) => updateAuthConfig('apiKey', 'location', e.target.value)}
                            className={`w-full rounded px-3 py-2 text-sm ${themeClasses.input.base}`}
                          >
                            <option value="header">Header</option>
                            <option value="query">Query Parameter</option>
                          </select>
                        </div>
                        <div className={`text-xs ${themeClasses.text.tertiary} flex items-start gap-2`}>
                          <div className="w-1 h-1 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                          <span>Will be sent as: <code className={`px-1 py-0.5 rounded text-xs font-mono ${themeClasses.bg.secondary}`}>{authConfig.apiKey.key || 'Key'}: {authConfig.apiKey.value || 'Value'}</code></span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Basic Auth */}
                {authType === 'basic' && (
                  <div className="space-y-4">
                    <div className={`p-4 rounded-lg ${themeClasses.card.base} border ${themeClasses.border.primary}`}>
                      <h3 className={`text-sm font-medium ${themeClasses.text.primary} mb-3`}>Basic Authentication</h3>
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className={`text-xs font-medium ${themeClasses.text.secondary} block mb-2`}>Username</label>
                            <Input
                              placeholder="username"
                              value={authConfig.basic.username}
                              onChange={(e) => updateAuthConfig('basic', 'username', e.target.value)}
                              className={`h-9 text-sm ${themeClasses.input.base}`}
                            />
                          </div>
                          <div>
                            <label className={`text-xs font-medium ${themeClasses.text.secondary} block mb-2`}>Password</label>
                            <Input
                              type="password"
                              placeholder="password"
                              value={authConfig.basic.password}
                              onChange={(e) => updateAuthConfig('basic', 'password', e.target.value)}
                              className={`h-9 text-sm ${themeClasses.input.base}`}
                            />
                          </div>
                        </div>
                        <div className={`text-xs ${themeClasses.text.tertiary} flex items-start gap-2`}>
                          <div className="w-1 h-1 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                          <span>Will be sent as: <code className={`px-1 py-0.5 rounded text-xs font-mono ${themeClasses.bg.secondary}`}>Authorization: Basic base64(username:password)</code></span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* OAuth 2.0 */}
                {authType === 'oauth2' && (
                  <div className="space-y-4">
                    <div className={`p-4 rounded-lg ${themeClasses.card.base} border ${themeClasses.border.primary}`}>
                      <h3 className={`text-sm font-medium ${themeClasses.text.primary} mb-3`}>OAuth 2.0 Authentication</h3>
                      <div className="space-y-3">
                        <div>
                          <label className={`text-xs font-medium ${themeClasses.text.secondary} block mb-2`}>Access Token</label>
                          <Input
                            type="password"
                            placeholder="your-access-token"
                            value={authConfig.oauth2.accessToken}
                            onChange={(e) => updateAuthConfig('oauth2', 'accessToken', e.target.value)}
                            className={`h-9 text-sm ${themeClasses.input.base}`}
                          />
                        </div>
                        <div>
                          <label className={`text-xs font-medium ${themeClasses.text.secondary} block mb-2`}>Token Type</label>
                          <select
                            value={authConfig.oauth2.tokenType}
                            onChange={(e) => updateAuthConfig('oauth2', 'tokenType', e.target.value)}
                            className={`w-full rounded px-3 py-2 text-sm ${themeClasses.input.base}`}
                          >
                            <option value="Bearer">Bearer</option>
                            <option value="Token">Token</option>
                            <option value="OAuth">OAuth</option>
                          </select>
                        </div>
                        <div className={`text-xs ${themeClasses.text.tertiary} flex items-start gap-2`}>
                          <div className="w-1 h-1 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                          <span>Will be sent as: <code className={`px-1 py-0.5 rounded text-xs font-mono ${themeClasses.bg.secondary}`}>Authorization: {authConfig.oauth2.tokenType} your-token</code></span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Token Manager Modal */}
                {showTokenManager && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowTokenManager(false)}>
                    <div className={`bg-white dark:bg-gray-800 rounded-lg p-6 w-96 max-h-96 overflow-y-auto`} onClick={(e) => e.stopPropagation()}>
                      <h3 className={`text-lg font-semibold ${themeClasses.text.primary} mb-4`}>Manage Saved Tokens</h3>
                      
                      {/* Add New Token */}
                      <div className="space-y-3 mb-6">
                        <div>
                          <label className={`text-sm font-medium ${themeClasses.text.secondary} block mb-1`}>Token Name</label>
                          <Input
                            placeholder="My API Token"
                            value={newTokenName}
                            onChange={(e) => setNewTokenName(e.target.value)}
                            className={`h-8 text-sm ${themeClasses.input.base}`}
                          />
                        </div>
                        <div>
                          <label className={`text-sm font-medium ${themeClasses.text.secondary} block mb-1`}>Token Value</label>
                          <Input
                            type="password"
                            placeholder="token-value"
                            value={newTokenValue}
                            onChange={(e) => setNewTokenValue(e.target.value)}
                            className={`h-8 text-sm ${themeClasses.input.base}`}
                          />
                        </div>
                        <button
                          onClick={saveToken}
                          disabled={!newTokenName.trim() || !newTokenValue.trim()}
                          className={`w-full py-2 px-4 rounded text-sm font-medium transition-all ${
                            newTokenName.trim() && newTokenValue.trim()
                              ? 'bg-blue-500 hover:bg-blue-600 text-white'
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          Save Token
                        </button>
                      </div>
                      
                      {/* Saved Tokens List */}
                      {savedTokens.length > 0 && (
                        <div>
                          <h4 className={`text-sm font-medium ${themeClasses.text.secondary} mb-3`}>Saved Tokens</h4>
                          <div className="space-y-2 max-h-48 overflow-y-auto">
                            {savedTokens.map(token => (
                              <div key={token.id} className={`flex items-center justify-between p-2 rounded ${themeClasses.card.base} border ${themeClasses.border.primary}`}>
                                <div>
                                  <div className={`text-sm font-medium ${themeClasses.text.primary}`}>{token.name}</div>
                                  <div className={`text-xs ${themeClasses.text.tertiary}`}>{token.type} • {new Date(token.createdAt).toLocaleDateString()}</div>
                                </div>
                                <div className="flex gap-1">
                                  <button
                                    onClick={() => useToken(token)}
                                    className={`px-2 py-1 text-xs rounded ${themeClasses.button.primary}`}
                                  >
                                    Use
                                  </button>
                                  <button
                                    onClick={() => deleteToken(token.id)}
                                    className={`px-2 py-1 text-xs rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20`}
                                  >
                                    ✕
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex justify-end mt-4">
                        <button
                          onClick={() => setShowTokenManager(false)}
                          className={`px-4 py-2 text-sm rounded ${themeClasses.button.ghost}`}
                        >
                          Close
                        </button>
                      </div>
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