"use client";

import {
  Plus,
  FolderOpen,
  Globe,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronDown,
  ChevronRight,
  Edit,
  Trash2,
  MoreHorizontal,
  GripVertical,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const CreateNew = ({
  themeClasses,
  isDark,
  createNewTab,
  setCreateCollectionDialogOpen,
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex flex-col items-center gap-1 cursor-pointer group p-1 transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800">
          <button
            className="w-10 h-10 transition-all duration-200 flex items-center justify-center cursor-pointer"
            style={{
              backgroundColor: isDark ? "white" : "#171717",
              border: "none",
              borderRadius: "50%"
            }}
            title="Add New..."
          >
            <Plus
              className={`h-4 w-4 ${isDark ? "text-gray-900" : "text-white"}`}
            />
          </button>
          <span
            className={`text-[10px] ${themeClasses.text.secondary} group-hover:${themeClasses.text.primary} transition-colors`}
          >
            Create New
          </span>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        side="right"
        className="w-48"
        style={{ borderRadius: "6px" }}
      >
        <DropdownMenuItem
          onClick={createNewTab}
          className="flex items-center gap-2"
        >
          <Globe className="h-4 w-4" />
          <span>HTTP Request</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => setCreateCollectionDialogOpen(true)}
          className="flex items-center gap-2"
        >
          <FolderOpen className="h-4 w-4" />
          <span>Collection</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default CreateNew;
