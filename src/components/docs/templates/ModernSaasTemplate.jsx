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
  Zap,
  Star,
  ArrowRight,
  ExternalLink,
} from "lucide-react";

// Method Badge Component with modern SaaS styling
const MethodBadge = ({ method, size = "sm" }) => {
  const colors = {
    GET: "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/25",
    POST: "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25",
    PUT: "bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/25",
    PATCH: "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/25",
    DELETE: "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/25",
    HEAD: "bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-lg shadow-gray-500/25",
    OPTIONS: "bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/25",
  };

  const sizeClasses = {
    xs: "px-2 py-1 text-xs",
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
  };

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full ${
        colors[method] || colors.GET
      } ${sizeClasses[size]} backdrop-blur-sm`}
    >
      {method}
    </span>
  );
};

// Modern Code Block Component
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
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/50 rounded-2xl overflow-hidden shadow-2xl shadow-slate-900/25">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-slate-800/80 to-slate-700/80 border-b border-slate-600/30 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          {title && (
            <span className="text-slate-200 text-sm font-medium flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              {title}
            </span>
          )}
          {tabs && (
            <div className="flex items-center gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${
                    activeTab === tab.key
                      ? "bg-white/10 text-white shadow-lg backdrop-blur-sm"
                      : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
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
          className="p-2 text-slate-400 hover:text-white transition-all duration-200 rounded-lg hover:bg-white/10 backdrop-blur-sm"
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
      <pre className="p-6 text-sm text-slate-100 overflow-x-auto bg-gradient-to-br from-slate-900/50 to-slate-800/50 min-h-[80px] leading-relaxed">
        <code className={`language-${tabs ? activeTab : language} font-mono`}>
          {codeToShow}
        </code>
      </pre>
    </div>
  );
};

// Modern Parameter Row Component
const ParameterRow = ({ name, type, required, description, example }) => (
  <tr className="border-b border-slate-100/50 hover:bg-slate-50/50 transition-colors duration-200">
    <td className="py-4 pr-6">
      <div className="flex items-center gap-3">
        <code className="text-sm font-semibold text-slate-800 bg-slate-100 px-3 py-1 rounded-lg">{name}</code>
        {required && (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-red-500 to-pink-500 text-white">
            required
          </span>
        )}
      </div>
    </td>
    <td className="py-4 pr-6">
      <code className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium">
        {type}
      </code>
    </td>
    <td className="py-4 pr-6 text-sm text-slate-600 leading-relaxed">{description}</td>
    {example && (
      <td className="py-4">
        <code className="text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded">{example}</code>
      </td>
    )}
  </tr>
);

// Modern Sidebar Navigation
const Sidebar = ({
  activeSection,
  onSectionClick,
  username,
  project,
  isOpen,
  onClose,
}) => {
  const navigationItems = [
    {
      id: "introduction",
      name: "Introduction",
      type: "section",
      icon: FileText,
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
      icon: Zap,
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
      icon: Code2,
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
      icon: Star,
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
      icon: Globe,
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
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <div
        className={`lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] w-full lg:w-80 bg-white/80 backdrop-blur-xl border-r border-slate-200/60 z-50 transform transition-transform duration-300 overflow-y-auto scrollbar-hide hover:scrollbar-show ${
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
          <nav className="space-y-8">
            {navigationItems.map((section) => (
              <div key={section.id} className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-lg">
                    <section.icon className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                    {section.name}
                  </h3>
                </div>
                <div className="ml-2 space-y-1">
                  {section.children.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => onSectionClick(item.id)}
                      className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all duration-200 flex items-center justify-between group ${
                        activeSection === item.id
                          ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 font-semibold border border-blue-200/50 shadow-md"
                          : "text-slate-600 hover:text-slate-900 hover:bg-gradient-to-r hover:from-slate-50 hover:to-slate-100/50 hover:shadow-sm"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {item.method && (
                          <MethodBadge method={item.method} size="xs" />
                        )}
                        <span className="truncate">{item.name}</span>
                      </div>
                      <ArrowRight className={`w-4 h-4 transition-all duration-200 ${
                        activeSection === item.id ? 'text-blue-600 opacity-100' : 'text-slate-400 opacity-0 group-hover:opacity-100'
                      }`} />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Quick Links */}
        <div className="p-6 border-t border-slate-200/60 bg-gradient-to-br from-slate-50/50 to-white/50 backdrop-blur-sm">
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            <ExternalLink className="w-4 h-4" />
            Quick Links
          </h3>
          <div className="space-y-3">
            {[
              { icon: Globe, label: "API Status", href: "#" },
              { icon: FileText, label: "Changelog", href: "#" },
              { icon: Code2, label: "SDKs & Libraries", href: "#" },
            ].map((link, index) => (
              <a
                key={index}
                href={link.href}
                className="flex items-center gap-3 text-sm text-slate-600 hover:text-slate-900 transition-all duration-200 p-2 rounded-lg hover:bg-white/60 group"
              >
                <link.icon className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                {link.label}
              </a>
            ))}
          </div>
        </div>

        {/* Base URL */}
        <div className="p-6 border-t border-slate-200/60">
          <h3 className="text-sm font-bold text-slate-800 mb-3">Base URL</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-600">Production</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <span className="text-xs text-emerald-600 font-medium">Online</span>
              </div>
            </div>
            <code className="text-xs bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-200/50 text-emerald-800 px-4 py-2 rounded-xl block break-all font-medium">
              https://api.example.com/v1
            </code>
            <div className="flex items-center justify-between mt-3">
              <span className="text-xs font-medium text-slate-600">Sandbox</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
                <span className="text-xs text-amber-600 font-medium">Testing</span>
              </div>
            </div>
            <code className="text-xs bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/50 text-amber-800 px-4 py-2 rounded-xl block break-all font-medium">
              https://api-test.example.com/v1
            </code>
          </div>
        </div>
      </div>
    </>
  );
};

// Table of Contents Component
const TableOfContents = ({ activeSection, onSectionClick }) => {
  const sectionTocMap = {
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
    'users': [
      { id: 'users', title: 'Get Users', level: 1 },
      { id: 'users-query-params', title: 'Query Parameters', level: 2 },
      { id: 'users-response', title: 'Response', level: 2 }
    ]
  };

  const currentTocItems = sectionTocMap[activeSection] || [];

  if (currentTocItems.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg shadow-lg">
          <Hash className="w-4 h-4 text-white" />
        </div>
        <h3 className="text-sm font-bold text-slate-800">In This Page</h3>
      </div>
      <nav className="space-y-2">
        {currentTocItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onSectionClick(item.id)}
            className={`block w-full text-left text-sm transition-all duration-200 py-2 px-4 rounded-xl ${
              item.level === 1 ? "ml-0" : "ml-6"
            } ${
              activeSection === item.id
                ? "text-blue-700 font-semibold bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50"
                : item.level === 1
                ? "text-slate-700 hover:text-slate-900 hover:bg-slate-50 font-medium"
                : "text-slate-600 hover:text-slate-800 hover:bg-slate-50"
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
      className="sticky top-16 h-[calc(100vh-4rem)] w-full bg-white/80 backdrop-blur-xl overflow-y-auto scrollbar-hide hover:scrollbar-show"
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
      {/* Table of Contents */}
      <div className="bg-gradient-to-br from-white/90 to-slate-50/50 backdrop-blur-sm p-6 border-b border-slate-200/60">
        <TableOfContents
          activeSection={activeSection}
          onSectionClick={onSectionClick}
        />
      </div>

      {/* Request & Response Examples */}
      <div className="p-6 space-y-8">
        {/* Request Examples */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg shadow-lg">
              <ArrowRight className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Request</h3>
          </div>
          <CodeBlock tabs={generateCodeExamples()} />
        </div>

        {/* Response Example */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg shadow-lg">
              <CheckCircle className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Response</h3>
          </div>
          <CodeBlock code={generateResponse()} language="json" title="200 OK" />
        </div>
      </div>
    </div>
  );
};

// Main Modern SaaS Template Component
export default function ModernSaasTemplate({
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-b border-slate-200/60 z-30 h-16 shadow-lg shadow-slate-900/5">
        <div className="h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Left: Logo and Mobile Menu */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-white/60 transition-all duration-200"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            {/* Logo - Modern SaaS style */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  {project?.name || "API Docs"}
                </h1>
                <p className="text-sm text-slate-500 font-medium">by @{username}</p>
              </div>
            </div>
          </div>

          {/* Center: Search Bar */}
          <div className="flex-1 max-w-md mx-3 sm:mx-6">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors duration-200" />
              <input
                type="text"
                placeholder="Search endpoints..."
                value={searchQuery_local}
                onChange={(e) => setSearchQuery_local(e.target.value)}
                className="w-full pl-11 pr-4 py-3 text-sm bg-white/60 backdrop-blur-sm border border-slate-200/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300/60 transition-all duration-200 shadow-sm hover:shadow-md placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Right: CTA Button */}
          <div className="flex items-center">
            <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5">
              <Globe className="w-4 h-4" />
              <span className="hidden sm:inline">Try API</span>
            </button>
          </div>
        </div>
      </header>

      {/* Layout Container */}
      <div className="pt-16">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row">
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
            <div className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12 max-w-4xl">
              <div className="lg:hidden mb-6">
                <Sidebar
                  activeSection={activeSection}
                  onSectionClick={onSectionClick}
                  username={username}
                  project={project}
                  isOpen={sidebarOpen}
                  onClose={() => setSidebarOpen(false)}
                />
              </div>
              
              {/* Hero Section */}
              <div className="mb-16">
                <section id="overview" className="text-center mb-16">
                  <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
                    <Zap className="w-4 h-4" />
                    Developer-First API
                  </div>
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 bg-clip-text text-transparent mb-6 leading-tight">
                    Beautiful API Documentation
                  </h1>
                  <p className="text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto mb-8">
                    Comprehensive, developer-friendly documentation to help you integrate seamlessly and build amazing experiences.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-1">
                      <Zap className="w-5 h-5" />
                      Get Started
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <button className="inline-flex items-center gap-2 px-8 py-4 bg-white/80 backdrop-blur-sm border border-slate-200 text-slate-700 font-semibold rounded-2xl hover:bg-white hover:border-slate-300 transition-all duration-200 shadow-sm hover:shadow-md">
                      <FileText className="w-5 h-5" />
                      View Examples
                    </button>
                  </div>
                </section>

                {/* Feature Cards */}
                <div className="grid md:grid-cols-3 gap-6 mb-16">
                  {[
                    {
                      icon: Zap,
                      title: "Lightning Fast",
                      description: "Optimized for speed with intelligent caching and global CDN delivery.",
                      gradient: "from-yellow-400 to-orange-500"
                    },
                    {
                      icon: Star,
                      title: "Developer Experience", 
                      description: "Intuitive API design with comprehensive SDKs and detailed examples.",
                      gradient: "from-purple-500 to-pink-500"
                    },
                    {
                      icon: Globe,
                      title: "Global Scale",
                      description: "Built for enterprise scale with 99.9% uptime and worldwide infrastructure.",
                      gradient: "from-blue-500 to-cyan-500"
                    }
                  ].map((feature, index) => (
                    <div key={index} className="group p-6 bg-white/60 backdrop-blur-sm border border-slate-200/60 rounded-2xl hover:shadow-xl hover:shadow-slate-900/10 transition-all duration-300 hover:-translate-y-1">
                      <div className={`w-12 h-12 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-200`}>
                        <feature.icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-800 mb-2">{feature.title}</h3>
                      <p className="text-slate-600 leading-relaxed">{feature.description}</p>
                    </div>
                  ))}
                </div>

                {/* Quick Start */}
                <div className="bg-gradient-to-br from-slate-50/80 to-white/80 backdrop-blur-sm border border-slate-200/60 rounded-2xl p-8 shadow-lg">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg shadow-lg">
                      <Zap className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">Quick Start</h3>
                  </div>
                  <p className="text-slate-600 mb-6 leading-relaxed">
                    Get up and running in under 5 minutes. Here's your first API call:
                  </p>
                  <CodeBlock 
                    code={`curl -H "Authorization: Bearer YOUR_API_KEY" \\
  https://api.example.com/v1/status`}
                    language="bash"
                    title="Test Connection"
                  />
                </div>
              </div>

              {/* Authentication Section */}
              <section id="authentication" className="mb-20">
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl shadow-lg">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                      Authentication
                    </h2>
                    <p className="text-slate-600 mt-2">Secure your API requests with multiple authentication methods</p>
                  </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                  {/* Basic Auth */}
                  <div id="basic-auth" className="group p-8 bg-white/60 backdrop-blur-sm border border-slate-200/60 rounded-2xl hover:shadow-xl hover:shadow-slate-900/10 transition-all duration-300">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl">
                        <Hash className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-800">Basic Authentication</h3>
                    </div>
                    <p className="text-slate-600 mb-6 leading-relaxed">
                      Simple server-to-server authentication using your API credentials as username and password.
                    </p>
                    <div className="bg-gradient-to-br from-slate-50 to-blue-50/30 border border-slate-200/60 rounded-xl p-4">
                      <code className="text-sm font-mono text-slate-700">
                        Authorization: Basic {btoa("api_key:api_secret")}
                      </code>
                    </div>
                  </div>

                  {/* API Keys */}
                  <div id="api-keys" className="group p-8 bg-white/60 backdrop-blur-sm border border-slate-200/60 rounded-2xl hover:shadow-xl hover:shadow-slate-900/10 transition-all duration-300">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl">
                        <Star className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-800">API Keys</h3>
                    </div>
                    <p className="text-slate-600 mb-6 leading-relaxed">
                      The recommended authentication method for most applications using Bearer tokens.
                    </p>
                    <div className="bg-gradient-to-br from-slate-50 to-emerald-50/30 border border-slate-200/60 rounded-xl p-4 mb-4">
                      <code className="text-sm font-mono text-slate-700">
                        Authorization: Bearer YOUR_API_KEY
                      </code>
                    </div>
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50/30 border border-amber-200/60 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <ExternalLink className="w-4 h-4 text-amber-600" />
                        <span className="text-amber-800 font-semibold text-sm">Security Note</span>
                      </div>
                      <p className="text-amber-700 text-sm">
                        Never expose API keys in client-side code or public repositories.
                      </p>
                    </div>
                  </div>
                </div>

                {/* OAuth 2.0 */}
                <div id="oauth2" className="mt-8 p-8 bg-gradient-to-br from-purple-50/80 to-pink-50/80 backdrop-blur-sm border border-purple-200/60 rounded-2xl">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
                      <Globe className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">OAuth 2.0</h3>
                  </div>
                  <p className="text-slate-600 mb-8 leading-relaxed">
                    Enterprise-grade authentication for user data access with secure token management.
                  </p>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white/80 border border-purple-200/40 rounded-xl p-6">
                      <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                        <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                          <span className="text-white text-xs font-bold">1</span>
                        </div>
                        Authorization Request
                      </h4>
                      <div className="bg-slate-50 border border-slate-200/60 rounded-lg p-3 text-xs font-mono text-slate-700 break-all">
                        GET /oauth/authorize?response_type=code&client_id=CLIENT_ID
                      </div>
                    </div>
                    <div className="bg-white/80 border border-purple-200/40 rounded-xl p-6">
                      <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                        <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                          <span className="text-white text-xs font-bold">2</span>
                        </div>
                        Token Exchange
                      </h4>
                      <div className="bg-slate-50 border border-slate-200/60 rounded-lg p-3 text-xs font-mono text-slate-700">
                        POST /oauth/token
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* API Endpoints Section */}
              <section id="users" className="mb-20">
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl shadow-lg">
                    <Code2 className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                      <MethodBadge method="GET" size="md" />
                      <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                        Get Users
                      </h2>
                    </div>
                    <p className="text-slate-600 mt-2">Retrieve paginated user data with advanced filtering</p>
                  </div>
                </div>

                <div className="mb-8 p-6 bg-gradient-to-br from-emerald-50/80 to-teal-50/80 backdrop-blur-sm border border-emerald-200/60 rounded-2xl">
                  <code className="text-lg font-mono font-bold text-emerald-800">GET /users</code>
                </div>

                {/* Parameters */}
                <div className="mb-10">
                  <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl">
                      <Hash className="w-5 h-5 text-white" />
                    </div>
                    Query Parameters
                  </h3>
                  <div className="bg-white/60 backdrop-blur-sm border border-slate-200/60 rounded-2xl overflow-hidden shadow-lg">
                    <table className="w-full">
                      <thead className="bg-gradient-to-r from-slate-50 to-blue-50/30">
                        <tr>
                          <th className="text-left py-4 px-6 font-bold text-slate-800">Parameter</th>
                          <th className="text-left py-4 px-6 font-bold text-slate-800">Type</th>
                          <th className="text-left py-4 px-6 font-bold text-slate-800">Description</th>
                          <th className="text-left py-4 px-6 font-bold text-slate-800">Example</th>
                        </tr>
                      </thead>
                      <tbody>
                        <ParameterRow name="limit" type="integer" required={false} description="Number of users to return per page. Default: 20, Maximum: 100" example="50" />
                        <ParameterRow name="page" type="integer" required={false} description="Page number for pagination. Default: 1" example="2" />
                        <ParameterRow name="search" type="string" required={false} description="Search users by name or email" example="john@example.com" />
                        <ParameterRow name="role" type="string" required={false} description="Filter by user role (admin, user, viewer)" example="admin" />
                        <ParameterRow name="created_after" type="string" required={false} description="Filter users created after date (ISO 8601)" example="2024-01-01T00:00:00Z" />
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Response */}
                <div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    Response
                  </h3>
                  <CodeBlock 
                    code={`{
  "users": [
    {
      "id": "usr_1234567890",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "admin",
      "avatar_url": "https://api.example.com/avatars/john.jpg",
      "created_at": "2024-01-15T10:30:00Z",
      "last_login": "2024-01-20T14:22:00Z",
      "is_verified": true,
      "metadata": {
        "department": "Engineering",
        "location": "San Francisco, CA"
      }
    },
    {
      "id": "usr_0987654321",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "role": "user",
      "avatar_url": "https://api.example.com/avatars/jane.jpg",
      "created_at": "2024-01-10T08:15:00Z",
      "last_login": "2024-01-19T16:45:00Z",
      "is_verified": true,
      "metadata": {
        "department": "Marketing",
        "location": "New York, NY"
      }
    }
  ],
  "pagination": {
    "total": 1247,
    "page": 1,
    "limit": 20,
    "total_pages": 63,
    "has_next": true,
    "has_previous": false
  },
  "meta": {
    "request_id": "req_abc123",
    "processing_time_ms": 45
  }
}`}
                    language="json"
                    title="200 OK"
                  />
                </div>
              </section>

              {/* Create User Endpoint */}
              <section id="create-user" className="mb-20">
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl shadow-lg">
                    <Code2 className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                      <MethodBadge method="POST" size="md" />
                      <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                        Create User
                      </h2>
                    </div>
                    <p className="text-slate-600 mt-2">Add new users to your organization with role-based access</p>
                  </div>
                </div>

                <div className="mb-8 p-6 bg-gradient-to-br from-blue-50/80 to-indigo-50/80 backdrop-blur-sm border border-blue-200/60 rounded-2xl">
                  <code className="text-lg font-mono font-bold text-blue-800">POST /users</code>
                </div>

                {/* Request Body */}
                <div className="mb-10">
                  <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl">
                      <ArrowRight className="w-5 h-5 text-white" />
                    </div>
                    Request Body
                  </h3>
                  <div className="bg-white/60 backdrop-blur-sm border border-slate-200/60 rounded-2xl overflow-hidden shadow-lg">
                    <table className="w-full">
                      <thead className="bg-gradient-to-r from-slate-50 to-blue-50/30">
                        <tr>
                          <th className="text-left py-4 px-6 font-bold text-slate-800">Field</th>
                          <th className="text-left py-4 px-6 font-bold text-slate-800">Type</th>
                          <th className="text-left py-4 px-6 font-bold text-slate-800">Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        <ParameterRow name="name" type="string" required={true} description="Full name of the user (2-50 characters)" />
                        <ParameterRow name="email" type="string" required={true} description="Valid email address for the user" />
                        <ParameterRow name="role" type="string" required={false} description="User role: admin, user, or viewer. Default: user" />
                        <ParameterRow name="department" type="string" required={false} description="User's department or team" />
                        <ParameterRow name="send_invite" type="boolean" required={false} description="Send invitation email to user. Default: true" />
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Example Request */}
                <div className="mb-10">
                  <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl">
                      <Code2 className="w-5 h-5 text-white" />
                    </div>
                    Example Request
                  </h3>
                  <CodeBlock 
                    code={`{
  "name": "Alice Johnson",
  "email": "alice@example.com",
  "role": "admin",
  "department": "Engineering",
  "send_invite": true
}`}
                    language="json"
                    title="Request Body"
                  />
                </div>

                {/* Response */}
                <div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    Response
                  </h3>
                  <CodeBlock 
                    code={`{
  "id": "usr_5432109876",
  "name": "Alice Johnson",
  "email": "alice@example.com",
  "role": "admin",
  "department": "Engineering",
  "avatar_url": null,
  "created_at": "2024-01-20T16:45:00Z",
  "invitation_sent": true,
  "status": "pending",
  "invite_expires_at": "2024-01-27T16:45:00Z",
  "meta": {
    "request_id": "req_def456",
    "processing_time_ms": 123
  }
}`}
                    language="json"
                    title="201 Created"
                  />
                </div>
              </section>

              {/* Error Handling Section */}
              <section id="error-handling" className="mb-20">
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl shadow-lg">
                    <ExternalLink className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                      Error Handling
                    </h2>
                    <p className="text-slate-600 mt-2">Comprehensive error responses with detailed context</p>
                  </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-6 mb-10">
                  {[
                    {
                      code: "400",
                      title: "Bad Request",
                      description: "Invalid request format or missing required parameters",
                      color: "from-amber-500 to-orange-500"
                    },
                    {
                      code: "401", 
                      title: "Unauthorized",
                      description: "Authentication failed or invalid credentials",
                      color: "from-red-500 to-pink-500"
                    },
                    {
                      code: "403",
                      title: "Forbidden", 
                      description: "Valid credentials but insufficient permissions",
                      color: "from-purple-500 to-indigo-500"
                    },
                    {
                      code: "429",
                      title: "Rate Limited",
                      description: "Too many requests - please slow down",
                      color: "from-blue-500 to-cyan-500"
                    }
                  ].map((error, index) => (
                    <div key={index} className="group p-6 bg-white/60 backdrop-blur-sm border border-slate-200/60 rounded-2xl hover:shadow-xl hover:shadow-slate-900/10 transition-all duration-300">
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`p-2 bg-gradient-to-br ${error.color} rounded-xl shadow-lg`}>
                          <span className="text-white font-bold text-sm">{error.code}</span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-800">{error.title}</h3>
                      </div>
                      <p className="text-slate-600 leading-relaxed">{error.description}</p>
                    </div>
                  ))}
                </div>

                {/* Error Response Format */}
                <div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-slate-600 to-slate-700 rounded-xl">
                      <Code2 className="w-5 h-5 text-white" />
                    </div>
                    Error Response Format
                  </h3>
                  <CodeBlock 
                    code={`{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid email format provided",
    "details": {
      "field": "email",
      "value": "invalid-email",
      "expected_format": "user@domain.com"
    },
    "documentation_url": "https://docs.example.com/errors#validation",
    "request_id": "req_error_123",
    "timestamp": "2024-01-20T16:45:00Z"
  }
}`}
                    language="json"
                    title="400 Bad Request"
                  />
                </div>
              </section>

              {/* Rate Limiting Section */}
              <section id="rate-limiting" className="mb-20">
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl shadow-lg">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                      Rate Limiting
                    </h2>
                    <p className="text-slate-600 mt-2">Fair usage policies to ensure optimal performance</p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-cyan-50/80 to-blue-50/80 backdrop-blur-sm border border-cyan-200/60 rounded-2xl overflow-hidden shadow-lg">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gradient-to-r from-cyan-100/80 to-blue-100/80">
                        <tr>
                          <th className="text-left py-6 px-6 font-bold text-slate-800">Plan</th>
                          <th className="text-left py-6 px-6 font-bold text-slate-800">Requests/Hour</th>
                          <th className="text-left py-6 px-6 font-bold text-slate-800">Concurrent</th>
                          <th className="text-left py-6 px-6 font-bold text-slate-800">Burst Limit</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-cyan-100/50 hover:bg-cyan-50/30 transition-colors">
                          <td className="py-4 px-6 font-semibold text-slate-800">Free</td>
                          <td className="py-4 px-6 text-slate-700">1,000</td>
                          <td className="py-4 px-6 text-slate-700">5</td>
                          <td className="py-4 px-6 text-slate-700">10</td>
                        </tr>
                        <tr className="border-b border-cyan-100/50 hover:bg-cyan-50/30 transition-colors">
                          <td className="py-4 px-6 font-semibold text-slate-800">Pro</td>
                          <td className="py-4 px-6 text-slate-700">10,000</td>
                          <td className="py-4 px-6 text-slate-700">20</td>
                          <td className="py-4 px-6 text-slate-700">50</td>
                        </tr>
                        <tr className="hover:bg-cyan-50/30 transition-colors">
                          <td className="py-4 px-6 font-semibold text-slate-800">Enterprise</td>
                          <td className="py-4 px-6 text-slate-700">100,000</td>
                          <td className="py-4 px-6 text-slate-700">100</td>
                          <td className="py-4 px-6 text-slate-700">500</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>
            </div>

            {/* Right Sidebar */}
            <div className="hidden xl:block w-96 flex-shrink-0">
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
export const ModernSaasConfig = {
  name: "Modern SaaS",
  description:
    "Contemporary design with gradients, glassmorphism, and modern SaaS aesthetics for cutting-edge documentation",
  preview: "/templates/modern-saas-preview.png",
  features: [
    "Glassmorphism design",
    "Gradient accents",
    "Modern SaaS aesthetics",
    "Hero section with CTAs",
    "Interactive animations",
  ],
  settings: {
    showTOC: true,
    showCodeExamples: true,
    showResponseExamples: true,
    showMethodBadges: true,
    layout: "three-column",
    theme: "modern-saas",
  },
};