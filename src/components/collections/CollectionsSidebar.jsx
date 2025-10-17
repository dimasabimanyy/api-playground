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
    <div className="w-64 border-r border-gray-200 bg-white h-full flex flex-col">
      {/* Header */}
      <div className="px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-900">Collections</h2>
          <Dialog open={newCollectionDialog} onOpenChange={setNewCollectionDialog}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-gray-500 hover:text-gray-700">
                <FolderPlus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Collection</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div>
                  <Input
                    placeholder="Collection name"
                    value={newCollectionName}
                    onChange={(e) => setNewCollectionName(e.target.value)}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setNewCollectionDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateCollection} disabled={!newCollectionName.trim()}>
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
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-8 text-sm border-gray-300 bg-white focus:border-gray-400 focus:ring-0"
          />
        </div>
      </div>

      {/* Collections List */}
      <div className="flex-1 overflow-y-auto bg-white">
        <div className="py-2">
          {filteredCollections.map(collection => {
            const isExpanded = expandedCollections.has(collection.id)
            return (
              <div key={collection.id}>
                {/* Collection Header */}
                <div className="group flex items-center px-3 py-1 mx-2 rounded hover:bg-white/50 transition-colors">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 mr-1 hover:bg-gray-200"
                    onClick={() => toggleCollectionExpansion(collection.id)}
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-3 w-3 text-gray-500" />
                    ) : (
                      <ChevronRight className="h-3 w-3 text-gray-500" />
                    )}
                  </Button>
                  
                  <div
                    className="flex items-center justify-between flex-1 min-w-0 cursor-pointer py-1"
                    onClick={() => handleCollectionSelect(collection.id)}
                  >
                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                      <div className="text-gray-500">
                        {getCollectionIcon(collection, isExpanded)}
                      </div>
                      <span className={`text-sm truncate ${
                        activeCollectionId === collection.id ? 'text-gray-900 font-medium' : 'text-gray-700'
                      }`}>
                        {collection.name}
                      </span>
                      <span className="text-xs text-gray-400">
                        {collection.requests.length}
                      </span>
                    </div>
                    
                    {collection.id !== 'examples' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500"
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
                  <div className="ml-8 mr-2 space-y-px">
                    {collection.requests.map(request => (
                      <div
                        key={request.id}
                        className={`flex items-center px-2 py-1.5 rounded cursor-pointer transition-colors ${
                          activeRequestId === request.id
                            ? 'bg-blue-100 text-blue-900'
                            : 'text-gray-600 hover:bg-white/50'
                        }`}
                        onClick={() => onRequestSelect?.(request)}
                      >
                        <div className="flex items-center space-x-2 flex-1 min-w-0">
                          <span className={`text-xs font-mono px-1.5 py-0.5 rounded ${
                            request.method === 'GET' ? 'text-green-600 bg-green-100' :
                            request.method === 'POST' ? 'text-blue-600 bg-blue-100' :
                            request.method === 'PUT' ? 'text-orange-600 bg-orange-100' :
                            request.method === 'DELETE' ? 'text-red-600 bg-red-100' :
                            'text-gray-600 bg-gray-100'
                          }`}>
                            {request.method}
                          </span>
                          <span className="text-sm truncate">{request.name}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Empty state */}
                {isExpanded && collection.requests.length === 0 && (
                  <div className="ml-8 mr-2 py-2 text-center">
                    <p className="text-xs text-gray-400">No requests</p>
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