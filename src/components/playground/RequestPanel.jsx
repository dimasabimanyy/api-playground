'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
    <Card className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 shadow-sm">
      <CardHeader className="pb-4 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Send className="h-4 w-4 text-white" />
            </div>
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Request</CardTitle>
          </div>
          
          <div className="flex items-center gap-2">
            <TemplatesPanel onLoadTemplate={setRequest} />
            <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" onClick={onShare} className="border-blue-200 hover:bg-blue-50 dark:border-blue-800 dark:hover:bg-blue-950/30">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Share this request</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
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
            <Button 
              onClick={onExecute} 
              disabled={loading || !request.url}
              className={`${loading || !request.url 
                ? 'bg-muted text-muted-foreground' 
                : 'bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white shadow-md hover:shadow-lg'
              } transition-all duration-200`}
            >
              <Send className="h-4 w-4 mr-2" />
              {loading ? 'Sending...' : 'Send Request'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 p-6">
        {/* Request Name */}
        {currentRequestName !== undefined && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Request Name</label>
            <Input
              placeholder="e.g., Get User Profile, Create Post..."
              value={currentRequestName}
              onChange={(e) => setCurrentRequestName?.(e.target.value)}
              className="h-10 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400"
            />
          </div>
        )}

        {/* Method and URL */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Endpoint</label>
          <div className="flex gap-3">
            <Select value={request.method} onValueChange={(value) => updateRequest('method', value)}>
              <SelectTrigger className="w-32 h-10 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {HTTP_METHODS.map(method => (
                  <SelectItem key={method} value={method}>
                    <Badge variant="secondary" className={getMethodColor(method)}>
                      {method}
                    </Badge>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex-1 relative">
              <Input
                placeholder="https://api.example.com/endpoint"
                value={request.url}
                onChange={(e) => updateRequest('url', e.target.value)}
                className="h-10 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400 pr-16"
              />
              {request.url && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                </div>
              )}
              {!request.url && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  Required
                </div>
              )}
            </div>
          </div>
          {request.url.includes('{{') && (
            <div className="flex items-center space-x-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-3 py-2 rounded-md">
              <div className="h-1.5 w-1.5 bg-amber-500 rounded-full" />
              <span>Using environment variables - they'll be replaced when sending</span>
            </div>
          )}
        </div>

        {/* Tabs for Headers and Body */}
        <div className="space-y-4">
          <Tabs defaultValue="headers" className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-10 bg-gray-100 dark:bg-gray-800 p-1">
              <TabsTrigger value="headers" className="text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-900">
                Headers
                {Object.keys(request.headers).length > 0 && (
                  <Badge variant="secondary" className="ml-2 text-xs px-1.5 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                    {Object.keys(request.headers).length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="body" className="text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-900">
                Body
                {request.body && (
                  <div className="ml-2 h-2 w-2 bg-green-500 rounded-full" />
                )}
              </TabsTrigger>
            </TabsList>
          
            <TabsContent value="headers" className="space-y-4 mt-4">
              {/* Existing Headers */}
              {Object.keys(request.headers).length > 0 ? (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Request Headers</h4>
                  {Object.entries(request.headers).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                      <div className="flex-1 grid grid-cols-2 gap-3">
                        <Input value={key} disabled className="h-9 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-sm font-mono" />
                        <Input value={value} disabled className="h-9 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-sm font-mono" />
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeHeader(key)}
                        className="h-8 w-8 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 dark:hover:text-red-400"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
                    <Plus className="h-6 w-6" />
                  </div>
                  <h4 className="text-sm font-medium mb-1">No headers added yet</h4>
                  <p className="text-sm text-gray-400 dark:text-gray-500">Headers are useful for authentication and content type</p>
                </div>
              )}
              
              {/* Add New Header */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Add Header</h4>
                <div className="flex items-center gap-3 p-4 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg hover:border-gray-300 dark:hover:border-gray-600 transition-colors bg-gray-50/50 dark:bg-gray-800/30">
                  <Input
                    placeholder="Header name (e.g., Authorization)"
                    value={newHeaderKey}
                    onChange={(e) => setNewHeaderKey(e.target.value)}
                    className="h-9 text-sm font-mono border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
                  />
                  <Input
                    placeholder="Header value (e.g., Bearer token123)"
                    value={newHeaderValue}
                    onChange={(e) => setNewHeaderValue(e.target.value)}
                    className="h-9 text-sm font-mono border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
                  />
                  <Button 
                    variant="default" 
                    size="sm" 
                    onClick={addHeader}
                    className="h-9 px-4 bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={!newHeaderKey || !newHeaderValue}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="body" className="space-y-4 mt-4">
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Request Body</h4>
                {!request.body && (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
                      <div className="h-6 w-6 border-2 border-current rounded" />
                    </div>
                    <h4 className="text-sm font-medium mb-1">No request body</h4>
                    <p className="text-sm text-gray-400 dark:text-gray-500">Add JSON, XML, or plain text for POST/PUT requests</p>
                  </div>
                )}
                
                <div className="space-y-3">
                  <Textarea
                    placeholder={`{
  "name": "Example User",
  "email": "user@example.com",
  "role": "developer"
}`}
                    value={request.body}
                    onChange={(e) => updateRequest('body', e.target.value)}
                    className="min-h-32 font-mono text-sm border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400"
                  />
                  {request.body && (
                    <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700">
                      <span className="font-medium">Body size: {new Blob([request.body]).size} bytes</span>
                      <span className="text-xs">Content will be sent as-is</span>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  )
}