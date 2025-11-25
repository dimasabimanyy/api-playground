/**
 * Client-safe collections utilities
 * This replaces the unsafe database operations with API calls
 */

import { collectionsApi } from './api-client';

/**
 * Client-safe collections context helpers
 * These functions work with the API routes instead of direct database access
 */
export const collectionsClient = {
  /**
   * Get collections for the collections context
   */
  getCollections: async () => {
    try {
      const response = await collectionsApi.getAll();
      return response.collections || [];
    } catch (error) {
      console.error('Error fetching collections:', error);
      return [];
    }
  },

  /**
   * Create a new collection
   */
  createCollection: async (name, description = '', color = 'blue') => {
    try {
      const response = await collectionsApi.create({
        name,
        description,
        color,
      });
      return response.collection;
    } catch (error) {
      console.error('Error creating collection:', error);
      throw error;
    }
  },

  /**
   * Update a collection
   */
  updateCollection: async (id, updates) => {
    try {
      const response = await collectionsApi.update(id, updates);
      return response.collection;
    } catch (error) {
      console.error('Error updating collection:', error);
      throw error;
    }
  },

  /**
   * Delete a collection
   */
  deleteCollection: async (id) => {
    try {
      await collectionsApi.delete(id);
      return true;
    } catch (error) {
      console.error('Error deleting collection:', error);
      throw error;
    }
  },

  /**
   * Search collections
   */
  searchCollections: async (query, options = {}) => {
    try {
      const response = await collectionsApi.search(query, options);
      return response.collections || [];
    } catch (error) {
      console.error('Error searching collections:', error);
      return [];
    }
  },

  /**
   * Get collections with pagination
   */
  getPaginatedCollections: async (page = 1, pageSize = 10) => {
    try {
      const response = await collectionsApi.getPaginated(page, pageSize);
      return response.collections || [];
    } catch (error) {
      console.error('Error fetching paginated collections:', error);
      return [];
    }
  },

  /**
   * Get a specific collection by ID
   */
  getCollection: async (id) => {
    try {
      const response = await collectionsApi.getById(id);
      return response.collection;
    } catch (error) {
      console.error('Error fetching collection:', error);
      return null;
    }
  },

  /**
   * Format collections for context compatibility
   * Converts array to object format expected by existing code
   */
  formatCollectionsForContext: (collections) => {
    const formatted = {};
    collections.forEach(collection => {
      formatted[collection.id] = collection;
    });
    return formatted;
  },

  /**
   * Get collections in the format expected by existing context
   */
  getCollectionsForContext: async () => {
    const collections = await collectionsClient.getCollections();
    return collectionsClient.formatCollectionsForContext(collections);
  },
};

export default collectionsClient;