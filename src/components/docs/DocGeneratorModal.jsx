"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogPortal,
  DialogOverlay,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  BookOpen,
  Check,
  Search,
  X,
  ChevronDown
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { getThemeClasses } from "@/lib/theme";

const templates = [
  {
    id: "modern",
    name: "Modern",
    description: "Clean and minimal",
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Text-focused style",
  },
  {
    id: "classic",
    name: "Classic",
    description: "Traditional layout",
  },
];

export default function DocGeneratorModal({ 
  open, 
  onOpenChange, 
  collections = {},
  preSelectedCollectionId = null,
  onGenerate 
}) {
  const { isDark } = useTheme();
  const themeClasses = getThemeClasses(isDark);
  
  const [selectedCollections, setSelectedCollections] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState("modern");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [customization, setCustomization] = useState({
    title: "API Documentation",
    description: "Complete API reference for your application",
    includeExamples: true,
    includeAuth: true,
    groupByCollection: true,
    includeErrorCodes: true,
    baseUrl: "https://api.example.com",
  });

  // Handle pre-selected collection and reset state
  useEffect(() => {
    if (open) {
      if (preSelectedCollectionId) {
        setSelectedCollections([preSelectedCollectionId]);
      } else {
        setSelectedCollections([]);
      }
      setSearchQuery("");
      setDebouncedSearchQuery("");
      setShowDropdown(false);
    }
  }, [preSelectedCollectionId, open]);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowDropdown(false);
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showDropdown]);

  const handleCollectionToggle = (collectionId) => {
    setSelectedCollections(prev => 
      prev.includes(collectionId)
        ? prev.filter(id => id !== collectionId)
        : [...prev, collectionId]
    );
  };

  // Filter collections based on debounced search query
  const filteredCollections = Object.values(collections).filter(collection =>
    debouncedSearchQuery.trim() === "" || 
    collection.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
    (collection.requests || []).some(request => 
      request.name?.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
      request.url?.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
    )
  );

  // Get selected collection objects
  const selectedCollectionObjects = Object.values(collections).filter(c => 
    selectedCollections.includes(c.id)
  );

  const handleGenerateDocs = () => {
    const docData = {
      selectedCollections,
      template: selectedTemplate,
      customization,
      collections: Object.values(collections).filter(c => selectedCollections.includes(c.id)),
    };
    
    if (onGenerate) {
      onGenerate(docData);
    }
    
    // Navigate to generated docs page
    window.open(`/docs/generated?template=${selectedTemplate}&collections=${selectedCollections.join(',')}&title=${encodeURIComponent(customization.title)}`, '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay className={`${isDark ? 'bg-black/80' : 'bg-black/60'} backdrop-blur-sm`} />
        <DialogContent className={`max-w-4xl ${isDark ? 'bg-black border-gray-800 shadow-2xl' : 'bg-white border-gray-200 shadow-2xl'} max-h-[90vh] overflow-y-auto`}>
        <DialogHeader className="space-y-3 pb-8">
          <DialogTitle className={`text-2xl font-normal ${themeClasses.text.primary}`}>
            Generate Documentation
          </DialogTitle>
          <p className={`text-sm ${themeClasses.text.secondary} font-normal`}>
            Create beautiful API documentation from your collections
          </p>
        </DialogHeader>
        
        <div className="space-y-8">
          {/* Collections Selection with Dropdown */}
          <div className="space-y-4">
            <label className={`text-sm font-medium ${themeClasses.text.primary}`}>
              Select Collections
            </label>
            
            {Object.keys(collections).length === 0 ? (
              <div className={`text-center py-8 ${themeClasses.text.tertiary}`}>
                <BookOpen className={`h-8 w-8 mx-auto mb-3 opacity-40`} />
                <p className={`text-sm ${themeClasses.text.secondary}`}>No collections found</p>
                <p className={`text-xs ${themeClasses.text.tertiary} mt-1`}>Create some collections first</p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Search Input */}
                <div className="relative">
                  <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${themeClasses.text.tertiary}`} />
                  <Input
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowDropdown(e.target.value.length > 0);
                    }}
                    onFocus={() => setShowDropdown(searchQuery.length > 0)}
                    placeholder="Search collections..."
                    className={`pl-9 ${isDark ? 'border-gray-800 bg-black' : 'border-gray-200'} font-normal`}
                  />
                  <ChevronDown className={`absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${themeClasses.text.tertiary}`} />
                  
                  {/* Dropdown */}
                  {showDropdown && debouncedSearchQuery.length > 0 && (
                    <div className={`absolute z-10 w-full mt-1 max-h-60 overflow-y-auto rounded-lg border ${
                      isDark ? 'bg-black border-gray-800' : 'bg-white border-gray-200'
                    } shadow-lg`}>
                      {filteredCollections.length === 0 ? (
                        <div className={`p-4 text-center ${themeClasses.text.tertiary}`}>
                          <Search className="h-5 w-5 mx-auto mb-2 opacity-40" />
                          <p className="text-sm">No collections found</p>
                        </div>
                      ) : (
                        filteredCollections.map((collection) => (
                          <button
                            key={collection.id}
                            onClick={() => {
                              handleCollectionToggle(collection.id);
                              setSearchQuery("");
                              setShowDropdown(false);
                            }}
                            className={`w-full p-3 text-left hover:${
                              isDark ? 'bg-gray-900' : 'bg-gray-50'
                            } border-b border-gray-200 dark:border-gray-800 last:border-b-0 transition-colors`}
                          >
                            <div className={`font-medium ${themeClasses.text.primary}`}>
                              {collection.name}
                            </div>
                            <div className={`text-sm ${themeClasses.text.tertiary} mt-1`}>
                              {collection.requests?.length || 0} endpoint{(collection.requests?.length || 0) !== 1 ? 's' : ''}
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {/* Selected Collections Display */}
                {selectedCollectionObjects.length > 0 && (
                  <div className="space-y-2">
                    <div className={`text-xs ${themeClasses.text.tertiary} flex items-center gap-1`}>
                      <Check className="h-3 w-3" />
                      {selectedCollectionObjects.length} collection{selectedCollectionObjects.length !== 1 ? 's' : ''} selected
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedCollectionObjects.map((collection) => (
                        <div
                          key={collection.id}
                          className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                            isDark ? 'bg-gray-900 border border-gray-800' : 'bg-gray-100 border border-gray-200'
                          }`}
                        >
                          <span className={themeClasses.text.primary}>{collection.name}</span>
                          <button
                            onClick={() => handleCollectionToggle(collection.id)}
                            className={`hover:${themeClasses.text.primary} ${themeClasses.text.tertiary}`}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Template Selection */}
          <div className="space-y-4">
            <label className={`text-sm font-medium ${themeClasses.text.primary}`}>
              Choose Style
            </label>
            <div className="grid grid-cols-3 gap-3">
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => setSelectedTemplate(template.id)}
                  className={`p-3 rounded-lg border text-left transition-colors ${
                    selectedTemplate === template.id
                      ? isDark ? 'border-white bg-gray-900' : 'border-black bg-gray-50'
                      : isDark ? 'border-gray-800 hover:border-gray-700' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className={`font-medium text-sm ${themeClasses.text.primary} mb-1`}>
                    {template.name}
                  </div>
                  <div className={`text-xs ${themeClasses.text.tertiary}`}>
                    {template.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Configuration */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <label className={`text-sm font-medium ${themeClasses.text.primary}`}>
                Configuration
              </label>
              <div className="space-y-3">
                <Input
                  value={customization.title}
                  onChange={(e) => setCustomization(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Documentation title"
                  className={`${isDark ? 'border-gray-800 bg-black' : 'border-gray-200'} font-normal`}
                />
                <Input
                  value={customization.baseUrl}
                  onChange={(e) => setCustomization(prev => ({ ...prev, baseUrl: e.target.value }))}
                  placeholder="Base URL (optional)"
                  className={`${isDark ? 'border-gray-800 bg-black' : 'border-gray-200'} font-normal`}
                />
              </div>
            </div>

            <div className="space-y-4">
              <label className={`text-sm font-medium ${themeClasses.text.primary}`}>
                Include
              </label>
              <div className="space-y-3">
                {[
                  { key: 'includeExamples', label: 'Request Examples' },
                  { key: 'includeAuth', label: 'Authentication' },
                  { key: 'groupByCollection', label: 'Group by Collection' },
                  { key: 'includeErrorCodes', label: 'Error Codes' },
                ].map((option) => (
                  <label key={option.key} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={customization[option.key]}
                      onCheckedChange={(checked) => 
                        setCustomization(prev => ({ ...prev, [option.key]: checked }))
                      }
                    />
                    <span className={`text-sm ${themeClasses.text.secondary}`}>
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-800">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className={`${isDark ? 'border-gray-800 hover:bg-gray-900' : 'border-gray-200 hover:bg-gray-50'}`}
          >
            Cancel
          </Button>
          
          <Button
            onClick={handleGenerateDocs}
            disabled={selectedCollections.length === 0}
            className={`${isDark ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'} font-medium`}
          >
            Generate Documentation
          </Button>
        </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}