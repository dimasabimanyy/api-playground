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
const Sidebar = ({ collections, activeSection, onSectionClick, username, project, isOpen, onClose }) => (
  <>
    {/* Mobile Overlay */}
    {isOpen && (
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
        onClick={onClose}
      />
    )}
    
    <div className={`fixed top-0 left-0 h-full w-80 bg-white border-r border-gray-200 z-50 transform transition-transform duration-300 overflow-y-auto ${
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
              <h1 className="text-lg font-semibold text-gray-900">{project?.name}</h1>
              <p className="text-sm text-gray-500">by @{username}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {project?.description && (
          <p className="text-sm text-gray-600">{project.description}</p>
        )}
      </div>

      {/* Navigation */}
      <div className="p-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Collections</h2>
        <nav className="space-y-1">
          {collections.map((collection) => (
            <div key={collection.id} className="space-y-1">
              <button
                onClick={() => onSectionClick(`collection-${collection.id}`)}
                className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-gray-900 hover:bg-gray-50 transition-colors flex items-center justify-between"
              >
                {collection.name}
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
              <div className="ml-6 space-y-0.5">
                {collection.requests?.map((request) => (
                  <button
                    key={request.id}
                    onClick={() => onSectionClick(`endpoint-${request.id}`)}
                    className={`w-full text-left px-3 py-2 rounded text-sm transition-colors flex items-center gap-2 ${
                      activeSection === `endpoint-${request.id}`
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    <MethodBadge method={request.method} size="xs" />
                    <span className="truncate">{request.name}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Base URL */}
      <div className="p-6 border-t border-gray-200 mt-auto">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Base URL</h3>
        <code className="text-sm bg-gray-100 px-3 py-2 rounded block break-all text-gray-700">
          {project?.settings?.baseUrl || "https://api.example.com"}
        </code>
      </div>
    </div>
  </>
);

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

// Code Examples Sidebar
const CodeExamplesSidebar = ({ request, baseUrl }) => {
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
    <div className="fixed top-0 right-0 h-full w-96 bg-white border-l border-gray-200 overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* Request Examples */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Request</h3>
          <CodeBlock 
            tabs={generateCodeExamples()}
          />
        </div>

        {/* Response Example */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Response</h3>
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

      {/* Layout */}
      <div className="pt-16 flex">
        {/* Sidebar */}
        <Sidebar
          collections={filteredCollections}
          activeSection={activeSection}
          onSectionClick={onSectionClick}
          username={username}
          project={project}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main Content */}
        <div className="flex-1 lg:ml-80 lg:mr-96">
          <div className="px-8 py-12">
            {filteredCollections.map((collection) => (
              <div key={collection.id} className="mb-20" id={`collection-${collection.id}`}>
                {/* Collection Header */}
                <div className="mb-12">
                  <h2 className="text-4xl font-bold text-gray-900 mb-4">
                    {collection.name}
                  </h2>
                  <p className="text-xl text-gray-600 leading-relaxed">{collection.description}</p>
                </div>

                {/* Endpoints */}
                <div className="space-y-16">
                  {collection.requests?.map((request) => (
                    <EndpointContent
                      key={request.id}
                      request={request}
                      project={project}
                      baseUrl={baseUrl}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Code Examples Sidebar - Fixed on the right */}
        {(() => {
          // Find the currently active request based on activeSection
          let activeRequest = null;
          if (activeSection?.startsWith('endpoint-')) {
            const requestId = activeSection.replace('endpoint-', '');
            for (const collection of filteredCollections) {
              const request = collection.requests?.find(req => req.id === requestId);
              if (request) {
                activeRequest = request;
                break;
              }
            }
          }
          
          // Fallback to first request if no active section
          if (!activeRequest && filteredCollections.length > 0 && filteredCollections[0].requests?.length > 0) {
            activeRequest = filteredCollections[0].requests[0];
          }
          
          return activeRequest ? (
            <CodeExamplesSidebar
              request={activeRequest}
              baseUrl={baseUrl}
            />
          ) : null;
        })()}
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