'use client'

import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Share2, History, BookOpen, Check, Copy, PanelLeftOpen, PanelLeftClose, Zap, FolderOpen, User, Settings, Globe, Search, Plus, X } from 'lucide-react'
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
  // Request tabs state
  const [requestTabs, setRequestTabs] = useState([
    {
      id: '1',
      name: 'Untitled',
      request: {
        method: 'GET',
        url: 'https://jsonplaceholder.typicode.com/posts/1',
        headers: {},
        body: ''
      },
      response: null,
      loading: false,
      collectionRequestId: null,
      isModified: false
    }
  ])
  const [activeTabId, setActiveTabId] = useState('1')
  
  const [activeTab, setActiveTab] = useState('rest')
  const [shareUrl, setShareUrl] = useState('')
  const [showShared, setShowShared] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)
  const [activeCollectionId, setActiveCollectionId] = useState('my-apis')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [activeMenuTab, setActiveMenuTab] = useState('collections')
  const [searchQuery, setSearchQuery] = useState('')

  // Helper functions for tab management
  const getCurrentTab = () => requestTabs.find(tab => tab.id === activeTabId)
  
  const updateCurrentTab = (updates) => {
    setRequestTabs(tabs => tabs.map(tab => 
      tab.id === activeTabId 
        ? { ...tab, ...updates, isModified: true }
        : tab
    ))
  }

  const createNewTab = () => {
    const newTabId = Date.now().toString()
    const newTab = {
      id: newTabId,
      name: 'Untitled',
      request: {
        method: 'GET',
        url: '',
        headers: {},
        body: ''
      },
      response: null,
      loading: false,
      collectionRequestId: null,
      isModified: false
    }
    setRequestTabs(tabs => [...tabs, newTab])
    setActiveTabId(newTabId)
  }

  const closeTab = (tabId) => {
    if (requestTabs.length === 1) return // Don't close the last tab
    
    setRequestTabs(tabs => {
      const newTabs = tabs.filter(tab => tab.id !== tabId)
      // If we're closing the active tab, switch to the previous one
      if (tabId === activeTabId) {
        const activeIndex = tabs.findIndex(tab => tab.id === tabId)
        const newActiveIndex = activeIndex > 0 ? activeIndex - 1 : 0
        setActiveTabId(newTabs[newActiveIndex].id)
      }
      return newTabs
    })
  }

  // Load shared request and active collection on mount
  useEffect(() => {
    const sharedRequest = getSharedRequest()
    if (sharedRequest) {
      updateCurrentTab({ request: sharedRequest })
      setShowShared(true)
      setTimeout(() => setShowShared(false), 3000)
    }
    
    // Load active collection
    const activeColId = getActiveCollectionId()
    setActiveCollectionId(activeColId)
  }, [])

  // Get current tab data
  const currentTab = getCurrentTab()
  const request = currentTab?.request || { method: 'GET', url: '', headers: {}, body: '' }
  const response = currentTab?.response || null
  const loading = currentTab?.loading || false

  const handleCollectionSelect = (collectionId) => {
    setActiveCollectionId(collectionId)
  }

  const handleRequestSelect = (selectedRequest) => {
    updateCurrentTab({
      name: selectedRequest.name,
      request: {
        method: selectedRequest.method,
        url: selectedRequest.url,
        headers: selectedRequest.headers,
        body: selectedRequest.body
      },
      response: null,
      collectionRequestId: selectedRequest.id,
      isModified: false
    })
  }

  const handleSaveRequest = () => {
    if (!request.url) return
    
    const requestData = {
      name: currentTab?.name || `${request.method} ${new URL(request.url).pathname}`,
      description: '',
      method: request.method,
      url: request.url,
      headers: request.headers,
      body: request.body,
      tags: []
    }

    if (currentTab?.collectionRequestId) {
      // Update existing request
      updateRequestInCollection(activeCollectionId, currentTab.collectionRequestId, requestData)
    } else {
      // Create new request
      const newRequest = addRequestToCollection(activeCollectionId, requestData)
      if (newRequest) {
        updateCurrentTab({
          collectionRequestId: newRequest.id,
          name: newRequest.name,
          isModified: false
        })
      }
    }
  }

  const executeRequest = async () => {
    updateCurrentTab({ loading: true })
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
      
      updateCurrentTab({ response: responseData, loading: false })
      
      // Save to history
      saveToHistory(request, responseData)
    } catch (error) {
      const errorResponse = {
        error: error.message,
        status: 0,
        time: 0
      }
      
      updateCurrentTab({ response: errorResponse, loading: false })
      
      // Save failed requests to history too
      saveToHistory(request, errorResponse)
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
    updateCurrentTab({ 
      request: historicalRequest,
      name: `${historicalRequest.method} ${historicalRequest.url}`,
      response: null,
      collectionRequestId: null,
      isModified: false
    })
    setShowHistory(false)
  }

  // Request modification handlers
  const setRequest = (newRequest) => {
    updateCurrentTab({ request: newRequest })
  }

  const setCurrentRequestName = (name) => {
    updateCurrentTab({ name })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Postman Style */}
      <header className="border-b border-gray-200 bg-white h-12 flex items-center px-4">
        <div className="flex items-center space-x-4 min-w-0 flex-shrink-0">
          <div className="h-7 w-7 rounded bg-orange-500 flex items-center justify-center">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <div className="flex items-center space-x-6">
            <span className="text-sm font-medium text-gray-900">Home</span>
            <span className="text-sm text-gray-600">Workspaces</span>
            <span className="text-sm text-gray-600">API Network</span>
          </div>
        </div>
        
        <div className="flex-1 flex justify-center max-w-md mx-auto">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search Postman"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-8 text-sm border border-gray-300 bg-white focus:border-orange-400 focus:ring-1 focus:ring-orange-100 rounded transition-all"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-3 ml-auto">
          <button className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded">
            <Settings className="h-4 w-4" />
          </button>
          <button className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded">
            <User className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Main Content Layout - Postman Style */}
      <div className="flex h-[calc(100vh-3rem)]">
        {/* Left Sidebar - Postman Style */}
        <div className="w-64 border-r border-gray-200 bg-white flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-900">Collections</h2>
              <button className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded">
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
              <Input
                placeholder="Filter"
                className="pl-7 h-7 text-xs border-gray-300 bg-white focus:border-orange-400 focus:ring-1 focus:ring-orange-100"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            <div className="p-2">
              <div className="space-y-1">
                <button
                  onClick={() => {
                    setActiveMenuTab('collections')
                    setSidebarCollapsed(false)
                    setShowHistory(false)
                  }}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded hover:bg-gray-100 ${
                    activeMenuTab === 'collections'
                      ? 'bg-orange-50 text-orange-700 font-medium'
                      : 'text-gray-700'
                  }`}
                >
                  <FolderOpen className="h-4 w-4" />
                  My Workspace
                </button>
                <button
                  onClick={() => {
                    setActiveMenuTab('history')
                    setSidebarCollapsed(false)
                    setShowHistory(false)
                  }}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded hover:bg-gray-100 ${
                    activeMenuTab === 'history'
                      ? 'bg-orange-50 text-orange-700 font-medium'
                      : 'text-gray-700'
                  }`}
                >
                  <History className="h-4 w-4" />
                  History
                </button>
              </div>
            </div>
          </div>
        </div>

        
        {/* Main Workbench - Postman Style */}
        <div className="flex-1 flex flex-col bg-gray-50">
          {/* Request Tabs - Postman Style */}
          <div className="bg-white border-b border-gray-200">
            <div className="flex items-center px-4 py-2">
              <div className="flex items-center overflow-x-auto scrollbar-hide">
                {requestTabs.map((tab, index) => {
                  const getMethodColor = (method) => {
                    const colors = {
                      GET: 'text-green-600',
                      POST: 'text-orange-600', 
                      PUT: 'text-blue-600',
                      PATCH: 'text-yellow-600',
                      DELETE: 'text-red-600',
                    }
                    return colors[method] || 'text-gray-600'
                  }
                  
                  return (
                    <div
                      key={tab.id}
                      className={`flex items-center gap-2 px-3 py-2 cursor-pointer min-w-0 group border-r border-gray-200 transition-colors ${
                        tab.id === activeTabId
                          ? 'bg-white text-gray-900'
                          : 'bg-gray-50 text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                      onClick={() => setActiveTabId(tab.id)}
                    >
                      <span className={`text-xs font-bold ${getMethodColor(tab.request.method)} flex-shrink-0`}>
                        {tab.request.method}
                      </span>
                      <span className={`text-sm truncate min-w-0 ${tab.isModified ? 'italic' : ''}`}>
                        {tab.name || 'Untitled Request'}
                        {tab.isModified && <span className="text-orange-500 ml-1">•</span>}
                      </span>
                      {requestTabs.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            closeTab(tab.id)
                          }}
                          className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-gray-600 flex-shrink-0 rounded"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  )
                })}
                <button
                  onClick={createNewTab}
                  className="h-8 w-8 text-gray-400 hover:text-gray-600 hover:bg-gray-100 border-r border-gray-200 bg-gray-50 transition-colors flex-shrink-0 flex items-center justify-center"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <div className="flex items-center ml-auto">
                {request.url && (
                  <button onClick={handleSaveRequest} className="h-7 text-sm px-3 bg-orange-500 hover:bg-orange-600 text-white rounded transition-colors">
                    {currentTab?.collectionRequestId ? 'Update' : 'Save'}
                  </button>
                )}
              </div>
            </div>
          </div>
          
          {/* Main Content Area - Postman Style */}
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
              currentRequestName={currentTab?.name}
              setCurrentRequestName={setCurrentRequestName}
            />
            <ResponsePanel response={response} loading={loading} request={request} />
          </div>
        </div>
      </div>
    </div>
  )
}