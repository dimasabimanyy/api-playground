"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Settings,
  Eye,
  ExternalLink,
  Users,
  Activity,
  FileText,
  GitBranch,
  Share2,
  RefreshCw,
  CheckCircle,
  Clock,
  AlertCircle,
  BarChart3,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { useCollections } from "@/contexts/CollectionsContext";
import { getThemeClasses } from "@/lib/theme";
import ApiClient from "@/lib/api-client";
import {
  generateUsername,
  generatePublicDocUrl,
  generateProjectSlug,
} from "@/lib/user-utils";

const ActivityItem = ({
  icon: Icon,
  title,
  description,
  time,
  status,
  isDark,
  themeClasses,
}) => (
  <div className="flex items-start gap-3 py-3">
    <div
      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
        status === "success"
          ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
          : status === "warning"
          ? "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400"
          : status === "error"
          ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
          : isDark
          ? "bg-gray-800 text-gray-300"
          : "bg-gray-100 text-gray-600"
      }`}
    >
      <Icon className="w-4 h-4" />
    </div>
    <div className="flex-1 min-w-0">
      <div className={`text-sm font-medium ${themeClasses.text.bold}`}>
        {title}
      </div>
      <div className={`text-xs ${themeClasses.text.secondary} mt-1`}>
        {description}
      </div>
      <div className={`text-xs ${themeClasses.text.tertiary} mt-1`}>{time}</div>
    </div>
  </div>
);

export default function DocDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isDark } = useTheme();
  const { user } = useAuth();
  const { collections, getCollectionsWithDocs } = useCollections();
  const themeClasses = getThemeClasses(isDark);

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [showMenu, setShowMenu] = useState(false);

  // Helper function to handle async project updates
  const updateProject = async (updates) => {
    try {
      const updatedProject = {
        ...project,
        ...updates,
        updated_at: new Date().toISOString(),
      };
      setProject(updatedProject);
      await ApiClient.docsProjects.update(project.id, updatedProject);
    } catch (error) {
      console.error("Failed to update project:", error);
      // Revert optimistic update on error
      setProject(project);
    }
  };

  const loadProject = async () => {
    try {
      const response = await ApiClient.docsProjects.getById(params.id);

      console.log("kratos response: ", response);
      if (response.project) {
        setProject(response.project);
      }
      // Handle failed fetching
      //  else {
      //   router.push("/docs");
      // }
    } catch (error) {
      console.error("Failed to load project:", error);
      // router.push("/docs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params.id) {
      loadProject();
    }
  }, [params.id]);

  const generatePublicUrl = () => {
    if (!project || !user) return "";
    const username = generateUsername(user);
    return generatePublicDocUrl(username, project.name);
  };

  const copyPublicUrl = async () => {
    try {
      await navigator.clipboard.writeText(generatePublicUrl());
      // TODO: Add toast notification
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const deleteProject = () => {
    if (
      confirm(
        `Are you sure you want to delete "${project.name}"? This action cannot be undone.`
      )
    ) {
      ApiClient.docsProjects.delete(project.id);
      router.push("/docs");
    }
  };

  const duplicateProject = async () => {
    try {
      const duplicateData = {
        name: `${project.name} Copy`,
        description: project.description,
        collection_id: project.collection_id,
        settings: project.settings,
        status: project.status,
      };

      const response = await ApiClient.docsProjects.create(duplicateData);
      if (response.project) {
        router.push(`/docs/${response.project.id}`);
      }
    } catch (error) {
      console.error("Failed to duplicate project:", error);
    }
  };

  if (loading) {
    return (
      <div
        className={`min-h-screen ${themeClasses.bg.bold} flex items-center justify-center`}
      >
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4 border-gray-300"></div>
          <p className={themeClasses.text.secondary}>Loading project...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div
        className={`min-h-screen ${themeClasses.bg.bold} flex items-center justify-center`}
      >
        <div className="text-center">
          <h1
            className={`text-xl font-semibold ${themeClasses.text.bold} mb-2`}
          >
            Project not found
          </h1>
          <Link
            href="/docs"
            className={`text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300`}
          >
            Back to Documentation
          </Link>
        </div>
      </div>
    );
  }

  // const getCollectionCount = () => project.collections?.length || 0;

  const getEndpointCount = () => {
    if (!project.collections) return 0;

    // Use client counting because requests is smaller and already fetched inside the project fetch
    const totalEndpoints = project.collections.requests.length || 0;

    return totalEndpoints;
  };

  const recentActivity = [
    {
      icon: RefreshCw,
      title: "Documentation updated",
      description: "Collections synced and regenerated",
      time: "2 hours ago",
      status: "success",
    },
    {
      icon: Eye,
      title: "Public view accessed",
      description: "Documentation viewed 15 times",
      time: "5 hours ago",
      status: "info",
    },
    {
      icon: GitBranch,
      title: "Collections modified",
      description: "3 endpoints added to User Management",
      time: "1 day ago",
      status: "success",
    },
    {
      icon: Share2,
      title: "Documentation shared",
      description: "Public link copied to clipboard",
      time: "2 days ago",
      status: "info",
    },
  ];

  const projectUpdatedAt = new Date(project.updated_at);
  const collectionUpdatedAt = new Date(project.collections.updated_at);

  const latestDate =
    projectUpdatedAt > collectionUpdatedAt
      ? projectUpdatedAt
      : collectionUpdatedAt;

  return (
    <div className={`min-h-screen ${themeClasses.bg.bold}`}>
      {/* Header */}
      <div
        className={`border-b ${themeClasses.border.primary} ${themeClasses.bg.bold} pt-6`}
      >
        <div className="max-w-7xl mx-auto px-6 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <h1
                  className={`text-[1.6rem] font-bold tracking-tight ${themeClasses.text.bold}`}
                >
                  {project.name}
                </h1>
                {/* <p className={`text-sm ${themeClasses.text.tertiary}`}>
                  {generatePublicUrl()
                    ? generatePublicUrl()
                        .replace("https://", "")
                        .replace("http://", "")
                    : "Public URL will be available once published"}
                </p> */}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* <Button
                onClick={copyPublicUrl}
                variant="outline"
                size="sm"
                className={`${themeClasses.button.outline}`}
                disabled={!generatePublicUrl()}
                style={{
                  borderRadius: "6px",
                }}
              >
                Copy URL
              </Button> */}
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-6 mt-5">
            {[
              { id: "overview", label: "Overview", icon: BarChart3 },
              { id: "settings", label: "Settings", icon: Settings },
              { id: "analytics", label: "Analytics", icon: Activity },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`cursor-pointer flex items-center gap-2 px-1 py-2 text-sm font-normal transition-colors border-b-2 ${
                  activeTab === id
                    ? `${themeClasses.text.bold} border-black dark:border-white`
                    : `${themeClasses.text.secondary} border-transparent hover:${themeClasses.text.bold}`
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className={`max-w-7xl mx-auto px-6 py-8 ${themeClasses.bg.bold}`}>
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Production Deployment - Vercel Style */}
            <div>
              <div className="mb-5 flex justify-between items-center">
                <h2
                  className={`font-semibold tracking-tight text-[1.3rem] ${themeClasses.text.bold}`}
                >
                  Production Deployment
                </h2>

                <div className="flex gap-3">
                  <Button
                    // onClick={viewDocumentation}
                    variant="outline"
                    size="sm"
                    className={`${themeClasses.button.secondary} px-4 h-9`}
                  >
                    Open in Playground
                  </Button>
                  <Button
                    onClick={() => window.open(generatePublicUrl(), "_blank")}
                    className={`${themeClasses.button.fill} px-4 h-9`}
                    size="sm"
                    disabled={!generatePublicUrl()}
                  >
                    Visit
                  </Button>
                </div>
              </div>
              <div
                className={`border rounded-xl overflow-hidden ${
                  isDark
                    ? "border-gray-800 bg-gray-900/50"
                    : "border-gray-200 bg-white"
                }`}
              >
                <div className="p-6">
                  <div className="flex gap-8">
                    {/* Left side - Preview (40% width) */}
                    <div className="w-2/5 space-y-4">
                      <div
                        className={`border rounded-lg overflow-hidden ${
                          isDark ? "border-gray-700" : "border-gray-200"
                        }`}
                      >
                        <div
                          className={`h-4 flex items-center gap-1 px-3 ${
                            isDark ? "bg-gray-800" : "bg-gray-100"
                          }`}
                        >
                          <div className="flex gap-1">
                            <div className="w-2 h-2 rounded-full bg-red-400"></div>
                            <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                            <div className="w-2 h-2 rounded-full bg-green-400"></div>
                          </div>
                          <div
                            className={`text-xs ml-3 ${themeClasses.text.tertiary} font-mono truncate`}
                          >
                            {generatePublicUrl()
                              ? generatePublicUrl().replace(/^https?:\/\//, "")
                              : "your-docs.com"}
                          </div>
                        </div>
                        <div
                          className={`aspect-video ${
                            isDark ? "bg-gray-900" : "bg-gray-50"
                          } flex items-center justify-center relative overflow-hidden`}
                        >
                          {/* Placeholder preview content */}
                          <div className="w-full h-full p-4">
                            <div className="w-full h-full rounded border border-dashed border-gray-300 dark:border-gray-700 flex flex-col items-center justify-center">
                              <div
                                className={`w-12 h-12 rounded-lg flex items-center justify-center mb-3 ${
                                  isDark
                                    ? "bg-gray-800 text-gray-400"
                                    : "bg-gray-200 text-gray-500"
                                }`}
                              >
                                <FileText className="w-6 h-6" />
                              </div>
                              <div
                                className={`text-sm font-medium ${themeClasses.text.bold} mb-1`}
                              >
                                {project.name}
                              </div>
                              <div
                                className={`text-xs ${themeClasses.text.secondary} text-center px-2`}
                              >
                                API Documentation
                              </div>
                              <div className="flex gap-1 mt-3">
                                <div
                                  className={`w-16 h-2 rounded ${
                                    isDark ? "bg-gray-700" : "bg-gray-200"
                                  }`}
                                ></div>
                                <div
                                  className={`w-12 h-2 rounded ${
                                    isDark ? "bg-gray-700" : "bg-gray-200"
                                  }`}
                                ></div>
                                <div
                                  className={`w-8 h-2 rounded ${
                                    isDark ? "bg-gray-700" : "bg-gray-200"
                                  }`}
                                ></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      {/* <button
                        onClick={() =>
                          window.open(generatePublicUrl(), "_blank")
                        }
                        disabled={!generatePublicUrl()}
                        className={`w-full text-xs py-2 px-3 rounded transition-colors ${
                          generatePublicUrl()
                            ? isDark
                              ? "bg-gray-800 hover:bg-gray-700 text-gray-300"
                              : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                            : isDark
                            ? "bg-gray-800 text-gray-600 cursor-not-allowed"
                            : "bg-gray-100 text-gray-400 cursor-not-allowed"
                        }`}
                      >
                        {generatePublicUrl()
                          ? "Open Preview"
                          : "Preview not available"}
                      </button> */}
                    </div>

                    {/* Right side - Details (60% width) */}
                    <div className="flex-1">
                      {/* Deployment Details */}
                      <div>
                        <div className="mb-4">
                          <span
                            className={`text-sm  mb-2 ${themeClasses.text.secondary}`}
                          >
                            Domain
                          </span>
                          <div
                            className={`flex gap-3 text-sm font-medium ${themeClasses.text.bold}`}
                          >
                            <div>
                              {generatePublicUrl()
                                ? generatePublicUrl().replace(
                                    /^https?:\/\//,
                                    ""
                                  )
                                : "Not assigned"}
                            </div>
                            <ExternalLink
                              className={`w-4 h-4 ${themeClasses.text.tertiary}`}
                            />
                          </div>
                        </div>

                        <div className="mb-4">
                          <span
                            className={`text-sm  mb-2 ${themeClasses.text.secondary}`}
                          >
                            Status
                          </span>
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                            <span
                              className={`text-sm font-medium ${themeClasses.text.bold}`}
                            >
                              Ready
                            </span>
                          </div>
                        </div>

                        <div className="mb-3 flex gap-8">
                          <div>
                            <div
                              className={`text-sm  mb-2 ${themeClasses.text.secondary}`}
                            >
                              Template
                            </div>
                            <div
                              className={`text-sm font-medium ${themeClasses.text.bold} capitalize`}
                            >
                              {project.template || "Default"}
                            </div>
                          </div>
                          <div>
                            <div
                              className={`text-sm  mb-2 ${themeClasses.text.secondary}`}
                            >
                              Endpoints
                            </div>
                            <div
                              className={`text-sm font-medium ${themeClasses.text.bold}`}
                            >
                              {getEndpointCount()}
                            </div>
                          </div>
                        </div>
                        <div className="mb-4">
                          <div
                            className={`text-sm mb-2 ${themeClasses.text.secondary}`}
                          >
                            Last Updated
                          </div>
                          <div
                            className={`text-sm font-medium ${themeClasses.text.bold}`}
                          >
                            {new Date(latestDate).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Build Settings */}
                      {/* <div>
                        <h4
                          className={`text-sm font-semibold ${themeClasses.text.bold} mb-3`}
                        >
                          Configuration
                        </h4>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between py-2">
                            <span
                              className={`text-sm ${themeClasses.text.secondary}`}
                            >
                              Public Access
                            </span>
                            <span
                              className={`text-sm ${
                                project.settings?.isPublic !== false
                                  ? "text-green-600 dark:text-green-400"
                                  : "text-yellow-600 dark:text-yellow-400"
                              }`}
                            >
                              {project.settings?.isPublic !== false
                                ? "Enabled"
                                : "Disabled"}
                            </span>
                          </div>

                          <div className="flex items-center justify-between py-2">
                            <span
                              className={`text-sm ${themeClasses.text.secondary}`}
                            >
                              Code Examples
                            </span>
                            <span
                              className={`text-sm ${themeClasses.text.bold}`}
                            >
                              {project.settings?.showExamples !== false
                                ? "Enabled"
                                : "Disabled"}
                            </span>
                          </div>

                          <div className="flex items-center justify-between py-2">
                            <span
                              className={`text-sm ${themeClasses.text.secondary}`}
                            >
                              Group by Collection
                            </span>
                            <span
                              className={`text-sm ${themeClasses.text.bold}`}
                            >
                              {project.settings?.groupByCollection !== false
                                ? "Enabled"
                                : "Disabled"}
                            </span>
                          </div>
                        </div>
                      </div> */}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              {/* Content & Display Section */}
              <div>
                <div className="mb-5 flex justify-between items-center">
                  <div>
                    <h2
                      className={`font-semibold tracking-tight text-[1.3rem] ${themeClasses.text.bold}`}
                    >
                      Documentation Template
                    </h2>

                    <p className={`text-sm ${themeClasses.text.secondary}`}>
                      Choose your template and customize its appearance
                    </p>
                  </div>
                </div>
                {/* Template & Styling Options - Combined Card */}
                <div
                  className={`border rounded-xl p-6 ${
                    isDark
                      ? "border-gray-800 bg-gray-900/50"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  {/* Template Selection */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Template Options */}
                    <div className="space-y-3">
                      {[
                        {
                          id: "stripe-style",
                          name: "Template A - Minimalist",
                          description:
                            "Stripe/Mintlify-style with left sidebar, wide reading column, and beautiful code blocks",
                          // preview: "Premium Documentation",
                          isSelected:
                            !project.template ||
                            project.template === "default" ||
                            project.template === "stripe-style",
                        },
                      ].map((template) => (
                        <div
                          key={template.id}
                          onClick={() => {
                            updateProject({
                              template: template.id,
                            });
                          }}
                          className={`cursor-pointer border rounded-lg p-4 transition-all duration-200 ${
                            template.isSelected
                              ? isDark
                                ? "border-blue-600 bg-blue-900/20"
                                : "border-blue-500 bg-blue-50"
                              : isDark
                              ? "border-gray-700 bg-gray-800/30 hover:border-gray-600"
                              : "border-gray-200 bg-white hover:border-gray-300"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h5
                              className={`font-medium ${themeClasses.text.bold}`}
                            >
                              {template.name}
                            </h5>
                            {template.isSelected && (
                              <CheckCircle className="w-4 h-4 text-blue-500" />
                            )}
                          </div>
                          <p
                            className={`text-xs ${themeClasses.text.secondary}`}
                          >
                            {template.description}
                          </p>
                          {/* <div
                              className={`text-xs px-2 py-1 rounded ${
                                isDark
                                  ? "bg-gray-700 text-gray-300"
                                  : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {template.preview}
                            </div> */}
                        </div>
                      ))}
                    </div>

                    {/* Template Preview */}
                    <div className="hidden lg:block">
                      <div
                        className={`border rounded-lg overflow-hidden ${
                          isDark
                            ? "border-gray-700 bg-gray-800"
                            : "border-gray-200 bg-gray-50"
                        }`}
                      >
                        {/* Placeholder for template preview image */}
                        <div
                          className={`aspect-[4/3] flex items-center justify-center ${
                            isDark
                              ? "bg-gray-800 text-gray-500"
                              : "bg-gray-100 text-gray-400"
                          }`}
                        >
                          <div className="text-center">
                            <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p className="text-xs">Template Preview</p>
                            <p className="text-xs opacity-75">
                              Image coming soon
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5 items-start">
              {/* Column 1: Theme Colors */}
              <div
                className={`border rounded-xl p-6 ${
                  isDark
                    ? "border-gray-800 bg-gray-900/50"
                    : "border-gray-200 bg-white"
                }`}
              >
                <h3 className={`font-semibold ${themeClasses.text.bold} mb-4`}>
                  Theme Colors
                </h3>

                <div className="space-y-6">
                  {/* Primary Color */}
                  <div>
                    <label
                      className={`block text-sm font-medium ${themeClasses.text.bold} mb-2`}
                    >
                      Primary Color
                    </label>
                    <p
                      className={`text-xs ${themeClasses.text.secondary} mb-3`}
                    >
                      Main brand color for buttons and links
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center">
                        <input
                          type="color"
                          value={
                            project.settings?.displayOptions?.primaryColor ||
                            "#171717"
                          }
                          onChange={(e) => {
                            updateProject({
                              settings: {
                                ...project.settings,
                                displayOptions: {
                                  ...project.settings?.displayOptions,
                                  primaryColor: e.target.value,
                                },
                              },
                            });
                          }}
                          className="w-12 h-9.5 rounded-md cursor-pointer"
                          style={{
                            backgroundColor:
                              project.settings?.displayOptions?.primaryColor ||
                              "#171717",
                          }}
                        />
                      </div>
                      <input
                        type="text"
                        value={
                          project.settings?.displayOptions?.primaryColor ||
                          "#171717"
                        }
                        onChange={(e) => {
                          updateProject({
                            settings: {
                              ...project.settings,
                              displayOptions: {
                                ...project.settings?.displayOptions,
                                primaryColor: e.target.value,
                              },
                            },
                          });
                        }}
                        className={`flex-1 px-3 py-2 text-sm border rounded-lg ${
                          isDark
                            ? "border-gray-700 bg-gray-800 text-white"
                            : "border-gray-300 bg-white text-gray-900"
                        }`}
                        placeholder="#171717"
                      />
                    </div>
                    <div className="flex gap-1.5 mt-3">
                      {[
                        { name: "Default", color: "#171717" },
                        { name: "Blue", color: "#3b82f6" },
                        { name: "Green", color: "#10b981" },
                        { name: "Purple", color: "#8b5cf6" },
                        { name: "Red", color: "#ef4444" },
                        { name: "Orange", color: "#f97316" },
                      ].map((preset) => (
                        <button
                          key={preset.color}
                          onClick={() => {
                            updateProject({
                              settings: {
                                ...project.settings,
                                displayOptions: {
                                  ...project.settings?.displayOptions,
                                  primaryColor: preset.color,
                                },
                              },
                            });
                          }}
                          className="w-7 h-7 rounded-md hover:scale-110 transition-all shadow-sm"
                          style={{ backgroundColor: preset.color }}
                          title={preset.name}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Secondary Color */}
                  <div>
                    <label
                      className={`block text-sm font-medium ${themeClasses.text.bold} mb-2`}
                    >
                      Secondary Color
                    </label>
                    <p
                      className={`text-xs ${themeClasses.text.secondary} mb-3`}
                    >
                      Used for hover states and accents
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center">
                        <input
                          type="color"
                          value={
                            project.settings?.displayOptions?.secondaryColor ||
                            "#6b7280"
                          }
                          onChange={(e) => {
                            updateProject({
                              settings: {
                                ...project.settings,
                                displayOptions: {
                                  ...project.settings?.displayOptions,
                                  secondaryColor: e.target.value,
                                },
                              },
                            });
                          }}
                          className="w-12 h-9.5 rounded-md cursor-pointer"
                          style={{
                            backgroundColor:
                              project.settings?.displayOptions
                                ?.secondaryColor || "#6b7280",
                          }}
                        />
                      </div>
                      <input
                        type="text"
                        value={
                          project.settings?.displayOptions?.secondaryColor ||
                          "#6b7280"
                        }
                        onChange={(e) => {
                          updateProject({
                            settings: {
                              ...project.settings,
                              displayOptions: {
                                ...project.settings?.displayOptions,
                                secondaryColor: e.target.value,
                              },
                            },
                          });
                        }}
                        className={`flex-1 px-3 py-2 text-sm border rounded-lg ${
                          isDark
                            ? "border-gray-700 bg-gray-800 text-white"
                            : "border-gray-300 bg-white text-gray-900"
                        }`}
                        placeholder="#6b7280"
                      />
                    </div>
                  </div>

                  {/* Accent Color */}
                  <div>
                    <label
                      className={`block text-sm font-medium ${themeClasses.text.bold} mb-2`}
                    >
                      Accent Color
                    </label>
                    <p
                      className={`text-xs ${themeClasses.text.secondary} mb-3`}
                    >
                      For highlighting and special elements
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center">
                        <input
                          type="color"
                          value={
                            project.settings?.displayOptions?.accentColor ||
                            "#3b82f6"
                          }
                          onChange={(e) => {
                            updateProject({
                              settings: {
                                ...project.settings,
                                displayOptions: {
                                  ...project.settings?.displayOptions,
                                  accentColor: e.target.value,
                                },
                              },
                            });
                          }}
                          className="w-12 h-9.5 rounded-md cursor-pointer"
                          style={{
                            backgroundColor:
                              project.settings?.displayOptions?.accentColor ||
                              "#3b82f6",
                          }}
                        />
                      </div>
                      <input
                        type="text"
                        value={
                          project.settings?.displayOptions?.accentColor ||
                          "#3b82f6"
                        }
                        onChange={(e) => {
                          updateProject({
                            settings: {
                              ...project.settings,
                              displayOptions: {
                                ...project.settings?.displayOptions,
                                accentColor: e.target.value,
                              },
                            },
                          });
                        }}
                        className={`flex-1 px-3 py-2 text-sm border rounded-lg ${
                          isDark
                            ? "border-gray-700 bg-gray-800 text-white"
                            : "border-gray-300 bg-white text-gray-900"
                        }`}
                        placeholder="#3b82f6"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Column 2: Layout Settings */}
              <div
                className={`border rounded-xl p-6 ${
                  isDark
                    ? "border-gray-800 bg-gray-900/50"
                    : "border-gray-200 bg-white"
                }`}
              >
                <h3 className={`font-semibold ${themeClasses.text.bold} mb-4`}>
                  Layout Settings
                </h3>

                <div className="space-y-4">
                  {/* Sidebar Position */}
                  <div>
                    <label
                      className={`block text-sm font-medium ${themeClasses.text.bold} mb-2`}
                    >
                      Sidebar Position
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: "left", label: "Left" },
                        { id: "right", label: "Right" },
                      ].map((position) => (
                        <button
                          key={position.id}
                          onClick={() => {
                            updateProject({
                              settings: {
                                ...project.settings,
                                layoutOptions: {
                                  ...project.settings?.layoutOptions,
                                  sidebarPosition: position.id,
                                },
                              },
                            });
                          }}
                          className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                            (project.settings?.layoutOptions?.sidebarPosition ||
                              "left") === position.id
                              ? isDark
                                ? "border-blue-600 bg-blue-900/20 text-blue-400"
                                : "border-blue-500 bg-blue-50 text-blue-600"
                              : isDark
                              ? "border-gray-700 text-gray-300 hover:border-gray-600"
                              : "border-gray-300 text-gray-700 hover:border-gray-400"
                          }`}
                        >
                          {position.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Content Width */}
                  <div>
                    <label
                      className={`block text-sm font-medium ${themeClasses.text.bold} mb-2`}
                    >
                      Content Width
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: "narrow", label: "Narrow" },
                        { id: "wide", label: "Wide" },
                      ].map((width) => (
                        <button
                          key={width.id}
                          onClick={() => {
                            updateProject({
                              settings: {
                                ...project.settings,
                                layoutOptions: {
                                  ...project.settings?.layoutOptions,
                                  contentWidth: width.id,
                                },
                              },
                            });
                          }}
                          className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                            (project.settings?.layoutOptions?.contentWidth ||
                              "narrow") === width.id
                              ? isDark
                                ? "border-blue-600 bg-blue-900/20 text-blue-400"
                                : "border-blue-500 bg-blue-50 text-blue-600"
                              : isDark
                              ? "border-gray-700 text-gray-300 hover:border-gray-600"
                              : "border-gray-300 text-gray-700 hover:border-gray-400"
                          }`}
                        >
                          {width.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Navigation Style */}
                  <div>
                    <label
                      className={`block text-sm font-medium ${themeClasses.text.bold} mb-2`}
                    >
                      Navigation Style
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: "tree", label: "Tree View" },
                        { id: "flat", label: "Flat List" },
                      ].map((style) => (
                        <button
                          key={style.id}
                          onClick={() => {
                            updateProject({
                              settings: {
                                ...project.settings,
                                layoutOptions: {
                                  ...project.settings?.layoutOptions,
                                  navigationStyle: style.id,
                                },
                              },
                            });
                          }}
                          className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                            (project.settings?.layoutOptions?.navigationStyle ||
                              "tree") === style.id
                              ? isDark
                                ? "border-blue-600 bg-blue-900/20 text-blue-400"
                                : "border-blue-500 bg-blue-50 text-blue-600"
                              : isDark
                              ? "border-gray-700 text-gray-300 hover:border-gray-600"
                              : "border-gray-300 text-gray-700 hover:border-gray-400"
                          }`}
                        >
                          {style.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Layout Toggles */}
                  <div className="space-y-3 pt-2">
                    {[
                      {
                        id: "showTOC",
                        label: "Table of Contents",
                        description: "Right sidebar navigation",
                        default: true,
                      },
                      {
                        id: "showSearch",
                        label: "Global Search",
                        description: "Search functionality",
                        default: true,
                      },
                      {
                        id: "stickyHeader",
                        label: "Sticky Header",
                        description: "Fixed header on scroll",
                        default: true,
                      },
                    ].map((option) => (
                      <div
                        key={option.id}
                        className="flex items-center justify-between"
                      >
                        <div className="flex-1">
                          <div
                            className={`text-sm font-medium ${themeClasses.text.bold}`}
                          >
                            {option.label}
                          </div>
                          <div
                            className={`text-xs ${themeClasses.text.secondary}`}
                          >
                            {option.description}
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            const newValue = !(
                              project.settings?.layoutOptions?.[option.id] ??
                              option.default
                            );
                            updateProject({
                              settings: {
                                ...project.settings,
                                layoutOptions: {
                                  ...project.settings?.layoutOptions,
                                  [option.id]: newValue,
                                },
                              },
                            });
                          }}
                          className={`w-10 h-6 rounded-full transition-colors relative ${
                            project.settings?.layoutOptions?.[option.id] ??
                            option.default
                              ? isDark
                                ? "bg-blue-600"
                                : "bg-blue-500"
                              : isDark
                              ? "bg-gray-600"
                              : "bg-gray-300"
                          }`}
                        >
                          <div
                            className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${
                              project.settings?.layoutOptions?.[option.id] ??
                              option.default
                                ? "right-1"
                                : "left-1"
                            }`}
                          ></div>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Column 3: Documentation Options */}
              <div
                className={`border rounded-xl p-6 ${
                  isDark
                    ? "border-gray-800 bg-gray-900/50"
                    : "border-gray-200 bg-white"
                }`}
              >
                <h3 className={`font-semibold ${themeClasses.text.bold} mb-4`}>
                  Documentation Options
                </h3>

                <div className="space-y-4">
                  {/* Content Options */}
                  {[
                    {
                      id: "showCodeExamples",
                      label: "Code Examples",
                      description: "Multi-language code snippets",
                      default: true,
                    },
                    {
                      id: "showResponseExamples",
                      label: "Response Examples",
                      description: "Sample API response data",
                      default: true,
                    },
                    {
                      id: "showAuthExamples",
                      label: "Authentication Examples",
                      description: "API key and auth headers",
                      default: true,
                    },
                    {
                      id: "showMethodBadges",
                      label: "HTTP Method Badges",
                      description: "GET, POST, PUT visual badges",
                      default: true,
                    },
                    {
                      id: "groupByCollection",
                      label: "Group by Collections",
                      description: "Organize endpoints by collection",
                      default: true,
                    },
                    {
                      id: "showErrorCodes",
                      label: "Error Documentation",
                      description: "HTTP status codes and meanings",
                      default: true,
                    },
                    {
                      id: "enableInteractivePlayground",
                      label: "Interactive Playground",
                      description: "Try API endpoints directly",
                      default: false,
                    },
                    {
                      id: "isPublic",
                      label: "Public Access",
                      description: "Allow public documentation access",
                      default: true,
                    },
                  ].map((option) => (
                    <div
                      key={option.id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex-1">
                        <div
                          className={`text-sm font-medium ${themeClasses.text.bold}`}
                        >
                          {option.label}
                        </div>
                        <div
                          className={`text-xs ${themeClasses.text.secondary}`}
                        >
                          {option.description}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          const newValue = !(
                            project.settings?.documentationOptions?.[
                              option.id
                            ] ?? option.default
                          );
                          updateProject({
                            settings: {
                              ...project.settings,
                              documentationOptions: {
                                ...project.settings?.documentationOptions,
                                [option.id]: newValue,
                              },
                            },
                          });
                        }}
                        className={`w-10 h-6 rounded-full transition-colors relative ${
                          project.settings?.documentationOptions?.[option.id] ??
                          option.default
                            ? isDark
                              ? "bg-blue-600"
                              : "bg-blue-500"
                            : isDark
                            ? "bg-gray-600"
                            : "bg-gray-300"
                        }`}
                      >
                        <div
                          className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${
                            project.settings?.documentationOptions?.[
                              option.id
                            ] ?? option.default
                              ? "right-1"
                              : "left-1"
                          }`}
                        ></div>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Activity Feed */}
            {/* <div>
              <h2
                className={`text-lg font-semibold ${themeClasses.text.bold} mb-4`}
              >
                Recent Activity
              </h2>
              <div
                className={`border rounded-xl ${
                  isDark
                    ? "border-gray-800 bg-gray-900/50"
                    : "border-gray-200 bg-white"
                }`}
              >
                <div className="p-4">
                  <div className="space-y-1">
                    {recentActivity.map((activity, index) => (
                      <ActivityItem
                        key={index}
                        {...activity}
                        isDark={isDark}
                        themeClasses={themeClasses}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div> */}
          </div>
        )}

        {activeTab === "settings" && (
          <div className="space-y-8">
            <h2
              className={`text-lg font-semibold ${themeClasses.text.bold} mb-6`}
            >
              Project Settings
            </h2>

            {/* General Settings */}
            <div
              className={`border rounded-xl p-6 ${
                isDark
                  ? "border-gray-800 bg-gray-900/50"
                  : "border-gray-200 bg-white"
              }`}
            >
              <h3 className={`font-semibold ${themeClasses.text.bold} mb-4`}>
                General
              </h3>

              <div className="space-y-4">
                <div>
                  <label
                    className={`block text-sm font-medium ${themeClasses.text.bold} mb-2`}
                  >
                    Project Name
                  </label>
                  <input
                    type="text"
                    value={project.name}
                    onChange={(e) => {
                      const updatedProject = {
                        ...project,
                        name: e.target.value,
                        updated: new Date().toISOString(),
                      };
                      setProject(updatedProject);
                      ApiClient.docsProjects.update(project.id, updatedProject);
                    }}
                    className={`w-full px-3 py-2 text-sm rounded-lg ${themeClasses.input.base}`}
                    placeholder="Enter project name"
                  />
                </div>

                <div>
                  <label
                    className={`block text-sm font-medium ${themeClasses.text.bold} mb-2`}
                  >
                    Description
                  </label>
                  <textarea
                    value={project.description || ""}
                    onChange={(e) => {
                      const updatedProject = {
                        ...project,
                        description: e.target.value,
                        updated: new Date().toISOString(),
                      };
                      setProject(updatedProject);
                      ApiClient.docsProjects.update(project.id, updatedProject);
                    }}
                    className={`w-full px-3 py-2 text-sm rounded-lg ${themeClasses.input.base} h-20 resize-none`}
                    placeholder="Enter project description"
                  />
                </div>

                <div>
                  <label
                    className={`block text-sm font-medium ${themeClasses.text.bold} mb-2`}
                  >
                    Public URL
                  </label>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm ${themeClasses.text.secondary}`}>
                      {typeof window !== "undefined"
                        ? window.location.origin
                        : "https://your-domain.com"}
                      /{generateUsername(user)}/
                    </span>
                    <input
                      type="text"
                      value={project.slug || generateProjectSlug(project.name)}
                      onChange={(e) => {
                        const slug = e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9-]/g, "-")
                          .replace(/-+/g, "-");
                        const updatedProject = {
                          ...project,
                          slug,
                          updated: new Date().toISOString(),
                        };
                        setProject(updatedProject);
                        ApiClient.docsProjects.update(
                          project.id,
                          updatedProject
                        );
                      }}
                      className={`flex-1 px-3 py-2 text-sm rounded-lg ${themeClasses.input.base}`}
                      placeholder="project-name"
                    />
                  </div>
                  <p className={`text-xs ${themeClasses.text.tertiary} mt-1`}>
                    This will be your public documentation URL
                  </p>
                </div>
              </div>
            </div>

            {/* API Settings */}
            <div
              className={`border rounded-xl p-6 ${
                isDark
                  ? "border-gray-800 bg-gray-900/50"
                  : "border-gray-200 bg-white"
              }`}
            >
              <h3 className={`font-semibold ${themeClasses.text.bold} mb-4`}>
                API Configuration
              </h3>

              <div className="space-y-4">
                <div>
                  <label
                    className={`block text-sm font-medium ${themeClasses.text.bold} mb-2`}
                  >
                    Base URL
                  </label>
                  <input
                    type="url"
                    value={
                      project.settings?.baseUrl || "https://api.example.com"
                    }
                    onChange={(e) => {
                      const updatedProject = {
                        ...project,
                        settings: {
                          ...project.settings,
                          baseUrl: e.target.value,
                        },
                        updated: new Date().toISOString(),
                      };
                      setProject(updatedProject);
                      ApiClient.docsProjects.update(project.id, updatedProject);
                    }}
                    className={`w-full px-3 py-2 text-sm rounded-lg ${themeClasses.input.base}`}
                    placeholder="https://api.example.com"
                  />
                </div>

                <div>
                  <label
                    className={`block text-sm font-medium ${themeClasses.text.bold} mb-2`}
                  >
                    API Version
                  </label>
                  <input
                    type="text"
                    value={project.settings?.apiVersion || "v1"}
                    onChange={(e) => {
                      const updatedProject = {
                        ...project,
                        settings: {
                          ...project.settings,
                          apiVersion: e.target.value,
                        },
                        updated: new Date().toISOString(),
                      };
                      setProject(updatedProject);
                      ApiClient.docsProjects.update(project.id, updatedProject);
                    }}
                    className={`w-full px-3 py-2 text-sm rounded-lg ${themeClasses.input.base}`}
                    placeholder="v1"
                  />
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div
              className={`border border-red-200 dark:border-red-900/50 rounded-xl p-6 bg-red-50/50 dark:bg-red-900/10`}
            >
              <h3 className="font-semibold text-red-700 dark:text-red-400 mb-4">
                Danger Zone
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-red-700 dark:text-red-400">
                      Delete Project
                    </div>
                    <div className="text-xs text-red-600 dark:text-red-500">
                      Permanently delete this documentation project and all its
                      data
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (
                        confirm(
                          `Are you sure you want to delete "${project.name}"? This action cannot be undone.`
                        )
                      ) {
                        ApiClient.docsProjects.delete(project.id);
                        router.push("/docs");
                      }
                    }}
                    className="px-4 py-2 text-sm font-medium text-red-700 dark:text-red-400 border border-red-300 dark:border-red-800 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
                  >
                    Delete Project
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "analytics" && (
          <div className="space-y-8">
            <h2
              className={`text-lg font-semibold ${themeClasses.text.bold} mb-6`}
            >
              Analytics & Insights
            </h2>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div
                className={`p-6 border rounded-xl ${
                  isDark
                    ? "border-gray-800 bg-gray-900/50"
                    : "border-gray-200 bg-white"
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <Eye className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span
                    className={`text-sm font-medium ${themeClasses.text.bold}`}
                  >
                    Page Views
                  </span>
                </div>
                <div
                  className={`text-2xl font-bold ${themeClasses.text.bold} mb-1`}
                >
                  1,247
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-green-500" />
                  <span className="text-xs text-green-500">+25% this week</span>
                </div>
              </div>

              <div
                className={`p-6 border rounded-xl ${
                  isDark
                    ? "border-gray-800 bg-gray-900/50"
                    : "border-gray-200 bg-white"
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                    <Users className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <span
                    className={`text-sm font-medium ${themeClasses.text.bold}`}
                  >
                    Unique Visitors
                  </span>
                </div>
                <div
                  className={`text-2xl font-bold ${themeClasses.text.bold} mb-1`}
                >
                  892
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-green-500" />
                  <span className="text-xs text-green-500">+18% this week</span>
                </div>
              </div>

              <div
                className={`p-6 border rounded-xl ${
                  isDark
                    ? "border-gray-800 bg-gray-900/50"
                    : "border-gray-200 bg-white"
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                    <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <span
                    className={`text-sm font-medium ${themeClasses.text.bold}`}
                  >
                    Avg. Time
                  </span>
                </div>
                <div
                  className={`text-2xl font-bold ${themeClasses.text.bold} mb-1`}
                >
                  2m 34s
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-green-500" />
                  <span className="text-xs text-green-500">+12% this week</span>
                </div>
              </div>

              <div
                className={`p-6 border rounded-xl ${
                  isDark
                    ? "border-gray-800 bg-gray-900/50"
                    : "border-gray-200 bg-white"
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                    <Share2 className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                  </div>
                  <span
                    className={`text-sm font-medium ${themeClasses.text.bold}`}
                  >
                    Referrals
                  </span>
                </div>
                <div
                  className={`text-2xl font-bold ${themeClasses.text.bold} mb-1`}
                >
                  156
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-green-500" />
                  <span className="text-xs text-green-500">+8% this week</span>
                </div>
              </div>
            </div>

            {/* Popular Endpoints */}
            <div
              className={`border rounded-xl p-6 ${
                isDark
                  ? "border-gray-800 bg-gray-900/50"
                  : "border-gray-200 bg-white"
              }`}
            >
              <h3 className={`font-semibold ${themeClasses.text.bold} mb-4`}>
                Most Viewed Endpoints
              </h3>

              <div className="space-y-3">
                {[
                  { name: "GET /users", views: 342, percentage: 85 },
                  { name: "POST /auth/login", views: 298, percentage: 72 },
                  { name: "GET /users/{id}", views: 234, percentage: 58 },
                  { name: "PUT /users/{id}", views: 189, percentage: 47 },
                  { name: "DELETE /users/{id}", views: 145, percentage: 36 },
                ].map((endpoint, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-6 h-6 rounded flex items-center justify-center text-xs font-medium ${
                          isDark
                            ? "bg-gray-700 text-gray-300"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {index + 1}
                      </div>
                      <span
                        className={`font-mono text-sm ${themeClasses.text.bold}`}
                      >
                        {endpoint.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-16 h-2 rounded-full overflow-hidden ${
                            isDark ? "bg-gray-700" : "bg-gray-200"
                          }`}
                        >
                          <div
                            className="h-full bg-blue-500"
                            style={{ width: `${endpoint.percentage}%` }}
                          />
                        </div>
                      </div>
                      <span
                        className={`text-sm ${themeClasses.text.secondary} w-12 text-right`}
                      >
                        {endpoint.views}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Traffic Sources */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div
                className={`border rounded-xl p-6 ${
                  isDark
                    ? "border-gray-800 bg-gray-900/50"
                    : "border-gray-200 bg-white"
                }`}
              >
                <h3 className={`font-semibold ${themeClasses.text.bold} mb-4`}>
                  Traffic Sources
                </h3>

                <div className="space-y-4">
                  {[
                    { source: "Direct", visitors: 423, percentage: 47 },
                    { source: "Search Engines", visitors: 312, percentage: 35 },
                    { source: "Social Media", visitors: 134, percentage: 15 },
                    { source: "Referrals", visitors: 23, percentage: 3 },
                  ].map((source, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <span className={`text-sm ${themeClasses.text.bold}`}>
                        {source.source}
                      </span>
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-20 h-2 rounded-full overflow-hidden ${
                            isDark ? "bg-gray-700" : "bg-gray-200"
                          }`}
                        >
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                            style={{ width: `${source.percentage}%` }}
                          />
                        </div>
                        <span
                          className={`text-sm ${themeClasses.text.secondary} w-8 text-right`}
                        >
                          {source.percentage}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div
                className={`border rounded-xl p-6 ${
                  isDark
                    ? "border-gray-800 bg-gray-900/50"
                    : "border-gray-200 bg-white"
                }`}
              >
                <h3 className={`font-semibold ${themeClasses.text.bold} mb-4`}>
                  Geographic Distribution
                </h3>

                <div className="space-y-4">
                  {[
                    {
                      country: "United States",
                      flag: "🇺🇸",
                      visitors: 445,
                      percentage: 50,
                    },
                    {
                      country: "United Kingdom",
                      flag: "🇬🇧",
                      visitors: 178,
                      percentage: 20,
                    },
                    {
                      country: "Germany",
                      flag: "🇩🇪",
                      visitors: 134,
                      percentage: 15,
                    },
                    {
                      country: "Canada",
                      flag: "🇨🇦",
                      visitors: 89,
                      percentage: 10,
                    },
                    {
                      country: "Others",
                      flag: "🌍",
                      visitors: 46,
                      percentage: 5,
                    },
                  ].map((country, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <span>{country.flag}</span>
                        <span className={`text-sm ${themeClasses.text.bold}`}>
                          {country.country}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-20 h-2 rounded-full overflow-hidden ${
                            isDark ? "bg-gray-700" : "bg-gray-200"
                          }`}
                        >
                          <div
                            className="h-full bg-gradient-to-r from-green-500 to-blue-500"
                            style={{ width: `${country.percentage}%` }}
                          />
                        </div>
                        <span
                          className={`text-sm ${themeClasses.text.secondary} w-8 text-right`}
                        >
                          {country.percentage}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Note about analytics */}
            <div
              className={`border rounded-xl p-6 ${
                isDark
                  ? "border-blue-800/50 bg-blue-900/20"
                  : "border-blue-200 bg-blue-50/50"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center mt-0.5">
                  <AlertCircle className="w-3 h-3 text-white" />
                </div>
                <div>
                  <h4 className={`font-medium ${themeClasses.text.bold} mb-1`}>
                    Analytics Preview
                  </h4>
                  <p className={`text-sm ${themeClasses.text.secondary}`}>
                    This is a preview of what analytics data would look like. In
                    production, this would show real visitor statistics, popular
                    endpoints, and usage patterns for your documentation.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
