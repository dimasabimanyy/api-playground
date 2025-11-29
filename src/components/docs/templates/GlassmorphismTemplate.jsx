"use client";

import { useState, useEffect } from "react";
import { Search, Code, ExternalLink, Copy, Check, Zap, Shield, Clock, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const GlassmorphismConfig = {
  name: "Glassmorphism",
  description: "Subtle glass effects with modern transparency",
  settings: {
    showSearch: true,
    showToc: true,
    showExamples: true,
    theme: "glass"
  }
};

export default function GlassmorphismTemplate({ 
  project, 
  collections = [], 
  searchQuery = "", 
  activeSection = "",
  onSectionClick = () => {},
  username = ""
}) {
  const [copiedCode, setCopiedCode] = useState(null);
  const [inThisPageSections, setInThisPageSections] = useState([]);

  const copyToClipboard = async (text, id) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCode(id);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  useEffect(() => {
    if (activeSection === "overview") {
      setInThisPageSections([
        { id: "introduction", title: "Introduction" },
        { id: "features", title: "Key Features" },
        { id: "architecture", title: "API Architecture" },
        { id: "quick-start", title: "Quick Start" }
      ]);
    } else if (activeSection === "getting-started") {
      setInThisPageSections([
        { id: "installation", title: "Installation" },
        { id: "first-request", title: "First API Request" },
        { id: "response-format", title: "Response Format" },
        { id: "next-steps", title: "Next Steps" }
      ]);
    } else if (activeSection === "authentication") {
      setInThisPageSections([
        { id: "auth-overview", title: "Authentication Overview" },
        { id: "api-keys", title: "API Keys" },
        { id: "oauth", title: "OAuth 2.0" },
        { id: "jwt-tokens", title: "JWT Tokens" },
        { id: "auth-examples", title: "Examples" }
      ]);
    } else if (activeSection === "users") {
      setInThisPageSections([
        { id: "user-endpoints", title: "User Endpoints" },
        { id: "get-users", title: "List Users" },
        { id: "get-user", title: "Get User" },
        { id: "create-user", title: "Create User" },
        { id: "update-user", title: "Update User" },
        { id: "delete-user", title: "Delete User" }
      ]);
    } else if (activeSection === "products") {
      setInThisPageSections([
        { id: "product-overview", title: "Product Overview" },
        { id: "list-products", title: "List Products" },
        { id: "create-product", title: "Create Product" },
        { id: "update-product", title: "Update Product" },
        { id: "product-categories", title: "Categories" },
        { id: "inventory", title: "Inventory Management" }
      ]);
    } else if (activeSection === "orders") {
      setInThisPageSections([
        { id: "order-flow", title: "Order Flow" },
        { id: "create-order", title: "Create Order" },
        { id: "order-status", title: "Order Status" },
        { id: "payment-processing", title: "Payment Processing" },
        { id: "order-fulfillment", title: "Order Fulfillment" }
      ]);
    } else if (activeSection === "webhooks") {
      setInThisPageSections([
        { id: "webhook-overview", title: "Webhook Overview" },
        { id: "webhook-setup", title: "Setup" },
        { id: "webhook-events", title: "Available Events" },
        { id: "webhook-security", title: "Security" },
        { id: "webhook-testing", title: "Testing" }
      ]);
    } else if (activeSection === "rate-limiting") {
      setInThisPageSections([
        { id: "rate-overview", title: "Rate Limiting Overview" },
        { id: "rate-limits", title: "Current Limits" },
        { id: "rate-headers", title: "Response Headers" },
        { id: "rate-handling", title: "Handling Limits" }
      ]);
    } else if (activeSection === "errors") {
      setInThisPageSections([
        { id: "error-format", title: "Error Format" },
        { id: "error-codes", title: "Status Codes" },
        { id: "common-errors", title: "Common Errors" },
        { id: "handling-errors", title: "Error Handling" }
      ]);
    } else if (activeSection === "sdk") {
      setInThisPageSections([
        { id: "official-sdks", title: "Official SDKs" },
        { id: "javascript-sdk", title: "JavaScript SDK" },
        { id: "python-sdk", title: "Python SDK" },
        { id: "community-libraries", title: "Community Libraries" }
      ]);
    } else if (activeSection === "changelog") {
      setInThisPageSections([
        { id: "latest-changes", title: "Latest Changes" },
        { id: "v2-changes", title: "Version 2.0" },
        { id: "v1-changes", title: "Version 1.x" },
        { id: "migration-guide", title: "Migration Guide" }
      ]);
    } else {
      setInThisPageSections([]);
    }
  }, [activeSection]);

  const renderContent = () => {
    switch (activeSection) {
      case "overview":
        return (
          <div className="space-y-8">
            <div id="introduction" className="scroll-mt-6">
              <div className="backdrop-blur-sm bg-white/10 border border-white/20 rounded-2xl p-8 shadow-lg">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400/20 to-purple-400/20 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                    <Zap className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">Welcome to {project.name}</h1>
                    <p className="text-gray-600">Enterprise-grade REST API Platform</p>
                  </div>
                </div>
                
                <p className="text-gray-700 text-lg leading-relaxed mb-6">
                  Our comprehensive REST API provides enterprise-grade functionality for user management, 
                  product catalog operations, order processing, and real-time webhook integrations. 
                  Built with GraphQL compatibility, advanced caching, and multi-region deployment support.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="backdrop-blur-sm bg-white/30 border border-white/30 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <Shield className="w-5 h-5 text-green-600" />
                      <span className="font-semibold text-gray-900">Enterprise Security</span>
                    </div>
                    <p className="text-sm text-gray-600">OAuth 2.0, JWT, API keys with role-based access</p>
                  </div>
                  <div className="backdrop-blur-sm bg-white/30 border border-white/30 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <Clock className="w-5 h-5 text-blue-600" />
                      <span className="font-semibold text-gray-900">Ultra-Fast Performance</span>
                    </div>
                    <p className="text-sm text-gray-600">Sub-50ms response times with global edge caching</p>
                  </div>
                </div>
              </div>
            </div>

            <div id="features" className="scroll-mt-6">
              <div className="backdrop-blur-sm bg-white/10 border border-white/20 rounded-2xl p-6 shadow-lg">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Key Features</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { icon: Shield, title: "Multi-Auth Support", desc: "OAuth 2.0, JWT, API Keys, SSO integration" },
                    { icon: Zap, title: "Real-time Operations", desc: "WebSocket support, live data streaming" },
                    { icon: Star, title: "Advanced Analytics", desc: "Built-in metrics, custom dashboards" },
                    { icon: Code, title: "GraphQL Compatible", desc: "REST and GraphQL endpoint support" },
                    { icon: Clock, title: "Rate Management", desc: "Intelligent throttling and quota systems" },
                    { icon: ExternalLink, title: "Webhook System", desc: "Event-driven integrations with retry logic" }
                  ].map((feature, index) => (
                    <div key={index} className="backdrop-blur-sm bg-white/20 border border-white/30 rounded-xl p-4 hover:bg-white/30 transition-colors">
                      <feature.icon className="w-8 h-8 text-blue-600 mb-3" />
                      <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                      <p className="text-sm text-gray-600">{feature.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div id="architecture" className="scroll-mt-6">
              <div className="backdrop-blur-sm bg-white/10 border border-white/20 rounded-2xl p-6 shadow-lg">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">API Architecture</h2>
                <div className="space-y-4">
                  <div className="backdrop-blur-sm bg-blue-50/30 border border-blue-200/30 rounded-xl p-6">
                    <h3 className="font-semibold text-blue-900 mb-3">Microservices Design</h3>
                    <p className="text-blue-800 mb-4">
                      Our API follows a microservices architecture with independent services for users, products, 
                      orders, and notifications. Each service maintains its own database and can scale independently.
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                      <span className="bg-blue-100/80 text-blue-800 px-2 py-1 rounded">User Service</span>
                      <span className="bg-blue-100/80 text-blue-800 px-2 py-1 rounded">Product Service</span>
                      <span className="bg-blue-100/80 text-blue-800 px-2 py-1 rounded">Order Service</span>
                      <span className="bg-blue-100/80 text-blue-800 px-2 py-1 rounded">Notification Service</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div id="quick-start" className="scroll-mt-6">
              <div className="backdrop-blur-sm bg-white/10 border border-white/20 rounded-2xl p-6 shadow-lg">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Start</h2>
                <p className="text-gray-700 mb-4">Get started in under 5 minutes with our streamlined onboarding.</p>
                
                <div className="space-y-4">
                  <div className="backdrop-blur-sm bg-gray-900/80 border border-white/20 rounded-xl p-4">
                    <div className="text-xs text-gray-400 mb-2">1. Get your API key</div>
                    <code className="text-green-400 text-sm block">
                      curl -X POST "https://api.example.com/auth/api-keys" \<br/>
                      &nbsp;&nbsp;-H "Authorization: Bearer YOUR_ACCESS_TOKEN" \<br/>
                      &nbsp;&nbsp;-d '{{"name": "My App Key", "permissions": ["read:users"]}}'
                    </code>
                  </div>

                  <div className="backdrop-blur-sm bg-gray-900/80 border border-white/20 rounded-xl p-4">
                    <div className="text-xs text-gray-400 mb-2">2. Make your first request</div>
                    <code className="text-blue-400 text-sm block">
                      curl -X GET "https://api.example.com/v2/users" \<br/>
                      &nbsp;&nbsp;-H "Authorization: Bearer sk_live_..." \<br/>
                      &nbsp;&nbsp;-H "Content-Type: application/json"
                    </code>
                  </div>

                  <div className="backdrop-blur-sm bg-gray-900/80 border border-white/20 rounded-xl p-4">
                    <div className="text-xs text-gray-400 mb-2">3. Handle the response</div>
                    <code className="text-purple-400 text-sm block">
                      {`{
  "data": [
    {
      "id": "usr_1234567890",
      "email": "user@example.com",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 1247
  }
}`}
                    </code>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "getting-started":
        return (
          <div className="space-y-8">
            <div id="installation" className="scroll-mt-6">
              <div className="backdrop-blur-sm bg-white/10 border border-white/20 rounded-2xl p-8 shadow-lg">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">Getting Started</h1>
                
                <div className="space-y-6">
                  <div className="backdrop-blur-sm bg-gradient-to-r from-blue-50/50 to-purple-50/50 border border-blue-200/30 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-blue-900 mb-4">Choose Your Integration Method</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="backdrop-blur-sm bg-white/40 border border-white/40 rounded-xl p-4">
                        <Code className="w-8 h-8 text-blue-600 mb-2" />
                        <h4 className="font-semibold text-gray-900">REST API</h4>
                        <p className="text-sm text-gray-600">Direct HTTP calls</p>
                      </div>
                      <div className="backdrop-blur-sm bg-white/40 border border-white/40 rounded-xl p-4">
                        <Star className="w-8 h-8 text-purple-600 mb-2" />
                        <h4 className="font-semibold text-gray-900">GraphQL</h4>
                        <p className="text-sm text-gray-600">Query what you need</p>
                      </div>
                      <div className="backdrop-blur-sm bg-white/40 border border-white/40 rounded-xl p-4">
                        <Zap className="w-8 h-8 text-green-600 mb-2" />
                        <h4 className="font-semibold text-gray-900">WebSocket</h4>
                        <p className="text-sm text-gray-600">Real-time updates</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div id="first-request" className="scroll-mt-6">
              <div className="backdrop-blur-sm bg-white/10 border border-white/20 rounded-2xl p-6 shadow-lg">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Your First API Request</h2>
                <p className="text-gray-700 mb-6">Let's start with a simple request to fetch user information:</p>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">cURL Example</h4>
                      <div className="backdrop-blur-sm bg-gray-900/80 border border-white/20 rounded-xl p-4">
                        <code className="text-green-400 text-sm">
                          {`curl -X GET "https://api.example.com/v2/users/me" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Accept: application/json"`}
                        </code>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">JavaScript Example</h4>
                      <div className="backdrop-blur-sm bg-gray-900/80 border border-white/20 rounded-xl p-4">
                        <code className="text-blue-400 text-sm">
                          {`const response = await fetch('/api/v2/users/me', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Accept': 'application/json'
  }
});`}
                        </code>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div id="response-format" className="scroll-mt-6">
              <div className="backdrop-blur-sm bg-white/10 border border-white/20 rounded-2xl p-6 shadow-lg">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Response Format</h2>
                <p className="text-gray-700 mb-6">All API responses follow a consistent structure:</p>
                
                <div className="backdrop-blur-sm bg-gray-900/80 border border-white/20 rounded-xl p-6">
                  <code className="text-purple-400 text-sm">
                    {`{
  "success": true,
  "data": {
    "id": "usr_1234567890",
    "email": "user@example.com",
    "name": "John Doe",
    "avatar_url": "https://cdn.example.com/avatars/123.jpg",
    "created_at": "2024-01-15T10:30:00Z",
    "last_active": "2024-11-28T14:20:00Z",
    "preferences": {
      "theme": "dark",
      "notifications": true,
      "timezone": "UTC"
    }
  },
  "meta": {
    "request_id": "req_abcd1234",
    "timestamp": "2024-11-28T14:30:00Z",
    "version": "v2.1"
  }
}`}
                  </code>
                </div>
              </div>
            </div>

            <div id="next-steps" className="scroll-mt-6">
              <div className="backdrop-blur-sm bg-white/10 border border-white/20 rounded-2xl p-6 shadow-lg">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Next Steps</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="backdrop-blur-sm bg-gradient-to-br from-blue-50/40 to-blue-100/40 border border-blue-200/30 rounded-xl p-6">
                    <Shield className="w-8 h-8 text-blue-600 mb-3" />
                    <h3 className="font-semibold text-blue-900 mb-2">Set Up Authentication</h3>
                    <p className="text-blue-800 text-sm mb-4">Configure OAuth 2.0 or generate API keys for secure access.</p>
                    <button className="text-blue-600 text-sm font-medium hover:text-blue-800 transition-colors">
                      View Authentication Guide →
                    </button>
                  </div>
                  
                  <div className="backdrop-blur-sm bg-gradient-to-br from-green-50/40 to-green-100/40 border border-green-200/30 rounded-xl p-6">
                    <Code className="w-8 h-8 text-green-600 mb-3" />
                    <h3 className="font-semibold text-green-900 mb-2">Explore Endpoints</h3>
                    <p className="text-green-800 text-sm mb-4">Discover all available endpoints for users, products, and orders.</p>
                    <button className="text-green-600 text-sm font-medium hover:text-green-800 transition-colors">
                      Browse API Reference →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "authentication":
        return (
          <div className="space-y-8">
            <div id="auth-overview" className="scroll-mt-6">
              <div className="backdrop-blur-sm bg-white/10 border border-white/20 rounded-2xl p-8 shadow-lg">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">Authentication</h1>
                <p className="text-gray-700 text-lg mb-6">
                  Enterprise-grade security with multiple authentication methods to suit any integration pattern.
                </p>
                
                <div className="backdrop-blur-sm bg-amber-50/40 border border-amber-200/40 rounded-xl p-6">
                  <div className="flex items-start gap-4">
                    <Shield className="w-6 h-6 text-amber-600 mt-1" />
                    <div>
                      <h3 className="font-semibold text-amber-900 mb-2">Security First</h3>
                      <p className="text-amber-800 text-sm">
                        All endpoints use HTTPS encryption, rate limiting, and comprehensive audit logging. 
                        We support OAuth 2.0, JWT tokens, and API keys with granular permission controls.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div id="api-keys" className="scroll-mt-6">
              <div className="backdrop-blur-sm bg-white/10 border border-white/20 rounded-2xl p-6 shadow-lg">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">API Keys</h2>
                <p className="text-gray-700 mb-6">The simplest way to authenticate. Perfect for server-to-server communication.</p>
                
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Creating API Keys</h4>
                    <div className="backdrop-blur-sm bg-gray-900/80 border border-white/20 rounded-xl p-4">
                      <code className="text-green-400 text-sm">
                        {`curl -X POST "https://api.example.com/v2/auth/api-keys" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Production API Key",
    "permissions": ["read:users", "write:products", "read:orders"],
    "expires_at": "2025-12-31T23:59:59Z"
  }'`}
                      </code>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Using API Keys</h4>
                    <div className="backdrop-blur-sm bg-gray-900/80 border border-white/20 rounded-xl p-4">
                      <code className="text-blue-400 text-sm">
                        {`# Include in Authorization header
Authorization: Bearer sk_live_1234567890abcdef

# Or as query parameter (not recommended for production)
?api_key=sk_live_1234567890abcdef`}
                      </code>
                    </div>
                  </div>
                  
                  <div className="backdrop-blur-sm bg-red-50/40 border border-red-200/40 rounded-xl p-4">
                    <p className="text-red-800 text-sm">
                      <strong>Security Note:</strong> Keep your API keys secure. Never expose them in client-side code 
                      or commit them to version control. Rotate keys regularly and use environment variables.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div id="oauth" className="scroll-mt-6">
              <div className="backdrop-blur-sm bg-white/10 border border-white/20 rounded-2xl p-6 shadow-lg">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">OAuth 2.0</h2>
                <p className="text-gray-700 mb-6">
                  For user-facing applications that need to act on behalf of users. Supports Authorization Code and PKCE flows.
                </p>
                
                <div className="space-y-6">
                  <div className="backdrop-blur-sm bg-blue-50/40 border border-blue-200/40 rounded-xl p-6">
                    <h4 className="font-semibold text-blue-900 mb-4">Authorization Code Flow</h4>
                    <div className="space-y-4">
                      <div>
                        <h5 className="font-medium text-blue-900 mb-2">Step 1: Authorization Request</h5>
                        <div className="backdrop-blur-sm bg-gray-900/80 border border-white/20 rounded-lg p-3">
                          <code className="text-green-400 text-xs">
                            {`https://api.example.com/oauth/authorize?
  client_id=your_client_id&
  response_type=code&
  scope=read:profile write:data&
  redirect_uri=https://yourapp.com/callback&
  state=random_string_for_security`}
                          </code>
                        </div>
                      </div>
                      
                      <div>
                        <h5 className="font-medium text-blue-900 mb-2">Step 2: Exchange Code for Token</h5>
                        <div className="backdrop-blur-sm bg-gray-900/80 border border-white/20 rounded-lg p-3">
                          <code className="text-blue-400 text-xs">
                            {`curl -X POST "https://api.example.com/oauth/token" \
  -H "Content-Type: application/json" \
  -d '{
    "grant_type": "authorization_code",
    "client_id": "your_client_id",
    "client_secret": "your_client_secret",
    "code": "received_authorization_code",
    "redirect_uri": "https://yourapp.com/callback"
  }'`}
                          </code>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div id="jwt-tokens" className="scroll-mt-6">
              <div className="backdrop-blur-sm bg-white/10 border border-white/20 rounded-2xl p-6 shadow-lg">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">JWT Tokens</h2>
                <p className="text-gray-700 mb-6">
                  Self-contained tokens with user information and permissions encoded within.
                </p>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Token Structure</h4>
                    <div className="backdrop-blur-sm bg-gray-900/80 border border-white/20 rounded-xl p-4">
                      <code className="text-purple-400 text-sm">
                        {`{
  "header": {
    "typ": "JWT",
    "alg": "RS256",
    "kid": "key_id_123"
  },
  "payload": {
    "sub": "usr_1234567890",
    "iss": "https://api.example.com",
    "aud": "your_client_id",
    "exp": 1703779200,
    "iat": 1703692800,
    "scope": "read:profile write:data",
    "permissions": ["users:read", "products:write"]
  },
  "signature": "..."
}`}
                      </code>
                    </div>
                  </div>
                  
                  <div className="backdrop-blur-sm bg-green-50/40 border border-green-200/40 rounded-xl p-4">
                    <h5 className="font-semibold text-green-900 mb-2">Token Validation</h5>
                    <p className="text-green-800 text-sm">
                      Verify JWT signatures using our public keys available at 
                      <code className="bg-green-100/60 px-1 rounded">https://api.example.com/.well-known/jwks.json</code>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div id="auth-examples" className="scroll-mt-6">
              <div className="backdrop-blur-sm bg-white/10 border border-white/20 rounded-2xl p-6 shadow-lg">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Authentication Examples</h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Node.js Example</h4>
                    <div className="backdrop-blur-sm bg-gray-900/80 border border-white/20 rounded-xl p-4">
                      <code className="text-green-400 text-sm">
                        {`const axios = require('axios');

const api = axios.create({
  baseURL: 'https://api.example.com/v2',
  headers: {
    'Authorization': 'Bearer ' + process.env.API_KEY,
    'Content-Type': 'application/json'
  }
});

// Make authenticated request
const users = await api.get('/users');`}
                      </code>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Python Example</h4>
                    <div className="backdrop-blur-sm bg-gray-900/80 border border-white/20 rounded-xl p-4">
                      <code className="text-blue-400 text-sm">
                        {`import requests
import os

headers = {
    'Authorization': f'Bearer {os.getenv("API_KEY")}',
    'Content-Type': 'application/json'
}

response = requests.get(
    'https://api.example.com/v2/users',
    headers=headers
)

users = response.json()`}
                      </code>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "users":
        return (
          <div className="space-y-8">
            <div id="user-endpoints" className="scroll-mt-6">
              <div className="backdrop-blur-sm bg-white/10 border border-white/20 rounded-2xl p-6 shadow-lg">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">User Management</h1>
                <p className="text-gray-700 text-lg">
                  Complete CRUD operations for user management and profile updates.
                </p>
              </div>
            </div>

            <div id="get-users" className="scroll-mt-6">
              <div className="backdrop-blur-sm bg-white/10 border border-white/20 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-3 py-1 bg-green-100/80 text-green-800 text-sm font-medium rounded-full backdrop-blur-sm">GET</span>
                  <h2 className="text-2xl font-bold text-gray-900">Get All Users</h2>
                </div>
                <p className="text-gray-700 mb-6">Retrieve a paginated list of all users with optional filtering.</p>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Endpoint</h4>
                    <div className="backdrop-blur-sm bg-gray-900/80 border border-white/20 rounded-xl p-3">
                      <code className="text-green-400">GET /api/users</code>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Query Parameters</h4>
                    <div className="backdrop-blur-sm bg-white/20 border border-white/30 rounded-xl overflow-hidden">
                      <table className="w-full">
                        <tbody className="divide-y divide-white/20">
                          <tr>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">page</td>
                            <td className="px-4 py-3 text-sm text-gray-700">Page number (default: 1)</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">limit</td>
                            <td className="px-4 py-3 text-sm text-gray-700">Items per page (default: 20)</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div id="create-user" className="scroll-mt-6">
              <div className="backdrop-blur-sm bg-white/10 border border-white/20 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-3 py-1 bg-blue-100/80 text-blue-800 text-sm font-medium rounded-full backdrop-blur-sm">POST</span>
                  <h2 className="text-2xl font-bold text-gray-900">Create User</h2>
                </div>
                <p className="text-gray-700 mb-6">Create a new user account with email verification.</p>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Request Body</h4>
                    <div className="backdrop-blur-sm bg-gray-900/80 border border-white/20 rounded-xl p-4">
                      <pre className="text-green-400 text-sm">{`{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}`}</pre>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div id="update-user" className="scroll-mt-6">
              <div className="backdrop-blur-sm bg-white/10 border border-white/20 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-3 py-1 bg-yellow-100/80 text-yellow-800 text-sm font-medium rounded-full backdrop-blur-sm">PUT</span>
                  <h2 className="text-2xl font-bold text-gray-900">Update User</h2>
                </div>
                <p className="text-gray-700 mb-6">Update user profile information and settings.</p>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Endpoint</h4>
                  <div className="backdrop-blur-sm bg-gray-900/80 border border-white/20 rounded-xl p-3">
                    <code className="text-yellow-400">PUT /api/users/{id}</code>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "errors":
        return (
          <div className="space-y-8">
            <div id="error-format" className="scroll-mt-6">
              <div className="backdrop-blur-sm bg-white/10 border border-white/20 rounded-2xl p-6 shadow-lg">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">Error Handling</h1>
                <p className="text-gray-700 text-lg mb-6">
                  Understand how to handle errors and what each status code means.
                </p>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Error Response Format</h3>
                <div className="backdrop-blur-sm bg-gray-900/80 border border-white/20 rounded-xl p-4">
                  <pre className="text-red-400 text-sm">{`{
  "error": {
    "code": "INVALID_REQUEST",
    "message": "The request is invalid",
    "details": "Email field is required"
  }
}`}</pre>
                </div>
              </div>
            </div>

            <div id="error-codes" className="scroll-mt-6">
              <div className="backdrop-blur-sm bg-white/10 border border-white/20 rounded-2xl p-6 shadow-lg">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Common Error Codes</h2>
                <div className="space-y-3">
                  {[
                    { code: "400", name: "Bad Request", desc: "Invalid request parameters" },
                    { code: "401", name: "Unauthorized", desc: "Authentication required" },
                    { code: "403", name: "Forbidden", desc: "Insufficient permissions" },
                    { code: "404", name: "Not Found", desc: "Resource does not exist" },
                    { code: "429", name: "Rate Limited", desc: "Too many requests" }
                  ].map((error) => (
                    <div key={error.code} className="backdrop-blur-sm bg-red-50/20 border border-red-200/30 rounded-xl p-4">
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-1 bg-red-100/80 text-red-800 text-sm font-mono rounded backdrop-blur-sm">
                          {error.code}
                        </span>
                        <div>
                          <div className="font-semibold text-gray-900">{error.name}</div>
                          <div className="text-sm text-gray-600">{error.desc}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div id="handling-errors" className="scroll-mt-6">
              <div className="backdrop-blur-sm bg-white/10 border border-white/20 rounded-2xl p-6 shadow-lg">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Handling Errors</h2>
                <p className="text-gray-700 mb-4">Always check the response status and handle errors gracefully:</p>
                <div className="backdrop-blur-sm bg-gray-900/80 border border-white/20 rounded-xl p-4">
                  <pre className="text-blue-400 text-sm">{`try {
  const response = await fetch('/api/users');
  if (!response.ok) {
    const error = await response.json();
    console.error('API Error:', error.error.message);
  }
} catch (error) {
  console.error('Network Error:', error);
}`}</pre>
                </div>
              </div>
            </div>
          </div>
        );

      case "users":
        return (
          <div className="space-y-8">
            <div id="user-endpoints" className="scroll-mt-6">
              <div className="backdrop-blur-sm bg-white/10 border border-white/20 rounded-2xl p-8 shadow-lg">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">User Management</h1>
                <p className="text-gray-700 text-lg mb-6">
                  Complete CRUD operations for user management with advanced filtering, sorting, and bulk operations.
                </p>
                
                <div className="backdrop-blur-sm bg-blue-50/30 border border-blue-200/30 rounded-xl p-6">
                  <h3 className="font-semibold text-blue-900 mb-4">Base URL</h3>
                  <code className="text-blue-800 bg-blue-100/60 px-3 py-2 rounded-lg">https://api.example.com/v2/users</code>
                </div>
              </div>
            </div>

            <div id="get-users" className="scroll-mt-6">
              <div className="backdrop-blur-sm bg-white/10 border border-white/20 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-6">
                  <span className="px-3 py-1 bg-green-100/80 text-green-800 text-sm font-medium rounded-full backdrop-blur-sm">GET</span>
                  <h2 className="text-2xl font-bold text-gray-900">List Users</h2>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Query Parameters</h4>
                    <div className="backdrop-blur-sm bg-white/20 border border-white/30 rounded-xl overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-white/30">
                          <tr>
                            <th className="text-left px-4 py-3 text-sm font-semibold text-gray-900">Parameter</th>
                            <th className="text-left px-4 py-3 text-sm font-semibold text-gray-900">Type</th>
                            <th className="text-left px-4 py-3 text-sm font-semibold text-gray-900">Description</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/20">
                          {[
                            { name: 'page', type: 'integer', desc: 'Page number (default: 1)' },
                            { name: 'per_page', type: 'integer', desc: 'Items per page (max: 100, default: 20)' },
                            { name: 'sort', type: 'string', desc: 'Sort field: created_at, name, email' },
                            { name: 'order', type: 'string', desc: 'Sort order: asc or desc' },
                            { name: 'search', type: 'string', desc: 'Search in name and email fields' },
                            { name: 'status', type: 'string', desc: 'Filter by status: active, inactive, pending' },
                            { name: 'role', type: 'string', desc: 'Filter by role: admin, user, moderator' }
                          ].map((param, i) => (
                            <tr key={i}>
                              <td className="px-4 py-3 text-sm font-mono text-blue-600">{param.name}</td>
                              <td className="px-4 py-3 text-sm text-gray-600">{param.type}</td>
                              <td className="px-4 py-3 text-sm text-gray-700">{param.desc}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Example Request</h4>
                    <div className="backdrop-blur-sm bg-gray-900/80 border border-white/20 rounded-xl p-4">
                      <code className="text-green-400 text-sm">
                        {`curl -X GET "https://api.example.com/v2/users?page=2&per_page=50&sort=created_at&order=desc&status=active" \
  -H "Authorization: Bearer sk_live_..." \
  -H "Accept: application/json"`}
                      </code>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Response Example</h4>
                    <div className="backdrop-blur-sm bg-gray-900/80 border border-white/20 rounded-xl p-4">
                      <code className="text-purple-400 text-sm">
                        {`{
  "success": true,
  "data": [
    {
      "id": "usr_1234567890",
      "email": "john@example.com",
      "name": "John Doe",
      "role": "user",
      "status": "active",
      "avatar_url": "https://cdn.example.com/avatars/john.jpg",
      "last_login": "2024-11-28T10:30:00Z",
      "created_at": "2024-01-15T14:20:00Z",
      "updated_at": "2024-11-27T16:45:00Z"
    }
  ],
  "pagination": {
    "page": 2,
    "per_page": 50,
    "total": 1247,
    "pages": 25,
    "has_next": true,
    "has_prev": true
  }
}`}
                      </code>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div id="create-user" className="scroll-mt-6">
              <div className="backdrop-blur-sm bg-white/10 border border-white/20 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-6">
                  <span className="px-3 py-1 bg-blue-100/80 text-blue-800 text-sm font-medium rounded-full backdrop-blur-sm">POST</span>
                  <h2 className="text-2xl font-bold text-gray-900">Create User</h2>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Request Body</h4>
                    <div className="backdrop-blur-sm bg-gray-900/80 border border-white/20 rounded-xl p-4">
                      <code className="text-blue-400 text-sm">
                        {`{
  "email": "newuser@example.com",
  "name": "Jane Smith",
  "password": "securePassword123!",
  "role": "user",
  "profile": {
    "phone": "+1-555-0123",
    "timezone": "America/New_York",
    "preferences": {
      "email_notifications": true,
      "theme": "light"
    }
  },
  "metadata": {
    "source": "admin_panel",
    "department": "Engineering"
  }
}`}
                      </code>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Validation Rules</h4>
                    <div className="backdrop-blur-sm bg-amber-50/40 border border-amber-200/40 rounded-xl p-4">
                      <ul className="space-y-2 text-amber-800 text-sm">
                        <li>• Email must be unique and valid format</li>
                        <li>• Password minimum 8 characters with uppercase, lowercase, number</li>
                        <li>• Name required, 2-100 characters</li>
                        <li>• Role must be one of: user, admin, moderator</li>
                        <li>• Phone must be valid international format</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div id="update-user" className="scroll-mt-6">
              <div className="backdrop-blur-sm bg-white/10 border border-white/20 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-6">
                  <span className="px-3 py-1 bg-yellow-100/80 text-yellow-800 text-sm font-medium rounded-full backdrop-blur-sm">PUT</span>
                  <h2 className="text-2xl font-bold text-gray-900">Update User</h2>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Endpoint</h4>
                    <div className="backdrop-blur-sm bg-gray-900/80 border border-white/20 rounded-xl p-3">
                      <code className="text-yellow-400">PUT /v2/users/{user_id}</code>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Partial Update Example</h4>
                    <div className="backdrop-blur-sm bg-gray-900/80 border border-white/20 rounded-xl p-4">
                      <code className="text-yellow-400 text-sm">
                        {`curl -X PUT "https://api.example.com/v2/users/usr_1234567890" \
  -H "Authorization: Bearer sk_live_..." \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Updated Name",
    "profile.preferences.theme": "dark",
    "status": "active"
  }'`}
                      </code>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div id="delete-user" className="scroll-mt-6">
              <div className="backdrop-blur-sm bg-white/10 border border-white/20 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-6">
                  <span className="px-3 py-1 bg-red-100/80 text-red-800 text-sm font-medium rounded-full backdrop-blur-sm">DELETE</span>
                  <h2 className="text-2xl font-bold text-gray-900">Delete User</h2>
                </div>
                
                <div className="backdrop-blur-sm bg-red-50/40 border border-red-200/40 rounded-xl p-6">
                  <h4 className="font-semibold text-red-900 mb-3">⚠️ Permanent Action</h4>
                  <p className="text-red-800 text-sm mb-4">
                    Deleting a user is permanent and cannot be undone. All associated data including 
                    orders, preferences, and activity logs will be permanently removed.
                  </p>
                  
                  <div className="space-y-4">
                    <div>
                      <h5 className="font-medium text-red-900 mb-2">Soft Delete (Recommended)</h5>
                      <div className="backdrop-blur-sm bg-gray-900/80 border border-white/20 rounded-lg p-3">
                        <code className="text-red-400 text-sm">
                          {`curl -X PUT "https://api.example.com/v2/users/usr_1234567890" \
  -H "Authorization: Bearer sk_live_..." \
  -d '{"status": "deleted"}'`}
                        </code>
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="font-medium text-red-900 mb-2">Hard Delete</h5>
                      <div className="backdrop-blur-sm bg-gray-900/80 border border-white/20 rounded-lg p-3">
                        <code className="text-red-400 text-sm">
                          {`curl -X DELETE "https://api.example.com/v2/users/usr_1234567890?permanent=true" \
  -H "Authorization: Bearer sk_live_..."`}
                        </code>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
        
      case "products":
        return (
          <div className="space-y-8">
            <div id="product-overview" className="scroll-mt-6">
              <div className="backdrop-blur-sm bg-white/10 border border-white/20 rounded-2xl p-8 shadow-lg">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">Product Management</h1>
                <p className="text-gray-700 text-lg mb-6">
                  Comprehensive product catalog management with support for variants, categories, 
                  inventory tracking, and advanced pricing models.
                </p>
              </div>
            </div>
          </div>
        );
        
      case "orders":
        return (
          <div className="space-y-8">
            <div id="order-flow" className="scroll-mt-6">
              <div className="backdrop-blur-sm bg-white/10 border border-white/20 rounded-2xl p-8 shadow-lg">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">Order Processing</h1>
                <p className="text-gray-700 text-lg mb-6">
                  End-to-end order management from cart creation to fulfillment with real-time tracking.
                </p>
              </div>
            </div>
          </div>
        );
        
      case "webhooks":
        return (
          <div className="space-y-8">
            <div id="webhook-overview" className="scroll-mt-6">
              <div className="backdrop-blur-sm bg-white/10 border border-white/20 rounded-2xl p-8 shadow-lg">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">Webhooks</h1>
                <p className="text-gray-700 text-lg mb-6">
                  Real-time event notifications to keep your systems in sync with automatic retry logic.
                </p>
              </div>
            </div>
          </div>
        );
        
      case "rate-limiting":
        return (
          <div className="space-y-8">
            <div id="rate-overview" className="scroll-mt-6">
              <div className="backdrop-blur-sm bg-white/10 border border-white/20 rounded-2xl p-8 shadow-lg">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">Rate Limiting</h1>
                <p className="text-gray-700 text-lg mb-6">
                  Intelligent rate limiting to ensure fair usage and optimal performance for all users.
                </p>
              </div>
            </div>
          </div>
        );
        
      case "errors":
        return (
          <div className="space-y-8">
            <div id="error-format" className="scroll-mt-6">
              <div className="backdrop-blur-sm bg-white/10 border border-white/20 rounded-2xl p-8 shadow-lg">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">Error Handling</h1>
                <p className="text-gray-700 text-lg mb-6">
                  Comprehensive error handling with detailed error codes and troubleshooting guides.
                </p>
              </div>
            </div>
          </div>
        );
        
      case "sdk":
        return (
          <div className="space-y-8">
            <div id="official-sdks" className="scroll-mt-6">
              <div className="backdrop-blur-sm bg-white/10 border border-white/20 rounded-2xl p-8 shadow-lg">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">SDKs & Libraries</h1>
                <p className="text-gray-700 text-lg mb-6">
                  Official SDKs and community libraries to integrate our API into your preferred programming language.
                </p>
              </div>
            </div>
          </div>
        );
        
      case "changelog":
        return (
          <div className="space-y-8">
            <div id="latest-changes" className="scroll-mt-6">
              <div className="backdrop-blur-sm bg-white/10 border border-white/20 rounded-2xl p-8 shadow-lg">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">Changelog</h1>
                <p className="text-gray-700 text-lg mb-6">
                  Stay updated with the latest API changes, new features, and improvements.
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="backdrop-blur-sm bg-white/10 border border-white/20 rounded-2xl p-8 shadow-lg text-center">
            <div className="max-w-2xl mx-auto">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400/20 to-purple-400/20 backdrop-blur-sm border border-white/20 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                <Star className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to {project.name || 'API'} Documentation</h2>
              <p className="text-gray-700 mb-6">Enterprise-grade REST API with comprehensive functionality for modern applications.</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="backdrop-blur-sm bg-white/30 border border-white/30 rounded-xl p-4">
                  <Shield className="w-6 h-6 text-green-600 mx-auto mb-2" />
                  <div className="font-semibold text-gray-900">Secure</div>
                  <div className="text-gray-600">Enterprise security</div>
                </div>
                <div className="backdrop-blur-sm bg-white/30 border border-white/30 rounded-xl p-4">
                  <Zap className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <div className="font-semibold text-gray-900">Fast</div>
                  <div className="text-gray-600">Sub-50ms response</div>
                </div>
                <div className="backdrop-blur-sm bg-white/30 border border-white/30 rounded-xl p-4">
                  <Code className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                  <div className="font-semibold text-gray-900">Developer-First</div>
                  <div className="text-gray-600">Great DX</div>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-6">Select a section from the left sidebar to explore the API.</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-[1800px] mx-auto flex">
        {/* Left Sidebar */}
        <div className="w-80 h-screen sticky top-0 backdrop-blur-md bg-white/30 border-r border-white/20 p-6 overflow-y-auto scrollbar-hide hover:scrollbar-show">
          <div className="mb-8">
            <h1 className="text-xl font-bold text-gray-900 mb-2">{project.name || "API Documentation"}</h1>
            <p className="text-sm text-gray-600">Comprehensive API reference</p>
          </div>

          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input 
                placeholder="Search documentation..." 
                className="pl-10 bg-white/50 border-white/30 rounded-xl backdrop-blur-sm focus:bg-white/70 focus:border-white/50"
              />
            </div>
          </div>

          <nav className="space-y-2">
            {[
              { id: "overview", title: "Overview", icon: Star },
              { id: "getting-started", title: "Getting Started", icon: Zap },
              { id: "authentication", title: "Authentication", icon: Shield },
              { id: "users", title: "User Management", icon: Code },
              { id: "products", title: "Product Management", icon: Star },
              { id: "orders", title: "Order Processing", icon: Clock },
              { id: "webhooks", title: "Webhooks", icon: ExternalLink },
              { id: "rate-limiting", title: "Rate Limiting", icon: Shield },
              { id: "errors", title: "Error Handling", icon: ExternalLink },
              { id: "sdk", title: "SDKs & Libraries", icon: Code },
              { id: "changelog", title: "Changelog", icon: Star }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => onSectionClick(item.id)}
                className={`w-full text-left px-4 py-3 rounded-xl backdrop-blur-sm border transition-all ${
                  activeSection === item.id
                    ? "bg-blue-100/60 border-blue-200/60 text-blue-900"
                    : "bg-white/20 border-white/30 text-gray-700 hover:bg-white/40"
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-4 h-4" />
                  <span className="font-medium">{item.title}</span>
                </div>
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex">
          <main className="flex-1 max-w-4xl p-8">
            {renderContent()}
          </main>

          {/* Right Sidebar */}
          {inThisPageSections.length > 0 && (
            <div className="w-80 h-screen sticky top-0 backdrop-blur-md bg-white/20 border-l border-white/20 p-6 overflow-y-auto scrollbar-hide hover:scrollbar-show">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">In This Page</h3>
                  <nav className="space-y-2">
                    {inThisPageSections.map((section) => (
                      <button
                        key={section.id}
                        onClick={() => {
                          const element = document.getElementById(section.id);
                          if (element) {
                            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          }
                        }}
                        className="block w-full text-left px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-white/30 rounded-lg transition-colors backdrop-blur-sm"
                      >
                        {section.title}
                      </button>
                    ))}
                  </nav>
                </div>

                <div className="backdrop-blur-sm bg-white/30 border border-white/30 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Quick Example</h4>
                  <div className="relative">
                    <div className="backdrop-blur-sm bg-gray-900/80 border border-white/20 rounded-lg p-3">
                      <code className="text-green-400 text-xs block">
                        curl -X GET \<br/>
                        "https://api.example.com/users" \<br/>
                        -H "Authorization: Bearer sk_..."
                      </code>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute top-2 right-2 h-6 w-6 p-0 backdrop-blur-sm bg-white/20 hover:bg-white/30"
                      onClick={() => copyToClipboard('curl -X GET "https://api.example.com/users" -H "Authorization: Bearer sk_..."', 'quick-example')}
                    >
                      {copiedCode === 'quick-example' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}