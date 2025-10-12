'use client'

import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Share2, History, BookOpen, Check, Copy } from 'lucide-react'
import RequestPanel from './RequestPanel'
import ResponsePanel from './ResponsePanel'
import HistoryPanel from './HistoryPanel'
import EnvironmentSelector from './EnvironmentSelector'
import ThemeToggle from '@/components/layout/ThemeToggle'
import { generateShareableUrl, getSharedRequest } from '@/lib/share-encoding'
import { saveToHistory } from '@/lib/storage'
import { processRequestWithVariables } from '@/lib/environments'

export default function Playground() {
  const [request, setRequest] = useState({
    method: 'GET',
    url: 'https://jsonplaceholder.typicode.com/posts/1',
    headers: {},
    body: ''
  })
  
  const [response, setResponse] = useState(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('rest')
  const [shareUrl, setShareUrl] = useState('')
  const [showShared, setShowShared] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)

  // Load shared request on mount
  useEffect(() => {
    const sharedRequest = getSharedRequest()
    if (sharedRequest) {
      setRequest(sharedRequest)
      setShowShared(true)
      setTimeout(() => setShowShared(false), 3000)
    }
  }, [])

  const executeRequest = async () => {
    setLoading(true)
    try {
      // Process request with environment variables
      const processedRequest = processRequestWithVariables(request)
      
      const options = {
        method: processedRequest.method,
        headers: {
          'Content-Type': 'application/json',
          ...processedRequest.headers
        }
      }
      
      if (processedRequest.method !== 'GET' && processedRequest.body) {
        options.body = processedRequest.body
      }
      
      const startTime = Date.now()
      const res = await fetch(processedRequest.url, options)
      const endTime = Date.now()
      
      const data = await res.text()
      let parsedData = data
      
      try {
        parsedData = JSON.parse(data)
      } catch (e) {
        // Keep as text if not JSON
      }
      
      const responseData = {
        status: res.status,
        statusText: res.statusText,
        headers: Object.fromEntries(res.headers.entries()),
        data: parsedData,
        time: endTime - startTime,
        size: new Blob([data]).size
      }
      
      setResponse(responseData)
      
      // Save to history
      saveToHistory(request, responseData)
    } catch (error) {
      const errorResponse = {
        error: error.message,
        status: 0,
        time: 0
      }
      
      setResponse(errorResponse)
      
      // Save failed requests to history too
      saveToHistory(request, errorResponse)
    } finally {
      setLoading(false)
    }
  }

  const handleShare = () => {
    const url = generateShareableUrl(request)
    if (url) {
      setShareUrl(url)
      setShareDialogOpen(true)
    }
  }

  const copyShareUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (err) {
      console.error('Failed to copy to clipboard:', err)
    }
  }

  const handleLoadFromHistory = (historicalRequest) => {
    setRequest(historicalRequest)
    setShowHistory(false)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex">
            <a className="mr-6 flex items-center space-x-2" href="/">
              <div className="h-6 w-6 rounded bg-primary" />
              <span className="font-bold">API Playground</span>
            </a>
          </div>
          <div className="flex flex-1 items-center justify-between">
            <EnvironmentSelector />
            
            <div className="flex items-center space-x-2">
              {showShared && (
                <div className="flex items-center text-sm text-green-600 mr-4">
                  <Check className="h-4 w-4 mr-1" />
                  Shared request loaded
                </div>
              )}
              <Button variant="ghost" size="sm" onClick={() => setShowHistory(!showHistory)}>
                <History className="h-4 w-4 mr-2" />
                History
              </Button>
              <Button variant="ghost" size="sm">
                <BookOpen className="h-4 w-4 mr-2" />
                Docs
              </Button>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto p-6">
        <div className="flex gap-6">
          <div className="flex-1">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="rest">REST</TabsTrigger>
                <TabsTrigger value="graphql">GraphQL</TabsTrigger>
              </TabsList>
              
              <TabsContent value="rest" className="mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <RequestPanel 
                    request={request}
                    setRequest={setRequest}
                    onExecute={executeRequest}
                    loading={loading}
                    onShare={handleShare}
                    shareUrl={shareUrl}
                    shareDialogOpen={shareDialogOpen}
                    setShareDialogOpen={setShareDialogOpen}
                    copyShareUrl={copyShareUrl}
                    copySuccess={copySuccess}
                  />
                  <ResponsePanel response={response} loading={loading} request={request} />
                </div>
              </TabsContent>
              
              <TabsContent value="graphql" className="mt-6">
                <div className="text-center py-12">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">GraphQL Support Coming Soon</h3>
                  <p className="text-muted-foreground">We're working on adding GraphQL support to the playground.</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          {showHistory && (
            <div className="w-80">
              <HistoryPanel onLoadRequest={handleLoadFromHistory} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}