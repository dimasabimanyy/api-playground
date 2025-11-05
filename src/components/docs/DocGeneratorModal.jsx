"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  BookOpen,
  FileText,
  Sparkles,
  Eye,
  Download,
  Share2,
  Plus,
  Check,
  Search
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
    }
  }, [preSelectedCollectionId, open]);

  const handleCollectionToggle = (collectionId) => {
    setSelectedCollections(prev => 
      prev.includes(collectionId)
        ? prev.filter(id => id !== collectionId)
        : [...prev, collectionId]
    );
  };

  // Filter collections based on search query
  const filteredCollections = Object.values(collections).filter(collection =>
    collection.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (collection.requests || []).some(request => 
      request.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.url?.toLowerCase().includes(searchQuery.toLowerCase())
    )
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
      <DialogContent className={`max-w-2xl max-h-[90vh] flex flex-col ${isDark ? 'bg-black border-gray-800' : 'bg-white border-gray-200'}`}>
        <DialogHeader className="space-y-3 pb-6 flex-shrink-0">
          <DialogTitle className={`text-2xl font-normal ${themeClasses.text.primary}`}>
            Generate Documentation
          </DialogTitle>
          <p className={`text-sm ${themeClasses.text.secondary} font-normal`}>
            Create beautiful API documentation from your collections
          </p>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto space-y-8 pr-2">
          {/* Collections Selection */}
          <div className="space-y-4">
            <div className="space-y-3">
              <label className={`text-sm font-medium ${themeClasses.text.primary}`}>
                Select Collections
              </label>
              
              {Object.keys(collections).length > 0 && (
                <div className="relative">
                  <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${themeClasses.text.tertiary}`} />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search collections or endpoints..."
                    className={`pl-9 ${isDark ? 'border-gray-800 bg-black' : 'border-gray-200'} font-normal`}
                  />
                </div>
              )}
            </div>
            
            {Object.keys(collections).length === 0 ? (
              <div className={`text-center py-12 ${themeClasses.text.tertiary}`}>
                <BookOpen className={`h-8 w-8 mx-auto mb-3 opacity-40`} />
                <p className={`text-sm ${themeClasses.text.secondary}`}>No collections found</p>
                <p className={`text-xs ${themeClasses.text.tertiary} mt-1`}>Create some collections first</p>
              </div>
            ) : filteredCollections.length === 0 ? (
              <div className={`text-center py-8 ${themeClasses.text.tertiary}`}>
                <Search className={`h-6 w-6 mx-auto mb-2 opacity-40`} />
                <p className={`text-sm ${themeClasses.text.secondary}`}>No collections match your search</p>
                <p className={`text-xs ${themeClasses.text.tertiary} mt-1`}>Try a different search term</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {filteredCollections.map((collection) => (
                  <label
                    key={collection.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedCollections.includes(collection.id)
                        ? isDark ? 'border-white bg-gray-900' : 'border-black bg-gray-50'
                        : isDark ? 'border-gray-800 hover:border-gray-700' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Checkbox
                      checked={selectedCollections.includes(collection.id)}
                      onCheckedChange={() => handleCollectionToggle(collection.id)}
                    />
                    <div className="flex-1">
                      <div className={`font-medium ${themeClasses.text.primary}`}>
                        {collection.name}
                      </div>
                      <div className={`text-sm ${themeClasses.text.tertiary} mt-1`}>
                        {collection.requests?.length || 0} endpoint{(collection.requests?.length || 0) !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            )}
            
            {/* Quick actions and selected count */}
            {filteredCollections.length > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedCollections(filteredCollections.map(c => c.id))}
                    className={`text-xs px-2 py-1 rounded transition-colors ${
                      isDark 
                        ? 'text-gray-400 hover:text-white hover:bg-gray-800' 
                        : 'text-gray-600 hover:text-black hover:bg-gray-100'
                    }`}
                  >
                    Select All
                  </button>
                  {selectedCollections.length > 0 && (
                    <button
                      onClick={() => setSelectedCollections([])}
                      className={`text-xs px-2 py-1 rounded transition-colors ${
                        isDark 
                          ? 'text-gray-400 hover:text-white hover:bg-gray-800' 
                          : 'text-gray-600 hover:text-black hover:bg-gray-100'
                      }`}
                    >
                      Clear All
                    </button>
                  )}
                </div>
                
                {selectedCollections.length > 0 && (
                  <div className={`text-xs ${themeClasses.text.tertiary} flex items-center gap-1`}>
                    <Check className="h-3 w-3" />
                    {selectedCollections.length} selected
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

          {/* Basic Configuration */}
          <div className="space-y-4">
            <label className={`text-sm font-medium ${themeClasses.text.primary}`}>
              Configuration
            </label>
            <div className="space-y-3">
              <div>
                <Input
                  value={customization.title}
                  onChange={(e) => setCustomization(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Documentation title"
                  className={`${isDark ? 'border-gray-800 bg-black' : 'border-gray-200'} font-normal`}
                />
              </div>
              <div>
                <Input
                  value={customization.baseUrl}
                  onChange={(e) => setCustomization(prev => ({ ...prev, baseUrl: e.target.value }))}
                  placeholder="Base URL (optional)"
                  className={`${isDark ? 'border-gray-800 bg-black' : 'border-gray-200'} font-normal`}
                />
              </div>
            </div>
          </div>

          {/* Options */}
          <div className="space-y-4">
            <label className={`text-sm font-medium ${themeClasses.text.primary}`}>
              Include
            </label>
            <div className="grid grid-cols-2 gap-3">
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

        {/* Actions */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-800 flex-shrink-0">
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
    </Dialog>
  );
}