'use client'

import { 
  Plus, 
  FolderOpen, 
  Globe, 
  PanelLeftClose, 
  ChevronDown,
  ChevronRight,
  Edit,
  Trash2,
  MoreHorizontal 
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function Sidebar({
  sidebarCollapsed,
  setSidebarCollapsed,
  themeClasses,
  isDark,
  sidebarMenuItems,
  activeMenuTab,
  setActiveMenuTab,
  setNewRequestType,
  setRequest,
  setActiveTab,
  openTabs,
  setOpenTabs,
  setCreateCollectionDialogOpen,
  collections,
  expandedCollections,
  toggleCollection,
  editingCollection,
  setEditingCollection,
  updateCollection,
  deleteCollection,
  history,
  loadRequest,
  clearHistory,
  // ... other props
}) {
  const renderCollectionsContent = () => (
    <div className="space-y-1">
      {Object.values(collections).map((collection) => {
        const isExpanded = expandedCollections.has(collection.id);

        return (
          <div key={collection.id} className="space-y-1">
            {/* Collection Header */}
            <div
              className={`group relative flex items-center gap-2 py-1 px-1 transition-all duration-200 cursor-pointer hover:${
                isDark ? "bg-gray-800/30" : "bg-gray-100/50"
              } rounded-lg`}
            >
              {/* Expand/Collapse Chevron */}
              <button
                onClick={() => toggleCollection(collection.id)}
                className={`p-0.5 rounded transition-all duration-200`}
              >
                <ChevronDown
                  className={`h-3 w-3 transition-transform duration-200 ${
                    isExpanded ? "rotate-0" : "-rotate-90"
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
                      if (e.key === "Enter") setEditingCollection(null);
                    }}
                    className={`w-full bg-transparent text-sm font-medium ${themeClasses.text.primary} border-none outline-none`}
                  />
                ) : (
                  <span
                    className={`text-sm font-medium ${themeClasses.text.primary} truncate block`}
                  >
                    {collection.name}
                  </span>
                )}
              </div>

              {/* Collection Options */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className={`p-1 rounded transition-all duration-200 opacity-0 group-hover:opacity-100 hover:${
                      isDark ? "bg-gray-700" : "bg-gray-200"
                    }`}
                  >
                    <MoreHorizontal className="h-3 w-3" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => setEditingCollection(collection.id)}
                  >
                    <Edit className="h-3 w-3 mr-2" />
                    Rename
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => deleteCollection(collection.id)}
                    className="text-red-600"
                  >
                    <Trash2 className="h-3 w-3 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Collection Requests */}
            {isExpanded && (
              <div className="ml-6 space-y-0.5">
                {collection.requests?.map((request) => (
                  <button
                    key={request.id}
                    onClick={() => loadRequest(request)}
                    className={`w-full text-left px-2 py-1 text-sm rounded transition-all duration-200 hover:${
                      isDark ? "bg-gray-800/30" : "bg-gray-100/50"
                    } ${themeClasses.text.secondary} truncate`}
                  >
                    <span className={`inline-block w-12 text-xs font-mono ${
                      request.method === 'GET' ? 'text-green-600' :
                      request.method === 'POST' ? 'text-blue-600' :
                      request.method === 'PUT' ? 'text-yellow-600' :
                      request.method === 'DELETE' ? 'text-red-600' : 'text-gray-500'
                    }`}>
                      {request.method}
                    </span>
                    {request.name || 'Untitled Request'}
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  const renderHistoryContent = () => (
    <div className="space-y-1">
      {history.length === 0 ? (
        <div className={`text-center py-8 ${themeClasses.text.tertiary}`}>
          <p className="text-sm">No history yet</p>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-3">
            <span className={`text-xs font-medium ${themeClasses.text.tertiary}`}>
              Recent Requests
            </span>
            <button
              onClick={clearHistory}
              className={`text-xs ${themeClasses.text.tertiary} hover:${themeClasses.text.primary} transition-colors`}
            >
              Clear all
            </button>
          </div>
          {history.slice(0, 50).map((item) => (
            <button
              key={`${item.timestamp}-${item.url}`}
              onClick={() => loadRequest(item)}
              className={`w-full text-left p-2 rounded-lg hover:${
                isDark ? "bg-gray-800/30" : "bg-gray-100/50"
              } transition-all duration-200 group`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs font-mono px-1.5 py-0.5 rounded text-white ${
                  item.method === 'GET' ? 'bg-green-600' :
                  item.method === 'POST' ? 'bg-blue-600' :
                  item.method === 'PUT' ? 'bg-yellow-600' :
                  item.method === 'DELETE' ? 'bg-red-600' : 'bg-gray-500'
                }`}>
                  {item.method}
                </span>
                <span className={`text-xs ${themeClasses.text.tertiary}`}>
                  {new Date(item.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <div className={`text-sm ${themeClasses.text.primary} truncate`}>
                {item.url}
              </div>
            </button>
          ))}
        </>
      )}
    </div>
  );

  if (sidebarCollapsed) {
    return (
      <div className="p-3 flex flex-col items-center gap-3">
        {/* Collapsed state content - keeping existing functionality */}
        <div className="flex flex-col gap-2 border-b border-gray-200 dark:border-gray-700 pb-3">
          <button
            onClick={() => setSidebarCollapsed(false)}
            className="w-10 h-10 rounded-lg transition-all duration-200 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
            title="Open Sidebar"
          >
            <PanelLeftClose className="h-4 w-4 text-gray-600 dark:text-gray-400 rotate-180" />
          </button>
        </div>
        
        <div className="flex flex-col gap-2">
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
                    ? `${themeClasses.text.primary} ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`
                    : `${themeClasses.text.secondary} hover:${themeClasses.text.primary} hover:${isDark ? 'bg-gray-800' : 'bg-gray-100'}`
                }`}
              >
                <Icon className="h-4 w-4" />
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Left Nav Panel */}
      <div className={`w-14 border-r ${themeClasses.border.primary} ${themeClasses.bg.glass} flex flex-col items-center py-4 gap-1`}>
        {/* Create Button */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="w-10 h-10 flex items-center justify-center rounded-lg transition-all duration-200 bg-black hover:bg-gray-800 text-white cursor-pointer"
              style={{ borderRadius: "6px" }}
              title="Create New"
            >
              <Plus className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="start"
            side="right"
            className="w-90 border"
            style={{
              borderRadius: "8px",
              borderColor: "rgb(235, 235, 235)",
            }}
          >
            <DropdownMenuItem
              onClick={() => {
                setNewRequestType("HTTP Request");
                const newRequest = {
                  id: Date.now().toString(),
                  name: "",
                  type: "HTTP Request",
                  url: "",
                  method: "GET",
                  headers: [],
                  queryParams: [],
                  body: { type: "none", content: "" },
                  isAutoNamed: true,
                };
                setRequest(newRequest);
                setActiveTab(newRequest.id);
                if (!openTabs.some((tab) => tab.id === newRequest.id)) {
                  setOpenTabs((prev) => [...prev, newRequest]);
                }
              }}
              className="cursor-pointer flex items-center gap-2"
            >
              <Globe className="h-4 w-4" />
              <span>HTTP Request</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={() => setCreateCollectionDialogOpen(true)}
              className="cursor-pointer flex items-center gap-2"
            >
              <FolderOpen className="h-4 w-4" />
              <span>Collection</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Navigation Icons */}
        <div className="flex flex-col gap-1 mt-4">
          {sidebarMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeMenuTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveMenuTab(item.id)}
                className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all duration-200 cursor-pointer ${
                  isActive
                    ? `${themeClasses.text.primary} ${
                        isDark ? "bg-gray-800" : "bg-gray-100"
                      }`
                    : `${themeClasses.text.secondary} hover:${
                        themeClasses.text.primary
                      } hover:${
                        isDark ? "bg-gray-800/30" : "bg-gray-100/50"
                      }`
                }`}
                title={item.label}
                style={{ borderRadius: "6px" }}
              >
                <Icon className="h-4 w-4" />
              </button>
            );
          })}
        </div>

        {/* Collapse Button */}
        <div className="mt-auto">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-10 h-10 flex items-center justify-center rounded-lg transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
            style={{ borderRadius: "6px" }}
            title="Collapse Sidebar"
          >
            <PanelLeftClose className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>

      {/* Main Content Panel */}
      <div className="flex-1 flex flex-col">
        <div className={`p-4 border-b ${themeClasses.border.primary}`}>
          <h2 className={`text-sm font-semibold ${themeClasses.text.primary}`}>
            {sidebarMenuItems.find(item => item.id === activeMenuTab)?.label}
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {/* Dynamic Content Based on Active Menu */}
          {activeMenuTab === "collections" && renderCollectionsContent()}
          {activeMenuTab === "history" && renderHistoryContent()}
          {/* Add other menu content here */}
        </div>
      </div>
    </>
  );
}