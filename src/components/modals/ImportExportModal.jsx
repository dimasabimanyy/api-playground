"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Download, Upload } from "lucide-react";

export default function ImportExportModal({
  open,
  onOpenChange,
  request,
  createCollection,
  addRequestToCollection,
  setActiveCollectionId,
}) {
  const [importData, setImportData] = useState("");
  const [importError, setImportError] = useState("");

  const handleExport = () => {
    // Parse URL to extract components
    let urlParts = {
      protocol: "https",
      host: [],
      path: [],
      query: [],
    };
    if (request.url) {
      try {
        const url = new URL(request.url);
        urlParts.protocol = url.protocol.replace(":", "");
        urlParts.host = url.hostname.split(".");
        urlParts.path = url.pathname.split("/").filter((p) => p);

        // Extract query parameters
        url.searchParams.forEach((value, key) => {
          urlParts.query.push({ key, value });
        });
      } catch (e) {
        // Fallback for invalid URLs
        urlParts.host = ["localhost"];
        urlParts.path = [];
      }
    }

    const collection = {
      info: {
        _postman_id: crypto.randomUUID(),
        name: "API Playground Export",
        schema:
          "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
        _exporter_id: "api-playground",
      },
      item: [
        {
          name: request.name || "Untitled Request",
          request: {
            method: request.method || "GET",
            header: Object.entries(request.headers || {}).map(
              ([key, value]) => ({
                key,
                value,
                type: "text",
              })
            ),
            body: request.body
              ? {
                  mode: "raw",
                  raw: request.body,
                  options: {
                    raw: {
                      language: "json",
                    },
                  },
                }
              : undefined,
            url: {
              raw: request.url || "",
              protocol: urlParts.protocol,
              host: urlParts.host,
              path: urlParts.path,
              query: urlParts.query.length > 0 ? urlParts.query : undefined,
            },
          },
          response: [],
        },
      ],
    };

    const blob = new Blob([JSON.stringify(collection, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "postman-collection.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async () => {
    try {
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
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import/Export Collections</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Export Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Export Current Request</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Export your current request as a Postman collection
            </p>
            <Button onClick={handleExport} variant="outline" className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Export as Postman Collection
            </Button>
          </div>

          {/* Import Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Import Postman Collection</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Paste your Postman collection JSON or upload a file
            </p>

            {/* File Upload */}
            <div className="space-y-2">
              <input
                type="file"
                accept=".json"
                onChange={(e) => {
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
                }}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                style={{ borderRadius: "6px" }}
              />
            </div>

            {/* JSON Textarea */}
            <div className="space-y-2">
              <label className="text-xs font-medium">Or paste JSON:</label>
              <textarea
                value={importData}
                onChange={(e) => {
                  setImportData(e.target.value);
                  setImportError("");
                }}
                placeholder="Paste your Postman collection JSON here..."
                className="w-full h-32 p-3 text-sm border rounded-md font-mono resize-none"
              />
            </div>

            {importError && (
              <p className="text-xs text-red-600">{importError}</p>
            )}

            <Button
              onClick={handleImport}
              disabled={!importData.trim()}
              className="w-full"
            >
              <Upload className="h-4 w-4 mr-2" />
              Import Collection
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}