"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Plus,
  FileText,
  Calendar,
  Eye,
  Edit3,
  MoreVertical,
  Trash2,
  Copy,
  Search,
  Filter,
  Grid3X3,
  List,
  ArrowUpDown,
  Globe,
  Zap,
  Moon,
  Sun,
  FolderOpen,
  History,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { useCollections } from "@/contexts/CollectionsContext";
import { getThemeClasses } from "@/lib/theme";
import { DocsProjects, DocsMetadata } from "@/lib/docs-storage";
import DocGeneratorModal from "@/components/docs/DocGeneratorModal";
import SearchInput from "@/components/ui/SearchInput";
import DashboardHeader from "@/components/header/DashboardHeader";

// Project card component
const DocumentationProjectCard = ({
  project,
  collections,
  viewMode,
  onView,
  onEdit,
  onDuplicate,
  onDelete,
  isDark,
  themeClasses,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const router = useRouter();

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getCollectionCount = () => project.collections?.length || 0;
  const getEndpointCount = () => {
    if (!project.collections) return 0;

    // Calculate total endpoints from all collections in the project
    let totalEndpoints = 0;
    project.collections.forEach((collectionId) => {
      const collection = collections[collectionId];
      if (collection && collection.requests) {
        totalEndpoints += collection.requests.length;
      }
    });

    return totalEndpoints;
  };

  const handleCardClick = (e) => {
    // Don't navigate if clicking on menu button or menu items
    if (e.target.closest('.menu-container')) {
      e.stopPropagation();
      return;
    }
    router.push(`/docs/${project.id}`);
  };

  if (viewMode === "list") {
    return (
      <div
        onClick={handleCardClick}
        className={`group py-3 px-4 transition-all duration-200 border-b last:border-b-0 cursor-pointer ${
          isDark
            ? "border-gray-800 hover:bg-gray-800/30"
            : "border-gray-200 hover:bg-gray-50"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1 min-w-0 mr-4">
            {/* <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                isDark
                  ? "bg-gray-800 text-gray-300"
                  : "bg-gray-100 text-gray-600"
              }`}
              style={{ borderRadius: "8px" }}
            >
              <FileText className="w-4 h-4" />
            </div> */}

            <div className="flex-1 min-w-0">
              <h3
                className={`font-semibold ${themeClasses.text.primary} truncate mb-1 text-[.9rem]`}
              >
                {project.name}
              </h3>
              <p className={`text-sm ${themeClasses.text.secondary} truncate`}>
                {project.description || "No description"}
              </p>
            </div>

            <div className="hidden md:flex items-center gap-6">
              <div
                className={`flex items-center gap-4 text-xs ${themeClasses.text.tertiary}`}
              >
                <span className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-current opacity-50"></div>
                  {getCollectionCount()} collections
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-current opacity-50"></div>
                  {getEndpointCount()} endpoints
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 opacity-50" />
                  {formatDate(project.updated)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* <Button
              onClick={onView}
              className={`cursor-pointer text-xs leading-none h-6 w-12 ${
                isDark
                  ? "bg-white text-black hover:bg-gray-100"
                  : "bg-black text-white hover:bg-gray-800"
              }`}
              style={{ borderRadius: "6px", padding: ".1rem .1rem" }}
            >
              View
            </Button> */}

            <div className="relative menu-container">
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(!showMenu);
                }}
                size="sm"
                variant="ghost"
                className="cursor-pointer"
                style={{ borderRadius: "6px" }}
              >
                <MoreVertical className="w-4 h-4" />
              </Button>

              {showMenu && (
                <div
                  className={`absolute right-0 top-10 z-20 w-48 border rounded-xl shadow-xl ${
                    isDark
                      ? "border-gray-700 bg-gray-800"
                      : "border-gray-200 bg-white"
                  }`}
                  style={{ borderRadius: "12px" }}
                >
                  <div className="p-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit();
                        setShowMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm rounded-lg cursor-pointer hover:${
                        isDark ? "bg-gray-700" : "bg-gray-100"
                      } flex items-center gap-2 transition-colors`}
                    >
                      <Edit3 className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDuplicate();
                        setShowMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm rounded-lg cursor-pointer hover:${
                        isDark ? "bg-gray-700" : "bg-gray-100"
                      } flex items-center gap-2 transition-colors`}
                    >
                      <Copy className="w-4 h-4" />
                      Duplicate
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete();
                        setShowMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm rounded-lg cursor-pointer hover:bg-red-500/10 text-red-500 flex items-center gap-2 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <div
      onClick={handleCardClick}
      className={`group border rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-gray-200/20 cursor-pointer ${
        isDark
          ? "border-gray-800 bg-gray-900/50 hover:border-gray-700 hover:bg-gray-900"
          : "border-gray-200 bg-white hover:border-gray-300"
      }`}
      style={{ borderRadius: "6px" }}
    >
      <div className="p-6">
        {/* Header - Icon, Title, URL, Menu in same row */}
        <div className="flex items-center gap-3 mb-4">
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
              isDark ? "bg-gray-800 text-gray-300" : "bg-gray-100 text-gray-600"
            }`}
            style={{ borderRadius: "8px" }}
          >
            <FileText className="w-5 h-5" />
          </div>

          <div className="flex-1 min-w-0">
            <h3
              className={`text-base font-semibold ${themeClasses.text.primary} truncate`}
            >
              {project.name}
            </h3>
            <p className={`text-xs ${themeClasses.text.tertiary} truncate`}>
              docs.example.com/{project.name.toLowerCase().replace(/\s+/g, "-")}
            </p>
          </div>

          <div className="relative menu-container">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className={`p-2 rounded-lg transition-colors cursor-pointer opacity-0 group-hover:opacity-100 hover:${
                isDark ? "bg-gray-800" : "bg-gray-100"
              }`}
              style={{ borderRadius: "6px" }}
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <div
                className={`absolute right-0 top-10 z-20 w-48 border rounded-xl shadow-xl ${
                  isDark
                    ? "border-gray-700 bg-gray-800"
                    : "border-gray-200 bg-white"
                }`}
                style={{ borderRadius: "12px" }}
              >
                <div className="p-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit();
                      setShowMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-sm rounded-lg cursor-pointer hover:${
                      isDark ? "bg-gray-700" : "bg-gray-100"
                    } flex items-center gap-2 transition-colors`}
                  >
                    <Edit3 className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDuplicate();
                      setShowMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-sm rounded-lg cursor-pointer hover:${
                      isDark ? "bg-gray-700" : "bg-gray-100"
                    } flex items-center gap-2 transition-colors`}
                  >
                    <Copy className="w-4 h-4" />
                    Duplicate
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete();
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm rounded-lg cursor-pointer hover:bg-red-500/10 text-red-500 flex items-center gap-2 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="mb-4">
          <p
            className={`text-sm ${themeClasses.text.secondary} line-clamp-2 leading-relaxed`}
          >
            {project.description || "No description provided"}
          </p>
        </div>

        {/* Stats */}
        <div
          className={`flex items-center gap-4 mb-6 text-xs ${themeClasses.text.tertiary}`}
        >
          <span className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-current opacity-50"></div>
            {getCollectionCount()} collections
          </span>
          <span className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-current opacity-50"></div>
            {getEndpointCount()} endpoints
          </span>
          <span className="flex items-center gap-1 ml-auto">
            <Calendar className="w-3 h-3 opacity-50" />
            {formatDate(project.updated)}
          </span>
        </div>

        {/* Click hint */}
        <div className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
          Click to manage documentation
        </div>
      </div>
    </div>
  );
};

export default DocumentationProjectCard;
