'use client'

// Removed Card components - using plain divs for seamless integration
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
    if (status >= 200 && status < 300) return 'bg-green-100 text-green-800'
    if (status >= 300 && status < 400) return 'bg-yellow-100 text-yellow-800'
    if (status >= 400 && status < 500) return 'bg-orange-100 text-orange-800'
    if (status >= 500) return 'bg-red-100 text-red-800'
    return 'bg-gray-100 text-gray-800'
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
            <pre className="text-xs bg-gray-50 text-gray-800 p-3 overflow-auto max-h-64 whitespace-pre-wrap font-mono">
              {formattedData}
            </pre>
          </div>
        </div>
      )
    }
    
    return (
      <pre className="text-xs bg-gray-50 text-gray-800 p-3 overflow-auto max-h-64 whitespace-pre-wrap font-mono">
        {formattedData}
      </pre>
    )
  }

  if (loading) {
    return (
      <div className="flex-1 border-l border-gray-200 bg-white h-full flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="h-6 w-6 bg-blue-500 rounded flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            </div>
            <h3 className="text-lg font-medium text-gray-900">Sending request</h3>
          </div>
        </div>
        <div className="flex-1 p-4">
          <div className="flex flex-col items-center justify-center py-16 space-y-6">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-blue-500"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-6 w-6 bg-blue-500 rounded-full animate-pulse"></div>
              </div>
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-lg font-medium text-gray-700">Sending request</h3>
              <p className="text-sm text-gray-500">Please wait...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!response) {
    return (
      <div className="flex-1 border-l border-gray-200 bg-white h-full flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="h-6 w-6 bg-gray-400 rounded flex items-center justify-center">
              <div className="h-4 w-4 rounded bg-white/80" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">Response</h3>
          </div>
        </div>
        <div className="flex-1 p-4">
          <div className="text-center py-20 space-y-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full">
              <div className="w-10 h-10 border-2 border-dashed border-gray-400 rounded" />
            </div>
            <div className="space-y-3">
              <h3 className="text-lg font-medium text-gray-700">Ready to send</h3>
              <p className="text-sm text-gray-500 max-w-md mx-auto">
                Configure your request and click <strong>Send</strong> to see the response
              </p>
            </div>
            <div className="text-sm text-gray-500 bg-blue-50 px-4 py-2 rounded-md inline-block">
              💡 Try templates to get started
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (response.error) {
    return (
      <div className="flex-1 border-l border-gray-200 bg-white h-full flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="h-6 w-6 bg-red-500 rounded flex items-center justify-center">
              <X className="h-4 w-4 text-white" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">Failed</h3>
          </div>
        </div>
        <div className="flex-1 p-4">
          <div className="space-y-6">
            <div className="p-4 border border-red-200 rounded-md bg-red-50">
              <h4 className="text-sm font-medium text-red-800 mb-3">Error Details</h4>
              <p className="text-sm text-red-700 font-mono bg-red-100 p-3 rounded-md">{response.error}</p>
            </div>
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700">Common Solutions</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Check if the URL is correct and accessible</li>
                <li>• Verify your internet connection</li>
                <li>• Check for CORS issues</li>
                <li>• Ensure the API server is running</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 border-l border-gray-200 bg-white h-full flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Response</h3>
          
          <div className="flex items-center gap-2">
            {request && <CodeGenerationPanel request={request} />}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(formatResponseData(response.data))}
              className="h-8 text-sm px-3 hover:bg-gray-50"
            >
              <Copy className="h-4 w-4 mr-2" />
              {copied ? 'Copied!' : 'Copy'}
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={downloadResponse}
              className="h-8 text-sm px-3 hover:bg-gray-50"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </div>
        
        {/* Status and Stats */}
        <div className="flex items-center gap-3">
          <Badge className={`${getStatusColor(response.status)} text-sm font-medium px-2 py-1`}>
            {response.status} {response.statusText}
          </Badge>
          <Badge variant="outline" className="text-sm bg-gray-50 border-gray-200 font-mono px-2 py-1">
            {getContentType().toUpperCase()}
          </Badge>
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span>{response.time}ms</span>
            <span>{formatBytes(response.size || 0)}</span>
          </div>
        </div>
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto">
        <Tabs defaultValue="body" className="w-full h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-2 h-9 bg-gray-50 p-1">
            <TabsTrigger value="body" className="text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm">Body</TabsTrigger>
            <TabsTrigger value="headers" className="text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm">
              Headers
              <Badge variant="secondary" className="ml-2 text-xs px-1.5 py-0.5 bg-blue-100 text-blue-700">
                {Object.keys(response.headers || {}).length}
              </Badge>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="body" className="mt-3 flex-1">
            <div className="border border-gray-200 rounded-md overflow-hidden h-full">
              {renderFormattedContent(response.data, getContentType())}
            </div>
          </TabsContent>
          
          <TabsContent value="headers" className="mt-3 flex-1 overflow-y-auto">
            <div className="space-y-2">
              {Object.entries(response.headers || {}).map(([key, value]) => (
                <div key={key} className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 border border-gray-200 rounded-md bg-gray-50">
                  <div className="font-mono text-sm font-medium text-gray-700">{key}</div>
                  <div className="md:col-span-2 font-mono text-sm text-gray-600 break-all">
                    {value}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}