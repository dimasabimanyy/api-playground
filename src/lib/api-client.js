/**
 * Client-side API utilities for making secure requests to our API routes
 * This replaces direct database calls with API requests
 */

// Base API configuration
const API_BASE = "/api";

/**
 * Generic API request handler with error handling
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;

  const config = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  };

  if (config.body && typeof config.body !== "string") {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `API Error: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error(`API request failed: ${endpoint}`, error);
    throw error;
  }
}

/**
 * Collections API Client
 */
export const collectionsApi = {
  // Get all collections with optional search and pagination
  getAll: async (params = {}) => {
    const searchParams = new URLSearchParams();

    if (params.search) searchParams.set("search", params.search);
    if (params.page) searchParams.set("page", params.page.toString());
    if (params.pageSize)
      searchParams.set("pageSize", params.pageSize.toString());

    const endpoint = `/collections${
      searchParams.toString() ? `?${searchParams}` : ""
    }`;
    return apiRequest(endpoint);
  },

  // Get specific collection by ID
  getById: async (id) => {
    return apiRequest(`/collections/${id}`);
  },

  // Create new collection
  create: async (collectionData) => {
    return apiRequest("/collections", {
      method: "POST",
      body: collectionData,
    });
  },

  // Update existing collection
  update: async (id, updates) => {
    return apiRequest(`/collections/${id}`, {
      method: "PUT",
      body: updates,
    });
  },

  // Delete collection
  delete: async (id) => {
    return apiRequest(`/collections/${id}`, {
      method: "DELETE",
    });
  },

  // Search collections (alias for getAll with search)
  search: async (query, options = {}) => {
    return collectionsApi.getAll({
      search: query,
      ...options,
    });
  },

  // Get collections with pagination
  getPaginated: async (page = 1, pageSize = 10) => {
    return collectionsApi.getAll({ page, pageSize });
  },
};

/**
 * Docs Projects API Client
 */
export const docsProjectsApi = {
  getAll: async (params = {}) => {
    const searchParams = new URLSearchParams();

    if (params.page) searchParams.set("page", params.page.toString());
    if (params.pageSize)
      searchParams.set("pageSize", params.pageSize.toString());

    const endpoint = `/docs/projects${
      searchParams.toString() ? `?${searchParams}` : ""
    }`;

    return apiRequest(endpoint);
  },

  // Get specific docs project by ID
  getById: async (id) => {
    const searchParams = new URLSearchParams();

    if (id) {
      searchParams.set("id", id);
    }

    console.log("search params: ", searchParams.toString());
    return apiRequest(
      `/docs/projects${searchParams.toString() ? `?${searchParams}` : ""}`
    );
  },

  // Create new docs project
  create: async (projectData) => {
    return apiRequest("/docs/projects", {
      method: "POST",
      body: projectData,
    });
  },

  // Update existing docs project
  update: async (id, updates) => {
    return apiRequest(`/docs/projects/${id}`, {
      method: "PUT",
      body: updates,
    });
  },

  // Delete docs project
  delete: async (id) => {
    return apiRequest(`/docs/projects/${id}`, {
      method: "DELETE",
    });
  },
};

/**
 * Documentation Generation API Client
 */
export const docsGenerationApi = {
  // Generate documentation from collection
  generate: async (selectedCollection, customization, selectedTemplate) => {
    return apiRequest("/docs/generate", {
      method: "POST",
      body: {
        selectedCollection,
        customization,
        selectedTemplate,
      },
    });
  },
};

/**
 * Helper functions for common operations
 */
export const apiHelpers = {
  // Handle API errors with user-friendly messages
  handleApiError: (error) => {
    if (error.message.includes("Authentication required")) {
      return "Please log in to continue";
    }
    if (error.message.includes("not found")) {
      return "The requested item was not found";
    }
    if (error.message.includes("Failed to")) {
      return "Operation failed. Please try again";
    }
    return error.message || "An unexpected error occurred";
  },

  // Convert API response to format expected by existing code
  formatCollectionsResponse: (apiResponse) => {
    const { collections } = apiResponse;
    const formattedCollections = {};

    collections?.forEach((collection) => {
      formattedCollections[collection.id] = collection;
    });

    return formattedCollections;
  },

  // Format single collection response
  formatCollectionResponse: (apiResponse) => {
    return apiResponse.collection;
  },

  // Format docs projects response
  formatDocsProjectsResponse: (apiResponse) => {
    const { projects } = apiResponse;
    const formattedProjects = {};

    projects?.forEach((project) => {
      formattedProjects[project.id] = project;
    });

    return formattedProjects;
  },
};

// Export default API client
export default {
  collections: collectionsApi,
  docsProjects: docsProjectsApi,
  docsGeneration: docsGenerationApi,
  helpers: apiHelpers,
};
