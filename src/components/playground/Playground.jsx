"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
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
  User,
  Settings,
  Globe,
  Search,
  Plus,
  X,
  Moon,
  Sun,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Send,
  Trash2,
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { getThemeClasses, getMethodColors } from "@/lib/theme";
import RequestPanel from "./RequestPanel";
import ResponsePanel from "./ResponsePanel";
import { generateShareableUrl, getSharedRequest } from "@/lib/share-encoding";
import { saveToHistory } from "@/lib/storage";
import { processRequestWithVariables } from "@/lib/environments";
import {
  getActiveCollectionId,
  addRequestToCollection,
  updateRequestInCollection,
} from "@/lib/collections";

export default function Playground() {
  const { toggleTheme, isDark } = useTheme();
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
  const [activeCollectionId, setActiveCollectionId] = useState("my-apis");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeMenuTab, setActiveMenuTab] = useState("collections");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingRequestName, setEditingRequestName] = useState(false);

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
    const activeColId = getActiveCollectionId();
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


  // Request modification handlers
  const setRequest = (newRequest) => {
    updateCurrentTab({ request: newRequest });
  };

  const setCurrentRequestName = (name) => {
    updateCurrentTab({ name });
  };

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
          <div
            className={`h-8 w-8 rounded flex items-center justify-center cursor-pointer ${
              isDark
                ? "bg-gradient-to-br from-gray-700 to-gray-800"
                : "bg-gradient-to-br from-gray-200 to-gray-300"
            }`}
          >
            <User
              className={`h-4 w-4 ${
                isDark ? "text-gray-300" : "text-gray-600"
              }`}
            />
          </div>
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
                          <button className={`p-1 rounded transition-all duration-200 ${themeClasses.button.ghost}`}>
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <div className="space-y-1">
                          <div
                            className={`flex items-center gap-3 py-2 px-3 transition-all duration-200 cursor-pointer hover:${isDark ? 'bg-gray-800/30' : 'bg-gray-100/50'} rounded`}
                          >
                            <div className="h-2 w-2 rounded-full bg-emerald-500 flex-shrink-0"></div>
                            <div className="flex-1 min-w-0">
                              <div className={`text-sm font-medium ${themeClasses.text.primary} truncate`}>
                                My API Tests
                              </div>
                              <div className={`text-xs ${themeClasses.text.tertiary}`}>
                                3 requests
                              </div>
                            </div>
                          </div>
                          <div
                            className={`flex items-center gap-3 py-2 px-3 transition-all duration-200 cursor-pointer hover:${isDark ? 'bg-gray-800/30' : 'bg-gray-100/50'} rounded`}
                          >
                            <div className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0"></div>
                            <div className="flex-1 min-w-0">
                              <div className={`text-sm font-medium ${themeClasses.text.primary} truncate`}>
                                User Service APIs
                              </div>
                              <div className={`text-xs ${themeClasses.text.tertiary}`}>
                                7 requests
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {/* History Content */}
                    {activeMenuTab === "history" && (
                      <div className={`text-center py-12 ${themeClasses.text.tertiary}`}>
                        <History className={`h-8 w-8 mx-auto mb-3 ${themeClasses.text.tertiary}`} />
                        <p className={`text-sm ${themeClasses.text.primary}`}>No history yet</p>
                        <p className={`text-xs ${themeClasses.text.tertiary}`}>Your sent requests will appear here</p>
                      </div>
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
                        <div className={`text-center py-8 ${themeClasses.text.tertiary}`}>
                          <Globe className={`h-6 w-6 mx-auto mb-2 ${themeClasses.text.tertiary}`} />
                          <p className={`text-sm ${themeClasses.text.primary}`}>No environments</p>
                          <p className={`text-xs ${themeClasses.text.tertiary}`}>Create environments to manage variables</p>
                        </div>
                      </>
                    )}

                    {/* Docs Content */}
                    {activeMenuTab === "docs" && (
                      <div className={`text-center py-12 ${themeClasses.text.tertiary}`}>
                        <BookOpen className={`h-8 w-8 mx-auto mb-3 ${themeClasses.text.tertiary}`} />
                        <p className={`text-sm ${themeClasses.text.primary}`}>Coming Soon</p>
                        <p className={`text-xs ${themeClasses.text.tertiary}`}>Auto-generated API documentation</p>
                      </div>
                    )}

                    {/* Settings Content */}
                    {activeMenuTab === "settings" && (
                      <>
                        <div className="mb-3">
                          <span className={`text-xs font-medium ${themeClasses.text.tertiary}`}>
                            Preferences
                          </span>
                        </div>
                        <div className="space-y-2">
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
                        </div>
                      </>
                    )}

                    {/* Trash Content */}
                    {activeMenuTab === "trash" && (
                      <div className={`text-center py-12 ${themeClasses.text.tertiary}`}>
                        <Trash2 className={`h-8 w-8 mx-auto mb-3 ${themeClasses.text.tertiary}`} />
                        <p className={`text-sm ${themeClasses.text.primary}`}>Trash is empty</p>
                        <p className={`text-xs ${themeClasses.text.tertiary}`}>Deleted requests will appear here</p>
                      </div>
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

          {/* Request Info Row */}
          <div
            className={`px-6 py-3 border-b ${themeClasses.border.primary} ${
              isDark ? "bg-gray-900/20" : "bg-gray-50/50"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 group">
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
                      className={`text-sm font-medium bg-transparent border border-gray-300 rounded px-2 py-1 outline-none focus:border-blue-500 focus:ring-0 transition-colors duration-200 ${themeClasses.text.primary}`}
                      autoFocus
                    />
                  ) : (
                    <>
                      <span className={`text-sm font-medium ${themeClasses.text.primary}`}>
                        {currentTab?.name || "Untitled Request"}
                      </span>
                      <button
                        onClick={() => setEditingRequestName(true)}
                        className={`opacity-0 group-hover:opacity-100 p-1 rounded transition-all duration-200 ${themeClasses.button.ghost}`}
                      >
                        <Pencil className="h-3 w-3" />
                      </button>
                    </>
                  )}
                </div>
                {request.url && (
                  <span className={`text-xs ${themeClasses.text.tertiary}`}>
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
              <div className="flex items-center gap-2">
                {request.url && (
                  <>
                    <button className={`h-8 text-xs px-3 rounded transition-all duration-200 ${themeClasses.button.secondary}`}>
                      Template
                    </button>
                    <button className={`h-8 text-xs px-3 rounded transition-all duration-200 ${themeClasses.button.secondary}`}>
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

          {/* Main Content Area - Theme Aware Split View */}
          <div
            className={`flex-1 flex ${themeClasses.bg.primary} transition-colors duration-300`}
          >
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
            <ResponsePanel
              response={response}
              loading={loading}
              request={request}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
