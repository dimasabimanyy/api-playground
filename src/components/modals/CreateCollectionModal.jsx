"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

export default function CreateCollectionModal({
  open,
  onOpenChange,
  onCreateCollection,
}) {
  const [newCollectionName, setNewCollectionName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!newCollectionName.trim() || isCreating) return;

    setIsCreating(true);
    try {
      await onCreateCollection(newCollectionName);
      setNewCollectionName("");
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to create collection:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    setNewCollectionName("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-medium">
            Create Collection
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 pt-3">
          <div>
            <Input
              placeholder="Collection name"
              value={newCollectionName}
              onChange={(e) => setNewCollectionName(e.target.value)}
              className="h-8 text-sm border-gray-200 focus:border-gray-300 focus:ring-0"
              disabled={isCreating}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleCreate();
                }
              }}
            />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button
              variant="outline"
              onClick={handleClose}
              size="sm"
              className="px-3 text-xs"
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!newCollectionName.trim() || isCreating}
              size="sm"
              className="px-3 text-xs bg-black hover:bg-gray-800 text-white"
            >
              {isCreating ? (
                <>
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}