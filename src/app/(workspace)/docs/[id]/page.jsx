"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Globe,
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
  BookOpen,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { useCollections } from "@/contexts/CollectionsContext";
import { getThemeClasses } from "@/lib/theme";
import { DocsProjects, DocsMetadata } from "@/lib/docs-storage";
import { generateUsername, generatePublicDocUrl } from "@/lib/user-utils";

const StatCard = ({ icon: Icon, label, value, trend, trendLabel, isDark, themeClasses }) => (
  <div
    className={`p-4 border rounded-lg ${
      isDark
        ? "border-gray-800 bg-gray-900/50"
        : "border-gray-200 bg-white"
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
      <span className={`text-sm font-medium ${themeClasses.text.primary}`}>
        {label}
      </span>
    </div>
    <div className="space-y-1">
      <div className={`text-2xl font-bold ${themeClasses.text.primary}`}>
        {value}
      </div>
      {trend && (
        <div className="flex items-center gap-1">
          <TrendingUp className={`w-3 h-3 ${trend > 0 ? 'text-green-500' : 'text-red-500'}`} />
          <span className={`text-xs ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
            {trend > 0 ? '+' : ''}{trend}% {trendLabel}
          </span>
        </div>
      )}
    </div>
  </div>
);

const ActivityItem = ({ icon: Icon, title, description, time, status, isDark, themeClasses }) => (
  <div className="flex items-start gap-3 py-3">
    <div
      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
        status === 'success'
          ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
          : status === 'warning'
          ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400'
          : status === 'error'
          ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
          : isDark
          ? 'bg-gray-800 text-gray-300'
          : 'bg-gray-100 text-gray-600'
      }`}
    >
      <Icon className="w-4 h-4" />
    </div>
    <div className="flex-1 min-w-0">
      <div className={`text-sm font-medium ${themeClasses.text.primary}`}>
        {title}
      </div>
      <div className={`text-xs ${themeClasses.text.secondary} mt-1`}>
        {description}
      </div>
      <div className={`text-xs ${themeClasses.text.tertiary} mt-1`}>
        {time}
      </div>
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
    window.open(`/docs/generated?docId=${docId}&project=${project.id}`, "_blank");
  };

  const deleteProject = () => {
    if (confirm(`Are you sure you want to delete "${project.name}"? This action cannot be undone.`)) {
      DocsProjects.delete(project.id);
      router.push("/docs");
    }
  };

  const duplicateProject = () => {
    const duplicated = DocsProjects.duplicate(project.id, `${project.name} Copy`);
    if (duplicated) {
      router.push(`/docs/${duplicated.id}`);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${themeClasses.bg.primary} flex items-center justify-center`}>
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4 border-gray-300"></div>
          <p className={themeClasses.text.secondary}>Loading project...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className={`min-h-screen ${themeClasses.bg.primary} flex items-center justify-center`}>
        <div className="text-center">
          <h1 className={`text-xl font-semibold ${themeClasses.text.primary} mb-2`}>
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
      status: "success"
    },
    {
      icon: Eye,
      title: "Public view accessed",
      description: "Documentation viewed 15 times",
      time: "5 hours ago",
      status: "info"
    },
    {
      icon: GitBranch,
      title: "Collections modified",
      description: "3 endpoints added to User Management",
      time: "1 day ago",
      status: "success"
    },
    {
      icon: Share2,
      title: "Documentation shared",
      description: "Public link copied to clipboard",
      time: "2 days ago",
      status: "info"
    }
  ];

  return (
    <div className={`min-h-screen ${themeClasses.bg.primary}`}>
      {/* Header */}
      <div className={`border-b ${themeClasses.border.primary} ${themeClasses.bg.primary}`}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/docs"
                className={`p-2 rounded-lg transition-colors ${themeClasses.button.ghost}`}
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className={`text-2xl font-bold ${themeClasses.text.primary}`}>
                  {project.name}
                </h1>
                <p className={`text-sm ${themeClasses.text.tertiary}`}>
                  {generatePublicUrl() ? generatePublicUrl().replace('https://', '').replace('http://', '') : 'Public URL will be available once published'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                onClick={copyPublicUrl}
                variant="outline"
                size="sm"
                className={`${themeClasses.button.secondary}`}
                disabled={!generatePublicUrl()}
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy URL
              </Button>
              <Button
                onClick={viewDocumentation}
                variant="outline"
                size="sm"
                className={`${themeClasses.button.secondary}`}
              >
                <Eye className="w-4 h-4 mr-2" />
                View Docs
              </Button>
              <Button
                onClick={() => window.open(generatePublicUrl(), "_blank")}
                className={`${
                  isDark
                    ? "bg-white text-black hover:bg-gray-200"
                    : "bg-black text-white hover:bg-gray-800"
                }`}
                size="sm"
                disabled={!generatePublicUrl()}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Open Public
              </Button>
              
              <div className="relative">
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
              </div>
            </div>
          </div>
          
          {/* Navigation Tabs */}
          <div className="flex items-center gap-6 mt-6">
            {[
              { id: "overview", label: "Overview", icon: BarChart3 },
              { id: "content", label: "Content", icon: BookOpen },
              { id: "settings", label: "Settings", icon: Settings },
              { id: "analytics", label: "Analytics", icon: Activity },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 px-1 py-2 text-sm font-medium transition-colors border-b-2 ${
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
            {/* Production Status Card */}
            <div
              className={`p-6 border rounded-xl ${
                isDark
                  ? "border-gray-800 bg-gradient-to-br from-gray-900/50 to-gray-800/30"
                  : "border-gray-200 bg-gradient-to-br from-white to-gray-50/50"
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className={`font-semibold ${themeClasses.text.primary}`}>
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
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className={`text-sm ${themeClasses.text.secondary} mb-1`}>
                    Public URL
                  </div>
                  <div className={`text-sm font-mono ${themeClasses.text.primary} break-all`}>
                    {generatePublicUrl() || 'Not yet published'}
                  </div>
                </div>
                <div>
                  <div className={`text-sm ${themeClasses.text.secondary} mb-1`}>
                    Last Updated
                  </div>
                  <div className={`text-sm ${themeClasses.text.primary}`}>
                    {new Date(project.updated).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
                <div>
                  <div className={`text-sm ${themeClasses.text.secondary} mb-1`}>
                    Status
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className={`text-sm ${themeClasses.text.primary}`}>
                      Healthy
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Stats */}
              <div className="lg:col-span-2">
                <h2 className={`text-lg font-semibold ${themeClasses.text.primary} mb-4`}>
                  Documentation Stats
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
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

                {/* Collections Overview */}
                <div
                  className={`p-6 border rounded-xl ${
                    isDark
                      ? "border-gray-800 bg-gray-900/50"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  <h3 className={`font-semibold ${themeClasses.text.primary} mb-4`}>
                    Collections in this Documentation
                  </h3>
                  <div className="space-y-3">
                    {project.collections?.map((collectionId) => {
                      const collection = collections[collectionId];
                      if (!collection) return null;
                      
                      return (
                        <div key={collectionId} className="flex items-center justify-between py-2">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                isDark ? "bg-gray-800 text-gray-300" : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              <FileText className="w-4 h-4" />
                            </div>
                            <div>
                              <div className={`font-medium ${themeClasses.text.primary}`}>
                                {collection.name}
                              </div>
                              <div className={`text-sm ${themeClasses.text.secondary}`}>
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

              {/* Activity Feed */}
              <div>
                <h2 className={`text-lg font-semibold ${themeClasses.text.primary} mb-4`}>
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

        {activeTab === "content" && (
          <div>
            <h2 className={`text-lg font-semibold ${themeClasses.text.primary} mb-4`}>
              Content Management
            </h2>
            <p className={themeClasses.text.secondary}>
              Content management features coming soon...
            </p>
          </div>
        )}

        {activeTab === "settings" && (
          <div>
            <h2 className={`text-lg font-semibold ${themeClasses.text.primary} mb-4`}>
              Project Settings
            </h2>
            <p className={themeClasses.text.secondary}>
              Settings panel coming soon...
            </p>
          </div>
        )}

        {activeTab === "analytics" && (
          <div>
            <h2 className={`text-lg font-semibold ${themeClasses.text.primary} mb-4`}>
              Analytics & Insights
            </h2>
            <p className={themeClasses.text.secondary}>
              Analytics dashboard coming soon...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}