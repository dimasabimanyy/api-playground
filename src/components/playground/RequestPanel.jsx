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
    <div className="flex-1 bg-[#1a1a1a]/50 h-full flex flex-col border-r border-gray-800/50 backdrop-blur-xl">
      {/* URL Bar Section - Dark Premium */}
      <div className="p-6 border-b border-gray-800/50">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-24">
            <Select value={request.method} onValueChange={(value) => updateRequest('method', value)}>
              <SelectTrigger className="h-10 text-sm border-0 bg-gray-800/50 text-white focus:bg-gray-800/80 focus:ring-1 focus:ring-blue-500/50 rounded-lg backdrop-blur-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-gray-700 bg-gray-800 text-white">
                {HTTP_METHODS.map(method => (
                  <SelectItem key={method} value={method}>
                    <span className={`font-bold text-sm ${
                      method === 'GET' ? 'text-emerald-400' :
                      method === 'POST' ? 'text-blue-400' :
                      method === 'PUT' ? 'text-orange-400' :
                      method === 'PATCH' ? 'text-yellow-400' :
                      method === 'DELETE' ? 'text-red-400' :
                      'text-gray-400'
                    }`}>{method}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 relative">
            <Input
              placeholder="https://api.example.com/endpoint"
              value={request.url}
              onChange={(e) => updateRequest('url', e.target.value)}
              className="h-10 text-sm border-0 bg-gray-800/50 text-white placeholder-gray-400 focus:bg-gray-800/80 focus:ring-1 focus:ring-blue-500/50 rounded-lg font-mono transition-all backdrop-blur-sm"
            />
          </div>
          <button 
            onClick={onExecute} 
            disabled={loading || !request.url}
            className={`h-10 text-sm px-6 rounded-lg transition-all duration-200 font-medium shadow-lg ${
              loading || !request.url 
              ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
              : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white hover:shadow-blue-500/25 hover:scale-105'
            }`}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin h-4 w-4 border-2 border-blue-300 border-t-transparent rounded-full"></div>
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
              <button onClick={onShare} className="h-8 text-xs px-3 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-all duration-200 border border-gray-700/50">
                <Share2 className="h-3 w-3 mr-2" />
                Share
              </button>
            </DialogTrigger>
            <DialogContent className="bg-gray-800 border-gray-700 text-white sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-base font-medium text-white">Share Request</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 pt-3">
                <p className="text-sm text-gray-300">
                  Copy this URL to share your request configuration.
                </p>
                <div className="flex gap-2">
                  <Input value={shareUrl} readOnly className="font-mono text-sm h-8 bg-gray-700/50 border-gray-600 text-white" />
                  <Button onClick={copyShareUrl} variant="outline" size="sm" className="px-3 text-xs border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700">
                    {copySuccess ? 'Copied!' : 'Copy'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto bg-[#111]">
        {/* Request Configuration Tabs - Dark Premium */}
        <div>
          <Tabs defaultValue="headers" className="w-full">
            <div className="border-b border-gray-800/50 bg-[#1a1a1a]/30">
              <TabsList className="grid w-full grid-cols-4 h-12 bg-transparent p-0 border-b-0">
                <TabsTrigger value="params" className="text-sm data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:text-blue-400 border-b-2 border-transparent rounded-none transition-all text-gray-400 hover:text-white">
                  Params
                </TabsTrigger>
                <TabsTrigger value="headers" className="text-sm data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:text-blue-400 border-b-2 border-transparent rounded-none transition-all text-gray-400 hover:text-white">
                  Headers
                  {Object.keys(request.headers).length > 0 && (
                    <span className="ml-2 text-xs bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/30">
                      {Object.keys(request.headers).length}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="body" className="text-sm data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:text-blue-400 border-b-2 border-transparent rounded-none transition-all text-gray-400 hover:text-white">
                  Body
                  {request.body && (
                    <div className="ml-2 h-2 w-2 bg-blue-500 rounded-full" />
                  )}
                </TabsTrigger>
                <TabsTrigger value="auth" className="text-sm data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:text-blue-400 border-b-2 border-transparent rounded-none transition-all text-gray-400 hover:text-white">
                  Authorization
                </TabsTrigger>
              </TabsList>
            </div>
          
            <TabsContent value="params" className="p-6">
              <div className="text-sm text-gray-400 mb-6">
                Query parameters are appended to the request URL.
              </div>
              <div className="text-center py-12 text-gray-500">
                <div className="w-12 h-12 bg-gray-800/50 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Plus className="h-6 w-6 text-gray-400" />
                </div>
                <p className="text-sm mb-2">No query parameters yet</p>
                <p className="text-xs text-gray-600">Add parameters to customize your request</p>
              </div>
            </TabsContent>
            
            <TabsContent value="headers" className="p-6">
              <div className="space-y-6">
                {/* Headers Table Header */}
                <div className="grid grid-cols-12 gap-3 text-xs font-medium text-gray-400 pb-3 border-b border-gray-800/50">
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
                    className="col-span-5 h-9 text-sm border-0 bg-gray-800/50 text-white placeholder-gray-500 focus:bg-gray-800/80 focus:ring-1 focus:ring-blue-500/50 rounded-lg backdrop-blur-sm"
                  />
                  <Input
                    placeholder="application/json"
                    value={newHeaderValue}
                    onChange={(e) => setNewHeaderValue(e.target.value)}
                    className="col-span-6 h-9 text-sm border-0 bg-gray-800/50 text-white placeholder-gray-500 focus:bg-gray-800/80 focus:ring-1 focus:ring-blue-500/50 rounded-lg backdrop-blur-sm"
                  />
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={addHeader}
                    className="col-span-1 h-9 w-9 p-0 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-all duration-200"
                    disabled={!newHeaderKey || !newHeaderValue}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                {/* Existing Headers */}
                {Object.entries(request.headers).length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <div className="w-12 h-12 bg-gray-800/50 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Plus className="h-6 w-6 text-gray-400" />
                    </div>
                    <p className="text-sm mb-2">No headers added yet</p>
                    <p className="text-xs text-gray-600">Add custom headers to your request</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {Object.entries(request.headers).map(([key, value]) => (
                      <div key={key} className="grid grid-cols-12 gap-3 p-3 bg-gray-800/30 rounded-lg border border-gray-700/50">
                        <Input value={key} disabled className="col-span-5 h-8 bg-gray-700/50 border-0 text-sm text-gray-300" />
                        <Input value={value} disabled className="col-span-6 h-8 bg-gray-700/50 border-0 text-sm text-gray-300" />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeHeader(key)}
                          className="col-span-1 h-8 w-8 p-0 text-gray-400 hover:text-red-400 hover:bg-red-500/20 rounded transition-all duration-200"
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
                  <label className="text-sm font-medium text-gray-300">Body type:</label>
                  <select className="border-0 bg-gray-800/50 text-white rounded-lg px-3 py-2 text-sm focus:bg-gray-800/80 focus:ring-1 focus:ring-blue-500/50 backdrop-blur-sm">
                    <option value="raw">raw</option>
                    <option value="form-data">form-data</option>
                    <option value="x-www-form-urlencoded">x-www-form-urlencoded</option>
                    <option value="binary">binary</option>
                  </select>
                  <select className="border-0 bg-gray-800/50 text-white rounded-lg px-3 py-2 text-sm focus:bg-gray-800/80 focus:ring-1 focus:ring-blue-500/50 backdrop-blur-sm">
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
                    className="min-h-64 font-mono text-sm border-0 bg-gray-800/50 text-white placeholder-gray-500 focus:bg-gray-800/80 focus:ring-1 focus:ring-blue-500/50 rounded-lg resize-none backdrop-blur-sm"
                  />
                  {request.body && (
                    <div className="absolute bottom-3 right-3 text-xs text-gray-400 bg-gray-900/80 px-2 py-1 rounded backdrop-blur-sm">
                      {new Blob([request.body]).size} bytes
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="auth" className="p-6">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <label className="text-sm font-medium text-gray-300">Type:</label>
                  <select className="border-0 bg-gray-800/50 text-white rounded-lg px-3 py-2 text-sm focus:bg-gray-800/80 focus:ring-1 focus:ring-blue-500/50 backdrop-blur-sm">
                    <option value="none">No Auth</option>
                    <option value="api-key">API Key</option>
                    <option value="bearer">Bearer Token</option>
                    <option value="basic">Basic Auth</option>
                    <option value="oauth2">OAuth 2.0</option>
                  </select>
                </div>
                <div className="text-center py-12 text-gray-500">
                  <div className="w-12 h-12 bg-gray-800/50 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <div className="w-6 h-6 border-2 border-dashed border-gray-600 rounded" />
                  </div>
                  <p className="text-sm mb-2">No authorization configured</p>
                  <p className="text-xs text-gray-600">Select an auth type to configure credentials</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}