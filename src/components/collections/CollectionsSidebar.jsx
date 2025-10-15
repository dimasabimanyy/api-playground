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
    <div className="w-64 border-r bg-muted/30 h-full flex flex-col">
      {/* Header */}
      <div className="p-3 border-b">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-medium">Collections</h2>
          <Dialog open={newCollectionDialog} onOpenChange={setNewCollectionDialog}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <FolderPlus className="h-3 w-3" />
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
        
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-7 h-8 text-sm"
          />
        </div>
      </div>

      {/* Collections List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-1 space-y-1">
          {filteredCollections.map(collection => (
            <div key={collection.id} className="group">
              {/* Collection Header */}
              <div
                className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
                  activeCollectionId === collection.id
                    ? 'bg-primary/10 border border-primary/20'
                    : 'hover:bg-muted/50'
                }`}
                onClick={() => handleCollectionSelect(collection.id)}
              >
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                  <div className={`p-1 rounded ${getCollectionColor(collection.color)}`}>
                    {getCollectionIcon(collection)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-1.5">
                      <h3 className="font-medium text-sm truncate">{collection.name}</h3>
                      <Badge variant="secondary" className="text-xs px-1.5 py-0">
                        {collection.requests.length}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                {collection.id !== 'examples' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
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
                <div className="ml-5 mt-1 space-y-0.5">
                  {collection.requests.map(request => (
                    <div
                      key={request.id}
                      className={`flex items-center justify-between p-1.5 rounded cursor-pointer transition-colors ${
                        activeRequestId === request.id
                          ? 'bg-primary/5 border border-primary/10'
                          : 'hover:bg-muted/30'
                      }`}
                      onClick={() => onRequestSelect?.(request)}
                    >
                      <div className="flex items-center space-x-1.5 flex-1 min-w-0">
                        <Badge variant="outline" className="text-xs px-1 py-0 font-medium">
                          {request.method}
                        </Badge>
                        <span className="text-xs truncate">{request.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Empty state for active collection */}
              {activeCollectionId === collection.id && collection.requests.length === 0 && (
                <div className="ml-5 mt-1 text-center py-3 text-muted-foreground">
                  <FolderOpen className="h-6 w-6 mx-auto mb-1 opacity-50" />
                  <p className="text-xs">No requests yet</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}