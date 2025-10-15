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
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 h-16 flex items-center px-6">
        <div className="flex items-center space-x-3 min-w-0 flex-shrink-0">
          <div className="h-8 w-8 rounded-lg bg-black dark:bg-white flex items-center justify-center">
            <div className="h-4 w-4 rounded bg-white dark:bg-black" />
          </div>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">API Playground</h1>
        </div>
        
        <div className="flex-1 flex justify-center px-6">
          <EnvironmentSelector />
          {showShared && (
            <div className="ml-3 text-sm text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-400 px-3 py-1.5 rounded-md border border-emerald-200 dark:border-emerald-800">
              Shared request loaded
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-1">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowHistory(!showHistory)}
            className="h-9 px-3 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <History className="h-4 w-4 mr-2" />
            History
          </Button>
          <ThemeToggle />
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
        <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900">
          <div className="flex-1 flex p-6 gap-6">
            <div className={`${showHistory ? 'flex-1' : 'w-full'}`}>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <div className="flex items-center justify-between mb-3">
                  <TabsList className="h-7">
                    <TabsTrigger value="rest" className="text-xs px-3">REST</TabsTrigger>
                    <TabsTrigger value="graphql" disabled className="text-xs px-3">GraphQL</TabsTrigger>
                  </TabsList>
                  
                  {request.url && (
                    <Button size="sm" onClick={handleSaveRequest} className="h-7 text-xs">
                      {activeRequestId ? 'Update' : 'Save'}
                    </Button>
                  )}
                </div>
                
                <TabsContent value="rest" className="mt-0">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
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
              
              <TabsContent value="graphql" className="mt-0">
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">GraphQL support coming soon</p>
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
    </div>
  )
}