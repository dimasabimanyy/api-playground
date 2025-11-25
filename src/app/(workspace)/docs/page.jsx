"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  FileText,
  Search,
  Filter,
  Grid3X3,
  List,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { getThemeClasses } from "@/lib/theme";
import ApiClient from "@/lib/api-client";
import { generateUsername, generatePublicDocUrl } from "@/lib/user-utils";
import DocGeneratorModal from "@/components/docs/DocGeneratorModal";
import DocumentationProjectCard from "@/components/docs/DocumentationProjectCard";

export default function DocsPage() {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const themeClasses = getThemeClasses(isDark);

  const [docsProjects, setDocsProjects] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("list"); // 'grid' or 'list'
  const [sortBy, setSortBy] = useState("updated"); // 'updated', 'created', 'name'
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(2);
  const [pagination, setPagination] = useState({
    totalCount: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  // Load documentation projects
  useEffect(() => {
    loadDocsProjects();
  }, [currentPage, pageSize]);

  const loadDocsProjects = async () => {
    try {
      setLoading(true);
      const response = await ApiClient.docsProjects.getAll({
        page: currentPage,
        pageSize: pageSize,
      });

      // Convert array to object format for compatibility
      const projectsObj = {};
      response.projects?.forEach((project) => {
        projectsObj[project.id] = project;
      });

      setDocsProjects(projectsObj);
      setPagination(
        response.pagination || {
          totalCount: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        }
      );
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
          return (
            new Date(b.created_at || b.created) -
            new Date(a.created_at || a.created)
          );
        case "updated":
        default:
          return (
            new Date(b.updated_at || b.updated) -
            new Date(a.updated_at || a.updated)
          );
      }
    });

  const createNewDocumentation = () => {
    setShowCreateModal(true);
  };

  // Pagination handlers
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handlePageSizeChange = (newPageSize) => {
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  const handlePreviousPage = () => {
    if (pagination.hasPreviousPage) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (pagination.hasNextPage) {
      setCurrentPage(currentPage + 1);
    }
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
        className={`flex-1 flex flex-col ml-0 lg:ml-0 w-full lg:w-auto px-6 ${themeClasses.bg.bold}`}
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

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-8 flex items-center justify-between">
                {/* Results info */}
                <div className="flex items-center gap-4">
                  <p className={`text-sm ${themeClasses.text.secondary}`}>
                    Showing {(currentPage - 1) * pageSize + 1} to{" "}
                    {Math.min(currentPage * pageSize, pagination.totalCount)} of{" "}
                    {pagination.totalCount} projects
                  </p>

                  {/* Page size selector */}
                  <div className="flex items-center gap-2">
                    <span className={`text-sm ${themeClasses.text.secondary}`}>
                      Show:
                    </span>
                    <select
                      value={pageSize}
                      onChange={(e) =>
                        handlePageSizeChange(parseInt(e.target.value))
                      }
                      className={`px-2 py-1 text-sm border rounded ${
                        isDark
                          ? "bg-gray-800 border-gray-600 text-gray-200"
                          : "bg-white border-gray-300 text-gray-700"
                      }`}
                    >
                      <option value={6}>6</option>
                      <option value={12}>12</option>
                      <option value={24}>24</option>
                      <option value={48}>48</option>
                    </select>
                  </div>
                </div>

                {/* Pagination controls */}
                <div className="flex items-center gap-2">
                  <Button
                    onClick={handlePreviousPage}
                    disabled={!pagination.hasPreviousPage}
                    variant="outline"
                    size="sm"
                    className={`px-2 h-8 ${
                      isDark
                        ? "border-gray-600 text-gray-300 hover:bg-gray-800 disabled:text-gray-500"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50 disabled:text-gray-400"
                    }`}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  {/* Page numbers */}
                  <div className="flex items-center gap-1">
                    {Array.from(
                      { length: Math.min(5, pagination.totalPages) },
                      (_, index) => {
                        let pageNumber;
                        if (pagination.totalPages <= 5) {
                          pageNumber = index + 1;
                        } else if (currentPage <= 3) {
                          pageNumber = index + 1;
                        } else if (currentPage >= pagination.totalPages - 2) {
                          pageNumber = pagination.totalPages - 4 + index;
                        } else {
                          pageNumber = currentPage - 2 + index;
                        }

                        return (
                          <Button
                            key={pageNumber}
                            onClick={() => handlePageChange(pageNumber)}
                            variant={
                              currentPage === pageNumber ? "default" : "outline"
                            }
                            size="sm"
                            className={`px-3 h-8 min-w-[32px] ${
                              currentPage === pageNumber
                                ? isDark
                                  ? "bg-white text-black"
                                  : "bg-black text-white"
                                : isDark
                                ? "border-gray-600 text-gray-300 hover:bg-gray-800"
                                : "border-gray-300 text-gray-700 hover:bg-gray-50"
                            }`}
                          >
                            {pageNumber}
                          </Button>
                        );
                      }
                    )}
                  </div>

                  <Button
                    onClick={handleNextPage}
                    disabled={!pagination.hasNextPage}
                    variant="outline"
                    size="sm"
                    className={`px-2 h-8 ${
                      isDark
                        ? "border-gray-600 text-gray-300 hover:bg-gray-800 disabled:text-gray-500"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50 disabled:text-gray-400"
                    }`}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
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
