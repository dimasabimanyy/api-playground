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
import JsonView from '@uiw/react-json-view'

export default function ResponsePanel({ response, loading, request }) {
  const { theme, isDark } = useTheme()
  const themeClasses = getThemeClasses(isDark)
  const [copied, setCopied] = useState(false)
  const [viewFormat, setViewFormat] = useState('pretty') // pretty, raw, javascript

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
    if (type === 'json') {
      try {
        const jsonData = typeof data === 'string' ? JSON.parse(data) : data
        
        if (viewFormat === 'pretty') {
          return (
            <JsonView 
              value={jsonData}
              style={{
                backgroundColor: 'transparent',
                fontSize: '14px',
                fontFamily: 'inherit'
              }}
              theme={isDark ? 'dark' : 'light'}
              collapsed={false}
              displayDataTypes={false}
              displayObjectSize={false}
              enableClipboard={false}
            />
          )
        } else if (viewFormat === 'javascript') {
          const jsCode = `const data = ${JSON.stringify(jsonData, null, 2)};`
          return (
            <pre className={`text-sm leading-relaxed font-mono ${themeClasses.text.primary}`}>
              <code>{jsCode}</code>
            </pre>
          )
        } else { // raw
          return (
            <pre className={`text-sm leading-relaxed font-mono ${themeClasses.text.primary}`}>
              {JSON.stringify(jsonData, null, 2)}
            </pre>
          )
        }
      } catch (error) {
        // Fall back to plain text if JSON parsing fails
        const formattedData = formatContent(data, type)
        return (
          <pre className={`text-sm leading-relaxed font-mono ${themeClasses.text.primary}`}>
            {formattedData}
          </pre>
        )
      }
    }
    
    if (type === 'html') {
      const formattedData = formatContent(data, type)
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
            <pre className={`text-sm p-4 overflow-auto max-h-64 whitespace-pre-wrap font-mono rounded-lg border ${isDark ? 'bg-gray-900/50 text-gray-200 border-gray-700/50' : 'bg-gray-100 text-gray-800 border-gray-300'}`}>
              {formattedData}
            </pre>
          </div>
        </div>
      )
    }
    
    const formattedData = formatContent(data, type)
    return (
      <pre className={`text-sm p-4 overflow-auto max-h-64 whitespace-pre-wrap font-mono rounded-lg border ${isDark ? 'bg-gray-900/50 text-gray-200 border-gray-700/50' : 'bg-gray-100 text-gray-800 border-gray-300'}`}>
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
            <span className={`text-xs px-2 py-1 rounded border font-mono ${isDark ? 'text-blue-400 bg-blue-500/10 border-blue-500/20' : 'text-blue-600 bg-blue-100 border-blue-300'}`}>
              Loading...
            </span>
          </div>
        </div>
        
        {/* Loading shimmer content */}
        <div className={`flex-1 p-6 transition-colors duration-300 ${themeClasses.bg.primary}`}>
          <div className="space-y-6">
            {/* Status and timing placeholders */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className={`h-6 w-24 rounded shimmer ${isDark ? 'bg-gray-800/50' : 'bg-gray-200/50'}`}></div>
                <div className={`h-4 w-16 rounded shimmer ${isDark ? 'bg-gray-800/50' : 'bg-gray-200/50'}`}></div>
                <div className={`h-4 w-20 rounded shimmer ${isDark ? 'bg-gray-800/50' : 'bg-gray-200/50'}`}></div>
              </div>
              <div className="flex gap-3">
                <div className={`h-9 w-16 rounded-lg shimmer ${isDark ? 'bg-gray-800/50' : 'bg-gray-200/50'}`}></div>
                <div className={`h-9 w-16 rounded-lg shimmer ${isDark ? 'bg-gray-800/50' : 'bg-gray-200/50'}`}></div>
              </div>
            </div>
            
            {/* Tabs placeholder */}
            <div className="flex space-x-6 border-b pb-3">
              <div className={`h-5 w-12 rounded shimmer ${isDark ? 'bg-gray-800/50' : 'bg-gray-200/50'}`}></div>
              <div className={`h-5 w-16 rounded shimmer ${isDark ? 'bg-gray-800/50' : 'bg-gray-200/50'}`}></div>
              <div className={`h-5 w-20 rounded shimmer ${isDark ? 'bg-gray-800/50' : 'bg-gray-200/50'}`}></div>
            </div>
            
            {/* Content area shimmer */}
            <div className={`border rounded-xl p-6 space-y-4 ${themeClasses.card.base}`}>
              <div className="flex justify-between items-center">
                <div className={`h-4 w-16 rounded shimmer ${isDark ? 'bg-gray-800/50' : 'bg-gray-200/50'}`}></div>
                <div className="flex gap-2">
                  <div className={`h-6 w-12 rounded shimmer ${isDark ? 'bg-gray-800/50' : 'bg-gray-200/50'}`}></div>
                  <div className={`h-6 w-12 rounded shimmer ${isDark ? 'bg-gray-800/50' : 'bg-gray-200/50'}`}></div>
                </div>
              </div>
              
              {/* Response content lines */}
              <div className="space-y-3">
                {[...Array(8)].map((_, i) => (
                  <div 
                    key={i}
                    className={`h-4 rounded shimmer ${isDark ? 'bg-gray-800/50' : 'bg-gray-200/50'}`}
                    style={{ width: `${Math.random() * 40 + 60}%` }}
                  ></div>
                ))}
              </div>
            </div>
            
            {/* Loading indicator at bottom */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-3">
                <div className={`animate-pulse h-2 w-2 rounded-full ${isDark ? 'bg-blue-500' : 'bg-blue-600'}`}></div>
                <div className={`animate-pulse h-2 w-2 rounded-full ${isDark ? 'bg-blue-500' : 'bg-blue-600'}`} style={{ animationDelay: '0.2s' }}></div>
                <div className={`animate-pulse h-2 w-2 rounded-full ${isDark ? 'bg-blue-500' : 'bg-blue-600'}`} style={{ animationDelay: '0.4s' }}></div>
              </div>
              <p className={`text-sm mt-3 ${themeClasses.text.tertiary}`}>
                Processing your request...
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!response) {
    return (
      <div className={`flex-1 h-full flex flex-col transition-all duration-300 ${themeClasses.bg.glass}`}>
        <div className={`px-6 py-4`}>
          <h3 className={`text-sm font-medium ${themeClasses.text.primary}`}>Response</h3>
        </div>
        <div className={`flex-1 flex items-center justify-center transition-colors duration-300 ${themeClasses.bg.primary}`}>
          <div className="text-center space-y-8 max-w-md mx-auto px-6">
            {/* Hero Icon */}
            <div className="relative">
              <div className={`w-24 h-24 rounded-2xl flex items-center justify-center mx-auto ${isDark ? 'bg-gradient-to-br from-blue-500/20 to-purple-600/20 border border-blue-500/20' : 'bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200'}`}>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${isDark ? 'bg-blue-500/30' : 'bg-blue-100'}`}>
                  <div className={`w-6 h-6 border-2 border-dashed rounded ${isDark ? 'border-blue-400' : 'border-blue-500'}`} />
                </div>
              </div>
              <div className={`absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
                <div className={`w-2 h-2 rounded-full ${isDark ? 'bg-blue-400' : 'bg-blue-500'} animate-pulse`}></div>
              </div>
            </div>
            
            {/* Welcome Content */}
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className={`text-xl font-semibold ${themeClasses.text.primary}`}>
                  Start testing APIs
                </h3>
                <p className={`text-sm leading-relaxed ${themeClasses.text.secondary}`}>
                  Enter an API endpoint in the request panel and click Send to see the response here. 
                  Perfect for testing REST APIs, debugging responses, and exploring data.
                </p>
              </div>
              
              {/* Feature highlights */}
              <div className="grid grid-cols-1 gap-3 mt-6">
                <div className={`flex items-center gap-3 p-3 rounded-lg ${isDark ? 'bg-gray-800/30' : 'bg-gray-50'}`}>
                  <div className={`w-6 h-6 rounded flex items-center justify-center ${isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-600'}`}>
                    <div className="w-2 h-2 rounded-full bg-current"></div>
                  </div>
                  <span className={`text-sm ${themeClasses.text.secondary}`}>Real-time response preview</span>
                </div>
                <div className={`flex items-center gap-3 p-3 rounded-lg ${isDark ? 'bg-gray-800/30' : 'bg-gray-50'}`}>
                  <div className={`w-6 h-6 rounded flex items-center justify-center ${isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>
                    <div className="w-2 h-2 rounded-full bg-current"></div>
                  </div>
                  <span className={`text-sm ${themeClasses.text.secondary}`}>Headers & body inspection</span>
                </div>
                <div className={`flex items-center gap-3 p-3 rounded-lg ${isDark ? 'bg-gray-800/30' : 'bg-gray-50'}`}>
                  <div className={`w-6 h-6 rounded flex items-center justify-center ${isDark ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-600'}`}>
                    <div className="w-2 h-2 rounded-full bg-current"></div>
                  </div>
                  <span className={`text-sm ${themeClasses.text.secondary}`}>Export & share results</span>
                </div>
              </div>
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
      
      {/* Response Content - Theme Aware */}
      <div className={`flex-1 overflow-hidden transition-colors duration-300 ${themeClasses.bg.primary}`}>
        <Tabs defaultValue="body" className="w-full h-full flex flex-col">
          <div className={`${themeClasses.border.primary} flex justify-between items-center px-4 pt-2`}>
            <TabsList className="flex h-8 bg-transparent p-0 border-none gap-6">
              <TabsTrigger
                value="body"
                className={`
                  relative text-xs py-2 rounded-none border-none bg-transparent
                  transition-all duration-200
                  ${themeClasses.tab.inactive}
                  hover:bg-transparent hover:text-blue-500
                  data-[state=active]:text-blue-500
                  after:absolute after:bottom-[-1px] after:left-0 after:h-[2px] after:w-0 after:bg-blue-500 after:transition-all after:duration-300
                  data-[state=active]:after:w-full hover:after:w-full
                `}
              >
                Response
              </TabsTrigger>
              <TabsTrigger
                value="headers"
                className={`
                  relative text-xs py-2 rounded-none border-none bg-transparent
                  transition-all duration-200
                  ${themeClasses.tab.inactive}
                  hover:bg-transparent hover:text-blue-500
                  data-[state=active]:text-blue-500
                  after:absolute after:bottom-[-1px] after:left-0 after:h-[2px] after:w-0 after:bg-blue-500 after:transition-all after:duration-300
                  data-[state=active]:after:w-full hover:after:w-full
                `}
              >
                Headers
                {Object.keys(response.headers || {}).length > 0 && (
                  <span
                    className={`ml-1.5 text-xs px-1.5 py-0.5 rounded border ${themeClasses.status.info}`}
                  >
                    {Object.keys(response.headers || {}).length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>
            
            {/* Status info on the right side - Postman style */}
            <div className="flex items-center gap-4">
              <span className={`text-xs font-mono px-2 py-1 rounded ${getStatusColor(response.status)}`}>
                {response.status} {response.statusText}
              </span>
              <div className="flex items-center gap-1">
                <div className={`w-1 h-1 rounded-full ${isDark ? 'bg-gray-600' : 'bg-gray-400'}`}></div>
                <span className={`text-xs ${themeClasses.text.tertiary}`}>{response.time}ms</span>
              </div>
              <div className="flex items-center gap-1">
                <div className={`w-1 h-1 rounded-full ${isDark ? 'bg-gray-600' : 'bg-gray-400'}`}></div>
                <span className={`text-xs ${themeClasses.text.tertiary}`}>{formatBytes(response.size || 0)}</span>
              </div>
              
              <div className="flex items-center gap-1">
                {request && <CodeGenerationPanel request={request} />}
                <button
                  onClick={() => copyToClipboard(formatResponseData(response.data))}
                  className={`p-1.5 rounded-md transition-all duration-200 ${isDark ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
                  title="Copy response"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
                <button 
                  onClick={downloadResponse}
                  className={`p-1.5 rounded-md transition-all duration-200 ${isDark ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
                  title="Download response"
                >
                  <Download className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
          
          <TabsContent value="body" className="flex-1 flex flex-col overflow-hidden">
            {/* Format buttons for JSON responses */}
            {getContentType() === 'json' && (
              <div className={`px-4 py-2 ${themeClasses.border.primary} flex items-center gap-2`}>
                <span className={`text-xs ${themeClasses.text.secondary} mr-2`}>Format:</span>
                {[
                  { key: 'pretty', label: 'Pretty' },
                  { key: 'raw', label: 'Raw' },
                  { key: 'javascript', label: 'JavaScript' }
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setViewFormat(key)}
                    className={`text-xs px-3 py-1 rounded transition-all duration-200 ${
                      viewFormat === key 
                        ? `${isDark ? 'bg-blue-600 text-white' : 'bg-blue-600 text-white'}` 
                        : `${isDark ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
            
            <div className="flex-1 px-4 pt-4 pb-4 overflow-y-auto">
              <div className={`text-sm font-mono leading-relaxed ${themeClasses.text.primary} ${getContentType() === 'json' && viewFormat === 'pretty' ? '' : 'p-4 rounded ' + (isDark ? 'bg-gray-900/30' : 'bg-gray-50/50')}`}>
                {renderFormattedContent(response.data, getContentType())}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="headers" className="flex-1 px-4 pb-4 overflow-y-auto">
            <div className="space-y-1">
              {Object.entries(response.headers || {}).map(([key, value]) => (
                <div key={key} className="py-1">
                  <div className="grid grid-cols-3 gap-4">
                    <div className={`text-sm ${themeClasses.text.secondary}`}>
                      {key}
                    </div>
                    <div className="col-span-2">
                      <div className={`text-sm font-mono ${themeClasses.text.primary} break-all`}>
                        {value}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {Object.keys(response.headers || {}).length === 0 && (
                <div className={`text-center py-8 ${themeClasses.text.tertiary}`}>
                  <p className={`text-sm`}>No headers</p>
                </div>
              )}
            </div>
          </TabsContent>
          
        </Tabs>
      </div>
    </div>
  )
}