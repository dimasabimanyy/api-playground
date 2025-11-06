'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  FolderOpen, 
  FolderPlus, 
  Search, 
  Trash2, 
  Star,
  ChevronDown,
  ChevronRight,
  Folder,
  Loader2
} from 'lucide-react'
import { useCollections } from '@/contexts/CollectionsContext'

export default function CollectionsSidebar({ 
  onCollectionSelect, 
  onRequestSelect, 
  activeRequestId 
}) {
  const { 
    collections, 
    activeCollectionId, 
    loading, 
    error,
    createCollection,
    deleteCollection,
    setActiveCollectionId,
    clearError
  } = useCollections()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [newCollectionDialog, setNewCollectionDialog] = useState(false)
  const [newCollectionName, setNewCollectionName] = useState('')
  const [newCollectionDescription, setNewCollectionDescription] = useState('')
  const [expandedCollections, setExpandedCollections] = useState(new Set())
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    // Auto-expand active collection
    if (activeCollectionId) {
      setExpandedCollections(prev => new Set(prev).add(activeCollectionId))
    }
  }, [activeCollectionId])

  const handleCollectionSelect = (collectionId) => {
    setActiveCollectionId(collectionId)
    if (onCollectionSelect) {
      onCollectionSelect(collectionId)
    }
  }

  const handleCreateCollection = async () => {
    if (!newCollectionName.trim()) return
    
    setCreating(true)
    try {
      const newCollection = await createCollection(
        newCollectionName,
        newCollectionDescription,
        'blue'
      )
      
      handleCollectionSelect(newCollection.id)
      setNewCollectionDialog(false)
      setNewCollectionName('')
      setNewCollectionDescription('')
    } catch (err) {
      console.error('Failed to create collection:', err)
    } finally {
      setCreating(false)
    }
  }

  const handleDeleteCollection = async (collectionId) => {
    if (window.confirm('Are you sure you want to delete this collection?')) {
      try {
        await deleteCollection(collectionId)
      } catch (err) {
        console.error('Failed to delete collection:', err)
      }
    }
  }

  const toggleCollectionExpansion = (collectionId) => {
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

  const getCollectionIcon = (collection, isExpanded) => {
    if (collection.name === 'Examples') return <Star className="h-4 w-4" />
    return isExpanded ? <FolderOpen className="h-4 w-4" /> : <Folder className="h-4 w-4" />
  }

  const getCollectionColor = (color) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
      green: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
      purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
      orange: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
      red: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
    }
    return colors[color] || colors.blue
  }

  const filteredCollections = Object.values(collections).filter(collection =>
    collection.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    collection.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    collection.requests?.some(req => 
      req.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.url.toLowerCase().includes(searchQuery.toLowerCase())
    )
  )

  return (
    <div className="w-64 border-r bg-white h-full flex flex-col" style={{ borderColor: 'rgb(235, 235, 235)' }}>
      {/* Header */}
      <div className="px-4 py-3 border-b" style={{ borderColor: 'rgb(235, 235, 235)' }}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-gray-900">Collections</h2>
          <Dialog open={newCollectionDialog} onOpenChange={setNewCollectionDialog}>
            <DialogTrigger asChild>
              <button 
                className="h-6 w-6 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
                style={{ borderRadius: '6px' }}
                onClick={() => {
                  console.log('Plus button clicked, opening dialog');
                  setNewCollectionDialog(true);
                }}
              >
                <FolderPlus className="h-4 w-4" />
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md" style={{ borderRadius: '12px', borderColor: 'rgb(235, 235, 235)' }}>
              <DialogHeader>
                <DialogTitle className="text-base font-medium">Create Collection</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 pt-3">
                <div>
                  <Input
                    placeholder="Collection name"
                    value={newCollectionName}
                    onChange={(e) => setNewCollectionName(e.target.value)}
                    className="h-8 text-sm focus:ring-0"
                    style={{ borderRadius: '6px', borderColor: 'rgb(235, 235, 235)', backgroundColor: '#fafafa' }}
                    disabled={creating}
                  />
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <Button variant="outline" onClick={() => setNewCollectionDialog(false)} size="sm" className="px-3 text-xs" style={{ borderRadius: '6px', borderColor: 'rgb(235, 235, 235)', backgroundColor: '#fafafa' }} disabled={creating}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateCollection} disabled={!newCollectionName.trim() || creating} size="sm" className="px-3 text-xs text-white" style={{ borderRadius: '6px', backgroundColor: '#171717', border: 'none' }}>
                    {creating ? (
                      <>
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create'
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-3 p-2 bg-red-50 border text-xs text-red-700" style={{ borderRadius: '6px', borderColor: 'rgb(235, 235, 235)' }}>
            {error}
            <button 
              onClick={clearError}
              className="ml-1 underline hover:no-underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          <Input
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-7 text-sm border-0 focus:ring-1 transition-all"
            style={{ borderRadius: '6px', backgroundColor: '#fafafa' }}
          />
        </div>
      </div>

      {/* Collections List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {filteredCollections.map(collection => {
            const isExpanded = expandedCollections.has(collection.id)
            return (
              <div key={collection.id} className="group">
                {/* Collection Header */}
                <div className="flex items-center px-2 py-1.5 hover:bg-gray-50 cursor-pointer transition-colors" style={{ borderRadius: '6px' }}>
                  <button
                    className="h-5 w-5 flex items-center justify-center mr-1.5 text-gray-400 hover:text-gray-600"
                    style={{ borderRadius: '6px' }}
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleCollectionExpansion(collection.id)
                    }}
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-3 w-3" />
                    ) : (
                      <ChevronRight className="h-3 w-3" />
                    )}
                  </button>
                  
                  <div
                    className="flex items-center justify-between flex-1 min-w-0"
                    onClick={() => handleCollectionSelect(collection.id)}
                  >
                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                      <div className="text-gray-400">
                        {getCollectionIcon(collection, isExpanded)}
                      </div>
                      <span className={`text-sm truncate ${ 
                        activeCollectionId === collection.id ? 'text-gray-900 font-medium' : 'text-gray-700'
                      }`}>
                        {collection.name}
                      </span>
                      <span className="text-xs text-gray-400 ml-auto">
                        {collection.requests?.length || 0}
                      </span>
                    </div>
                    
                    {collection.name !== 'Examples' && (
                      <button
                        className="h-5 w-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-600 ml-1"
                        style={{ borderRadius: '6px' }}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteCollection(collection.id)
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Requests List */}
                {isExpanded && collection.requests?.length > 0 && (
                  <div className="ml-6 space-y-0.5">
                    {collection.requests.map(request => (
                      <div
                        key={request.id}
                        className={`flex items-center px-2 py-1 cursor-pointer transition-colors ${
                          activeRequestId === request.id
                            ? 'bg-gray-100 text-gray-900'
                            : 'hover:bg-gray-50 text-gray-600'
                        }`}
                        style={{ borderRadius: '6px' }}
                        onClick={() => onRequestSelect?.(request)}
                      >
                        <span className={`text-xs font-mono px-1.5 py-0.5 mr-2 ${
                          request.method === 'GET' ? 'text-green-600 bg-green-100' :
                          request.method === 'POST' ? 'text-blue-600 bg-blue-100' :
                          request.method === 'PUT' ? 'text-orange-600 bg-orange-100' :
                          request.method === 'DELETE' ? 'text-red-600 bg-red-100' :
                          'text-gray-600 bg-gray-100'
                        }`}
                        style={{ borderRadius: '6px' }}>
                          {request.method}
                        </span>
                        <span className="text-sm truncate">
                          {request.name}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Empty state */}
                {isExpanded && (!collection.requests || collection.requests.length === 0) && (
                  <div className="ml-6 py-2">
                    <p className="text-xs text-gray-400">No requests</p>
                  </div>
                )}
              </div>
            )
          })}
          </div>
        )}
      </div>
    </div>
  )
}