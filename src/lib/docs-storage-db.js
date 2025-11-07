/**
 * Database-backed storage utilities for enhanced documentation data
 * 
 * This replaces the localStorage implementation with Supabase database storage
 * for production-ready persistence and multi-user support.
 */

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { DocsUtils } from './docs-schema';

const supabase = createClientComponentClient();

// Default settings
const DEFAULT_SETTINGS = {
  defaultTheme: 'modern',
  autoSave: true,
  autoSaveInterval: 30000, // 30 seconds
  backupEnabled: true,
  maxBackups: 10,
  lastBackup: null,
  defaultExportFormat: 'html',
  includeExamples: true,
  includeAuth: true,
  groupByCollection: true,
  includeErrorCodes: true,
  showRequestBody: true,
  showResponseExamples: true,
  codeTheme: 'vs-dark',
};

/**
 * Docs Project Management
 */
export const DocsProjects = {
  /**
   * Get all documentation projects for the current user
   */
  getAll: async () => {
    try {
      const { data: projects, error } = await supabase
        .from('docs_projects')
        .select('*')
        .eq('status', 'active')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      
      // Convert to object format for compatibility
      const projectsObj = {};
      projects?.forEach(project => {
        projectsObj[project.id] = project;
      });
      
      return projectsObj;
    } catch (error) {
      console.error('Error loading docs projects:', error);
      return {};
    }
  },

  /**
   * Get a specific project by ID
   */
  get: async (projectId) => {
    try {
      const { data: project, error } = await supabase
        .from('docs_projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "not found"
      return project || null;
    } catch (error) {
      console.error('Error loading project:', error);
      return null;
    }
  },

  /**
   * Create a new documentation project
   */
  create: async (name, description = '', collections = [], settings = {}) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const project = {
        name,
        description,
        collections,
        settings,
        user_id: user.id,
      };

      const { data: newProject, error } = await supabase
        .from('docs_projects')
        .insert([project])
        .select()
        .single();

      if (error) throw error;
      return newProject;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  },

  /**
   * Update an existing project
   */
  update: async (projectId, updates) => {
    try {
      const { data: updatedProject, error } = await supabase
        .from('docs_projects')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', projectId)
        .select()
        .single();

      if (error) throw error;
      return updatedProject;
    } catch (error) {
      console.error('Error updating project:', error);
      return null;
    }
  },

  /**
   * Delete a project (soft delete by setting status to 'deleted')
   */
  delete: async (projectId) => {
    try {
      const { error } = await supabase
        .from('docs_projects')
        .update({ 
          status: 'deleted',
          updated_at: new Date().toISOString(),
        })
        .eq('id', projectId);

      if (error) throw error;
      
      // Also clean up associated cache
      await DocsCache.clearForProject(projectId);
      return true;
    } catch (error) {
      console.error('Error deleting project:', error);
      return false;
    }
  },

  /**
   * Duplicate a project
   */
  duplicate: async (projectId, newName) => {
    try {
      const original = await DocsProjects.get(projectId);
      if (!original) return null;

      const duplicate = {
        name: newName || `${original.name} Copy`,
        description: original.description,
        collections: [...original.collections],
        settings: { ...original.settings },
      };

      return await DocsProjects.create(
        duplicate.name,
        duplicate.description,
        duplicate.collections,
        duplicate.settings
      );
    } catch (error) {
      console.error('Error duplicating project:', error);
      return null;
    }
  },

  /**
   * Archive a project
   */
  archive: async (projectId) => {
    try {
      return await DocsProjects.update(projectId, { status: 'archived' });
    } catch (error) {
      console.error('Error archiving project:', error);
      return null;
    }
  },

  /**
   * Restore an archived project
   */
  restore: async (projectId) => {
    try {
      return await DocsProjects.update(projectId, { status: 'active' });
    } catch (error) {
      console.error('Error restoring project:', error);
      return null;
    }
  },
};

/**
 * Enhanced Collection Metadata Management
 */
export const DocsMetadata = {
  /**
   * Get docs metadata for a collection
   */
  getCollection: async (collectionId) => {
    try {
      const { data: metadata, error } = await supabase
        .from('docs_collections_metadata')
        .select('*')
        .eq('collection_id', collectionId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return metadata || null;
    } catch (error) {
      console.error('Error loading collection metadata:', error);
      return null;
    }
  },

  /**
   * Get docs metadata for a request
   */
  getRequest: async (requestId) => {
    try {
      const { data: metadata, error } = await supabase
        .from('docs_requests_metadata')
        .select('*')
        .eq('request_id', requestId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return metadata || null;
    } catch (error) {
      console.error('Error loading request metadata:', error);
      return null;
    }
  },

  /**
   * Save collection docs metadata
   */
  saveCollection: async (collectionId, docsData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const metadata = {
        collection_id: collectionId,
        user_id: user.id,
        created_by: user.id,
        updated_by: user.id,
        ...docsData,
        last_modified: new Date().toISOString(),
      };

      const { data: savedMetadata, error } = await supabase
        .from('docs_collections_metadata')
        .upsert(metadata, { 
          onConflict: 'collection_id,user_id',
          ignoreDuplicates: false 
        })
        .select()
        .single();

      if (error) throw error;
      return savedMetadata;
    } catch (error) {
      console.error('Error saving collection metadata:', error);
      throw error;
    }
  },

  /**
   * Save request docs metadata
   */
  saveRequest: async (requestId, docsData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const metadata = {
        request_id: requestId,
        user_id: user.id,
        created_by: user.id,
        updated_by: user.id,
        ...docsData,
        last_modified: new Date().toISOString(),
      };

      const { data: savedMetadata, error } = await supabase
        .from('docs_requests_metadata')
        .upsert(metadata, { 
          onConflict: 'request_id,user_id',
          ignoreDuplicates: false 
        })
        .select()
        .single();

      if (error) throw error;
      return savedMetadata;
    } catch (error) {
      console.error('Error saving request metadata:', error);
      throw error;
    }
  },

  /**
   * Enhance existing collection with docs metadata
   */
  enhanceCollection: async (collection) => {
    try {
      const existing = await DocsMetadata.getCollection(collection.id);
      if (existing) {
        return { ...collection, docs: existing };
      }
      
      const enhanced = DocsUtils.enhanceCollection(collection);
      await DocsMetadata.saveCollection(collection.id, enhanced.docs);
      return enhanced;
    } catch (error) {
      console.error('Error enhancing collection:', error);
      return collection;
    }
  },

  /**
   * Enhance existing request with docs metadata
   */
  enhanceRequest: async (request) => {
    try {
      const existing = await DocsMetadata.getRequest(request.id);
      if (existing) {
        return { ...request, docs: existing };
      }
      
      const enhanced = DocsUtils.enhanceRequest(request);
      await DocsMetadata.saveRequest(request.id, enhanced.docs);
      return enhanced;
    } catch (error) {
      console.error('Error enhancing request:', error);
      return request;
    }
  },

  /**
   * Bulk enhance collections and their requests
   */
  enhanceCollectionsWithRequests: async (collections) => {
    try {
      const enhanced = await Promise.all(
        Object.values(collections).map(async (collection) => {
          const enhancedCollection = await DocsMetadata.enhanceCollection(collection);
          
          if (enhancedCollection.requests) {
            enhancedCollection.requests = await Promise.all(
              enhancedCollection.requests.map(request => 
                DocsMetadata.enhanceRequest(request)
              )
            );
          }
          
          return enhancedCollection;
        })
      );

      return enhanced;
    } catch (error) {
      console.error('Error bulk enhancing collections:', error);
      return Object.values(collections);
    }
  },

  /**
   * Delete docs metadata for a collection
   */
  deleteCollection: async (collectionId) => {
    try {
      const { error } = await supabase
        .from('docs_collections_metadata')
        .delete()
        .eq('collection_id', collectionId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting collection metadata:', error);
      return false;
    }
  },

  /**
   * Delete docs metadata for a request
   */
  deleteRequest: async (requestId) => {
    try {
      const { error } = await supabase
        .from('docs_requests_metadata')
        .delete()
        .eq('request_id', requestId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting request metadata:', error);
      return false;
    }
  },

  /**
   * Search docs metadata
   */
  search: async (query, type = 'all') => {
    try {
      const results = {
        collections: [],
        requests: [],
      };

      if (type === 'all' || type === 'collections') {
        const { data: collections, error: collectionsError } = await supabase
          .from('docs_collections_metadata')
          .select('*')
          .or(`title.ilike.%${query}%, description.ilike.%${query}%`)
          .limit(20);

        if (!collectionsError && collections) {
          results.collections = collections;
        }
      }

      if (type === 'all' || type === 'requests') {
        const { data: requests, error: requestsError } = await supabase
          .from('docs_requests_metadata')
          .select('*')
          .or(`title.ilike.%${query}%, description.ilike.%${query}%, summary.ilike.%${query}%`)
          .limit(20);

        if (!requestsError && requests) {
          results.requests = requests;
        }
      }

      return results;
    } catch (error) {
      console.error('Error searching metadata:', error);
      return { collections: [], requests: [] };
    }
  },
};

/**
 * Settings Management
 */
export const DocsSettings = {
  /**
   * Get user's documentation settings
   */
  get: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return DEFAULT_SETTINGS;

      const { data: settings, error } = await supabase
        .from('docs_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      // Merge with defaults to ensure all settings exist
      return { ...DEFAULT_SETTINGS, ...settings };
    } catch (error) {
      console.error('Error loading docs settings:', error);
      return DEFAULT_SETTINGS;
    }
  },

  /**
   * Update documentation settings
   */
  update: async (updates) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: updatedSettings, error } = await supabase
        .from('docs_settings')
        .upsert({
          user_id: user.id,
          ...updates,
          updated_at: new Date().toISOString(),
        }, { 
          onConflict: 'user_id',
          ignoreDuplicates: false 
        })
        .select()
        .single();

      if (error) throw error;
      return { ...DEFAULT_SETTINGS, ...updatedSettings };
    } catch (error) {
      console.error('Error updating docs settings:', error);
      throw error;
    }
  },

  /**
   * Reset settings to defaults
   */
  reset: async () => {
    try {
      return await DocsSettings.update(DEFAULT_SETTINGS);
    } catch (error) {
      console.error('Error resetting docs settings:', error);
      throw error;
    }
  },
};

/**
 * Cache Management
 */
export const DocsCache = {
  /**
   * Get cached documentation
   */
  get: async (key) => {
    try {
      // Clean expired cache first
      await DocsCache.cleanExpired();

      const { data: entry, error } = await supabase
        .from('docs_cache')
        .select('*')
        .eq('cache_key', key)
        .gte('expires_at', new Date().toISOString())
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return entry?.content || null;
    } catch (error) {
      console.error('Error reading docs cache:', error);
      return null;
    }
  },

  /**
   * Set cached documentation
   */
  set: async (key, data, maxAge = 3600000) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const expiresAt = new Date(Date.now() + maxAge);

      const cacheEntry = {
        cache_key: key,
        user_id: user?.id,
        content: data,
        content_type: 'json',
        max_age: maxAge,
        expires_at: expiresAt.toISOString(),
      };

      const { error } = await supabase
        .from('docs_cache')
        .upsert(cacheEntry, { 
          onConflict: 'cache_key',
          ignoreDuplicates: false 
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error setting docs cache:', error);
      return false;
    }
  },

  /**
   * Delete cache entry
   */
  delete: async (key) => {
    try {
      const { error } = await supabase
        .from('docs_cache')
        .delete()
        .eq('cache_key', key);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting docs cache:', error);
      return false;
    }
  },

  /**
   * Clear all cache for current user
   */
  clear: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return true;

      const { error } = await supabase
        .from('docs_cache')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error clearing docs cache:', error);
      return false;
    }
  },

  /**
   * Clear cache for specific project
   */
  clearForProject: async (projectId) => {
    try {
      const { error } = await supabase
        .from('docs_cache')
        .delete()
        .like('cache_key', `%project_${projectId}%`);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error clearing project cache:', error);
      return false;
    }
  },

  /**
   * Clean expired cache entries
   */
  cleanExpired: async () => {
    try {
      const { error } = await supabase
        .from('docs_cache')
        .delete()
        .lt('expires_at', new Date().toISOString());

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error cleaning expired cache:', error);
      return false;
    }
  },
};

/**
 * Templates Management
 */
export const DocsTemplates = {
  /**
   * Get all available templates
   */
  getAll: async (type = null) => {
    try {
      let query = supabase
        .from('docs_templates')
        .select('*')
        .order('is_system', { ascending: false })
        .order('name');

      if (type) {
        query = query.eq('type', type);
      }

      const { data: templates, error } = await query;
      if (error) throw error;
      return templates || [];
    } catch (error) {
      console.error('Error loading templates:', error);
      return [];
    }
  },

  /**
   * Get user's templates
   */
  getUserTemplates: async (type = null) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      let query = supabase
        .from('docs_templates')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (type) {
        query = query.eq('type', type);
      }

      const { data: templates, error } = await query;
      if (error) throw error;
      return templates || [];
    } catch (error) {
      console.error('Error loading user templates:', error);
      return [];
    }
  },

  /**
   * Create a new template
   */
  create: async (name, description, type, templateData, isSystem = false) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user && !isSystem) throw new Error('User not authenticated');

      const template = {
        name,
        description,
        type,
        template_data: templateData,
        user_id: isSystem ? null : user.id,
        is_system: isSystem,
      };

      const { data: newTemplate, error } = await supabase
        .from('docs_templates')
        .insert([template])
        .select()
        .single();

      if (error) throw error;
      return newTemplate;
    } catch (error) {
      console.error('Error creating template:', error);
      throw error;
    }
  },

  /**
   * Update template usage count
   */
  recordUsage: async (templateId) => {
    try {
      const { error } = await supabase.rpc('increment_template_usage', {
        template_id: templateId
      });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error recording template usage:', error);
      return false;
    }
  },
};

export default {
  DocsProjects,
  DocsMetadata,
  DocsSettings,
  DocsCache,
  DocsTemplates,
};