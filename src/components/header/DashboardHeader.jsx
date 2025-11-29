/* eslint-disable */
import React, { useState, useEffect } from "react";
import { getThemeClasses, getMethodColors } from "@/lib/theme";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  Columns,
  Moon,
  SplitSquareHorizontal,
  Sun,
  Zap,
  Search,
} from "lucide-react";
import UserAvatar from "@/components/profile/UserAvatar";
import { Input } from "@/components/ui/input";

const DashboardHeader = ({
  layoutMode,
  setLayoutMode,
  setSidebarCollapsed,
}) => {
  const { toggleTheme, isDark } = useTheme();
  const { user, signOut, loading: authLoading } = useAuth();

  const themeClasses = getThemeClasses(isDark);

  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  // const [sidebarCollapsed, setSidebarCollapsed] = useState(
  //   typeof window !== "undefined" && window.innerWidth < 1024
  // );

  // Handle search modal keyboard shortcuts and clicks
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && searchModalOpen) {
        setSearchModalOpen(false);
        setSearchQuery("");
      }
    };

    const handleClickOutside = (e) => {
      if (searchModalOpen && !e.target.closest(".search-container")) {
        setSearchModalOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [searchModalOpen]);

  return (
    <header
      className={`border-b ${themeClasses.border.primary} ${themeClasses.bg.light} flex items-center px-3 py-2 sm:px-6 transition-all duration-300 relative z-50`}
    >
      <div className="flex items-center space-x-2 sm:space-x-6 min-w-0 flex-shrink-0">
        {/* Mobile Hamburger Menu */}
        <button
          onClick={() => setSidebarCollapsed((prevState) => !prevState)}
          className="lg:hidden p-1.5 transition-all duration-200 hover:bg-gray-50"
          style={{ borderRadius: "6px" }}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        <div className="flex items-center space-x-2 sm:space-x-3">
          <div
            className="h-7 w-7 flex items-center justify-center"
            style={{ borderRadius: "6px", backgroundColor: "#171717" }}
          >
            <Zap className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
          </div>
          <h1
            className={`text-normal font-bold tracking-tight ${themeClasses.text.bold} hidden sm:block`}
          >
            API Playground
          </h1>
          <h1
            className={`text-sm font-bold tracking-tight ${themeClasses.text.bold} sm:hidden`}
          >
            API
          </h1>
        </div>
      </div>

      <div className="flex items-center space-x-1 sm:space-x-3 ml-auto">
        {/* Search Input */}
        <div className="relative z-[99999] search-container">
          <div className={`transition-all duration-200 w-80`}>
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 z-10" />
            <Input
              placeholder={
                searchModalOpen
                  ? "Search collections, requests, environments..."
                  : "Find..."
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchModalOpen(true)}
              className="h-[2.2rem] pl-10 py-0 text-vs focus:ring-0 focus:outline-none cursor-pointer transition-all duration-300"
              // style={{
              //   borderRadius: "6px",
              //   borderColor: "rgb(235, 235, 235)",
              //   backgroundColor: "white",
              //   border: "1px solid rgb(235, 235, 235)",
              //   boxShadow: "none",
              // }}
              style={{
                borderRadius: "6px",
                borderColor: isDark ? "rgb(55, 65, 81)" : "rgb(235, 235, 235)",
                backgroundColor: isDark ? "rgb(17, 24, 39)" : "white",
                border: `1px solid ${
                  isDark ? "rgb(55, 65, 81)" : "rgb(235, 235, 235)"
                }`,
                boxShadow: "none",
              }}
            />

            {/* Search Dropdown */}
            {searchModalOpen && (
              <div
                className="absolute top-full right-0 mt-2 w-80 bg-white border shadow-xs max-h-96 overflow-y-auto z-[99999]"
                style={{
                  borderRadius: "6px",
                  borderColor: "rgb(235, 235, 235)",
                }}
              >
                {searchQuery.length > 0 ? (
                  <div className="p-4">
                    <p className="text-sm text-gray-500 mb-3">
                      Search results for "{searchQuery}"
                    </p>
                    <div className="space-y-2">
                      <div
                        className="p-3 hover:bg-gray-50 cursor-pointer"
                        style={{ borderRadius: "6px" }}
                      >
                        <div className="font-medium text-sm">
                          Example Collection
                        </div>
                        <div className="text-xs text-gray-500">
                          Collection • 5 requests
                        </div>
                      </div>
                      <div
                        className="p-3 hover:bg-gray-50 cursor-pointer"
                        style={{ borderRadius: "6px" }}
                      >
                        <div className="font-medium text-sm">
                          API Request Example
                        </div>
                        <div className="text-xs text-gray-500">
                          Request • GET /api/users
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 text-center text-gray-500">
                    <Search className="h-6 w-6 mx-auto mb-2 opacity-40" />
                    <p className="text-sm">Start typing to search...</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Find collections, requests, and environments
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Layout Toggle Button */}
        {/* {setLayoutMode && ( */}
        {false && (
          <button
            onClick={() =>
              setLayoutMode(layoutMode === "single" ? "split" : "single")
            }
            className="p-[.5rem] transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800 border cursor-pointer"
            style={{
              borderRadius: "50%",
              borderColor: "rgb(235, 235, 235)",
            }}
            title={
              layoutMode === "single"
                ? "Switch to split layout"
                : "Switch to single column layout"
            }
          >
            {layoutMode === "single" ? (
              <SplitSquareHorizontal className="h-4 w-4" />
            ) : (
              <Columns className="h-4 w-4" />
            )}
          </button>
        )}

        <button
          onClick={toggleTheme}
          className="p-[.5rem] transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800 border cursor-pointer"
          style={{
            borderRadius: "50%",
            borderColor: "rgb(235, 235, 235)",
          }}
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        {/* User Avatar/Auth Section */}
        {authLoading ? (
          <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
        ) : user ? (
          <div className="relative group">
            <UserAvatar user={user} isDark={isDark} />

            {/* Dropdown Menu */}
            <div
              className="fixed right-4 mt-2 w-48 bg-white dark:bg-gray-800 shadow-xl border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[99999]"
              style={{
                borderRadius: "12px",
                borderColor: "rgb(235, 235, 235)",
                top: "60px",
              }}
            >
              <div
                className="p-3 border-b"
                style={{ borderColor: "rgb(235, 235, 235)" }}
              >
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {user.user_metadata?.full_name || "User"}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user.email}
                </p>
              </div>
              <div className="p-1">
                <button
                  onClick={() => signOut()}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  style={{ borderRadius: "6px" }}
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => (window.location.href = "/login")}
            className="h-8 px-3 text-xs font-medium transition-all duration-200 text-white"
            style={{
              borderRadius: "6px",
              backgroundColor: "#171717",
              border: "none",
            }}
          >
            Sign in
          </button>
        )}
      </div>
    </header>
  );
};

export default DashboardHeader;
