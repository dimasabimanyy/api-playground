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
  X
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
    md: "px-2.5 py-1 text-sm"
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
    <div className="bg-gray-950 border border-gray-800 rounded-lg overflow-hidden">
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
                  className={`px-2.5 py-1 text-xs font-mono rounded transition-colors ${
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
          className="p-1.5 text-gray-400 hover:text-gray-200 transition-colors rounded hover:bg-gray-800"
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
        <code className={`language-${tabs ? activeTab : language}`}>{codeToShow}</code>
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
      <code className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">{type}</code>
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
const Sidebar = ({ activeSection, onSectionClick, username, project, isOpen, onClose }) => {
  // Hardcoded navigation structure
  const navigationItems = [
    {
      id: 'introduction',
      name: 'Introduction',
      type: 'section',
      children: [
        { id: 'overview', name: 'Overview', method: null },
        { id: 'getting-started', name: 'Getting Started', method: null },
        { id: 'quickstart', name: 'Quick Start Guide', method: null }
      ]
    },
    {
      id: 'authentication',
      name: 'Authentication',
      type: 'section',
      children: [
        { id: 'basic-auth', name: 'Basic Authentication', method: null },
        { id: 'api-keys', name: 'API Keys', method: null },
        { id: 'oauth2', name: 'OAuth 2.0', method: null }
      ]
    },
    {
      id: 'endpoints',
      name: 'API Endpoints',
      type: 'section',
      children: [
        { id: 'users', name: 'Get Users', method: 'GET' },
        { id: 'create-user', name: 'Create User', method: 'POST' },
        { id: 'update-user', name: 'Update User', method: 'PUT' },
        { id: 'delete-user', name: 'Delete User', method: 'DELETE' }
      ]
    },
    {
      id: 'resources',
      name: 'Resources',
      type: 'section',
      children: [
        { id: 'products', name: 'Get Products', method: 'GET' },
        { id: 'create-product', name: 'Create Product', method: 'POST' },
        { id: 'orders', name: 'Get Orders', method: 'GET' },
        { id: 'webhooks', name: 'Webhooks', method: null }
      ]
    },
    {
      id: 'guides',
      name: 'Guides',
      type: 'section',
      children: [
        { id: 'rate-limiting', name: 'Rate Limiting', method: null },
        { id: 'error-handling', name: 'Error Handling', method: null },
        { id: 'pagination', name: 'Pagination', method: null },
        { id: 'testing', name: 'Testing', method: null }
      ]
    }
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
      
      <div className={`absolute top-0 left-0 h-[calc(100vh-4rem)] w-80 bg-white border-r border-gray-200 z-50 transform transition-transform duration-300 overflow-y-auto ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                <FileText className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">API Documentation</h1>
                <p className="text-sm text-gray-500">by @{username || 'developer'}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden p-1 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <p className="text-sm text-gray-600">
            Complete API reference and integration guide for developers.
          </p>
        </div>


        {/* Navigation */}
        <div className="p-6">
          <nav className="space-y-6">
            {navigationItems.map((section) => (
              <div key={section.id} className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-4 bg-gray-300 rounded-full"></div>
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                    {section.name}
                  </h3>
                </div>
                <div className="ml-3 space-y-0.5">
                  {section.children.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => onSectionClick(item.id)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center gap-2 ${
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
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Links</h3>
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
            <code className="text-sm bg-gray-100 px-3 py-2 rounded block break-all text-gray-700">
              https://api.example.com/v1
            </code>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-gray-500">Sandbox</span>
              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
            </div>
            <code className="text-sm bg-gray-100 px-3 py-2 rounded block break-all text-gray-700">
              https://api-test.example.com/v1
            </code>
          </div>
        </div>
      </div>
    </>
  );
};

// Main Content Component
const EndpointContent = ({ request, project, baseUrl }) => {
  const endpointId = `endpoint-${request.id}`;
  
  // Generate example parameters
  const pathParams = [
    { name: "id", type: "string", required: true, description: "Unique identifier for the resource", example: "12345" }
  ];
  
  const queryParams = [
    { name: "limit", type: "integer", required: false, description: "Number of items to return", example: "10" },
    { name: "offset", type: "integer", required: false, description: "Number of items to skip", example: "0" },
    { name: "filter", type: "string", required: false, description: "Filter criteria", example: "active" }
  ];
  
  const bodyParams = [
    { name: "name", type: "string", required: true, description: "The name of the resource", example: "John Doe" },
    { name: "email", type: "string", required: true, description: "Valid email address", example: "john@example.com" },
    { name: "age", type: "integer", required: false, description: "Age in years", example: "25" }
  ];

  return (
    <div className="max-w-4xl" id={endpointId}>
      {/* Endpoint Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <MethodBadge method={request.method} size="md" />
          <h1 className="text-3xl font-bold text-gray-900">{request.name}</h1>
          <button
            onClick={() => {
              navigator.clipboard.writeText(`${window.location.origin}${window.location.pathname}#${endpointId}`);
            }}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            title="Copy link to this section"
          >
            <Hash className="w-5 h-5" />
          </button>
        </div>
        
        <div className="mb-6">
          <code className="text-lg font-mono px-4 py-3 bg-gray-100 text-gray-800 rounded-lg border inline-block">
            {request.method} {request.url}
          </code>
        </div>
        
        {request.description && (
          <p className="text-lg text-gray-600 leading-relaxed">{request.description}</p>
        )}
      </div>

      {/* Parameters Section */}
      <div className="space-y-8">
        {/* Path Parameters */}
        {request.url.includes("{") && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Code2 className="w-5 h-5" />
              Path Parameters
            </h2>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Name</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Type</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Description</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Example</th>
                  </tr>
                </thead>
                <tbody>
                  {pathParams.map((param, index) => (
                    <ParameterRow key={index} {...param} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Query Parameters */}
        {request.method === "GET" && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Code2 className="w-5 h-5" />
              Query Parameters
            </h2>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Name</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Type</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Description</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Example</th>
                  </tr>
                </thead>
                <tbody>
                  {queryParams.map((param, index) => (
                    <ParameterRow key={index} {...param} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Request Body */}
        {request.method !== "GET" && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Code2 className="w-5 h-5" />
              Request Body
            </h2>
            <div className="border border-gray-200 rounded-lg overflow-hidden mb-4">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Name</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Type</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Description</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Example</th>
                  </tr>
                </thead>
                <tbody>
                  {bodyParams.map((param, index) => (
                    <ParameterRow key={index} {...param} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Headers */}
        {request.headers && Object.keys(request.headers).length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Code2 className="w-5 h-5" />
              Headers
            </h2>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Name</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(request.headers).map(([key, value]) => (
                    <tr key={key} className="border-b border-gray-100">
                      <td className="py-3 px-4">
                        <code className="text-sm font-mono text-gray-900">{key}</code>
                      </td>
                      <td className="py-3 px-4">
                        <code className="text-sm font-mono text-gray-700">{value}</code>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Table of Contents Component - Content-focused
const TableOfContents = ({ activeSection, onSectionClick }) => {
  // Hardcoded TOC structure for better content demonstration
  const tocItems = [
    {
      id: 'overview',
      title: 'Overview',
      level: 1
    },
    {
      id: 'getting-started',
      title: 'Getting Started',
      level: 1
    },
    {
      id: 'authentication',
      title: 'Authentication',
      level: 1
    },
    {
      id: 'basic-auth',
      title: 'Basic Authentication',
      level: 2
    },
    {
      id: 'api-keys',
      title: 'API Keys',
      level: 2
    },
    {
      id: 'oauth2',
      title: 'OAuth 2.0',
      level: 2
    },
    {
      id: 'rate-limiting',
      title: 'Rate Limiting',
      level: 1
    },
    {
      id: 'error-handling',
      title: 'Error Handling',
      level: 1
    },
    {
      id: 'common-errors',
      title: 'Common Errors',
      level: 2
    },
    {
      id: 'error-codes',
      title: 'Error Codes',
      level: 2
    },
    {
      id: 'pagination',
      title: 'Pagination',
      level: 1
    },
    {
      id: 'webhooks',
      title: 'Webhooks',
      level: 1
    },
    {
      id: 'webhook-security',
      title: 'Webhook Security',
      level: 2
    },
    {
      id: 'testing',
      title: 'Testing',
      level: 1
    }
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1 h-4 bg-blue-500 rounded-full"></div>
        <h3 className="text-sm font-semibold text-gray-900">In This Page</h3>
      </div>
      <nav className="space-y-0.5 border-l border-gray-200 pl-3">
        {tocItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onSectionClick(item.id)}
            className={`block w-full text-left text-sm transition-colors py-1.5 px-2 rounded-md ${
              item.level === 1 ? 'ml-0' : 'ml-3'
            } ${
              activeSection === item.id
                ? 'text-blue-600 font-medium bg-blue-50'
                : item.level === 1 
                ? 'text-gray-900 hover:text-blue-600 hover:bg-gray-50 font-medium'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
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
const CodeExamplesSidebar = ({ request, baseUrl, activeSection, onSectionClick }) => {
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
  method: '${request.method}',${request.headers && Object.keys(request.headers).length > 0 ? `
  headers: ${JSON.stringify(request.headers, null, 2)},` : ''}${request.body && request.method !== "GET" ? `
  body: JSON.stringify(${request.body})` : ''}
})
.then(response => response.json())
.then(data => console.log(data));`;
    examples.push({ key: "javascript", label: "JavaScript", code: jsCode });

    // Python Example
    const pythonCode = `import requests${request.body && request.method !== "GET" ? `
import json` : ''}

url = "${fullUrl}"${request.headers && Object.keys(request.headers).length > 0 ? `
headers = ${JSON.stringify(request.headers, null, 2).replace(/"/g, "'").replace(/'/g, '"')}` : ''}${request.body && request.method !== "GET" ? `
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
    "name": "John Doe",
    "email": "john@example.com",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  },
  "message": "Request completed successfully"
}`;
  };

  return (
    <div className="absolute top-0 right-0 h-[calc(100vh-4rem)] w-96 bg-white border-l border-gray-200 overflow-y-auto">
      {/* Sticky Table of Contents */}
      <div className="sticky top-0 bg-white border-b border-gray-200 p-6 pb-4 z-10">
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
            <div className="w-1 h-4 bg-green-500 rounded-full"></div>
            <h3 className="text-lg font-semibold text-gray-900">Request</h3>
          </div>
          <CodeBlock 
            tabs={generateCodeExamples()}
          />
        </div>

        {/* Response Example */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-4 bg-purple-500 rounded-full"></div>
            <h3 className="text-lg font-semibold text-gray-900">Response</h3>
          </div>
          <CodeBlock 
            code={generateResponse()} 
            language="json" 
            title="200 OK"
          />
        </div>
      </div>
    </div>
  );
};

// Main Minimalist Template Component
export default function MinimalistTemplate({
  project,
  collections,
  searchQuery,
  activeSection,
  onSectionClick,
  username
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery_local, setSearchQuery_local] = useState(searchQuery || "");
  
  const baseUrl = project?.settings?.baseUrl || "https://api.example.com";

  // Filter collections based on search
  const filteredCollections = collections.filter(collection => {
    if (!searchQuery_local) return true;
    const query = searchQuery_local.toLowerCase();
    return (
      collection.name.toLowerCase().includes(query) ||
      collection.requests?.some(request => 
        request.name.toLowerCase().includes(query) ||
        request.url.toLowerCase().includes(query)
      )
    );
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-30 h-16">
        <div className="h-full px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-gray-600 hover:text-gray-900"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center lg:hidden">
                <FileText className="w-4 h-4 text-white" />
              </div>
              <div className="lg:hidden">
                <h1 className="text-lg font-semibold text-gray-900">{project?.name}</h1>
                <p className="text-sm text-gray-500">by @{username}</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search endpoints..."
                value={searchQuery_local}
                onChange={(e) => setSearchQuery_local(e.target.value)}
                className="pl-10 pr-4 py-2 w-64 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Globe className="w-4 h-4" />
              API Playground
            </button>
          </div>
        </div>
      </header>

      {/* Layout Container */}
      <div className="pt-16">
        <div className="max-w-[1800px] mx-auto relative">
          {/* Sidebar */}
          <Sidebar
            activeSection={activeSection}
            onSectionClick={onSectionClick}
            username={username}
            project={project}
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />

          {/* Main Content */}
          <div className="lg:ml-[340px] lg:mr-[420px]">
            <div className="px-8 py-12 max-w-4xl">
              {/* Main Documentation Content */}
              <div className="prose prose-lg max-w-none">
              {/* Overview Section */}
              <section id="overview" className="mb-16">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">API Documentation</h1>
                <p className="text-lg text-gray-600 leading-relaxed mb-4">
                  Welcome to our comprehensive API documentation. This guide will help you integrate with our platform quickly and efficiently.
                </p>
                <p className="text-base text-gray-700 leading-relaxed mb-4">
                  Our API is built with REST principles and returns JSON responses. We provide comprehensive SDKs for popular programming languages 
                  and detailed examples for every endpoint. Whether you're building a mobile app, web application, or server-to-server integration, 
                  this documentation has everything you need to get started.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                  <h3 className="font-semibold text-blue-900 mb-3">Quick Facts</h3>
                  <ul className="text-blue-800 space-y-2">
                    <li>• Base URL: <code className="bg-blue-100 px-2 py-1 rounded text-sm">https://api.example.com/v1</code></li>
                    <li>• All endpoints use HTTPS encryption</li>
                    <li>• Responses are in JSON format</li>
                    <li>• Rate limit: 1000 requests per hour</li>
                  </ul>
                </div>
              </section>

              {/* Getting Started Section */}
              <section id="getting-started" className="mb-16">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Getting Started</h2>
                <p className="text-base text-gray-700 leading-relaxed mb-4">
                  To begin using our API, you'll need to create an account and obtain your API credentials. Follow these simple steps to get up and running:
                </p>
                <ol className="list-decimal list-inside space-y-3 text-gray-700 mb-6">
                  <li>Sign up for a developer account on our platform</li>
                  <li>Navigate to the API section in your dashboard</li>
                  <li>Generate your API key and secret</li>
                  <li>Make your first API call using the authentication method below</li>
                </ol>
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <h4 className="font-semibold text-green-900 mb-3">First API Call</h4>
                  <p className="text-green-800 mb-3">Try this example to verify your setup:</p>
                  <pre className="bg-green-100 p-3 rounded text-sm text-green-900 overflow-x-auto">
                    <code>{`curl -H "Authorization: Bearer YOUR_API_KEY" \\
  https://api.example.com/v1/status`}</code>
                  </pre>
                </div>
              </section>

              {/* Authentication Section */}
              <section id="authentication" className="mb-16">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication</h2>
                <p className="text-base text-gray-700 leading-relaxed mb-4">
                  Our API uses multiple authentication methods to ensure security while providing flexibility for different use cases. 
                  Choose the method that best fits your application's needs.
                </p>

                <div id="basic-auth" className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Basic Authentication</h3>
                  <p className="text-base text-gray-700 leading-relaxed mb-4">
                    For simple server-to-server applications, you can use HTTP Basic Authentication with your API key as the username 
                    and your API secret as the password.
                  </p>
                  <div className="bg-gray-100 p-4 rounded-lg">
                    <code className="text-sm">Authorization: Basic {btoa("api_key:api_secret")}</code>
                  </div>
                </div>

                <div id="api-keys" className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">API Keys</h3>
                  <p className="text-base text-gray-700 leading-relaxed mb-4">
                    API keys provide a simple way to authenticate requests. Include your API key in the Authorization header 
                    as a Bearer token for all requests.
                  </p>
                  <div className="bg-gray-100 p-4 rounded-lg mb-4">
                    <code className="text-sm">Authorization: Bearer YOUR_API_KEY</code>
                  </div>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-yellow-800 text-sm">
                      <strong>Security Note:</strong> Never expose your API keys in client-side code or public repositories.
                    </p>
                  </div>
                </div>

                <div id="oauth2" className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">OAuth 2.0</h3>
                  <p className="text-base text-gray-700 leading-relaxed mb-4">
                    For applications that need to access user data, we support OAuth 2.0 with the authorization code flow. 
                    This provides secure, temporary access tokens that can be refreshed as needed.
                  </p>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Step 1: Authorization Request</h4>
                      <div className="bg-gray-100 p-4 rounded-lg text-sm">
                        <code>GET /oauth/authorize?response_type=code&client_id=CLIENT_ID&redirect_uri=REDIRECT_URI&scope=SCOPE</code>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Step 2: Token Exchange</h4>
                      <div className="bg-gray-100 p-4 rounded-lg text-sm">
                        <code>POST /oauth/token</code>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Rate Limiting Section */}
              <section id="rate-limiting" className="mb-16">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Rate Limiting</h2>
                <p className="text-base text-gray-700 leading-relaxed mb-4">
                  To ensure fair usage and maintain service quality, our API implements rate limiting. All endpoints are subject to these limits.
                </p>
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-200 rounded-lg">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold text-gray-900">Plan</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-900">Requests per Hour</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-900">Concurrent Requests</th>
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
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Error Handling</h2>
                <p className="text-base text-gray-700 leading-relaxed mb-4">
                  Our API uses conventional HTTP response codes to indicate success or failure. Codes in the 2xx range indicate success, 
                  4xx range indicate client errors, and 5xx range indicate server errors.
                </p>

                <div id="common-errors" className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Common Errors</h3>
                  <div className="space-y-4">
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold text-red-600 mb-2">400 - Bad Request</h4>
                      <p className="text-gray-700 text-sm">The request was invalid or cannot be served. Often due to missing required parameters.</p>
                    </div>
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold text-red-600 mb-2">401 - Unauthorized</h4>
                      <p className="text-gray-700 text-sm">Authentication failed or user doesn't have permissions for requested operation.</p>
                    </div>
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold text-red-600 mb-2">429 - Too Many Requests</h4>
                      <p className="text-gray-700 text-sm">Rate limit exceeded. See Rate Limiting section for more details.</p>
                    </div>
                  </div>
                </div>

                <div id="error-codes" className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Error Response Format</h3>
                  <p className="text-base text-gray-700 leading-relaxed mb-4">All errors return a consistent JSON structure:</p>
                  <div className="bg-gray-950 border border-gray-800 rounded-lg overflow-hidden">
                    <pre className="p-4 text-sm text-gray-100 overflow-x-auto"><code>{`{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid email format",
    "details": {
      "field": "email",
      "value": "invalid-email"
    },
    "request_id": "req_123456789"
  }
}`}</code></pre>
                  </div>
                </div>
              </section>

              {/* Pagination Section */}
              <section id="pagination" className="mb-16">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Pagination</h2>
                <p className="text-base text-gray-700 leading-relaxed mb-4">
                  List endpoints support pagination using cursor-based pagination for optimal performance with large datasets.
                </p>
                <div className="bg-gray-100 p-6 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">Pagination Parameters</h4>
                  <ul className="space-y-2 text-gray-700">
                    <li><code className="bg-white px-2 py-1 rounded text-sm">limit</code> - Number of items to return (max 100)</li>
                    <li><code className="bg-white px-2 py-1 rounded text-sm">cursor</code> - Cursor for pagination</li>
                    <li><code className="bg-white px-2 py-1 rounded text-sm">order</code> - Sort order (asc or desc)</li>
                  </ul>
                </div>
              </section>

              {/* Webhooks Section */}
              <section id="webhooks" className="mb-16">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Webhooks</h2>
                <p className="text-base text-gray-700 leading-relaxed mb-4">
                  Webhooks allow you to receive real-time notifications when events occur in your account. Configure webhook endpoints 
                  to receive HTTP POST requests whenever specific events happen.
                </p>

                <div id="webhook-security" className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Webhook Security</h3>
                  <p className="text-base text-gray-700 leading-relaxed mb-4">
                    All webhook requests include a signature header that you can use to verify the request came from our servers.
                  </p>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h4 className="font-semibold text-purple-900 mb-2">Signature Verification</h4>
                    <p className="text-purple-800 text-sm">
                      Compare the <code>X-Webhook-Signature</code> header with your computed HMAC-SHA256 signature.
                    </p>
                  </div>
                </div>
              </section>

              {/* Testing Section */}
              <section id="testing" className="mb-16">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Testing</h2>
                <p className="text-base text-gray-700 leading-relaxed mb-4">
                  We provide a comprehensive testing environment where you can experiment with our API without affecting production data.
                </p>
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <h4 className="font-semibold text-green-900 mb-3">Test Environment</h4>
                  <p className="text-green-800 mb-2">Use the test base URL for all your development and testing:</p>
                  <code className="bg-green-100 px-3 py-2 rounded text-green-900">https://api-test.example.com/v1</code>
                </div>
              </section>
            </div>
          </div>
        </div>

          {/* Code Examples Sidebar - Positioned within container */}
          <CodeExamplesSidebar
            request={{
              id: 'get-user',
              name: 'Get User by ID',
              method: 'GET',
              url: '/users/{id}',
              headers: { 'Authorization': 'Bearer {token}' },
              body: null
            }}
            baseUrl={baseUrl}
            activeSection={activeSection}
            onSectionClick={onSectionClick}
          />
        </div>
      </div>
    </div>
  );
}

// Template configuration
export const MinimalistConfig = {
  name: 'Minimalist',
  description: 'Clean, focused design with fixed sidebars and comprehensive parameter documentation',
  preview: '/templates/minimalist-preview.png',
  features: [
    'Fixed navigation sidebar',
    'Detailed parameter documentation',
    'Live code examples',
    'Responsive design',
    'Search functionality'
  ],
  settings: {
    showTOC: false,
    showCodeExamples: true,
    showResponseExamples: true,
    showMethodBadges: true,
    layout: 'three-column'
  }
};