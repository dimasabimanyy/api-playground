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
      <div className="flex-1 bg-white h-full flex flex-col">
        <div className="px-4 py-3 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-orange-200 border-t-orange-500"></div>
            <h3 className="text-sm font-medium text-gray-900">Response</h3>
            <span className="text-xs text-gray-500">Sending request...</span>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-orange-200 border-t-orange-500 mx-auto"></div>
            <p className="text-sm text-gray-600">Waiting for response...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!response) {
    return (
      <div className="flex-1 bg-white h-full flex flex-col">
        <div className="px-4 py-3 border-b border-gray-200">
          <h3 className="text-sm font-medium text-gray-900">Response</h3>
        </div>
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-white border border-gray-200 rounded-lg flex items-center justify-center mx-auto">
              <div className="w-8 h-8 border-2 border-dashed border-gray-300 rounded" />
            </div>
            <div className="space-y-2">
              <h3 className="text-base font-medium text-gray-700">Enter the URL and click Send</h3>
              <p className="text-sm text-gray-500">
                The response will appear here
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (response.error) {
    return (
      <div className="flex-1 bg-white h-full flex flex-col">
        <div className="px-4 py-3 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <h3 className="text-sm font-medium text-gray-900">Response</h3>
            <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded font-mono">Error</span>
          </div>
        </div>
        <div className="flex-1 p-4">
          <div className="space-y-4">
            <div className="p-4 border border-red-200 rounded-lg bg-red-50">
              <div className="flex items-start space-x-3">
                <X className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-red-800 mb-1">Could not send request</h4>
                  <p className="text-sm text-red-700 font-mono">{response.error}</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-900">Possible causes:</h4>
              <ul className="space-y-1 text-sm text-gray-600 ml-4">
                <li>• Invalid URL or network connectivity issues</li>
                <li>• CORS policy blocking the request</li>
                <li>• Server is down or not responding</li>
                <li>• SSL/TLS certificate issues</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 bg-white h-full flex flex-col">
      {/* Response Header - Postman Style */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-medium text-gray-900">Response</h3>
              <span className={`text-xs font-mono px-2 py-1 rounded font-medium ${getStatusColor(response.status)}`}>
                {response.status} {response.statusText}
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <span className="font-medium">Time:</span>
                <span className="font-mono">{response.time}ms</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-medium">Size:</span>
                <span className="font-mono">{formatBytes(response.size || 0)}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {request && <CodeGenerationPanel request={request} />}
            <button
              onClick={() => copyToClipboard(formatResponseData(response.data))}
              className="h-8 text-xs px-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded border border-gray-300 transition-colors"
            >
              <Copy className="h-3 w-3 mr-1" />
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button 
              onClick={downloadResponse}
              className="h-8 text-xs px-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded border border-gray-300 transition-colors"
            >
              <Download className="h-3 w-3 mr-1" />
              Save
            </button>
          </div>
        </div>
      </div>
      
      {/* Response Content - Postman Style */}
      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="body" className="w-full h-full flex flex-col">
          <div className="border-b border-gray-200">
            <TabsList className="grid w-full grid-cols-3 h-10 bg-transparent p-0 border-b-0">
              <TabsTrigger value="body" className="text-sm data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-orange-500 data-[state=active]:text-orange-600 border-b-2 border-transparent rounded-none transition-all">
                Body
              </TabsTrigger>
              <TabsTrigger value="headers" className="text-sm data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-orange-500 data-[state=active]:text-orange-600 border-b-2 border-transparent rounded-none transition-all">
                Headers
                <span className="ml-1 text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                  {Object.keys(response.headers || {}).length}
                </span>
              </TabsTrigger>
              <TabsTrigger value="test" className="text-sm data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-orange-500 data-[state=active]:text-orange-600 border-b-2 border-transparent rounded-none transition-all">
                Test Results
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="body" className="flex-1 p-4 overflow-y-auto">
            <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
              <div className="px-3 py-2 bg-gray-100 border-b border-gray-200 flex items-center justify-between">
                <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                  {getContentType()}
                </span>
                <div className="flex items-center gap-2">
                  <button className="text-xs text-gray-500 hover:text-gray-700">Pretty</button>
                  <button className="text-xs text-gray-500 hover:text-gray-700">Raw</button>
                  <button className="text-xs text-gray-500 hover:text-gray-700">Preview</button>
                </div>
              </div>
              <div className="p-4 bg-white max-h-96 overflow-auto">
                {renderFormattedContent(response.data, getContentType())}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="headers" className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-0 border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                <div className="grid grid-cols-2 gap-4 text-xs font-medium text-gray-600 uppercase tracking-wide">
                  <div>Key</div>
                  <div>Value</div>
                </div>
              </div>
              <div className="divide-y divide-gray-200">
                {Object.entries(response.headers || {}).map(([key, value]) => (
                  <div key={key} className="grid grid-cols-2 gap-4 px-4 py-3 bg-white hover:bg-gray-50">
                    <div className="text-sm font-medium text-gray-900 font-mono break-all">{key}</div>
                    <div className="text-sm text-gray-600 font-mono break-all">{value}</div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="test" className="flex-1 p-4">
            <div className="text-center py-12 text-gray-500">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Check className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">No tests defined</h3>
              <p className="text-sm text-gray-500">
                You can write tests for this request in the Tests tab
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}