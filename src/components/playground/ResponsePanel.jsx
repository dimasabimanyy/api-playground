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
        <div className="px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50">
          <div className="flex items-center space-x-4">
            <div className="h-10 w-10 bg-green-500 rounded-xl flex items-center justify-center shadow-lg">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900">Sending Request</h3>
              <p className="text-sm text-gray-600">Processing your API call...</p>
            </div>
          </div>
        </div>
        <div className="flex-1 px-8 py-12">
          <div className="flex flex-col items-center justify-center py-16 space-y-6">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-green-500"></div>
              <div className="absolute inset-0 animate-pulse rounded-full h-12 w-12 border-4 border-green-100"></div>
            </div>
            <div className="text-center space-y-2">
              <p className="text-sm font-medium text-gray-700">Executing request...</p>
              <p className="text-xs text-gray-500">This may take a few seconds</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!response) {
    return (
      <div className="flex-1 border-l border-gray-200 bg-white h-full flex flex-col">
        <div className="px-8 py-6 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center space-x-4">
            <div className="h-10 w-10 bg-gray-400 rounded-xl flex items-center justify-center shadow-sm">
              <div className="h-5 w-5 rounded-lg bg-white/90" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900">Response</h3>
              <p className="text-sm text-gray-500">Waiting for request...</p>
            </div>
          </div>
        </div>
        <div className="flex-1 px-8 py-12">
          <div className="text-center py-20 space-y-8">
            <div className="relative inline-flex items-center justify-center">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center shadow-sm">
                <div className="w-10 h-10 border-2 border-dashed border-gray-400 rounded-xl" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              </div>
            </div>
            <div className="space-y-3 max-w-md mx-auto">
              <h3 className="text-lg font-semibold text-gray-800">Ready to Send</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Configure your request and click <span className="font-medium text-green-600">Send</span> to see the API response here with syntax highlighting and structured data.
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
        <div className="px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-red-50 to-orange-50">
          <div className="flex items-center space-x-4">
            <div className="h-10 w-10 bg-red-500 rounded-xl flex items-center justify-center shadow-lg">
              <X className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900">Request Failed</h3>
              <p className="text-sm text-gray-600">Unable to complete the API call</p>
            </div>
          </div>
        </div>
        <div className="flex-1 px-8 py-8">
          <div className="space-y-8">
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-red-100 flex items-center justify-center mt-0.5">
                  <X className="h-3 w-3 text-red-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-red-800 mb-2">Error Details</h4>
                  <p className="text-sm text-red-700 font-mono bg-red-100 px-3 py-2 rounded-lg border border-red-200">
                    {response.error}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h4 className="text-base font-semibold text-gray-900 mb-4 flex items-center">
                <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full" />
                </div>
                Troubleshooting Steps
              </h4>
              <ul className="space-y-3 text-sm text-gray-700">
                <li className="flex items-start space-x-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-2 flex-shrink-0" />
                  <span>Verify the URL is correct and accessible</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-2 flex-shrink-0" />
                  <span>Check your internet connection</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-2 flex-shrink-0" />
                  <span>Look for CORS issues in browser console</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-2 flex-shrink-0" />
                  <span>Ensure the API server is running</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 border-l border-gray-200 bg-white h-full flex flex-col">
      <div className="px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="h-10 w-10 bg-green-500 rounded-xl flex items-center justify-center shadow-lg">
              <Check className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-3">
                <h3 className="text-base font-semibold text-gray-900">Response</h3>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    <span className="font-medium">{response.time}ms</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-purple-500 rounded-full" />
                    <span className="font-medium">{formatBytes(response.size || 0)}</span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-600">Request completed successfully</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {request && <CodeGenerationPanel request={request} />}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(formatResponseData(response.data))}
              className="h-9 text-sm px-4 text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-all duration-200"
            >
              <Copy className="h-4 w-4 mr-2" />
              {copied ? 'Copied!' : 'Copy'}
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={downloadResponse}
              className="h-9 text-sm px-4 text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-all duration-200"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </div>
        
        {/* Status */}
        <div className="flex items-center gap-4 mt-4">
          <span className={`text-sm font-semibold px-3 py-2 rounded-lg border shadow-sm ${getStatusColor(response.status)}`}>
            {response.status} {response.statusText}
          </span>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-gray-400 rounded-full" />
            <span className="text-sm text-gray-600 font-mono font-medium">
              {getContentType().toUpperCase()}
            </span>
          </div>
        </div>
      </div>
      
      <div className="flex-1 px-8 py-6 overflow-y-auto">
        <Tabs defaultValue="body" className="w-full h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-2 h-11 bg-gray-100 p-1 rounded-lg mb-6">
            <TabsTrigger value="body" className="text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md transition-all duration-200">
              Response Body
            </TabsTrigger>
            <TabsTrigger value="headers" className="text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md transition-all duration-200">
              Headers
              <span className="ml-2 text-xs text-gray-500 bg-gray-200 px-1.5 py-0.5 rounded-full">
                {Object.keys(response.headers || {}).length}
              </span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="body" className="flex-1">
            <div className="border border-gray-200 rounded-xl overflow-hidden h-full bg-white shadow-sm">
              <div className="bg-gray-50 border-b border-gray-200 px-4 py-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-gray-900">Response Content</h4>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="bg-white px-2 py-1 rounded-md border border-gray-200 font-mono">
                      {getContentType().toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
              <div className="p-4">
                {renderFormattedContent(response.data, getContentType())}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="headers" className="flex-1 overflow-y-auto">
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
              <div className="bg-gray-50 border-b border-gray-200 px-4 py-3">
                <h4 className="text-sm font-semibold text-gray-900">Response Headers</h4>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  {Object.entries(response.headers || {}).map(([key, value]) => (
                    <div key={key} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="text-sm font-semibold text-gray-900 font-mono mb-2">{key}</div>
                      <div className="text-sm text-gray-700 font-mono break-all bg-white px-3 py-2 rounded-md border border-gray-200">
                        {value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}