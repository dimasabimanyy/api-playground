/**
 * Enhanced Data Structure for Customizable API Documentation
 * 
 * This schema extends the basic request/collection structure to support
 * comprehensive documentation with custom descriptions, examples, and metadata.
 */

// Base documentation metadata that can be applied to any entity
export const DocsMetadataSchema = {
  id: '', // unique identifier
  title: '', // display name
  description: '', // rich text description (supports markdown)
  summary: '', // short one-line summary
  tags: [], // array of strings for categorization
  customFields: {}, // extensible custom metadata
  visibility: 'public', // 'public', 'internal', 'private'
  deprecated: false,
  version: '1.0.0',
  lastModified: null, // timestamp
  author: '', // who created/last modified this
}

// Enhanced Collection Structure
export const DocsCollectionSchema = {
  // Base collection data (existing)
  id: '',
  name: '',
  description: '',
  color: '',
  
  // Enhanced documentation metadata
  docs: {
    ...DocsMetadataSchema,
    // Collection-specific fields
    overview: '', // markdown content for collection overview
    authentication: {
      type: 'none', // 'none', 'bearer', 'apikey', 'oauth', 'basic'
      description: '',
      example: '',
      required: false,
    },
    baseUrl: '',
    rateLimiting: {
      enabled: false,
      description: '',
      limits: {}, // e.g., { requests: 1000, period: 'hour' }
    },
    contact: {
      name: '',
      email: '',
      url: '',
    },
    license: {
      name: '',
      url: '',
    },
    externalDocs: {
      description: '',
      url: '',
    },
    customSections: [], // array of custom documentation sections
  },
  
  // Enhanced request metadata
  requests: [], // array of DocsRequestSchema
}

// Enhanced Request Structure
export const DocsRequestSchema = {
  // Base request data (existing)
  id: '',
  name: '',
  method: '',
  url: '',
  headers: {},
  body: '',
  
  // Enhanced documentation metadata
  docs: {
    ...DocsMetadataSchema,
    // Request-specific fields
    summary: '', // brief description
    description: '', // detailed markdown description
    operationId: '', // unique operation identifier
    
    // Parameters documentation
    parameters: {
      path: [], // path parameters
      query: [], // query parameters
      header: [], // header parameters
      cookie: [], // cookie parameters
    },
    
    // Request body documentation
    requestBody: {
      description: '',
      required: false,
      contentType: 'application/json',
      schema: {}, // JSON schema for request body
      examples: {}, // named examples
    },
    
    // Response documentation
    responses: {
      // Key is status code (200, 400, etc.)
      '200': {
        description: '',
        contentType: 'application/json',
        schema: {}, // JSON schema for response
        examples: {}, // named examples
        headers: {}, // response headers
      },
      'default': {
        description: 'Unexpected error',
        contentType: 'application/json',
        schema: {},
        examples: {},
      }
    },
    
    // Code examples
    examples: {
      curl: '', // auto-generated
      javascript: '',
      python: '',
      php: '',
      custom: {}, // custom language examples
    },
    
    // Additional metadata
    security: [], // security requirements
    servers: [], // server-specific overrides
    externalDocs: {
      description: '',
      url: '',
    },
    
    // Testing metadata
    testCases: [], // predefined test cases
    mockResponses: [], // mock response data for testing
  }
}

// Parameter schema for detailed parameter documentation
export const DocsParameterSchema = {
  name: '',
  in: 'query', // 'query', 'path', 'header', 'cookie'
  description: '',
  required: false,
  deprecated: false,
  allowEmptyValue: false,
  style: 'simple', // parameter serialization style
  explode: false,
  schema: {
    type: 'string', // 'string', 'number', 'integer', 'boolean', 'array', 'object'
    format: '', // 'date', 'date-time', 'email', 'uri', etc.
    enum: [], // possible values
    default: '', // default value
    example: '', // example value
    minimum: null,
    maximum: null,
    minLength: null,
    maxLength: null,
    pattern: '', // regex pattern
  },
  examples: {}, // named examples
}

// Enhanced Documentation Project Structure
export const DocsProjectSchema = {
  id: '',
  name: '',
  description: '',
  version: '1.0.0',
  
  // Project-level documentation settings
  settings: {
    // Appearance
    theme: {
      name: 'modern', // 'modern', 'minimal', 'classic'
      primaryColor: '#171717',
      accentColor: '#3b82f6',
      fontFamily: 'system-ui',
      customCSS: '',
      logo: {
        url: '',
        altText: '',
        width: 120,
        height: 40,
      },
    },
    
    // Content organization
    organization: {
      groupBy: 'collection', // 'collection', 'tag', 'none'
      sortBy: 'name', // 'name', 'method', 'path', 'created'
      showToc: true, // table of contents
      showSearch: true,
      showTryItOut: true,
      showCodeExamples: true,
      defaultLanguage: 'curl',
    },
    
    // Publishing settings
    publishing: {
      isPublic: false,
      allowIndexing: false,
      customDomain: '',
      password: '', // optional password protection
      allowedDomains: [], // CORS domains for Try It Out
    },
    
    // Export settings
    export: {
      formats: ['html', 'pdf', 'openapi', 'postman'],
      includeExamples: true,
      includeSchemas: true,
      bundleAssets: true,
    },
  },
  
  // Collections in this documentation project
  collections: [], // array of collection IDs
  
  // Custom pages/sections
  customPages: [
    {
      id: '',
      title: '',
      content: '', // markdown content
      order: 0,
      showInNavigation: true,
      slug: '', // URL slug
    }
  ],
  
  // Metadata
  created: null,
  updated: null,
  lastPublished: null,
  author: '',
  collaborators: [],
}

// Utility functions for working with the enhanced schema
export const DocsUtils = {
  /**
   * Create a new docs project with default structure
   */
  createProject: (name, description = '') => ({
    ...DocsProjectSchema,
    id: generateId(),
    name,
    description,
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
  }),
  
  /**
   * Enhance an existing collection with docs metadata
   */
  enhanceCollection: (collection) => ({
    ...collection,
    docs: {
      ...DocsMetadataSchema,
      id: collection.id,
      title: collection.name,
      description: collection.description || '',
      lastModified: new Date().toISOString(),
    }
  }),
  
  /**
   * Enhance an existing request with docs metadata
   */
  enhanceRequest: (request) => ({
    ...request,
    docs: {
      ...DocsMetadataSchema,
      id: request.id,
      title: request.name,
      summary: `${request.method} ${request.url}`,
      lastModified: new Date().toISOString(),
      parameters: {
        path: [],
        query: [],
        header: [],
        cookie: [],
      },
      requestBody: {
        description: '',
        required: request.method !== 'GET',
        contentType: 'application/json',
        schema: {},
        examples: {},
      },
      responses: {
        '200': {
          description: 'Successful response',
          contentType: 'application/json',
          schema: {},
          examples: {},
        }
      },
      examples: {
        curl: generateCurlExample(request),
      }
    }
  }),
  
  /**
   * Extract parameters from URL path
   */
  extractPathParameters: (url) => {
    const pathParams = [];
    const matches = url.match(/\{([^}]+)\}/g) || [];
    matches.forEach(match => {
      const paramName = match.slice(1, -1);
      pathParams.push({
        ...DocsParameterSchema,
        name: paramName,
        in: 'path',
        required: true,
        description: `The ${paramName} parameter`,
      });
    });
    return pathParams;
  },
  
  /**
   * Generate OpenAPI schema from docs structure
   */
  toOpenAPI: (project, collections) => {
    // Implementation for OpenAPI export
    return {
      openapi: '3.0.0',
      info: {
        title: project.name,
        description: project.description,
        version: project.version,
      },
      paths: {}, // Generated from collections
    };
  },
  
  /**
   * Validate docs structure
   */
  validate: (docsData) => {
    const errors = [];
    // Add validation logic
    return { isValid: errors.length === 0, errors };
  }
}

// Helper function to generate unique IDs
function generateId() {
  return `docs_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// Helper function to generate curl examples
function generateCurlExample(request) {
  let curl = `curl -X ${request.method} "${request.url}"`;
  
  if (request.headers && Object.keys(request.headers).length > 0) {
    Object.entries(request.headers).forEach(([key, value]) => {
      curl += ` \\\n  -H "${key}: ${value}"`;
    });
  }
  
  if (request.method !== 'GET' && request.body) {
    curl += ` \\\n  -d '${request.body}'`;
  }
  
  return curl;
}

export default {
  DocsMetadataSchema,
  DocsCollectionSchema,
  DocsRequestSchema,
  DocsParameterSchema,
  DocsProjectSchema,
  DocsUtils,
};