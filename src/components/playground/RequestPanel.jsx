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
    <div className="flex-1 bg-white h-full flex flex-col border-r border-gray-200">
      {/* URL Bar Section - Postman Style */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-20">
            <Select value={request.method} onValueChange={(value) => updateRequest('method', value)}>
              <SelectTrigger className="h-9 text-sm border-gray-300 focus:border-orange-400 focus:ring-1 focus:ring-orange-100">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-gray-200">
                {HTTP_METHODS.map(method => (
                  <SelectItem key={method} value={method}>
                    <span className={`font-bold text-sm ${
                      method === 'GET' ? 'text-green-600' :
                      method === 'POST' ? 'text-orange-600' :
                      method === 'PUT' ? 'text-blue-600' :
                      method === 'PATCH' ? 'text-yellow-600' :
                      method === 'DELETE' ? 'text-red-600' :
                      'text-gray-600'
                    }`}>{method}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 relative">
            <Input
              placeholder="Enter request URL"
              value={request.url}
              onChange={(e) => updateRequest('url', e.target.value)}
              className="h-9 text-sm border-gray-300 bg-white focus:border-orange-400 focus:ring-1 focus:ring-orange-100 font-mono pr-20"
            />
          </div>
          <button 
            onClick={onExecute} 
            disabled={loading || !request.url}
            className={`h-9 text-sm px-6 rounded transition-colors font-medium ${
              loading || !request.url 
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
              : 'bg-orange-500 hover:bg-orange-600 text-white'
            }`}
          >
            {loading ? 'Sending...' : 'Send'}
          </button>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <TemplatesPanel onLoadTemplate={setRequest} />
          <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
            <DialogTrigger asChild>
              <button onClick={onShare} className="h-7 text-xs px-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors border border-gray-300">
                <Share2 className="h-3 w-3 mr-1" />
                Share
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-base font-medium">Share Request</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 pt-3">
                <p className="text-sm text-gray-600">
                  Copy this URL to share your request configuration.
                </p>
                <div className="flex gap-2">
                  <Input value={shareUrl} readOnly className="font-mono text-sm h-8 bg-gray-50 border-gray-200" />
                  <Button onClick={copyShareUrl} variant="outline" size="sm" className="px-3 text-xs">
                    {copySuccess ? 'Copied!' : 'Copy'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {/* Request Name */}
        {/* Query Params Quick Add */}
        <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
          <div className="text-xs text-gray-600">
            {request.url && new URL(request.url).searchParams.size > 0 && (
              <span>Query Params ({new URL(request.url).searchParams.size})</span>
            )}
          </div>
        </div>

        {/* Request Configuration Tabs - Postman Style */}
        <div>
          <Tabs defaultValue="headers" className="w-full">
            <div className="border-b border-gray-200">
              <TabsList className="grid w-full grid-cols-4 h-10 bg-transparent p-0 border-b-0">
                <TabsTrigger value="params" className="text-sm data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-orange-500 data-[state=active]:text-orange-600 border-b-2 border-transparent rounded-none transition-all">
                  Params
                </TabsTrigger>
                <TabsTrigger value="headers" className="text-sm data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-orange-500 data-[state=active]:text-orange-600 border-b-2 border-transparent rounded-none transition-all">
                  Headers
                  {Object.keys(request.headers).length > 0 && (
                    <span className="ml-1 text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                      {Object.keys(request.headers).length}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="body" className="text-sm data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-orange-500 data-[state=active]:text-orange-600 border-b-2 border-transparent rounded-none transition-all">
                  Body
                  {request.body && (
                    <div className="ml-1 h-2 w-2 bg-orange-500 rounded-full" />
                  )}
                </TabsTrigger>
                <TabsTrigger value="auth" className="text-sm data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-orange-500 data-[state=active]:text-orange-600 border-b-2 border-transparent rounded-none transition-all">
                  Authorization
                </TabsTrigger>
              </TabsList>
            </div>
          
            <TabsContent value="params" className="p-4">
              <div className="text-sm text-gray-600 mb-4">
                Query parameters are added to the end of the URL.
              </div>
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">No query parameters added yet</p>
              </div>
            </TabsContent>
            
            <TabsContent value="headers" className="p-4">
              <div className="space-y-4">
                {/* Headers Table Header */}
                <div className="grid grid-cols-12 gap-2 text-xs font-medium text-gray-600 pb-2 border-b border-gray-200">
                  <div className="col-span-5">Key</div>
                  <div className="col-span-6">Value</div>
                  <div className="col-span-1"></div>
                </div>
                
                {/* Add New Header */}
                <div className="grid grid-cols-12 gap-2">
                  <Input
                    placeholder="Key"
                    value={newHeaderKey}
                    onChange={(e) => setNewHeaderKey(e.target.value)}
                    className="col-span-5 h-8 text-sm border-gray-300 bg-white focus:border-orange-400 focus:ring-1 focus:ring-orange-100"
                  />
                  <Input
                    placeholder="Value"
                    value={newHeaderValue}
                    onChange={(e) => setNewHeaderValue(e.target.value)}
                    className="col-span-6 h-8 text-sm border-gray-300 bg-white focus:border-orange-400 focus:ring-1 focus:ring-orange-100"
                  />
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={addHeader}
                    className="col-span-1 h-8 w-8 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                    disabled={!newHeaderKey || !newHeaderValue}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                {/* Existing Headers */}
                {Object.entries(request.headers).map(([key, value]) => (
                  <div key={key} className="grid grid-cols-12 gap-2">
                    <Input value={key} disabled className="col-span-5 h-8 bg-gray-50 border-gray-300 text-sm text-gray-600" />
                    <Input value={value} disabled className="col-span-6 h-8 bg-gray-50 border-gray-300 text-sm text-gray-600" />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeHeader(key)}
                      className="col-span-1 h-8 w-8 p-0 text-gray-400 hover:text-red-500 hover:bg-red-50"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="body" className="p-4">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <label className="text-sm font-medium text-gray-700">Body type:</label>
                  <select className="border border-gray-300 rounded px-3 py-1 text-sm focus:border-orange-400 focus:ring-1 focus:ring-orange-100">
                    <option>raw</option>
                    <option>form-data</option>
                    <option>x-www-form-urlencoded</option>
                    <option>binary</option>
                  </select>
                  <select className="border border-gray-300 rounded px-3 py-1 text-sm focus:border-orange-400 focus:ring-1 focus:ring-orange-100">
                    <option>JSON</option>
                    <option>Text</option>
                    <option>XML</option>
                    <option>HTML</option>
                  </select>
                </div>
                <Textarea
                  placeholder={`{\n  "key": "value"\n}`}
                  value={request.body}
                  onChange={(e) => updateRequest('body', e.target.value)}
                  className="min-h-48 font-mono text-sm border-gray-300 bg-white focus:border-orange-400 focus:ring-1 focus:ring-orange-100 resize-none"
                />
                {request.body && (
                  <div className="text-xs text-gray-500">
                    {new Blob([request.body]).size} bytes
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="auth" className="p-4">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <label className="text-sm font-medium text-gray-700">Type:</label>
                  <select className="border border-gray-300 rounded px-3 py-1 text-sm focus:border-orange-400 focus:ring-1 focus:ring-orange-100">
                    <option>No Auth</option>
                    <option>API Key</option>
                    <option>Bearer Token</option>
                    <option>Basic Auth</option>
                    <option>OAuth 2.0</option>
                  </select>
                </div>
                <div className="text-center py-8 text-gray-500">
                  <p className="text-sm">This request does not use any authorization.</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}