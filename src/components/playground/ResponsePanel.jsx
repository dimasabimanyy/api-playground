'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Copy, Download, X, Check } from 'lucide-react'
import { useState } from 'react'
import CodeGenerationPanel from './CodeGenerationPanel'

export default function ResponsePanel({ response, loading, request }) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy: ', err)
    }
  }

  const downloadResponse = () => {
    if (!response?.data) return
    
    const dataStr = typeof response.data === 'string' 
      ? response.data 
      : JSON.stringify(response.data, null, 2)
    
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'response.json'
    link.click()
    URL.revokeObjectURL(url)
  }

  const getStatusColor = (status) => {
    if (status >= 200 && status < 300) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
    if (status >= 300 && status < 400) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
    if (status >= 400 && status < 500) return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
    if (status >= 500) return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
  }

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatResponseData = (data) => {
    if (typeof data === 'string') return data
    return JSON.stringify(data, null, 2)
  }

  const getContentType = () => {
    if (!response?.headers) return 'text'
    const contentType = response.headers['content-type'] || ''
    
    if (contentType.includes('application/json')) return 'json'
    if (contentType.includes('text/html')) return 'html'
    if (contentType.includes('application/xml') || contentType.includes('text/xml')) return 'xml'
    if (contentType.includes('text/css')) return 'css'
    if (contentType.includes('application/javascript') || contentType.includes('text/javascript')) return 'javascript'
    return 'text'
  }

  const formatContent = (data, type) => {
    if (typeof data === 'object') {
      return JSON.stringify(data, null, 2)
    }
    
    if (type === 'json') {
      try {
        const parsed = JSON.parse(data)
        return JSON.stringify(parsed, null, 2)
      } catch {
        return data
      }
    }
    
    return data
  }

  const renderFormattedContent = (data, type) => {
    const formattedData = formatContent(data, type)
    
    if (type === 'html') {
      return (
        <div className="space-y-4">
          <div className="border rounded p-4 bg-background">
            <h4 className="text-sm font-medium mb-2">Rendered HTML:</h4>
            <iframe
              srcDoc={formattedData}
              className="w-full h-64 border rounded"
              title="HTML Preview"
            />
          </div>
          <div>
            <h4 className="text-sm font-medium mb-2">HTML Source:</h4>
            <pre className="text-sm bg-muted p-4 rounded-lg overflow-auto max-h-64 whitespace-pre-wrap">
              {formattedData}
            </pre>
          </div>
        </div>
      )
    }
    
    return (
      <pre className="text-sm bg-muted p-4 rounded-lg overflow-auto max-h-96 whitespace-pre-wrap">
        {formattedData}
      </pre>
    )
  }

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-background to-muted/20 border-border/50 shadow-md">
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-2">
            <div className="h-6 w-6 bg-blue-500 rounded flex items-center justify-center">
              <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent"></div>
            </div>
            <CardTitle className="text-base">Sending...</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-500"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-4 w-4 bg-blue-500 rounded-full animate-pulse"></div>
              </div>
            </div>
            <div className="text-center space-y-2">
              <p className="text-sm font-medium">Sending your request...</p>
              <p className="text-xs text-muted-foreground">This usually takes just a moment</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!response) {
    return (
      <Card className="bg-gradient-to-br from-background to-muted/20 border-border/50 shadow-md">
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-2">
            <div className="h-6 w-6 bg-gray-400 rounded flex items-center justify-center">
              <div className="h-3 w-3 rounded-sm bg-white/80" />
            </div>
            <CardTitle className="text-base">Response</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-16 space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-full">
              <div className="w-8 h-8 border-2 border-dashed border-gray-400 rounded" />
            </div>
            <div className="space-y-2">
              <p className="text-lg font-medium text-muted-foreground">Ready to send</p>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                Configure your request and click the <strong>Send Request</strong> button to see the response here
              </p>
            </div>
            <div className="flex items-center justify-center space-x-2 text-xs text-muted-foreground">
              <div className="h-1.5 w-1.5 bg-blue-500 rounded-full" />
              <span>Tip: Try one of our templates to get started quickly</span>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (response.error) {
    return (
      <Card className="bg-gradient-to-br from-background to-red-50/20 dark:to-red-950/20 border-red-200 dark:border-red-800 shadow-md">
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-2">
            <div className="h-6 w-6 bg-red-500 rounded flex items-center justify-center">
              <X className="h-3 w-3 text-white" />
            </div>
            <CardTitle className="text-base text-red-600 dark:text-red-400">Failed</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 border border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-950/30">
              <p className="text-sm font-medium text-red-800 dark:text-red-200 mb-2">Error Details:</p>
              <p className="text-sm text-red-700 dark:text-red-300 font-mono">{response.error}</p>
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              <p><strong>Common solutions:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Check if the URL is correct and accessible</li>
                <li>Verify your internet connection</li>
                <li>Check for CORS issues (try with a CORS proxy)</li>
                <li>Ensure the API server is running</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gradient-to-br from-background to-green-50/20 dark:to-green-950/20 border-border/50 shadow-md hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="h-6 w-6 bg-green-500 rounded flex items-center justify-center">
              <Check className="h-3 w-3 text-white" />
            </div>
            <CardTitle className="text-base">Response</CardTitle>
          </div>
          
          <div className="flex items-center gap-2">
            {request && <CodeGenerationPanel request={request} />}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(formatResponseData(response.data))}
              className="hover:bg-blue-50 dark:hover:bg-blue-950/30"
            >
              <Copy className="h-4 w-4 mr-2" />
              {copied ? 'Copied!' : 'Copy'}
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={downloadResponse}
              className="hover:bg-green-50 dark:hover:bg-green-950/30"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </div>
        
        {/* Status and Stats */}
        <div className="flex items-center gap-3 mt-4">
          <Badge className={`${getStatusColor(response.status)} shadow-sm`}>
            {response.status} {response.statusText}
          </Badge>
          <Badge variant="outline" className="bg-muted/50">
            {getContentType().toUpperCase()}
          </Badge>
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <div className="h-2 w-2 bg-blue-500 rounded-full" />
              <span>{response.time}ms</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="h-2 w-2 bg-purple-500 rounded-full" />
              <span>{formatBytes(response.size || 0)}</span>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="body" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="body">Body</TabsTrigger>
            <TabsTrigger value="headers">
              Headers
              <Badge variant="secondary" className="ml-2">
                {Object.keys(response.headers || {}).length}
              </Badge>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="body">
            <div className="space-y-2">
              {renderFormattedContent(response.data, getContentType())}
            </div>
          </TabsContent>
          
          <TabsContent value="headers">
            <div className="space-y-2">
              {Object.entries(response.headers || {}).map(([key, value]) => (
                <div key={key} className="grid grid-cols-1 md:grid-cols-3 gap-2 p-2 border rounded">
                  <div className="font-mono text-sm font-medium">{key}</div>
                  <div className="md:col-span-2 font-mono text-sm text-muted-foreground break-all">
                    {value}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}