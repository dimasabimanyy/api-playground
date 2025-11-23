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
import { BookOpen, Check, Search, X, ChevronDown } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { getThemeClasses } from "@/lib/theme";
import { DocsGenerator } from "@/lib/docs-generator";
import { DocsProjects } from "@/lib/docs-storage-db";
import { useCollections } from "@/contexts/CollectionsContext";
import { getCollectionsPagination } from "@/lib/supabase-collections";

const templates = [
  {
    id: "stripe-style",
    name: "Template A - Minimalist",
    description: "Stripe/Mintlify-style with premium layout",
  },
];

const COLLECTION_LIMIT = 2;

const documentationInitialData = {
  title: "API Documentation",
  description: "Complete API reference for your application",
  baseUrl: "https://api.example.com",
  // Branding
  primaryColor: "#171717",
  secondaryColor: "#6b7280",
  accentColor: "#3b82f6",
  // Theme
  defaultTheme: "light",
  allowThemeSwitch: true,
  // Font
  baseFont: "system-ui",
  monoFont: "ui-monospace",
  // Features
  enableTOC: true,
  includeExamples: true,
  includeAuth: true,
  groupByCollection: true,
  includeErrorCodes: true,
};

export default function DocGeneratorModal({
  open,
  onOpenChange,
  preSelectedCollectionId = null,
  onGenerate,
}) {
  const { isDark } = useTheme();
  const themeClasses = getThemeClasses(isDark);
  // const { collections } = useCollections();

  const [collections, setCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState("stripe-style");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [collectionsLimit, setCollectionsLimit] = useState(COLLECTION_LIMIT);
  const [customization, setCustomization] = useState(documentationInitialData);
  const [filteredCollections, setFilteredCollections] = useState([]);

  const handleCollectionSelect = (collectionId) => {
    setSelectedCollection(collectionId);
    setSearchQuery("");
    setShowDropdown(false);
  };

  const handleCollectionClear = () => {
    setSelectedCollection(null);
  };

  const getCollectionsByPagination = async () => {
    const data = await getCollectionsPagination({
      page: 1,
      pageSize: 10,
    });

    console.log("get data: ", data);

    setCollections(data);
  };

  useEffect(() => {
    getCollectionsByPagination();
  }, []);

  useEffect(() => {
    if (collections.length) {
      console.log("success collections: ", collections);
    }
  }, [collections]);

  // const filteredCollections = Object.values(collections)
  //   .filter((collection) => {
  //     // If no search query, show all collections (will be limited below)
  //     if (debouncedSearchQuery.trim() === "") {
  //       return true;
  //     }

  //     // Otherwise filter by search query
  //     return (
  //       collection.name
  //         .toLowerCase()
  //         .includes(debouncedSearchQuery.toLowerCase()) ||
  //       (collection.requests || []).some(
  //         (request) =>
  //           request.name
  //             ?.toLowerCase()
  //             .includes(debouncedSearchQuery.toLowerCase()) ||
  //           request.url
  //             ?.toLowerCase()
  //             .includes(debouncedSearchQuery.toLowerCase())
  //       )
  //     );
  //   })
  //   .slice(0, debouncedSearchQuery.trim() === "" ? collectionsLimit : 50); // Show first 10 by default, 50 when searching

  // Filter and limit collections based on search query
  // const filteredCollections = Object.values(collections)
  //   .filter((collection) => {
  //     // If no search query, show all collections (will be limited below)
  //     if (debouncedSearchQuery.trim() === "") {
  //       return true;
  //     }

  //     // Otherwise filter by search query
  //     return (
  //       collection.name
  //         .toLowerCase()
  //         .includes(debouncedSearchQuery.toLowerCase()) ||
  //       (collection.requests || []).some(
  //         (request) =>
  //           request.name
  //             ?.toLowerCase()
  //             .includes(debouncedSearchQuery.toLowerCase()) ||
  //           request.url
  //             ?.toLowerCase()
  //             .includes(debouncedSearchQuery.toLowerCase())
  //       )
  //     );
  //   })
  //   .slice(0, debouncedSearchQuery.trim() === "" ? collectionsLimit : 50); // Show first 10 by default, 50 when searching

  const hasMoreCollections =
    Object.values(collections).length > collectionsLimit &&
    debouncedSearchQuery.trim() === "";

  // Get selected collection object
  const selectedCollectionObject = selectedCollection
    ? collections[selectedCollection]
    : null;

  const handleGenerateDocs = async () => {
    if (!selectedCollection) return;

    console.log("selected coll: ", selectedCollection);
    console.log("selected col obj: ", selectedCollectionObject);

    try {
      // Generate enhanced documentation using real collections data
      const collectionsToGenerate = {
        [selectedCollection]: selectedCollectionObject,
      };

      const docData = await DocsGenerator.generateFromCollections(
        collectionsToGenerate,
        {
          title: customization.title,
          description: customization.description,
          baseUrl: customization.baseUrl,
          theme: selectedTemplate,
          showToc: true,
          showSearch: true,
          showTryItOut: true,
          showCodeExamples: customization.includeExamples,
          groupBy: customization.groupByCollection ? "collection" : "none",
        }
      );

      // Create and save documentation project to dashboard storage
      const project = await DocsProjects.create(
        customization.title,
        customization.description,
        [selectedCollection]
      );

      // Add settings to the project
      const updatedProject = await DocsProjects.update(project.id, {
        settings: {
          template: selectedTemplate,
          baseUrl: customization.baseUrl,
          displayOptions: {
            showTOC: true,
            showMethodBadges: true,
            showResponseExamples: customization.includeExamples,
            showCodeExamples: customization.includeExamples,
            primaryColor: "#171717",
          },
          includeExamples: customization.includeExamples,
          includeAuth: customization.includeAuth,
          groupByCollection: customization.groupByCollection,
          includeErrorCodes: customization.includeErrorCodes,
        },
      });

      // Store generated docs data for the viewer page
      const docId = `project_${project.id}_${Date.now()}`;
      sessionStorage.setItem(`docs_${docId}`, JSON.stringify(docData));

      if (onGenerate) {
        onGenerate({
          selectedCollections: [selectedCollection],
          template: selectedTemplate,
          customization,
          collections: [selectedCollectionObject],
          enhancedData: docData,
          docId,
          project: updatedProject || project,
        });
      }

      // Navigate to generated docs page with the enhanced data
      window.open(
        `/docs/generated?docId=${docId}&project=${
          project.id
        }&template=${selectedTemplate}&collections=${selectedCollection}&title=${encodeURIComponent(
          customization.title
        )}`,
        "_blank"
      );

      // Close the modal
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to generate documentation:", error);
      // Fallback to old method if generation fails
      window.open(
        `/docs/generated?template=${selectedTemplate}&collections=${selectedCollection}&title=${encodeURIComponent(
          customization.title
        )}`,
        "_blank"
      );
    }
  };

  // Handle pre-selected collection and reset state
  useEffect(() => {
    if (open) {
      setSelectedCollection(preSelectedCollectionId || null);

      setSearchQuery("");
      setDebouncedSearchQuery("");

      setShowDropdown(false);
      setCollectionsLimit(COLLECTION_LIMIT); // Reset limit when modal opens
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
    const handleClickOutside = (event) => {
      // Don't close if clicking on the dropdown or its contents
      if (
        event.target.closest("[data-dropdown]") ||
        event.target.closest("[data-dropdown-item]")
      ) {
        return;
      }
      setShowDropdown(false);
    };

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showDropdown]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay
          className={isDark ? "!bg-black/30" : "!bg-transparent"}
          style={isDark ? {} : { backgroundColor: "rgba(255, 255, 255)" }}
        />
        <DialogContent
          className={`sm:max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-4xl ${
            isDark ? "bg-black border-gray-800" : "bg-white"
          } border shadow-lg max-h-[90vh] overflow-y-auto`}
          style={{
            borderRadius: "12px",
            borderColor: isDark ? "rgb(38, 38, 38)" : "rgb(235, 235, 235)",
          }}
        >
          <DialogHeader className="space-y-3 pb-3">
            <DialogTitle
              className={`text-2xl font-bold mb-0 ${themeClasses.text.primary}`}
            >
              Generate Documentation
            </DialogTitle>
            <p className={`text-sm ${themeClasses.text.secondary} font-normal`}>
              Create beautiful API documentation from your collections
            </p>
          </DialogHeader>

          <div className="space-y-8">
            {/* Collection Selection with Input Display */}
            <div className="mb-5">
              {Object.keys(collections).length === 0 ? (
                <div
                  className={`text-center py-8 ${themeClasses.text.tertiary}`}
                >
                  <BookOpen className={`h-8 w-8 mx-auto mb-3 opacity-40`} />
                  <p className={`text-sm ${themeClasses.text.secondary}`}>
                    No collections found
                  </p>
                  <p className={`text-xs ${themeClasses.text.tertiary} mt-1`}>
                    Create some collections first
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Input with Selected Collection or Search */}
                  <div className="relative">
                    <Search
                      className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${themeClasses.text.tertiary}`}
                    />
                    <Input
                      value={
                        selectedCollectionObject
                          ? selectedCollectionObject.name
                          : searchQuery
                      }
                      onChange={(e) => {
                        console.log("target: ", e.target.value);

                        console.log(selectedCollection);
                        if (!selectedCollectionObject) {
                          setSearchQuery(e.target.value);
                          setShowDropdown(e.target.value.length > 0);
                        }
                      }}
                      onFocus={(e) => {
                        if (!selectedCollectionObject) {
                          setShowDropdown(true);
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
                      className={`pl-9 ${
                        selectedCollectionObject ? "pr-16" : "pr-9"
                      } text-sm font-normal border ${
                        selectedCollectionObject
                          ? "cursor-default select-none"
                          : ""
                      }`}
                      style={{
                        borderRadius: "6px",
                        borderColor: isDark
                          ? "rgb(38, 38, 38)"
                          : "rgb(235, 235, 235)",
                        backgroundColor: isDark ? "transparent" : "#fafafa",
                      }}
                      readOnly={!!selectedCollectionObject}
                      autoFocus={false}
                    />

                    {/* Clear button when collection is selected */}
                    {selectedCollectionObject && (
                      <button
                        onClick={handleCollectionClear}
                        className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:${
                          isDark ? "bg-gray-800" : "bg-gray-100"
                        } transition-colors cursor-pointer`}
                        style={{ borderRadius: "6px" }}
                      >
                        <X
                          className={`h-4 w-4 ${themeClasses.text.tertiary}`}
                        />
                      </button>
                    )}

                    {/* Chevron when no selection */}
                    {!selectedCollectionObject && (
                      <ChevronDown
                        className={`absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${themeClasses.text.tertiary}`}
                      />
                    )}

                    {/* Dropdown */}
                    {!selectedCollectionObject && showDropdown && (
                      <div
                        data-dropdown
                        className={`absolute z-10 w-full mt-1 max-h-60 overflow-y-auto border ${
                          isDark ? "bg-black" : "bg-white"
                        } shadow-lg`}
                        style={{
                          borderRadius: "6px",
                          borderColor: isDark
                            ? "rgb(38, 38, 38)"
                            : "rgb(235, 235, 235)",
                        }}
                      >
                        {filteredCollections.length === 0 ? (
                          <div
                            className={`p-4 text-center ${themeClasses.text.tertiary}`}
                          >
                            <Search className="h-5 w-5 mx-auto mb-2 opacity-40" />
                            <p className="text-sm">No collections found</p>
                          </div>
                        ) : (
                          <>
                            {filteredCollections.map((collection) => (
                              <button
                                key={collection.id}
                                data-dropdown-item
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  console.log(
                                    "Collection clicked:",
                                    collection.id,
                                    collection.name
                                  );
                                  handleCollectionSelect(collection.id);
                                }}
                                className={`w-full p-3 text-left hover:${
                                  isDark ? "bg-gray-900" : "bg-gray-50"
                                } transition-colors cursor-pointer`}
                                style={{
                                  borderBottom: `1px solid ${
                                    isDark
                                      ? "rgb(38, 38, 38)"
                                      : "rgb(235, 235, 235)"
                                  }`,
                                  borderBottomWidth: "1px",
                                }}
                              >
                                <div
                                  className={`font-medium ${themeClasses.text.primary}`}
                                >
                                  {collection.name}
                                </div>
                                <div
                                  className={`text-sm ${themeClasses.text.tertiary} mt-1`}
                                >
                                  {collection.requests?.length || 0} endpoint
                                  {(collection.requests?.length || 0) !== 1
                                    ? "s"
                                    : ""}
                                </div>
                              </button>
                            ))}

                            {/* Load More Button */}
                            {hasMoreCollections && (
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setCollectionsLimit((prev) => prev + 10);
                                }}
                                className={`w-full p-3 text-center hover:${
                                  isDark ? "bg-gray-900" : "bg-gray-50"
                                } transition-colors cursor-pointer border-t ${
                                  isDark
                                    ? "border-gray-700 text-gray-400"
                                    : "border-gray-200 text-gray-500"
                                }`}
                              >
                                <div className="text-sm">
                                  Load more collections... (
                                  {Object.values(collections).length -
                                    collectionsLimit}{" "}
                                  more)
                                </div>
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Selected Collection Info */}
                  {selectedCollectionObject && (
                    <div
                      className={`text-xs ${themeClasses.text.tertiary} flex items-center gap-1`}
                    >
                      <Check className="h-3 w-3" />
                      {selectedCollectionObject.requests?.length || 0} endpoint
                      {(selectedCollectionObject.requests?.length || 0) !== 1
                        ? "s"
                        : ""}{" "}
                      in this collection
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Template Selection */}
            <div className="mb-8 mt-2">
              <div className="mb-3">
                <h3
                  className={`text-lg font-semibold ${themeClasses.text.primary} mb-0`}
                >
                  Template & Style
                </h3>
                <p className={`text-sm ${themeClasses.text.tertiary}`}>
                  Select a visual theme for your documentation
                </p>
              </div>

              <div className="grid grid-cols-2 gap-5">
                {/* Left: Template Options */}
                <div className="space-y-3">
                  {templates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => setSelectedTemplate(template.id)}
                      className={`cursor-pointer w-full p-4 text-left rounded-lg border transition-all ${
                        selectedTemplate === template.id
                          ? isDark
                            ? "border-white bg-gray-800 text-white"
                            : "border-black bg-gray-50 text-black"
                          : isDark
                          ? "border-gray-700 hover:border-gray-600 hover:bg-gray-800/50"
                          : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div
                            className={`font-medium text-sm ${
                              selectedTemplate === template.id
                                ? "text-current"
                                : themeClasses.text.primary
                            }`}
                          >
                            {template.name}
                          </div>
                          <div
                            className={`text-xs ${
                              selectedTemplate === template.id
                                ? "text-current opacity-75"
                                : themeClasses.text.tertiary
                            } mt-1`}
                          >
                            {template.description}
                          </div>
                        </div>
                        {selectedTemplate === template.id && (
                          <Check className="w-4 h-4" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                {/* Right: Preview */}
                <div>
                  <div
                    className={`w-full h-48 rounded-lg border-2 border-dashed ${
                      isDark
                        ? "border-gray-700 bg-gray-800/50"
                        : "border-gray-300 bg-gray-50"
                    } flex items-center justify-center`}
                  >
                    <div className="text-center">
                      <div
                        className={`w-12 h-12 rounded-lg ${
                          isDark ? "bg-gray-700" : "bg-gray-200"
                        } mx-auto mb-2 flex items-center justify-center`}
                      >
                        <BookOpen
                          className={`w-6 h-6 ${themeClasses.text.tertiary}`}
                        />
                      </div>
                      <p className={`text-sm ${themeClasses.text.tertiary}`}>
                        Preview coming soon
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Configuration */}
            <div className="space-y-8">
              {/* Basic Info */}
              <div>
                <h3
                  className={`text-lg font-semibold ${themeClasses.text.primary} mb-4`}
                >
                  Basic Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    value={customization.title}
                    onChange={(e) =>
                      setCustomization((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    placeholder="Documentation title"
                    className="text-sm"
                    style={{
                      borderRadius: "6px",
                      borderColor: isDark
                        ? "rgb(38, 38, 38)"
                        : "rgb(235, 235, 235)",
                      backgroundColor: isDark ? "transparent" : "#fafafa",
                    }}
                  />
                  <Input
                    value={customization.baseUrl}
                    onChange={(e) =>
                      setCustomization((prev) => ({
                        ...prev,
                        baseUrl: e.target.value,
                      }))
                    }
                    placeholder="Base URL (optional)"
                    className="text-sm"
                    style={{
                      borderRadius: "6px",
                      borderColor: isDark
                        ? "rgb(38, 38, 38)"
                        : "rgb(235, 235, 235)",
                      backgroundColor: isDark ? "transparent" : "#fafafa",
                    }}
                  />
                </div>
              </div>

              {/* Branding */}
              <div>
                <h3
                  className={`text-lg font-semibold ${themeClasses.text.primary} mb-4`}
                >
                  Branding
                </h3>
                <div className="space-y-4">
                  {/* Color Pickers */}
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { key: "primaryColor", label: "Primary Color" },
                      { key: "secondaryColor", label: "Secondary Color" },
                      { key: "accentColor", label: "Accent Color" },
                    ].map((color) => (
                      <div key={color.key}>
                        <label
                          className={`text-sm font-medium ${themeClasses.text.secondary} mb-2 block`}
                        >
                          {color.label}
                        </label>
                        <div className="flex items-center gap-2">
                          <div className="relative">
                            <input
                              type="color"
                              value={customization[color.key]}
                              onChange={(e) =>
                                setCustomization((prev) => ({
                                  ...prev,
                                  [color.key]: e.target.value,
                                }))
                              }
                              className="w-10 h-8 rounded border cursor-pointer"
                              style={{
                                borderColor: isDark
                                  ? "rgb(38, 38, 38)"
                                  : "rgb(235, 235, 235)",
                                backgroundColor: customization[color.key],
                              }}
                            />
                          </div>
                          <Input
                            value={customization[color.key]}
                            onChange={(e) =>
                              setCustomization((prev) => ({
                                ...prev,
                                [color.key]: e.target.value,
                              }))
                            }
                            className="flex-1 text-xs font-mono"
                            style={{
                              borderRadius: "6px",
                              borderColor: isDark
                                ? "rgb(38, 38, 38)"
                                : "rgb(235, 235, 235)",
                              backgroundColor: isDark
                                ? "transparent"
                                : "#fafafa",
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Theme */}
              <div>
                <h3
                  className={`text-lg font-semibold ${themeClasses.text.primary} mb-4`}
                >
                  Theme
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      className={`text-sm font-medium ${themeClasses.text.secondary} mb-2 block`}
                    >
                      Default Theme
                    </label>
                    <select
                      value={customization.defaultTheme}
                      onChange={(e) =>
                        setCustomization((prev) => ({
                          ...prev,
                          defaultTheme: e.target.value,
                        }))
                      }
                      className={`w-full p-2 text-sm border rounded ${
                        isDark
                          ? "bg-gray-800 border-gray-700 text-white"
                          : "bg-white border-gray-300"
                      }`}
                      style={{ borderRadius: "6px" }}
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <Checkbox
                        checked={customization.allowThemeSwitch}
                        onCheckedChange={(checked) =>
                          setCustomization((prev) => ({
                            ...prev,
                            allowThemeSwitch: checked,
                          }))
                        }
                      />
                      <span
                        className={`text-sm ${themeClasses.text.secondary}`}
                      >
                        Allow theme switch
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Font */}
              <div>
                <h3
                  className={`text-lg font-semibold ${themeClasses.text.primary} mb-4`}
                >
                  Font
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      className={`text-sm font-medium ${themeClasses.text.secondary} mb-2 block`}
                    >
                      Base Font
                    </label>
                    <select
                      value={customization.baseFont}
                      onChange={(e) =>
                        setCustomization((prev) => ({
                          ...prev,
                          baseFont: e.target.value,
                        }))
                      }
                      className={`w-full p-2 text-sm border rounded ${
                        isDark
                          ? "bg-gray-800 border-gray-700 text-white"
                          : "bg-white border-gray-300"
                      }`}
                      style={{ borderRadius: "6px" }}
                    >
                      <option value="system-ui">System UI</option>
                      <option value="inter">Inter</option>
                      <option value="helvetica">Helvetica</option>
                      <option value="arial">Arial</option>
                    </select>
                  </div>
                  <div>
                    <label
                      className={`text-sm font-medium ${themeClasses.text.secondary} mb-2 block`}
                    >
                      Mono Font
                    </label>
                    <select
                      value={customization.monoFont}
                      onChange={(e) =>
                        setCustomization((prev) => ({
                          ...prev,
                          monoFont: e.target.value,
                        }))
                      }
                      className={`w-full p-2 text-sm border rounded ${
                        isDark
                          ? "bg-gray-800 border-gray-700 text-white"
                          : "bg-white border-gray-300"
                      }`}
                      style={{ borderRadius: "6px" }}
                    >
                      <option value="ui-monospace">UI Monospace</option>
                      <option value="monaco">Monaco</option>
                      <option value="consolas">Consolas</option>
                      <option value="courier">Courier</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div>
                <h3
                  className={`text-lg font-semibold ${themeClasses.text.primary} mb-4`}
                >
                  Features
                </h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={customization.enableTOC}
                      onCheckedChange={(checked) =>
                        setCustomization((prev) => ({
                          ...prev,
                          enableTOC: checked,
                        }))
                      }
                    />
                    <span className={`text-sm ${themeClasses.text.secondary}`}>
                      Enable Table of Contents
                    </span>
                  </label>

                  {/* <div className="grid grid-cols-2 gap-4">
                    {[
                      { key: "includeExamples", label: "Request Examples" },
                      { key: "includeAuth", label: "Authentication" },
                      {
                        key: "groupByCollection",
                        label: "Group by Collection",
                      },
                      { key: "includeErrorCodes", label: "Error Codes" },
                    ].map((option) => (
                      <label
                        key={option.key}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <Checkbox
                          checked={customization[option.key]}
                          onCheckedChange={(checked) =>
                            setCustomization((prev) => ({
                              ...prev,
                              [option.key]: checked,
                            }))
                          }
                        />
                        <span
                          className={`text-sm ${themeClasses.text.secondary}`}
                        >
                          {option.label}
                        </span>
                      </label>
                    ))}
                  </div> */}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div
            className="flex items-center justify-between pt-6 border-t"
            style={{
              borderColor: isDark ? "rgb(38, 38, 38)" : "rgb(235, 235, 235)",
            }}
          >
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className={`px-4 py-2 text-sm font-medium border ${
                isDark
                  ? "border-gray-700 text-gray-300 hover:bg-gray-800"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
              style={{
                borderRadius: "6px",
                borderColor: isDark ? "rgb(82, 82, 82)" : "rgb(235, 235, 235)",
                backgroundColor: isDark ? "transparent" : "#fafafa",
              }}
            >
              Cancel
            </Button>

            <Button
              onClick={handleGenerateDocs}
              disabled={!selectedCollection}
              className={`px-4 py-2 text-sm font-medium ${
                !selectedCollection ? "opacity-50 cursor-not-allowed" : ""
              }`}
              style={{
                borderRadius: "6px",
                backgroundColor: isDark ? "white" : "black",
                color: isDark ? "black" : "white",
                border: "none",
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
