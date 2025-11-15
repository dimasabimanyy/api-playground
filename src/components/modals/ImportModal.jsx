"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Upload, FileText, CheckCircle, AlertCircle } from "lucide-react";
import { useCollections } from "@/contexts/CollectionsContext";

export default function ImportModal({
  open,
  onOpenChange,
}) {
  const { createCollection, addRequestToCollection, setActiveCollectionId } = useCollections();
  const [importData, setImportData] = useState("");
  const [importError, setImportError] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleImport = async () => {
    try {
      setIsImporting(true);
      setImportError("");
      
      const collection = JSON.parse(importData);

      // Auto-detect collection format
      let collectionName = "Imported Collection";
      let collectionDescription = "Imported collection";
      let items = [];

      if (collection.info && collection.item) {
        // Postman collection format
        collectionName = collection.info.name || "Postman Collection";
        collectionDescription = collection.info.description || "Imported from Postman";
        items = collection.item;
      } else if (collection.name && collection.requests) {
        // Custom format with name and requests array
        collectionName = collection.name;
        collectionDescription = collection.description || "Imported collection";
        items = collection.requests;
      } else if (Array.isArray(collection)) {
        // Array of requests
        collectionName = "Imported Requests";
        collectionDescription = "Collection of imported requests";
        items = collection;
      } else if (collection.request || collection.url) {
        // Single request object
        collectionName = collection.name || "Single Request";
        collectionDescription = "Imported single request";
        items = [collection];
      } else {
        setImportError("Unsupported collection format. Please use Postman collections, request arrays, or single requests.");
        return;
      }

      const newCollection = await createCollection(
        collectionName,
        collectionDescription,
        "blue"
      );

      // Function to parse Postman request into our format
      const parseRequest = (postmanItem) => {
        if (!postmanItem.request) return null;

        const request = postmanItem.request;

        // Convert headers (V2.1 format)
        const headers = {};
        if (request.header && Array.isArray(request.header)) {
          request.header.forEach((h) => {
            if (h.key && h.value && h.type !== "disabled") {
              headers[h.key] = h.value;
            }
          });
        }

        // Build URL from V2.1 format
        let fullUrl = "";
        if (typeof request.url === "string") {
          fullUrl = request.url;
        } else if (request.url && typeof request.url === "object") {
          // Handle V2.1 URL object format
          if (request.url.raw) {
            fullUrl = request.url.raw;
          } else {
            // Construct URL from parts
            const protocol = request.url.protocol || "https";
            const host = Array.isArray(request.url.host)
              ? request.url.host.join(".")
              : request.url.host || "";
            const path = Array.isArray(request.url.path)
              ? "/" + request.url.path.join("/")
              : request.url.path || "";

            fullUrl = `${protocol}://${host}${path}`;

            // Add query parameters
            if (request.url.query && Array.isArray(request.url.query)) {
              const queryParams = request.url.query
                .filter((q) => q.key && q.value && !q.disabled)
                .map(
                  (q) =>
                    `${encodeURIComponent(q.key)}=${encodeURIComponent(
                      q.value
                    )}`
                )
                .join("&");

              if (queryParams) {
                fullUrl += "?" + queryParams;
              }
            }
          }
        }

        // Extract body content
        let bodyContent = "";
        if (request.body) {
          if (request.body.mode === "raw" && request.body.raw) {
            bodyContent = request.body.raw;
          } else if (
            request.body.mode === "formdata" &&
            request.body.formdata
          ) {
            // Convert form data to JSON representation
            const formObj = {};
            request.body.formdata.forEach((item) => {
              if (item.key && item.value && item.type !== "file") {
                formObj[item.key] = item.value;
              }
            });
            bodyContent = JSON.stringify(formObj, null, 2);
          } else if (
            request.body.mode === "urlencoded" &&
            request.body.urlencoded
          ) {
            // Convert URL encoded to JSON representation
            const urlEncodedObj = {};
            request.body.urlencoded.forEach((item) => {
              if (item.key && item.value) {
                urlEncodedObj[item.key] = item.value;
              }
            });
            bodyContent = JSON.stringify(urlEncodedObj, null, 2);
          }
        }

        return {
          name: postmanItem.name || "Untitled Request",
          method: request.method || "GET",
          url: fullUrl,
          headers,
          body: bodyContent,
          description: postmanItem.description || "",
        };
      };

      // Process all items in the collection (including nested folders)
      const processItems = async (items, collectionId) => {
        for (const item of items) {
          if (item.item && Array.isArray(item.item)) {
            // This is a folder, process its items recursively
            await processItems(item.item, collectionId);
          } else if (item.request) {
            // This is a request, parse and add it
            const parsedRequest = parseRequest(item);
            if (parsedRequest) {
              await addRequestToCollection(collectionId, parsedRequest);
            }
          }
        }
      };

      // Process all items in the collection
      await processItems(collection.item, newCollection.id);

      // Set the imported collection as active
      setActiveCollectionId(newCollection.id);

      // Close modal and reset state
      onOpenChange(false);
      setImportData("");
      setImportError("");

      // Show success message
      console.log(
        `Successfully imported collection: ${collectionName} with ${collection.item.length} items`
      );
    } catch (error) {
      console.error("Import error:", error);
      setImportError("Failed to import collection: " + error.message);
    } finally {
      setIsImporting(false);
    }
  };

  const handleFileUpload = (file) => {
    if (file && file.type === "application/json") {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const content = event.target?.result;
          setImportData(content);
          setImportError("");
        } catch (error) {
          setImportError("Error reading file");
        }
      };
      reader.readAsText(file);
    } else {
      setImportError("Please upload a valid JSON file");
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragIn = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragOut = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl sm:max-w-2xl md:max-w-2xl lg:max-w-2xl xl:max-w-2xl border border-gray-200 dark:border-gray-800 shadow-lg max-h-[90vh] overflow-y-auto" 
        style={{ 
          borderRadius: '12px',
          borderColor: 'rgb(235, 235, 235)'
        }}>
        <DialogHeader className="space-y-3 pb-3">
          <DialogTitle className="text-2xl font-bold mb-0 text-gray-900 dark:text-white">
            Import Collection
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-8">
            {/* Drag and Drop Area */}
            <div
              className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
                dragActive
                  ? "border-blue-400 bg-blue-50 dark:bg-blue-950 dark:border-blue-500"
                  : importData
                  ? "border-green-300 bg-green-50 dark:bg-green-950 dark:border-green-600"
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
              onDragEnter={handleDragIn}
              onDragLeave={handleDragOut}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {importData ? (
                <div className="space-y-3">
                  <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400 mx-auto" />
                  <div>
                    <p className="text-sm font-medium text-green-700 dark:text-green-300">
                      JSON loaded successfully
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400">
                      Ready to import collection
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-full w-fit mx-auto">
                    <FileText className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                      Drop your JSON file here
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      or click to browse files
                    </p>
                  </div>
                </div>
              )}

              <input
                type="file"
                accept=".json,application/json"
                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>

            {/* Supported Formats */}
            {!importData && (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Supported formats:
                </p>
                <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                  <div>• Postman Collections (v2.1)</div>
                  <div>• Request Arrays</div>
                  <div>• Single Requests</div>
                  <div>• Custom JSON formats</div>
                </div>
              </div>
            )}

            {/* Paste Area */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
                <span className="text-xs text-gray-500 dark:text-gray-400 px-3 bg-white dark:bg-gray-900">
                  or paste JSON
                </span>
                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
              </div>

              <textarea
                value={importData}
                onChange={(e) => {
                  setImportData(e.target.value);
                  setImportError("");
                }}
                placeholder='{"name": "My Collection", "requests": [...]}'
                className="w-full h-24 px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-md font-mono resize-none bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Error Display */}
            {importError && (
              <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-md">
                <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-700 dark:text-red-300">{importError}</p>
              </div>
            )}

        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-6 border-t" style={{ borderColor: 'rgb(235, 235, 235)' }}>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isImporting}
            className="px-4 py-2 text-sm font-medium border text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
            style={{ 
              borderRadius: '6px',
              borderColor: 'rgb(235, 235, 235)',
              backgroundColor: '#fafafa'
            }}
          >
            Cancel
          </Button>
          
          <Button
            onClick={handleImport}
            disabled={!importData.trim() || isImporting}
            className={`px-4 py-2 text-sm font-medium ${!importData.trim() || isImporting ? 'opacity-50 cursor-not-allowed' : ''}`}
            style={{ 
              borderRadius: '6px',
              backgroundColor: 'black',
              color: 'white',
              border: 'none'
            }}
          >
            {isImporting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Importing...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Import Collection
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}