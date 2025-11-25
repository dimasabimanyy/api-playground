"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import TwoPanelSidebar from "@/components/playground/TwoPanelSidebar";
import {
  Plus,
  FileText,
  Calendar,
  Eye,
  Edit3,
  MoreVertical,
  Trash2,
  Copy,
  Search,
  Filter,
  Grid3X3,
  List,
  ArrowUpDown,
  Globe,
  Zap,
  Moon,
  Sun,
  FolderOpen,
  History,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { useCollections } from "@/contexts/CollectionsContext";
import { getThemeClasses } from "@/lib/theme";
import ApiClient from "@/lib/api-client";
import { generateUsername, generatePublicDocUrl } from "@/lib/user-utils";
import DocGeneratorModal from "@/components/docs/DocGeneratorModal";
import SearchInput from "@/components/ui/SearchInput";
import DashboardHeader from "@/components/header/DashboardHeader";
import DocumentationProjectCard from "@/components/docs/DocumentationProjectCard";

function UserAvatar({ user, isDark }) {
  const [imageLoaded, setImageLoaded] = useState(true);
  const [imageSrc, setImageSrc] = useState(null);

  useEffect(() => {
    if (user?.user_metadata?.avatar_url) {
      // Fix Google profile image URL by removing size parameter and adding referrer policy bypass
      let avatarUrl = user.user_metadata.avatar_url;

      // If it's a Google profile image, modify the URL for better compatibility
      if (avatarUrl.includes("googleusercontent.com")) {
        // Remove the size parameter (=s96-c) and replace with a larger size
        avatarUrl = avatarUrl.replace(/=s\d+-c$/, "=s128-c");
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
    return "U";
  };

  if (imageLoaded && imageSrc) {
    return (
      <div className="w-8 h-8 rounded-full overflow-hidden cursor-pointer">
        <Image
          src={imageSrc}
          alt="User avatar"
          width={32}
          height={32}
          className="w-full h-full object-cover"
          onError={() => setImageLoaded(false)}
        />
      </div>
    );
  }

  return (
    <div
      className={`w-8 h-8 rounded-full ${
        isDark ? "bg-gray-700 text-gray-300" : "bg-gray-200 text-gray-700"
      } flex items-center justify-center cursor-pointer text-sm font-medium`}
    >
      {getInitials()}
    </div>
  );
}

export default function DocsPage() {
  const { isDark, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  // const {
  //   collections,
  //   activeCollectionId,
  //   setActiveCollectionId,
  //   addRequestToCollection,
  //   updateRequestInCollection,
  //   saveToHistory,
  //   createCollection,
  //   deleteCollection,
  //   getCollectionsWithDocs,
  //   loading: collectionsLoading,
  // } = useCollections();
  const themeClasses = getThemeClasses(isDark);
  const router = useRouter();

  // Sidebar state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    typeof window !== "undefined" && window.innerWidth < 1024
  );
  const [activeMenuTab, setActiveMenuTab] = useState("documentation");
  const [sidebarContentOpen, setSidebarContentOpen] = useState(false);
  const [sidebarContentWidth, setSidebarContentWidth] = useState(280);
  const [isSidebarResizing, setIsSidebarResizing] = useState(false);
  const [expandedCollections, setExpandedCollections] = useState(new Set());

  const [docsProjects, setDocsProjects] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("list"); // 'grid' or 'list'
  const [sortBy, setSortBy] = useState("updated"); // 'updated', 'created', 'name'
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  // Load documentation projects
  useEffect(() => {
    loadDocsProjects();
  }, []);

  const loadDocsProjects = async () => {
    try {
      const response = await ApiClient.docsProjects.getAll();
      
      // Convert array to object format for compatibility
      const projectsObj = {};
      response.projects?.forEach((project) => {
        projectsObj[project.id] = project;
      });
      
      setDocsProjects(projectsObj);
    } catch (error) {
      console.error("Failed to load documentation projects:", error);
      setDocsProjects({}); // Set empty object on error
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort projects
  const filteredProjects = Object.values(docsProjects)
    .filter((project) => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        project.name.toLowerCase().includes(query) ||
        project.description?.toLowerCase().includes(query)
      );
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "created":
          return new Date(b.created_at || b.created) - new Date(a.created_at || a.created);
        case "updated":
        default:
          return new Date(b.updated_at || b.updated) - new Date(a.updated_at || a.updated);
      }
    });

  const createNewDocumentation = () => {
    setShowCreateModal(true);
  };

  const duplicateProject = async (project) => {
    try {
      // For now, create a new project with copied data
      // TODO: Implement proper duplicate API endpoint
      const duplicateData = {
        name: `${project.name} Copy`,
        description: project.description,
        collection_id: project.collection_id,
        settings: project.settings,
        status: project.status,
      };
      
      await ApiClient.docsProjects.create(duplicateData);
      await loadDocsProjects();
    } catch (error) {
      console.error("Failed to duplicate project:", error);
    }
  };

  const deleteProject = async (project) => {
    if (
      confirm(
        `Are you sure you want to delete "${project.name}"? This action cannot be undone.`
      )
    ) {
      try {
        await ApiClient.docsProjects.delete(project.id);
        await loadDocsProjects();
      } catch (error) {
        console.error("Failed to delete project:", error);
      }
    }
  };

  const viewDocumentation = (project) => {
    // Navigate to public documentation using the new username-based URL
    if (user) {
      const username = generateUsername(user);
      const publicUrl = generatePublicDocUrl(username, project.name);
      window.open(publicUrl, "_blank");
    } else {
      // Fallback to old format if no user (shouldn't happen in authenticated context)
      console.warn("No user found for generating public documentation URL");
    }
  };

  // Sidebar handlers
  const handleNavItemClick = (itemId) => {
    if (itemId === "documentation") {
      // We're already on the docs page, just toggle sidebar
      if (activeMenuTab === itemId && sidebarContentOpen) {
        setSidebarContentOpen(false);
      } else {
        setActiveMenuTab(itemId);
        setSidebarContentOpen(true);
      }
      return;
    }

    // Navigate to playground with specific tab
    router.push(`/?tab=${itemId}`);
  };

  const toggleCollection = (collectionId) => {
    setExpandedCollections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(collectionId)) {
        newSet.delete(collectionId);
      } else {
        newSet.add(collectionId);
      }
      return newSet;
    });
  };

  const handleSidebarResizeStart = () => {
    setIsSidebarResizing(true);
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${themeClasses.bg.primary}`}>
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div
                className={`w-8 h-8 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4 ${
                  isDark
                    ? "border-gray-600 border-t-gray-300"
                    : "border-gray-300 border-t-gray-700"
                }`}
              ></div>
              <p className={`${themeClasses.text.secondary}`}>
                Loading documentation projects...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col ${
          sidebarCollapsed ? "lg:ml-0" : "lg:ml-0"
        } ml-0 lg:ml-0 w-full lg:w-auto px-6 ${themeClasses.bg.bold}`}
      >
        {/* Page Header */}
        <div className="py-6">
          {/* Search and Controls */}
          <div className="flex items-center gap-3">
            {/* Search Input - Full Width */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 z-10" />
              <Input
                placeholder="Find documentation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-9 text-sm focus:ring-0 focus:outline-none cursor-pointer"
                style={{
                  borderRadius: "6px",
                  borderColor: isDark
                    ? "rgb(55, 65, 81)"
                    : "rgb(235, 235, 235)",
                  backgroundColor: isDark ? "rgb(17, 24, 39)" : "white",
                  border: `1px solid ${
                    isDark ? "rgb(55, 65, 81)" : "rgb(235, 235, 235)"
                  }`,
                  boxShadow: "none",
                }}
              />
            </div>

            {/* Filter Button */}
            <div className="relative">
              <Button
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                variant="outline"
                size="sm"
                className={`px-3 py-1.5 h-9 cursor-pointer ${
                  isDark
                    ? "bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800"
                    : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
                style={{ borderRadius: "6px" }}
              >
                <Filter className="h-4 w-4" />
              </Button>

              {/* Filter Dropdown */}
              {showFilterDropdown && (
                <div
                  className={`absolute top-full mt-2 right-0 w-48 border rounded-xl shadow-xl z-50 ${
                    isDark
                      ? "border-gray-700 bg-gray-800"
                      : "border-gray-200 bg-white"
                  }`}
                  style={{ borderRadius: "12px" }}
                >
                  <div className="p-1">
                    <div
                      className={`px-3 py-2 text-xs font-medium ${
                        themeClasses.text.tertiary
                      } border-b ${
                        isDark ? "border-gray-700" : "border-gray-200"
                      }`}
                    >
                      Sort by
                    </div>
                    <button
                      onClick={() => {
                        setSortBy("updated");
                        setShowFilterDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors flex items-center justify-between ${
                        sortBy === "updated"
                          ? isDark
                            ? "bg-gray-700 text-white"
                            : "bg-gray-100 text-gray-900"
                          : isDark
                          ? "hover:bg-gray-700 text-gray-300"
                          : "hover:bg-gray-50 text-gray-700"
                      }`}
                    >
                      Recently Updated
                      {sortBy === "updated" && (
                        <div className="w-1.5 h-1.5 rounded-full bg-current" />
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setSortBy("created");
                        setShowFilterDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors flex items-center justify-between ${
                        sortBy === "created"
                          ? isDark
                            ? "bg-gray-700 text-white"
                            : "bg-gray-100 text-gray-900"
                          : isDark
                          ? "hover:bg-gray-700 text-gray-300"
                          : "hover:bg-gray-50 text-gray-700"
                      }`}
                    >
                      Recently Created
                      {sortBy === "created" && (
                        <div className="w-1.5 h-1.5 rounded-full bg-current" />
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setSortBy("name");
                        setShowFilterDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors flex items-center justify-between ${
                        sortBy === "name"
                          ? isDark
                            ? "bg-gray-700 text-white"
                            : "bg-gray-100 text-gray-900"
                          : isDark
                          ? "hover:bg-gray-700 text-gray-300"
                          : "hover:bg-gray-50 text-gray-700"
                      }`}
                    >
                      Name A-Z
                      {sortBy === "name" && (
                        <div className="w-1.5 h-1.5 rounded-full bg-current" />
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* View Toggle */}
            <div
              className={`flex items-center border rounded-md overflow-hidden h-9 ${
                isDark ? "border-gray-600" : "border-gray-200"
              }`}
              style={{ borderRadius: "6px" }}
            >
              <button
                onClick={() => setViewMode("grid")}
                className={`px-2.5 h-9 transition-colors cursor-pointer ${
                  viewMode === "grid"
                    ? isDark
                      ? "bg-gray-700 text-white"
                      : "bg-gray-100 text-gray-900"
                    : isDark
                    ? "text-gray-400 hover:text-white hover:bg-gray-800"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <Grid3X3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`px-2.5 h-9 transition-colors border-l cursor-pointer ${
                  isDark ? "border-gray-600" : "border-gray-200"
                } ${
                  viewMode === "list"
                    ? isDark
                      ? "bg-gray-700 text-white"
                      : "bg-gray-100 text-gray-900"
                    : isDark
                    ? "text-gray-400 hover:text-white hover:bg-gray-800"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>

            {/* Add New Button */}
            <Button
              onClick={createNewDocumentation}
              size="sm"
              className={`px-4 h-9 font-medium cursor-pointer ${
                isDark
                  ? "bg-white text-black hover:bg-gray-200"
                  : "bg-black text-white hover:bg-gray-800"
              }`}
              style={{ borderRadius: "6px" }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New
            </Button>
          </div>
        </div>

        {filteredProjects.length === 0 && !searchQuery ? (
          /* Empty state */
          <div className="py-24 text-center">
            <div
              className={`w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center ${
                isDark ? "bg-gray-800/50" : "bg-gray-100"
              }`}
            >
              <FileText className={`h-8 w-8 ${themeClasses.text.tertiary}`} />
            </div>
            <h3
              className={`text-xl font-semibold ${themeClasses.text.primary} mb-3`}
            >
              No documentation yet
            </h3>
            <p
              className={`${themeClasses.text.secondary} mb-8 max-w-md mx-auto`}
            >
              Create your first documentation from your API collections.
            </p>
            <Button
              onClick={createNewDocumentation}
              className={`cursor-pointer ${
                isDark
                  ? "bg-white text-black hover:bg-gray-200"
                  : "bg-black text-white hover:bg-gray-800"
              }`}
              style={{ borderRadius: "6px" }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Documentation
            </Button>
          </div>
        ) : searchQuery && filteredProjects.length === 0 ? (
          /* Search no results */
          <div className="py-24 text-center">
            <div className="max-w-md mx-auto">
              <div
                className={`w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center ${
                  isDark ? "bg-gray-800/50" : "bg-gray-100"
                }`}
              >
                <Search className={`h-8 w-8 ${themeClasses.text.tertiary}`} />
              </div>
              <h3
                className={`text-2xl font-semibold ${themeClasses.text.primary} mb-3`}
              >
                No results for "{searchQuery}"
              </h3>
              <p
                className={`text-lg ${themeClasses.text.secondary} mb-8 leading-relaxed`}
              >
                Try adjusting your search or create new documentation.
              </p>
              <div className="flex items-center justify-center gap-4">
                <Button
                  onClick={() => setSearchQuery("")}
                  variant="outline"
                  style={{ borderRadius: "8px" }}
                >
                  Clear search
                </Button>
                <Button
                  onClick={createNewDocumentation}
                  className={`${
                    isDark
                      ? "bg-white text-black hover:bg-gray-100"
                      : "bg-black text-white hover:bg-gray-800"
                  }`}
                  style={{ borderRadius: "8px" }}
                >
                  Create Documentation
                </Button>
              </div>
            </div>
          </div>
        ) : (
          /* Documentation Projects */
          <div className="pb-12">
            {/* Results Header */}
            {/* <div className="mb-6">
              <p className={`text-sm ${themeClasses.text.secondary}`}>
                {filteredProjects.length} project
                {filteredProjects.length !== 1 ? "s" : ""}
                {searchQuery && ` matching "${searchQuery}"`}
              </p>
            </div> */}

            {/* Projects Grid/List */}
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  : `border overflow-hidden ${
                      isDark
                        ? "border-gray-800 bg-gray-900/50"
                        : "border-gray-200 bg-white"
                    }`
              }
              style={viewMode === "list" ? { borderRadius: "6px" } : undefined}
            >
              {filteredProjects.map((project) => (
                <DocumentationProjectCard
                  key={project.id}
                  project={project}
                  viewMode={viewMode}
                  onView={() => viewDocumentation(project)}
                  onEdit={() => {
                    // Edit functionality is now handled by clicking the card
                  }}
                  onDuplicate={() => duplicateProject(project)}
                  onDelete={() => deleteProject(project)}
                  isDark={isDark}
                  themeClasses={themeClasses}
                />
              ))}
            </div>
          </div>
        )}
      </div>
      {/* End Page Content */}
      {/* Create Documentation Modal */}
      <DocGeneratorModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onGenerate={async () => {
          setShowCreateModal(false);
          await loadDocsProjects();
        }}
      />
    </>
  );
}
