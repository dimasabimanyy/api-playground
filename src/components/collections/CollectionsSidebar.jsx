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
    <div className="w-56 border-r border-gray-200 bg-white h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-gray-900">Collections</h2>
          <Dialog open={newCollectionDialog} onOpenChange={setNewCollectionDialog}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-gray-500 hover:text-gray-700 hover:bg-gray-100">
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
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search collections..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-8 text-sm border-gray-300 focus:border-gray-400 focus:ring-0"
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
                className={`flex items-center justify-between px-3 py-2 rounded-md cursor-pointer transition-colors ${
                  activeCollectionId === collection.id
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => handleCollectionSelect(collection.id)}
              >
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                  <div className={activeCollectionId === collection.id ? 'text-blue-600' : 'text-gray-400'}>
                    {getCollectionIcon(collection)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm font-medium truncate">{collection.name}</h3>
                      <Badge variant="secondary" className="text-xs px-1.5 py-0 bg-gray-100 text-gray-600 border-none">
                        {collection.requests.length}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                {collection.id !== 'examples' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500 hover:bg-red-50"
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
                <div className="ml-6 mt-1 space-y-1">
                  {collection.requests.map(request => (
                    <div
                      key={request.id}
                      className={`flex items-center px-3 py-1.5 rounded-md cursor-pointer transition-colors ${
                        activeRequestId === request.id
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                      onClick={() => onRequestSelect?.(request)}
                    >
                      <div className="flex items-center space-x-2 flex-1 min-w-0">
                        <Badge variant="outline" className={`text-xs px-1.5 py-0.5 font-mono border ${
                          request.method === 'GET' ? 'bg-green-50 text-green-700 border-green-200' :
                          request.method === 'POST' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          request.method === 'PUT' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                          request.method === 'DELETE' ? 'bg-red-50 text-red-700 border-red-200' :
                          'bg-gray-50 text-gray-700 border-gray-200'
                        }`}>
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
                <div className="ml-6 mt-1 text-center py-4 text-gray-400">
                  <FolderOpen className="h-5 w-5 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No requests yet</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}