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
    <div className="min-h-screen bg-[#111] text-white">
      {/* Header - Dark Premium Style */}
      <header className="border-b border-gray-800/50 bg-[#111]/80 backdrop-blur-xl h-14 flex items-center px-6">
        <div className="flex items-center space-x-6 min-w-0 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <h1 className="text-lg font-semibold text-white tracking-tight">API Playground</h1>
          </div>
        </div>
        
        <div className="flex-1 flex justify-center max-w-lg mx-auto">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search requests, collections..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-9 text-sm border-0 bg-gray-800/50 text-white placeholder-gray-400 focus:bg-gray-800/80 focus:ring-1 focus:ring-blue-500/50 rounded-lg transition-all backdrop-blur-sm"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-3 ml-auto">
          <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-all duration-200">
            <Settings className="h-4 w-4" />
          </button>
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
            <User className="h-4 w-4 text-gray-300" />
          </div>
        </div>
      </header>

      {/* Main Content Layout - Dark Premium */}
      <div className="flex h-[calc(100vh-3.5rem)]">
        {/* Left Sidebar - Dark Glassy */}
        <div className="w-72 border-r border-gray-800/50 bg-[#1a1a1a]/50 backdrop-blur-xl flex flex-col">
          <div className="p-6 border-b border-gray-800/50">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-white tracking-wide">Collections</h2>
              <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-all duration-200 group">
                <Plus className="h-4 w-4 group-hover:scale-110 transition-transform" />
              </button>
            </div>
            
            <button className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 rounded-lg transition-all duration-200 shadow-lg hover:shadow-blue-500/25 mb-4">
              <Plus className="h-4 w-4 text-white" />
              <span className="text-sm font-medium text-white">New Request</span>
            </button>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Filter collections..."
                className="pl-10 h-9 text-sm border-0 bg-gray-800/30 text-white placeholder-gray-500 focus:bg-gray-800/50 focus:ring-1 focus:ring-blue-500/50 rounded-lg transition-all backdrop-blur-sm"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            <div className="p-4">
              <div className="space-y-2">
                <div className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Workspace</div>
                <button
                  onClick={() => {
                    setActiveMenuTab('collections')
                    setSidebarCollapsed(false)
                    setShowHistory(false)
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-all duration-200 ${
                    activeMenuTab === 'collections'
                      ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                  }`}
                >
                  <FolderOpen className="h-4 w-4" />
                  My Collections
                </button>
                <button
                  onClick={() => {
                    setActiveMenuTab('history')
                    setSidebarCollapsed(false)
                    setShowHistory(false)
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-all duration-200 ${
                    activeMenuTab === 'history'
                      ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                  }`}
                >
                  <History className="h-4 w-4" />
                  Request History
                </button>
              </div>
              
              {/* Collections List */}
              <div className="mt-6">
                <div className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Recent Collections</div>
                <div className="space-y-1">
                  <div className="p-3 rounded-lg bg-gray-800/30 border border-gray-700/50 hover:bg-gray-800/50 transition-all duration-200 cursor-pointer group">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="h-2 w-2 rounded-full bg-green-500"></div>
                      <span className="text-sm font-medium text-white">My API Tests</span>
                    </div>
                    <div className="text-xs text-gray-400">3 requests</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        
        {/* Main Workbench - Dark Premium */}
        <div className="flex-1 flex flex-col bg-[#111]">
          {/* Request Tabs - Dark Premium Style */}
          <div className="bg-[#1a1a1a]/50 border-b border-gray-800/50 backdrop-blur-xl">
            <div className="flex items-center px-6 py-3">
              <div className="flex items-center overflow-x-auto scrollbar-hide gap-1">
                {requestTabs.map((tab, index) => {
                  const getMethodColor = (method) => {
                    const colors = {
                      GET: 'text-emerald-400',
                      POST: 'text-blue-400', 
                      PUT: 'text-orange-400',
                      PATCH: 'text-yellow-400',
                      DELETE: 'text-red-400',
                    }
                    return colors[method] || 'text-gray-400'
                  }
                  
                  const getMethodBg = (method) => {
                    const colors = {
                      GET: 'bg-emerald-500/10 border-emerald-500/20',
                      POST: 'bg-blue-500/10 border-blue-500/20', 
                      PUT: 'bg-orange-500/10 border-orange-500/20',
                      PATCH: 'bg-yellow-500/10 border-yellow-500/20',
                      DELETE: 'bg-red-500/10 border-red-500/20',
                    }
                    return colors[method] || 'bg-gray-500/10 border-gray-500/20'
                  }
                  
                  return (
                    <div
                      key={tab.id}
                      className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer min-w-0 group rounded-lg transition-all duration-200 ${
                        tab.id === activeTabId
                          ? 'bg-gray-800/50 text-white border border-gray-700/50 shadow-lg'
                          : 'text-gray-400 hover:text-white hover:bg-gray-800/30'
                      }`}
                      onClick={() => setActiveTabId(tab.id)}
                    >
                      <div className={`px-2 py-1 rounded text-xs font-medium border ${getMethodBg(tab.request.method)} ${getMethodColor(tab.request.method)} flex-shrink-0`}>
                        {tab.request.method}
                      </div>
                      <span className={`text-sm truncate min-w-0 ${tab.isModified ? 'italic' : ''}`}>
                        {tab.name || 'Untitled Request'}
                        {tab.isModified && <span className="text-blue-400 ml-1">•</span>}
                      </span>
                      {requestTabs.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            closeTab(tab.id)
                          }}
                          className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-all duration-200 text-gray-500 hover:text-white hover:bg-gray-700 rounded flex-shrink-0 flex items-center justify-center"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  )
                })}
                <button
                  onClick={createNewTab}
                  className="h-9 w-9 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-all duration-200 flex-shrink-0 flex items-center justify-center group"
                >
                  <Plus className="h-4 w-4 group-hover:scale-110 transition-transform" />
                </button>
              </div>
              <div className="flex items-center ml-auto">
                {request.url && (
                  <button onClick={handleSaveRequest} className="h-8 text-sm px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded-lg transition-all duration-200 shadow-lg hover:shadow-blue-500/25">
                    {currentTab?.collectionRequestId ? 'Update' : 'Save'}
                  </button>
                )}
              </div>
            </div>
          </div>
          
          {/* Main Content Area - Dark Premium Split View */}
          <div className="flex-1 flex bg-[#111]">
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