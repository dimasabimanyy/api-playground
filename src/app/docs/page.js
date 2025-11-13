'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import TwoPanelSidebar from '@/components/playground/TwoPanelSidebar'
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
  BookOpen
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useTheme } from '@/contexts/ThemeContext'
import { useAuth } from '@/contexts/AuthContext'
import { useCollections } from '@/contexts/CollectionsContext'
import { getThemeClasses } from '@/lib/theme'
import { DocsProjects, DocsMetadata } from '@/lib/docs-storage'
import DocGeneratorModal from '@/components/docs/DocGeneratorModal'
import SearchInput from '@/components/ui/SearchInput'

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
        isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
      } flex items-center justify-center cursor-pointer text-sm font-medium`}
    >
      {getInitials()}
    </div>
  );
}

export default function DocsPage() {
  const { isDark, toggleTheme } = useTheme()
  const { user, signOut } = useAuth()
  const { collections, getCollectionsWithDocs } = useCollections()
  const themeClasses = getThemeClasses(isDark)
  const router = useRouter()

  // Sidebar state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true)
  const [activeMenuTab, setActiveMenuTab] = useState('documentation')
  const [sidebarContentOpen, setSidebarContentOpen] = useState(false)
  const [sidebarContentWidth, setSidebarContentWidth] = useState(280)
  const [isSidebarResizing, setIsSidebarResizing] = useState(false)
  const [expandedCollections, setExpandedCollections] = useState(new Set())

  const [docsProjects, setDocsProjects] = useState({})
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'
  const [sortBy, setSortBy] = useState('updated') // 'updated', 'created', 'name'
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showFilterDropdown, setShowFilterDropdown] = useState(false)

  // Sidebar menu items
  const sidebarMenuItems = [
    {
      id: "collections",
      icon: FolderOpen,
      label: "Collections",
      description: "Saved grouped requests",
    },
    {
      id: "history",
      icon: History,
      label: "History",
      description: "Past requests sent",
    },
    {
      id: "environments",
      icon: Globe,
      label: "Environments",
      description: "Manage variables like API keys, URLs, tokens",
    },
    {
      id: "documentation",
      icon: BookOpen,
      label: "Docs",
      description: "API Documentation",
    },
  ]

  // Load documentation projects
  useEffect(() => {
    loadDocsProjects()
  }, [])

  const loadDocsProjects = () => {
    try {
      const projects = DocsProjects.getAll()
      setDocsProjects(projects)
    } catch (error) {
      console.error('Failed to load documentation projects:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filter and sort projects
  const filteredProjects = Object.values(docsProjects)
    .filter(project => {
      if (!searchQuery) return true
      const query = searchQuery.toLowerCase()
      return (
        project.name.toLowerCase().includes(query) ||
        project.description?.toLowerCase().includes(query)
      )
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'created':
          return new Date(b.created) - new Date(a.created)
        case 'updated':
        default:
          return new Date(b.updated) - new Date(a.updated)
      }
    })

  const createNewDocumentation = () => {
    setShowCreateModal(true)
  }

  const duplicateProject = (project) => {
    const duplicated = DocsProjects.duplicate(project.id, `${project.name} Copy`)
    if (duplicated) {
      loadDocsProjects()
    }
  }

  const deleteProject = (project) => {
    if (confirm(`Are you sure you want to delete "${project.name}"? This action cannot be undone.`)) {
      DocsProjects.delete(project.id)
      loadDocsProjects()
    }
  }

  const viewDocumentation = (project) => {
    // Generate documentation and navigate to it
    const enhancedCollections = getCollectionsWithDocs()
    const projectCollections = {}
    
    project.collections.forEach(collectionId => {
      if (enhancedCollections[collectionId]) {
        projectCollections[collectionId] = enhancedCollections[collectionId]
      }
    })

    // Store project data and navigate
    const docId = `project_${project.id}_${Date.now()}`
    const docData = {
      project: project,
      collections: Object.values(projectCollections),
      customization: {
        title: project.name,
        description: project.description,
        baseUrl: project.settings?.baseUrl || 'https://api.example.com',
        ...project.settings
      },
      meta: {
        generatedAt: new Date().toISOString(),
        generator: 'API Playground',
        totalEndpoints: Object.values(projectCollections).reduce((acc, col) => acc + (col.requests?.length || 0), 0),
        totalCollections: Object.values(projectCollections).length,
      }
    }

    sessionStorage.setItem(`docs_${docId}`, JSON.stringify(docData))
    window.open(`/docs/generated?docId=${docId}&project=${project.id}`, '_blank')
  }

  // Sidebar handlers
  const handleNavItemClick = (itemId) => {
    if (itemId === "documentation") {
      // We're already on the docs page, just toggle sidebar
      if (activeMenuTab === itemId && sidebarContentOpen) {
        setSidebarContentOpen(false)
      } else {
        setActiveMenuTab(itemId)
        setSidebarContentOpen(true)
      }
      return
    }
    
    // Navigate to playground with specific tab
    router.push(`/?tab=${itemId}`)
  }

  const toggleCollection = (collectionId) => {
    setExpandedCollections(prev => {
      const newSet = new Set(prev)
      if (newSet.has(collectionId)) {
        newSet.delete(collectionId)
      } else {
        newSet.add(collectionId)
      }
      return newSet
    })
  }

  const handleSidebarResizeStart = () => {
    setIsSidebarResizing(true)
  }

  if (loading) {
    return (
      <div className={`min-h-screen ${themeClasses.bg.primary}`}>
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className={`w-8 h-8 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4 ${
                isDark ? 'border-gray-600 border-t-gray-300' : 'border-gray-300 border-t-gray-700'
              }`}></div>
              <p className={`${themeClasses.text.secondary}`}>Loading documentation projects...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${isDark ? themeClasses.bg.primary : 'bg-[#fafafa]'} flex`}>
      {/* Sidebar */}
      <TwoPanelSidebar
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
        themeClasses={themeClasses}
        isDark={isDark}
        sidebarMenuItems={sidebarMenuItems}
        activeMenuTab={activeMenuTab}
        onNavItemClick={handleNavItemClick}
        contentOpen={sidebarContentOpen}
        collections={collections}
        expandedCollections={expandedCollections}
        toggleCollection={toggleCollection}
        editingCollection={null}
        setEditingCollection={() => {}}
        updateCollection={() => {}}
        deleteCollection={() => {}}
        history={[]}
        loadRequest={() => {}}
        clearHistory={() => {}}
        setNewRequestType={() => {}}
        setRequest={() => {}}
        setActiveTab={() => {}}
        openTabs={[]}
        setOpenTabs={() => {}}
        setCreateCollectionDialogOpen={() => {}}
        contentWidth={sidebarContentWidth}
        onResizeStart={handleSidebarResizeStart}
        isResizing={isSidebarResizing}
      />

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        {/* Header - Theme Aware */}
        <header
          className={`border-b ${themeClasses.border.primary} ${themeClasses.bg.glass} h-14 flex items-center px-3 sm:px-6 transition-all duration-300 relative z-50`}
        >
        <div className="flex items-center space-x-2 sm:space-x-6 min-w-0 flex-shrink-0">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div
              className="h-6 w-6 sm:h-8 sm:w-8 flex items-center justify-center"
              style={{ borderRadius: "6px", backgroundColor: "#171717" }}
            >
              <Zap className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
            </div>
            <h1 className="text-sm sm:text-lg font-bold tracking-tight text-gray-900 dark:text-white hidden sm:block">
              Documentation
            </h1>
            <h1 className="text-sm font-bold tracking-tight text-gray-900 dark:text-white sm:hidden">
              Docs
            </h1>
          </div>
        </div>
        <div className="flex items-center space-x-1 sm:space-x-3 ml-auto">
          {/* Search Input */}
          <SearchInput
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Find..."
            expandedPlaceholder="Find documentation..."
            expandable={true}
            isDark={isDark}
          />

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-lg transition-all duration-200 ${
              isDark 
                ? 'hover:bg-gray-700 text-gray-300' 
                : 'hover:bg-gray-100 text-gray-600'
            }`}
            style={{ borderRadius: '6px' }}
          >
            {isDark ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>

          {/* User Avatar/Auth Section */}
          {user ? (
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
            <div className="h-8 w-8 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
          )}
        </div>
        </header>

        {/* Page Content */}
        <div className="max-w-7xl mx-auto px-6">
        {/* Page Header */}
        <div className="py-8">
          {/* Search and Controls */}
          <div className="flex items-center gap-3">
            {/* Search Input - Full Width */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 z-10" />
              <Input
                placeholder="Find documentation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 py-1.5 text-sm focus:ring-0 focus:outline-none cursor-pointer h-9"
                style={{
                  borderRadius: "6px",
                  borderColor: isDark ? "rgb(55, 65, 81)" : "rgb(235, 235, 235)",
                  backgroundColor: isDark ? "rgb(17, 24, 39)" : "white",
                  border: `1px solid ${isDark ? "rgb(55, 65, 81)" : "rgb(235, 235, 235)"}`,
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
                    ? 'bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800' 
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
                style={{ borderRadius: '6px' }}
              >
                <Filter className="h-4 w-4" />
              </Button>
              
              {/* Filter Dropdown */}
              {showFilterDropdown && (
                <div
                  className={`absolute top-full mt-2 right-0 w-48 border rounded-xl shadow-xl z-50 ${
                    isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
                  }`}
                  style={{ borderRadius: '12px' }}
                >
                  <div className="p-1">
                    <div className={`px-3 py-2 text-xs font-medium ${themeClasses.text.tertiary} border-b ${
                      isDark ? 'border-gray-700' : 'border-gray-200'
                    }`}>
                      Sort by
                    </div>
                    <button
                      onClick={() => { setSortBy('updated'); setShowFilterDropdown(false); }}
                      className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors flex items-center justify-between ${
                        sortBy === 'updated'
                          ? isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
                          : isDark ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      Recently Updated
                      {sortBy === 'updated' && <div className="w-1.5 h-1.5 rounded-full bg-current" />}
                    </button>
                    <button
                      onClick={() => { setSortBy('created'); setShowFilterDropdown(false); }}
                      className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors flex items-center justify-between ${
                        sortBy === 'created'
                          ? isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
                          : isDark ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      Recently Created
                      {sortBy === 'created' && <div className="w-1.5 h-1.5 rounded-full bg-current" />}
                    </button>
                    <button
                      onClick={() => { setSortBy('name'); setShowFilterDropdown(false); }}
                      className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors flex items-center justify-between ${
                        sortBy === 'name'
                          ? isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
                          : isDark ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      Name A-Z
                      {sortBy === 'name' && <div className="w-1.5 h-1.5 rounded-full bg-current" />}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* View Toggle */}
            <div className={`flex items-center border rounded-md overflow-hidden h-9 ${
              isDark ? 'border-gray-600' : 'border-gray-200'
            }`} style={{ borderRadius: '6px' }}>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-2.5 py-1.5 transition-colors cursor-pointer ${
                  viewMode === 'grid'
                    ? isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
                    : isDark ? 'text-gray-400 hover:text-white hover:bg-gray-800' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Grid3X3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-2.5 py-1.5 transition-colors border-l cursor-pointer ${
                  isDark ? 'border-gray-600' : 'border-gray-200'
                } ${
                  viewMode === 'list'
                    ? isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
                    : isDark ? 'text-gray-400 hover:text-white hover:bg-gray-800' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>

            {/* Add New Button */}
            <Button
              onClick={createNewDocumentation}
              size="sm"
              className={`px-4 py-1.5 h-9 font-medium cursor-pointer ${
                isDark 
                  ? 'bg-white text-black hover:bg-gray-200' 
                  : 'bg-black text-white hover:bg-gray-800'
              }`}
              style={{ borderRadius: '6px' }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New
            </Button>
          </div>
        </div>

        {filteredProjects.length === 0 && !searchQuery ? (
          /* Empty state */
          <div className="py-24 text-center">
            <div className={`w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center ${
              isDark ? 'bg-gray-800/50' : 'bg-gray-100'
            }`}>
              <FileText className={`h-8 w-8 ${themeClasses.text.tertiary}`} />
            </div>
            <h3 className={`text-xl font-semibold ${themeClasses.text.primary} mb-3`}>
              No documentation yet
            </h3>
            <p className={`${themeClasses.text.secondary} mb-8 max-w-md mx-auto`}>
              Create your first documentation from your API collections.
            </p>
            <Button
              onClick={createNewDocumentation}
              className={`${
                isDark 
                  ? 'bg-white text-black hover:bg-gray-200' 
                  : 'bg-black text-white hover:bg-gray-800'
              }`}
              style={{ borderRadius: '6px' }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Documentation
            </Button>
          </div>
        ) : searchQuery && filteredProjects.length === 0 ? (
          /* Search no results */
          <div className="py-24 text-center">
            <div className="max-w-md mx-auto">
              <div className={`w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center ${
                isDark ? 'bg-gray-800/50' : 'bg-gray-100'
              }`}>
                <Search className={`h-8 w-8 ${themeClasses.text.tertiary}`} />
              </div>
              <h3 className={`text-2xl font-semibold ${themeClasses.text.primary} mb-3`}>
                No results for "{searchQuery}"
              </h3>
              <p className={`text-lg ${themeClasses.text.secondary} mb-8 leading-relaxed`}>
                Try adjusting your search or create new documentation.
              </p>
              <div className="flex items-center justify-center gap-4">
                <Button
                  onClick={() => setSearchQuery('')}
                  variant="outline"
                  style={{ borderRadius: '8px' }}
                >
                  Clear search
                </Button>
                <Button
                  onClick={createNewDocumentation}
                  className={`${
                    isDark 
                      ? 'bg-white text-black hover:bg-gray-100' 
                      : 'bg-black text-white hover:bg-gray-800'
                  }`}
                  style={{ borderRadius: '8px' }}
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
            <div className="mb-6">
              <p className={`text-sm ${themeClasses.text.secondary}`}>
                {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''}
                {searchQuery && ` matching "${searchQuery}"`}
              </p>
            </div>

            {/* Projects Grid/List */}
            <div className={
              viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                : `border rounded-lg overflow-hidden ${isDark ? 'border-gray-800 bg-gray-900/50' : 'border-gray-200 bg-white'}`
            }
              style={viewMode === 'list' ? { borderRadius: '12px' } : undefined}
            >
              {filteredProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  collections={collections}
                  viewMode={viewMode}
                  onView={() => viewDocumentation(project)}
                  onEdit={() => {/* TODO: Edit project */}}
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
          collections={getCollectionsWithDocs()}
          onGenerate={() => {
            setShowCreateModal(false)
            loadDocsProjects()
          }}
        />
      </div>
      {/* End Main Content */}
    </div>
  )
}

// Project card component
function ProjectCard({ 
  project, 
  collections,
  viewMode, 
  onView, 
  onEdit, 
  onDuplicate, 
  onDelete, 
  isDark, 
  themeClasses 
}) {
  const [showMenu, setShowMenu] = useState(false)

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getCollectionCount = () => project.collections?.length || 0
  const getEndpointCount = () => {
    if (!project.collections) return 0
    
    // Calculate total endpoints from all collections in the project
    let totalEndpoints = 0
    project.collections.forEach(collectionId => {
      const collection = collections[collectionId]
      if (collection && collection.requests) {
        totalEndpoints += collection.requests.length
      }
    })
    
    return totalEndpoints
  }

  if (viewMode === 'list') {
    return (
      <div className={`group p-4 transition-all duration-200 border-b last:border-b-0 ${
        isDark 
          ? 'border-gray-800 hover:bg-gray-800/30' 
          : 'border-gray-200 hover:bg-gray-50'
      }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-600'
            }`}
              style={{ borderRadius: '8px' }}
            >
              <FileText className="w-5 h-5" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className={`font-semibold ${themeClasses.text.primary} truncate mb-1`}>
                {project.name}
              </h3>
              <p className={`text-sm ${themeClasses.text.secondary} truncate`}>
                {project.description || 'No description'}
              </p>
            </div>
            
            <div className="hidden md:flex items-center gap-6">
              <div className={`flex items-center gap-4 text-xs ${themeClasses.text.tertiary}`}>
                <span className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-current opacity-50"></div>
                  {getCollectionCount()} collections
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-current opacity-50"></div>
                  {getEndpointCount()} endpoints
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 opacity-50" />
                  {formatDate(project.updated)}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              onClick={onView}
              size="sm"
              className={`cursor-pointer ${
                isDark 
                  ? 'bg-white text-black hover:bg-gray-100' 
                  : 'bg-black text-white hover:bg-gray-800'
              }`}
              style={{ borderRadius: '6px' }}
            >
              View
            </Button>
            
            <div className="relative opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                onClick={() => setShowMenu(!showMenu)}
                size="sm"
                variant="ghost"
                className="cursor-pointer"
                style={{ borderRadius: '6px' }}
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
              
              {showMenu && (
                <div className={`absolute right-0 top-10 z-20 w-48 border rounded-xl shadow-xl ${
                  isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
                }`}
                  style={{ borderRadius: '12px' }}
                >
                  <div className="p-1">
                    <button
                      onClick={() => { onEdit(); setShowMenu(false); }}
                      className={`w-full text-left px-3 py-2 text-sm rounded-lg cursor-pointer hover:${
                        isDark ? 'bg-gray-700' : 'bg-gray-100'
                      } flex items-center gap-2 transition-colors`}
                    >
                      <Edit3 className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => { onDuplicate(); setShowMenu(false); }}
                      className={`w-full text-left px-3 py-2 text-sm rounded-lg cursor-pointer hover:${
                        isDark ? 'bg-gray-700' : 'bg-gray-100'
                      } flex items-center gap-2 transition-colors`}
                    >
                      <Copy className="w-4 h-4" />
                      Duplicate
                    </button>
                    <button
                      onClick={() => { onDelete(); setShowMenu(false); }}
                      className="w-full text-left px-3 py-2 text-sm rounded-lg cursor-pointer hover:bg-red-500/10 text-red-500 flex items-center gap-2 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Grid view
  return (
    <div className={`group border rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-gray-200/20 ${
      isDark ? 'border-gray-800 bg-gray-900/50 hover:border-gray-700 hover:bg-gray-900' : 'border-gray-200 bg-white hover:border-gray-300'
    }`}
      style={{ borderRadius: '6px' }}
    >
      <div className="p-6">
        {/* Header - Icon, Title, URL, Menu in same row */}
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
            isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-600'
          }`}
            style={{ borderRadius: '8px' }}
          >
            <FileText className="w-5 h-5" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className={`text-base font-semibold ${themeClasses.text.primary} truncate`}>
              {project.name}
            </h3>
            <p className={`text-xs ${themeClasses.text.tertiary} truncate`}>
              docs.example.com/{project.name.toLowerCase().replace(/\s+/g, '-')}
            </p>
          </div>
          
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className={`p-2 rounded-lg transition-colors cursor-pointer opacity-0 group-hover:opacity-100 hover:${
                isDark ? 'bg-gray-800' : 'bg-gray-100'
              }`}
              style={{ borderRadius: '6px' }}
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            
            {showMenu && (
              <div className={`absolute right-0 top-10 z-20 w-48 border rounded-xl shadow-xl ${
                isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
              }`}
                style={{ borderRadius: '12px' }}
              >
                <div className="p-1">
                  <button
                    onClick={() => { onEdit(); setShowMenu(false); }}
                    className={`w-full text-left px-3 py-2 text-sm rounded-lg cursor-pointer hover:${
                      isDark ? 'bg-gray-700' : 'bg-gray-100'
                    } flex items-center gap-2 transition-colors`}
                  >
                    <Edit3 className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => { onDuplicate(); setShowMenu(false); }}
                    className={`w-full text-left px-3 py-2 text-sm rounded-lg cursor-pointer hover:${
                      isDark ? 'bg-gray-700' : 'bg-gray-100'
                    } flex items-center gap-2 transition-colors`}
                  >
                    <Copy className="w-4 h-4" />
                    Duplicate
                  </button>
                  <button
                    onClick={() => { onDelete(); setShowMenu(false); }}
                    className="w-full text-left px-3 py-2 text-sm rounded-lg cursor-pointer hover:bg-red-500/10 text-red-500 flex items-center gap-2 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Description */}
        <div className="mb-4">
          <p className={`text-sm ${themeClasses.text.secondary} line-clamp-2 leading-relaxed`}>
            {project.description || 'No description provided'}
          </p>
        </div>
        
        {/* Stats */}
        <div className={`flex items-center gap-4 mb-6 text-xs ${themeClasses.text.tertiary}`}>
          <span className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-current opacity-50"></div>
            {getCollectionCount()} collections
          </span>
          <span className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-current opacity-50"></div>
            {getEndpointCount()} endpoints
          </span>
          <span className="flex items-center gap-1 ml-auto">
            <Calendar className="w-3 h-3 opacity-50" />
            {formatDate(project.updated)}
          </span>
        </div>
        
        {/* Actions */}
        <div className="flex gap-3">
          <Button
            onClick={onView}
            className={`cursor-pointer ${
              isDark 
                ? 'bg-white text-black hover:bg-gray-100' 
                : 'bg-black text-white hover:bg-gray-800'
            }`}
            size="sm"
            style={{ borderRadius: '8px' }}
          >
            View Documentation
          </Button>
        </div>
      </div>
    </div>
  )
}