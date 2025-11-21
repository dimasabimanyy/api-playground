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
  Home,
  ArrowLeft,
  Menu,
  Hash,
  Code2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DocsProjects } from "@/lib/docs-storage";

// Table of Contents Component
const TableOfContents = ({ collections, activeSection, onSectionClick }) => {
  return (
    <div className="sticky top-24 space-y-4">
      <div className="text-sm font-medium text-slate-900 mb-3">On this page</div>
      <div className="space-y-2 text-sm">
        {collections.map((collection) => (
          <div key={collection.id} className="space-y-1">
            <button
              onClick={() => onSectionClick(collection.id)}
              className={`block text-left hover:text-slate-900 transition-colors ${
                activeSection === collection.id
                  ? "text-slate-900 font-medium"
                  : "text-slate-600"
              }`}
            >
              {collection.name}
            </button>
            <div className="ml-4 space-y-1">
              {collection.requests.map((request) => (
                <button
                  key={request.id}
                  onClick={() => onSectionClick(`endpoint-${request.id}`)}
                  className={`block text-left text-xs hover:text-slate-700 transition-colors ${
                    activeSection === `endpoint-${request.id}`
                      ? "text-slate-700 font-medium"
                      : "text-slate-500"
                  }`}
                >
                  {request.name}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const MethodBadge = ({ method }) => {
  const colors = {
    GET: "bg-emerald-100 text-emerald-700 border-emerald-200",
    POST: "bg-blue-100 text-blue-700 border-blue-200", 
    PUT: "bg-amber-100 text-amber-700 border-amber-200",
    PATCH: "bg-orange-100 text-orange-700 border-orange-200",
    DELETE: "bg-red-100 text-red-700 border-red-200",
    HEAD: "bg-gray-100 text-gray-700 border-gray-200",
    OPTIONS: "bg-purple-100 text-purple-700 border-purple-200",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 text-xs font-mono font-semibold rounded-full border ${
        colors[method] || colors.GET
      }`}
    >
      {method}
    </span>
  );
};

const CodeBlock = ({ code, language = "json", tabs = null, title = null }) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState(tabs ? tabs[0].key : language);

  const copyCode = async () => {
    try {
      const codeToShow = tabs ? tabs.find(tab => tab.key === activeTab)?.code || code : code;
      await navigator.clipboard.writeText(codeToShow);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const codeToShow = tabs ? tabs.find(tab => tab.key === activeTab)?.code || code : code;

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
      {/* Header with tabs and copy button */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center gap-3">
          {title && (
            <span className="text-slate-300 text-sm font-medium">{title}</span>
          )}
          {tabs && (
            <div className="flex items-center gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-3 py-1.5 text-xs font-mono rounded-md transition-colors ${
                    activeTab === tab.key
                      ? "bg-slate-800 text-white"
                      : "text-slate-400 hover:text-slate-300 hover:bg-slate-800/50"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}
        </div>
        <button
          onClick={copyCode}
          className="p-2 text-slate-400 hover:text-slate-200 transition-colors rounded-md hover:bg-slate-800"
          title="Copy code"
        >
          {copied ? (
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </button>
      </div>
      
      {/* Code content */}
      <pre className="p-4 text-sm text-slate-100 overflow-x-auto bg-slate-950">
        <code className={`language-${tabs ? activeTab : language}`}>{codeToShow}</code>
      </pre>
    </div>
  );
};

const EndpointCard = ({ request, baseUrl }) => {
  const fullUrl = `${baseUrl}${request.url}`;
  const endpointId = `endpoint-${request.id}`;

  const generateCodeExamples = () => {
    const examples = [];

    // cURL Example
    let curl = `curl -X ${request.method} "${fullUrl}"`;
    if (request.headers && Object.keys(request.headers).length > 0) {
      Object.entries(request.headers).forEach(([key, value]) => {
        curl += ` \\\n  -H "${key}: ${value}"`;
      });
    }
    if (request.body && request.method !== "GET") {
      curl += ` \\\n  -d '${request.body}'`;
    }
    examples.push({ key: "curl", label: "cURL", code: curl });

    // JavaScript Example
    const jsCode = `fetch('${fullUrl}', {
  method: '${request.method}',${request.headers && Object.keys(request.headers).length > 0 ? `
  headers: ${JSON.stringify(request.headers, null, 4)},` : ''}${request.body && request.method !== "GET" ? `
  body: JSON.stringify(${request.body})` : ''}
})
.then(response => response.json())
.then(data => console.log(data));`;
    examples.push({ key: "javascript", label: "JavaScript", code: jsCode });

    // Python Example
    const pythonCode = `import requests${request.body && request.method !== "GET" ? `
import json` : ''}

url = "${fullUrl}"${request.headers && Object.keys(request.headers).length > 0 ? `
headers = ${JSON.stringify(request.headers, null, 4).replace(/"/g, "'").replace(/'/g, '"')}` : ''}${request.body && request.method !== "GET" ? `
data = ${request.body}` : ''}

response = requests.${request.method.toLowerCase()}(url${request.headers && Object.keys(request.headers).length > 0 ? ', headers=headers' : ''}${request.body && request.method !== "GET" ? ', json=data' : ''})
print(response.json())`;
    examples.push({ key: "python", label: "Python", code: pythonCode });

    return examples;
  };

  const generateResponse = () => {
    return `{
  "status": "success",
  "data": {
    "id": "12345",
    "created_at": "2024-01-15T10:30:00Z"
  }
}`;
  };

  return (
    <div className="mb-16" id={endpointId}>
      {/* Endpoint Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <MethodBadge method={request.method} />
          <h3 className="text-2xl font-semibold text-slate-900">{request.name}</h3>
          <button
            onClick={() => {
              navigator.clipboard.writeText(`${window.location.origin}${window.location.pathname}#${endpointId}`);
            }}
            className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
            title="Copy link to this section"
          >
            <Hash className="w-4 h-4" />
          </button>
        </div>
        
        <div className="mb-4">
          <code className="text-base font-mono px-4 py-3 bg-slate-100 text-slate-800 rounded-lg border inline-block">
            {request.method} {request.url}
          </code>
        </div>
        
        {request.description && (
          <p className="text-slate-600 leading-relaxed text-lg">{request.description}</p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left Column - Request Details */}
        <div className="space-y-8">
          {/* Headers */}
          {request.headers && Object.keys(request.headers).length > 0 && (
            <div>
              <h4 className="font-semibold text-slate-900 mb-4 flex items-center gap-2 text-lg">
                <Code2 className="w-5 h-5" />
                Headers
              </h4>
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                  <div className="grid grid-cols-2 gap-4 text-sm font-semibold text-slate-700">
                    <span>Name</span>
                    <span>Value</span>
                  </div>
                </div>
                <div className="divide-y divide-slate-200">
                  {Object.entries(request.headers).map(([key, value]) => (
                    <div key={key} className="grid grid-cols-2 gap-4 px-4 py-3">
                      <span className="font-mono text-slate-600 text-sm">{key}</span>
                      <span className="font-mono text-slate-900 text-sm">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Request Body */}
          {request.body && request.method !== "GET" && (
            <div>
              <h4 className="font-semibold text-slate-900 mb-4 text-lg">Request Body</h4>
              <CodeBlock 
                code={request.body} 
                language="json" 
                title="JSON"
              />
            </div>
          )}

          {/* Response */}
          <div>
            <h4 className="font-semibold text-slate-900 mb-4 text-lg">Response</h4>
            <CodeBlock 
              code={generateResponse()} 
              language="json" 
              title="200 OK"
            />
          </div>
        </div>

        {/* Right Column - Code Examples */}
        <div className="space-y-8">
          <div>
            <h4 className="font-semibold text-slate-900 mb-4 text-lg">Code Examples</h4>
            <CodeBlock 
              tabs={generateCodeExamples()}
              title="Request Examples"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default function PublicUserDocPage() {
  const params = useParams();
  const { username, projectName } = params;
  
  const [project, setProject] = useState(null);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCollection, setActiveCollection] = useState(null);
  const [activeSection, setActiveSection] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (username && projectName) {
      loadProjectByUsernameAndName();
    }
  }, [username, projectName]);

  // Handle scroll for active section detection
  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll('[id^="endpoint-"], [id^="collection-"]');
      const scrollY = window.scrollY + 100;

      sections.forEach((section) => {
        const top = section.offsetTop;
        const bottom = top + section.offsetHeight;
        
        if (scrollY >= top && scrollY < bottom) {
          setActiveSection(section.id);
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const loadProjectByUsernameAndName = async () => {
    try {
      // Get all projects and find by username and project name
      const allProjects = DocsProjects.getAll();
      
      // Find project that matches both username and project name
      // In a real app, you'd have a database lookup by username and project slug
      let foundProject = null;
      
      for (const projectId in allProjects) {
        const project = allProjects[projectId];
        const projectSlug = project.name.toLowerCase().replace(/\s+/g, '-');
        
        // For now, we'll use a simple match - in production you'd have proper user/project relationship
        if (projectSlug === projectName) {
          foundProject = project;
          break;
        }
      }

      if (!foundProject) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setProject(foundProject);

      // Mock collections data for demo - in real app, this would come from the project
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
            },
            {
              id: "refresh",
              name: "Refresh Token",
              description: "Refresh the authentication token",
              method: "POST",
              url: "/auth/refresh",
              headers: { 
                "Content-Type": "application/json",
                "Authorization": "Bearer {refreshToken}"
              },
              body: ""
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
        },
        {
          id: "products",
          name: "Product Management",
          description: "Product catalog and inventory management",
          requests: [
            {
              id: "get-products",
              name: "List Products",
              description: "Get a paginated list of all products",
              method: "GET",
              url: "/products",
              headers: {},
              body: ""
            },
            {
              id: "create-product",
              name: "Create Product",
              description: "Add a new product to the catalog",
              method: "POST",
              url: "/products",
              headers: {
                "Authorization": "Bearer {token}",
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                name: "New Product",
                description: "Product description",
                price: 29.99,
                category: "electronics"
              }, null, 2)
            }
          ]
        }
      ];

      setCollections(mockCollections);
      setActiveCollection(mockCollections[0]?.id);
      
    } catch (error) {
      console.error("Failed to load project:", error);
      setNotFound(true);
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

  const handleSectionClick = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4 border-slate-300"></div>
          <p className="text-slate-600">Loading documentation...</p>
        </div>
      </div>
    );
  }

  if (notFound || !project) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-slate-400" />
          </div>
          <h1 className="text-xl font-semibold text-slate-900 mb-2">
            Documentation Not Found
          </h1>
          <p className="text-slate-600 mb-6">
            The documentation for <strong>{username}/{projectName}</strong> doesn't exist or has been removed.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Button variant="outline" asChild>
              <Link href="/">
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const baseUrl = project.settings?.baseUrl || "https://api.example.com";

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold text-slate-900">{project.name}</h1>
                    <span className="text-sm text-slate-500">by @{username}</span>
                  </div>
                  <p className="text-sm text-slate-600">{project.description}</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search endpoints..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden"
              >
                <Menu className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/">
                  <Globe className="w-4 h-4 mr-2" />
                  API Playground
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto">
        <div className="flex">
          {/* Left Sidebar - Navigation */}
          <div className={`w-64 border-r border-slate-200 bg-white fixed lg:sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto z-40 transform transition-transform ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}>
            <div className="p-6 space-y-6">
              <div>
                <div className="text-sm text-slate-500 mb-2">Documentation by</div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-slate-300 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-slate-700">
                      {username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="font-medium text-slate-900">@{username}</span>
                </div>
              </div>
              
              <div>
                <h2 className="font-semibold text-slate-900 mb-4">Collections</h2>
                <nav className="space-y-2">
                  {collections.map((collection) => (
                    <div key={collection.id} className="space-y-1">
                      <button
                        onClick={() => handleSectionClick(`collection-${collection.id}`)}
                        className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-900 hover:bg-slate-100 transition-colors"
                      >
                        {collection.name}
                      </button>
                      <div className="ml-4 space-y-1">
                        {collection.requests.map((request) => (
                          <button
                            key={request.id}
                            onClick={() => handleSectionClick(`endpoint-${request.id}`)}
                            className="w-full text-left px-3 py-1.5 rounded-md text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors flex items-center gap-2"
                          >
                            <MethodBadge method={request.method} />
                            <span className="truncate">{request.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </nav>
              </div>

              {/* Base URL Info */}
              <div className="p-4 bg-slate-50 rounded-lg">
                <h3 className="font-medium text-slate-900 mb-2">Base URL</h3>
                <code className="text-sm bg-slate-100 px-2 py-1 rounded block break-all">
                  {baseUrl}
                </code>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 lg:flex">
            {/* Content */}
            <div className="flex-1 max-w-4xl px-6 py-8">
              {filteredEndpoints().map((collection) => (
                <div key={collection.id} className="mb-16" id={`collection-${collection.id}`}>
                  <div className="mb-12">
                    <h2 className="text-3xl font-bold text-slate-900 mb-4">
                      {collection.name}
                    </h2>
                    <p className="text-lg text-slate-600 leading-relaxed">{collection.description}</p>
                  </div>

                  <div className="space-y-16">
                    {collection.requests.map((request) => (
                      <EndpointCard
                        key={request.id}
                        request={request}
                        baseUrl={baseUrl}
                      />
                    ))}
                  </div>
                </div>
              ))}

              {filteredEndpoints().length === 0 && searchQuery && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    No endpoints found
                  </h3>
                  <p className="text-slate-600">
                    Try adjusting your search terms or browse all collections.
                  </p>
                </div>
              )}
            </div>

            {/* Right TOC */}
            <div className="hidden xl:block w-64 p-6">
              <TableOfContents
                collections={collections}
                activeSection={activeSection}
                onSectionClick={handleSectionClick}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-50 py-8 mt-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center text-sm text-slate-600">
            <p>
              Documentation by <strong>@{username}</strong> • Generated with API Playground • 
              Last updated {new Date(project.updated).toLocaleDateString()}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}