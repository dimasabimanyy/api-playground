/**
 * Custom hook for auto-saving documentation changes
 * Provides real-time preview and persistence of edits
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { DocsMetadata, DocsSettings } from '@/lib/docs-storage';

export function useDocsAutoSave(initialDocData, onSave) {
  const [docData, setDocData] = useState(initialDocData);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saving', 'saved', 'error'
  
  const autoSaveTimeoutRef = useRef(null);
  const lastSaveDataRef = useRef(JSON.stringify(initialDocData));

  // Settings for auto-save
  const settings = DocsSettings.get();
  const autoSaveInterval = settings.autoSaveInterval || 30000; // 30 seconds
  const autoSaveEnabled = settings.autoSave !== false;

  // Check for changes whenever docData changes
  useEffect(() => {
    const currentDataString = JSON.stringify(docData);
    const hasDataChanges = currentDataString !== lastSaveDataRef.current;
    setHasChanges(hasDataChanges);

    // Schedule auto-save if changes exist and auto-save is enabled
    if (hasDataChanges && autoSaveEnabled) {
      setSaveStatus('modified');
      scheduleAutoSave();
    }
  }, [docData, autoSaveEnabled]);

  // Update doc data and trigger change detection
  const updateDocData = useCallback((newData) => {
    setDocData(newData);
  }, []);

  // Schedule auto-save with debouncing
  const scheduleAutoSave = useCallback(() => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    autoSaveTimeoutRef.current = setTimeout(() => {
      if (hasChanges) {
        performAutoSave();
      }
    }, 3000); // Auto-save 3 seconds after last change
  }, [hasChanges]);

  // Perform the actual auto-save
  const performAutoSave = useCallback(async () => {
    if (!hasChanges || isSaving) return;

    setIsSaving(true);
    setSaveStatus('saving');

    try {
      // Save metadata to persistent storage
      if (docData.collections) {
        await Promise.all(
          docData.collections.map(async (collection) => {
            if (collection.docs) {
              DocsMetadata.saveCollection(collection.id, collection.docs);
            }
            
            if (collection.requests) {
              await Promise.all(
                collection.requests.map(async (request) => {
                  if (request.docs) {
                    DocsMetadata.saveRequest(request.id, request.docs);
                  }
                })
              );
            }
          })
        );
      }

      // Call external save handler if provided
      if (onSave) {
        await onSave(docData);
      }

      // Update tracking variables
      lastSaveDataRef.current = JSON.stringify(docData);
      setLastSaved(new Date());
      setHasChanges(false);
      setSaveStatus('saved');

      console.log('📝 Auto-saved documentation changes');
    } catch (error) {
      console.error('❌ Auto-save failed:', error);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  }, [docData, hasChanges, isSaving, onSave]);

  // Manual save function
  const saveNow = useCallback(async () => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    await performAutoSave();
  }, [performAutoSave]);

  // Force save (even if no changes detected)
  const forceSave = useCallback(async () => {
    const previousHasChanges = hasChanges;
    setHasChanges(true);
    await performAutoSave();
    if (!previousHasChanges) {
      setHasChanges(false);
    }
  }, [hasChanges, performAutoSave]);

  // Clear auto-save timeout on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  // Specific update functions for different parts of documentation
  const updateProjectInfo = useCallback((field, value) => {
    setDocData(prevData => ({
      ...prevData,
      customization: {
        ...prevData.customization,
        [field]: value
      }
    }));
  }, []);

  const updateCollectionDocs = useCallback((collectionId, field, value) => {
    setDocData(prevData => ({
      ...prevData,
      collections: prevData.collections.map(collection => 
        collection.id === collectionId 
          ? {
              ...collection,
              docs: {
                ...collection.docs,
                [field]: value,
                lastModified: new Date().toISOString(),
              }
            }
          : collection
      )
    }));
  }, []);

  const updateRequestDocs = useCallback((collectionId, requestId, field, value) => {
    setDocData(prevData => ({
      ...prevData,
      collections: prevData.collections.map(collection => 
        collection.id === collectionId 
          ? {
              ...collection,
              requests: collection.requests?.map(request =>
                request.id === requestId
                  ? {
                      ...request,
                      docs: {
                        ...request.docs,
                        [field]: value,
                        lastModified: new Date().toISOString(),
                      }
                    }
                  : request
              ) || []
            }
          : collection
      )
    }));
  }, []);

  const updateRequestParameters = useCallback((collectionId, requestId, parameterType, parameters) => {
    setDocData(prevData => {
      const collection = prevData.collections.find(c => c.id === collectionId);
      const request = collection?.requests?.find(r => r.id === requestId);
      const currentParameters = request?.docs?.parameters || {};

      return {
        ...prevData,
        collections: prevData.collections.map(collection => 
          collection.id === collectionId 
            ? {
                ...collection,
                requests: collection.requests?.map(request =>
                  request.id === requestId
                    ? {
                        ...request,
                        docs: {
                          ...request.docs,
                          parameters: {
                            ...currentParameters,
                            [parameterType]: parameters
                          },
                          lastModified: new Date().toISOString(),
                        }
                      }
                    : request
                ) || []
              }
            : collection
        )
      };
    });
  }, []);

  const updateRequestExample = useCallback((collectionId, requestId, language, code) => {
    setDocData(prevData => {
      const collection = prevData.collections.find(c => c.id === collectionId);
      const request = collection?.requests?.find(r => r.id === requestId);
      const currentExamples = request?.docs?.examples || {};

      return {
        ...prevData,
        collections: prevData.collections.map(collection => 
          collection.id === collectionId 
            ? {
                ...collection,
                requests: collection.requests?.map(request =>
                  request.id === requestId
                    ? {
                        ...request,
                        docs: {
                          ...request.docs,
                          examples: {
                            ...currentExamples,
                            [language]: code
                          },
                          lastModified: new Date().toISOString(),
                        }
                      }
                    : request
                ) || []
              }
            : collection
        )
      };
    });
  }, []);

  // Status helpers
  const getStatusMessage = () => {
    switch (saveStatus) {
      case 'saving':
        return 'Saving...';
      case 'saved':
        return lastSaved ? `Saved at ${lastSaved.toLocaleTimeString()}` : 'All changes saved';
      case 'error':
        return 'Save failed';
      case 'modified':
        return 'Unsaved changes';
      default:
        return '';
    }
  };

  const getStatusColor = () => {
    switch (saveStatus) {
      case 'saving':
        return 'text-blue-500';
      case 'saved':
        return 'text-green-500';
      case 'error':
        return 'text-red-500';
      case 'modified':
        return 'text-orange-500';
      default:
        return 'text-gray-500';
    }
  };

  return {
    // Data
    docData,
    hasChanges,
    isSaving,
    lastSaved,
    saveStatus,
    
    // Actions
    updateDocData,
    updateProjectInfo,
    updateCollectionDocs,
    updateRequestDocs,
    updateRequestParameters,
    updateRequestExample,
    saveNow,
    forceSave,
    
    // Status
    getStatusMessage,
    getStatusColor,
    
    // Settings
    autoSaveEnabled,
    autoSaveInterval,
  };
}

export default useDocsAutoSave;