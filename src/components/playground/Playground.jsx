'use client'

import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Share2, History, BookOpen, Check, Copy, PanelLeftOpen, PanelLeftClose, Zap, FolderOpen, User, Settings } from 'lucide-react'
import RequestPanel from './RequestPanel'
import ResponsePanel from './ResponsePanel'
import HistoryPanel from './HistoryPanel'
import EnvironmentSelector from './EnvironmentSelector'
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [activeMenuTab, setActiveMenuTab] = useState('collections')

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
      <header className="border-b border-gray-200 bg-white h-14 flex items-center px-6">
        <div className="flex items-center space-x-3 min-w-0 flex-shrink-0">
          <div className="h-8 w-8 rounded bg-green-600 flex items-center justify-center">
            <Zap className="h-4 w-4 text-white" />
          </div>
        </div>
        
        <div className="flex-1 flex justify-center px-8">
          <div className="flex items-center gap-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="h-8 bg-gray-100">
                <TabsTrigger value="rest" className="text-sm px-4 data-[state=active]:bg-white">REST</TabsTrigger>
                <TabsTrigger value="graphql" disabled className="text-sm px-4 text-gray-400">GraphQL</TabsTrigger>
              </TabsList>
            </Tabs>
            {showShared && (
              <div className="text-sm text-blue-700 bg-blue-50 px-3 py-1 rounded-md border border-blue-200">
                Shared request loaded
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="h-6 w-px bg-gray-200" />
          <Button 
            variant="outline" 
            size="sm"
            className="h-8 px-4 text-sm border-gray-300 hover:bg-gray-50"
          >
            Sign in
          </Button>
        </div>
      </header>

      {/* Main Content Layout */}
      <div className="flex h-[calc(100vh-3.5rem)]">
        {/* Menu Sidebar */}
        <div className="w-14 border-r border-gray-200 bg-white flex flex-col">
          <div className="flex-1 py-3">
            <div className="space-y-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (activeMenuTab === 'collections' && !sidebarCollapsed) {
                    setSidebarCollapsed(true)
                  } else {
                    setActiveMenuTab('collections')
                    setSidebarCollapsed(false)
                    setShowHistory(false)
                  }
                }}
                className={`w-10 h-10 mx-2 p-0 rounded-md transition-colors cursor-pointer ${
                  activeMenuTab === 'collections' && !sidebarCollapsed
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                <FolderOpen className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (activeMenuTab === 'history' && !sidebarCollapsed) {
                    setSidebarCollapsed(true)
                  } else {
                    setActiveMenuTab('history')
                    setSidebarCollapsed(false)
                    setShowHistory(false)
                  }
                }}
                className={`w-10 h-10 mx-2 p-0 rounded-md transition-colors cursor-pointer ${
                  activeMenuTab === 'history' && !sidebarCollapsed
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                <History className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (activeMenuTab === 'settings' && !sidebarCollapsed) {
                    setSidebarCollapsed(true)
                  } else {
                    setActiveMenuTab('settings')
                    setSidebarCollapsed(false)
                    setShowHistory(false)
                  }
                }}
                className={`w-10 h-10 mx-2 p-0 rounded-md transition-colors cursor-pointer ${
                  activeMenuTab === 'settings' && !sidebarCollapsed
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Dynamic Sidebar */}
        {!sidebarCollapsed && activeMenuTab === 'collections' && (
          <CollectionsSidebar
            onCollectionSelect={handleCollectionSelect}
            onRequestSelect={handleRequestSelect}
            activeCollectionId={activeCollectionId}
            activeRequestId={activeRequestId}
          />
        )}
        
        {!sidebarCollapsed && activeMenuTab === 'history' && (
          <div className="w-64 border-r border-gray-200 bg-white h-full">
            <HistoryPanel onLoadRequest={handleLoadFromHistory} />
          </div>
        )}
        
        {!sidebarCollapsed && activeMenuTab === 'settings' && (
          <div className="w-64 border-r border-gray-200 bg-white h-full flex flex-col">
            {/* Settings Header */}
            <div className="px-4 py-4">
              <h2 className="text-sm font-semibold text-gray-900">Settings</h2>
            </div>

            {/* Settings Content */}
            <div className="flex-1 overflow-y-auto bg-white">
              <div className="px-4 pb-4 space-y-6">
                {/* Environment Settings */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-gray-900">Environment</h3>
                  <EnvironmentSelector />
                </div>
                
                {/* Theme Settings */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-gray-900">Appearance</h3>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input type="radio" name="theme" value="light" defaultChecked className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-gray-700">Light theme</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="radio" name="theme" value="dark" className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-gray-700">Dark theme</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="radio" name="theme" value="system" className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-gray-700">System preference</span>
                    </label>
                  </div>
                </div>

                {/* Request Settings */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-gray-900">Requests</h3>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked className="w-4 h-4 text-green-600 rounded" />
                      <span className="text-sm text-gray-700">Save request history</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked className="w-4 h-4 text-green-600 rounded" />
                      <span className="text-sm text-gray-700">Auto-format JSON responses</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="w-4 h-4 text-green-600 rounded" />
                      <span className="text-sm text-gray-700">Follow redirects</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Main Testing Area */}
        <div className="flex-1 flex flex-col">
          <div className="border-b border-gray-200 px-6 py-3 bg-white">
            <div className="flex items-center justify-end">
              {request.url && (
                <Button size="sm" onClick={handleSaveRequest} className="h-8 text-sm px-4 bg-green-600 hover:bg-green-700 text-white">
                  {activeRequestId ? 'Update' : 'Save'}
                </Button>
              )}
            </div>
          </div>
          
          <div className="flex-1 flex">
            {activeTab === 'rest' && (
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
            )}
            
            {activeTab === 'graphql' && (
              <div className="flex-1 text-center py-8 text-gray-500">
                <p className="text-sm">GraphQL support coming soon</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}