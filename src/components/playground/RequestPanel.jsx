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

  return (
    <div className="flex-1 bg-white h-full flex flex-col">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TemplatesPanel onLoadTemplate={setRequest} />
            <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" onClick={onShare} className="h-8 text-sm text-gray-600 hover:text-gray-900">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Share this request</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Copy this URL to share your API request configuration with others.
                  </p>
                  <div className="flex gap-2">
                    <Input value={shareUrl} readOnly className="font-mono text-sm" />
                    <Button onClick={copyShareUrl} variant="outline">
                      <Copy className="h-4 w-4 mr-2" />
                      {copySuccess ? 'Copied!' : 'Copy'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          
          <Button 
            onClick={onExecute} 
            disabled={loading || !request.url}
            className={`h-8 text-sm px-4 ${
              loading || !request.url 
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
              : 'bg-green-600 hover:bg-green-700 text-white'
            } transition-colors`}
          >
            <Send className="h-4 w-4 mr-2" />
            {loading ? 'Sending...' : 'Send'}
          </Button>
        </div>
      </div>
      <div className="flex-1 px-6 py-4 space-y-6 overflow-y-auto">
        {/* Request Name */}
        {currentRequestName !== undefined && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900">Request Name</label>
            <Input
              placeholder="Untitled request"
              value={currentRequestName}
              onChange={(e) => setCurrentRequestName?.(e.target.value)}
              className="h-8 text-sm border-gray-300 bg-white focus:border-green-500 focus:ring-0"
            />
          </div>
        )}

        {/* Method and URL */}
        <div className="space-y-3">
          <div className="flex gap-2">
            <Select value={request.method} onValueChange={(value) => updateRequest('method', value)}>
              <SelectTrigger className="w-24 h-8 text-sm border-gray-300 focus:border-green-500 focus:ring-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {HTTP_METHODS.map(method => (
                  <SelectItem key={method} value={method}>
                    <span className="font-mono text-sm">{method}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex-1 relative">
              <Input
                placeholder="https://api.example.com/endpoint"
                value={request.url}
                onChange={(e) => updateRequest('url', e.target.value)}
                className="h-8 text-sm border-gray-300 bg-white focus:border-green-500 focus:ring-0 font-mono"
              />
            </div>
          </div>
          {request.url.includes('{{') && (
            <div className="flex items-center space-x-2 text-sm text-amber-700 bg-amber-50 px-3 py-2 rounded border border-amber-200">
              <div className="h-1.5 w-1.5 bg-amber-500 rounded-full" />
              <span>Using environment variables</span>
            </div>
          )}
        </div>

        {/* Tabs for Headers and Body */}
        <div className="space-y-4">
          <Tabs defaultValue="headers" className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-8 bg-gray-100 p-0">
              <TabsTrigger value="headers" className="text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-sm">
                Headers
                {Object.keys(request.headers).length > 0 && (
                  <span className="ml-2 text-xs text-gray-500">
                    ({Object.keys(request.headers).length})
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="body" className="text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-sm">
                Body
                {request.body && (
                  <div className="ml-2 h-1.5 w-1.5 bg-green-500 rounded-full" />
                )}
              </TabsTrigger>
            </TabsList>
          
            <TabsContent value="headers" className="space-y-4 mt-4">
              {/* Add New Header */}
              <div className="flex items-center gap-3">
                <Input
                  placeholder="Key"
                  value={newHeaderKey}
                  onChange={(e) => setNewHeaderKey(e.target.value)}
                  className="h-8 text-sm font-mono border-gray-300 bg-white focus:border-green-500 focus:ring-0"
                />
                <Input
                  placeholder="Value"
                  value={newHeaderValue}
                  onChange={(e) => setNewHeaderValue(e.target.value)}
                  className="h-8 text-sm font-mono border-gray-300 bg-white focus:border-green-500 focus:ring-0"
                />
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={addHeader}
                  className="h-8 px-3 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  disabled={!newHeaderKey || !newHeaderValue}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
              
              {/* Existing Headers */}
              {Object.keys(request.headers).length > 0 && (
                <div className="space-y-2">
                  {Object.entries(request.headers).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-3 py-2">
                      <div className="flex-1 grid grid-cols-2 gap-3">
                        <Input value={key} disabled className="h-8 bg-gray-50 border-gray-200 text-sm font-mono text-gray-600" />
                        <Input value={value} disabled className="h-8 bg-gray-50 border-gray-200 text-sm font-mono text-gray-600" />
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeHeader(key)}
                        className="h-8 w-8 p-0 text-gray-400 hover:text-red-500 hover:bg-red-50"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="body" className="space-y-4 mt-4">
              <div className="space-y-3">
                <Textarea
                  placeholder={`{\n  "key": "value"\n}`}
                  value={request.body}
                  onChange={(e) => updateRequest('body', e.target.value)}
                  className="min-h-32 font-mono text-sm border-gray-300 bg-white focus:border-green-500 focus:ring-0 resize-none"
                />
                {request.body && (
                  <div className="text-sm text-gray-500">
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