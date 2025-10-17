'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  FolderOpen, 
  FolderPlus, 
  Search, 
  MoreHorizontal, 
  Trash2, 
  Edit3,
  Globe,
  Lock,
  Star,
  ChevronDown,
  ChevronRight,
  Folder
} from 'lucide-react'
import { 
  getCollections, 
  getActiveCollectionId, 
  setActiveCollectionId,
  createCollection,
  deleteCollection 
} from '@/lib/collections'

export default function CollectionsSidebar({ 
  onCollectionSelect, 
  onRequestSelect, 
  activeCollectionId,
  activeRequestId 
}) {
  const [collections, setCollections] = useState({})
  const [searchQuery, setSearchQuery] = useState('')
  const [newCollectionDialog, setNewCollectionDialog] = useState(false)
  const [newCollectionName, setNewCollectionName] = useState('')
  const [newCollectionDescription, setNewCollectionDescription] = useState('')
  const [expandedCollections, setExpandedCollections] = useState(new Set())

  useEffect(() => {
    loadCollections()
  }, [])

  const loadCollections = () => {
    const cols = getCollections()
    setCollections(cols)
    // Auto-expand active collection
    if (activeCollectionId) {
      setExpandedCollections(prev => new Set(prev).add(activeCollectionId))
    }
  }

  const handleCollectionSelect = (collectionId) => {
    setActiveCollectionId(collectionId)
    if (onCollectionSelect) {
      onCollectionSelect(collectionId)
    }
  }

  const handleCreateCollection = () => {
    if (!newCollectionName.trim()) return
    
    const newCollection = createCollection(
      newCollectionName,
      newCollectionDescription,
      'blue'
    )
    
    loadCollections()
    handleCollectionSelect(newCollection.id)
    setNewCollectionDialog(false)
    setNewCollectionName('')
    setNewCollectionDescription('')
  }

  const handleDeleteCollection = (collectionId) => {
    if (window.confirm('Are you sure you want to delete this collection?')) {
      deleteCollection(collectionId)
      loadCollections()
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
    if (collection.id === 'examples') return <Star className="h-4 w-4" />
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
    collection.requests.some(req => 
      req.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.url.toLowerCase().includes(searchQuery.toLowerCase())
    )
  )

  return (
    <div className="w-80 border-r border-gray-200 bg-gray-50 h-full flex flex-col">
      {/* Header */}
      <div className="px-6 py-6 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Collections</h2>
          <Dialog open={newCollectionDialog} onOpenChange={setNewCollectionDialog}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200">
                <FolderPlus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-lg font-semibold">Create Collection</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <Input
                    placeholder="Collection name"
                    value={newCollectionName}
                    onChange={(e) => setNewCollectionName(e.target.value)}
                    className="h-10 text-sm border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100 rounded-lg"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <Button variant="outline" onClick={() => setNewCollectionDialog(false)} className="px-4 py-2 rounded-lg border-gray-200">
                    Cancel
                  </Button>
                  <Button onClick={handleCreateCollection} disabled={!newCollectionName.trim()} className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg">
                    Create
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search collections..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-10 text-sm border-gray-200 bg-gray-50 focus:border-green-500 focus:ring-2 focus:ring-green-100 focus:bg-white rounded-lg transition-all duration-200"
          />
        </div>
      </div>

      {/* Collections List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-3 space-y-2">
          {filteredCollections.map(collection => {
            const isExpanded = expandedCollections.has(collection.id)
            return (
              <div key={collection.id} className="bg-white rounded-lg border border-gray-200 shadow-sm">
                {/* Collection Header */}
                <div className="group flex items-center px-4 py-3 cursor-pointer hover:bg-gray-50 transition-all duration-200">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 mr-3 hover:bg-gray-200 rounded-md transition-all duration-200"
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleCollectionExpansion(collection.id)
                    }}
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-gray-600" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-gray-600" />
                    )}
                  </Button>
                  
                  <div
                    className="flex items-center justify-between flex-1 min-w-0"
                    onClick={() => handleCollectionSelect(collection.id)}
                  >
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <div className="text-gray-600">
                        {getCollectionIcon(collection, isExpanded)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className={`text-sm font-medium truncate block ${ 
                          activeCollectionId === collection.id ? 'text-green-700' : 'text-gray-900'
                        }`}>
                          {collection.name}
                        </span>
                        <span className="text-xs text-gray-500">
                          {collection.requests.length} {collection.requests.length === 1 ? 'request' : 'requests'}
                        </span>
                      </div>
                    </div>
                    
                    {collection.id !== 'examples' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-all duration-200 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteCollection(collection.id)
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Requests List */}
                {isExpanded && collection.requests.length > 0 && (
                  <div className="px-4 pb-3 border-t border-gray-100">
                    <div className="space-y-1 pt-2">
                      {collection.requests.map(request => (
                        <div
                          key={request.id}
                          className={`flex items-center px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 group ${
                            activeRequestId === request.id
                              ? 'bg-green-50 border border-green-200'
                              : 'hover:bg-gray-50 border border-transparent'
                          }`}
                          onClick={() => onRequestSelect?.(request)}
                        >
                          <div className="flex items-center space-x-3 flex-1 min-w-0">
                            <span className={`text-xs font-semibold px-2 py-1 rounded-md ${
                              request.method === 'GET' ? 'text-emerald-700 bg-emerald-50 border border-emerald-200' :
                              request.method === 'POST' ? 'text-blue-700 bg-blue-50 border border-blue-200' :
                              request.method === 'PUT' ? 'text-amber-700 bg-amber-50 border border-amber-200' :
                              request.method === 'DELETE' ? 'text-red-700 bg-red-50 border border-red-200' :
                              'text-gray-700 bg-gray-50 border border-gray-200'
                            }`}>
                              {request.method}
                            </span>
                            <span className={`text-sm font-medium truncate ${
                              activeRequestId === request.id ? 'text-green-900' : 'text-gray-700'
                            }`}>
                              {request.name}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Empty state */}
                {isExpanded && collection.requests.length === 0 && (
                  <div className="px-4 pb-3 border-t border-gray-100">
                    <div className="py-4 text-center">
                      <p className="text-sm text-gray-500">No requests yet</p>
                      <p className="text-xs text-gray-400 mt-1">Create your first API request</p>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}