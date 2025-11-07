/**
 * Enhanced Documentation Generator
 * 
 * Generates comprehensive API documentation using the enhanced data structure
 * with support for customization, real data integration, and multiple output formats.
 */

import { DocsProjects, DocsMetadata } from './docs-storage';
import { DocsUtils } from './docs-schema';

/**
 * Main Documentation Generator
 */
export class DocsGenerator {
  constructor(projectId) {
    this.projectId = projectId;
    this.project = null;
    this.collections = [];
    this.errors = [];
  }

  /**
   * Initialize the generator with project data
   */
  async init() {
    try {
      // Load project
      this.project = DocsProjects.get(this.projectId);
      if (!this.project) {
        throw new Error(`Project not found: ${this.projectId}`);
      }

      // Load and enhance collections
      this.collections = await this.loadCollections();
      
      return { success: true };
    } catch (error) {
      this.errors.push(error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Load collections with enhanced metadata
   */
  async loadCollections() {
    // In a real implementation, this would fetch from your collections context/API
    // For now, we'll use a placeholder that integrates with existing data
    
    const collections = [];
    
    for (const collectionId of this.project.collections) {
      try {
        // Get base collection data (from your existing collections context)
        const baseCollection = await this.getBaseCollection(collectionId);
        if (!baseCollection) continue;
        
        // Enhance with docs metadata
        const enhancedCollection = DocsMetadata.enhanceCollection(baseCollection);
        collections.push(enhancedCollection);
        
      } catch (error) {
        this.errors.push(`Failed to load collection ${collectionId}: ${error.message}`);
      }
    }
    
    return collections;
  }

  /**
   * Get base collection data (placeholder - replace with actual data source)
   */
  async getBaseCollection(collectionId) {
    // TODO: Integrate with your actual collections context
    // For now, return null to indicate we need to connect to real data
    return null;
  }

  /**
   * Generate complete documentation data
   */
  generate() {
    if (!this.project) {
      throw new Error('Generator not initialized. Call init() first.');
    }

    const docData = {
      // Project metadata
      project: this.project,
      
      // Enhanced collections with docs metadata
      collections: this.collections,
      
      // Generated metadata
      meta: {
        generatedAt: new Date().toISOString(),
        generator: 'API Playground Enhanced Docs',
        version: this.project.version,
        totalEndpoints: this.getTotalEndpoints(),
        totalCollections: this.collections.length,
        errors: this.errors,
      },
      
      // Customization from project settings
      customization: {
        title: this.project.name,
        description: this.project.description,
        baseUrl: this.getProjectBaseUrl(),
        theme: this.project.settings.theme,
        organization: this.project.settings.organization,
        ...this.project.settings,
      },
      
      // Navigation structure
      navigation: this.generateNavigation(),
      
      // Search index for client-side search
      searchIndex: this.generateSearchIndex(),
    };

    return docData;
  }

  /**
   * Get total number of endpoints across all collections
   */
  getTotalEndpoints() {
    return this.collections.reduce((total, collection) => {
      return total + (collection.requests?.length || 0);
    }, 0);
  }

  /**
   * Get project base URL from settings or collections
   */
  getProjectBaseUrl() {
    // Try project settings first
    if (this.project.settings?.baseUrl) {
      return this.project.settings.baseUrl;
    }
    
    // Try collection docs
    for (const collection of this.collections) {
      if (collection.docs?.baseUrl) {
        return collection.docs.baseUrl;
      }
    }
    
    return 'https://api.example.com';
  }

  /**
   * Generate navigation structure
   */
  generateNavigation() {
    const navigation = [];
    
    // Add custom pages first
    if (this.project.customPages) {
      this.project.customPages
        .filter(page => page.showInNavigation)
        .sort((a, b) => a.order - b.order)
        .forEach(page => {
          navigation.push({
            type: 'page',
            id: page.id,
            title: page.title,
            slug: page.slug,
            order: page.order,
          });
        });
    }
    
    // Add collections
    this.collections.forEach((collection, index) => {
      const collectionNav = {
        type: 'collection',
        id: collection.id,
        title: collection.docs?.title || collection.name,
        order: 100 + index, // Place after custom pages
        children: [],
      };
      
      // Add requests as children
      if (collection.requests) {
        collection.requests.forEach((request, requestIndex) => {
          collectionNav.children.push({
            type: 'request',
            id: request.id,
            title: request.docs?.title || request.name,
            method: request.method,
            path: request.url,
            order: requestIndex,
          });
        });
      }
      
      navigation.push(collectionNav);
    });
    
    // Sort by order
    navigation.sort((a, b) => a.order - b.order);
    
    return navigation;
  }

  /**
   * Generate search index for client-side search
   */
  generateSearchIndex() {
    const index = [];
    
    // Index collections
    this.collections.forEach(collection => {
      index.push({
        type: 'collection',
        id: collection.id,
        title: collection.docs?.title || collection.name,
        description: collection.docs?.description || collection.description,
        tags: collection.docs?.tags || [],
        content: [
          collection.docs?.title || collection.name,
          collection.docs?.description || collection.description,
          collection.docs?.overview || '',
          ...(collection.docs?.tags || []),
        ].join(' ').toLowerCase(),
      });
      
      // Index requests
      if (collection.requests) {
        collection.requests.forEach(request => {
          index.push({
            type: 'request',
            id: request.id,
            collectionId: collection.id,
            title: request.docs?.title || request.name,
            method: request.method,
            path: request.url,
            description: request.docs?.description || request.docs?.summary || '',
            tags: request.docs?.tags || [],
            content: [
              request.docs?.title || request.name,
              request.method,
              request.url,
              request.docs?.description || '',
              request.docs?.summary || '',
              ...(request.docs?.tags || []),
            ].join(' ').toLowerCase(),
          });
        });
      }
    });
    
    return index;
  }

  /**
   * Export documentation in various formats
   */
  export(format = 'json') {
    const docData = this.generate();
    
    switch (format) {
      case 'json':
        return this.exportJSON(docData);
      case 'html':
        return this.exportHTML(docData);
      case 'openapi':
        return this.exportOpenAPI(docData);
      case 'postman':
        return this.exportPostman(docData);
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  /**
   * Export as JSON
   */
  exportJSON(docData) {
    return {
      format: 'json',
      filename: `${this.project.name.toLowerCase().replace(/\s+/g, '-')}-docs.json`,
      data: docData,
      mimeType: 'application/json',
    };
  }

  /**
   * Export as HTML
   */
  exportHTML(docData) {
    // Generate standalone HTML file
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${docData.customization.title}</title>
    <style>
        /* Inline CSS for standalone HTML */
        body { 
            font-family: system-ui, sans-serif; 
            line-height: 1.6; 
            margin: 0; 
            padding: 20px;
            background: ${docData.customization.theme?.primaryColor === '#171717' ? '#000' : '#fff'};
            color: ${docData.customization.theme?.primaryColor === '#171717' ? '#fff' : '#000'};
        }
        .container { max-width: 1200px; margin: 0 auto; }
        .method { 
            padding: 4px 12px; 
            border-radius: 6px; 
            font-weight: bold; 
            color: white; 
            display: inline-block;
            margin-right: 12px;
        }
        .method.get { background: #10b981; }
        .method.post { background: #3b82f6; }
        .method.put { background: #f59e0b; }
        .method.delete { background: #ef4444; }
        .method.patch { background: #8b5cf6; }
        .endpoint { 
            margin: 24px 0; 
            padding: 24px; 
            border: 1px solid ${docData.customization.theme?.primaryColor === '#171717' ? '#333' : '#e5e7eb'}; 
            border-radius: 12px; 
        }
        code { 
            background: ${docData.customization.theme?.primaryColor === '#171717' ? '#111' : '#f3f4f6'}; 
            padding: 2px 6px; 
            border-radius: 4px; 
            font-family: 'SF Mono', Monaco, monospace;
        }
        .description { margin: 12px 0; opacity: 0.8; }
        h1, h2, h3 { margin-top: 0; }
        .toc { margin-bottom: 40px; }
        .toc ul { list-style: none; padding-left: 0; }
        .toc ul ul { padding-left: 20px; }
        .toc a { text-decoration: none; color: inherit; opacity: 0.8; }
        .toc a:hover { opacity: 1; }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>${docData.customization.title}</h1>
            <p>${docData.customization.description}</p>
            ${docData.customization.baseUrl ? `<p><strong>Base URL:</strong> <code>${docData.customization.baseUrl}</code></p>` : ''}
        </header>
        
        ${docData.customization.organization?.showToc ? `
        <nav class="toc">
            <h2>Table of Contents</h2>
            <ul>
                ${docData.navigation.map(item => `
                    <li><a href="#${item.id}">${item.title}</a>
                        ${item.children ? `<ul>${item.children.map(child => `
                            <li><a href="#${child.id}"><span class="method ${child.method?.toLowerCase()}">${child.method}</span>${child.title}</a></li>
                        `).join('')}</ul>` : ''}
                    </li>
                `).join('')}
            </ul>
        </nav>
        ` : ''}
        
        <main>
            ${docData.collections.map(collection => `
                <section id="${collection.id}">
                    <h2>${collection.docs?.title || collection.name}</h2>
                    ${collection.docs?.description ? `<p class="description">${collection.docs.description}</p>` : ''}
                    
                    ${collection.requests?.map(request => `
                        <div class="endpoint" id="${request.id}">
                            <h3>
                                <span class="method ${request.method.toLowerCase()}">${request.method}</span>
                                ${request.docs?.title || request.name}
                            </h3>
                            <code>${request.url}</code>
                            ${request.docs?.description ? `<p class="description">${request.docs.description}</p>` : ''}
                        </div>
                    `).join('') || ''}
                </section>
            `).join('')}
        </main>
        
        <footer style="margin-top: 60px; padding-top: 20px; border-top: 1px solid ${docData.customization.theme?.primaryColor === '#171717' ? '#333' : '#e5e7eb'}; text-align: center; opacity: 0.6;">
            <p>Generated with API Playground • ${new Date().toLocaleDateString()}</p>
        </footer>
    </div>
</body>
</html>`;
    
    return {
      format: 'html',
      filename: `${this.project.name.toLowerCase().replace(/\s+/g, '-')}-docs.html`,
      data: html,
      mimeType: 'text/html',
    };
  }

  /**
   * Export as OpenAPI specification
   */
  exportOpenAPI(docData) {
    const openapi = {
      openapi: '3.0.0',
      info: {
        title: docData.customization.title,
        description: docData.customization.description,
        version: docData.project.version || '1.0.0',
      },
      servers: [
        {
          url: docData.customization.baseUrl,
          description: 'Production server'
        }
      ],
      paths: {},
      components: {
        schemas: {},
        securitySchemes: {},
      }
    };
    
    // Convert collections and requests to OpenAPI paths
    docData.collections.forEach(collection => {
      if (collection.requests) {
        collection.requests.forEach(request => {
          const path = request.url.replace(/{([^}]+)}/g, '{$1}'); // Ensure OpenAPI format
          const method = request.method.toLowerCase();
          
          if (!openapi.paths[path]) {
            openapi.paths[path] = {};
          }
          
          openapi.paths[path][method] = {
            summary: request.docs?.summary || request.docs?.title || request.name,
            description: request.docs?.description || '',
            operationId: request.docs?.operationId || `${method}${path.replace(/[^a-zA-Z0-9]/g, '')}`,
            tags: [collection.docs?.title || collection.name],
            responses: {
              '200': {
                description: 'Successful response',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object'
                    }
                  }
                }
              }
            }
          };
          
          // Add parameters if documented
          if (request.docs?.parameters) {
            const parameters = [];
            Object.values(request.docs.parameters).flat().forEach(param => {
              parameters.push({
                name: param.name,
                in: param.in,
                description: param.description,
                required: param.required,
                schema: param.schema,
              });
            });
            if (parameters.length > 0) {
              openapi.paths[path][method].parameters = parameters;
            }
          }
          
          // Add request body if documented
          if (request.docs?.requestBody && ['post', 'put', 'patch'].includes(method)) {
            openapi.paths[path][method].requestBody = {
              description: request.docs.requestBody.description,
              required: request.docs.requestBody.required,
              content: {
                [request.docs.requestBody.contentType]: {
                  schema: request.docs.requestBody.schema || { type: 'object' }
                }
              }
            };
          }
        });
      }
    });
    
    return {
      format: 'openapi',
      filename: `${this.project.name.toLowerCase().replace(/\s+/g, '-')}-openapi.json`,
      data: openapi,
      mimeType: 'application/json',
    };
  }

  /**
   * Export as Postman collection
   */
  exportPostman(docData) {
    const postmanCollection = {
      info: {
        name: docData.customization.title,
        description: docData.customization.description,
        schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
      },
      variable: [
        {
          key: 'baseUrl',
          value: docData.customization.baseUrl,
          type: 'string'
        }
      ],
      item: []
    };
    
    // Convert collections to Postman folders
    docData.collections.forEach(collection => {
      const folder = {
        name: collection.docs?.title || collection.name,
        description: collection.docs?.description || '',
        item: []
      };
      
      if (collection.requests) {
        collection.requests.forEach(request => {
          folder.item.push({
            name: request.docs?.title || request.name,
            request: {
              method: request.method,
              header: Object.entries(request.headers || {}).map(([key, value]) => ({
                key,
                value,
                type: 'text'
              })),
              url: {
                raw: `{{baseUrl}}${request.url}`,
                host: ['{{baseUrl}}'],
                path: request.url.split('/').filter(Boolean)
              },
              body: request.body ? {
                mode: 'raw',
                raw: request.body,
                options: {
                  raw: {
                    language: 'json'
                  }
                }
              } : undefined,
              description: request.docs?.description || ''
            }
          });
        });
      }
      
      postmanCollection.item.push(folder);
    });
    
    return {
      format: 'postman',
      filename: `${this.project.name.toLowerCase().replace(/\s+/g, '-')}-postman.json`,
      data: postmanCollection,
      mimeType: 'application/json',
    };
  }
}

/**
 * Utility functions for docs generation
 */
export const DocsGeneratorUtils = {
  /**
   * Create a new documentation project from collections
   */
  createFromCollections: (collections, projectName, description = '') => {
    const collectionIds = Object.keys(collections);
    const project = DocsProjects.create(projectName, description, collectionIds);
    
    // Enhance all collections with docs metadata
    Object.values(collections).forEach(collection => {
      DocsMetadata.enhanceCollection(collection);
      
      // Enhance requests
      if (collection.requests) {
        collection.requests.forEach(request => {
          DocsMetadata.enhanceRequest(request);
        });
      }
    });
    
    return project;
  },

  /**
   * Quick generate documentation without creating a project
   */
  quickGenerate: (collections, options = {}) => {
    const mockProject = {
      id: 'temp',
      name: options.title || 'API Documentation',
      description: options.description || '',
      version: '1.0.0',
      collections: Object.keys(collections),
      settings: {
        theme: { name: options.theme || 'modern' },
        organization: {
          groupBy: 'collection',
          showToc: true,
          showSearch: true,
          showTryItOut: true,
          showCodeExamples: true,
        },
        ...options.settings,
      },
    };
    
    // Create a temporary generator
    const generator = new DocsGenerator('temp');
    generator.project = mockProject;
    generator.collections = Object.values(collections).map(collection => 
      DocsMetadata.enhanceCollection(collection)
    );
    
    return generator.generate();
  },

  /**
   * Validate collections for documentation generation
   */
  validateCollections: (collections) => {
    const errors = [];
    const warnings = [];
    
    Object.entries(collections).forEach(([id, collection]) => {
      if (!collection.name) {
        errors.push(`Collection ${id} is missing a name`);
      }
      
      if (!collection.requests || collection.requests.length === 0) {
        warnings.push(`Collection ${collection.name} has no requests`);
      }
      
      if (collection.requests) {
        collection.requests.forEach(request => {
          if (!request.name) {
            errors.push(`Request in collection ${collection.name} is missing a name`);
          }
          
          if (!request.url) {
            errors.push(`Request ${request.name} is missing a URL`);
          }
          
          if (!request.method) {
            errors.push(`Request ${request.name} is missing a method`);
          }
        });
      }
    });
    
    return { errors, warnings, isValid: errors.length === 0 };
  },
};

export default {
  DocsGenerator,
  DocsGeneratorUtils,
};