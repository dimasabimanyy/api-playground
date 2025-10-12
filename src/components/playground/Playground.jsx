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
import { getActiveCollectionId, getCollection, addRequestToCollection, updateRequestInCollection } from '@/lib/collections'
import CollectionsSidebar from '@/components/collections/CollectionsSidebar'

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
  const [activeCollectionId, setActiveCollectionId] = useState('my-apis')
  const [activeRequestId, setActiveRequestId] = useState(null)
  const [currentRequestName, setCurrentRequestName] = useState('')

  // Load shared request and active collection on mount
  useEffect(() => {
    const sharedRequest = getSharedRequest()
    if (sharedRequest) {
      setRequest(sharedRequest)
      setShowShared(true)
      setTimeout(() => setShowShared(false), 3000)
    }
    
    // Load active collection
    const activeColId = getActiveCollectionId()
    setActiveCollectionId(activeColId)
  }, [])

  const handleCollectionSelect = (collectionId) => {
    setActiveCollectionId(collectionId)
    setActiveRequestId(null)
    // Reset to empty request when switching collections
    setRequest({
      method: 'GET',
      url: '',
      headers: {},
      body: ''
    })
    setCurrentRequestName('')
    setResponse(null)
  }

  const handleRequestSelect = (selectedRequest) => {
    setRequest({
      method: selectedRequest.method,
      url: selectedRequest.url,
      headers: selectedRequest.headers,
      body: selectedRequest.body
    })
    setActiveRequestId(selectedRequest.id)
    setCurrentRequestName(selectedRequest.name)
    setResponse(null)
  }

  const handleSaveRequest = () => {
    if (!request.url) return
    
    const requestData = {
      name: currentRequestName || `${request.method} ${new URL(request.url).pathname}`,
      description: '',
      method: request.method,
      url: request.url,
      headers: request.headers,
      body: request.body,
      tags: []
    }

    if (activeRequestId) {
      // Update existing request
      updateRequestInCollection(activeCollectionId, activeRequestId, requestData)
    } else {
      // Create new request
      const newRequest = addRequestToCollection(activeCollectionId, requestData)
      if (newRequest) {
        setActiveRequestId(newRequest.id)
        setCurrentRequestName(newRequest.name)
      }
    }
  }

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
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
        <div className="container flex h-16 items-center px-6">
          {/* Logo Section */}
          <div className="flex items-center space-x-3 min-w-0 flex-shrink-0">
            <div className="relative">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md">
                <div className="h-4 w-4 rounded-sm bg-white/90" />
              </div>
              <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-green-500 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                API Playground
              </h1>
              <p className="text-xs text-muted-foreground">Test APIs with confidence</p>
            </div>
          </div>
          
          {/* Center Section */}
          <div className="flex-1 flex justify-center px-8">
            <div className="flex items-center space-x-3 bg-muted/30 rounded-full px-4 py-2 border border-border/50">
              <EnvironmentSelector />
              {showShared && (
                <div className="flex items-center text-sm text-green-600 bg-green-50 dark:bg-green-950 px-2 py-1 rounded-full">
                  <Check className="h-3 w-3 mr-1" />
                  <span className="text-xs font-medium">Loaded shared request</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Right Actions */}
          <div className="flex items-center space-x-1">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowHistory(!showHistory)}
              className="relative hover:bg-blue-50 dark:hover:bg-blue-950/30"
            >
              <History className="h-4 w-4 mr-2" />
              History
              {showHistory && <div className="absolute top-0 right-0 h-2 w-2 bg-blue-500 rounded-full" />}
            </Button>
            <Button variant="ghost" size="sm" className="hover:bg-purple-50 dark:hover:bg-purple-950/30">
              <BookOpen className="h-4 w-4 mr-2" />
              Docs
            </Button>
            <div className="h-4 w-px bg-border mx-2" />
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content with Collections Layout */}
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Collections Sidebar */}
        <CollectionsSidebar
          onCollectionSelect={handleCollectionSelect}
          onRequestSelect={handleRequestSelect}
          activeCollectionId={activeCollectionId}
          activeRequestId={activeRequestId}
        />
        
        {/* Main Testing Area */}
        <div className="flex-1 flex flex-col">
          {/* Welcome Message for First-time Users */}
          {!response && !loading && !request.url && (
            <div className="text-center py-8 border-b border-border/50 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-950/20 dark:to-purple-950/20">
              <div className="inline-flex items-center space-x-2 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-full text-sm mb-4">
                <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse" />
                <span>Ready to test your APIs</span>
              </div>
              <p className="text-muted-foreground text-sm max-w-md mx-auto">
                Select a collection from the sidebar, or start building your first API request
              </p>
            </div>
          )}
          
          <div className="flex-1 flex flex-col p-6">
            <div className="flex gap-8 h-full">
              <div className={`transition-all duration-300 ${showHistory ? 'flex-1' : 'w-full'}`}>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full flex flex-col">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      <TabsList className="bg-muted/50 p-1 rounded-lg">
                        <TabsTrigger value="rest" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
                          <div className="flex items-center space-x-2">
                            <div className="h-2 w-2 bg-green-500 rounded-full" />
                            <span>REST API</span>
                          </div>
                        </TabsTrigger>
                        <TabsTrigger value="graphql" className="data-[state=active]:bg-background data-[state=active]:shadow-sm" disabled>
                          <div className="flex items-center space-x-2">
                            <div className="h-2 w-2 bg-gray-400 rounded-full" />
                            <span>GraphQL</span>
                            <div className="bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded text-xs">
                              Soon
                            </div>
                          </div>
                        </TabsTrigger>
                      </TabsList>
                      
                      {/* Save Request Button */}
                      {request.url && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={handleSaveRequest}
                          className="bg-green-50 border-green-200 hover:bg-green-100 dark:bg-green-950/30 dark:border-green-800"
                        >
                          <div className="h-4 w-4 mr-2 rounded-sm bg-green-500" />
                          {activeRequestId ? 'Update Request' : 'Save Request'}
                        </Button>
                      )}
                    </div>
                    
                    <div className="text-sm text-muted-foreground">
                      Step {response ? '3' : loading ? '2' : '1'} of 3: {response ? 'Review Results' : loading ? 'Sending Request' : 'Configure Request'}
                    </div>
                  </div>
                  
                  <TabsContent value="rest" className="mt-0 flex-1">
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 h-full">
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
                        currentRequestName={currentRequestName}
                        setCurrentRequestName={setCurrentRequestName}
                      />
                      <ResponsePanel response={response} loading={loading} request={request} />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="graphql" className="mt-8 flex-1">
                    <div className="text-center py-16 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 rounded-2xl border border-border/50 h-full flex flex-col justify-center">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mb-6">
                        <BookOpen className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold mb-3">GraphQL Support Coming Soon</h3>
                      <p className="text-muted-foreground max-w-md mx-auto mb-6">
                        We're building an amazing GraphQL playground with query editor, variables, and schema introspection.
                      </p>
                      <Button variant="outline" disabled className="bg-background">
                        Notify me when ready
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
              
              {showHistory && (
                <div className="w-96 transition-all duration-300">
                  <HistoryPanel onLoadRequest={handleLoadFromHistory} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}