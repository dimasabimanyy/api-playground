"use client";

import { useState } from "react";
import {
  Search,
  ChevronRight,
  Copy,
  CheckCircle,
  Hash,
  Code2,
  FileText,
  Globe,
  Menu,
  X,
} from "lucide-react";

// Method Badge Component
const MethodBadge = ({ method, size = "sm" }) => {
  const colors = {
    GET: "bg-emerald-50 text-emerald-700 border-emerald-200",
    POST: "bg-blue-50 text-blue-700 border-blue-200",
    PUT: "bg-amber-50 text-amber-700 border-amber-200",
    PATCH: "bg-orange-50 text-orange-700 border-orange-200",
    DELETE: "bg-red-50 text-red-700 border-red-200",
    HEAD: "bg-gray-50 text-gray-700 border-gray-200",
    OPTIONS: "bg-purple-50 text-purple-700 border-purple-200",
  };

  const sizeClasses = {
    xs: "px-1.5 py-0.5 text-xs",
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-sm",
  };

  return (
    <span
      className={`inline-flex items-center font-mono font-semibold rounded border ${
        colors[method] || colors.GET
      } ${sizeClasses[size]}`}
    >
      {method}
    </span>
  );
};

// Code Block Component
const CodeBlock = ({ code, language = "json", tabs = null, title = null }) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState(tabs ? tabs[0].key : language);

  const copyCode = async () => {
    try {
      const codeToShow = tabs
        ? tabs.find((tab) => tab.key === activeTab)?.code || code
        : code;
      await navigator.clipboard.writeText(codeToShow);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const codeToShow = tabs
    ? tabs.find((tab) => tab.key === activeTab)?.code || code
    : code;

  return (
    <div className="bg-gray-950 border border-gray-800 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-gray-900 border-b border-gray-800">
        <div className="flex items-center gap-3">
          {title && (
            <span className="text-gray-300 text-sm font-medium">{title}</span>
          )}
          {tabs && (
            <div className="flex items-center gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-2.5 py-1 text-xs font-mono rounded-lg transition-colors ${
                    activeTab === tab.key
                      ? "bg-gray-800 text-white"
                      : "text-gray-400 hover:text-gray-300 hover:bg-gray-800/50"
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
          className="p-1.5 text-gray-400 hover:text-gray-200 transition-colors rounded-lg hover:bg-gray-800"
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
      <pre className="p-4 text-sm text-gray-100 overflow-x-auto bg-gray-950 min-h-[60px]">
        <code className={`language-${tabs ? activeTab : language}`}>
          {codeToShow}
        </code>
      </pre>
    </div>
  );
};

// Parameter Row Component
const ParameterRow = ({ name, type, required, description, example }) => (
  <tr className="border-b border-gray-100">
    <td className="py-3 pr-4">
      <div className="flex items-center gap-2">
        <code className="text-sm font-mono text-gray-900">{name}</code>
        {required && (
          <span className="text-xs text-red-500 font-medium">required</span>
        )}
      </div>
    </td>
    <td className="py-3 pr-4">
      <code className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-lg">
        {type}
      </code>
    </td>
    <td className="py-3 pr-4 text-sm text-gray-600">{description}</td>
    {example && (
      <td className="py-3">
        <code className="text-xs text-gray-500">{example}</code>
      </td>
    )}
  </tr>
);

// Sidebar Navigation
const Sidebar = ({
  activeSection,
  onSectionClick,
  username,
  project,
  isOpen,
  onClose,
}) => {
  // Hardcoded navigation structure
  const navigationItems = [
    {
      id: "introduction",
      name: "Introduction",
      type: "section",
      children: [
        { id: "overview", name: "Overview", method: null },
        { id: "getting-started", name: "Getting Started", method: null },
        { id: "quickstart", name: "Quick Start Guide", method: null },
      ],
    },
    {
      id: "authentication",
      name: "Authentication",
      type: "section",
      children: [
        { id: "basic-auth", name: "Basic Authentication", method: null },
        { id: "api-keys", name: "API Keys", method: null },
        { id: "oauth2", name: "OAuth 2.0", method: null },
      ],
    },
    {
      id: "endpoints",
      name: "API Endpoints",
      type: "section",
      children: [
        { id: "users", name: "Get Users", method: "GET" },
        { id: "create-user", name: "Create User", method: "POST" },
        { id: "update-user", name: "Update User", method: "PUT" },
        { id: "delete-user", name: "Delete User", method: "DELETE" },
      ],
    },
    {
      id: "resources",
      name: "Resources",
      type: "section",
      children: [
        { id: "products", name: "Get Products", method: "GET" },
        { id: "create-product", name: "Create Product", method: "POST" },
        { id: "orders", name: "Get Orders", method: "GET" },
        { id: "webhooks", name: "Webhooks", method: null },
      ],
    },
    {
      id: "guides",
      name: "Guides",
      type: "section",
      children: [
        { id: "rate-limiting", name: "Rate Limiting", method: null },
        { id: "error-handling", name: "Error Handling", method: null },
        { id: "pagination", name: "Pagination", method: null },
        { id: "testing", name: "Testing", method: null },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <div
        className={`lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] w-full lg:w-80 bg-white z-50 transform transition-transform duration-300 overflow-y-auto scrollbar-hide hover:scrollbar-show ${
          isOpen
            ? "translate-x-0 fixed inset-0"
            : "-translate-x-full lg:translate-x-0 lg:relative"
        }`}
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.scrollbarWidth = 'thin';
          e.currentTarget.style.msOverflowStyle = 'auto';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.scrollbarWidth = 'none';
          e.currentTarget.style.msOverflowStyle = 'none';
        }}
      >
        {/* Navigation */}
        <div className="p-6">
          <nav className="space-y-6">
            {navigationItems.map((section) => (
              <div key={section.id} className="space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                    {section.name}
                  </h3>
                </div>
                <div className="ml-3 space-y-0.5">
                  {section.children.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => onSectionClick(item.id)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-colors flex items-center gap-2 ${
                        activeSection === item.id
                          ? "bg-blue-50 text-blue-700 font-medium"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                      }`}
                    >
                      {item.method && (
                        <MethodBadge method={item.method} size="xs" />
                      )}
                      <span className="truncate">{item.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Quick Links */}
        <div className="p-6 border-t border-gray-200 mt-auto">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">
            Quick Links
          </h3>
          <div className="space-y-2">
            <a
              href="#"
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <Globe className="w-4 h-4" />
              API Status
            </a>
            <a
              href="#"
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <FileText className="w-4 h-4" />
              Changelog
            </a>
            <a
              href="#"
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <Code2 className="w-4 h-4" />
              SDKs & Libraries
            </a>
          </div>
        </div>

        {/* Base URL */}
        <div className="p-6 border-t border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Base URL</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Production</span>
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            </div>
            <code className="text-sm bg-gray-100 px-3 py-2 rounded-xl block break-all text-gray-700">
              https://api.example.com/v1
            </code>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-gray-500">Sandbox</span>
              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
            </div>
            <code className="text-sm bg-gray-100 px-3 py-2 rounded-xl block break-all text-gray-700">
              https://api-test.example.com/v1
            </code>
          </div>
        </div>
      </div>
    </>
  );
};

// Table of Contents Component - Dynamic based on active section
const TableOfContents = ({ activeSection, onSectionClick }) => {
  // Define which sections have sub-content and what their TOC should show
  const sectionTocMap = {
    // Introduction section - has overview, getting-started, quickstart
    'overview': [
      { id: 'overview', title: 'Overview', level: 1 },
      { id: 'getting-started', title: 'Getting Started', level: 1 },
      { id: 'quickstart', title: 'Quick Start Guide', level: 1 }
    ],
    'getting-started': [
      { id: 'overview', title: 'Overview', level: 1 },
      { id: 'getting-started', title: 'Getting Started', level: 1 },
      { id: 'quickstart', title: 'Quick Start Guide', level: 1 }
    ],
    'quickstart': [
      { id: 'overview', title: 'Overview', level: 1 },
      { id: 'getting-started', title: 'Getting Started', level: 1 },
      { id: 'quickstart', title: 'Quick Start Guide', level: 1 }
    ],
    // Authentication section - has multiple auth methods
    'authentication': [
      { id: 'authentication', title: 'Authentication', level: 1 },
      { id: 'basic-auth', title: 'Basic Authentication', level: 2 },
      { id: 'api-keys', title: 'API Keys', level: 2 },
      { id: 'oauth2', title: 'OAuth 2.0', level: 2 }
    ],
    'basic-auth': [
      { id: 'authentication', title: 'Authentication', level: 1 },
      { id: 'basic-auth', title: 'Basic Authentication', level: 2 },
      { id: 'api-keys', title: 'API Keys', level: 2 },
      { id: 'oauth2', title: 'OAuth 2.0', level: 2 }
    ],
    'api-keys': [
      { id: 'authentication', title: 'Authentication', level: 1 },
      { id: 'basic-auth', title: 'Basic Authentication', level: 2 },
      { id: 'api-keys', title: 'API Keys', level: 2 },
      { id: 'oauth2', title: 'OAuth 2.0', level: 2 }
    ],
    'oauth2': [
      { id: 'authentication', title: 'Authentication', level: 1 },
      { id: 'basic-auth', title: 'Basic Authentication', level: 2 },
      { id: 'api-keys', title: 'API Keys', level: 2 },
      { id: 'oauth2', title: 'OAuth 2.0', level: 2 }
    ],
    // Error handling section
    'error-handling': [
      { id: 'error-handling', title: 'Error Handling', level: 1 },
      { id: 'common-errors', title: 'Common Errors', level: 2 },
      { id: 'error-codes', title: 'Error Codes', level: 2 }
    ],
    'common-errors': [
      { id: 'error-handling', title: 'Error Handling', level: 1 },
      { id: 'common-errors', title: 'Common Errors', level: 2 },
      { id: 'error-codes', title: 'Error Codes', level: 2 }
    ],
    'error-codes': [
      { id: 'error-handling', title: 'Error Handling', level: 1 },
      { id: 'common-errors', title: 'Common Errors', level: 2 },
      { id: 'error-codes', title: 'Error Codes', level: 2 }
    ],
    // Webhooks section
    'webhooks': [
      { id: 'webhooks', title: 'Webhooks', level: 1 },
      { id: 'webhook-security', title: 'Webhook Security', level: 2 }
    ],
    'webhook-security': [
      { id: 'webhooks', title: 'Webhooks', level: 1 },
      { id: 'webhook-security', title: 'Webhook Security', level: 2 }
    ],
    // Individual endpoint sections - these have their own structure
    'users': [
      { id: 'users', title: 'Get Users', level: 1 },
      { id: 'users-query-params', title: 'Query Parameters', level: 2 },
      { id: 'users-response', title: 'Response', level: 2 }
    ],
    'create-user': [
      { id: 'create-user', title: 'Create User', level: 1 },
      { id: 'create-user-request', title: 'Request Body', level: 2 },
      { id: 'create-user-example', title: 'Example Request', level: 2 },
      { id: 'create-user-response', title: 'Response', level: 2 }
    ],
    'update-user': [
      { id: 'update-user', title: 'Update User', level: 1 },
      { id: 'update-user-params', title: 'Path Parameters', level: 2 },
      { id: 'update-user-response', title: 'Response', level: 2 }
    ],
    'delete-user': [
      { id: 'delete-user', title: 'Delete User', level: 1 },
      { id: 'delete-user-params', title: 'Path Parameters', level: 2 },
      { id: 'delete-user-warning', title: 'Warning', level: 2 },
      { id: 'delete-user-response', title: 'Response', level: 2 }
    ],
    'products': [
      { id: 'products', title: 'Get Products', level: 1 },
      { id: 'products-query-params', title: 'Query Parameters', level: 2 },
      { id: 'products-response', title: 'Response', level: 2 }
    ],
    'create-product': [
      { id: 'create-product', title: 'Create Product', level: 1 },
      { id: 'create-product-request', title: 'Request Body', level: 2 },
      { id: 'create-product-response', title: 'Response', level: 2 }
    ],
    'orders': [
      { id: 'orders', title: 'Get Orders', level: 1 },
      { id: 'orders-query-params', title: 'Query Parameters', level: 2 },
      { id: 'orders-response', title: 'Response', level: 2 }
    ]
  };

  // Get the TOC items for the current active section
  const currentTocItems = sectionTocMap[activeSection] || [];

  // Don't show TOC if there are no items for this section
  if (currentTocItems.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-sm font-semibold text-gray-900">In This Page</h3>
      </div>
      <nav className="space-y-0.5">
        {currentTocItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onSectionClick(item.id)}
            className={`block w-full text-left text-sm transition-colors py-1.5 px-2 rounded-xl ${
              item.level === 1 ? "ml-0" : "ml-3"
            } ${
              activeSection === item.id
                ? "text-blue-600 font-medium bg-blue-50"
                : item.level === 1
                ? "text-gray-900 hover:text-blue-600 hover:bg-gray-50 font-medium"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            {item.title}
          </button>
        ))}
      </nav>
    </div>
  );
};

// Code Examples Sidebar
const CodeExamplesSidebar = ({
  request,
  baseUrl,
  activeSection,
  onSectionClick,
}) => {
  const fullUrl = `${baseUrl}${request.url}`;

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
  method: '${request.method}',${
      request.headers && Object.keys(request.headers).length > 0
        ? `
  headers: ${JSON.stringify(request.headers, null, 2)},`
        : ""
    }${
      request.body && request.method !== "GET"
        ? `
  body: JSON.stringify(${request.body})`
        : ""
    }
})
.then(response => response.json())
.then(data => console.log(data));`;
    examples.push({ key: "javascript", label: "JavaScript", code: jsCode });

    // Python Example
    const pythonCode = `import requests${
      request.body && request.method !== "GET"
        ? `
import json`
        : ""
    }

url = "${fullUrl}"${
      request.headers && Object.keys(request.headers).length > 0
        ? `
headers = ${JSON.stringify(request.headers, null, 2)
            .replace(/"/g, "'")
            .replace(/'/g, '"')}`
        : ""
    }${
      request.body && request.method !== "GET"
        ? `
data = ${request.body}`
        : ""
    }

response = requests.${request.method.toLowerCase()}(url${
      request.headers && Object.keys(request.headers).length > 0
        ? ", headers=headers"
        : ""
    }${request.body && request.method !== "GET" ? ", json=data" : ""})
print(response.json())`;
    examples.push({ key: "python", label: "Python", code: pythonCode });

    return examples;
  };

  const generateResponse = () => {
    return `{
  "status": "success",
  "data": {
    "id": "12345",
    "name": "John Doe",
    "email": "john@example.com",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  },
  "message": "Request completed successfully"
}`;
  };

  return (
    <div 
      className="sticky top-16 h-[calc(100vh-4rem)] w-full bg-white overflow-y-auto scrollbar-hide hover:scrollbar-show"
      style={{
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.scrollbarWidth = 'thin';
        e.currentTarget.style.msOverflowStyle = 'auto';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.scrollbarWidth = 'none';
        e.currentTarget.style.msOverflowStyle = 'none';
      }}
    >
      {/* Non-sticky Table of Contents */}
      <div className="bg-white p-6 pb-4">
        <TableOfContents
          activeSection={activeSection}
          onSectionClick={onSectionClick}
        />
      </div>

      {/* Request & Response Examples */}
      <div className="p-6 space-y-6">
        {/* Request Examples */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Request</h3>
          </div>
          <CodeBlock tabs={generateCodeExamples()} />
        </div>

        {/* Response Example */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Response</h3>
          </div>
          <CodeBlock code={generateResponse()} language="json" title="200 OK" />
        </div>
      </div>
    </div>
  );
};

// Main Clean Simple Template Component
export default function CleanSimpleTemplate({
  project,
  searchQuery,
  activeSection,
  onSectionClick,
  username,
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery_local, setSearchQuery_local] = useState(searchQuery || "");

  const baseUrl = project?.settings?.baseUrl || "https://api.example.com";

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-30 h-16">
        <div className="h-full px-6 flex items-center justify-between">
          {/* Left: Logo and Mobile Menu */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-gray-600 hover:text-gray-900"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            {/* Logo - Always visible */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-900 rounded-xl flex items-center justify-center">
                <FileText className="w-4 h-4 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-semibold text-gray-900">
                  {project?.name}
                </h1>
                <p className="text-sm text-gray-500">by @{username}</p>
              </div>
            </div>
          </div>

          {/* Center: Search Bar */}
          <div className="flex-1 max-w-md mx-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search endpoints..."
                value={searchQuery_local}
                onChange={(e) => setSearchQuery_local(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Right: API Playground Button */}
          <div className="flex items-center">
            <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50">
              <Globe className="w-4 h-4" />
              <span className="hidden sm:inline">API Playground</span>
            </button>
          </div>
        </div>
      </header>

      {/* Layout Container */}
      <div className="pt-16">
        <div className="max-w-[1800px] mx-auto">
          <div className="flex">
            {/* Left Sidebar */}
            <div className="hidden lg:block w-80 flex-shrink-0">
              <Sidebar
                activeSection={activeSection}
                onSectionClick={onSectionClick}
                username={username}
                project={project}
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
              />
            </div>

            {/* Main Content */}
            <div className="flex-1 min-w-0 px-8 py-12 max-w-4xl">
              <div className="lg:hidden mb-6">
                {/* Mobile Sidebar */}
                <Sidebar
                  activeSection={activeSection}
                  onSectionClick={onSectionClick}
                  username={username}
                  project={project}
                  isOpen={sidebarOpen}
                  onClose={() => setSidebarOpen(false)}
                />
              </div>
              
              {/* Main Documentation Content */}
              <div className="prose prose-lg max-w-none">
                {/* Overview Section */}
                <section id="overview" className="mb-16">
                  <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    API Documentation
                  </h1>
                  <p className="text-lg text-gray-600 leading-relaxed mb-4">
                    Welcome to our comprehensive API documentation. This guide
                    will help you integrate with our platform quickly and
                    efficiently.
                  </p>
                  <p className="text-base text-gray-700 leading-relaxed mb-4">
                    Our API is built with REST principles and returns JSON
                    responses. We provide comprehensive SDKs for popular
                    programming languages and detailed examples for every
                    endpoint. Whether you're building a mobile app, web
                    application, or server-to-server integration, this
                    documentation has everything you need to get started.
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
                    <h3 className="font-semibold text-blue-900 mb-3">
                      Quick Facts
                    </h3>
                    <ul className="text-blue-800 space-y-2">
                      <li>
                        • Base URL:{" "}
                        <code className="bg-blue-100 px-2 py-1 rounded-lg text-sm">
                          https://api.example.com/v1
                        </code>
                      </li>
                      <li>• All endpoints use HTTPS encryption</li>
                      <li>• Responses are in JSON format</li>
                      <li>• Rate limit: 1000 requests per hour</li>
                    </ul>
                  </div>
                </section>

                {/* Getting Started Section */}
                <section id="getting-started" className="mb-16">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Getting Started
                  </h2>
                  <p className="text-base text-gray-700 leading-relaxed mb-4">
                    To begin using our API, you'll need to create an account and
                    obtain your API credentials. Follow these simple steps to
                    get up and running:
                  </p>
                  <ol className="list-decimal list-inside space-y-3 text-gray-700 mb-6">
                    <li>Sign up for a developer account on our platform</li>
                    <li>Navigate to the API section in your dashboard</li>
                    <li>Generate your API key and secret</li>
                    <li>
                      Make your first API call using the authentication method
                      below
                    </li>
                  </ol>
                  <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                    <h4 className="font-semibold text-green-900 mb-3">
                      First API Call
                    </h4>
                    <p className="text-green-800 mb-3">
                      Try this example to verify your setup:
                    </p>
                    <pre className="bg-green-100 p-3 rounded-xl text-sm text-green-900 overflow-x-auto">
                      <code>{`curl -H "Authorization: Bearer YOUR_API_KEY" \\
  https://api.example.com/v1/status`}</code>
                    </pre>
                  </div>
                </section>

                {/* Authentication Section */}
                <section id="authentication" className="mb-16">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Authentication
                  </h2>
                  <p className="text-base text-gray-700 leading-relaxed mb-4">
                    Our API uses multiple authentication methods to ensure
                    security while providing flexibility for different use
                    cases. Choose the method that best fits your application's
                    needs.
                  </p>

                  <div id="basic-auth" className="mb-8">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      Basic Authentication
                    </h3>
                    <p className="text-base text-gray-700 leading-relaxed mb-4">
                      For simple server-to-server applications, you can use HTTP
                      Basic Authentication with your API key as the username and
                      your API secret as the password.
                    </p>
                    <div className="bg-gray-100 p-4 rounded-xl">
                      <code className="text-sm">
                        Authorization: Basic {btoa("api_key:api_secret")}
                      </code>
                    </div>
                  </div>

                  <div id="api-keys" className="mb-8">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      API Keys
                    </h3>
                    <p className="text-base text-gray-700 leading-relaxed mb-4">
                      API keys provide a simple way to authenticate requests.
                      Include your API key in the Authorization header as a
                      Bearer token for all requests.
                    </p>
                    <div className="bg-gray-100 p-4 rounded-xl mb-4">
                      <code className="text-sm">
                        Authorization: Bearer YOUR_API_KEY
                      </code>
                    </div>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                      <p className="text-yellow-800 text-sm">
                        <strong>Security Note:</strong> Never expose your API
                        keys in client-side code or public repositories.
                      </p>
                    </div>
                  </div>

                  <div id="oauth2" className="mb-8">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      OAuth 2.0
                    </h3>
                    <p className="text-base text-gray-700 leading-relaxed mb-4">
                      For applications that need to access user data, we support
                      OAuth 2.0 with the authorization code flow. This provides
                      secure, temporary access tokens that can be refreshed as
                      needed.
                    </p>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">
                          Step 1: Authorization Request
                        </h4>
                        <div className="bg-gray-100 p-4 rounded-xl text-sm">
                          <code>
                            GET
                            /oauth/authorize?response_type=code&client_id=CLIENT_ID&redirect_uri=REDIRECT_URI&scope=SCOPE
                          </code>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">
                          Step 2: Token Exchange
                        </h4>
                        <div className="bg-gray-100 p-4 rounded-xl text-sm">
                          <code>POST /oauth/token</code>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Rate Limiting Section */}
                <section id="rate-limiting" className="mb-16">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Rate Limiting
                  </h2>
                  <p className="text-base text-gray-700 leading-relaxed mb-4">
                    To ensure fair usage and maintain service quality, our API
                    implements rate limiting. All endpoints are subject to these
                    limits.
                  </p>
                  <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-200 rounded-xl">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left font-semibold text-gray-900">
                            Plan
                          </th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-900">
                            Requests per Hour
                          </th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-900">
                            Concurrent Requests
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        <tr>
                          <td className="px-4 py-3">Free</td>
                          <td className="px-4 py-3">1,000</td>
                          <td className="px-4 py-3">5</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3">Pro</td>
                          <td className="px-4 py-3">10,000</td>
                          <td className="px-4 py-3">20</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3">Enterprise</td>
                          <td className="px-4 py-3">100,000</td>
                          <td className="px-4 py-3">100</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </section>

                {/* Error Handling Section */}
                <section id="error-handling" className="mb-16">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Error Handling
                  </h2>
                  <p className="text-base text-gray-700 leading-relaxed mb-4">
                    Our API uses conventional HTTP response codes to indicate
                    success or failure. Codes in the 2xx range indicate success,
                    4xx range indicate client errors, and 5xx range indicate
                    server errors.
                  </p>

                  <div id="common-errors" className="mb-8">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      Common Errors
                    </h3>
                    <div className="space-y-4">
                      <div className="border border-gray-200 rounded-xl p-4">
                        <h4 className="font-semibold text-red-600 mb-2">
                          400 - Bad Request
                        </h4>
                        <p className="text-gray-700 text-sm">
                          The request was invalid or cannot be served. Often due
                          to missing required parameters.
                        </p>
                      </div>
                      <div className="border border-gray-200 rounded-xl p-4">
                        <h4 className="font-semibold text-red-600 mb-2">
                          401 - Unauthorized
                        </h4>
                        <p className="text-gray-700 text-sm">
                          Authentication failed or user doesn't have permissions
                          for requested operation.
                        </p>
                      </div>
                      <div className="border border-gray-200 rounded-xl p-4">
                        <h4 className="font-semibold text-red-600 mb-2">
                          429 - Too Many Requests
                        </h4>
                        <p className="text-gray-700 text-sm">
                          Rate limit exceeded. See Rate Limiting section for
                          more details.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div id="error-codes" className="mb-8">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      Error Response Format
                    </h3>
                    <p className="text-base text-gray-700 leading-relaxed mb-4">
                      All errors return a consistent JSON structure:
                    </p>
                    <div className="bg-gray-950 border border-gray-800 rounded-xl overflow-hidden">
                      <pre className="p-4 text-sm text-gray-100 overflow-x-auto">
                        <code>{`{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid email format",
    "details": {
      "field": "email",
      "value": "invalid-email"
    },
    "request_id": "req_123456789"
  }
}`}</code>
                      </pre>
                    </div>
                  </div>
                </section>

                {/* All API endpoint sections with rounded-xl styling */}
                <section id="users" className="mb-16">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded-xl text-xs font-medium">GET</span>
                    <h2 className="text-2xl font-bold text-gray-900">Get Users</h2>
                  </div>
                  <p className="text-base text-gray-700 leading-relaxed mb-6">
                    Retrieve a paginated list of all users in your organization. This endpoint supports filtering, 
                    searching, and sorting to help you find specific users quickly.
                  </p>
                  
                  <div className="bg-gray-100 p-4 rounded-xl mb-6">
                    <code className="text-sm font-mono">GET /users</code>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Query Parameters</h3>
                    <div className="space-y-3">
                      <div className="border border-gray-200 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <code className="bg-blue-50 text-blue-700 px-2 py-1 rounded-xl text-sm font-mono">limit</code>
                          <span className="text-sm text-gray-500">integer</span>
                          <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-xl text-xs">optional</span>
                        </div>
                        <p className="text-gray-700 text-sm">Number of users to return per page. Default: 20, Maximum: 100</p>
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Response</h3>
                    <div className="bg-gray-900 text-gray-100 p-4 rounded-xl overflow-x-auto">
                      <pre className="text-sm"><code>{`{
  "users": [
    {
      "id": "usr_1234567890",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "admin",
      "created_at": "2024-01-15T10:30:00Z",
      "last_login": "2024-01-20T14:22:00Z"
    }
  ],
  "pagination": {
    "total": 150,
    "page": 1,
    "limit": 20,
    "total_pages": 8
  }
}`}</code></pre>
                    </div>
                  </div>
                </section>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="hidden lg:block w-96 flex-shrink-0">
              <CodeExamplesSidebar
                request={{
                  id: "get-user",
                  name: "Get User by ID",
                  method: "GET",
                  url: "/users/{id}",
                  headers: { Authorization: "Bearer {token}" },
                  body: null,
                }}
                baseUrl={baseUrl}
                activeSection={activeSection}
                onSectionClick={onSectionClick}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Template configuration
export const CleanSimpleConfig = {
  name: "Clean & Simple",
  description:
    "Borderless design with rounded corners and clean aesthetics for modern documentation",
  preview: "/templates/clean-simple-preview.png",
  features: [
    "Borderless sidebars",
    "12px rounded corners",
    "Clean modern design",
    "Responsive layout",
    "Dynamic table of contents",
  ],
  settings: {
    showTOC: false,
    showCodeExamples: true,
    showResponseExamples: true,
    showMethodBadges: true,
    layout: "three-column",
    borderRadius: "12px",
  },
};