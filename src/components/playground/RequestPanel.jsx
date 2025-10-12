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
  copySuccess 
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Request
          <div className="flex items-center gap-2">
            <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" onClick={onShare}>
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
            <Button onClick={onExecute} disabled={loading || !request.url}>
              <Send className="h-4 w-4 mr-2" />
              {loading ? 'Sending...' : 'Send'}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Method and URL */}
        <div className="flex gap-2">
          <Select value={request.method} onValueChange={(value) => updateRequest('method', value)}>
            <SelectTrigger className="w-32">
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
          <Input
            placeholder="Enter URL..."
            value={request.url}
            onChange={(e) => updateRequest('url', e.target.value)}
            className="flex-1"
          />
        </div>

        {/* Tabs for Headers and Body */}
        <Tabs defaultValue="headers" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="headers">
              Headers {Object.keys(request.headers).length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {Object.keys(request.headers).length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="body">Body</TabsTrigger>
          </TabsList>
          
          <TabsContent value="headers" className="space-y-3">
            {/* Existing Headers */}
            <div className="space-y-2">
              {Object.entries(request.headers).map(([key, value]) => (
                <div key={key} className="flex items-center gap-2 p-2 border rounded">
                  <div className="flex-1 grid grid-cols-2 gap-2">
                    <Input value={key} disabled className="bg-muted" />
                    <Input value={value} disabled className="bg-muted" />
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeHeader(key)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            
            {/* Add New Header */}
            <div className="flex items-center gap-2 p-2 border rounded border-dashed">
              <Input
                placeholder="Header name"
                value={newHeaderKey}
                onChange={(e) => setNewHeaderKey(e.target.value)}
              />
              <Input
                placeholder="Header value"
                value={newHeaderValue}
                onChange={(e) => setNewHeaderValue(e.target.value)}
              />
              <Button variant="ghost" size="sm" onClick={addHeader}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="body">
            <Textarea
              placeholder="Request body (JSON, XML, text...)"
              value={request.body}
              onChange={(e) => updateRequest('body', e.target.value)}
              className="min-h-32 font-mono text-sm"
            />
            {request.body && (
              <div className="text-sm text-muted-foreground mt-2">
                Size: {new Blob([request.body]).size} bytes
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}