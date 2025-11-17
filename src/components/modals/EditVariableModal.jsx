"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export default function EditVariableModal({
  open,
  onOpenChange,
  onEditVariable,
  environmentId,
  variableIndex,
  variable,
}) {
  const [newVariableKey, setNewVariableKey] = useState("");
  const [newVariableValue, setNewVariableValue] = useState("");
  const [newVariableDescription, setNewVariableDescription] = useState("");

  // Update state when variable prop changes
  useEffect(() => {
    if (variable) {
      setNewVariableKey(variable.key || "");
      setNewVariableValue(variable.value || "");
      setNewVariableDescription(variable.description || "");
    }
  }, [variable]);

  const handleSave = () => {
    if (
      !newVariableKey.trim() ||
      variableIndex === null ||
      !environmentId
    ) return;

    onEditVariable(environmentId, variableIndex, {
      key: newVariableKey,
      value: newVariableValue,
      description: newVariableDescription,
    });

    handleClose();
  };

  const handleClose = () => {
    setNewVariableKey("");
    setNewVariableValue("");
    setNewVariableDescription("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-medium">
            Edit Variable
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 pt-3">
          <div>
            <Input
              placeholder="Variable key (e.g., API_KEY)"
              value={newVariableKey}
              onChange={(e) => setNewVariableKey(e.target.value)}
              className="h-8 text-sm border-gray-200 focus:border-gray-300 focus:ring-0"
            />
          </div>
          <div>
            <Input
              placeholder="Variable value"
              value={newVariableValue}
              onChange={(e) => setNewVariableValue(e.target.value)}
              className="h-8 text-sm border-gray-200 focus:border-gray-300 focus:ring-0"
              type={
                newVariableKey.toLowerCase().includes("key") ||
                newVariableKey.toLowerCase().includes("token") ||
                newVariableKey.toLowerCase().includes("secret")
                  ? "password"
                  : "text"
              }
            />
          </div>
          <div>
            <Input
              placeholder="Description (optional)"
              value={newVariableDescription}
              onChange={(e) => setNewVariableDescription(e.target.value)}
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
              onClick={handleSave}
              size="sm"
              className="px-3 text-xs"
              disabled={!newVariableKey.trim()}
            >
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}