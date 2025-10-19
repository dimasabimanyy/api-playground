"use client";

import { useState } from "react";
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
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { getThemeClasses } from "@/lib/theme";

const templates = [
  {
    id: "modern",
    name: "Modern",
    description: "Stripe-inspired clean design",
    preview: "https://via.placeholder.com/300x200/3B82F6/FFFFFF?text=Modern",
    features: ["Clean typography", "Card-based layout", "Interactive examples"],
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Text-focused, documentation style",
    preview: "https://via.placeholder.com/300x200/6B7280/FFFFFF?text=Minimal",
    features: ["Simple layout", "High readability", "Fast loading"],
  },
  {
    id: "classic",
    name: "Classic",
    description: "Traditional API documentation",
    preview: "https://via.placeholder.com/300x200/059669/FFFFFF?text=Classic",
    features: ["Sidebar navigation", "Detailed sections", "Print-friendly"],
  },
];

export default function DocGeneratorModal({ 
  open, 
  onOpenChange, 
  collections = {},
  onGenerate 
}) {
  const { isDark } = useTheme();
  const themeClasses = getThemeClasses(isDark);
  
  const [selectedCollections, setSelectedCollections] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState("modern");
  const [customization, setCustomization] = useState({
    title: "API Documentation",
    description: "Complete API reference for your application",
    includeExamples: true,
    includeAuth: true,
    groupByCollection: true,
    includeErrorCodes: true,
    baseUrl: "https://api.example.com",
  });
  const [currentStep, setCurrentStep] = useState(1);

  const handleCollectionToggle = (collectionId) => {
    setSelectedCollections(prev => 
      prev.includes(collectionId)
        ? prev.filter(id => id !== collectionId)
        : [...prev, collectionId]
    );
  };

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

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h3 className={`text-lg font-semibold mb-2 ${themeClasses.text.primary}`}>
                Select Collections
              </h3>
              <p className={`text-sm ${themeClasses.text.secondary} mb-4`}>
                Choose which collections to include in your documentation
              </p>
            </div>

            {Object.keys(collections).length === 0 ? (
              <div className={`text-center py-8 ${themeClasses.text.tertiary}`}>
                <BookOpen className={`h-8 w-8 mx-auto mb-3 ${themeClasses.text.tertiary}`} />
                <p className={`text-sm ${themeClasses.text.primary}`}>No collections found</p>
                <p className={`text-xs ${themeClasses.text.tertiary}`}>Create some collections first</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {Object.values(collections).map((collection) => (
                  <div
                    key={collection.id}
                    className={`p-4 rounded-lg border ${themeClasses.card.base} ${themeClasses.border.primary}`}
                  >
                    <label className="flex items-start gap-3 cursor-pointer">
                      <Checkbox
                        checked={selectedCollections.includes(collection.id)}
                        onCheckedChange={() => handleCollectionToggle(collection.id)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className={`font-medium ${themeClasses.text.primary}`}>
                          {collection.name}
                        </div>
                        <div className={`text-sm ${themeClasses.text.secondary} mt-1`}>
                          {collection.requests?.length || 0} endpoint{(collection.requests?.length || 0) !== 1 ? 's' : ''}
                        </div>
                        <div className="flex gap-1 mt-2">
                          {(collection.requests || []).slice(0, 3).map((request, idx) => (
                            <span
                              key={idx}
                              className={`px-2 py-1 text-xs rounded ${
                                request.method === 'GET' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                                request.method === 'POST' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' :
                                request.method === 'PUT' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
                                'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                              }`}
                            >
                              {request.method}
                            </span>
                          ))}
                          {(collection.requests?.length || 0) > 3 && (
                            <span className={`px-2 py-1 text-xs rounded ${themeClasses.text.tertiary} bg-gray-100 dark:bg-gray-800`}>
                              +{(collection.requests?.length || 0) - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className={`text-lg font-semibold mb-2 ${themeClasses.text.primary}`}>
                Choose Template
              </h3>
              <p className={`text-sm ${themeClasses.text.secondary} mb-4`}>
                Select a visual style for your documentation
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {templates.map((template) => (
                <div
                  key={template.id}
                  onClick={() => setSelectedTemplate(template.id)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                    selectedTemplate === template.id
                      ? `border-blue-500 ${isDark ? 'bg-blue-500/10' : 'bg-blue-50'}`
                      : `${themeClasses.border.primary} ${themeClasses.card.base} hover:border-blue-300`
                  }`}
                >
                  <div className="relative mb-3">
                    <img
                      src={template.preview}
                      alt={`${template.name} template preview`}
                      className="w-full h-32 object-cover rounded"
                    />
                    {selectedTemplate === template.id && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                  
                  <h4 className={`font-semibold mb-1 ${themeClasses.text.primary}`}>
                    {template.name}
                  </h4>
                  <p className={`text-sm ${themeClasses.text.secondary} mb-3`}>
                    {template.description}
                  </p>
                  
                  <ul className="space-y-1">
                    {template.features.map((feature, idx) => (
                      <li key={idx} className={`text-xs ${themeClasses.text.tertiary} flex items-center gap-1`}>
                        <div className="w-1 h-1 bg-current rounded-full" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className={`text-lg font-semibold mb-2 ${themeClasses.text.primary}`}>
                Customize Documentation
              </h3>
              <p className={`text-sm ${themeClasses.text.secondary} mb-4`}>
                Configure your documentation settings
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${themeClasses.text.primary} mb-2`}>
                  Documentation Title
                </label>
                <Input
                  value={customization.title}
                  onChange={(e) => setCustomization(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="API Documentation"
                  className={themeClasses.input.base}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${themeClasses.text.primary} mb-2`}>
                  Description
                </label>
                <Input
                  value={customization.description}
                  onChange={(e) => setCustomization(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Complete API reference for your application"
                  className={themeClasses.input.base}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${themeClasses.text.primary} mb-2`}>
                  Base URL
                </label>
                <Input
                  value={customization.baseUrl}
                  onChange={(e) => setCustomization(prev => ({ ...prev, baseUrl: e.target.value }))}
                  placeholder="https://api.example.com"
                  className={themeClasses.input.base}
                />
              </div>

              <div className="space-y-3">
                <h4 className={`text-sm font-medium ${themeClasses.text.primary}`}>Include Options</h4>
                
                {[
                  { key: 'includeExamples', label: 'Request/Response Examples', desc: 'Show sample requests and responses' },
                  { key: 'includeAuth', label: 'Authentication Info', desc: 'Include authentication details' },
                  { key: 'groupByCollection', label: 'Group by Collection', desc: 'Organize endpoints by collection' },
                  { key: 'includeErrorCodes', label: 'Error Codes', desc: 'Document error responses and codes' },
                ].map((option) => (
                  <label key={option.key} className="flex items-start gap-3 cursor-pointer">
                    <Checkbox
                      checked={customization[option.key]}
                      onCheckedChange={(checked) => 
                        setCustomization(prev => ({ ...prev, [option.key]: checked }))
                      }
                      className="mt-1"
                    />
                    <div>
                      <div className={`text-sm font-medium ${themeClasses.text.primary}`}>
                        {option.label}
                      </div>
                      <div className={`text-xs ${themeClasses.text.secondary}`}>
                        {option.desc}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`max-w-4xl max-h-[90vh] overflow-hidden ${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
        <DialogHeader>
          <DialogTitle className={`text-xl font-semibold ${themeClasses.text.primary}`}>
            Generate API Documentation
          </DialogTitle>
        </DialogHeader>
        
        {/* Step Indicator */}
        <div className="flex items-center justify-center mb-6">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step <= currentStep
                    ? 'bg-blue-500 text-white'
                    : `${themeClasses.text.tertiary} bg-gray-200 dark:bg-gray-700`
                }`}
              >
                {step < currentStep ? <Check className="w-4 h-4" /> : step}
              </div>
              {step < 3 && (
                <div
                  className={`w-12 h-px ${
                    step < currentStep ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-1">
          {renderStepContent()}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            {currentStep > 1 && (
              <Button
                variant="outline"
                onClick={() => setCurrentStep(prev => prev - 1)}
              >
                Previous
              </Button>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {currentStep < 3 ? (
              <Button
                onClick={() => setCurrentStep(prev => prev + 1)}
                disabled={currentStep === 1 && selectedCollections.length === 0}
              >
                Next
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  disabled={selectedCollections.length === 0}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </Button>
                <Button
                  onClick={handleGenerateDocs}
                  disabled={selectedCollections.length === 0}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Generate Docs
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}