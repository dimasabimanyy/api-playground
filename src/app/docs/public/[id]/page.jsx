"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  BookOpen,
  Code,
  Copy,
  ExternalLink,
  Globe,
  Search,
  ChevronRight,
  ChevronDown,
  Terminal,
  FileText,
  Zap,
  Shield,
  Clock,
  CheckCircle,
  AlertTriangle,
  Info,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DocsProjects } from "@/lib/docs-storage";

const MethodBadge = ({ method }) => {
  const colors = {
    GET: "bg-green-100 text-green-700 border-green-200",
    POST: "bg-blue-100 text-blue-700 border-blue-200", 
    PUT: "bg-orange-100 text-orange-700 border-orange-200",
    PATCH: "bg-yellow-100 text-yellow-700 border-yellow-200",
    DELETE: "bg-red-100 text-red-700 border-red-200",
    HEAD: "bg-gray-100 text-gray-700 border-gray-200",
    OPTIONS: "bg-purple-100 text-purple-700 border-purple-200",
  };

  return (
    <span
      className={`px-2 py-1 text-xs font-mono font-semibold rounded-md border ${
        colors[method] || colors.GET
      }`}
    >
      {method}
    </span>
  );
};

const CodeBlock = ({ code, language = "json" }) => {
  const [copied, setCopied] = useState(false);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={copyCode}
        className="absolute top-3 right-3 p-2 text-gray-400 hover:text-gray-600 transition-colors"
        title="Copy code"
      >
        {copied ? (
          <CheckCircle className="w-4 h-4 text-green-500" />
        ) : (
          <Copy className="w-4 h-4" />
        )}
      </button>
      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto text-sm">
        <code className={`language-${language}`}>{code}</code>
      </pre>
    </div>
  );
};

const EndpointCard = ({ request, baseUrl }) => {
  const [expanded, setExpanded] = useState(false);

  const fullUrl = `${baseUrl}${request.url}`;

  const generateCurlExample = () => {
    let curl = `curl -X ${request.method} "${fullUrl}"`;
    
    if (request.headers && Object.keys(request.headers).length > 0) {
      Object.entries(request.headers).forEach(([key, value]) => {
        curl += ` \\\n  -H "${key}: ${value}"`;
      });
    }
    
    if (request.body && request.method !== "GET") {
      curl += ` \\\n  -d '${request.body}'`;
    }
    
    return curl;
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <MethodBadge method={request.method} />
          <div className="text-left">
            <div className="font-medium text-gray-900">{request.name}</div>
            <div className="text-sm text-gray-600 font-mono">{request.url}</div>
          </div>
        </div>
        {expanded ? (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronRight className="w-5 h-5 text-gray-400" />
        )}
      </button>
      
      {expanded && (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          {request.description && (
            <div className="mb-4">
              <h4 className="font-medium text-gray-900 mb-2">Description</h4>
              <p className="text-sm text-gray-600">{request.description}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                <Terminal className="w-4 h-4" />
                Request
              </h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <MethodBadge method={request.method} />
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                    {fullUrl}
                  </code>
                </div>
              </div>
            </div>

            {request.headers && Object.keys(request.headers).length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Headers</h4>
                <div className="bg-white border rounded p-3 text-sm">
                  {Object.entries(request.headers).map(([key, value]) => (
                    <div key={key} className="flex justify-between py-1">
                      <span className="font-mono text-gray-600">{key}:</span>
                      <span className="font-mono text-gray-900">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {request.body && request.method !== "GET" && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Request Body</h4>
                <CodeBlock code={request.body} language="json" />
              </div>
            )}

            <div>
              <h4 className="font-medium text-gray-900 mb-2">cURL Example</h4>
              <CodeBlock code={generateCurlExample()} language="bash" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function PublicDocPage() {
  const params = useParams();
  const [project, setProject] = useState(null);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCollection, setActiveCollection] = useState(null);

  useEffect(() => {
    if (params.id) {
      loadProject();
    }
  }, [params.id]);

  const loadProject = async () => {
    try {
      // Get project data
      const projects = DocsProjects.getAll();
      const projectData = projects[params.id];
      
      if (!projectData) {
        setLoading(false);
        return;
      }

      setProject(projectData);

      // Mock collections data since we don't have direct access in public view
      // In a real implementation, you'd fetch this from an API
      const mockCollections = [
        {
          id: "auth",
          name: "Authentication",
          description: "User authentication and authorization endpoints",
          requests: [
            {
              id: "login",
              name: "User Login",
              description: "Authenticate user with email and password",
              method: "POST",
              url: "/auth/login",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email: "user@example.com", password: "password123" }, null, 2)
            },
            {
              id: "register",
              name: "User Registration",
              description: "Create a new user account",
              method: "POST",
              url: "/auth/register",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email: "user@example.com", password: "password123", name: "John Doe" }, null, 2)
            }
          ]
        },
        {
          id: "users",
          name: "User Management",
          description: "CRUD operations for user management",
          requests: [
            {
              id: "get-users",
              name: "Get All Users",
              description: "Retrieve a list of all users",
              method: "GET",
              url: "/users",
              headers: { "Authorization": "Bearer {token}" }
            },
            {
              id: "get-user",
              name: "Get User by ID",
              description: "Retrieve a specific user by their ID",
              method: "GET",
              url: "/users/{id}",
              headers: { "Authorization": "Bearer {token}" }
            },
            {
              id: "update-user",
              name: "Update User",
              description: "Update user information",
              method: "PUT",
              url: "/users/{id}",
              headers: { 
                "Authorization": "Bearer {token}",
                "Content-Type": "application/json"
              },
              body: JSON.stringify({ name: "Updated Name", email: "updated@example.com" }, null, 2)
            },
            {
              id: "delete-user",
              name: "Delete User",
              description: "Delete a user account",
              method: "DELETE",
              url: "/users/{id}",
              headers: { "Authorization": "Bearer {token}" }
            }
          ]
        }
      ];

      setCollections(mockCollections);
      setActiveCollection(mockCollections[0]?.id);
      
    } catch (error) {
      console.error("Failed to load project:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEndpoints = () => {
    if (!searchQuery) return collections;
    
    return collections.map(collection => ({
      ...collection,
      requests: collection.requests.filter(request =>
        request.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.method.toLowerCase().includes(searchQuery.toLowerCase())
      )
    })).filter(collection => collection.requests.length > 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4 border-gray-300"></div>
          <p className="text-gray-600">Loading documentation...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            Documentation Not Found
          </h1>
          <p className="text-gray-600 mb-4">
            The documentation you're looking for doesn't exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  const baseUrl = project.settings?.baseUrl || "https://api.example.com";

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{project.name}</h1>
                <p className="text-sm text-gray-600">{project.description}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search endpoints..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Button variant="outline" size="sm">
                <Globe className="w-4 h-4 mr-2" />
                API Playground
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <h2 className="font-semibold text-gray-900 mb-4">Collections</h2>
              <nav className="space-y-1">
                {collections.map((collection) => (
                  <button
                    key={collection.id}
                    onClick={() => setActiveCollection(collection.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      activeCollection === collection.id
                        ? "bg-gray-100 text-gray-900 font-medium"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    {collection.name}
                    <div className="text-xs text-gray-500 mt-1">
                      {collection.requests.length} endpoint{collection.requests.length !== 1 ? 's' : ''}
                    </div>
                  </button>
                ))}
              </nav>

              {/* Base URL Info */}
              <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Base URL</h3>
                <code className="text-sm bg-gray-100 px-2 py-1 rounded block break-all">
                  {baseUrl}
                </code>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {filteredEndpoints().map((collection) => (
              <div key={collection.id} className="mb-12">
                {(!activeCollection || activeCollection === collection.id) && (
                  <>
                    <div className="mb-6">
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        {collection.name}
                      </h2>
                      <p className="text-gray-600">{collection.description}</p>
                    </div>

                    <div className="space-y-4">
                      {collection.requests.map((request) => (
                        <EndpointCard
                          key={request.id}
                          request={request}
                          baseUrl={baseUrl}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            ))}

            {filteredEndpoints().length === 0 && searchQuery && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No endpoints found
                </h3>
                <p className="text-gray-600">
                  Try adjusting your search terms or browse all collections.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center text-sm text-gray-600">
            <p>Generated with API Playground • Last updated {new Date(project.updated).toLocaleDateString()}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}