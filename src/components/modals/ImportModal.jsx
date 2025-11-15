"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Upload, FileUp } from "lucide-react";
import { useCollections } from "@/contexts/CollectionsContext";

export default function ImportModal({
  open,
  onOpenChange,
}) {
  const { createCollection, addRequestToCollection, setActiveCollectionId } = useCollections();
  const [importData, setImportData] = useState("");
  const [importError, setImportError] = useState("");
  const [isImporting, setIsImporting] = useState(false);

  const handleImport = async () => {
    try {
      setIsImporting(true);
      setImportError("");
      
      const collection = JSON.parse(importData);

      // Validate basic Postman collection structure
      if (!collection.info || !collection.item) {
        setImportError("Invalid Postman collection format");
        return;
      }

      // Create a new collection with imported name and description
      const collectionName = collection.info.name || "Imported Collection";
      const collectionDescription =
        collection.info.description || "Imported from Postman";

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

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
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
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import Postman Collection</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="text-center">
            <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-3">
              <Upload className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Upload a Postman collection JSON file or paste the JSON content below
            </p>
          </div>

          {/* File Upload */}
          <div className="space-y-3">
            <label className="block text-sm font-medium">Upload File</label>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-gray-400 dark:hover:border-gray-500 transition-colors">
              <FileUp className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <div className="space-y-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Choose a Postman collection file
                </p>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-semibold file:bg-gray-100 dark:file:bg-gray-700 file:text-gray-700 dark:file:text-gray-300 hover:file:bg-gray-200 dark:hover:file:bg-gray-600 file:rounded-md"
                />
              </div>
            </div>
          </div>

          {/* JSON Textarea */}
          <div className="space-y-3">
            <label className="block text-sm font-medium">Or paste JSON content</label>
            <textarea
              value={importData}
              onChange={(e) => {
                setImportData(e.target.value);
                setImportError("");
              }}
              placeholder="Paste your Postman collection JSON here..."
              className="w-full h-40 p-3 text-sm border rounded-md font-mono resize-none dark:bg-gray-800 dark:border-gray-600"
            />
          </div>

          {importError && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <p className="text-sm text-red-600 dark:text-red-400">{importError}</p>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              onClick={handleImport}
              disabled={!importData.trim() || isImporting}
              className="flex-1"
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
            
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isImporting}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}