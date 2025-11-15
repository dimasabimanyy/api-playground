"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Download } from "lucide-react";

export default function ExportModal({
  open,
  onOpenChange,
  request,
}) {
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Export Request</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-center space-y-3">
            <div className="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <Download className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">Export as Postman Collection</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Download your current request as a Postman collection file that can be imported into Postman or other API tools.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Button onClick={handleExport} className="w-full" size="lg">
              <Download className="h-4 w-4 mr-2" />
              Download Collection
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)} 
              className="w-full"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}