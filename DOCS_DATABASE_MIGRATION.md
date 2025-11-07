# Documentation Database Migration Guide

This guide explains how to migrate from localStorage-based documentation storage to a database-backed system using Supabase.

## Overview

The current documentation system uses localStorage for persistence, which has limitations:
- Data is lost when users clear browser data
- No cross-device synchronization
- Limited storage capacity
- No collaboration features
- No backup/restore capabilities

The new database-backed system provides:
- Persistent, reliable storage
- Cross-device synchronization
- Multi-user support with proper authentication
- Advanced search capabilities
- Backup and restore functionality
- Better performance with caching

## Database Schema

### New Tables

1. **`docs_projects`** - Documentation projects/workspaces
2. **`docs_collections_metadata`** - Enhanced metadata for collections
3. **`docs_requests_metadata`** - Enhanced metadata for requests
4. **`docs_templates`** - Reusable documentation templates
5. **`docs_settings`** - User documentation preferences
6. **`docs_cache`** - Performance cache for generated documentation

### Setup Instructions

1. **Run the schema migrations:**
   ```sql
   -- First, run the existing schema
   \i supabase-schema.sql
   
   -- Then add documentation features
   \i supabase-docs-schema.sql
   
   -- Finally, add helper functions
   \i supabase-functions.sql
   ```

2. **Update your environment:**
   Make sure your Supabase client is properly configured in `src/lib/supabase.js`

3. **Enable required policies:**
   The schema includes Row Level Security (RLS) policies for secure multi-user access.

## Migration Steps

### Step 1: Backup Existing Data

Before migrating, backup existing localStorage data:

```javascript
// Run this in browser console to backup existing data
const backup = {
  projects: JSON.parse(localStorage.getItem('api_playground_docs_projects') || '{}'),
  collections: JSON.parse(localStorage.getItem('api_playground_docs_collections') || '{}'),
  requests: JSON.parse(localStorage.getItem('api_playground_docs_requests') || '{}'),
  settings: JSON.parse(localStorage.getItem('api_playground_docs_settings') || '{}'),
};
console.log('Backup data:', backup);
// Copy this data and save it as backup.json
```

### Step 2: Switch to Database Storage

Replace imports in your application:

```javascript
// Old localStorage-based storage
// import { DocsProjects, DocsMetadata, DocsSettings } from '@/lib/docs-storage';

// New database-backed storage
import { DocsProjects, DocsMetadata, DocsSettings } from '@/lib/docs-storage-db';
```

### Step 3: Migration Utility

Create a migration utility to transfer existing localStorage data to the database:

```javascript
// src/utils/migrate-docs-data.js
import { DocsProjects, DocsMetadata, DocsSettings } from '@/lib/docs-storage-db';

export async function migrateLocalStorageToDatabase() {
  try {
    console.log('Starting documentation data migration...');

    // Migrate settings
    const settings = JSON.parse(localStorage.getItem('api_playground_docs_settings') || '{}');
    if (Object.keys(settings).length > 0) {
      await DocsSettings.update(settings);
      console.log('✓ Settings migrated');
    }

    // Migrate projects
    const projects = JSON.parse(localStorage.getItem('api_playground_docs_projects') || '{}');
    for (const [projectId, project] of Object.entries(projects)) {
      try {
        await DocsProjects.create(
          project.name,
          project.description,
          project.collections,
          project.settings
        );
        console.log(`✓ Project "${project.name}" migrated`);
      } catch (error) {
        console.error(`✗ Failed to migrate project "${project.name}":`, error);
      }
    }

    // Migrate collection metadata
    const collections = JSON.parse(localStorage.getItem('api_playground_docs_collections') || '{}');
    for (const [collectionId, metadata] of Object.entries(collections)) {
      try {
        await DocsMetadata.saveCollection(collectionId, metadata);
        console.log(`✓ Collection metadata ${collectionId} migrated`);
      } catch (error) {
        console.error(`✗ Failed to migrate collection metadata ${collectionId}:`, error);
      }
    }

    // Migrate request metadata
    const requests = JSON.parse(localStorage.getItem('api_playground_docs_requests') || '{}');
    for (const [requestId, metadata] of Object.entries(requests)) {
      try {
        await DocsMetadata.saveRequest(requestId, metadata);
        console.log(`✓ Request metadata ${requestId} migrated`);
      } catch (error) {
        console.error(`✗ Failed to migrate request metadata ${requestId}:`, error);
      }
    }

    console.log('✓ Migration completed successfully!');
    return { success: true };
  } catch (error) {
    console.error('✗ Migration failed:', error);
    return { success: false, error };
  }
}

// Cleanup localStorage after successful migration
export function cleanupLocalStorage() {
  const keys = [
    'api_playground_docs_projects',
    'api_playground_docs_collections',
    'api_playground_docs_requests',
    'api_playground_docs_settings',
    'api_playground_docs_cache'
  ];
  
  keys.forEach(key => {
    localStorage.removeItem(key);
  });
  
  console.log('✓ localStorage cleanup completed');
}
```

### Step 4: Update Components

Update your components to handle async operations:

```javascript
// Before (synchronous localStorage)
const projects = DocsProjects.getAll();

// After (async database)
const [projects, setProjects] = useState({});

useEffect(() => {
  const loadProjects = async () => {
    const projectsData = await DocsProjects.getAll();
    setProjects(projectsData);
  };
  loadProjects();
}, []);
```

### Step 5: Add Migration UI

Add a migration button to help users transition:

```javascript
// In your settings or dashboard component
import { migrateLocalStorageToDatabase, cleanupLocalStorage } from '@/utils/migrate-docs-data';

const [isMigrating, setIsMigrating] = useState(false);

const handleMigration = async () => {
  setIsMigrating(true);
  try {
    const result = await migrateLocalStorageToDatabase();
    if (result.success) {
      cleanupLocalStorage();
      // Refresh the page or update state
      window.location.reload();
    } else {
      alert('Migration failed. Please try again.');
    }
  } catch (error) {
    alert('Migration failed: ' + error.message);
  } finally {
    setIsMigrating(false);
  }
};

// Check if migration is needed
const hasLocalStorageData = () => {
  return localStorage.getItem('api_playground_docs_projects') !== null;
};
```

## Features Enabled by Database

### 1. Advanced Search
```javascript
// Full-text search across all documentation
const results = await DocsMetadata.search('authentication');
```

### 2. Collaboration
```javascript
// Share projects with other users (future feature)
await DocsProjects.share(projectId, userEmails);
```

### 3. Templates
```javascript
// Save and reuse documentation templates
const template = await DocsTemplates.create(
  'REST API Template',
  'Standard REST endpoint template',
  'request',
  templateData
);
```

### 4. Performance Caching
```javascript
// Automatic caching for generated documentation
const cached = await DocsCache.get('project_123');
if (!cached) {
  const docs = generateDocs(project);
  await DocsCache.set('project_123', docs);
}
```

## Rollback Plan

If issues arise, you can temporarily rollback:

1. **Revert imports:**
   ```javascript
   // Switch back to localStorage storage
   import { DocsProjects } from '@/lib/docs-storage';
   ```

2. **Restore backup data:**
   ```javascript
   // Restore from backup.json
   const backup = /* your backup data */;
   localStorage.setItem('api_playground_docs_projects', JSON.stringify(backup.projects));
   // ... restore other data
   ```

## Performance Considerations

### 1. Caching Strategy
- Generated documentation is cached for 1 hour
- Search results are cached for 15 minutes
- Metadata changes invalidate related cache

### 2. Pagination
- Large project lists are paginated
- Search results limited to 50 items by default
- Infinite scrolling for better UX

### 3. Offline Support
- Service worker caches recent documentation
- Graceful fallback when offline
- Sync changes when connection restored

## Security Notes

### 1. Row Level Security
- All tables use RLS to ensure users only access their data
- Authentication required for all operations
- Proper user context validation

### 2. Data Validation
- Input sanitization on all user data
- JSON schema validation for structured data
- SQL injection protection

### 3. Backup Strategy
- Regular automated backups
- Export functionality for user data
- Point-in-time recovery options

## Monitoring and Maintenance

### 1. Database Maintenance
```sql
-- Run periodically to clean expired cache
SELECT clean_expired_cache();

-- Clean orphaned metadata
SELECT cleanup_orphaned_docs_metadata();

-- Refresh search index
SELECT refresh_docs_search_index();
```

### 2. Performance Monitoring
- Monitor query performance
- Track cache hit rates
- Watch for slow searches

### 3. Storage Management
- Monitor table sizes
- Archive old projects
- Compress large documentation

## Support

If you encounter issues during migration:

1. Check browser console for errors
2. Verify Supabase connection and authentication
3. Ensure RLS policies are correctly applied
4. Test with a single project first
5. Contact support with backup data if needed

Remember to test the migration in a development environment first!