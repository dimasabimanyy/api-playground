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

export default function CreateEnvironmentModal({
  open,
  onOpenChange,
  onCreateEnvironment,
}) {
  const [newEnvironmentName, setNewEnvironmentName] = useState("");
  const [newEnvironmentDescription, setNewEnvironmentDescription] = useState("");

  const handleCreate = () => {
    if (!newEnvironmentName.trim()) return;

    onCreateEnvironment({
      name: newEnvironmentName,
      description: newEnvironmentDescription,
    });

    // Reset form
    setNewEnvironmentName("");
    setNewEnvironmentDescription("");
    onOpenChange(false);
  };

  const handleClose = () => {
    setNewEnvironmentName("");
    setNewEnvironmentDescription("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-medium">
            Create Environment
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 pt-3">
          <div>
            <Input
              placeholder="Environment name"
              value={newEnvironmentName}
              onChange={(e) => setNewEnvironmentName(e.target.value)}
              className="h-8 text-sm border-gray-200 focus:border-gray-300 focus:ring-0"
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleCreate();
                }
              }}
            />
          </div>
          <div>
            <Input
              placeholder="Description (optional)"
              value={newEnvironmentDescription}
              onChange={(e) => setNewEnvironmentDescription(e.target.value)}
              className="h-8 text-sm border-gray-200 focus:border-gray-300 focus:ring-0"
            />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button
              variant="outline"
              onClick={handleClose}
              size="sm"
              className="px-3 text-xs"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              size="sm"
              className="px-3 text-xs"
              disabled={!newEnvironmentName.trim()}
            >
              Create
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}