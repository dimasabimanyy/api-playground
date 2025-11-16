"use client";

import React, { useState, useEffect } from "react";
import { getThemeClasses, getMethodColors } from "@/lib/theme";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import UserAvatar from "@/components/profile/UserAvatar";
import { Input } from "@/components/ui/input";
import DashboardHeader from "@/components/header/DashboardHeader";
import TwoPanelSidebar from "@/components/playground/TwoPanelSidebar";
import { sidebarMenuItems } from "@/config/sidebar";

const layout = ({ children }) => {
  const { toggleTheme, isDark } = useTheme();
  const { user, signOut, loading: authLoading } = useAuth();

  const themeClasses = getThemeClasses(isDark);

  const [activeMenuTab, setActiveMenuTab] = useState("collections");
  const [sidebarContentOpen, setSidebarContentOpen] = useState(true); // Track if sidebar content is visible
  const [sidebarContentWidth, setSidebarContentWidth] = useState(280); // Width of the content panel in pixels
  const [isSidebarResizing, setIsSidebarResizing] = useState(false);

  const [layoutMode, setLayoutMode] = useState("single"); // 'single' or 'split'
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    typeof window !== "undefined" && window.innerWidth < 1024
  );

  return (
    <>
      <div
        className={`min-h-screen transition-colors duration-300 ${themeClasses.bg.primary} ${themeClasses.text.primary}`}
      >
        {/* Header - Theme Aware */}
        <DashboardHeader
          layoutMode={layoutMode}
          setLayoutMode={setLayoutMode}
        />

        {/* Main Content Layout - Theme Aware */}
        <div className="flex h-[calc(100vh-3.5rem)] relative">
          {/* Mobile Sidebar Overlay */}
          {!sidebarCollapsed && (
            <div
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setSidebarCollapsed(true)}
            />
          )}

          <div
            data-sidebar-container
            className={`${
              sidebarCollapsed
                ? "w-16 lg:w-16"
                : `lg:w-[${
                    90 + (sidebarContentOpen ? sidebarContentWidth : 0)
                  }px]`
            } ${
              sidebarCollapsed
                ? "-translate-x-full lg:translate-x-0"
                : "translate-x-0"
            } w-72 fixed lg:relative top-[3.5rem] lg:top-0 left-0 h-[calc(100vh-3.5rem)] lg:h-full border-r ${
              themeClasses.border.primary
            } ${themeClasses.bg.glass} ${
              isSidebarResizing ? "" : "transition-all duration-300"
            } z-50 lg:z-auto`}
            style={
              !sidebarCollapsed
                ? {
                    width: `${
                      90 + (sidebarContentOpen ? sidebarContentWidth : 0)
                    }px`,
                  }
                : {}
            }
          >
            <TwoPanelSidebar
              sidebarCollapsed={sidebarCollapsed}
              setSidebarCollapsed={setSidebarCollapsed}
              themeClasses={themeClasses}
              isDark={isDark}
              sidebarMenuItems={sidebarMenuItems}
              activeMenuTab={activeMenuTab}
              onNavItemClick={handleNavItemClick}
              contentOpen={sidebarContentOpen}
              contentWidth={sidebarContentWidth}
              onResizeStart={handleSidebarResizeStart}
              isResizing={isSidebarResizing}
              collections={collections}
              collectionsLoading={collectionsLoading}
              expandedCollections={expandedCollections}
              toggleCollection={toggleCollection}
              editingCollection={editingCollection}
              setEditingCollection={setEditingCollection}
              updateCollection={(collectionId, updates) => {
                // Handle collection update
                console.log("Updating collection:", collectionId, updates);
              }}
              deleteCollection={handleDeleteCollection}
              history={filteredHistoryItems}
              loadRequest={(request) => {
                // Handle loading request from history/collections
                const newTabId = Date.now().toString();
                const newTab = {
                  id: newTabId,
                  name: request.name || "Untitled Request",
                  request: {
                    method: request.method || "GET",
                    url: request.url || "",
                    headers: request.headers || {},
                    body: request.body || "",
                  },
                  response: null,
                  loading: false,
                  collectionRequestId: request.id || null,
                  isModified: false,
                };
                setRequestTabs((prev) => [...prev, newTab]);
                setActiveTabId(newTabId);
              }}
              clearHistory={clearHistory}
              setNewRequestType={(type) => {
                console.log("Setting new request type:", type);
              }}
              setRequest={setRequest}
              setActiveTab={setActiveTabId}
              openTabs={requestTabs}
              setOpenTabs={setRequestTabs}
              setCreateCollectionDialogOpen={setCreateCollectionDialogOpen}
            />
          </div>

          {/* Main Content Area */}
          <div
            className={`flex-1 flex flex-col ${
              sidebarCollapsed ? "lg:ml-0" : "lg:ml-0"
            } ml-0 lg:ml-0 w-full lg:w-auto`}
          >
            {children}
          </div>
        </div>
      </div>
    </>
  );
};

export default layout;
