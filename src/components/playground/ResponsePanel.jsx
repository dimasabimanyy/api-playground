'use client'

// Removed Card components - using plain divs for seamless integration
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Copy, Download, X, Check } from 'lucide-react'
import { useState } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { getThemeClasses, getStatusColors } from '@/lib/theme'
import CodeGenerationPanel from './CodeGenerationPanel'

export default function ResponsePanel({ response, loading, request }) {
  const { theme, isDark } = useTheme()
  const themeClasses = getThemeClasses(isDark)
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
    return getStatusColors(status, isDark)
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
            <pre className={`text-xs p-4 overflow-auto max-h-64 whitespace-pre-wrap font-mono rounded-lg border ${isDark ? 'bg-gray-900/50 text-gray-200 border-gray-700/50' : 'bg-gray-100 text-gray-800 border-gray-300'}`}>
              {formattedData}
            </pre>
          </div>
        </div>
      )
    }
    
    return (
      <pre className={`text-xs p-4 overflow-auto max-h-64 whitespace-pre-wrap font-mono rounded-lg border ${isDark ? 'bg-gray-900/50 text-gray-200 border-gray-700/50' : 'bg-gray-100 text-gray-800 border-gray-300'}`}>
        {formattedData}
      </pre>
    )
  }

  if (loading) {
    return (
      <div className={`flex-1 h-full flex flex-col transition-all duration-300 ${themeClasses.bg.glass}`}>
        <div className={`px-6 py-4 border-b ${themeClasses.border.primary}`}>
          <div className="flex items-center space-x-3">
            <div className={`animate-spin rounded-full h-4 w-4 border-2 ${isDark ? 'border-blue-400/30 border-t-blue-500' : 'border-blue-300/30 border-t-blue-600'}`}></div>
            <h3 className={`text-sm font-medium ${themeClasses.text.primary}`}>Response</h3>
            <span className={`text-xs ${themeClasses.text.tertiary}`}>Sending request...</span>
          </div>
        </div>
        <div className={`flex-1 flex items-center justify-center transition-colors duration-300 ${themeClasses.bg.primary}`}>
          <div className="text-center space-y-6">
            <div className={`animate-spin rounded-full h-12 w-12 border-2 mx-auto ${isDark ? 'border-blue-400/30 border-t-blue-500' : 'border-blue-300/30 border-t-blue-600'}`}></div>
            <div>
              <p className={`text-base font-medium mb-2 ${themeClasses.text.primary}`}>Sending request...</p>
              <p className={`text-sm ${themeClasses.text.tertiary}`}>Waiting for response</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!response) {
    return (
      <div className={`flex-1 h-full flex flex-col transition-all duration-300 ${themeClasses.bg.glass}`}>
        <div className={`px-6 py-4 border-b ${themeClasses.border.primary}`}>
          <h3 className={`text-sm font-medium ${themeClasses.text.primary}`}>Response</h3>
        </div>
        <div className={`flex-1 flex items-center justify-center transition-colors duration-300 ${themeClasses.bg.primary}`}>
          <div className="text-center space-y-6">
            <div className={`w-20 h-20 rounded-xl flex items-center justify-center mx-auto ${themeClasses.card.base}`}>
              <div className={`w-10 h-10 border-2 border-dashed rounded-lg ${isDark ? 'border-gray-600' : 'border-gray-400'}`} />
            </div>
            <div className="space-y-3">
              <h3 className={`text-lg font-medium ${themeClasses.text.primary}`}>Ready to send</h3>
              <p className={`text-sm max-w-sm ${themeClasses.text.tertiary}`}>
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
      <div className={`flex-1 h-full flex flex-col transition-all duration-300 ${themeClasses.bg.glass}`}>
        <div className={`px-6 py-4 border-b ${themeClasses.border.primary}`}>
          <div className="flex items-center space-x-3">
            <h3 className={`text-sm font-medium ${themeClasses.text.primary}`}>Response</h3>
            <span className={`text-xs px-2 py-1 rounded border font-mono ${themeClasses.status.error}`}>Error</span>
          </div>
        </div>
        <div className={`flex-1 p-6 transition-colors duration-300 ${themeClasses.bg.primary}`}>
          <div className="space-y-6">
            <div className={`p-6 border rounded-xl backdrop-blur-sm ${isDark ? 'border-red-500/20 bg-red-500/5' : 'border-red-300 bg-red-50'}`}>
              <div className="flex items-start space-x-4">
                <div className={`p-2 rounded-lg ${isDark ? 'bg-red-500/20' : 'bg-red-200'}`}>
                  <X className={`h-5 w-5 flex-shrink-0 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
                </div>
                <div>
                  <h4 className={`text-sm font-medium mb-2 ${isDark ? 'text-red-400' : 'text-red-700'}`}>Request failed</h4>
                  <p className={`text-sm font-mono p-3 rounded-lg border ${isDark ? 'text-red-300 bg-red-500/10 border-red-500/20' : 'text-red-700 bg-red-100 border-red-200'}`}>{response.error}</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className={`text-sm font-medium ${themeClasses.text.primary}`}>Common solutions:</h4>
              <ul className={`space-y-2 text-sm ${themeClasses.text.secondary}`}>
                <li className="flex items-start gap-2">
                  <div className={`h-1.5 w-1.5 rounded-full mt-2 flex-shrink-0 ${isDark ? 'bg-gray-500' : 'bg-gray-400'}`}></div>
                  Check if the URL is correct and accessible
                </li>
                <li className="flex items-start gap-2">
                  <div className={`h-1.5 w-1.5 rounded-full mt-2 flex-shrink-0 ${isDark ? 'bg-gray-500' : 'bg-gray-400'}`}></div>
                  Verify CORS policy allows your request
                </li>
                <li className="flex items-start gap-2">
                  <div className={`h-1.5 w-1.5 rounded-full mt-2 flex-shrink-0 ${isDark ? 'bg-gray-500' : 'bg-gray-400'}`}></div>
                  Ensure the target server is running
                </li>
                <li className="flex items-start gap-2">
                  <div className={`h-1.5 w-1.5 rounded-full mt-2 flex-shrink-0 ${isDark ? 'bg-gray-500' : 'bg-gray-400'}`}></div>
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
    <div className={`flex-1 h-full flex flex-col transition-all duration-300 ${themeClasses.bg.glass}`}>
      {/* Response Header - Theme Aware */}
      <div className={`px-6 py-4 border-b ${themeClasses.border.primary}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center gap-3">
              <h3 className={`text-sm font-medium ${themeClasses.text.primary}`}>Response</h3>
              <span className={`text-xs font-mono px-3 py-1.5 rounded-lg font-medium border ${getStatusColor(response.status)}`}>
                {response.status} {response.statusText}
              </span>
            </div>
            <div className={`flex items-center gap-6 text-xs ${themeClasses.text.tertiary}`}>
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
              className={`h-9 text-xs px-4 rounded-lg transition-all duration-200 ${themeClasses.button.secondary}`}
            >
              <Copy className="h-3 w-3 mr-2" />
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button 
              onClick={downloadResponse}
              className={`h-9 text-xs px-4 rounded-lg transition-all duration-200 ${themeClasses.button.secondary}`}
            >
              <Download className="h-3 w-3 mr-2" />
              Save
            </button>
          </div>
        </div>
      </div>
      
      {/* Response Content - Theme Aware */}
      <div className={`flex-1 overflow-hidden transition-colors duration-300 ${themeClasses.bg.primary}`}>
        <Tabs defaultValue="body" className="w-full h-full flex flex-col">
          <div className={`border-b ${themeClasses.border.primary} ${themeClasses.bg.secondary}`}>
            <TabsList className="grid w-full grid-cols-3 h-12 bg-transparent p-0 border-b-0">
              <TabsTrigger value="body" className={`text-sm data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:${themeClasses.border.accent.replace('border-', 'border-b-')} data-[state=active]:${themeClasses.text.accent} border-b-2 border-transparent rounded-none transition-all ${themeClasses.tab.inactive}`}>
                Body
              </TabsTrigger>
              <TabsTrigger value="headers" className={`text-sm data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:${themeClasses.border.accent.replace('border-', 'border-b-')} data-[state=active]:${themeClasses.text.accent} border-b-2 border-transparent rounded-none transition-all ${themeClasses.tab.inactive}`}>
                Headers
                <span className={`ml-2 text-xs px-1.5 py-0.5 rounded border ${themeClasses.status.info}`}>
                  {Object.keys(response.headers || {}).length}
                </span>
              </TabsTrigger>
              <TabsTrigger value="test" className={`text-sm data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:${themeClasses.border.accent.replace('border-', 'border-b-')} data-[state=active]:${themeClasses.text.accent} border-b-2 border-transparent rounded-none transition-all ${themeClasses.tab.inactive}`}>
                Test Results
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="body" className="flex-1 p-6 overflow-y-auto">
            <div className={`border rounded-xl overflow-hidden backdrop-blur-sm ${themeClasses.card.base}`}>
              <div className={`px-4 py-3 border-b flex items-center justify-between ${themeClasses.border.secondary} ${themeClasses.bg.secondary}`}>
                <span className={`text-xs font-medium uppercase tracking-wide flex items-center gap-2 ${themeClasses.text.secondary}`}>
                  <div className="h-2 w-2 bg-emerald-500 rounded-full"></div>
                  {getContentType()}
                </span>
                <div className="flex items-center gap-3">
                  <button className={`text-xs px-2 py-1 rounded transition-all duration-200 ${isDark ? 'text-gray-400 hover:text-white bg-gray-700/50' : 'text-gray-600 hover:text-gray-900 bg-gray-200'}`}>Pretty</button>
                  <button className={`text-xs px-2 py-1 rounded transition-all duration-200 ${themeClasses.button.ghost}`}>Raw</button>
                  <button className={`text-xs px-2 py-1 rounded transition-all duration-200 ${themeClasses.button.ghost}`}>Preview</button>
                </div>
              </div>
              <div className={`p-6 max-h-96 overflow-auto ${isDark ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
                <div className={`text-xs font-mono leading-relaxed ${themeClasses.text.primary}`}>
                  {renderFormattedContent(response.data, getContentType())}
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="headers" className="flex-1 p-6 overflow-y-auto">
            <div className={`space-y-0 border rounded-xl overflow-hidden ${themeClasses.card.base}`}>
              <div className={`px-6 py-3 border-b ${themeClasses.border.secondary} ${themeClasses.bg.secondary}`}>
                <div className={`grid grid-cols-2 gap-6 text-xs font-medium uppercase tracking-wide ${themeClasses.text.secondary}`}>
                  <div>Key</div>
                  <div>Value</div>
                </div>
              </div>
              <div className={`divide-y ${themeClasses.border.primary}`}>
                {Object.entries(response.headers || {}).map(([key, value]) => (
                  <div key={key} className={`grid grid-cols-2 gap-6 px-6 py-4 transition-all duration-200 ${isDark ? 'bg-gray-800/20 hover:bg-gray-800/40' : 'bg-white hover:bg-gray-50'}`}>
                    <div className={`text-sm font-medium font-mono break-all ${themeClasses.text.accent}`}>{key}</div>
                    <div className={`text-sm font-mono break-all ${themeClasses.text.primary}`}>{value}</div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="test" className="flex-1 p-6">
            <div className={`text-center py-16 ${themeClasses.text.tertiary}`}>
              <div className={`w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-6 ${themeClasses.card.base}`}>
                <Check className={`h-8 w-8 ${themeClasses.text.tertiary}`} />
              </div>
              <h3 className={`text-base font-medium mb-3 ${themeClasses.text.primary}`}>No tests configured</h3>
              <p className={`text-sm max-w-sm mx-auto ${themeClasses.text.tertiary}`}>
                Write test scripts to validate your API responses automatically
              </p>
              <button className={`mt-6 h-9 text-sm px-4 rounded-lg transition-all duration-200 ${themeClasses.button.primary}`}>
                Add Test
              </button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}