"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Settings,
  Eye,
  Copy,
  ExternalLink,
  Calendar,
  Users,
  Activity,
  FileText,
  Code,
  GitBranch,
  Share2,
  Download,
  MoreVertical,
  Edit3,
  Trash2,
  RefreshCw,
  CheckCircle,
  Clock,
  AlertCircle,
  BarChart3,
  TrendingUp,
  Zap,
  Shield,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { useCollections } from "@/contexts/CollectionsContext";
import { getThemeClasses } from "@/lib/theme";
import { DocsProjects, DocsMetadata } from "@/lib/docs-storage";
import {
  generateUsername,
  generatePublicDocUrl,
  generateProjectSlug,
} from "@/lib/user-utils";

const StatCard = ({
  icon: Icon,
  label,
  value,
  trend,
  trendLabel,
  isDark,
  themeClasses,
}) => (
  <div
    className={`p-4 border rounded-lg ${
      isDark ? "border-gray-800 bg-gray-900/50" : "border-gray-200 bg-white"
    }`}
    style={{ borderRadius: "12px" }}
  >
    <div className="flex items-center gap-3 mb-3">
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center ${
          isDark ? "bg-gray-800 text-gray-300" : "bg-gray-100 text-gray-600"
        }`}
      >
        <Icon className="w-4 h-4" />
      </div>
      <span className={`text-sm font-medium ${themeClasses.text.bold}`}>
        {label}
      </span>
    </div>
    <div className="space-y-1">
      <div className={`text-2xl font-bold ${themeClasses.text.bold}`}>
        {value}
      </div>
      {trend && (
        <div className="flex items-center gap-1">
          <TrendingUp
            className={`w-3 h-3 ${
              trend > 0 ? "text-green-500" : "text-red-500"
            }`}
          />
          <span
            className={`text-xs ${
              trend > 0 ? "text-green-500" : "text-red-500"
            }`}
          >
            {trend > 0 ? "+" : ""}
            {trend}% {trendLabel}
          </span>
        </div>
      )}
    </div>
  </div>
);

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

  useEffect(() => {
    if (params.id) {
      loadProject();
    }
  }, [params.id]);

  const loadProject = () => {
    try {
      const projects = DocsProjects.getAll();
      const projectData = projects[params.id];
      if (projectData) {
        setProject(projectData);
      } else {
        router.push("/docs");
      }
    } catch (error) {
      console.error("Failed to load project:", error);
      router.push("/docs");
    } finally {
      setLoading(false);
    }
  };

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

  const viewDocumentation = () => {
    const enhancedCollections = getCollectionsWithDocs();
    const projectCollections = {};

    project.collections.forEach((collectionId) => {
      if (enhancedCollections[collectionId]) {
        projectCollections[collectionId] = enhancedCollections[collectionId];
      }
    });

    const docId = `project_${project.id}_${Date.now()}`;
    const docData = {
      project: project,
      collections: Object.values(projectCollections),
      customization: {
        title: project.name,
        description: project.description,
        baseUrl: project.settings?.baseUrl || "https://api.example.com",
        ...project.settings,
      },
      meta: {
        generatedAt: new Date().toISOString(),
        generator: "API Playground",
        totalEndpoints: Object.values(projectCollections).reduce(
          (acc, col) => acc + (col.requests?.length || 0),
          0
        ),
        totalCollections: Object.values(projectCollections).length,
      },
    };

    sessionStorage.setItem(`docs_${docId}`, JSON.stringify(docData));
    window.open(
      `/docs/generated?docId=${docId}&project=${project.id}`,
      "_blank"
    );
  };

  const deleteProject = () => {
    if (
      confirm(
        `Are you sure you want to delete "${project.name}"? This action cannot be undone.`
      )
    ) {
      DocsProjects.delete(project.id);
      router.push("/docs");
    }
  };

  const duplicateProject = () => {
    const duplicated = DocsProjects.duplicate(
      project.id,
      `${project.name} Copy`
    );
    if (duplicated) {
      router.push(`/docs/${duplicated.id}`);
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
            className={`text-xl font-semibold ${themeClasses.text.primary} mb-2`}
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

  const getCollectionCount = () => project.collections?.length || 0;
  const getEndpointCount = () => {
    if (!project.collections) return 0;
    let totalEndpoints = 0;
    project.collections.forEach((collectionId) => {
      const collection = collections[collectionId];
      if (collection && collection.requests) {
        totalEndpoints += collection.requests.length;
      }
    });
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
                  className={`text-3xl font-bold tracking-tight ${themeClasses.text.bold}`}
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
              {/* <Button
                onClick={viewDocumentation}
                variant="outline"
                size="sm"
                className={`${themeClasses.button.secondary}`}
              >
                View Docs
              </Button> */}
              <Button
                onClick={() => window.open(generatePublicUrl(), "_blank")}
                className={`${themeClasses.button.fill} px-4 h-9`}
                // className={`${
                //   isDark
                //     ? "bg-white text-black hover:bg-gray-200"
                //     : "bg-black text-white hover:bg-gray-800"
                // }`}
                size="sm"
                disabled={!generatePublicUrl()}
              >
                Open Public
              </Button>

              {/* <div className="relative">
                <Button
                  onClick={() => setShowMenu(!showMenu)}
                  variant="outline"
                  size="sm"
                  className={`${themeClasses.button.secondary}`}
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>

                {showMenu && (
                  <div
                    className={`absolute right-0 top-full mt-2 w-48 border rounded-xl shadow-xl z-50 ${
                      isDark
                        ? "border-gray-700 bg-gray-800"
                        : "border-gray-200 bg-white"
                    }`}
                  >
                    <div className="p-1">
                      <button
                        onClick={() => {
                          // TODO: Edit functionality
                          setShowMenu(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-sm rounded-lg hover:${
                          isDark ? "bg-gray-700" : "bg-gray-100"
                        } flex items-center gap-2 transition-colors`}
                      >
                        <Edit3 className="w-4 h-4" />
                        Edit Project
                      </button>
                      <button
                        onClick={() => {
                          duplicateProject();
                          setShowMenu(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-sm rounded-lg hover:${
                          isDark ? "bg-gray-700" : "bg-gray-100"
                        } flex items-center gap-2 transition-colors`}
                      >
                        <Copy className="w-4 h-4" />
                        Duplicate
                      </button>
                      <button
                        onClick={() => {
                          deleteProject();
                          setShowMenu(false);
                        }}
                        className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-red-500/10 text-red-500 flex items-center gap-2 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div> */}
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
                className={`cursor-pointer flex items-center gap-2 px-1 py-2 text-sm font-medium transition-colors border-b-2 ${
                  activeTab === id
                    ? `${themeClasses.text.primary} border-black dark:border-white`
                    : `${themeClasses.text.secondary} border-transparent hover:${themeClasses.text.primary}`
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
      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Production Deployment - Vercel Style */}
            <div
              className={`border rounded-xl overflow-hidden ${
                isDark
                  ? "border-gray-800 bg-gray-900/50"
                  : "border-gray-200 bg-white"
              }`}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span
                        className={`font-semibold ${themeClasses.text.primary}`}
                      >
                        Production Deployment
                      </span>
                    </div>
                    <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full">
                      Live
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => window.open(generatePublicUrl(), "_blank")}
                      variant="outline"
                      size="sm"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Visit
                    </Button>
                  </div>
                </div>

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
                              className={`text-sm font-medium ${themeClasses.text.primary} mb-1`}
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
                    <button
                      onClick={() => window.open(generatePublicUrl(), "_blank")}
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
                    </button>
                  </div>

                  {/* Right side - Details (60% width) */}
                  <div className="flex-1 space-y-8">
                    {/* Domain */}
                    <div>
                      <h4
                        className={`text-sm font-semibold ${themeClasses.text.primary} mb-3`}
                      >
                        Domain
                      </h4>
                      <div
                        className={`p-4 rounded-lg border ${
                          isDark
                            ? "border-gray-700 bg-gray-800/50"
                            : "border-gray-200 bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            <div>
                              <div
                                className={`text-sm font-medium ${themeClasses.text.primary}`}
                              >
                                {generatePublicUrl()
                                  ? generatePublicUrl().replace(
                                      /^https?:\/\//,
                                      ""
                                    )
                                  : "Not assigned"}
                              </div>
                              <div
                                className={`text-xs ${themeClasses.text.secondary}`}
                              >
                                {generatePublicUrl()
                                  ? "Ready"
                                  : "Awaiting configuration"}
                              </div>
                            </div>
                          </div>
                          <ExternalLink
                            className={`w-4 h-4 ${themeClasses.text.tertiary}`}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Deployment Details */}
                    <div>
                      <h4
                        className={`text-sm font-semibold ${themeClasses.text.primary} mb-3`}
                      >
                        Details
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between py-2">
                          <span
                            className={`text-sm ${themeClasses.text.secondary}`}
                          >
                            Status
                          </span>
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                            <span
                              className={`text-sm ${themeClasses.text.primary}`}
                            >
                              Ready
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between py-2">
                          <span
                            className={`text-sm ${themeClasses.text.secondary}`}
                          >
                            Template
                          </span>
                          <span
                            className={`text-sm ${themeClasses.text.primary} capitalize`}
                          >
                            {project.template || "Default"}
                          </span>
                        </div>

                        <div className="flex items-center justify-between py-2">
                          <span
                            className={`text-sm ${themeClasses.text.secondary}`}
                          >
                            Collections
                          </span>
                          <span
                            className={`text-sm ${themeClasses.text.primary}`}
                          >
                            {project.collections?.length || 0}
                          </span>
                        </div>

                        <div className="flex items-center justify-between py-2">
                          <span
                            className={`text-sm ${themeClasses.text.secondary}`}
                          >
                            Endpoints
                          </span>
                          <span
                            className={`text-sm ${themeClasses.text.primary}`}
                          >
                            {getEndpointCount()}
                          </span>
                        </div>

                        <div className="flex items-center justify-between py-2">
                          <span
                            className={`text-sm ${themeClasses.text.secondary}`}
                          >
                            Last Updated
                          </span>
                          <span
                            className={`text-sm ${themeClasses.text.primary}`}
                          >
                            {new Date(project.updated).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Build Settings */}
                    <div>
                      <h4
                        className={`text-sm font-semibold ${themeClasses.text.primary} mb-3`}
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
                            className={`text-sm ${themeClasses.text.primary}`}
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
                            className={`text-sm ${themeClasses.text.primary}`}
                          >
                            {project.settings?.groupByCollection !== false
                              ? "Enabled"
                              : "Disabled"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              {/* Stats */}
              <div>
                <h2
                  className={`text-lg font-semibold ${themeClasses.text.bold} mb-4`}
                >
                  Documentation Stats
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <StatCard
                    icon={FileText}
                    label="Collections"
                    value={getCollectionCount()}
                    trend={12}
                    trendLabel="this month"
                    isDark={isDark}
                    themeClasses={themeClasses}
                  />
                  <StatCard
                    icon={Code}
                    label="Endpoints"
                    value={getEndpointCount()}
                    trend={-3}
                    trendLabel="this week"
                    isDark={isDark}
                    themeClasses={themeClasses}
                  />
                  <StatCard
                    icon={Eye}
                    label="Page Views"
                    value="1,247"
                    trend={25}
                    trendLabel="this week"
                    isDark={isDark}
                    themeClasses={themeClasses}
                  />
                </div>
              </div>

              {/* Content & Display Section */}
              <div>
                <h2
                  className={`text-lg font-semibold ${themeClasses.text.bold} mb-6`}
                >
                  Content & Display
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Template Selection */}
                  <div
                    className={`border rounded-xl p-6 ${
                      isDark
                        ? "border-gray-800 bg-gray-900/50"
                        : "border-gray-200 bg-white"
                    }`}
                  >
                    <h3
                      className={`font-semibold ${themeClasses.text.bold} mb-4`}
                    >
                      Documentation Template
                    </h3>
                    <p
                      className={`text-sm ${themeClasses.text.secondary} mb-6`}
                    >
                      Choose how your documentation will be displayed to
                      visitors
                    </p>

                    <div className="space-y-3">
                      {[
                        {
                          id: "default",
                          name: "Default",
                          description:
                            "Clean and simple layout with sidebar navigation",
                          preview: "Sidebar + Content",
                          isSelected:
                            !project.template || project.template === "default",
                        },
                        {
                          id: "cards",
                          name: "Card Layout",
                          description: "Endpoint cards with expandable details",
                          preview: "Card Grid",
                          isSelected: project.template === "cards",
                        },
                        {
                          id: "compact",
                          name: "Compact",
                          description: "Dense layout for extensive APIs",
                          preview: "Compact List",
                          isSelected: project.template === "compact",
                        },
                      ].map((template) => (
                        <div
                          key={template.id}
                          onClick={() => {
                            const updatedProject = {
                              ...project,
                              template: template.id,
                              updated: new Date().toISOString(),
                            };
                            setProject(updatedProject);
                            DocsProjects.update(project.id, updatedProject);
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
                            <h4
                              className={`font-medium ${themeClasses.text.bold}`}
                            >
                              {template.name}
                            </h4>
                            {template.isSelected && (
                              <CheckCircle className="w-4 h-4 text-blue-500" />
                            )}
                          </div>
                          <p
                            className={`text-xs ${themeClasses.text.secondary} mb-2`}
                          >
                            {template.description}
                          </p>
                          <div
                            className={`text-xs px-2 py-1 rounded ${
                              isDark
                                ? "bg-gray-700 text-gray-300"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {template.preview}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Display Options */}
                  <div
                    className={`border rounded-xl p-6 ${
                      isDark
                        ? "border-gray-800 bg-gray-900/50"
                        : "border-gray-200 bg-white"
                    }`}
                  >
                    <h3
                      className={`font-semibold ${themeClasses.text.bold} mb-4`}
                    >
                      Display Options
                    </h3>

                    <div className="space-y-6">
                      {/* Color Theme */}
                      <div>
                        <label
                          className={`block text-sm font-medium ${themeClasses.text.primary} mb-3`}
                        >
                          Color Theme
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            {
                              id: "default",
                              name: "Default",
                              color: "#171717",
                            },
                            { id: "blue", name: "Blue", color: "#3b82f6" },
                            { id: "green", name: "Green", color: "#10b981" },
                            { id: "purple", name: "Purple", color: "#8b5cf6" },
                          ].map((theme) => (
                            <button
                              key={theme.id}
                              onClick={() => {
                                const updatedProject = {
                                  ...project,
                                  displayOptions: {
                                    ...project.displayOptions,
                                    colorTheme: theme.id,
                                  },
                                  updated: new Date().toISOString(),
                                };
                                setProject(updatedProject);
                                DocsProjects.update(project.id, updatedProject);
                              }}
                              className={`flex items-center gap-2 p-3 rounded-lg border transition-colors ${
                                (project.displayOptions?.colorTheme ||
                                  "default") === theme.id
                                  ? isDark
                                    ? "border-blue-600 bg-blue-900/20"
                                    : "border-blue-500 bg-blue-50"
                                  : isDark
                                  ? "border-gray-700 hover:border-gray-600"
                                  : "border-gray-200 hover:border-gray-300"
                              }`}
                            >
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: theme.color }}
                              />
                              <span
                                className={`text-xs ${themeClasses.text.primary}`}
                              >
                                {theme.name}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Layout Options */}
                      <div>
                        <label
                          className={`block text-sm font-medium ${themeClasses.text.primary} mb-3`}
                        >
                          Layout Settings
                        </label>
                        <div className="space-y-3">
                          {[
                            {
                              id: "showMethodBadges",
                              label: "HTTP method badges",
                              description: "GET, POST, PUT, etc. badges",
                            },
                            {
                              id: "showCodeExamples",
                              label: "Code examples",
                              description: "cURL and SDK examples",
                            },
                            {
                              id: "groupByCollection",
                              label: "Group by collection",
                              description: "Organize by parent collection",
                            },
                            {
                              id: "showResponseExamples",
                              label: "Response examples",
                              description: "Sample response data",
                            },
                          ].map((option) => (
                            <div
                              key={option.id}
                              className="flex items-center gap-3"
                            >
                              <input
                                type="checkbox"
                                checked={
                                  project.displayOptions?.[option.id] !== false
                                }
                                onChange={(e) => {
                                  const updatedProject = {
                                    ...project,
                                    displayOptions: {
                                      ...project.displayOptions,
                                      [option.id]: e.target.checked,
                                    },
                                    updated: new Date().toISOString(),
                                  };
                                  setProject(updatedProject);
                                  DocsProjects.update(
                                    project.id,
                                    updatedProject
                                  );
                                }}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                              />
                              <div className="flex-1">
                                <label
                                  className={`text-sm font-medium ${themeClasses.text.primary}`}
                                >
                                  {option.label}
                                </label>
                                <p
                                  className={`text-xs ${themeClasses.text.secondary}`}
                                >
                                  {option.description}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Collections Overview */}
                <div className="lg:col-span-2">
                  <h2
                    className={`text-lg font-semibold ${themeClasses.text.bold} mb-4`}
                  >
                    Collections in Documentation
                  </h2>
                  <div
                    className={`p-6 border rounded-xl ${
                      isDark
                        ? "border-gray-800 bg-gray-900/50"
                        : "border-gray-200 bg-white"
                    }`}
                  >
                    <div className="space-y-3">
                      {project.collections?.map((collectionId) => {
                        const collection = collections[collectionId];
                        if (!collection) return null;

                        return (
                          <div
                            key={collectionId}
                            className="flex items-center justify-between py-2"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                  isDark
                                    ? "bg-gray-800 text-gray-300"
                                    : "bg-gray-100 text-gray-600"
                                }`}
                              >
                                <FileText className="w-4 h-4" />
                              </div>
                              <div>
                                <div
                                  className={`font-medium ${themeClasses.text.bold}`}
                                >
                                  {collection.name}
                                </div>
                                <div
                                  className={`text-sm ${themeClasses.text.secondary}`}
                                >
                                  {collection.requests?.length || 0} endpoints
                                </div>
                              </div>
                            </div>
                            <Button variant="ghost" size="sm">
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
              {/* Activity Feed */}
              <div>
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
              </div>
            </div>
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
                    className={`block text-sm font-medium ${themeClasses.text.primary} mb-2`}
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
                      DocsProjects.update(project.id, updatedProject);
                    }}
                    className={`w-full px-3 py-2 text-sm rounded-lg ${themeClasses.input.base}`}
                    placeholder="Enter project name"
                  />
                </div>

                <div>
                  <label
                    className={`block text-sm font-medium ${themeClasses.text.primary} mb-2`}
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
                      DocsProjects.update(project.id, updatedProject);
                    }}
                    className={`w-full px-3 py-2 text-sm rounded-lg ${themeClasses.input.base} h-20 resize-none`}
                    placeholder="Enter project description"
                  />
                </div>

                <div>
                  <label
                    className={`block text-sm font-medium ${themeClasses.text.primary} mb-2`}
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
                        DocsProjects.update(project.id, updatedProject);
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
                    className={`block text-sm font-medium ${themeClasses.text.primary} mb-2`}
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
                      DocsProjects.update(project.id, updatedProject);
                    }}
                    className={`w-full px-3 py-2 text-sm rounded-lg ${themeClasses.input.base}`}
                    placeholder="https://api.example.com"
                  />
                </div>

                <div>
                  <label
                    className={`block text-sm font-medium ${themeClasses.text.primary} mb-2`}
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
                      DocsProjects.update(project.id, updatedProject);
                    }}
                    className={`w-full px-3 py-2 text-sm rounded-lg ${themeClasses.input.base}`}
                    placeholder="v1"
                  />
                </div>
              </div>
            </div>

            {/* Documentation Settings */}
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
                <div className="flex items-center justify-between">
                  <div>
                    <div
                      className={`text-sm font-medium ${themeClasses.text.primary}`}
                    >
                      Show Code Examples
                    </div>
                    <div className={`text-xs ${themeClasses.text.tertiary}`}>
                      Include cURL and code examples for each endpoint
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const newValue = !project.settings?.showExamples;
                      const updatedProject = {
                        ...project,
                        settings: {
                          ...project.settings,
                          showExamples: newValue,
                        },
                        updated: new Date().toISOString(),
                      };
                      setProject(updatedProject);
                      DocsProjects.update(project.id, updatedProject);
                    }}
                    className={`w-10 h-6 rounded-full transition-colors relative ${
                      project.settings?.showExamples !== false
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
                        project.settings?.showExamples !== false
                          ? "right-1"
                          : "left-1"
                      }`}
                    ></div>
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div
                      className={`text-sm font-medium ${themeClasses.text.primary}`}
                    >
                      Group by Collections
                    </div>
                    <div className={`text-xs ${themeClasses.text.tertiary}`}>
                      Organize endpoints by their collections
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const newValue = !project.settings?.groupByCollection;
                      const updatedProject = {
                        ...project,
                        settings: {
                          ...project.settings,
                          groupByCollection: newValue,
                        },
                        updated: new Date().toISOString(),
                      };
                      setProject(updatedProject);
                      DocsProjects.update(project.id, updatedProject);
                    }}
                    className={`w-10 h-6 rounded-full transition-colors relative ${
                      project.settings?.groupByCollection !== false
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
                        project.settings?.groupByCollection !== false
                          ? "right-1"
                          : "left-1"
                      }`}
                    ></div>
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div
                      className={`text-sm font-medium ${themeClasses.text.primary}`}
                    >
                      Public Access
                    </div>
                    <div className={`text-xs ${themeClasses.text.tertiary}`}>
                      Allow public access to your documentation
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const newValue = !project.settings?.isPublic;
                      const updatedProject = {
                        ...project,
                        settings: { ...project.settings, isPublic: newValue },
                        updated: new Date().toISOString(),
                      };
                      setProject(updatedProject);
                      DocsProjects.update(project.id, updatedProject);
                    }}
                    className={`w-10 h-6 rounded-full transition-colors relative ${
                      project.settings?.isPublic !== false
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
                        project.settings?.isPublic !== false
                          ? "right-1"
                          : "left-1"
                      }`}
                    ></div>
                  </button>
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
                        DocsProjects.delete(project.id);
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
                      <span className={`text-sm ${themeClasses.text.primary}`}>
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
                        <span
                          className={`text-sm ${themeClasses.text.primary}`}
                        >
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
