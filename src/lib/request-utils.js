/**
 * Utility functions for request processing and naming
 */

/**
 * Generate a meaningful name for a request based on method and URL
 * @param {string} method - HTTP method (GET, POST, etc.)
 * @param {string} url - Request URL
 * @returns {string} Generated request name
 */
export function generateRequestName(method, url) {
  if (!url || !url.trim()) {
    return 'Untitled Request';
  }

  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const searchParams = urlObj.searchParams;
    
    // Remove trailing slash
    const cleanPath = pathname.replace(/\/$/, '') || '/';
    
    // Extract meaningful parts of the path
    const pathParts = cleanPath.split('/').filter(part => part.length > 0);
    
    // Generate name based on common patterns
    let generatedName = '';
    
    if (pathParts.length === 0) {
      // Root path
      generatedName = `${method} Root`;
    } else if (pathParts.length === 1) {
      // Single resource: GET /users -> "Get Users"
      const resource = capitalize(pathParts[0]);
      generatedName = `${capitalizeMethod(method)} ${resource}`;
    } else if (pathParts.length === 2) {
      // Resource with ID or action: GET /users/123 -> "Get User", POST /users/create -> "Create User"
      const resource = pathParts[0];
      const identifier = pathParts[1];
      
      if (isId(identifier)) {
        // GET /users/123 -> "Get User"
        generatedName = `${capitalizeMethod(method)} ${singularize(capitalize(resource))}`;
      } else {
        // POST /users/create -> "Create User"
        const action = capitalizeMethod(identifier);
        generatedName = `${action} ${capitalize(resource)}`;
      }
    } else {
      // Complex path: use last meaningful parts
      const lastTwo = pathParts.slice(-2);
      if (isId(lastTwo[1])) {
        // GET /api/v1/users/123 -> "Get User"
        generatedName = `${capitalizeMethod(method)} ${singularize(capitalize(lastTwo[0]))}`;
      } else {
        // GET /api/users/profile -> "Get Profile"
        generatedName = `${capitalizeMethod(method)} ${capitalize(lastTwo[1])}`;
      }
    }
    
    // Add query parameter info if relevant
    if (searchParams.size > 0) {
      const importantParams = ['search', 'q', 'query', 'filter', 'page', 'limit'];
      const foundParams = importantParams.filter(param => searchParams.has(param));
      
      if (foundParams.length > 0) {
        if (foundParams.includes('search') || foundParams.includes('q') || foundParams.includes('query')) {
          generatedName += ' (Search)';
        } else if (foundParams.includes('filter')) {
          generatedName += ' (Filtered)';
        } else if (foundParams.includes('page')) {
          generatedName += ' (Paginated)';
        }
      }
    }
    
    return generatedName;
    
  } catch (error) {
    // If URL parsing fails, extract what we can
    return generateFallbackName(method, url);
  }
}

/**
 * Generate a fallback name when URL parsing fails
 */
function generateFallbackName(method, url) {
  // Remove protocol and domain if present
  let path = url.replace(/^https?:\/\/[^\/]+/, '');
  
  // Extract the last meaningful part
  const parts = path.split('/').filter(part => part.length > 0);
  
  if (parts.length === 0) {
    return `${capitalizeMethod(method)} Request`;
  }
  
  const lastPart = parts[parts.length - 1];
  // Remove query parameters and fragments
  const cleanPart = lastPart.split('?')[0].split('#')[0];
  
  return `${capitalizeMethod(method)} ${capitalize(cleanPart)}`;
}

/**
 * Capitalize the first letter of a string
 */
function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Capitalize HTTP method for display
 */
function capitalizeMethod(method) {
  if (!method) return 'Request';
  
  const methodMap = {
    'GET': 'Get',
    'POST': 'Create',
    'PUT': 'Update',
    'PATCH': 'Modify', 
    'DELETE': 'Delete',
    'HEAD': 'Check',
    'OPTIONS': 'Options'
  };
  
  return methodMap[method.toUpperCase()] || capitalize(method);
}

/**
 * Check if a string looks like an ID (number, UUID, etc.)
 */
function isId(str) {
  if (!str) return false;
  
  // Check for numeric ID
  if (/^\d+$/.test(str)) return true;
  
  // Check for UUID pattern
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str)) return true;
  
  // Check for MongoDB ObjectId pattern
  if (/^[0-9a-f]{24}$/i.test(str)) return true;
  
  // Check for other common ID patterns
  if (/^(id|key|ref)_/.test(str.toLowerCase())) return true;
  
  return false;
}

/**
 * Simple singularization (basic English rules)
 */
function singularize(word) {
  if (!word) return word;
  
  const singularMap = {
    'users': 'user',
    'posts': 'post',
    'comments': 'comment',
    'products': 'product',
    'orders': 'order',
    'items': 'item',
    'files': 'file',
    'images': 'image',
    'videos': 'video',
    'categories': 'category',
    'companies': 'company',
    'countries': 'country',
    'cities': 'city',
    'people': 'person',
    'children': 'child',
    'data': 'data' // unchanged
  };
  
  const lower = word.toLowerCase();
  if (singularMap[lower]) {
    return singularMap[lower];
  }
  
  // Basic rules
  if (word.endsWith('ies')) {
    return word.slice(0, -3) + 'y';
  }
  if (word.endsWith('es') && word.length > 3) {
    return word.slice(0, -2);
  }
  if (word.endsWith('s') && word.length > 1) {
    return word.slice(0, -1);
  }
  
  return word.toLowerCase();
}

/**
 * Check if a request name appears to be auto-generated (vs user-customized)
 */
export function isAutoGeneratedName(name) {
  if (!name) return true;
  
  // Check for common auto-generated patterns
  const autoPatterns = [
    /^(Get|Create|Update|Delete|Modify|Check|Options)\s+/i,
    /^Untitled/i,
    /^(GET|POST|PUT|DELETE|PATCH|HEAD|OPTIONS)\s+/i
  ];
  
  return autoPatterns.some(pattern => pattern.test(name));
}