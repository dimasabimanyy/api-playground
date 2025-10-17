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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white h-16 flex items-center px-6 relative shadow-sm">
        <div className="flex items-center space-x-4 min-w-0 flex-shrink-0">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-green-600 to-green-700 flex items-center justify-center shadow-sm">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-lg font-semibold text-gray-900">API Playground</h1>
          </div>
        </div>
        
        {/* Search Input - Absolutely centered */}
        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search requests and collections..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 w-96 text-sm border-gray-200 bg-gray-50 focus:border-green-500 focus:ring-2 focus:ring-green-100 focus:bg-white rounded-lg transition-all duration-200"
            />
          </div>
        </div>
        
        {showShared && (
          <div className="absolute top-1/2 transform -translate-y-1/2 left-1/2 translate-x-52 text-sm text-blue-700 bg-blue-50 px-3 py-2 rounded-lg border border-blue-200 shadow-sm">
            Shared request loaded
          </div>
        )}
        
        <div className="flex items-center space-x-4 ml-auto">
          {/* REST/GraphQL Toggle */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="h-9 bg-gray-100 p-1 rounded-lg">
              <TabsTrigger value="rest" className="text-sm px-4 py-1 font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md">REST</TabsTrigger>
              <TabsTrigger value="graphql" disabled className="text-sm px-4 py-1 text-gray-400 rounded-md">GraphQL</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="h-6 w-px bg-gray-200" />
          <Button 
            variant="outline" 
            size="sm"
            className="h-9 px-6 text-sm font-medium border-gray-200 hover:bg-gray-50 rounded-lg transition-all duration-200"
          >
            Sign in
          </Button>
        </div>
      </header>

      {/* Main Content Layout */}
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Menu Sidebar */}
        <div className="group w-14 hover:w-48 border-r border-gray-800/20 bg-gray-900 flex flex-col transition-all duration-300 ease-out">
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
                className={`w-full h-10 mx-2 px-2 justify-start rounded-lg transition-all duration-200 cursor-pointer ${
                  activeMenuTab === 'collections' && !sidebarCollapsed
                    ? 'bg-green-600 text-white hover:bg-green-700 shadow-sm'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
                style={{ width: 'calc(100% - 1rem)' }}
              >
                <FolderOpen className="h-4 w-4 flex-shrink-0" />
                <span className="ml-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap text-sm font-medium">
                  Collections
                </span>
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
                className={`w-full h-10 mx-2 px-2 justify-start rounded-lg transition-all duration-200 cursor-pointer ${
                  activeMenuTab === 'history' && !sidebarCollapsed
                    ? 'bg-green-600 text-white hover:bg-green-700 shadow-sm'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
                style={{ width: 'calc(100% - 1rem)' }}
              >
                <History className="h-4 w-4 flex-shrink-0" />
                <span className="ml-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap text-sm font-medium">
                  History
                </span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (activeMenuTab === 'environments' && !sidebarCollapsed) {
                    setSidebarCollapsed(true)
                  } else {
                    setActiveMenuTab('environments')
                    setSidebarCollapsed(false)
                    setShowHistory(false)
                  }
                }}
                className={`w-full h-10 mx-2 px-2 justify-start rounded-lg transition-all duration-200 cursor-pointer ${
                  activeMenuTab === 'environments' && !sidebarCollapsed
                    ? 'bg-green-600 text-white hover:bg-green-700 shadow-sm'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
                style={{ width: 'calc(100% - 1rem)' }}
              >
                <Globe className="h-4 w-4 flex-shrink-0" />
                <span className="ml-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap text-sm font-medium">
                  Environments
                </span>
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
                className={`w-full h-10 mx-2 px-2 justify-start rounded-lg transition-all duration-200 cursor-pointer ${
                  activeMenuTab === 'settings' && !sidebarCollapsed
                    ? 'bg-green-600 text-white hover:bg-green-700 shadow-sm'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
                style={{ width: 'calc(100% - 1rem)' }}
              >
                <Settings className="h-4 w-4 flex-shrink-0" />
                <span className="ml-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap text-sm font-medium">
                  Settings
                </span>
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
            activeRequestId={currentTab?.collectionRequestId}
          />
        )}
        
        {!sidebarCollapsed && activeMenuTab === 'history' && (
          <div className="w-64 border-r border-gray-200 bg-white h-full">
            <HistoryPanel onLoadRequest={handleLoadFromHistory} />
          </div>
        )}
        
        {!sidebarCollapsed && activeMenuTab === 'environments' && (
          <div className="w-64 border-r border-gray-200 bg-white h-full flex flex-col">
            {/* Environments Header */}
            <div className="px-4 py-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-gray-900">Environments</h2>
              </div>
              
              {/* Current Environment Selector */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-700">Active Environment</label>
                <EnvironmentSelector />
              </div>
            </div>

            {/* Environment Management */}
            <div className="flex-1 overflow-y-auto bg-white">
              <div className="px-4 pb-4">
                <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                  <p className="font-medium mb-1">Environment Variables</p>
                  <p className="text-xs">Use the settings button in the environment selector above to manage your environment variables and create new environments.</p>
                </div>
              </div>
            </div>
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

                {/* Editor Settings */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-gray-900">Editor</h3>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked className="w-4 h-4 text-green-600 rounded" />
                      <span className="text-sm text-gray-700">Word wrap</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="w-4 h-4 text-green-600 rounded" />
                      <span className="text-sm text-gray-700">Show line numbers</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Main Testing Area */}
        <div className="flex-1 flex flex-col">
          {/* Request Tabs */}
          <div className="bg-gray-50 border-b border-gray-200">
            <div className="flex items-center justify-between px-6">
              <div className="flex items-center overflow-x-auto scrollbar-hide">
                {requestTabs.map((tab) => (
                  <div
                    key={tab.id}
                    className={`flex items-center gap-3 px-4 py-3 cursor-pointer min-w-0 group relative ${
                      tab.id === activeTabId
                        ? 'bg-white text-gray-900 shadow-sm border-t-2 border-t-green-500'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                    }`}
                    onClick={() => setActiveTabId(tab.id)}
                  >
                    <span className={`text-xs font-semibold px-2 py-1 rounded-md flex-shrink-0 ${
                      tab.request.method === 'GET' ? 'text-emerald-700 bg-emerald-50 border border-emerald-200' :
                      tab.request.method === 'POST' ? 'text-blue-700 bg-blue-50 border border-blue-200' :
                      tab.request.method === 'PUT' ? 'text-amber-700 bg-amber-50 border border-amber-200' :
                      tab.request.method === 'DELETE' ? 'text-red-700 bg-red-50 border border-red-200' :
                      'text-gray-700 bg-gray-50 border border-gray-200'
                    }`}>
                      {tab.request.method}
                    </span>
                    <span className={`text-sm font-medium truncate min-w-0 ${tab.isModified ? 'text-orange-600' : ''}`}>
                      {tab.name}
                      {tab.isModified && <span className="text-orange-500 ml-1">•</span>}
                    </span>
                    {requestTabs.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          closeTab(tab.id)
                        }}
                        className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-all duration-200 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md flex-shrink-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={createNewTab}
                  className="h-8 w-8 p-0 mx-2 text-gray-400 hover:text-gray-700 hover:bg-white rounded-lg transition-all duration-200 flex-shrink-0"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center py-3">
                {request.url && (
                  <Button size="sm" onClick={handleSaveRequest} className="h-9 text-sm px-6 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg shadow-sm transition-all duration-200">
                    {currentTab?.collectionRequestId ? 'Update' : 'Save'}
                  </Button>
                )}
              </div>
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
                  currentRequestName={currentTab?.name}
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