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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-300 bg-white h-12 flex items-center px-4 shadow-sm">
        <div className="flex items-center space-x-2 min-w-0 flex-shrink-0">
          <div className="h-6 w-6 rounded bg-orange-500 flex items-center justify-center">
            <div className="h-3 w-3 rounded-sm bg-white" />
          </div>
          <h1 className="text-base font-medium text-gray-800">API Playground</h1>
        </div>
        
        <div className="flex-1 flex justify-center px-4">
          <EnvironmentSelector />
          {showShared && (
            <div className="ml-2 text-xs text-orange-700 bg-orange-100 px-2 py-1 rounded border border-orange-200">
              Shared request loaded
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-1">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowHistory(!showHistory)}
            className="h-8 px-2 text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-100"
          >
            <History className="h-3 w-3 mr-1" />
            History
          </Button>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content Layout */}
      <div className="flex h-[calc(100vh-3rem)]">
        {/* Collections Sidebar */}
        <CollectionsSidebar
          onCollectionSelect={handleCollectionSelect}
          onRequestSelect={handleRequestSelect}
          activeCollectionId={activeCollectionId}
          activeRequestId={activeRequestId}
        />
        
        {/* Main Testing Area */}
        <div className="flex-1 flex flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <div className="border-b border-gray-200 px-4 py-2 bg-white">
              <div className="flex items-center justify-between">
                <TabsList className="h-8 bg-gray-50">
                  <TabsTrigger value="rest" className="text-sm px-4 data-[state=active]:bg-white">REST</TabsTrigger>
                  <TabsTrigger value="graphql" disabled className="text-sm px-4 text-gray-400">GraphQL</TabsTrigger>
                </TabsList>
                
                {request.url && (
                  <Button size="sm" onClick={handleSaveRequest} className="h-8 text-sm px-4 bg-blue-600 hover:bg-blue-700 text-white">
                    {activeRequestId ? 'Update' : 'Save'}
                  </Button>
                )}
              </div>
            </div>
            
            <div className="flex-1 flex">
              <div className={`${showHistory ? 'flex-1' : 'w-full'} flex`}>
                <TabsContent value="rest" className="mt-0 flex-1 flex">
                  <div className="flex-1 flex">
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
                
                <TabsContent value="graphql" className="mt-0 flex-1">
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-sm">GraphQL support coming soon</p>
                  </div>
                </TabsContent>
              </div>
              
              {showHistory && (
                <div className="w-80 border-l border-gray-200">
                  <HistoryPanel onLoadRequest={handleLoadFromHistory} />
                </div>
              )}
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  )
}