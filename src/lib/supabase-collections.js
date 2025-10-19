import { createClient } from './supabase'

/**
 * Database-backed collections and requests management
 * This replaces the localStorage-based collections.js with Supabase integration
 */

/**
 * Get all collections for the current user
 */
export async function getCollections() {
  const supabase = createClient()
  
  try {
    const { data: collections, error } = await supabase
      .from('collections')
      .select(`
        *,
        requests (
          id,
          name,
          description,
          method,
          url,
          headers,
          body,
          tags,
          position,
          created_at,
          updated_at
        )
      `)
      .order('created_at', { ascending: true })
    
    if (error) throw error
    
    // Transform to match the existing localStorage format
    const collectionsMap = {}
    collections.forEach(collection => {
      // Sort requests by position
      const sortedRequests = collection.requests.sort((a, b) => a.position - b.position)
      
      collectionsMap[collection.id] = {
        id: collection.id,
        name: collection.name,
        description: collection.description,
        color: collection.color,
        requests: sortedRequests,
        createdAt: collection.created_at,
        updatedAt: collection.updated_at
      }
    })
    
    return collectionsMap
  } catch (error) {
    console.error('Error fetching collections:', error)
    throw error
  }
}

/**
 * Create a new collection
 */
export async function createCollection(name, description = '', color = 'blue') {
  const supabase = createClient()
  
  try {
    const { data: collection, error } = await supabase
      .from('collections')
      .insert({
        name,
        description,
        color
      })
      .select()
      .single()
    
    if (error) throw error
    
    return {
      id: collection.id,
      name: collection.name,
      description: collection.description,
      color: collection.color,
      requests: [],
      createdAt: collection.created_at,
      updatedAt: collection.updated_at
    }
  } catch (error) {
    console.error('Error creating collection:', error)
    throw error
  }
}

/**
 * Update a collection
 */
export async function updateCollection(collectionId, updates) {
  const supabase = createClient()
  
  try {
    const { data: collection, error } = await supabase
      .from('collections')
      .update(updates)
      .eq('id', collectionId)
      .select()
      .single()
    
    if (error) throw error
    
    return {
      id: collection.id,
      name: collection.name,
      description: collection.description,
      color: collection.color,
      createdAt: collection.created_at,
      updatedAt: collection.updated_at
    }
  } catch (error) {
    console.error('Error updating collection:', error)
    throw error
  }
}

/**
 * Delete a collection
 */
export async function deleteCollection(collectionId) {
  const supabase = createClient()
  
  try {
    const { error } = await supabase
      .from('collections')
      .delete()
      .eq('id', collectionId)
    
    if (error) throw error
    
    return true
  } catch (error) {
    console.error('Error deleting collection:', error)
    throw error
  }
}

/**
 * Get a single collection by ID
 */
export async function getCollection(collectionId) {
  const supabase = createClient()
  
  try {
    const { data: collection, error } = await supabase
      .from('collections')
      .select(`
        *,
        requests (
          id,
          name,
          description,
          method,
          url,
          headers,
          body,
          tags,
          position,
          created_at,
          updated_at
        )
      `)
      .eq('id', collectionId)
      .single()
    
    if (error) throw error
    
    // Sort requests by position
    const sortedRequests = collection.requests.sort((a, b) => a.position - b.position)
    
    return {
      id: collection.id,
      name: collection.name,
      description: collection.description,
      color: collection.color,
      requests: sortedRequests,
      createdAt: collection.created_at,
      updatedAt: collection.updated_at
    }
  } catch (error) {
    console.error('Error fetching collection:', error)
    throw error
  }
}

/**
 * Add a request to a collection
 */
export async function addRequestToCollection(collectionId, request) {
  const supabase = createClient()
  
  try {
    // Get the highest position in the collection
    const { data: lastRequest } = await supabase
      .from('requests')
      .select('position')
      .eq('collection_id', collectionId)
      .order('position', { ascending: false })
      .limit(1)
      .single()
    
    const nextPosition = lastRequest ? lastRequest.position + 1 : 0
    
    const { data: newRequest, error } = await supabase
      .from('requests')
      .insert({
        collection_id: collectionId,
        name: request.name,
        description: request.description || '',
        method: request.method,
        url: request.url,
        headers: request.headers || {},
        body: request.body || '',
        tags: request.tags || [],
        position: nextPosition
      })
      .select()
      .single()
    
    if (error) throw error
    
    return {
      id: newRequest.id,
      name: newRequest.name,
      description: newRequest.description,
      method: newRequest.method,
      url: newRequest.url,
      headers: newRequest.headers,
      body: newRequest.body,
      tags: newRequest.tags,
      position: newRequest.position,
      createdAt: newRequest.created_at,
      updatedAt: newRequest.updated_at
    }
  } catch (error) {
    console.error('Error adding request to collection:', error)
    throw error
  }
}

/**
 * Update a request in a collection
 */
export async function updateRequestInCollection(collectionId, requestId, updates) {
  const supabase = createClient()
  
  try {
    const { data: updatedRequest, error } = await supabase
      .from('requests')
      .update(updates)
      .eq('id', requestId)
      .eq('collection_id', collectionId)
      .select()
      .single()
    
    if (error) throw error
    
    return {
      id: updatedRequest.id,
      name: updatedRequest.name,
      description: updatedRequest.description,
      method: updatedRequest.method,
      url: updatedRequest.url,
      headers: updatedRequest.headers,
      body: updatedRequest.body,
      tags: updatedRequest.tags,
      position: updatedRequest.position,
      createdAt: updatedRequest.created_at,
      updatedAt: updatedRequest.updated_at
    }
  } catch (error) {
    console.error('Error updating request:', error)
    throw error
  }
}

/**
 * Delete a request from a collection
 */
export async function deleteRequestFromCollection(collectionId, requestId) {
  const supabase = createClient()
  
  try {
    const { error } = await supabase
      .from('requests')
      .delete()
      .eq('id', requestId)
      .eq('collection_id', collectionId)
    
    if (error) throw error
    
    return true
  } catch (error) {
    console.error('Error deleting request:', error)
    throw error
  }
}

/**
 * Search requests across all user's collections
 */
export async function searchRequests(query) {
  const supabase = createClient()
  
  try {
    const { data: requests, error } = await supabase
      .from('requests')
      .select(`
        *,
        collections!inner (
          id,
          name,
          user_id
        )
      `)
      .or(`name.ilike.%${query}%,description.ilike.%${query}%,url.ilike.%${query}%`)
    
    if (error) throw error
    
    return requests.map(request => ({
      id: request.id,
      name: request.name,
      description: request.description,
      method: request.method,
      url: request.url,
      headers: request.headers,
      body: request.body,
      tags: request.tags,
      createdAt: request.created_at,
      collectionId: request.collections.id,
      collectionName: request.collections.name
    }))
  } catch (error) {
    console.error('Error searching requests:', error)
    throw error
  }
}

/**
 * Reorder requests within a collection
 */
export async function reorderRequests(collectionId, requestIds) {
  const supabase = createClient()
  
  try {
    // Update positions for all requests in the new order
    const updates = requestIds.map((requestId, index) => ({
      id: requestId,
      position: index
    }))
    
    for (const update of updates) {
      const { error } = await supabase
        .from('requests')
        .update({ position: update.position })
        .eq('id', update.id)
        .eq('collection_id', collectionId)
      
      if (error) throw error
    }
    
    return true
  } catch (error) {
    console.error('Error reordering requests:', error)
    throw error
  }
}

/**
 * Save request to history (for analytics)
 */
export async function saveRequestToHistory(requestData, response) {
  const supabase = createClient()
  
  try {
    const { error } = await supabase
      .from('request_history')
      .insert({
        request_id: requestData.requestId || null,
        method: requestData.method,
        url: requestData.url,
        headers: requestData.headers || {},
        body: requestData.body || '',
        response_status: response.status,
        response_headers: response.headers || {},
        response_body: response.body || '',
        response_time: response.responseTime
      })
    
    if (error) throw error
    
    return true
  } catch (error) {
    console.error('Error saving request to history:', error)
    // Don't throw error for history - it's not critical
    return false
  }
}

/**
 * Get request history for analytics
 */
export async function getRequestHistory(limit = 50) {
  const supabase = createClient()
  
  try {
    const { data: history, error } = await supabase
      .from('request_history')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (error) throw error
    
    return history
  } catch (error) {
    console.error('Error fetching request history:', error)
    throw error
  }
}