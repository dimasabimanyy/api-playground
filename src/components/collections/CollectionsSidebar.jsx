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
  Star
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

  useEffect(() => {
    loadCollections()
  }, [])

  const loadCollections = () => {
    const cols = getCollections()
    setCollections(cols)
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

  const getCollectionIcon = (collection) => {
    if (collection.id === 'examples') return <Star className="h-4 w-4" />
    return <FolderOpen className="h-4 w-4" />
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
    <div className="w-80 border-r border-border/50 bg-muted/20 h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-lg">Collections</h2>
          <Dialog open={newCollectionDialog} onOpenChange={setNewCollectionDialog}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <FolderPlus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Collection</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Collection Name</label>
                  <Input
                    placeholder="e.g., User Management API"
                    value={newCollectionName}
                    onChange={(e) => setNewCollectionName(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Description (optional)</label>
                  <Input
                    placeholder="Brief description of this API collection"
                    value={newCollectionDescription}
                    onChange={(e) => setNewCollectionDescription(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setNewCollectionDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateCollection} disabled={!newCollectionName.trim()}>
                    Create Collection
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search collections and requests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Collections List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-2 space-y-1">
          {filteredCollections.map(collection => (
            <div key={collection.id} className="group">
              {/* Collection Header */}
              <div
                className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                  activeCollectionId === collection.id
                    ? 'bg-primary/10 border border-primary/20'
                    : 'hover:bg-muted/50'
                }`}
                onClick={() => handleCollectionSelect(collection.id)}
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className={`p-1.5 rounded-md ${getCollectionColor(collection.color)}`}>
                    {getCollectionIcon(collection)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium text-sm truncate">{collection.name}</h3>
                      <Badge variant="secondary" className="text-xs">
                        {collection.requests.length}
                      </Badge>
                    </div>
                    {collection.description && (
                      <p className="text-xs text-muted-foreground truncate">
                        {collection.description}
                      </p>
                    )}
                  </div>
                </div>
                
                {collection.id !== 'examples' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteCollection(collection.id)
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>

              {/* Requests List (when collection is active) */}
              {activeCollectionId === collection.id && collection.requests.length > 0 && (
                <div className="ml-6 mt-2 space-y-1">
                  {collection.requests.map(request => (
                    <div
                      key={request.id}
                      className={`flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors ${
                        activeRequestId === request.id
                          ? 'bg-primary/5 border border-primary/10'
                          : 'hover:bg-muted/30'
                      }`}
                      onClick={() => onRequestSelect?.(request)}
                    >
                      <div className="flex items-center space-x-2 flex-1 min-w-0">
                        <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                          {request.method}
                        </Badge>
                        <span className="text-sm truncate">{request.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Empty state for active collection */}
              {activeCollectionId === collection.id && collection.requests.length === 0 && (
                <div className="ml-6 mt-2 text-center py-4 text-muted-foreground">
                  <FolderOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-xs">No requests yet</p>
                  <p className="text-xs">Create your first API request</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}