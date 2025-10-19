"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import {
  getCollections as fetchCollections,
  createCollection as createNewCollection,
  updateCollection as updateExistingCollection,
  deleteCollection as removeCollection,
  addRequestToCollection as addRequest,
  updateRequestInCollection as updateRequest,
  deleteRequestFromCollection as removeRequest,
  searchRequests as searchAllRequests,
  reorderRequests as reorderCollectionRequests,
  saveRequestToHistory
} from '@/lib/supabase-collections';

const CollectionsContext = createContext({});

export function CollectionsProvider({ children }) {
  const { user } = useAuth();
  const [collections, setCollections] = useState({});
  const [activeCollectionId, setActiveCollectionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load collections when user signs in
  useEffect(() => {
    console.log('CollectionsContext: user changed', { user: user?.email, userId: user?.id });
    if (user) {
      console.log('CollectionsContext: Loading collections for user');
      loadCollections();
    } else {
      console.log('CollectionsContext: No user, clearing collections');
      // Clear collections when user signs out
      setCollections({});
      setActiveCollectionId(null);
    }
  }, [user]);

  // Set initial active collection when collections load
  useEffect(() => {
    if (Object.keys(collections).length > 0 && !activeCollectionId) {
      // Find the default collection or use the first one
      const defaultCollection = Object.values(collections).find(c => c.name === 'My APIs');
      const firstCollection = Object.values(collections)[0];
      setActiveCollectionId(defaultCollection?.id || firstCollection?.id);
    }
  }, [collections, activeCollectionId]);

  /**
   * Load all collections from the database
   */
  const loadCollections = async () => {
    if (!user) {
      console.log('CollectionsContext: loadCollections called but no user');
      return;
    }
    
    console.log('CollectionsContext: Starting to load collections');
    setLoading(true);
    setError(null);
    
    try {
      const data = await fetchCollections();
      console.log('CollectionsContext: Collections loaded:', data);
      setCollections(data);
      
      // If no collections exist, we can create a default one programmatically
      if (Object.keys(data).length === 0) {
        console.log('CollectionsContext: No collections found, this might be a new user');
      }
    } catch (err) {
      console.error('CollectionsContext: Failed to load collections:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Create a new collection
   */
  const createCollection = async (name, description = '', color = 'blue') => {
    if (!user) throw new Error('User must be authenticated');
    
    try {
      const newCollection = await createNewCollection(name, description, color);
      
      setCollections(prev => ({
        ...prev,
        [newCollection.id]: newCollection
      }));
      
      return newCollection;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  /**
   * Update an existing collection
   */
  const updateCollection = async (collectionId, updates) => {
    if (!user) throw new Error('User must be authenticated');
    
    try {
      const updatedCollection = await updateExistingCollection(collectionId, updates);
      
      setCollections(prev => ({
        ...prev,
        [collectionId]: {
          ...prev[collectionId],
          ...updatedCollection
        }
      }));
      
      return updatedCollection;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  /**
   * Delete a collection
   */
  const deleteCollection = async (collectionId) => {
    if (!user) throw new Error('User must be authenticated');
    
    try {
      await removeCollection(collectionId);
      
      setCollections(prev => {
        const { [collectionId]: removed, ...rest } = prev;
        return rest;
      });
      
      // If we deleted the active collection, switch to another one
      if (activeCollectionId === collectionId) {
        const remainingCollections = Object.keys(collections).filter(id => id !== collectionId);
        setActiveCollectionId(remainingCollections[0] || null);
      }
      
      return true;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  /**
   * Add a request to a collection
   */
  const addRequestToCollection = async (collectionId, request) => {
    if (!user) throw new Error('User must be authenticated');
    
    try {
      const newRequest = await addRequest(collectionId, request);
      
      setCollections(prev => ({
        ...prev,
        [collectionId]: {
          ...prev[collectionId],
          requests: [...(prev[collectionId]?.requests || []), newRequest]
        }
      }));
      
      return newRequest;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  /**
   * Update a request in a collection
   */
  const updateRequestInCollection = async (collectionId, requestId, updates) => {
    if (!user) throw new Error('User must be authenticated');
    
    try {
      const updatedRequest = await updateRequest(collectionId, requestId, updates);
      
      setCollections(prev => ({
        ...prev,
        [collectionId]: {
          ...prev[collectionId],
          requests: prev[collectionId]?.requests.map(req =>
            req.id === requestId ? { ...req, ...updatedRequest } : req
          ) || []
        }
      }));
      
      return updatedRequest;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  /**
   * Delete a request from a collection
   */
  const deleteRequestFromCollection = async (collectionId, requestId) => {
    if (!user) throw new Error('User must be authenticated');
    
    try {
      await removeRequest(collectionId, requestId);
      
      setCollections(prev => ({
        ...prev,
        [collectionId]: {
          ...prev[collectionId],
          requests: prev[collectionId]?.requests.filter(req => req.id !== requestId) || []
        }
      }));
      
      return true;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  /**
   * Search requests across all collections
   */
  const searchRequests = async (query) => {
    if (!user || !query.trim()) return [];
    
    try {
      return await searchAllRequests(query);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  /**
   * Reorder requests within a collection
   */
  const reorderRequests = async (collectionId, requestIds) => {
    if (!user) throw new Error('User must be authenticated');
    
    try {
      await reorderCollectionRequests(collectionId, requestIds);
      
      // Update local state to reflect new order
      setCollections(prev => {
        const collection = prev[collectionId];
        if (!collection) return prev;
        
        const reorderedRequests = requestIds.map(id => 
          collection.requests.find(req => req.id === id)
        ).filter(Boolean);
        
        return {
          ...prev,
          [collectionId]: {
            ...collection,
            requests: reorderedRequests
          }
        };
      });
      
      return true;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  /**
   * Save a request to history for analytics
   */
  const saveToHistory = async (requestData, response) => {
    if (!user) return false;
    
    try {
      return await saveRequestToHistory(requestData, response);
    } catch (err) {
      // Don't throw error for history - it's not critical
      console.warn('Failed to save request to history:', err);
      return false;
    }
  };

  /**
   * Get active collection
   */
  const getActiveCollection = () => {
    return activeCollectionId ? collections[activeCollectionId] : null;
  };

  /**
   * Get collection by ID
   */
  const getCollection = (collectionId) => {
    return collections[collectionId] || null;
  };

  /**
   * Clear any errors
   */
  const clearError = () => {
    setError(null);
  };

  const value = {
    // State
    collections,
    activeCollectionId,
    loading,
    error,
    
    // Actions
    loadCollections,
    createCollection,
    updateCollection,
    deleteCollection,
    addRequestToCollection,
    updateRequestInCollection,
    deleteRequestFromCollection,
    searchRequests,
    reorderRequests,
    saveToHistory,
    
    // Setters
    setActiveCollectionId,
    
    // Helpers
    getActiveCollection,
    getCollection,
    clearError
  };

  return (
    <CollectionsContext.Provider value={value}>
      {children}
    </CollectionsContext.Provider>
  );
}

export function useCollections() {
  const context = useContext(CollectionsContext);
  if (context === undefined) {
    throw new Error('useCollections must be used within a CollectionsProvider');
  }
  return context;
}