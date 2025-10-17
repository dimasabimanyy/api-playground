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
    <div className="flex-1 bg-white h-full flex flex-col">
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
              <DialogTrigger asChild>
                <button onClick={onShare} className="h-6 text-xs px-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded transition-colors">
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
          
          <TemplatesPanel onLoadTemplate={setRequest} />
        </div>
      </div>
      <div className="flex-1 px-4 py-4 space-y-4 overflow-y-auto">
        {/* Request Name */}
        {currentRequestName !== undefined && (
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-600">Request Name</label>
            <Input
              placeholder="Untitled request"
              value={currentRequestName}
              onChange={(e) => setCurrentRequestName?.(e.target.value)}
              className="h-7 text-sm border-gray-200 bg-white focus:border-gray-300 focus:ring-0"
            />
          </div>
        )}

        {/* Method and URL */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <div className="w-20">
              <Select value={request.method} onValueChange={(value) => updateRequest('method', value)}>
                <SelectTrigger className="h-7 text-xs border-gray-200 focus:border-gray-300 focus:ring-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-gray-200">
                  {HTTP_METHODS.map(method => (
                    <SelectItem key={method} value={method}>
                      <span className="font-mono text-xs">{method}</span>
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
                className="h-7 text-sm border-gray-200 bg-white focus:border-gray-300 focus:ring-0 font-mono"
              />
            </div>
            <button 
              onClick={onExecute} 
              disabled={loading || !request.url}
              className={`h-7 text-xs px-3 rounded transition-colors ${
                loading || !request.url 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-black hover:bg-gray-800 text-white'
              }`}
            >
              {loading ? 'Sending...' : 'Send'}
            </button>
          </div>
          {request.url.includes('{{') && (
            <div className="flex items-center space-x-2 text-xs text-amber-600 bg-amber-50 px-2 py-1.5 rounded border border-amber-100">
              <div className="h-1 w-1 bg-amber-500 rounded-full" />
              <span>Using environment variables</span>
            </div>
          )}
        </div>

        {/* Request Path/Name Display */}
        <div className="text-xs text-gray-500 font-mono">
          {currentRequestName || request.url || 'Untitled Request'}
        </div>

        {/* Tabs for Headers and Body */}
        <div className="space-y-3">
          <Tabs defaultValue="headers" className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-7 bg-gray-50 p-0.5">
              <TabsTrigger value="headers" className="text-xs data-[state=active]:bg-white data-[state=active]:shadow-none transition-all">
                Headers
                {Object.keys(request.headers).length > 0 && (
                  <span className="ml-1 text-xs text-gray-400">
                    {Object.keys(request.headers).length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="body" className="text-xs data-[state=active]:bg-white data-[state=active]:shadow-none transition-all">
                Body
                {request.body && (
                  <div className="ml-1 h-1 w-1 bg-green-500 rounded-full" />
                )}
              </TabsTrigger>
            </TabsList>
          
            <TabsContent value="headers" className="space-y-3 mt-3">
              {/* Add New Header */}
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Key"
                  value={newHeaderKey}
                  onChange={(e) => setNewHeaderKey(e.target.value)}
                  className="h-7 text-sm font-mono border-gray-200 bg-white focus:border-gray-300 focus:ring-0"
                />
                <Input
                  placeholder="Value"
                  value={newHeaderValue}
                  onChange={(e) => setNewHeaderValue(e.target.value)}
                  className="h-7 text-sm font-mono border-gray-200 bg-white focus:border-gray-300 focus:ring-0"
                />
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={addHeader}
                  className="h-7 px-2 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  disabled={!newHeaderKey || !newHeaderValue}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add
                </Button>
              </div>
              
              {/* Existing Headers */}
              {Object.keys(request.headers).length > 0 && (
                <div className="space-y-1.5">
                  {Object.entries(request.headers).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-2 py-1">
                      <div className="flex-1 grid grid-cols-2 gap-2">
                        <Input value={key} disabled className="h-7 bg-gray-50 border-gray-200 text-sm font-mono text-gray-600" />
                        <Input value={value} disabled className="h-7 bg-gray-50 border-gray-200 text-sm font-mono text-gray-600" />
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeHeader(key)}
                        className="h-7 w-7 p-0 text-gray-400 hover:text-red-500 hover:bg-red-50"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="body" className="space-y-3 mt-3">
              <div className="space-y-2">
                <Textarea
                  placeholder={`{\n  "key": "value"\n}`}
                  value={request.body}
                  onChange={(e) => updateRequest('body', e.target.value)}
                  className="min-h-28 font-mono text-sm border-gray-200 bg-white focus:border-gray-300 focus:ring-0 resize-none"
                />
                {request.body && (
                  <div className="text-xs text-gray-500">
                    {new Blob([request.body]).size} bytes
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}