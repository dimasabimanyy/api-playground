const COLLECTIONS_KEY = 'api-playground-collections'
const ACTIVE_COLLECTION_KEY = 'api-playground-active-collection'

// Default collections
const DEFAULT_COLLECTIONS = {
  'my-apis': {
    id: 'my-apis',
    name: 'My APIs',
    description: 'Your saved API requests',
    color: 'blue',
    requests: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  'examples': {
    id: 'examples',
    name: 'Examples',
    description: 'Popular API examples to get started',
    color: 'green',
    requests: [
      {
        id: 'example-1',
        name: 'Get User Profile',
        description: 'Fetch user data from JSONPlaceholder',
        method: 'GET',
        url: 'https://jsonplaceholder.typicode.com/users/1',
        headers: {},
        body: '',
        tags: ['demo', 'users'],
        createdAt: new Date().toISOString()
      },
      {
        id: 'example-2',
        name: 'Create Post',
        description: 'Create a new post with JSONPlaceholder',
        method: 'POST',
        url: 'https://jsonplaceholder.typicode.com/posts',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: 'My New Post',
          body: 'This is the content of my post',
          userId: 1
        }, null, 2),
        tags: ['demo', 'posts'],
        createdAt: new Date().toISOString()
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
}

/**
 * Get all collections
 */
export function getCollections() {
  if (typeof window === 'undefined') return DEFAULT_COLLECTIONS
  
  try {
    const stored = localStorage.getItem(COLLECTIONS_KEY)
    return stored ? JSON.parse(stored) : DEFAULT_COLLECTIONS
  } catch (error) {
    console.error('Failed to get collections:', error)
    return DEFAULT_COLLECTIONS
  }
}

/**
 * Save collections
 */
export function saveCollections(collections) {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(collections))
  } catch (error) {
    console.error('Failed to save collections:', error)
  }
}

/**
 * Get active collection ID
 */
export function getActiveCollectionId() {
  if (typeof window === 'undefined') return 'my-apis'
  
  try {
    return localStorage.getItem(ACTIVE_COLLECTION_KEY) || 'my-apis'
  } catch (error) {
    console.error('Failed to get active collection:', error)
    return 'my-apis'
  }
}

/**
 * Set active collection
 */
export function setActiveCollectionId(collectionId) {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(ACTIVE_COLLECTION_KEY, collectionId)
  } catch (error) {
    console.error('Failed to set active collection:', error)
  }
}

/**
 * Create a new collection
 */
export function createCollection(name, description = '', color = 'blue') {
  const collections = getCollections()
  const id = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  
  const newCollection = {
    id,
    name,
    description,
    color,
    requests: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  
  const updatedCollections = {
    ...collections,
    [id]: newCollection
  }
  
  saveCollections(updatedCollections)
  return newCollection
}

/**
 * Delete a collection
 */
export function deleteCollection(collectionId) {
  if (collectionId === 'examples') return false // Can't delete examples
  
  const collections = getCollections()
  const { [collectionId]: removed, ...rest } = collections
  
  saveCollections(rest)
  
  // If we deleted the active collection, switch to 'my-apis'
  if (getActiveCollectionId() === collectionId) {
    setActiveCollectionId('my-apis')
  }
  
  return true
}

/**
 * Add request to collection
 */
export function addRequestToCollection(collectionId, request) {
  const collections = getCollections()
  const collection = collections[collectionId]
  
  if (!collection) return false
  
  const newRequest = {
    ...request,
    id: Date.now().toString(),
    createdAt: new Date().toISOString()
  }
  
  const updatedCollection = {
    ...collection,
    requests: [...collection.requests, newRequest],
    updatedAt: new Date().toISOString()
  }
  
  const updatedCollections = {
    ...collections,
    [collectionId]: updatedCollection
  }
  
  saveCollections(updatedCollections)
  return newRequest
}

/**
 * Update request in collection
 */
export function updateRequestInCollection(collectionId, requestId, updates) {
  const collections = getCollections()
  const collection = collections[collectionId]
  
  if (!collection) return false
  
  const updatedRequests = collection.requests.map(req =>
    req.id === requestId ? { ...req, ...updates, updatedAt: new Date().toISOString() } : req
  )
  
  const updatedCollection = {
    ...collection,
    requests: updatedRequests,
    updatedAt: new Date().toISOString()
  }
  
  const updatedCollections = {
    ...collections,
    [collectionId]: updatedCollection
  }
  
  saveCollections(updatedCollections)
  return true
}

/**
 * Delete request from collection
 */
export function deleteRequestFromCollection(collectionId, requestId) {
  const collections = getCollections()
  const collection = collections[collectionId]
  
  if (!collection) return false
  
  const updatedRequests = collection.requests.filter(req => req.id !== requestId)
  
  const updatedCollection = {
    ...collection,
    requests: updatedRequests,
    updatedAt: new Date().toISOString()
  }
  
  const updatedCollections = {
    ...collections,
    [collectionId]: updatedCollection
  }
  
  saveCollections(updatedCollections)
  return true
}

/**
 * Get collection by ID
 */
export function getCollection(collectionId) {
  const collections = getCollections()
  return collections[collectionId] || null
}

/**
 * Search requests across all collections
 */
export function searchRequests(query) {
  const collections = getCollections()
  const results = []
  
  Object.values(collections).forEach(collection => {
    collection.requests.forEach(request => {
      if (
        request.name.toLowerCase().includes(query.toLowerCase()) ||
        request.description.toLowerCase().includes(query.toLowerCase()) ||
        request.url.toLowerCase().includes(query.toLowerCase()) ||
        request.tags?.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
      ) {
        results.push({
          ...request,
          collectionId: collection.id,
          collectionName: collection.name
        })
      }
    })
  })
  
  return results
}