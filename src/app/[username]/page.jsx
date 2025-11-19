"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  BookOpen,
  ExternalLink,
  Calendar,
  FileText,
  Globe,
  Search,
  Users,
  Star,
  Code,
  ArrowRight,
  Home,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DocsProjects } from "@/lib/docs-storage";
import { generateProjectSlug } from "@/lib/user-utils";

export default function UserProfilePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { username } = params;
  
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [notFound, setNotFound] = useState(false);
  const isSubdomain = searchParams.get('subdomain') === 'true';

  useEffect(() => {
    if (username) {
      loadUserProjects();
    }
  }, [username]);

  const loadUserProjects = async () => {
    try {
      // In a real app, you'd fetch projects by username from your database
      // For now, we'll simulate this by getting all projects
      const allProjects = DocsProjects.getAll();
      const userProjects = Object.values(allProjects);
      
      // If no projects found, show not found state
      if (userProjects.length === 0) {
        setNotFound(true);
      } else {
        setProjects(userProjects);
      }
    } catch (error) {
      console.error("Failed to load user projects:", error);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter(project => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      project.name.toLowerCase().includes(query) ||
      project.description?.toLowerCase().includes(query)
    );
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4 border-gray-300"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-gray-400" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            User Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            The user <strong>@{username}</strong> doesn't exist or has no public documentation.
          </p>
          <Button variant="outline" asChild>
            <Link href="/">
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center">
                <span className="text-xl font-bold text-white">
                  {username.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">@{username}</h1>
                <p className="text-gray-600">Public Documentation</p>
              </div>
            </div>
            
            {!isSubdomain && (
              <Button variant="outline" size="sm" asChild>
                <Link href="/">
                  <Globe className="w-4 h-4 mr-2" />
                  API Playground
                </Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{projects.length}</div>
                <div className="text-sm text-gray-600">Documentation{projects.length !== 1 ? 's' : ''}</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Code className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {projects.reduce((acc, project) => acc + (project.collections?.length || 0), 0)}
                </div>
                <div className="text-sm text-gray-600">API Collections</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Star className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {projects.length > 0 ? formatDate(projects.sort((a, b) => new Date(b.updated) - new Date(a.updated))[0].updated) : 'N/A'}
                </div>
                <div className="text-sm text-gray-600">Last Updated</div>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search documentation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Projects */}
        {filteredProjects.length === 0 && searchQuery ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No documentation found
            </h3>
            <p className="text-gray-600">
              Try adjusting your search terms.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => {
              const projectSlug = generateProjectSlug(project.name);
              const projectUrl = isSubdomain 
                ? `/${projectSlug}` 
                : `/${username}/${projectSlug}`;
              
              return (
                <Link
                  key={project.id}
                  href={projectUrl}
                  className="group bg-white rounded-xl border border-gray-200 p-6 hover:border-gray-300 hover:shadow-lg transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                      <FileText className="w-5 h-5 text-gray-600" />
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                  </div>
                  
                  <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {project.name}
                  </h3>
                  
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {project.description || "No description provided"}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3 h-3" />
                      {formatDate(project.updated)}
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Live</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {projects.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No documentation yet
            </h3>
            <p className="text-gray-600">
              @{username} hasn't published any documentation yet.
            </p>
          </div>
        )}
      </div>
      
      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-8 mt-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center text-sm text-gray-600">
            <p>
              Documentation by <strong>@{username}</strong> • Generated with API Playground
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}