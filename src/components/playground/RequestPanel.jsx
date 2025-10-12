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
    <Card className="bg-gradient-to-br from-background to-muted/20 border-border/50 shadow-md hover:shadow-lg transition-shadow">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
              <Send className="h-4 w-4 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">Configure Request</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">Set up your API call</p>
            </div>
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
      <CardContent className="space-y-6">
        {/* Request Name */}
        {currentRequestName !== undefined && (
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 bg-purple-500 rounded-full" />
              <label className="text-sm font-medium text-foreground">
                Request Name
              </label>
            </div>
            <Input
              placeholder="e.g., Get User Profile, Create Post..."
              value={currentRequestName}
              onChange={(e) => setCurrentRequestName?.(e.target.value)}
              className="border-border/50 hover:border-border focus:border-purple-500 transition-colors"
            />
          </div>
        )}

        {/* Method and URL */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 bg-blue-500 rounded-full" />
            <label className="text-sm font-medium text-foreground">
              Endpoint Configuration
            </label>
          </div>
          <div className="flex gap-3">
            <Select value={request.method} onValueChange={(value) => updateRequest('method', value)}>
              <SelectTrigger className="w-32 border-border/50 hover:border-border focus:border-blue-500 transition-colors">
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
                className="border-border/50 hover:border-border focus:border-blue-500 transition-colors pr-16"
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
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 bg-purple-500 rounded-full" />
            <label className="text-sm font-medium text-foreground">
              Request Details
            </label>
          </div>
          <Tabs defaultValue="headers" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-muted/50 p-1">
              <TabsTrigger value="headers" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <div className="flex items-center space-x-2">
                  <span>Headers</span>
                  {Object.keys(request.headers).length > 0 && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                      {Object.keys(request.headers).length}
                    </Badge>
                  )}
                </div>
              </TabsTrigger>
              <TabsTrigger value="body" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <div className="flex items-center space-x-2">
                  <span>Body</span>
                  {request.body && (
                    <div className="h-2 w-2 bg-green-500 rounded-full" />
                  )}
                </div>
              </TabsTrigger>
            </TabsList>
          
          <TabsContent value="headers" className="space-y-4">
            {/* Existing Headers */}
            {Object.keys(request.headers).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(request.headers).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-3 p-3 border border-border/50 rounded-lg bg-muted/20">
                    <div className="flex-1 grid grid-cols-2 gap-3">
                      <Input value={key} disabled className="bg-muted/50 border-0" />
                      <Input value={value} disabled className="bg-muted/50 border-0" />
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeHeader(key)}
                      className="hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-muted/30 rounded-full mb-3">
                  <Plus className="h-6 w-6" />
                </div>
                <p className="text-sm">No headers added yet</p>
                <p className="text-xs">Headers are optional but useful for authentication and content type</p>
              </div>
            )}
            
            {/* Add New Header */}
            <div className="flex items-center gap-3 p-3 border-2 border-dashed border-border/50 rounded-lg hover:border-border/80 transition-colors bg-muted/10">
              <Input
                placeholder="Header name (e.g., Authorization)"
                value={newHeaderKey}
                onChange={(e) => setNewHeaderKey(e.target.value)}
                className="border-border/50 focus:border-blue-500"
              />
              <Input
                placeholder="Header value (e.g., Bearer token123)"
                value={newHeaderValue}
                onChange={(e) => setNewHeaderValue(e.target.value)}
                className="border-border/50 focus:border-blue-500"
              />
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={addHeader}
                className="hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-950/30"
                disabled={!newHeaderKey || !newHeaderValue}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="body" className="space-y-4">
            {!request.body ? (
              <div className="text-center py-8 text-muted-foreground">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-muted/30 rounded-full mb-3">
                  <div className="h-6 w-6 border border-current rounded" />
                </div>
                <p className="text-sm">No request body</p>
                <p className="text-xs">Add a body for POST, PUT, or PATCH requests</p>
              </div>
            ) : null}
            
            <div className="space-y-3">
              <Textarea
                placeholder={`{
  "name": "Example",
  "email": "user@example.com"
}`}
                value={request.body}
                onChange={(e) => updateRequest('body', e.target.value)}
                className="min-h-32 font-mono text-sm border-border/50 focus:border-blue-500 transition-colors"
              />
              {request.body && (
                <div className="flex items-center justify-between text-xs text-muted-foreground bg-muted/30 px-3 py-2 rounded-md">
                  <span>Body size: {new Blob([request.body]).size} bytes</span>
                  <span>Content will be sent as-is</span>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
        </div>
      </CardContent>
    </Card>
  )
}