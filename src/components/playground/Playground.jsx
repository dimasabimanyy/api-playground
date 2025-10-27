"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Share2,
  History,
  BookOpen,
  Check,
  Copy,
  PanelLeftOpen,
  PanelLeftClose,
  Zap,
  FolderOpen,
  Settings,
  Globe,
  Search,
  Plus,
  X,
  Moon,
  Sun,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Pencil,
  Send,
  Trash2,
  Loader2,
  MoreHorizontal,
  FileText,
  Edit,
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { useCollections } from "@/contexts/CollectionsContext";
import { getThemeClasses, getMethodColors } from "@/lib/theme";
import RequestPanel from "./RequestPanel";
import ResponsePanel from "./ResponsePanel";
import { generateShareableUrl, getSharedRequest } from "@/lib/share-encoding";
import { saveToHistory } from "@/lib/storage";
import { processRequestWithVariables } from "@/lib/environments";
import DocGeneratorModal from "@/components/docs/DocGeneratorModal";

function UserAvatar({ user, isDark }) {
  const [imageLoaded, setImageLoaded] = useState(true);
  const [imageSrc, setImageSrc] = useState(null);

  useEffect(() => {
    if (user?.user_metadata?.avatar_url) {
      // Fix Google profile image URL by removing size parameter and adding referrer policy bypass
      let avatarUrl = user.user_metadata.avatar_url;
      
      // If it's a Google profile image, modify the URL for better compatibility
      if (avatarUrl.includes('googleusercontent.com')) {
        // Remove the size parameter (=s96-c) and replace with a larger size
        avatarUrl = avatarUrl.replace(/=s\d+-c$/, '=s128-c');
      }
      
      setImageSrc(avatarUrl);
      setImageLoaded(true);
    }
  }, [user]);

  const getInitials = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name.charAt(0).toUpperCase();
    }
    if (user?.user_metadata?.name) {
      return user.user_metadata.name.charAt(0).toUpperCase();
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  if (imageLoaded && imageSrc) {
    return (
      <div className="w-8 h-8 rounded-full overflow-hidden cursor-pointer">
        <Image 
          src={imageSrc}
          alt="User avatar"
          width={32}
          height={32}
          className="object-cover"
          unoptimized
          onError={() => {
            console.log('Profile image failed to load:', imageSrc);
            setImageLoaded(false);
          }}
        />
      </div>
    );
  }

  return (
    <div
      className={`h-8 w-8 rounded-full flex items-center justify-center cursor-pointer ${
        isDark
          ? "bg-gradient-to-br from-blue-600 to-blue-700"
          : "bg-gradient-to-br from-blue-500 to-blue-600"
      } text-white font-medium text-sm`}
    >
      {getInitials()}
    </div>
  );
}

export default function Playground() {
  const { toggleTheme, isDark } = useTheme();
  const { user, signOut, loading: authLoading } = useAuth();
  const { collections, activeCollectionId, setActiveCollectionId, addRequestToCollection, updateRequestInCollection, saveToHistory, createCollection, deleteCollection } = useCollections();
  const themeClasses = getThemeClasses(isDark);
  // Request tabs state
  const [requestTabs, setRequestTabs] = useState([
    {
      id: "1",
      name: "Untitled",
      request: {
        method: "GET",
        url: "https://jsonplaceholder.typicode.com/posts/1",
        headers: {},
        body: "",
      },
      response: null,
      loading: false,
      collectionRequestId: null,
      isModified: false,
    },
  ]);
  const [activeTabId, setActiveTabId] = useState("1");

  const [shareUrl, setShareUrl] = useState("");
  const [showShared, setShowShared] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeMenuTab, setActiveMenuTab] = useState("collections");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingRequestName, setEditingRequestName] = useState(false);
  
  // Collections state
  const [expandedCollections, setExpandedCollections] = useState(new Set(['my-api-tests'])); // Default expanded
  const [editingCollection, setEditingCollection] = useState(null);
  const [editingRequest, setEditingRequest] = useState(null);

  // Modal states
  const [docsModalOpen, setDocsModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [createCollectionDialogOpen, setCreateCollectionDialogOpen] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [creatingCollection, setCreatingCollection] = useState(false);

  // Environments state
  const [expandedEnvironments, setExpandedEnvironments] = useState(new Set());
  const [editingEnvironment, setEditingEnvironment] = useState(null);


  // Sample history data
  const historyItems = [
    { id: 'hist-1', name: 'Get User Profile', method: 'GET', url: '/api/users/me', timestamp: '2 min ago', status: 200 },
    { id: 'hist-2', name: 'Create User', method: 'POST', url: '/api/users', timestamp: '5 min ago', status: 201 },
    { id: 'hist-3', name: 'Update Settings', method: 'PUT', url: '/api/settings', timestamp: '10 min ago', status: 200 },
    { id: 'hist-4', name: 'Failed Login', method: 'POST', url: '/auth/login', timestamp: '15 min ago', status: 401 },
    { id: 'hist-5', name: 'Get All Users', method: 'GET', url: '/api/users', timestamp: '1 hour ago', status: 200 },
  ];

  // Sample environments data
  const environments = [
    {
      id: 'dev',
      name: 'Development',
      variables: [
        { key: 'BASE_URL', value: 'https://api.dev.example.com' },
        { key: 'API_KEY', value: 'dev_key_123' },
        { key: 'VERSION', value: 'v1' }
      ]
    },
    {
      id: 'prod',
      name: 'Production',
      variables: [
        { key: 'BASE_URL', value: 'https://api.example.com' },
        { key: 'API_KEY', value: 'prod_key_456' },
        { key: 'VERSION', value: 'v1' }
      ]
    }
  ];

  // Sample trash data
  const trashItems = [
    { id: 'trash-1', name: 'Old API Collection', type: 'collection', deletedAt: '2 days ago' },
    { id: 'trash-2', name: 'Test Request', type: 'request', method: 'DELETE', deletedAt: '1 week ago' },
  ];

  // Collection management functions
  const toggleCollection = (collectionId) => {
    const newExpanded = new Set(expandedCollections);
    if (newExpanded.has(collectionId)) {
      newExpanded.delete(collectionId);
    } else {
      newExpanded.add(collectionId);
    }
    setExpandedCollections(newExpanded);
  };

  // Environment management functions
  const toggleEnvironment = (envId) => {
    const newExpanded = new Set(expandedEnvironments);
    if (newExpanded.has(envId)) {
      newExpanded.delete(envId);
    } else {
      newExpanded.add(envId);
    }
    setExpandedEnvironments(newExpanded);
  };

  // Sidebar menu items
  const sidebarMenuItems = [
    { id: "collections", icon: FolderOpen, label: "Collections", description: "Saved grouped requests" },
    { id: "history", icon: History, label: "History", description: "Past requests sent" },
    { id: "environments", icon: Globe, label: "Environments", description: "Manage variables like API keys, URLs, tokens" },
    { id: "docs", icon: BookOpen, label: "Docs", description: "Auto-generated API documentation" },
    { id: "settings", icon: Settings, label: "Settings", description: "User and app preferences" },
    { id: "trash", icon: Trash2, label: "Trash", description: "Deleted or outdated requests" },
  ];

  // Helper functions for tab management
  const getCurrentTab = () => requestTabs.find((tab) => tab.id === activeTabId);

  const updateCurrentTab = (updates) => {
    setRequestTabs((tabs) =>
      tabs.map((tab) =>
        tab.id === activeTabId ? { ...tab, ...updates, isModified: true } : tab
      )
    );
  };

  const createNewTab = () => {
    const newTabId = Date.now().toString();
    const newTab = {
      id: newTabId,
      name: "Untitled",
      request: {
        method: "GET",
        url: "",
        headers: {},
        body: "",
      },
      response: null,
      loading: false,
      collectionRequestId: null,
      isModified: false,
    };
    setRequestTabs((tabs) => [...tabs, newTab]);
    setActiveTabId(newTabId);
  };

  const closeTab = (tabId) => {
    if (requestTabs.length === 1) return; // Don't close the last tab

    setRequestTabs((tabs) => {
      const newTabs = tabs.filter((tab) => tab.id !== tabId);
      // If we're closing the active tab, switch to the previous one
      if (tabId === activeTabId) {
        const activeIndex = tabs.findIndex((tab) => tab.id === tabId);
        const newActiveIndex = activeIndex > 0 ? activeIndex - 1 : 0;
        setActiveTabId(newTabs[newActiveIndex].id);
      }
      return newTabs;
    });
  };

  // Load shared request and active collection on mount
  useEffect(() => {
    const sharedRequest = getSharedRequest();
    if (sharedRequest) {
      updateCurrentTab({ request: sharedRequest });
      setShowShared(true);
      setTimeout(() => setShowShared(false), 3000);
    }

    // Load active collection
    const activeColId = activeCollectionId;
    setActiveCollectionId(activeColId);
  }, []);

  // Get current tab data
  const currentTab = getCurrentTab();
  const request = currentTab?.request || {
    method: "GET",
    url: "",
    headers: {},
    body: "",
  };
  const response = currentTab?.response || null;
  const loading = currentTab?.loading || false;


  const handleSaveRequest = () => {
    if (!request.url) return;

    const requestData = {
      name:
        currentTab?.name ||
        `${request.method} ${new URL(request.url).pathname}`,
      description: "",
      method: request.method,
      url: request.url,
      headers: request.headers,
      body: request.body,
      tags: [],
    };

    if (currentTab?.collectionRequestId) {
      // Update existing request
      updateRequestInCollection(
        activeCollectionId,
        currentTab.collectionRequestId,
        requestData
      );
    } else {
      // Create new request
      const newRequest = addRequestToCollection(
        activeCollectionId,
        requestData
      );
      if (newRequest) {
        updateCurrentTab({
          collectionRequestId: newRequest.id,
          name: newRequest.name,
          isModified: false,
        });
      }
    }
  };

  const executeRequest = async () => {
    updateCurrentTab({ loading: true });
    try {
      // Process request with environment variables
      const processedRequest = processRequestWithVariables(request);

      const options = {
        method: processedRequest.method,
        headers: {
          "Content-Type": "application/json",
          ...processedRequest.headers,
        },
      };

      if (processedRequest.method !== "GET" && processedRequest.body) {
        options.body = processedRequest.body;
      }

      const startTime = Date.now();
      const res = await fetch(processedRequest.url, options);
      const endTime = Date.now();

      const data = await res.text();
      let parsedData = data;

      try {
        parsedData = JSON.parse(data);
      } catch (e) {
        // Keep as text if not JSON
      }

      const responseData = {
        status: res.status,
        statusText: res.statusText,
        headers: Object.fromEntries(res.headers.entries()),
        data: parsedData,
        time: endTime - startTime,
        size: new Blob([data]).size,
      };

      updateCurrentTab({ response: responseData, loading: false });

      // Save to history
      saveToHistory(request, responseData);
    } catch (error) {
      const errorResponse = {
        error: error.message,
        status: 0,
        time: 0,
      };

      updateCurrentTab({ response: errorResponse, loading: false });

      // Save failed requests to history too
      saveToHistory(request, errorResponse);
    }
  };

  const handleShare = () => {
    const url = generateShareableUrl(request);
    if (url) {
      setShareUrl(url);
      setShareDialogOpen(true);
    }
  };

  const copyShareUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error("Failed to copy to clipboard:", err);
    }
  };

  const handleCreateCollection = async () => {
    if (!newCollectionName.trim()) return;
    
    setCreatingCollection(true);
    try {
      console.log('Creating collection:', newCollectionName);
      await createCollection(newCollectionName, '', 'blue');
      setCreateCollectionDialogOpen(false);
      setNewCollectionName('');
    } catch (err) {
      console.error('Failed to create collection:', err);
    } finally {
      setCreatingCollection(false);
    }
  };

  const handleDeleteCollection = async (collectionId, collectionName) => {
    if (window.confirm(`Are you sure you want to delete "${collectionName}"? This will also delete all requests in this collection.`)) {
      try {
        console.log('Deleting collection:', collectionId);
        await deleteCollection(collectionId);
      } catch (err) {
        console.error('Failed to delete collection:', err);
      }
    }
  };

  const handleCreateRequest = async (collectionId) => {
    try {
      console.log('Creating new request in collection:', collectionId);
      
      // Create a new request object
      const newRequest = {
        name: 'Untitled Request',
        description: '',
        method: 'GET',
        url: '',
        headers: {},
        body: '',
        tags: []
      };
      
      // Add the request to the collection in the database
      const savedRequest = await addRequestToCollection(collectionId, newRequest);
      
      // Create a new tab with this request
      const newTabId = Date.now().toString();
      const newTab = {
        id: newTabId,
        name: savedRequest.name,
        request: {
          method: savedRequest.method,
          url: savedRequest.url,
          headers: savedRequest.headers || {},
          body: savedRequest.body || '',
        },
        response: null,
        loading: false,
        collectionRequestId: savedRequest.id,
        isModified: false,
      };
      
      // Add the new tab and make it active
      setRequestTabs(prev => [...prev, newTab]);
      setActiveTabId(newTabId);
      
      // Expand the collection to show the new request
      setExpandedCollections(prev => new Set(prev).add(collectionId));
      
      console.log('New request created and tab opened:', savedRequest);
      
    } catch (err) {
      console.error('Failed to create request:', err);
    }
  };

  const handleEditCollection = (collectionId) => {
    setEditingCollection(collectionId);
  };

  const handleDuplicateCollection = async (collection) => {
    try {
      console.log('Duplicating collection:', collection.name);
      const duplicatedName = `${collection.name} Copy`;
      await createCollection(duplicatedName, collection.description, collection.color);
      // TODO: Also duplicate the requests in the collection
    } catch (err) {
      console.error('Failed to duplicate collection:', err);
    }
  };

  const handleRequestClick = (request) => {
    console.log('Opening request in new tab:', request.name);
    
    // Check if request is already open in a tab
    const existingTab = requestTabs.find(tab => tab.collectionRequestId === request.id);
    
    if (existingTab) {
      // If tab exists, just switch to it
      setActiveTabId(existingTab.id);
      return;
    }
    
    // Create a new tab with this request
    const newTabId = Date.now().toString();
    const newTab = {
      id: newTabId,
      name: request.name,
      request: {
        method: request.method,
        url: request.url,
        headers: request.headers || {},
        body: request.body || '',
      },
      response: null,
      loading: false,
      collectionRequestId: request.id,
      isModified: false,
    };
    
    // Add the new tab and make it active
    setRequestTabs(prev => [...prev, newTab]);
    setActiveTabId(newTabId);
  };

  // Request modification handlers
  const setRequest = (newRequest) => {
    updateCurrentTab({ request: newRequest, isModified: true });
  };

  const setCurrentRequestName = (name) => {
    updateCurrentTab({ name, isModified: true });
  };

  // Auto-save request changes to collection
  const saveCurrentRequestToCollection = async () => {
    const currentTab = requestTabs.find(tab => tab.id === activeTabId);
    if (!currentTab || !currentTab.collectionRequestId || !currentTab.isModified) {
      return;
    }

    try {
      const updatedRequest = {
        name: currentTab.name,
        method: currentTab.request.method,
        url: currentTab.request.url,
        headers: currentTab.request.headers,
        body: currentTab.request.body,
      };

      await updateRequestInCollection(currentTab.collectionRequestId, updatedRequest);
      
      // Mark as saved
      updateCurrentTab({ isModified: false });
      
      console.log('Request saved to collection');
    } catch (err) {
      console.error('Failed to save request to collection:', err);
    }
  };

  // Keyboard shortcut for saving (Ctrl+S / Cmd+S)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveCurrentRequestToCollection();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTabId, requestTabs]);

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${themeClasses.bg.primary} ${themeClasses.text.primary}`}
    >
      {/* Header - Theme Aware */}
      <header
        className={`border-b ${themeClasses.border.primary} ${themeClasses.bg.glass} h-14 flex items-center px-6 transition-all duration-300`}
      >
        <div className="flex items-center space-x-6 min-w-0 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <h1
              className={`text-lg font-semibold tracking-tight ${themeClasses.text.primary}`}
            >
              API Playground
            </h1>
          </div>
        </div>

        <div className="flex-1 flex justify-center max-w-lg mx-auto">
          <div className="relative w-full">
            <Search
              className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${themeClasses.text.tertiary}`}
            />
            <Input
              placeholder="Search requests, collections..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`pl-10 h-9 text-sm rounded backdrop-blur-sm ${themeClasses.input.base}`}
            />
          </div>
        </div>

        <div className="flex items-center space-x-3 ml-auto">
          <button
            onClick={toggleTheme}
            className={`p-2 rounded transition-all duration-200 ${themeClasses.button.ghost}`}
          >
            {isDark ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>
          <button
            className={`p-2 rounded transition-all duration-200 ${themeClasses.button.ghost}`}
          >
            <Settings className="h-4 w-4" />
          </button>
          
          {/* User Avatar/Auth Section */}
          {authLoading ? (
            <div className="h-8 w-8 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
          ) : user ? (
            <div className="relative group">
              <UserAvatar user={user} isDark={isDark} />
              
              {/* Dropdown Menu */}
              <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {user.user_metadata?.full_name || 'User'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {user.email}
                  </p>
                </div>
                <div className="p-1">
                  <button
                    onClick={() => signOut()}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={() => window.location.href = '/login'}
              className={`h-8 px-3 text-xs font-medium rounded transition-all duration-200 ${themeClasses.button.primary}`}
            >
              Sign in
            </button>
          )}
        </div>
      </header>

      {/* Main Content Layout - Theme Aware */}
      <div className="flex h-[calc(100vh-3.5rem)]">
        {/* Left Sidebar - Theme Aware */}
        <div
          className={`${sidebarCollapsed ? "w-16" : "w-72"} border-r ${
            themeClasses.border.primary
          } ${
            themeClasses.bg.glass
          } flex flex-col transition-all duration-300 relative`}
        >
          {/* Sidebar Toggle Button */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className={`absolute -right-3 top-6 z-10 w-6 h-6 rounded-full border transition-all duration-200 flex items-center justify-center ${themeClasses.card.base} ${themeClasses.button.ghost} shadow-sm`}
          >
            {sidebarCollapsed ? (
              <ChevronRight className="h-3 w-3" />
            ) : (
              <ChevronLeft className="h-3 w-3" />
            )}
          </button>

          {!sidebarCollapsed && (
            <>
              <div className={`p-4 border-b ${themeClasses.border.primary}`}>
                {/* <div className="flex items-center justify-between mb-4">
                  <h2
                    className={`text-sm font-semibold tracking-wide ${themeClasses.text.primary}`}
                  >
                    Collections
                  </h2>
                  <button
                    className={`p-2 rounded transition-all duration-200 group ${themeClasses.button.ghost}`}
                  >
                    <Plus className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  </button>
                </div> */}

                <button
                  onClick={createNewTab}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded transition-all duration-200 mb-3 ${themeClasses.button.primary}`}
                >
                  <Plus className="h-3 w-3 text-white" />
                  <span className="text-sm font-medium text-white">
                    New Request
                  </span>
                </button>

                <div className="relative">
                  <Search
                    className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${themeClasses.text.tertiary}`}
                  />
                  <Input
                    placeholder="Filter collections..."
                    className={`pl-10 h-9 text-sm rounded backdrop-blur-sm ${themeClasses.input.base}`}
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                <div className="p-4">
                  {/* Main Navigation */}
                  <div className="space-y-1 mb-6">
                    {sidebarMenuItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeMenuTab === item.id;
                      
                      return (
                        <button
                          key={item.id}
                          onClick={() => setActiveMenuTab(item.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-all duration-200 cursor-pointer ${
                            isActive
                              ? `${themeClasses.text.accent} ${isDark ? 'bg-blue-500/10' : 'bg-blue-50'}`
                              : `${themeClasses.text.secondary} hover:${themeClasses.text.primary} hover:${isDark ? 'bg-gray-800/30' : 'bg-gray-100/50'}`
                          }`}
                        >
                          <Icon className="h-4 w-4 flex-shrink-0" />
                          {item.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Dynamic Content Based on Active Menu */}
                  <div>
                    {/* Collections Content */}
                    {activeMenuTab === "collections" && (
                      <>
                        <div className="flex items-center justify-between mb-3">
                          <span className={`text-xs font-medium ${themeClasses.text.tertiary}`}>
                            Your Collections
                          </span>
                          <button 
                            className={`p-1 rounded transition-all duration-200 ${themeClasses.button.ghost}`}
                            onClick={() => {
                              console.log('Plus button clicked - opening create collection dialog');
                              setCreateCollectionDialogOpen(true);
                            }}
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        
                        <div className="space-y-1">
                          {Object.values(collections).map((collection) => {
                            const isExpanded = expandedCollections.has(collection.id);
                            
                            return (
                              <div key={collection.id} className="space-y-1">
                                {/* Collection Header */}
                                <div
                                  className={`group relative flex items-center gap-2 py-2 px-3 transition-all duration-200 cursor-pointer hover:${isDark ? 'bg-gray-800/30' : 'bg-gray-100/50'} rounded-lg`}
                                >
                                  {/* Expand/Collapse Chevron */}
                                  <button
                                    onClick={() => toggleCollection(collection.id)}
                                    className={`p-0.5 rounded transition-all duration-200 ${themeClasses.button.ghost}`}
                                  >
                                    <ChevronDown 
                                      className={`h-3 w-3 transition-transform duration-200 ${
                                        isExpanded ? 'rotate-0' : '-rotate-90'
                                      } ${themeClasses.text.tertiary}`} 
                                    />
                                  </button>
                                  
                                  
                                  {/* Collection Name */}
                                  <div className="flex-1 min-w-0">
                                    {editingCollection === collection.id ? (
                                      <input
                                        type="text"
                                        defaultValue={collection.name}
                                        onBlur={() => setEditingCollection(null)}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter') setEditingCollection(null);
                                        }}
                                        className={`w-full text-sm font-medium bg-transparent border border-gray-300 rounded px-1 py-0.5 outline-none focus:border-blue-500 ${themeClasses.text.primary}`}
                                        autoFocus
                                      />
                                    ) : (
                                      <div className="flex items-center justify-between w-full">
                                        <div className={`text-sm font-medium ${themeClasses.text.primary} truncate flex-1`}>
                                          {collection.name}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                  
                                  {/* Collection Menu */}
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <button
                                        onClick={(e) => e.stopPropagation()}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                        title="Collection menu"
                                      >
                                        <MoreHorizontal className="h-4 w-4" />
                                      </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-48">
                                      <DropdownMenuItem
                                        onClick={() => handleCreateRequest(collection.id)}
                                        className="flex items-center gap-2"
                                      >
                                        <Plus className="h-4 w-4" />
                                        Create Request
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem
                                        onClick={() => handleEditCollection(collection.id)}
                                        className="flex items-center gap-2"
                                      >
                                        <Edit className="h-4 w-4" />
                                        Rename Collection
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() => handleDuplicateCollection(collection)}
                                        className="flex items-center gap-2"
                                      >
                                        <Copy className="h-4 w-4" />
                                        Duplicate Collection
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      {collection.name !== 'Examples' && (
                                        <DropdownMenuItem
                                          onClick={() => handleDeleteCollection(collection.id, collection.name)}
                                          className="flex items-center gap-2 text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                          Delete Collection
                                        </DropdownMenuItem>
                                      )}
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                                
                                {/* Requests List */}
                                {isExpanded && (
                                  <div className="ml-6 space-y-0.5 overflow-hidden">
                                    {(collection.requests || []).map((request) => {
                                      const methodColors = getMethodColors(request.method, isDark);
                                      const isSelected = requestTabs.some(tab => tab.collectionRequestId === request.id && tab.id === activeTabId);
                                      
                                      return (
                                        <div
                                          key={request.id}
                                          onClick={() => handleRequestClick(request)}
                                          className={`group relative flex items-center gap-3 py-1.5 px-3 transition-all duration-200 cursor-pointer rounded-lg ${
                                            isSelected 
                                              ? `${isDark ? 'bg-blue-500/10 border-l-2 border-blue-500' : 'bg-blue-50 border-l-2 border-blue-500'}` 
                                              : `hover:${isDark ? 'bg-gray-800/20' : 'bg-gray-100/40'}`
                                          }`}
                                        >
                                          {/* HTTP Method Badge */}
                                          <div className={`px-1.5 py-0.5 rounded text-xs font-medium border ${methodColors.bg} ${methodColors.text} flex-shrink-0`}>
                                            {request.method}
                                          </div>
                                          
                                          {/* Request Name */}
                                          <div className="flex-1 min-w-0">
                                            {editingRequest === request.id ? (
                                              <input
                                                type="text"
                                                defaultValue={request.name}
                                                onBlur={() => setEditingRequest(null)}
                                                onKeyDown={(e) => {
                                                  if (e.key === 'Enter') setEditingRequest(null);
                                                }}
                                                className={`w-full text-xs bg-transparent border border-gray-300 rounded px-1 py-0.5 outline-none focus:border-blue-500 ${themeClasses.text.primary}`}
                                                autoFocus
                                              />
                                            ) : (
                                              <div
                                                onDoubleClick={() => setEditingRequest(request.id)}
                                                className={`text-xs ${themeClasses.text.primary} truncate`}
                                              >
                                                {request.name}
                                              </div>
                                            )}
                                          </div>
                                          
                                          {/* Edit Icon (visible on hover) */}
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setEditingRequest(request.id);
                                            }}
                                            className={`opacity-0 group-hover:opacity-100 p-1 rounded transition-all duration-200 ${themeClasses.button.ghost}`}
                                          >
                                            <Pencil className="h-3 w-3" />
                                          </button>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </>
                    )}

                    {/* History Content */}
                    {activeMenuTab === "history" && (
                      <>
                        <div className="flex items-center justify-between mb-3">
                          <span className={`text-xs font-medium ${themeClasses.text.tertiary}`}>
                            Recent Requests
                          </span>
                          <button className={`p-1 rounded transition-all duration-200 ${themeClasses.button.ghost}`}>
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                        
                        {historyItems.length === 0 ? (
                          <div className={`text-center py-12 ${themeClasses.text.tertiary}`}>
                            <History className={`h-8 w-8 mx-auto mb-3 ${themeClasses.text.tertiary}`} />
                            <p className={`text-sm ${themeClasses.text.primary}`}>No history yet</p>
                            <p className={`text-xs ${themeClasses.text.tertiary}`}>Your sent requests will appear here</p>
                          </div>
                        ) : (
                          <div className="space-y-1 max-h-96 overflow-y-auto">
                            {historyItems.map((item) => {
                              const methodColors = getMethodColors(item.method, isDark);
                              const statusColors = item.status >= 200 && item.status < 300 
                                ? (isDark ? 'text-emerald-400' : 'text-emerald-600')
                                : item.status >= 400 
                                ? (isDark ? 'text-red-400' : 'text-red-600') 
                                : (isDark ? 'text-yellow-400' : 'text-yellow-600');
                              
                              return (
                                <div
                                  key={item.id}
                                  onClick={() => {
                                    // Load this request into the editor
                                    updateCurrentTab({
                                      request: {
                                        method: item.method,
                                        url: item.url,
                                        headers: {},
                                        body: ""
                                      },
                                      name: item.name,
                                      response: null,
                                      collectionRequestId: null,
                                      isModified: false,
                                    });
                                  }}
                                  className={`group flex items-center gap-3 py-2 px-3 transition-all duration-200 cursor-pointer hover:${isDark ? 'bg-gray-800/30' : 'bg-gray-100/50'} rounded-lg`}
                                >
                                  {/* HTTP Method Badge */}
                                  <div className={`px-1.5 py-0.5 rounded text-xs font-medium border ${methodColors.bg} ${methodColors.text} flex-shrink-0`}>
                                    {item.method}
                                  </div>
                                  
                                  {/* Request Info */}
                                  <div className="flex-1 min-w-0">
                                    <div className={`text-sm font-medium ${themeClasses.text.primary} truncate`}>
                                      {item.name}
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className={`text-xs ${themeClasses.text.tertiary} truncate`}>
                                        {item.url}
                                      </span>
                                      <span className={`text-xs ${statusColors} font-mono`}>
                                        {item.status}
                                      </span>
                                    </div>
                                  </div>
                                  
                                  {/* Timestamp */}
                                  <div className={`text-xs ${themeClasses.text.tertiary} opacity-60 flex-shrink-0`}>
                                    {item.timestamp}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </>
                    )}

                    {/* Environments Content */}
                    {activeMenuTab === "environments" && (
                      <>
                        <div className="flex items-center justify-between mb-3">
                          <span className={`text-xs font-medium ${themeClasses.text.tertiary}`}>
                            Environments
                          </span>
                          <button className={`p-1 rounded transition-all duration-200 ${themeClasses.button.ghost}`}>
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        
                        {environments.length === 0 ? (
                          <div className={`text-center py-8 ${themeClasses.text.tertiary}`}>
                            <Globe className={`h-6 w-6 mx-auto mb-2 ${themeClasses.text.tertiary}`} />
                            <p className={`text-sm ${themeClasses.text.primary}`}>No environments</p>
                            <p className={`text-xs ${themeClasses.text.tertiary}`}>Create environments to manage variables</p>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            {environments.map((env) => {
                              const isExpanded = expandedEnvironments.has(env.id);
                              
                              return (
                                <div key={env.id} className="space-y-1">
                                  {/* Environment Header */}
                                  <div
                                    className={`group relative flex items-center gap-2 py-2 px-3 transition-all duration-200 cursor-pointer hover:${isDark ? 'bg-gray-800/30' : 'bg-gray-100/50'} rounded-lg`}
                                  >
                                    {/* Expand/Collapse Chevron */}
                                    <button
                                      onClick={() => toggleEnvironment(env.id)}
                                      className={`p-0.5 rounded transition-all duration-200 ${themeClasses.button.ghost}`}
                                    >
                                      <ChevronDown 
                                        className={`h-3 w-3 transition-transform duration-200 ${
                                          isExpanded ? 'rotate-0' : '-rotate-90'
                                        } ${themeClasses.text.tertiary}`} 
                                      />
                                    </button>
                                    
                                    {/* Environment Name */}
                                    <div className="flex-1 min-w-0">
                                      {editingEnvironment === env.id ? (
                                        <input
                                          type="text"
                                          defaultValue={env.name}
                                          onBlur={() => setEditingEnvironment(null)}
                                          onKeyDown={(e) => {
                                            if (e.key === 'Enter') setEditingEnvironment(null);
                                          }}
                                          className={`w-full text-sm font-medium bg-transparent border border-gray-300 rounded px-1 py-0.5 outline-none focus:border-blue-500 ${themeClasses.text.primary}`}
                                          autoFocus
                                        />
                                      ) : (
                                        <div
                                          onClick={() => setEditingEnvironment(env.id)}
                                          className="flex items-center justify-between"
                                        >
                                          <div className={`text-sm font-medium ${themeClasses.text.primary} truncate`}>
                                            {env.name}
                                          </div>
                                          <div className={`text-xs ${themeClasses.text.tertiary} opacity-60`}>
                                            {env.variables.length} vars
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  
                                  {/* Variables List */}
                                  {isExpanded && (
                                    <div className="ml-6 space-y-1 overflow-hidden">
                                      {env.variables.map((variable, index) => (
                                        <div
                                          key={index}
                                          className={`group relative flex items-center gap-3 py-1.5 px-3 transition-all duration-200 hover:${isDark ? 'bg-gray-800/20' : 'bg-gray-100/40'} rounded-lg`}
                                        >
                                          {/* Variable Key */}
                                          <div className={`text-xs font-mono ${themeClasses.text.accent} flex-shrink-0 min-w-0 max-w-24 truncate`}>
                                            {variable.key}
                                          </div>
                                          
                                          {/* Variable Value */}
                                          <div className="flex-1 min-w-0">
                                            <div className={`text-xs font-mono ${themeClasses.text.primary} truncate`}>
                                              {variable.key === 'API_KEY' ? '••••••••••••' : variable.value}
                                            </div>
                                          </div>
                                          
                                          {/* Edit Icon (visible on hover) */}
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              // Handle variable editing
                                            }}
                                            className={`opacity-0 group-hover:opacity-100 p-1 rounded transition-all duration-200 ${themeClasses.button.ghost}`}
                                          >
                                            <Pencil className="h-3 w-3" />
                                          </button>
                                        </div>
                                      ))}
                                      
                                      {/* Add Variable Button */}
                                      <button
                                        className={`w-full flex items-center gap-2 py-1.5 px-3 text-xs transition-all duration-200 ${themeClasses.button.ghost} ${themeClasses.text.tertiary} hover:${themeClasses.text.primary} rounded-lg`}
                                      >
                                        <Plus className="h-3 w-3" />
                                        Add Variable
                                      </button>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </>
                    )}

                    {/* Docs Content - Generate Docs */}
                    {activeMenuTab === "docs" && (
                      <>
                        <div className="flex items-center justify-between mb-3">
                          <span className={`text-xs font-medium ${themeClasses.text.tertiary}`}>
                            Documentation
                          </span>
                        </div>
                        
                        <div className="space-y-3">
                          <button
                            onClick={() => setDocsModalOpen(true)}
                            className={`w-full flex items-center gap-3 py-4 px-4 transition-all duration-200 cursor-pointer hover:${isDark ? 'bg-gray-800/30' : 'bg-gray-100/50'} rounded-lg border border-dashed ${themeClasses.border.primary} ${themeClasses.text.accent} border-blue-300 dark:border-blue-700`}
                          >
                            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                              <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="flex-1 text-left">
                              <div className={`text-sm font-semibold ${themeClasses.text.primary}`}>
                                Generate Docs
                              </div>
                              <div className={`text-xs ${themeClasses.text.tertiary}`}>
                                Create beautiful API documentation
                              </div>
                            </div>
                          </button>
                          
                          <div className={`p-4 rounded-lg ${themeClasses.card.base} border ${themeClasses.border.primary}`}>
                            <div className="space-y-3">
                              <div>
                                <p className={`text-sm font-medium ${themeClasses.text.primary} mb-1`}>
                                  Available Collections
                                </p>
                                <p className={`text-xs ${themeClasses.text.tertiary}`}>
                                  {Object.keys(collections).length} collection{Object.keys(collections).length !== 1 ? 's' : ''} • {Object.values(collections).reduce((acc, col) => acc + (col.requests?.length || 0), 0)} endpoints
                                </p>
                              </div>
                              
                              <div className="flex gap-2">
                                {Object.values(collections).slice(0, 2).map(collection => (
                                  <div key={collection.id} className={`px-2 py-1 rounded text-xs ${themeClasses.bg.secondary} ${themeClasses.text.secondary}`}>
                                    {collection.name}
                                  </div>
                                ))}
                                {Object.keys(collections).length > 2 && (
                                  <div className={`px-2 py-1 rounded text-xs ${themeClasses.bg.secondary} ${themeClasses.text.tertiary}`}>
                                    +{Object.keys(collections).length - 2} more
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Settings Content - Trigger Modal */}
                    {activeMenuTab === "settings" && (
                      <>
                        <div className="flex items-center justify-between mb-3">
                          <span className={`text-xs font-medium ${themeClasses.text.tertiary}`}>
                            Preferences
                          </span>
                        </div>
                        
                        <div className="space-y-2">
                          {/* Quick Theme Toggle */}
                          <div className={`p-3 rounded-lg ${themeClasses.card.base}`}>
                            <div className="flex items-center justify-between">
                              <div>
                                <p className={`text-sm font-medium ${themeClasses.text.primary}`}>Theme</p>
                                <p className={`text-xs ${themeClasses.text.tertiary}`}>Switch between light and dark mode</p>
                              </div>
                              <button
                                onClick={toggleTheme}
                                className={`p-2 rounded transition-all duration-200 ${themeClasses.button.ghost}`}
                              >
                                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                              </button>
                            </div>
                          </div>
                          
                          {/* Open Full Settings */}
                          <button
                            onClick={() => setSettingsModalOpen(true)}
                            className={`w-full flex items-center gap-3 py-3 px-3 transition-all duration-200 cursor-pointer hover:${isDark ? 'bg-gray-800/30' : 'bg-gray-100/50'} rounded-lg border border-dashed ${themeClasses.border.primary}`}
                          >
                            <Settings className={`h-5 w-5 ${themeClasses.text.tertiary}`} />
                            <div className="flex-1 text-left">
                              <div className={`text-sm font-medium ${themeClasses.text.primary}`}>
                                All Settings
                              </div>
                              <div className={`text-xs ${themeClasses.text.tertiary}`}>
                                Preferences, shortcuts, and more
                              </div>
                            </div>
                          </button>
                        </div>
                      </>
                    )}

                    {/* Trash Content */}
                    {activeMenuTab === "trash" && (
                      <>
                        <div className="flex items-center justify-between mb-3">
                          <span className={`text-xs font-medium ${themeClasses.text.tertiary}`}>
                            Deleted Items
                          </span>
                          {trashItems.length > 0 && (
                            <button className={`p-1 rounded transition-all duration-200 ${themeClasses.button.ghost} ${themeClasses.text.tertiary} hover:text-red-500`}>
                              <Trash2 className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                        
                        {trashItems.length === 0 ? (
                          <div className={`text-center py-12 ${themeClasses.text.tertiary}`}>
                            <Trash2 className={`h-8 w-8 mx-auto mb-3 ${themeClasses.text.tertiary}`} />
                            <p className={`text-sm ${themeClasses.text.primary}`}>Trash is empty</p>
                            <p className={`text-xs ${themeClasses.text.tertiary}`}>Deleted requests will appear here</p>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            {trashItems.map((item) => (
                              <div
                                key={item.id}
                                className={`group flex items-center gap-3 py-2 px-3 transition-all duration-200 hover:${isDark ? 'bg-gray-800/30' : 'bg-gray-100/50'} rounded-lg`}
                              >
                                {/* Item Type Icon */}
                                <div className={`p-1 rounded ${themeClasses.text.tertiary}`}>
                                  {item.type === 'collection' ? (
                                    <FolderOpen className="h-4 w-4" />
                                  ) : (
                                    <div className={`px-1.5 py-0.5 rounded text-xs font-medium border ${getMethodColors(item.method || 'GET', isDark).bg} ${getMethodColors(item.method || 'GET', isDark).text}`}>
                                      {item.method || 'REQ'}
                                    </div>
                                  )}
                                </div>
                                
                                {/* Item Info */}
                                <div className="flex-1 min-w-0">
                                  <div className={`text-sm font-medium ${themeClasses.text.primary} truncate`}>
                                    {item.name}
                                  </div>
                                  <div className={`text-xs ${themeClasses.text.tertiary}`}>
                                    Deleted {item.deletedAt}
                                  </div>
                                </div>
                                
                                {/* Action Buttons */}
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  {/* Restore Button */}
                                  <button
                                    onClick={() => {
                                      // Handle restore
                                    }}
                                    className={`p-1 rounded transition-all duration-200 ${themeClasses.button.ghost} ${themeClasses.text.tertiary} hover:text-emerald-500`}
                                    title="Restore"
                                  >
                                    <Plus className="h-3 w-3 rotate-45" />
                                  </button>
                                  
                                  {/* Permanent Delete Button */}
                                  <button
                                    onClick={() => {
                                      // Handle permanent delete
                                    }}
                                    className={`p-1 rounded transition-all duration-200 ${themeClasses.button.ghost} ${themeClasses.text.tertiary} hover:text-red-500`}
                                    title="Delete permanently"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Collapsed Sidebar Icons */}
          {sidebarCollapsed && (
            <div className="p-3 flex flex-col items-center gap-2 mt-8">
              {sidebarMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeMenuTab === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveMenuTab(item.id);
                      setSidebarCollapsed(false);
                    }}
                    title={item.label}
                    className={`w-10 h-10 rounded-lg transition-all duration-200 flex items-center justify-center ${
                      isActive
                        ? `${themeClasses.text.accent} ${isDark ? 'bg-blue-500/10' : 'bg-blue-50'}`
                        : `${themeClasses.text.secondary} hover:${themeClasses.text.primary} hover:${isDark ? 'bg-gray-800/30' : 'bg-gray-100/50'}`
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Main Workbench - Theme Aware */}
        <div
          className={`flex-1 flex flex-col ${themeClasses.bg.primary} transition-colors duration-300`}
        >
          {/* Request Tabs - Flat Design */}
          <div
            className={`${themeClasses.bg.glass} border-b ${themeClasses.border.primary}`}
          >
            <div className="flex items-center px-6 py-0">
              <div className="flex items-center overflow-x-auto scrollbar-hide">
                {requestTabs.map((tab) => {
                  const methodColors = getMethodColors(
                    tab.request.method,
                    isDark
                  );

                  return (
                    <div
                      key={tab.id}
                      className={`flex items-center gap-2 px-3 py-3 cursor-pointer min-w-0 group transition-all duration-200 border-b-2 ${
                        tab.id === activeTabId
                          ? `${themeClasses.text.primary} border-blue-500`
                          : `${themeClasses.text.secondary} hover:${themeClasses.text.primary} border-transparent hover:border-gray-300`
                      }`}
                      onClick={() => setActiveTabId(tab.id)}
                    >
                      <div
                        className={`px-1.5 py-0.5 rounded text-xs font-medium border ${methodColors.bg} ${methodColors.text} flex-shrink-0`}
                      >
                        {tab.request.method}
                      </div>
                      <span
                        className={`text-sm truncate min-w-0 max-w-32 ${
                          tab.isModified ? "italic" : ""
                        }`}
                      >
                        {tab.name || "Untitled"}
                        {tab.isModified && (
                          <span className={`${themeClasses.text.accent} ml-1`}>
                            •
                          </span>
                        )}
                      </span>
                      {requestTabs.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            closeTab(tab.id);
                          }}
                          className={`h-4 w-4 opacity-0 group-hover:opacity-100 transition-all duration-200 rounded flex-shrink-0 flex items-center justify-center ${themeClasses.text.tertiary} hover:${themeClasses.text.primary}`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  );
                })}
                <button
                  onClick={createNewTab}
                  className={`h-8 w-8 transition-all duration-200 flex-shrink-0 flex items-center justify-center group ${themeClasses.button.ghost} ml-2`}
                >
                  <Plus className="h-3 w-3 group-hover:scale-110 transition-transform" />
                </button>
              </div>
            </div>
          </div>


          {/* Request Name Header - Full Width */}
          <div className={`${themeClasses.border.primary} ${isDark ? "bg-gray-900/20" : "bg-gray-50/50"}`}>
            <div className="px-6 pt-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="flex items-center gap-2 group flex-1 min-w-0">
                    {editingRequestName ? (
                      <input
                        type="text"
                        value={currentTab?.name || ""}
                        onChange={(e) => setCurrentRequestName(e.target.value)}
                        onBlur={() => setEditingRequestName(false)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            setEditingRequestName(false)
                          }
                        }}
                        placeholder="Untitled Request"
                        className={`text-sm font-medium bg-transparent border border-gray-300 rounded px-2 py-1 outline-none focus:border-blue-500 focus:ring-0 transition-colors duration-200 w-full ${themeClasses.text.primary}`}
                        autoFocus
                      />
                    ) : (
                      <>
                        <span className={`text-sm font-medium ${themeClasses.text.primary} truncate`}>
                          {currentTab?.name || "Untitled Request"}
                        </span>
                        <button
                          onClick={() => setEditingRequestName(true)}
                          className={`opacity-0 group-hover:opacity-100 p-1 rounded transition-all duration-200 flex-shrink-0 ${themeClasses.button.ghost}`}
                        >
                          <Pencil className="h-3 w-3" />
                        </button>
                      </>
                    )}
                  </div>
                  {request.url && (
                    <span className={`text-xs ${themeClasses.text.tertiary} hidden sm:block truncate`}>
                      {(() => {
                        try {
                          return new URL(request.url).pathname;
                        } catch {
                          return (
                            request.url.replace(/^https?:\/\/[^\/]+/, "") || "/"
                          );
                        }
                      })()}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {request.url && (
                    <>
                      <button className={`h-8 text-xs px-3 rounded transition-all duration-200 hidden sm:block ${themeClasses.button.secondary}`}>
                        Template
                      </button>
                      <button className={`h-8 text-xs px-3 rounded transition-all duration-200 hidden sm:block ${themeClasses.button.secondary}`}>
                        Share
                      </button>
                      <button 
                        onClick={handleSaveRequest}
                        className={`h-8 text-xs px-3 rounded transition-all duration-200 ${themeClasses.button.primary}`}
                      >
                        {currentTab?.collectionRequestId ? "Update" : "Save"}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Method + URL + Send Row - Full Width */}
          <div className={`border-b ${themeClasses.border.primary}`}>
            <div className="px-6 py-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                {/* METHOD SELECT + URL INPUT ROW */}
                <div className="flex items-center gap-3 flex-1">
                  {/* METHOD SELECT */}
                  <div className="w-24 flex-shrink-0">
                    <Select
                      value={request.method}
                      onValueChange={(value) => updateCurrentTab({ request: { ...request, method: value } })}
                    >
                      <SelectTrigger
                        className={`h-11 text-sm rounded backdrop-blur-sm ${themeClasses.input.base} px-3 flex items-center justify-between !h-11 !min-h-[44px] [&>span]:leading-none`}
                      >
                        <SelectValue />
                      </SelectTrigger>

                      <SelectContent
                        className={`
                          w-[var(--radix-select-trigger-width)] 
                          ${
                            isDark
                              ? "border-gray-700 bg-gray-800 text-white"
                              : "border-gray-200 bg-white text-gray-900"
                          }
                        `}
                        align="start"
                      >
                        {["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"].map((method) => {
                          const methodColors = getMethodColors(method, isDark);
                          return (
                            <SelectItem
                              key={method}
                              value={method}
                              className="text-sm py-2"
                            >
                              <span className={`font-bold ${methodColors.text}`}>
                                {method}
                              </span>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* URL INPUT */}
                  <div className="flex-1">
                    <Input
                      placeholder="https://api.example.com/endpoint"
                      value={request.url}
                      onChange={(e) => updateCurrentTab({ request: { ...request, url: e.target.value } })}
                      className={`h-11 text-sm rounded-md backdrop-blur-sm ${themeClasses.input.base}`}
                    />
                  </div>
                </div>

                {/* SEND BUTTON */}
                <button
                  onClick={executeRequest}
                  disabled={loading || !request.url}
                  className={`h-11 text-sm px-6 rounded-md transition-all duration-200 font-medium shadow-sm flex items-center justify-center gap-2 flex-shrink-0 sm:w-auto w-full ${
                    loading || !request.url
                      ? `${
                          isDark
                            ? "bg-gray-700 text-gray-400"
                            : "bg-gray-200 text-gray-500"
                        } cursor-not-allowed`
                      : themeClasses.button.primary
                  }`}
                >
                  {loading ? (
                    <>
                      <div
                        className={`animate-spin h-4 w-4 border-2 ${
                          isDark
                            ? "border-blue-300 border-t-transparent"
                            : "border-blue-400 border-t-transparent"
                        } rounded-full`}
                      ></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Send
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Onboarding Section - Shows when no URL is entered */}
          {!request.url && (
            <div className={`border-b ${themeClasses.border.primary}`}>
              <div className="px-6 py-6">
                <div className="text-center space-y-6">
                  <div className="space-y-3">
                    <h3
                      className={`text-lg font-semibold ${themeClasses.text.primary}`}
                    >
                      Welcome to API Playground
                    </h3>
                    <p
                      className={`text-sm ${themeClasses.text.secondary} max-w-md mx-auto`}
                    >
                      Get started by entering an API endpoint above. Try one of these
                      popular APIs to test:
                    </p>
                  </div>

                  {/* Quick Start Examples */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-2xl mx-auto">
                    <button
                      onClick={() =>
                        updateCurrentTab({
                          request: {
                            ...request,
                            url: "https://jsonplaceholder.typicode.com/posts/1"
                          }
                        })
                      }
                      className={`flex items-center gap-3 p-4 text-left rounded-lg transition-all duration-200 ${
                        isDark
                          ? "bg-gray-800/50 hover:bg-gray-800 border border-gray-700/50"
                          : "bg-gray-50 hover:bg-gray-100 border border-gray-200"
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          isDark
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-emerald-100 text-emerald-600"
                        }`}
                      >
                        <span className="text-xs font-bold">JSON</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div
                          className={`text-sm font-medium ${themeClasses.text.primary}`}
                        >
                          JSONPlaceholder
                        </div>
                        <div
                          className={`text-xs ${themeClasses.text.tertiary} truncate`}
                        >
                          Free fake API for testing
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => updateCurrentTab({
                        request: { ...request, url: "https://httpbin.org/get" }
                      })}
                      className={`flex items-center gap-3 p-4 text-left rounded-lg transition-all duration-200 ${
                        isDark
                          ? "bg-gray-800/50 hover:bg-gray-800 border border-gray-700/50"
                          : "bg-gray-50 hover:bg-gray-100 border border-gray-200"
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          isDark
                            ? "bg-blue-500/20 text-blue-400"
                            : "bg-blue-100 text-blue-600"
                        }`}
                      >
                        <span className="text-xs font-bold">HTTP</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div
                          className={`text-sm font-medium ${themeClasses.text.primary}`}
                        >
                          HTTPBin
                        </div>
                        <div
                          className={`text-xs ${themeClasses.text.tertiary} truncate`}
                        >
                          HTTP request & response service
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() =>
                        updateCurrentTab({
                          request: {
                            ...request,
                            url: "https://api.github.com/repos/microsoft/vscode"
                          }
                        })
                      }
                      className={`flex items-center gap-3 p-4 text-left rounded-lg transition-all duration-200 ${
                        isDark
                          ? "bg-gray-800/50 hover:bg-gray-800 border border-gray-700/50"
                          : "bg-gray-50 hover:bg-gray-100 border border-gray-200"
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          isDark
                            ? "bg-purple-500/20 text-purple-400"
                            : "bg-purple-100 text-purple-600"
                        }`}
                      >
                        <span className="text-xs font-bold">API</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div
                          className={`text-sm font-medium ${themeClasses.text.primary}`}
                        >
                          GitHub API
                        </div>
                        <div
                          className={`text-xs ${themeClasses.text.tertiary} truncate`}
                        >
                          Repository information
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Main Content Area - Theme Aware Split View */}
          <div
            className={`flex-1 flex ${themeClasses.bg.primary} transition-colors duration-300`}
          >
            <RequestPanel
              request={request}
              setRequest={setRequest}
            />
            <ResponsePanel
              response={response}
              loading={loading}
              request={request}
            />
          </div>
        </div>
      </div>

      {/* Docs Generator Modal */}
      <DocGeneratorModal
        open={docsModalOpen}
        onOpenChange={setDocsModalOpen}
        collections={collections}
        onGenerate={(docData) => {
          console.log('Generated docs with data:', docData);
          setDocsModalOpen(false);
        }}
      />

      {/* Settings Modal */}
      <Dialog open={settingsModalOpen} onOpenChange={setSettingsModalOpen}>
        <DialogContent className={`max-w-2xl max-h-[80vh] overflow-y-auto ${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
          <DialogHeader>
            <DialogTitle className={`text-xl font-semibold ${themeClasses.text.primary}`}>
              Settings & Preferences
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* Appearance Section */}
            <div>
              <h3 className={`text-sm font-semibold mb-3 ${themeClasses.text.primary}`}>
                Appearance
              </h3>
              <div className="space-y-3">
                <div className={`p-4 rounded-lg ${themeClasses.card.base}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm font-medium ${themeClasses.text.primary}`}>Theme</p>
                      <p className={`text-xs ${themeClasses.text.tertiary}`}>Choose your preferred color scheme</p>
                    </div>
                    <button
                      onClick={toggleTheme}
                      className={`p-2 rounded transition-all duration-200 ${themeClasses.button.ghost}`}
                    >
                      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Editor Section */}
            <div>
              <h3 className={`text-sm font-semibold mb-3 ${themeClasses.text.primary}`}>
                Editor
              </h3>
              <div className="space-y-3">
                <div className={`p-4 rounded-lg ${themeClasses.card.base}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm font-medium ${themeClasses.text.primary}`}>Font Size</p>
                      <p className={`text-xs ${themeClasses.text.tertiary}`}>Adjust the editor font size</p>
                    </div>
                    <select className={`px-3 py-1 rounded text-sm ${themeClasses.input.base}`}>
                      <option value="12">12px</option>
                      <option value="14" selected>14px</option>
                      <option value="16">16px</option>
                    </select>
                  </div>
                </div>
                <div className={`p-4 rounded-lg ${themeClasses.card.base}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm font-medium ${themeClasses.text.primary}`}>Auto-save</p>
                      <p className={`text-xs ${themeClasses.text.tertiary}`}>Automatically save changes</p>
                    </div>
                    <button className={`w-10 h-6 rounded-full transition-colors ${isDark ? 'bg-blue-600' : 'bg-blue-500'} relative`}>
                      <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1 transition-transform"></div>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* API Section */}
            <div>
              <h3 className={`text-sm font-semibold mb-3 ${themeClasses.text.primary}`}>
                API Defaults
              </h3>
              <div className="space-y-3">
                <div className={`p-4 rounded-lg ${themeClasses.card.base}`}>
                  <label className={`text-sm font-medium ${themeClasses.text.primary}`}>
                    Default Base URL
                  </label>
                  <input
                    type="text"
                    placeholder="https://api.example.com"
                    className={`w-full mt-2 px-3 py-2 text-sm rounded ${themeClasses.input.base}`}
                  />
                </div>
                <div className={`p-4 rounded-lg ${themeClasses.card.base}`}>
                  <label className={`text-sm font-medium ${themeClasses.text.primary}`}>
                    Request Timeout (ms)
                  </label>
                  <input
                    type="number"
                    placeholder="5000"
                    className={`w-full mt-2 px-3 py-2 text-sm rounded ${themeClasses.input.base}`}
                  />
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Collection Dialog */}
      <Dialog open={createCollectionDialogOpen} onOpenChange={setCreateCollectionDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-medium">Create Collection</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-3">
            <div>
              <Input
                placeholder="Collection name"
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                className="h-8 text-sm border-gray-200 focus:border-gray-300 focus:ring-0"
                disabled={creatingCollection}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleCreateCollection();
                  }
                }}
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button 
                variant="outline" 
                onClick={() => setCreateCollectionDialogOpen(false)} 
                size="sm" 
                className="px-3 text-xs"
                disabled={creatingCollection}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCreateCollection} 
                disabled={!newCollectionName.trim() || creatingCollection} 
                size="sm" 
                className="px-3 text-xs bg-black hover:bg-gray-800 text-white"
              >
                {creatingCollection ? (
                  <>
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
