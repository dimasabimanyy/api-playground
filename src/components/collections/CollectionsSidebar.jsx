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
    <div className="w-72 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Collections</h2>
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
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search collections..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-sm border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:bg-white dark:focus:bg-gray-900 focus:border-gray-300 dark:focus:border-gray-600"
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
                className={`flex items-center justify-between px-3 py-2.5 rounded-md cursor-pointer transition-all duration-150 ${
                  activeCollectionId === collection.id
                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white'
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
                      <Badge variant="outline" className="text-xs px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
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
                <div className="ml-6 mt-2 space-y-1">
                  {collection.requests.map(request => (
                    <div
                      key={request.id}
                      className={`flex items-center justify-between px-3 py-2 rounded-md cursor-pointer transition-all duration-150 ${
                        activeRequestId === request.id
                          ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-900 dark:text-blue-100 border border-blue-200 dark:border-blue-800'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white'
                      }`}
                      onClick={() => onRequestSelect?.(request)}
                    >
                      <div className="flex items-center space-x-2 flex-1 min-w-0">
                        <Badge variant="outline" className="text-xs px-2 py-0.5 font-mono font-medium">
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
                <div className="ml-6 mt-2 text-center py-4 text-gray-500 dark:text-gray-400">
                  <FolderOpen className="h-6 w-6 mx-auto mb-2 opacity-50" />
                  <p className="text-xs">No requests yet</p>
                  <p className="text-xs mt-1 opacity-75">Create your first API request</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}