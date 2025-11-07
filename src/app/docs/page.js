'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
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
  Sun
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useTheme } from '@/contexts/ThemeContext'
import { useAuth } from '@/contexts/AuthContext'
import { useCollections } from '@/contexts/CollectionsContext'
import { getThemeClasses } from '@/lib/theme'
import { DocsProjects, DocsMetadata } from '@/lib/docs-storage'
import DocGeneratorModal from '@/components/docs/DocGeneratorModal'

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

  const [docsProjects, setDocsProjects] = useState({})
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'
  const [sortBy, setSortBy] = useState('updated') // 'updated', 'created', 'name'
  const [showCreateModal, setShowCreateModal] = useState(false)

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
    <div className={`min-h-screen ${themeClasses.bg.primary}`}>
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
          <div className="relative z-[99999] search-container">
            <div className="transition-all duration-300 w-32 sm:w-40">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 z-10" />
              <Input
                placeholder="Find..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 py-1.5 text-sm focus:ring-0 focus:outline-none cursor-pointer transition-all duration-300"
                style={{
                  borderRadius: "6px",
                  borderColor: "rgb(235, 235, 235)",
                  backgroundColor: "white",
                  border: "1px solid rgb(235, 235, 235)",
                  boxShadow: "none",
                }}
              />
            </div>
          </div>
          {/* Create Documentation Button */}
          <Button
            onClick={createNewDocumentation}
            size="sm"
            className={`${
              isDark 
                ? 'bg-white text-black hover:bg-gray-200' 
                : 'bg-black text-white hover:bg-gray-800'
            }`}
            style={{ borderRadius: '6px' }}
          >
            <Plus className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">New</span>
          </Button>

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

      {/* Sub-header with description and stats */}
      <div className={`border-b ${themeClasses.border.primary} ${themeClasses.bg.glass}`}>
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <p className={`text-sm ${themeClasses.text.secondary}`}>
                Create, manage, and share beautiful API documentation from your collections
              </p>
              <div className="flex items-center gap-4 text-xs">
                <span className={`${themeClasses.text.tertiary}`}>
                  Last updated: {Object.keys(docsProjects).length > 0 ? 'Today' : 'Never'}
                </span>
                <span className={`${themeClasses.text.tertiary}`}>•</span>
                <span className={`${themeClasses.text.tertiary}`}>
                  {Object.values(docsProjects).reduce((total, project) => {
                    return total + (project.collections?.length || 0);
                  }, 0)} collections documented
                </span>
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="hidden sm:flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                style={{ borderRadius: '6px' }}
              >
                <Globe className="h-3 w-3 mr-1" />
                Browse Examples
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className={`border-b ${themeClasses.border.primary}`}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left section - Stats or filters could go here */}
            <div className="flex items-center gap-4">
              <span className={`text-sm ${themeClasses.text.secondary}`}>
                {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''} found
              </span>
            </div>

            {/* Right section - Controls */}
            <div className="flex items-center gap-2">
              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={`text-sm px-3 py-2 border rounded transition-colors ${
                  isDark 
                    ? 'bg-gray-900 border-gray-700 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
                style={{ borderRadius: '6px' }}
              >
                <option value="updated">Recently Updated</option>
                <option value="created">Recently Created</option>
                <option value="name">Name A-Z</option>
              </select>

              {/* View Mode */}
              <div className={`flex items-center border rounded ${
                isDark ? 'border-gray-700' : 'border-gray-300'
              }`}
                style={{ borderRadius: '6px' }}
              >
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 transition-colors ${
                    viewMode === 'grid'
                      ? isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
                      : isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 transition-colors ${
                    viewMode === 'list'
                      ? isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
                      : isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {filteredProjects.length === 0 ? (
          <div className="text-center py-24">
            {searchQuery ? (
              // No search results
              <div className="max-w-md mx-auto">
                <div className={`w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center ${
                  isDark ? 'bg-gray-800/50' : 'bg-gray-100'
                }`}>
                  <Search className={`h-8 w-8 ${themeClasses.text.tertiary}`} />
                </div>
                <h3 className={`text-xl font-semibold ${themeClasses.text.primary} mb-3`}>
                  No documentation found
                </h3>
                <p className={`${themeClasses.text.secondary} mb-6 leading-relaxed`}>
                  No documentation projects match your search for "{searchQuery}". Try adjusting your search terms or create a new project.
                </p>
                <Button
                  onClick={() => setSearchQuery('')}
                  variant="outline"
                  style={{ borderRadius: '6px' }}
                >
                  Clear search
                </Button>
              </div>
            ) : (
              // No projects at all
              <div className="max-w-md mx-auto">
                <div className={`w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center ${
                  isDark ? 'bg-gray-800/50' : 'bg-gray-100'
                }`}>
                  <FileText className={`h-8 w-8 ${themeClasses.text.tertiary}`} />
                </div>
                <h3 className={`text-xl font-semibold ${themeClasses.text.primary} mb-3`}>
                  No documentation projects yet
                </h3>
                <p className={`${themeClasses.text.secondary} mb-8 leading-relaxed`}>
                  Create your first documentation project from your API collections and start sharing beautiful, interactive documentation.
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
            )}
          </div>
        ) : (
          // Projects grid/list
          <div className={
            viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-4'
          }>
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
        )}
      </div>

      {/* Create Documentation Modal */}
      <DocGeneratorModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        collections={getCollectionsWithDocs()}
        onGenerate={(docData) => {
          setShowCreateModal(false)
          loadDocsProjects()
        }}
      />
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
      <div className={`border rounded-lg p-6 transition-colors hover:${
        isDark ? 'bg-gray-800/30 border-gray-600' : 'bg-gray-50 border-gray-300'
      } ${
        isDark ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-white'
      }`}
        style={{ borderRadius: '12px' }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6 flex-1 min-w-0">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              isDark ? 'bg-gray-700/50 text-gray-300' : 'bg-gray-100 text-gray-600'
            }`}
              style={{ borderRadius: '8px' }}
            >
              <FileText className="w-5 h-5" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className={`font-semibold ${themeClasses.text.primary} truncate`}>
                {project.name}
              </h3>
              <p className={`text-sm ${themeClasses.text.secondary} truncate`}>
                {project.description || 'No description'}
              </p>
            </div>
            
            <div className="hidden md:flex items-center gap-8 text-sm">
              <div className={`flex items-center gap-2 ${themeClasses.text.tertiary}`}>
                <Calendar className="w-4 h-4" />
                {formatDate(project.updated)}
              </div>
              <div className={`${themeClasses.text.tertiary}`}>
                {getCollectionCount()} collections
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              onClick={onView}
              size="sm"
              variant="outline"
              style={{ borderRadius: '6px' }}
            >
              <Eye className="w-3 h-3 mr-1" />
              View
            </Button>
            
            <div className="relative">
              <Button
                onClick={() => setShowMenu(!showMenu)}
                size="sm"
                variant="ghost"
                style={{ borderRadius: '6px' }}
              >
                <MoreVertical className="w-3 h-3" />
              </Button>
              
              {showMenu && (
                <div className={`absolute right-0 top-8 z-10 w-48 border rounded-lg shadow-lg ${
                  isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
                }`}
                  style={{ borderRadius: '8px' }}
                >
                  <button
                    onClick={() => { onEdit(); setShowMenu(false); }}
                    className={`w-full text-left px-3 py-2 text-sm hover:${
                      isDark ? 'bg-gray-700' : 'bg-gray-100'
                    } flex items-center gap-2`}
                  >
                    <Edit3 className="w-3 h-3" />
                    Edit
                  </button>
                  <button
                    onClick={() => { onDuplicate(); setShowMenu(false); }}
                    className={`w-full text-left px-3 py-2 text-sm hover:${
                      isDark ? 'bg-gray-700' : 'bg-gray-100'
                    } flex items-center gap-2`}
                  >
                    <Copy className="w-3 h-3" />
                    Duplicate
                  </button>
                  <button
                    onClick={() => { onDelete(); setShowMenu(false); }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-red-500/10 text-red-500 flex items-center gap-2"
                  >
                    <Trash2 className="w-3 h-3" />
                    Delete
                  </button>
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
    <div className={`border rounded-lg transition-all duration-200 hover:shadow-lg ${
      isDark ? 'border-gray-700 bg-gray-900 hover:border-gray-600' : 'border-gray-200 bg-white hover:border-gray-300'
    }`}
      style={{ borderRadius: '12px' }}
    >
      <div className="p-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
            isDark ? 'bg-gray-700/50 text-gray-300' : 'bg-gray-100 text-gray-600'
          }`}
            style={{ borderRadius: '8px' }}
          >
            <FileText className="w-6 h-6" />
          </div>
          
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className={`p-1 rounded transition-colors hover:${
                isDark ? 'bg-gray-800' : 'bg-gray-100'
              }`}
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            
            {showMenu && (
              <div className={`absolute right-0 top-8 z-10 w-48 border rounded-lg shadow-lg ${
                isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
              }`}
                style={{ borderRadius: '8px' }}
              >
                <button
                  onClick={() => { onEdit(); setShowMenu(false); }}
                  className={`w-full text-left px-3 py-2 text-sm hover:${
                    isDark ? 'bg-gray-700' : 'bg-gray-100'
                  } flex items-center gap-2`}
                >
                  <Edit3 className="w-3 h-3" />
                  Edit
                </button>
                <button
                  onClick={() => { onDuplicate(); setShowMenu(false); }}
                  className={`w-full text-left px-3 py-2 text-sm hover:${
                    isDark ? 'bg-gray-700' : 'bg-gray-100'
                  } flex items-center gap-2`}
                >
                  <Copy className="w-3 h-3" />
                  Duplicate
                </button>
                <button
                  onClick={() => { onDelete(); setShowMenu(false); }}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-red-500/10 text-red-500 flex items-center gap-2"
                >
                  <Trash2 className="w-3 h-3" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Content */}
        <div className="mb-6">
          <h3 className={`text-xl font-semibold ${themeClasses.text.primary} mb-3 line-clamp-1`}>
            {project.name}
          </h3>
          <p className={`text-sm ${themeClasses.text.secondary} line-clamp-2 leading-relaxed`}>
            {project.description || 'No description provided'}
          </p>
        </div>
        
        {/* Stats */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-6 text-sm">
            <span className={`${themeClasses.text.tertiary}`}>
              {getCollectionCount()} collections
            </span>
            <span className={`${themeClasses.text.tertiary}`}>
              {getEndpointCount()} endpoints
            </span>
          </div>
          
          <div className={`text-xs ${themeClasses.text.tertiary}`}>
            Updated {formatDate(project.updated)}
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex gap-2">
          <Button
            onClick={onView}
            className="flex-1"
            variant="outline"
            size="sm"
            style={{ borderRadius: '6px' }}
          >
            <Eye className="w-3 h-3 mr-1" />
            View
          </Button>
          <Button
            onClick={onEdit}
            size="sm"
            variant="ghost"
            style={{ borderRadius: '6px' }}
          >
            <Edit3 className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  )
}