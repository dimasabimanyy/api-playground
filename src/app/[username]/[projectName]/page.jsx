"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { FileText, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getTemplate, getDefaultTemplate, validateTemplateSettings } from "@/components/docs/templates/TemplateRegistry";

export default function PublicUserDocPage() {
  const params = useParams();
  const { username, projectName: slug } = params;
  
  const [project, setProject] = useState(null);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSection, setActiveSection] = useState("");
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (username && slug) {
      loadProjectByUsernameAndSlug();
    }
  }, [username, slug]);

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

  const loadProjectByUsernameAndSlug = async () => {
    try {
      const response = await fetch(`/api/public/${username}/${slug}`);
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 404) {
          setNotFound(true);
          setLoading(false);
          return;
        }
        throw new Error(data.error || 'Failed to load project');
      }

      const { project: foundProject } = data;

      // Set default template if none specified
      if (!foundProject.template) {
        foundProject.template = "minimalist";
      }

      setProject(foundProject);

      // Extract collections from project data
      if (foundProject.collections) {
        setCollections([foundProject.collections]);
      } else {
        // Mock collections data for demo if no collections found
        const mockCollections = [
          {
            id: "auth",
            name: "Authentication",
            description: "User authentication and authorization endpoints",
            requests: [
              {
                id: "login",
                name: "User Login",
                description: "Authenticate user with email and password to receive access tokens",
                method: "POST",
                url: "/auth/login",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: "user@example.com", password: "password123" }, null, 2)
              },
              {
                id: "register",
                name: "User Registration", 
                description: "Create a new user account with email verification",
                method: "POST",
                url: "/auth/register",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: "user@example.com", password: "password123", name: "John Doe" }, null, 2)
              },
              {
                id: "refresh",
                name: "Refresh Token",
                description: "Refresh the authentication token to extend session",
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
            description: "Complete CRUD operations for user management and profile updates",
            requests: [
              {
                id: "get-users",
                name: "Get All Users",
                description: "Retrieve a paginated list of all users with optional filtering",
                method: "GET",
                url: "/users",
                headers: { "Authorization": "Bearer {token}" }
              },
              {
                id: "get-user",
                name: "Get User by ID",
                description: "Retrieve detailed information for a specific user",
                method: "GET",
                url: "/users/{id}",
                headers: { "Authorization": "Bearer {token}" }
              },
              {
                id: "update-user",
                name: "Update User",
                description: "Update user profile information and settings",
                method: "PUT",
                url: "/users/{id}",
                headers: { 
                  "Authorization": "Bearer {token}",
                  "Content-Type": "application/json"
                },
                body: JSON.stringify({ name: "Updated Name", email: "updated@example.com", preferences: { theme: "dark" } }, null, 2)
              },
              {
                id: "delete-user",
                name: "Delete User",
                description: "Permanently delete a user account and all associated data",
                method: "DELETE",
                url: "/users/{id}",
                headers: { "Authorization": "Bearer {token}" }
              }
            ]
          },
          {
            id: "products",
            name: "Product Management",
            description: "Comprehensive product catalog and inventory management system",
            requests: [
              {
                id: "get-products",
                name: "List Products",
                description: "Get a paginated list of all products with advanced filtering and sorting options",
                method: "GET",
                url: "/products",
                headers: {},
                body: ""
              },
              {
                id: "create-product",
                name: "Create Product",
                description: "Add a new product to the catalog with detailed specifications",
                method: "POST",
                url: "/products",
                headers: {
                  "Authorization": "Bearer {token}",
                  "Content-Type": "application/json"
                },
                body: JSON.stringify({
                  name: "Premium Wireless Headphones",
                  description: "High-quality noise-canceling headphones with premium sound",
                  price: 299.99,
                  category: "electronics",
                  specifications: {
                    battery_life: "30 hours",
                    connectivity: ["Bluetooth 5.0", "3.5mm jack"],
                    features: ["Active Noise Cancellation", "Touch Controls"]
                  },
                  tags: ["premium", "wireless", "audio"]
                }, null, 2)
              },
              {
                id: "update-product",
                name: "Update Product",
                description: "Update product information including pricing and availability",
                method: "PUT",
                url: "/products/{id}",
                headers: {
                  "Authorization": "Bearer {token}",
                  "Content-Type": "application/json"
                },
                body: JSON.stringify({
                  name: "Premium Wireless Headphones V2",
                  price: 279.99,
                  in_stock: true
                }, null, 2)
              }
            ]
          }
        ];

        setCollections(mockCollections);
      }
      
    } catch (error) {
      console.error("Failed to load project:", error);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
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
            The documentation for <strong>{username}/{slug}</strong> doesn't exist or has been removed.
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

  // Get the appropriate template
  const templateKey = project.settings?.template || project.template || 'minimalist';
  const template = getTemplate(templateKey);
  const TemplateComponent = template.component;

  // Validate and merge template settings
  const templateSettings = validateTemplateSettings(templateKey, project.settings);

  return (
    <TemplateComponent
      project={{ ...project, settings: templateSettings }}
      collections={collections}
      searchQuery={searchQuery}
      activeSection={activeSection}
      onSectionClick={handleSectionClick}
      username={username}
    />
  );
}