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
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { getThemeClasses, getMethodColors } from "@/lib/theme";
import RequestPanel from "./RequestPanel";
import ResponsePanel from "./ResponsePanel";
import HistoryPanel from "./HistoryPanel";
import EnvironmentSelector from "./EnvironmentSelector";
import { generateShareableUrl, getSharedRequest } from "@/lib/share-encoding";
import { saveToHistory } from "@/lib/storage";
import { processRequestWithVariables } from "@/lib/environments";
import {
  getActiveCollectionId,
  getCollection,
  addRequestToCollection,
  updateRequestInCollection,
} from "@/lib/collections";
import CollectionsSidebar from "@/components/collections/CollectionsSidebar";

export default function Playground() {
  const { theme, toggleTheme, isDark } = useTheme();
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

  const [activeTab, setActiveTab] = useState("rest");
  const [shareUrl, setShareUrl] = useState("");
  const [showShared, setShowShared] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [activeCollectionId, setActiveCollectionId] = useState("my-apis");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeMenuTab, setActiveMenuTab] = useState("collections");
  const [searchQuery, setSearchQuery] = useState("");

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

  const handleCollectionSelect = (collectionId) => {
    setActiveCollectionId(collectionId);
  };

  const handleRequestSelect = (selectedRequest) => {
    updateCurrentTab({
      name: selectedRequest.name,
      request: {
        method: selectedRequest.method,
        url: selectedRequest.url,
        headers: selectedRequest.headers,
        body: selectedRequest.body,
      },
      response: null,
      collectionRequestId: selectedRequest.id,
      isModified: false,
    });
  };

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

  const handleLoadFromHistory = (historicalRequest) => {
    updateCurrentTab({
      request: historicalRequest,
      name: `${historicalRequest.method} ${historicalRequest.url}`,
      response: null,
      collectionRequestId: null,
      isModified: false,
    });
    setShowHistory(false);
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
              className={`pl-10 h-9 text-sm rounded transition-all backdrop-blur-sm ${themeClasses.input.base}`}
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
              <div className={`p-6 border-b ${themeClasses.border.primary}`}>
                <div className="flex items-center justify-between mb-4">
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
                </div>

                <button
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded transition-all duration-200 mb-4 ${themeClasses.button.primary}`}
                >
                  <Plus className="h-4 w-4 text-white" />
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
                    className={`pl-10 h-9 text-sm rounded transition-all backdrop-blur-sm ${themeClasses.input.base}`}
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                <div className="p-4">
                  <div className="space-y-2">
                    <div
                      className={`text-xs font-medium uppercase tracking-wider mb-3 ${themeClasses.text.tertiary}`}
                    >
                      Workspace
                    </div>
                    <button
                      onClick={() => {
                        setActiveMenuTab("collections");
                        setSidebarCollapsed(false);
                        setShowHistory(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded transition-all duration-200 cursor-pointer ${
                        activeMenuTab === "collections"
                          ? `${themeClasses.status.info} border`
                          : `${themeClasses.text.secondary} hover:${
                              themeClasses.text.primary
                            } ${
                              isDark
                                ? "hover:bg-gray-800/50"
                                : "hover:bg-gray-100"
                            }`
                      }`}
                    >
                      <FolderOpen className="h-4 w-4" />
                      My Collections
                    </button>
                    <button
                      onClick={() => {
                        setActiveMenuTab("history");
                        setSidebarCollapsed(false);
                        setShowHistory(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-all duration-200 ${
                        activeMenuTab === "history"
                          ? `${themeClasses.status.info} border`
                          : `${themeClasses.text.secondary} hover:${
                              themeClasses.text.primary
                            } ${
                              isDark
                                ? "hover:bg-gray-800/50"
                                : "hover:bg-gray-100"
                            }`
                      }`}
                    >
                      <History className="h-4 w-4" />
                      Request History
                    </button>
                  </div>

                  {/* Collections List */}
                  <div className="mt-6">
                    <div
                      className={`text-xs font-medium uppercase tracking-wider mb-3 ${themeClasses.text.tertiary}`}
                    >
                      Recent Collections
                    </div>
                    <div className="space-y-1">
                      <div
                        className={`p-3 rounded-lg transition-all duration-200 cursor-pointer group ${themeClasses.card.base} hover:${themeClasses.card.elevated}`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                          <span
                            className={`text-sm font-medium ${themeClasses.text.primary}`}
                          >
                            My API Tests
                          </span>
                        </div>
                        <div
                          className={`text-xs ${themeClasses.text.tertiary}`}
                        >
                          3 requests
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Collapsed Sidebar Icons */}
          {sidebarCollapsed && (
            <div className="p-2 flex flex-col items-center gap-2 mt-16">
              <button
                onClick={() => setSidebarCollapsed(false)}
                className={`w-10 h-10 rounded transition-all duration-200 flex items-center justify-center ${themeClasses.button.ghost}`}
                title="Collections"
              >
                <FolderOpen className="h-4 w-4" />
              </button>
              <button
                onClick={() => setSidebarCollapsed(false)}
                className={`w-10 h-10 rounded transition-all duration-200 flex items-center justify-center ${themeClasses.button.ghost}`}
                title="History"
              >
                <History className="h-4 w-4" />
              </button>
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
                {requestTabs.map((tab, index) => {
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
                <input
                  type="text"
                  value={currentTab?.name || ""}
                  onChange={(e) => setCurrentRequestName(e.target.value)}
                  placeholder="Untitled Request"
                  className={`text-sm font-medium bg-transparent border-none outline-none ${themeClasses.text.primary} placeholder:${themeClasses.text.tertiary}`}
                />
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
                  <button
                    onClick={handleSaveRequest}
                    className={`h-8 text-xs px-3 rounded transition-all duration-200 ${themeClasses.button.primary}`}
                  >
                    {currentTab?.collectionRequestId ? "Update" : "Save"}
                  </button>
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
