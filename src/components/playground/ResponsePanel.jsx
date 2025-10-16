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
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="h-5 w-5 bg-green-500 rounded flex items-center justify-center">
              <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent"></div>
            </div>
            <h3 className="text-sm font-medium text-gray-900">Sending request...</h3>
          </div>
        </div>
        <div className="flex-1 px-6 py-8">
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-green-500"></div>
            <p className="text-sm text-gray-500">Please wait...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!response) {
    return (
      <div className="flex-1 border-l border-gray-200 bg-white h-full flex flex-col">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="h-5 w-5 bg-gray-400 rounded flex items-center justify-center">
              <div className="h-3 w-3 rounded bg-white/80" />
            </div>
            <h3 className="text-sm font-medium text-gray-900">Response</h3>
          </div>
        </div>
        <div className="flex-1 px-6 py-8">
          <div className="text-center py-16 space-y-4">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-lg">
              <div className="w-6 h-6 border-2 border-dashed border-gray-400 rounded" />
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-700">No response yet</h3>
              <p className="text-sm text-gray-500 max-w-sm mx-auto">
                Send a request to see the response here
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (response.error) {
    return (
      <div className="flex-1 border-l border-gray-200 bg-white h-full flex flex-col">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="h-5 w-5 bg-red-500 rounded flex items-center justify-center">
              <X className="h-3 w-3 text-white" />
            </div>
            <h3 className="text-sm font-medium text-gray-900">Request failed</h3>
          </div>
        </div>
        <div className="flex-1 px-6 py-4">
          <div className="space-y-4">
            <div className="p-4 border border-red-200 rounded-lg bg-red-50">
              <p className="text-sm text-red-800 font-mono">{response.error}</p>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-900">Troubleshooting</h4>
              <ul className="space-y-1 text-sm text-gray-600">
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
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-5 w-5 bg-green-500 rounded flex items-center justify-center">
              <Check className="h-3 w-3 text-white" />
            </div>
            <h3 className="text-sm font-medium text-gray-900">Response</h3>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>{response.time}ms</span>
              <span>•</span>
              <span>{formatBytes(response.size || 0)}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {request && <CodeGenerationPanel request={request} />}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(formatResponseData(response.data))}
              className="h-8 text-sm px-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <Copy className="h-4 w-4 mr-2" />
              {copied ? 'Copied!' : 'Copy'}
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={downloadResponse}
              className="h-8 text-sm px-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </div>
        
        {/* Status */}
        <div className="flex items-center gap-2 mt-3">
          <span className={`text-sm font-medium px-2 py-1 rounded ${getStatusColor(response.status)}`}>
            {response.status} {response.statusText}
          </span>
          <span className="text-sm text-gray-500 font-mono">
            {getContentType().toUpperCase()}
          </span>
        </div>
      </div>
      
      <div className="flex-1 px-6 py-4 overflow-y-auto">
        <Tabs defaultValue="body" className="w-full h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-2 h-8 bg-gray-100 p-0">
            <TabsTrigger value="body" className="text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-sm">Body</TabsTrigger>
            <TabsTrigger value="headers" className="text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-sm">
              Headers
              <span className="ml-2 text-xs text-gray-500">
                ({Object.keys(response.headers || {}).length})
              </span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="body" className="mt-4 flex-1">
            <div className="border border-gray-200 rounded-lg overflow-hidden h-full bg-gray-50">
              {renderFormattedContent(response.data, getContentType())}
            </div>
          </TabsContent>
          
          <TabsContent value="headers" className="mt-4 flex-1 overflow-y-auto">
            <div className="space-y-2">
              {Object.entries(response.headers || {}).map(([key, value]) => (
                <div key={key} className="py-2 border-b border-gray-100 last:border-b-0">
                  <div className="text-sm font-medium text-gray-900 font-mono">{key}</div>
                  <div className="text-sm text-gray-600 font-mono break-all mt-1">{value}</div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}