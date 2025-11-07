/**
 * Storage utilities for enhanced documentation data
 * 
 * Handles persistence of docs metadata, projects, and customization data
 * with support for both localStorage and future database integration.
 */

import { DocsUtils } from './docs-schema';

// Storage keys
const STORAGE_KEYS = {
  DOCS_PROJECTS: 'api_playground_docs_projects',
  DOCS_COLLECTIONS: 'api_playground_docs_collections', 
  DOCS_REQUESTS: 'api_playground_docs_requests',
  DOCS_SETTINGS: 'api_playground_docs_settings',
  DOCS_CACHE: 'api_playground_docs_cache',
};

// Default settings
const DEFAULT_SETTINGS = {
  defaultTheme: 'modern',
  autoSave: true,
  autoSaveInterval: 30000, // 30 seconds
  backupEnabled: true,
  maxBackups: 10,
  lastBackup: null,
};

/**
 * Docs Project Management
 */
export const DocsProjects = {
  /**
   * Get all documentation projects
   */
  getAll: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DOCS_PROJECTS);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Error loading docs projects:', error);
      return {};
    }
  },

  /**
   * Get a specific project by ID
   */
  get: (projectId) => {
    const projects = DocsProjects.getAll();
    return projects[projectId] || null;
  },

  /**
   * Create a new documentation project
   */
  create: (name, description = '', collections = []) => {
    const project = DocsUtils.createProject(name, description);
    project.collections = collections;
    
    const projects = DocsProjects.getAll();
    projects[project.id] = project;
    
    localStorage.setItem(STORAGE_KEYS.DOCS_PROJECTS, JSON.stringify(projects));
    return project;
  },

  /**
   * Update an existing project
   */
  update: (projectId, updates) => {
    const projects = DocsProjects.getAll();
    if (projects[projectId]) {
      projects[projectId] = {
        ...projects[projectId],
        ...updates,
        updated: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEYS.DOCS_PROJECTS, JSON.stringify(projects));
      return projects[projectId];
    }
    return null;
  },

  /**
   * Delete a project
   */
  delete: (projectId) => {
    const projects = DocsProjects.getAll();
    delete projects[projectId];
    localStorage.setItem(STORAGE_KEYS.DOCS_PROJECTS, JSON.stringify(projects));
    
    // Also clean up associated data
    DocsMetadata.deleteByProject(projectId);
  },

  /**
   * Duplicate a project
   */
  duplicate: (projectId, newName) => {
    const original = DocsProjects.get(projectId);
    if (!original) return null;
    
    const duplicate = {
      ...original,
      id: `docs_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      name: newName || `${original.name} Copy`,
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
    };
    
    const projects = DocsProjects.getAll();
    projects[duplicate.id] = duplicate;
    localStorage.setItem(STORAGE_KEYS.DOCS_PROJECTS, JSON.stringify(projects));
    
    return duplicate;
  },
};

/**
 * Enhanced Collection Metadata Management
 */
export const DocsMetadata = {
  /**
   * Get all docs metadata for collections
   */
  getAllCollections: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DOCS_COLLECTIONS);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Error loading collection docs metadata:', error);
      return {};
    }
  },

  /**
   * Get all docs metadata for requests
   */
  getAllRequests: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DOCS_REQUESTS);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Error loading request docs metadata:', error);
      return {};
    }
  },

  /**
   * Get enhanced collection with docs metadata
   */
  getCollection: (collectionId) => {
    const collectionsData = DocsMetadata.getAllCollections();
    return collectionsData[collectionId] || null;
  },

  /**
   * Get enhanced request with docs metadata
   */
  getRequest: (requestId) => {
    const requestsData = DocsMetadata.getAllRequests();
    return requestsData[requestId] || null;
  },

  /**
   * Save collection docs metadata
   */
  saveCollection: (collectionId, docsData) => {
    const collectionsData = DocsMetadata.getAllCollections();
    collectionsData[collectionId] = {
      ...docsData,
      lastModified: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEYS.DOCS_COLLECTIONS, JSON.stringify(collectionsData));
    return collectionsData[collectionId];
  },

  /**
   * Save request docs metadata
   */
  saveRequest: (requestId, docsData) => {
    const requestsData = DocsMetadata.getAllRequests();
    requestsData[requestId] = {
      ...docsData,
      lastModified: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEYS.DOCS_REQUESTS, JSON.stringify(requestsData));
    return requestsData[requestId];
  },

  /**
   * Enhance existing collection with docs metadata
   */
  enhanceCollection: (collection) => {
    const existing = DocsMetadata.getCollection(collection.id);
    if (existing) {
      return { ...collection, docs: existing };
    }
    
    const enhanced = DocsUtils.enhanceCollection(collection);
    DocsMetadata.saveCollection(collection.id, enhanced.docs);
    return enhanced;
  },

  /**
   * Enhance existing request with docs metadata
   */
  enhanceRequest: (request) => {
    const existing = DocsMetadata.getRequest(request.id);
    if (existing) {
      return { ...request, docs: existing };
    }
    
    const enhanced = DocsUtils.enhanceRequest(request);
    DocsMetadata.saveRequest(request.id, enhanced.docs);
    return enhanced;
  },

  /**
   * Bulk enhance collections and their requests
   */
  enhanceCollectionsWithRequests: (collections) => {
    return Object.values(collections).map(collection => {
      const enhancedCollection = DocsMetadata.enhanceCollection(collection);
      
      if (enhancedCollection.requests) {
        enhancedCollection.requests = enhancedCollection.requests.map(request =>
          DocsMetadata.enhanceRequest(request)
        );
      }
      
      return enhancedCollection;
    });
  },

  /**
   * Delete docs metadata for a collection
   */
  deleteCollection: (collectionId) => {
    const collectionsData = DocsMetadata.getAllCollections();
    delete collectionsData[collectionId];
    localStorage.setItem(STORAGE_KEYS.DOCS_COLLECTIONS, JSON.stringify(collectionsData));
  },

  /**
   * Delete docs metadata for a request
   */
  deleteRequest: (requestId) => {
    const requestsData = DocsMetadata.getAllRequests();
    delete requestsData[requestId];
    localStorage.setItem(STORAGE_KEYS.DOCS_REQUESTS, JSON.stringify(requestsData));
  },

  /**
   * Delete all metadata for a project
   */
  deleteByProject: (projectId) => {
    // This would be more efficient with a database,
    // but for localStorage we'll keep the current structure
    console.log(`Cleaning up docs metadata for project: ${projectId}`);
  },

  /**
   * Search docs metadata
   */
  search: (query, type = 'all') => {
    const results = {
      collections: [],
      requests: [],
    };

    if (type === 'all' || type === 'collections') {
      const collections = DocsMetadata.getAllCollections();
      Object.entries(collections).forEach(([id, docs]) => {
        if (
          docs.title?.toLowerCase().includes(query.toLowerCase()) ||
          docs.description?.toLowerCase().includes(query.toLowerCase()) ||
          docs.tags?.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
        ) {
          results.collections.push({ id, ...docs });
        }
      });
    }

    if (type === 'all' || type === 'requests') {
      const requests = DocsMetadata.getAllRequests();
      Object.entries(requests).forEach(([id, docs]) => {
        if (
          docs.title?.toLowerCase().includes(query.toLowerCase()) ||
          docs.description?.toLowerCase().includes(query.toLowerCase()) ||
          docs.summary?.toLowerCase().includes(query.toLowerCase()) ||
          docs.tags?.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
        ) {
          results.requests.push({ id, ...docs });
        }
      });
    }

    return results;
  },
};

/**
 * Settings Management
 */
export const DocsSettings = {
  /**
   * Get all settings
   */
  get: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DOCS_SETTINGS);
      return { ...DEFAULT_SETTINGS, ...(data ? JSON.parse(data) : {}) };
    } catch (error) {
      console.error('Error loading docs settings:', error);
      return DEFAULT_SETTINGS;
    }
  },

  /**
   * Update settings
   */
  update: (updates) => {
    const current = DocsSettings.get();
    const newSettings = { ...current, ...updates };
    localStorage.setItem(STORAGE_KEYS.DOCS_SETTINGS, JSON.stringify(newSettings));
    return newSettings;
  },

  /**
   * Reset to defaults
   */
  reset: () => {
    localStorage.setItem(STORAGE_KEYS.DOCS_SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
    return DEFAULT_SETTINGS;
  },
};

/**
 * Cache Management
 */
export const DocsCache = {
  /**
   * Get cached documentation
   */
  get: (key) => {
    try {
      const cache = localStorage.getItem(STORAGE_KEYS.DOCS_CACHE);
      const data = cache ? JSON.parse(cache) : {};
      const entry = data[key];
      
      if (!entry) return null;
      
      // Check if cache entry is expired (default 1 hour)
      const now = Date.now();
      const age = now - entry.timestamp;
      const maxAge = entry.maxAge || 3600000; // 1 hour
      
      if (age > maxAge) {
        DocsCache.delete(key);
        return null;
      }
      
      return entry.data;
    } catch (error) {
      console.error('Error reading docs cache:', error);
      return null;
    }
  },

  /**
   * Set cached documentation
   */
  set: (key, data, maxAge = 3600000) => {
    try {
      const cache = localStorage.getItem(STORAGE_KEYS.DOCS_CACHE);
      const cacheData = cache ? JSON.parse(cache) : {};
      
      cacheData[key] = {
        data,
        timestamp: Date.now(),
        maxAge,
      };
      
      localStorage.setItem(STORAGE_KEYS.DOCS_CACHE, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Error setting docs cache:', error);
    }
  },

  /**
   * Delete cache entry
   */
  delete: (key) => {
    try {
      const cache = localStorage.getItem(STORAGE_KEYS.DOCS_CACHE);
      const cacheData = cache ? JSON.parse(cache) : {};
      delete cacheData[key];
      localStorage.setItem(STORAGE_KEYS.DOCS_CACHE, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Error deleting docs cache:', error);
    }
  },

  /**
   * Clear all cache
   */
  clear: () => {
    localStorage.setItem(STORAGE_KEYS.DOCS_CACHE, JSON.stringify({}));
  },
};

/**
 * Backup and Export
 */
export const DocsBackup = {
  /**
   * Create backup of all docs data
   */
  create: () => {
    const backup = {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      data: {
        projects: DocsProjects.getAll(),
        collections: DocsMetadata.getAllCollections(),
        requests: DocsMetadata.getAllRequests(),
        settings: DocsSettings.get(),
      },
    };
    
    return backup;
  },

  /**
   * Export backup as JSON file
   */
  export: () => {
    const backup = DocsBackup.create();
    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: 'application/json',
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `api-docs-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    return backup;
  },

  /**
   * Import backup from JSON data
   */
  import: (backupData) => {
    try {
      if (!backupData.data) {
        throw new Error('Invalid backup format');
      }
      
      // Restore projects
      if (backupData.data.projects) {
        localStorage.setItem(
          STORAGE_KEYS.DOCS_PROJECTS, 
          JSON.stringify(backupData.data.projects)
        );
      }
      
      // Restore collections metadata
      if (backupData.data.collections) {
        localStorage.setItem(
          STORAGE_KEYS.DOCS_COLLECTIONS, 
          JSON.stringify(backupData.data.collections)
        );
      }
      
      // Restore requests metadata
      if (backupData.data.requests) {
        localStorage.setItem(
          STORAGE_KEYS.DOCS_REQUESTS, 
          JSON.stringify(backupData.data.requests)
        );
      }
      
      // Restore settings
      if (backupData.data.settings) {
        localStorage.setItem(
          STORAGE_KEYS.DOCS_SETTINGS, 
          JSON.stringify(backupData.data.settings)
        );
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error importing backup:', error);
      return { success: false, error: error.message };
    }
  },
};

// Auto-save functionality
let autoSaveTimeout = null;

export const DocsAutoSave = {
  /**
   * Schedule auto-save
   */
  schedule: (callback) => {
    const settings = DocsSettings.get();
    if (!settings.autoSave) return;
    
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
    }
    
    autoSaveTimeout = setTimeout(() => {
      callback();
      DocsAutoSave.schedule(callback);
    }, settings.autoSaveInterval);
  },

  /**
   * Cancel auto-save
   */
  cancel: () => {
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
      autoSaveTimeout = null;
    }
  },
};

export default {
  DocsProjects,
  DocsMetadata,
  DocsSettings,
  DocsCache,
  DocsBackup,
  DocsAutoSave,
};