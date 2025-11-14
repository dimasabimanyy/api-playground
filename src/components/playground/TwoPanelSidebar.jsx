"use client";

import {
  Plus,
  FolderOpen,
  Globe,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronDown,
  ChevronRight,
  Edit,
  Trash2,
  MoreHorizontal,
  GripVertical,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import CreateNew from "../button/CreateNew";

export default function TwoPanelSidebar({
  sidebarCollapsed,
  setSidebarCollapsed,
  themeClasses,
  isDark,
  sidebarMenuItems,
  activeMenuTab,
  onNavItemClick,
  contentOpen = true,
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
  // New request creation props
  setNewRequestType,
  setRequest,
  setActiveTab,
  openTabs,
  setOpenTabs,
  setCreateCollectionDialogOpen,
  // Resize props
  contentWidth = 200,
  onResizeStart,
  isResizing,
}) {
  const createNewTab = () => {
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
  };

  if (sidebarCollapsed) {
    return (
      <div
        className={`border-r ${themeClasses.border.primary} flex flex-col items-center py-4 px-2 gap-1 flex-shrink-0`}
      >
        {/* Navigation Icons */}
        <div className="flex flex-col gap-1">
          {sidebarMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeMenuTab === item.id && contentOpen;
            return (
              <div key={item.id} className="relative group">
                <div
                  className={`flex flex-col items-center gap-1 cursor-pointer rounded-lg transition-all duration-200 pt-3 pb-2 px-1 ${
                    isActive
                      ? `${isDark ? "bg-gray-800" : "bg-gray-100"}`
                      : `hover:${isDark ? "bg-gray-800/30" : "bg-gray-100/50"}`
                  }`}
                  onClick={() => onNavItemClick(item.id)}
                >
                  <button
                    className={`flex items-center justify-center rounded-lg transition-all duration-200 cursor-pointer ${
                      isActive
                        ? themeClasses.text.primary
                        : `${themeClasses.text.secondary} group-hover:${themeClasses.text.primary}`
                    }`}
                    style={{ borderRadius: "6px" }}
                  >
                    <Icon className="h-4 w-4" />
                  </button>

                  <span
                    className={`text-[10px] transition-colors ${
                      isActive
                        ? themeClasses.text.primary
                        : `${themeClasses.text.secondary} group-hover:${themeClasses.text.primary}`
                    }`}
                  >
                    {item.label}
                  </span>
                </div>

                {/* Tooltip */}
                <div
                  className={`absolute left-full ml-2 px-2 py-1 text-xs rounded whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 ${
                    isDark
                      ? "bg-gray-100 text-gray-900"
                      : "bg-gray-900 text-white"
                  }`}
                  style={{ top: "50%", transform: "translateY(-50%)" }}
                >
                  {item.label}
                </div>
              </div>
            );
          })}
        </div>

        {/* Create Button */}
        <div>
          <CreateNew
            isDark={isDark}
            themeClasses={themeClasses}
            createNewTab={createNewTab}
            setCreateCollectionDialogOpen={setCreateCollectionDialogOpen}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full min-w-0">
      {/* Left Navigation Panel */}
      <div
        className={`border-r ${themeClasses.border.primary} flex flex-col items-center py-4 px-2 gap-1 flex-shrink-0`}
      >
        {/* Navigation Icons */}
        <div className="flex flex-col gap-1">
          {sidebarMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeMenuTab === item.id && contentOpen;
            return (
              <div key={item.id} className="relative group">
                <div
                  className={`flex flex-col items-center gap-1 cursor-pointer rounded-lg transition-all duration-200 pt-3 pb-2 px-1 ${
                    isActive
                      ? `${isDark ? "bg-gray-800" : "bg-gray-100"}`
                      : `hover:${isDark ? "bg-gray-800/30" : "bg-gray-100/50"}`
                  }`}
                  onClick={() => onNavItemClick(item.id)}
                >
                  <button
                    className={`flex items-center justify-center rounded-lg transition-all duration-200 cursor-pointer ${
                      isActive
                        ? themeClasses.text.primary
                        : `${themeClasses.text.secondary} group-hover:${themeClasses.text.primary}`
                    }`}
                    style={{ borderRadius: "6px" }}
                  >
                    <Icon className="h-4 w-4" />
                  </button>

                  <span
                    className={`text-[10px] transition-colors ${
                      isActive
                        ? themeClasses.text.primary
                        : `${themeClasses.text.secondary} group-hover:${themeClasses.text.primary}`
                    }`}
                  >
                    {item.label}
                  </span>
                </div>

                {/* Tooltip */}
                {/* <div
                  className={`absolute left-full ml-2 px-2 py-1 text-xs rounded whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 ${
                    isDark
                      ? "bg-gray-100 text-gray-900"
                      : "bg-gray-900 text-white"
                  }`}
                  style={{ top: "50%", transform: "translateY(-50%)" }}
                >
                  {item.label}
                </div> */}
              </div>
            );
          })}
        </div>

        {/* Create Button */}
        <div>
          <CreateNew
            isDark={isDark}
            themeClasses={themeClasses}
            createNewTab={createNewTab}
            setCreateCollectionDialogOpen={setCreateCollectionDialogOpen}
          />
        </div>
      </div>

      {/* Main Content Panel - Only show when content is open */}
      {contentOpen && (
        <div
          className="flex flex-col min-w-0"
          style={{ width: `${contentWidth}px` }}
        >
          {/* Content Area */}
          <div className="flex-1 overflow-y-auto min-w-0">
            <div className="p-2 min-w-0">
              {/* Collections Content */}
              {activeMenuTab === "collections" && (
                <div className="space-y-1">
                  {Object.values(collections).map((collection) => {
                    const isExpanded = expandedCollections.has(collection.id);
                    return (
                      <div key={collection.id} className="space-y-1">
                        {/* Collection Header */}
                        <div
                          className={`group relative flex items-center gap-2 py-1 transition-all duration-200 cursor-pointer hover:${
                            isDark ? "bg-gray-800/30" : "bg-gray-100/50"
                          } rounded-lg`}
                          onClick={() => toggleCollection(collection.id)}
                        >
                          {/* Expand/Collapse Chevron */}
                          <button className="p-0.5 rounded transition-all duration-200">
                            <ChevronDown
                              className={`h-3 w-3 transition-transform duration-200 cursor-pointer ${
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
                                  if (e.key === "Enter")
                                    setEditingCollection(null);
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
                                onClick={() =>
                                  setEditingCollection(collection.id)
                                }
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
                                <span
                                  className={`inline-block w-12 text-xs font-mono ${
                                    request.method === "GET"
                                      ? "text-green-600"
                                      : request.method === "POST"
                                      ? "text-blue-600"
                                      : request.method === "PUT"
                                      ? "text-yellow-600"
                                      : request.method === "DELETE"
                                      ? "text-red-600"
                                      : "text-gray-500"
                                  }`}
                                >
                                  {request.method}
                                </span>
                                {request.name || "Untitled Request"}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* History Content */}
              {activeMenuTab === "history" && (
                <div className="space-y-1">
                  {history.length === 0 ? (
                    <div
                      className={`text-center py-8 ${themeClasses.text.tertiary}`}
                    >
                      <p className="text-sm">No history yet</p>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between items-center mb-3">
                        <span
                          className={`text-xs font-medium ${themeClasses.text.tertiary}`}
                        >
                          Recent Requests
                        </span>
                        <button
                          onClick={clearHistory}
                          className={`text-xs ${themeClasses.text.tertiary} hover:${themeClasses.text.primary} transition-colors`}
                        >
                          Clear all
                        </button>
                      </div>
                      {history.slice(0, 50).map((item, index) => (
                        <button
                          key={`${index}-${item.timestamp}-${item.url}`}
                          onClick={() => loadRequest(item)}
                          className={`w-full text-left p-2 rounded-lg hover:${
                            isDark ? "bg-gray-800/30" : "bg-gray-100/50"
                          } transition-all duration-200 group min-w-0`}
                        >
                          <div className="flex items-center gap-2 mb-1 min-w-0">
                            <span
                              className={`text-xs font-mono px-1.5 py-0.5 rounded text-white flex-shrink-0 ${
                                item.method === "GET"
                                  ? "bg-green-600"
                                  : item.method === "POST"
                                  ? "bg-blue-600"
                                  : item.method === "PUT"
                                  ? "bg-yellow-600"
                                  : item.method === "DELETE"
                                  ? "bg-red-600"
                                  : "bg-gray-500"
                              }`}
                            >
                              {item.method}
                            </span>
                            <span
                              className={`text-xs ${themeClasses.text.tertiary} flex-shrink-0`}
                            >
                              {new Date(item.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          <div
                            className={`text-sm ${themeClasses.text.primary} truncate min-w-0`}
                          >
                            {item.url}
                          </div>
                        </button>
                      ))}
                    </>
                  )}
                </div>
              )}

              {/* Environments Content */}
              {activeMenuTab === "environments" && (
                <div
                  className={`text-center py-8 ${themeClasses.text.tertiary}`}
                >
                  <p className="text-sm">Environment management coming soon</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Resize Divider - Only show when content is open */}
      {contentOpen && (
        <div
          className={`w-px dark:bg-gray-700 hover:bg-blue-500 cursor-col-resize transition-colors duration-200 ${
            isResizing ? "bg-blue-500" : ""
          } relative group flex-shrink-0`}
          onMouseDown={onResizeStart}
          title="Resize sidebar"
          style={{ width: "0px" }}
        >
          {/* Wider hit area for easier dragging */}
          <div className="absolute inset-y-0 -left-1 -right-1 hover:bg-blue-500/20" />
          <div className="absolute inset-y-0 -left-2 -right-2 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <GripVertical className="h-4 w-4 text-gray-400" />
          </div>
        </div>
      )}
    </div>
  );
}
