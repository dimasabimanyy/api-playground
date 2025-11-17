"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FolderOpen } from "lucide-react";

export default function SaveToCollectionModal({
  open,
  onOpenChange,
  collections,
  onSaveToCollection,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-medium">
            Save Request
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-3">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Choose a collection to save this request to:
            </p>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {Object.values(collections).map((collection) => (
                <button
                  key={collection.id}
                  onClick={() => onSaveToCollection(collection.id)}
                  className="w-full text-left p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                      <FolderOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {collection.name}
                      </div>
                      {collection.description && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {collection.description}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              size="sm"
              className="px-3 text-xs"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}