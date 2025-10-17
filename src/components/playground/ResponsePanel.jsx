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
            <pre className="text-xs bg-gray-900/50 text-gray-200 p-4 overflow-auto max-h-64 whitespace-pre-wrap font-mono rounded-lg border border-gray-700/50">
              {formattedData}
            </pre>
          </div>
        </div>
      )
    }
    
    return (
      <pre className="text-xs bg-gray-900/50 text-gray-200 p-4 overflow-auto max-h-64 whitespace-pre-wrap font-mono rounded-lg border border-gray-700/50">
        {formattedData}
      </pre>
    )
  }

  if (loading) {
    return (
      <div className="flex-1 bg-[#1a1a1a]/50 h-full flex flex-col backdrop-blur-xl">
        <div className="px-6 py-4 border-b border-gray-800/50">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-400/30 border-t-blue-500"></div>
            <h3 className="text-sm font-medium text-white">Response</h3>
            <span className="text-xs text-gray-400">Sending request...</span>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center bg-[#111]">
          <div className="text-center space-y-6">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-400/30 border-t-blue-500 mx-auto"></div>
            <div>
              <p className="text-base font-medium text-white mb-2">Sending request...</p>
              <p className="text-sm text-gray-400">Waiting for response</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!response) {
    return (
      <div className="flex-1 bg-[#1a1a1a]/50 h-full flex flex-col backdrop-blur-xl">
        <div className="px-6 py-4 border-b border-gray-800/50">
          <h3 className="text-sm font-medium text-white">Response</h3>
        </div>
        <div className="flex-1 flex items-center justify-center bg-[#111]">
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-gray-800/50 border border-gray-700/50 rounded-xl flex items-center justify-center mx-auto">
              <div className="w-10 h-10 border-2 border-dashed border-gray-600 rounded-lg" />
            </div>
            <div className="space-y-3">
              <h3 className="text-lg font-medium text-white">Ready to send</h3>
              <p className="text-sm text-gray-400 max-w-sm">
                Enter a URL and click Send to see the response here
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (response.error) {
    return (
      <div className="flex-1 bg-[#1a1a1a]/50 h-full flex flex-col backdrop-blur-xl">
        <div className="px-6 py-4 border-b border-gray-800/50">
          <div className="flex items-center space-x-3">
            <h3 className="text-sm font-medium text-white">Response</h3>
            <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded border border-red-500/30 font-mono">Error</span>
          </div>
        </div>
        <div className="flex-1 p-6 bg-[#111]">
          <div className="space-y-6">
            <div className="p-6 border border-red-500/20 rounded-xl bg-red-500/5 backdrop-blur-sm">
              <div className="flex items-start space-x-4">
                <div className="p-2 bg-red-500/20 rounded-lg">
                  <X className="h-5 w-5 text-red-400 flex-shrink-0" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-red-400 mb-2">Request failed</h4>
                  <p className="text-sm text-red-300 font-mono bg-red-500/10 p-3 rounded-lg border border-red-500/20">{response.error}</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-white">Common solutions:</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 bg-gray-500 rounded-full mt-2 flex-shrink-0"></div>
                  Check if the URL is correct and accessible
                </li>
                <li className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 bg-gray-500 rounded-full mt-2 flex-shrink-0"></div>
                  Verify CORS policy allows your request
                </li>
                <li className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 bg-gray-500 rounded-full mt-2 flex-shrink-0"></div>
                  Ensure the target server is running
                </li>
                <li className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 bg-gray-500 rounded-full mt-2 flex-shrink-0"></div>
                  Check your internet connection
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 bg-[#1a1a1a]/50 h-full flex flex-col backdrop-blur-xl">
      {/* Response Header - Dark Premium */}
      <div className="px-6 py-4 border-b border-gray-800/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center gap-3">
              <h3 className="text-sm font-medium text-white">Response</h3>
              <span className={`text-xs font-mono px-3 py-1.5 rounded-lg font-medium border ${getStatusColor(response.status).replace('bg-', 'bg-').replace('text-', 'text-').replace('100', '500/20').replace('800', '400')} border-current/30`}>
                {response.status} {response.statusText}
              </span>
            </div>
            <div className="flex items-center gap-6 text-xs text-gray-400">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                <span className="font-mono">{response.time}ms</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-purple-500 rounded-full"></div>
                <span className="font-mono">{formatBytes(response.size || 0)}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {request && <CodeGenerationPanel request={request} />}
            <button
              onClick={() => copyToClipboard(formatResponseData(response.data))}
              className="h-9 text-xs px-4 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg border border-gray-700/50 transition-all duration-200"
            >
              <Copy className="h-3 w-3 mr-2" />
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button 
              onClick={downloadResponse}
              className="h-9 text-xs px-4 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg border border-gray-700/50 transition-all duration-200"
            >
              <Download className="h-3 w-3 mr-2" />
              Save
            </button>
          </div>
        </div>
      </div>
      
      {/* Response Content - Dark Premium */}
      <div className="flex-1 overflow-hidden bg-[#111]">
        <Tabs defaultValue="body" className="w-full h-full flex flex-col">
          <div className="border-b border-gray-800/50 bg-[#1a1a1a]/30">
            <TabsList className="grid w-full grid-cols-3 h-12 bg-transparent p-0 border-b-0">
              <TabsTrigger value="body" className="text-sm data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:text-blue-400 border-b-2 border-transparent rounded-none transition-all text-gray-400 hover:text-white">
                Body
              </TabsTrigger>
              <TabsTrigger value="headers" className="text-sm data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:text-blue-400 border-b-2 border-transparent rounded-none transition-all text-gray-400 hover:text-white">
                Headers
                <span className="ml-2 text-xs bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/30">
                  {Object.keys(response.headers || {}).length}
                </span>
              </TabsTrigger>
              <TabsTrigger value="test" className="text-sm data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:text-blue-400 border-b-2 border-transparent rounded-none transition-all text-gray-400 hover:text-white">
                Test Results
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="body" className="flex-1 p-6 overflow-y-auto">
            <div className="border border-gray-700/50 rounded-xl overflow-hidden bg-gray-800/30 backdrop-blur-sm">
              <div className="px-4 py-3 bg-gray-800/50 border-b border-gray-700/50 flex items-center justify-between">
                <span className="text-xs font-medium text-gray-300 uppercase tracking-wide flex items-center gap-2">
                  <div className="h-2 w-2 bg-emerald-500 rounded-full"></div>
                  {getContentType()}
                </span>
                <div className="flex items-center gap-3">
                  <button className="text-xs text-gray-400 hover:text-white bg-gray-700/50 px-2 py-1 rounded transition-all duration-200">Pretty</button>
                  <button className="text-xs text-gray-400 hover:text-white hover:bg-gray-700/50 px-2 py-1 rounded transition-all duration-200">Raw</button>
                  <button className="text-xs text-gray-400 hover:text-white hover:bg-gray-700/50 px-2 py-1 rounded transition-all duration-200">Preview</button>
                </div>
              </div>
              <div className="p-6 bg-gray-900/50 max-h-96 overflow-auto">
                <div className="text-xs text-gray-300 font-mono leading-relaxed">
                  {renderFormattedContent(response.data, getContentType())}
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="headers" className="flex-1 p-6 overflow-y-auto">
            <div className="space-y-0 border border-gray-700/50 rounded-xl overflow-hidden">
              <div className="bg-gray-800/50 px-6 py-3 border-b border-gray-700/50">
                <div className="grid grid-cols-2 gap-6 text-xs font-medium text-gray-300 uppercase tracking-wide">
                  <div>Key</div>
                  <div>Value</div>
                </div>
              </div>
              <div className="divide-y divide-gray-700/50">
                {Object.entries(response.headers || {}).map(([key, value]) => (
                  <div key={key} className="grid grid-cols-2 gap-6 px-6 py-4 bg-gray-800/20 hover:bg-gray-800/40 transition-all duration-200">
                    <div className="text-sm font-medium text-blue-400 font-mono break-all">{key}</div>
                    <div className="text-sm text-gray-300 font-mono break-all">{value}</div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="test" className="flex-1 p-6">
            <div className="text-center py-16 text-gray-500">
              <div className="w-16 h-16 bg-gray-800/50 rounded-xl flex items-center justify-center mx-auto mb-6 border border-gray-700/50">
                <Check className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-base font-medium text-white mb-3">No tests configured</h3>
              <p className="text-sm text-gray-400 max-w-sm mx-auto">
                Write test scripts to validate your API responses automatically
              </p>
              <button className="mt-6 h-9 text-sm px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded-lg transition-all duration-200 shadow-lg hover:shadow-blue-500/25">
                Add Test
              </button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}