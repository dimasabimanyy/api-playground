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
import { DocsGenerator } from "@/lib/docs-generator";

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
  
  const [selectedCollection, setSelectedCollection] = useState(null);
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
        setSelectedCollection(preSelectedCollectionId);
      } else {
        setSelectedCollection(null);
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

  const handleCollectionSelect = (collectionId) => {
    setSelectedCollection(collectionId);
    setSearchQuery("");
    setShowDropdown(false);
  };

  const handleCollectionClear = () => {
    setSelectedCollection(null);
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

  // Get selected collection object
  const selectedCollectionObject = selectedCollection ? collections[selectedCollection] : null;

  const handleGenerateDocs = async () => {
    if (!selectedCollection) return;
    
    try {
      // Generate enhanced documentation using real collections data
      const collectionsToGenerate = { [selectedCollection]: selectedCollectionObject };
      
      const docData = await DocsGenerator.generateFromCollections(collectionsToGenerate, {
        title: customization.title,
        description: customization.description,
        baseUrl: customization.baseUrl,
        theme: selectedTemplate,
        showToc: true,
        showSearch: true,
        showTryItOut: true,
        showCodeExamples: customization.includeExamples,
        groupBy: customization.groupByCollection ? 'collection' : 'none',
      });
      
      // Store generated docs data for the viewer page
      const docId = `doc_${Date.now()}_${selectedCollection}`;
      sessionStorage.setItem(`docs_${docId}`, JSON.stringify(docData));
      
      if (onGenerate) {
        onGenerate({
          selectedCollections: [selectedCollection],
          template: selectedTemplate,
          customization,
          collections: [selectedCollectionObject],
          enhancedData: docData,
          docId,
        });
      }
      
      // Navigate to generated docs page with the enhanced data
      window.open(`/docs/generated?docId=${docId}&template=${selectedTemplate}&collections=${selectedCollection}&title=${encodeURIComponent(customization.title)}`, '_blank');
    } catch (error) {
      console.error('Failed to generate documentation:', error);
      // Fallback to old method if generation fails
      window.open(`/docs/generated?template=${selectedTemplate}&collections=${selectedCollection}&title=${encodeURIComponent(customization.title)}`, '_blank');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay 
          className={isDark ? '!bg-black/30' : '!bg-transparent'}
          style={isDark ? {} : { backgroundColor: 'rgba(255, 255, 255)' }}
        />
        <DialogContent className={`max-w-2xl sm:max-w-2xl md:max-w-2xl lg:max-w-2xl xl:max-w-2xl ${isDark ? 'bg-black border-gray-800' : 'bg-white'} border shadow-lg max-h-[90vh] overflow-y-auto`} 
          style={{ 
            borderRadius: '12px',
            borderColor: isDark ? 'rgb(38, 38, 38)' : 'rgb(235, 235, 235)'
          }}>
        <DialogHeader className="space-y-3 pb-3">
          <DialogTitle className={`text-2xl font-bold mb-0 ${themeClasses.text.primary}`}>
            Generate Documentation
          </DialogTitle>
          {/* <p className={`text-sm ${themeClasses.text.secondary} font-normal`}>
            Create beautiful API documentation from your collections
          </p> */}
        </DialogHeader>
        
        <div className="space-y-8">
          {/* Collection Selection with Input Display */}
          <div className="space-y-3">
            <label className={`text-sm font-medium ${themeClasses.text.primary}`}>
              Select Collection
            </label>
            
            {Object.keys(collections).length === 0 ? (
              <div className={`text-center py-8 ${themeClasses.text.tertiary}`}>
                <BookOpen className={`h-8 w-8 mx-auto mb-3 opacity-40`} />
                <p className={`text-sm ${themeClasses.text.secondary}`}>No collections found</p>
                <p className={`text-xs ${themeClasses.text.tertiary} mt-1`}>Create some collections first</p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Input with Selected Collection or Search */}
                <div className="relative">
                  <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${themeClasses.text.tertiary}`} />
                  <Input
                    value={selectedCollectionObject ? selectedCollectionObject.name : searchQuery}
                    onChange={(e) => {
                      if (!selectedCollectionObject) {
                        setSearchQuery(e.target.value);
                        setShowDropdown(e.target.value.length > 0);
                      }
                    }}
                    onFocus={(e) => {
                      if (!selectedCollectionObject) {
                        setShowDropdown(searchQuery.length > 0);
                      } else {
                        // Prevent text selection when collection is already selected
                        e.target.blur();
                      }
                    }}
                    onMouseDown={(e) => {
                      if (selectedCollectionObject) {
                        // Prevent text selection on mouse down
                        e.preventDefault();
                      }
                    }}
                    placeholder="Search and select a collection..."
                    className={`pl-9 ${selectedCollectionObject ? 'pr-16' : 'pr-9'} text-sm font-normal border ${selectedCollectionObject ? 'cursor-default select-none' : ''}`}
                    style={{
                      borderRadius: '6px',
                      borderColor: isDark ? 'rgb(38, 38, 38)' : 'rgb(235, 235, 235)',
                      backgroundColor: isDark ? 'transparent' : '#fafafa'
                    }}
                    readOnly={!!selectedCollectionObject}
                    autoFocus={false}
                  />
                  
                  {/* Clear button when collection is selected */}
                  {selectedCollectionObject && (
                    <button
                      onClick={handleCollectionClear}
                      className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:${
                        isDark ? 'bg-gray-800' : 'bg-gray-100'
                      } transition-colors cursor-pointer`}
                      style={{ borderRadius: '6px' }}
                    >
                      <X className={`h-4 w-4 ${themeClasses.text.tertiary}`} />
                    </button>
                  )}
                  
                  {/* Chevron when no selection */}
                  {!selectedCollectionObject && (
                    <ChevronDown className={`absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${themeClasses.text.tertiary}`} />
                  )}
                  
                  {/* Dropdown */}
                  {!selectedCollectionObject && showDropdown && debouncedSearchQuery.length > 0 && (
                    <div 
                      className={`absolute z-10 w-full mt-1 max-h-60 overflow-y-auto border ${
                        isDark ? 'bg-black' : 'bg-white'
                      } shadow-lg`}
                      style={{ 
                        borderRadius: '6px',
                        borderColor: isDark ? 'rgb(38, 38, 38)' : 'rgb(235, 235, 235)'
                      }}
                    >
                      {filteredCollections.length === 0 ? (
                        <div className={`p-4 text-center ${themeClasses.text.tertiary}`}>
                          <Search className="h-5 w-5 mx-auto mb-2 opacity-40" />
                          <p className="text-sm">No collections found</p>
                        </div>
                      ) : (
                        filteredCollections.map((collection) => (
                          <button
                            key={collection.id}
                            onClick={() => handleCollectionSelect(collection.id)}
                            className={`w-full p-3 text-left hover:${
                              isDark ? 'bg-gray-900' : 'bg-gray-50'
                            } transition-colors cursor-pointer`}
                            style={{
                              borderBottom: `1px solid ${isDark ? 'rgb(38, 38, 38)' : 'rgb(235, 235, 235)'}`,
                              borderBottomWidth: '1px'
                            }}
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

                {/* Selected Collection Info */}
                {selectedCollectionObject && (
                  <div className={`text-xs ${themeClasses.text.tertiary} flex items-center gap-1`}>
                    <Check className="h-3 w-3" />
                    {selectedCollectionObject.requests?.length || 0} endpoint{(selectedCollectionObject.requests?.length || 0) !== 1 ? 's' : ''} in this collection
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Template Selection */}
          <div className="space-y-3">
            <div>
              <label className={`text-sm font-medium ${themeClasses.text.primary}`}>
                Choose Style
              </label>
              <p className={`text-xs ${themeClasses.text.tertiary} mt-1`}>
                Select a visual theme for your documentation
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => setSelectedTemplate(template.id)}
                  className={`group relative p-3 text-left transition-all duration-200 cursor-pointer border ${
                    selectedTemplate === template.id
                      ? isDark ? 'bg-gray-900' : 'bg-white shadow-sm'
                      : isDark ? 'hover:bg-gray-900/50' : 'hover:bg-gray-50'
                  }`}
                  style={{
                    borderRadius: '6px',
                    borderColor: selectedTemplate === template.id 
                      ? (isDark ? 'rgb(82, 82, 82)' : 'rgb(0, 0, 0)')
                      : (isDark ? 'rgb(38, 38, 38)' : 'rgb(235, 235, 235)'),
                    backgroundColor: selectedTemplate === template.id 
                      ? (isDark ? 'rgb(23, 23, 23)' : 'white')
                      : (isDark ? 'transparent' : '#fafafa')
                  }}
                >
                  {/* Preview mockup */}
                  <div 
                    className={`w-full h-10 mb-3 flex items-center justify-center border ${
                      template.id === 'modern' 
                        ? isDark ? 'bg-gradient-to-r from-blue-900/40 to-purple-900/40 border-blue-800/30' : 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200/50'
                        : template.id === 'minimal'
                        ? isDark ? 'bg-gray-800/60 border-gray-700' : 'bg-gray-100/80 border-gray-300'
                        : isDark ? 'bg-gradient-to-r from-emerald-900/40 to-teal-900/40 border-emerald-800/30' : 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200/50'
                    }`}
                    style={{ borderRadius: '6px' }}
                  >
                    <div className="flex space-x-1">
                      <div className={`w-1 h-6 rounded-full ${
                        template.id === 'modern' ? 'bg-blue-500/60' :
                        template.id === 'minimal' ? 'bg-gray-500/60' : 'bg-emerald-500/60'
                      }`} />
                      <div className={`w-1 h-4 rounded-full ${
                        template.id === 'modern' ? 'bg-purple-500/60' :
                        template.id === 'minimal' ? 'bg-gray-400/60' : 'bg-teal-500/60'
                      }`} />
                      <div className={`w-1 h-5 rounded-full ${
                        template.id === 'modern' ? 'bg-blue-600/60' :
                        template.id === 'minimal' ? 'bg-gray-600/60' : 'bg-emerald-600/60'
                      }`} />
                    </div>
                  </div>
                  
                  {/* Selection indicator */}
                  {selectedTemplate === template.id && (
                    <div className="absolute top-2 right-2">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                        isDark ? 'bg-white text-black' : 'bg-black text-white'
                      }`}>
                        <Check className="w-3 h-3" />
                      </div>
                    </div>
                  )}
                  
                  <div className={`font-medium text-sm ${themeClasses.text.primary} mb-1`}>
                    {template.name}
                  </div>
                  <div className={`text-xs ${themeClasses.text.tertiary} leading-relaxed`}>
                    {template.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Configuration */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className={`text-sm font-medium ${themeClasses.text.primary}`}>
                Configuration
              </label>
              <div className="space-y-3">
                <Input
                  value={customization.title}
                  onChange={(e) => setCustomization(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Documentation title"
                  className="text-sm font-normal border"
                  style={{
                    borderRadius: '6px',
                    borderColor: isDark ? 'rgb(38, 38, 38)' : 'rgb(235, 235, 235)',
                    backgroundColor: isDark ? 'transparent' : '#fafafa'
                  }}
                />
                <Input
                  value={customization.baseUrl}
                  onChange={(e) => setCustomization(prev => ({ ...prev, baseUrl: e.target.value }))}
                  placeholder="Base URL (optional)"
                  className="text-sm font-normal border"
                  style={{
                    borderRadius: '6px',
                    borderColor: isDark ? 'rgb(38, 38, 38)' : 'rgb(235, 235, 235)',
                    backgroundColor: isDark ? 'transparent' : '#fafafa'
                  }}
                />
              </div>
            </div>

            <div className="space-y-3">
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
        <div className="flex items-center justify-between pt-6 border-t" style={{ borderColor: isDark ? 'rgb(38, 38, 38)' : 'rgb(235, 235, 235)' }}>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className={`px-4 py-2 text-sm font-medium border ${isDark ? 'border-gray-700 text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-50'}`}
            style={{ 
              borderRadius: '6px',
              borderColor: isDark ? 'rgb(82, 82, 82)' : 'rgb(235, 235, 235)',
              backgroundColor: isDark ? 'transparent' : '#fafafa'
            }}
          >
            Cancel
          </Button>
          
          <Button
            onClick={handleGenerateDocs}
            disabled={!selectedCollection}
            className={`px-4 py-2 text-sm font-medium ${!selectedCollection ? 'opacity-50 cursor-not-allowed' : ''}`}
            style={{ 
              borderRadius: '6px',
              backgroundColor: isDark ? 'white' : 'black',
              color: isDark ? 'black' : 'white',
              border: 'none'
            }}
          >
            Generate Documentation
          </Button>
        </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}