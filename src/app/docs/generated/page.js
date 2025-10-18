"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import ModernTemplate from "@/components/docs/templates/ModernTemplate";
import { Button } from "@/components/ui/button";
import {
  Download,
  Share2,
  ArrowLeft,
  FileText,
  ExternalLink,
} from "lucide-react";

// Mock collections data for testing
const mockCollections = [
  {
    id: 'my-api-tests',
    name: 'My API Tests',
    requests: [
      { 
        id: 'req-1', 
        name: 'Get User Profile', 
        method: 'GET', 
        url: '/api/users/me',
        description: 'Retrieve the current authenticated user\'s profile information including personal details and preferences.',
        headers: {
          'Authorization': 'Bearer {{token}}',
          'Content-Type': 'application/json'
        },
        body: ''
      },
      { 
        id: 'req-2', 
        name: 'Create User', 
        method: 'POST', 
        url: '/api/users',
        description: 'Create a new user account with the provided information. Requires admin privileges.',
        headers: {
          'Authorization': 'Bearer {{token}}',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: "John Doe",
          email: "john@example.com",
          role: "user"
        }, null, 2)
      },
      { 
        id: 'req-3', 
        name: 'Update User Settings', 
        method: 'PUT', 
        url: '/api/users/settings',
        description: 'Update user preferences and account settings. Users can only update their own settings.',
        headers: {
          'Authorization': 'Bearer {{token}}',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          theme: "dark",
          notifications: true,
          language: "en"
        }, null, 2)
      },
    ]
  },
  {
    id: 'user-service',
    name: 'User Service APIs',
    requests: [
      { 
        id: 'req-4', 
        name: 'User Authentication', 
        method: 'POST', 
        url: '/auth/login',
        description: 'Authenticate a user with email and password. Returns a JWT token for subsequent requests.',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: "user@example.com",
          password: "password123"
        }, null, 2)
      },
      { 
        id: 'req-5', 
        name: 'User Logout', 
        method: 'POST', 
        url: '/auth/logout',
        description: 'Invalidate the current user session and JWT token.',
        headers: {
          'Authorization': 'Bearer {{token}}',
          'Content-Type': 'application/json'
        },
        body: ''
      },
      { 
        id: 'req-6', 
        name: 'List All Users', 
        method: 'GET', 
        url: '/api/users',
        description: 'Retrieve a paginated list of all users in the system. Requires admin privileges.',
        headers: {
          'Authorization': 'Bearer {{token}}'
        },
        body: ''
      },
      { 
        id: 'req-7', 
        name: 'Delete User Account', 
        method: 'DELETE', 
        url: '/api/users/:id',
        description: 'Permanently delete a user account. This action cannot be undone. Requires admin privileges.',
        headers: {
          'Authorization': 'Bearer {{token}}'
        },
        body: ''
      },
    ]
  }
];

export default function GeneratedDocsPage() {
  const searchParams = useSearchParams();
  const [docData, setDocData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Parse URL parameters
    const template = searchParams.get('template') || 'modern';
    const collectionsParam = searchParams.get('collections') || '';
    const title = searchParams.get('title') || 'API Documentation';
    
    const selectedCollectionIds = collectionsParam.split(',').filter(Boolean);
    
    // Filter mock collections based on URL parameters
    const selectedCollections = selectedCollectionIds.length > 0 
      ? mockCollections.filter(col => selectedCollectionIds.includes(col.id))
      : mockCollections;

    // Simulate loading
    setTimeout(() => {
      setDocData({
        template,
        collections: selectedCollections,
        customization: {
          title: decodeURIComponent(title),
          description: 'Complete API reference for your application',
          baseUrl: 'https://api.example.com',
          includeExamples: true,
          includeAuth: true,
          groupByCollection: true,
          includeErrorCodes: true,
        }
      });
      setLoading(false);
    }, 1000);
  }, [searchParams]);

  const handleExport = (format) => {
    // Placeholder for export functionality
    console.log(`Exporting as ${format}`);
    
    if (format === 'html') {
      // Generate static HTML
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>${docData.customization.title}</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: system-ui, sans-serif; line-height: 1.6; margin: 0; padding: 20px; }
            .container { max-width: 1200px; margin: 0 auto; }
            .method { padding: 4px 8px; border-radius: 4px; font-weight: bold; color: white; }
            .method.get { background: #10b981; }
            .method.post { background: #3b82f6; }
            .method.put { background: #f59e0b; }
            .method.delete { background: #ef4444; }
            .endpoint { margin: 20px 0; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; }
            code { background: #f3f4f6; padding: 2px 4px; border-radius: 4px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>${docData.customization.title}</h1>
            <p>${docData.customization.description}</p>
            ${docData.collections.map(collection => `
              <h2>${collection.name}</h2>
              ${collection.requests.map(request => `
                <div class="endpoint">
                  <h3>
                    <span class="method ${request.method.toLowerCase()}">${request.method}</span>
                    ${request.name}
                  </h3>
                  <code>${request.url}</code>
                  <p>${request.description || ''}</p>
                </div>
              `).join('')}
            `).join('')}
          </div>
        </body>
        </html>
      `;
      
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${docData.customization.title.toLowerCase().replace(/\s+/g, '-')}.html`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleShare = () => {
    const shareUrl = window.location.href;
    navigator.clipboard.writeText(shareUrl);
    // You could show a toast notification here
    alert('Share URL copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Generating documentation...</p>
        </div>
      </div>
    );
  }

  if (!docData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No Documentation Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            The requested documentation could not be loaded.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Action Bar */}
      <div className="sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.history.back()}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="font-semibold text-gray-900 dark:text-white">
                  {docData.customization.title}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {docData.collections.length} collection{docData.collections.length !== 1 ? 's' : ''} • {docData.collections.reduce((acc, col) => acc + col.requests.length, 0)} endpoints
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport('html')}
              >
                <Download className="w-4 h-4 mr-2" />
                Export HTML
              </Button>
              <Button
                size="sm"
                onClick={() => window.open('/playground', '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Open Playground
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Documentation Content */}
      <ModernTemplate docData={docData} />
    </div>
  );
}