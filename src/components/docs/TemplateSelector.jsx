"use client";

import { useState } from "react";
import { Check, Info } from "lucide-react";
import { getAllTemplates } from "./templates/TemplateRegistry";

export default function TemplateSelector({ 
  selectedTemplate, 
  onTemplateSelect, 
  isDark = false 
}) {
  const [showTemplateInfo, setShowTemplateInfo] = useState(null);
  const templates = getAllTemplates();

  return (
    <div className="space-y-3">
      {templates.map((template) => (
        <div key={template.key} className="relative">
          <button
            onClick={() => onTemplateSelect(template.key)}
            className={`cursor-pointer w-full p-4 text-left rounded-lg border transition-all ${
              selectedTemplate === template.key
                ? isDark
                  ? "border-white bg-gray-800 text-white"
                  : "border-black bg-gray-50 text-black"
                : isDark
                ? "border-gray-700 hover:border-gray-600 hover:bg-gray-800/50"
                : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <div
                    className={`font-medium text-sm ${
                      selectedTemplate === template.key
                        ? "text-current"
                        : isDark ? "text-gray-200" : "text-gray-900"
                    }`}
                  >
                    {template.name}
                  </div>
                  {template.isDefault && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                      Default
                    </span>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowTemplateInfo(showTemplateInfo === template.key ? null : template.key);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <Info className="w-3 h-3" />
                  </button>
                </div>
                <div
                  className={`text-xs ${
                    selectedTemplate === template.key
                      ? "text-current opacity-75"
                      : isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  {template.description}
                </div>
              </div>
              {selectedTemplate === template.key && (
                <Check className="w-4 h-4 flex-shrink-0 ml-2" />
              )}
            </div>
          </button>
          
          {/* Template Info Dropdown */}
          {showTemplateInfo === template.key && (
            <div className={`absolute top-full left-0 right-0 mt-2 p-3 rounded-lg border shadow-lg z-10 ${
              isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
            }`}>
              <h4 className={`font-medium text-sm mb-2 ${
                isDark ? "text-gray-200" : "text-gray-900"
              }`}>
                Template Features
              </h4>
              <ul className={`text-xs space-y-1 ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}>
                {template.features?.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-blue-400"></div>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}