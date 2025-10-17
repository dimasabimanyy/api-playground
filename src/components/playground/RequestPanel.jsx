'use client'

import { useState } from 'react'
// Removed Card components - using plain divs for seamless integration
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Send, Plus, X, Share2, Copy } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import { getThemeClasses, getMethodColors } from '@/lib/theme'
import TemplatesPanel from './TemplatesPanel'

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']

export default function RequestPanel({ 
  request, 
  setRequest, 
  onExecute, 
  loading, 
  onShare, 
  shareUrl, 
  shareDialogOpen, 
  setShareDialogOpen, 
  copyShareUrl, 
  copySuccess,
  currentRequestName,
  setCurrentRequestName
}) {
  const { theme, isDark } = useTheme()
  const themeClasses = getThemeClasses(isDark)
  const [newHeaderKey, setNewHeaderKey] = useState('')
  const [newHeaderValue, setNewHeaderValue] = useState('')

  const updateRequest = (field, value) => {
    setRequest(prev => ({ ...prev, [field]: value }))
  }

  const addHeader = () => {
    if (newHeaderKey && newHeaderValue) {
      updateRequest('headers', {
        ...request.headers,
        [newHeaderKey]: newHeaderValue
      })
      setNewHeaderKey('')
      setNewHeaderValue('')
    }
  }

  const removeHeader = (key) => {
    const { [key]: removed, ...rest } = request.headers
    updateRequest('headers', rest)
  }

  const getMethodColor = (method) => {
    const colors = {
      GET: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      POST: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      PUT: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      PATCH: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      DELETE: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    }
    return colors[method] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
  }

  const getMethodBorderColor = (method) => {
    const colors = {
      GET: 'border-green-500',
      POST: 'border-blue-500', 
      PUT: 'border-orange-500',
      PATCH: 'border-yellow-500',
      DELETE: 'border-red-500',
    }
    return colors[method] || 'border-gray-300'
  }

  return (
    <div className={`flex-1 h-full flex flex-col border-r transition-all duration-300 ${themeClasses.border.primary} ${themeClasses.bg.glass}`}>
      {/* URL Bar Section - Theme Aware */}
      <div className={`p-6 border-b ${themeClasses.border.primary}`}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-24">
            <Select value={request.method} onValueChange={(value) => updateRequest('method', value)}>
              <SelectTrigger className={`h-10 text-sm rounded-lg transition-all backdrop-blur-sm ${themeClasses.input.base}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className={`${isDark ? 'border-gray-700 bg-gray-800 text-white' : 'border-gray-200 bg-white text-gray-900'}`}>
                {HTTP_METHODS.map(method => {
                  const methodColors = getMethodColors(method, isDark)
                  return (
                    <SelectItem key={method} value={method}>
                      <span className={`font-bold text-sm ${methodColors.text}`}>{method}</span>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 relative">
            <Input
              placeholder="https://api.example.com/endpoint"
              value={request.url}
              onChange={(e) => updateRequest('url', e.target.value)}
              className={`h-10 text-sm rounded-lg font-mono transition-all backdrop-blur-sm ${themeClasses.input.base}`}
            />
          </div>
          <button 
            onClick={onExecute} 
            disabled={loading || !request.url}
            className={`h-10 text-sm px-6 rounded-lg transition-all duration-200 font-medium shadow-lg ${
              loading || !request.url 
              ? `${isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-500'} cursor-not-allowed` 
              : themeClasses.button.primary + ' hover:scale-105'
            }`}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className={`animate-spin h-4 w-4 border-2 ${isDark ? 'border-blue-300 border-t-transparent' : 'border-blue-400 border-t-transparent'} rounded-full`}></div>
                Sending...
              </div>
            ) : 'Send'}
          </button>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <TemplatesPanel onLoadTemplate={setRequest} />
          <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
            <DialogTrigger asChild>
              <button onClick={onShare} className={`h-8 text-xs px-3 rounded-lg transition-all duration-200 ${themeClasses.button.secondary}`}>
                <Share2 className="h-3 w-3 mr-2" />
                Share
              </button>
            </DialogTrigger>
            <DialogContent className={`sm:max-w-md ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
              <DialogHeader>
                <DialogTitle className={`text-base font-medium ${themeClasses.text.primary}`}>Share Request</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 pt-3">
                <p className={`text-sm ${themeClasses.text.secondary}`}>
                  Copy this URL to share your request configuration.
                </p>
                <div className="flex gap-2">
                  <Input value={shareUrl} readOnly className={`font-mono text-sm h-8 ${themeClasses.input.disabled}`} />
                  <Button onClick={copyShareUrl} variant="outline" size="sm" className={`px-3 text-xs ${themeClasses.button.secondary}`}>
                    {copySuccess ? 'Copied!' : 'Copy'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {/* Onboarding Section - Shows when no URL is entered */}
      {!request.url && (
        <div className={`p-6 border-b ${themeClasses.border.primary}`}>
          <div className="text-center space-y-6">
            <div className="space-y-3">
              <h3 className={`text-lg font-semibold ${themeClasses.text.primary}`}>
                Welcome to API Playground
              </h3>
              <p className={`text-sm ${themeClasses.text.secondary} max-w-md mx-auto`}>
                Get started by entering an API endpoint above. Try one of these popular APIs to test:
              </p>
            </div>
            
            {/* Quick Start Examples */}
            <div className="grid grid-cols-1 gap-3 max-w-md mx-auto">
              <button
                onClick={() => updateRequest('url', 'https://jsonplaceholder.typicode.com/posts/1')}
                className={`flex items-center gap-3 p-4 text-left rounded-lg transition-all duration-200 ${isDark ? 'bg-gray-800/50 hover:bg-gray-800 border border-gray-700/50' : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'}`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-600'}`}>
                  <span className="text-xs font-bold">JSON</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-medium ${themeClasses.text.primary}`}>JSONPlaceholder</div>
                  <div className={`text-xs ${themeClasses.text.tertiary} truncate`}>Free fake API for testing</div>
                </div>
              </button>
              
              <button
                onClick={() => updateRequest('url', 'https://httpbin.org/get')}
                className={`flex items-center gap-3 p-4 text-left rounded-lg transition-all duration-200 ${isDark ? 'bg-gray-800/50 hover:bg-gray-800 border border-gray-700/50' : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'}`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>
                  <span className="text-xs font-bold">HTTP</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-medium ${themeClasses.text.primary}`}>HTTPBin</div>
                  <div className={`text-xs ${themeClasses.text.tertiary} truncate`}>HTTP request & response service</div>
                </div>
              </button>
              
              <button
                onClick={() => updateRequest('url', 'https://api.github.com/repos/microsoft/vscode')}
                className={`flex items-center gap-3 p-4 text-left rounded-lg transition-all duration-200 ${isDark ? 'bg-gray-800/50 hover:bg-gray-800 border border-gray-700/50' : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'}`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDark ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-600'}`}>
                  <span className="text-xs font-bold">API</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-medium ${themeClasses.text.primary}`}>GitHub API</div>
                  <div className={`text-xs ${themeClasses.text.tertiary} truncate`}>Repository information</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className={`flex-1 overflow-y-auto transition-colors duration-300 ${themeClasses.bg.primary}`}>
        {/* Request Configuration Tabs - Theme Aware */}
        <div>
          <Tabs defaultValue="headers" className="w-full">
            <div className={`border-b ${themeClasses.border.primary} ${themeClasses.bg.secondary}`}>
              <TabsList className="grid w-full grid-cols-4 h-12 bg-transparent p-0 border-b-0">
                <TabsTrigger value="params" className={`text-sm data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:${themeClasses.border.accent.replace('border-', 'border-b-')} data-[state=active]:${themeClasses.text.accent} border-b-2 border-transparent rounded-none transition-all ${themeClasses.tab.inactive}`}>
                  Params
                </TabsTrigger>
                <TabsTrigger value="headers" className={`text-sm data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:${themeClasses.border.accent.replace('border-', 'border-b-')} data-[state=active]:${themeClasses.text.accent} border-b-2 border-transparent rounded-none transition-all ${themeClasses.tab.inactive}`}>
                  Headers
                  {Object.keys(request.headers).length > 0 && (
                    <span className={`ml-2 text-xs px-1.5 py-0.5 rounded border ${themeClasses.status.info}`}>
                      {Object.keys(request.headers).length}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="body" className={`text-sm data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:${themeClasses.border.accent.replace('border-', 'border-b-')} data-[state=active]:${themeClasses.text.accent} border-b-2 border-transparent rounded-none transition-all ${themeClasses.tab.inactive}`}>
                  Body
                  {request.body && (
                    <div className={`ml-2 h-2 w-2 rounded-full ${isDark ? 'bg-blue-500' : 'bg-blue-600'}`} />
                  )}
                </TabsTrigger>
                <TabsTrigger value="auth" className={`text-sm data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:${themeClasses.border.accent.replace('border-', 'border-b-')} data-[state=active]:${themeClasses.text.accent} border-b-2 border-transparent rounded-none transition-all ${themeClasses.tab.inactive}`}>
                  Authorization
                </TabsTrigger>
              </TabsList>
            </div>
          
            <TabsContent value="params" className="p-6">
              <div className={`text-sm mb-6 ${themeClasses.text.secondary}`}>
                Query parameters are appended to the request URL.
              </div>
              <div className={`text-center py-12 ${themeClasses.text.tertiary}`}>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4 ${themeClasses.card.base}`}>
                  <Plus className={`h-6 w-6 ${themeClasses.text.tertiary}`} />
                </div>
                <p className={`text-sm mb-2 ${themeClasses.text.primary}`}>No query parameters yet</p>
                <p className={`text-xs ${themeClasses.text.tertiary}`}>Add parameters to customize your request</p>
              </div>
            </TabsContent>
            
            <TabsContent value="headers" className="p-6">
              <div className="space-y-6">
                {/* Headers Table Header */}
                <div className={`grid grid-cols-12 gap-3 text-xs font-medium pb-3 border-b ${themeClasses.text.tertiary} ${themeClasses.border.primary}`}>
                  <div className="col-span-5">Key</div>
                  <div className="col-span-6">Value</div>
                  <div className="col-span-1"></div>
                </div>
                
                {/* Add New Header */}
                <div className="grid grid-cols-12 gap-3">
                  <Input
                    placeholder="Content-Type"
                    value={newHeaderKey}
                    onChange={(e) => setNewHeaderKey(e.target.value)}
                    className={`col-span-5 h-9 text-sm rounded-lg transition-all backdrop-blur-sm ${themeClasses.input.base}`}
                  />
                  <Input
                    placeholder="application/json"
                    value={newHeaderValue}
                    onChange={(e) => setNewHeaderValue(e.target.value)}
                    className={`col-span-6 h-9 text-sm rounded-lg transition-all backdrop-blur-sm ${themeClasses.input.base}`}
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
                {Object.entries(request.headers).length === 0 ? (
                  <div className={`text-center py-12 ${themeClasses.text.tertiary}`}>
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4 ${themeClasses.card.base}`}>
                      <Plus className={`h-6 w-6 ${themeClasses.text.tertiary}`} />
                    </div>
                    <p className={`text-sm mb-2 ${themeClasses.text.primary}`}>No headers added yet</p>
                    <p className={`text-xs ${themeClasses.text.tertiary}`}>Add custom headers to your request</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {Object.entries(request.headers).map(([key, value]) => (
                      <div key={key} className={`grid grid-cols-12 gap-3 p-3 rounded-lg ${themeClasses.card.base}`}>
                        <Input value={key} disabled className={`col-span-5 h-8 text-sm ${themeClasses.input.disabled}`} />
                        <Input value={value} disabled className={`col-span-6 h-8 text-sm ${themeClasses.input.disabled}`} />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeHeader(key)}
                          className={`col-span-1 h-8 w-8 p-0 rounded transition-all duration-200 ${themeClasses.text.tertiary} hover:text-red-400 ${isDark ? 'hover:bg-red-500/20' : 'hover:bg-red-100'}`}
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
                  <label className={`text-sm font-medium ${themeClasses.text.secondary}`}>Body type:</label>
                  <select className={`rounded-lg px-3 py-2 text-sm transition-all backdrop-blur-sm ${themeClasses.input.base}`}>
                    <option value="raw">raw</option>
                    <option value="form-data">form-data</option>
                    <option value="x-www-form-urlencoded">x-www-form-urlencoded</option>
                    <option value="binary">binary</option>
                  </select>
                  <select className={`rounded-lg px-3 py-2 text-sm transition-all backdrop-blur-sm ${themeClasses.input.base}`}>
                    <option value="json">JSON</option>
                    <option value="text">Text</option>
                    <option value="xml">XML</option>
                    <option value="html">HTML</option>
                  </select>
                </div>
                <div className="relative">
                  <Textarea
                    placeholder={`{\n  "name": "John Doe",\n  "email": "john@example.com"\n}`}
                    value={request.body}
                    onChange={(e) => updateRequest('body', e.target.value)}
                    className={`min-h-64 font-mono text-sm rounded-lg resize-none transition-all backdrop-blur-sm ${themeClasses.input.base}`}
                  />
                  {request.body && (
                    <div className={`absolute bottom-3 right-3 text-xs px-2 py-1 rounded backdrop-blur-sm ${isDark ? 'text-gray-400 bg-gray-900/80' : 'text-gray-600 bg-white/80'}`}>
                      {new Blob([request.body]).size} bytes
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="auth" className="p-6">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <label className={`text-sm font-medium ${themeClasses.text.secondary}`}>Type:</label>
                  <select className={`rounded-lg px-3 py-2 text-sm transition-all backdrop-blur-sm ${themeClasses.input.base}`}>
                    <option value="none">No Auth</option>
                    <option value="api-key">API Key</option>
                    <option value="bearer">Bearer Token</option>
                    <option value="basic">Basic Auth</option>
                    <option value="oauth2">OAuth 2.0</option>
                  </select>
                </div>
                <div className={`text-center py-12 ${themeClasses.text.tertiary}`}>
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4 ${themeClasses.card.base}`}>
                    <div className={`w-6 h-6 border-2 border-dashed rounded ${isDark ? 'border-gray-600' : 'border-gray-400'}`} />
                  </div>
                  <p className={`text-sm mb-2 ${themeClasses.text.primary}`}>No authorization configured</p>
                  <p className={`text-xs ${themeClasses.text.tertiary}`}>Select an auth type to configure credentials</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}