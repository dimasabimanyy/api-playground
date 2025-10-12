const ENVIRONMENTS_KEY = 'api-playground-environments'
const ACTIVE_ENV_KEY = 'api-playground-active-env'

// Default environments
const DEFAULT_ENVIRONMENTS = {
  'development': {
    name: 'Development',
    variables: {
      baseUrl: 'http://localhost:3000',
      apiKey: 'dev-key-123'
    }
  },
  'production': {
    name: 'Production', 
    variables: {
      baseUrl: 'https://api.example.com',
      apiKey: 'prod-key-456'
    }
  }
}

/**
 * Get all environments
 */
export function getEnvironments() {
  if (typeof window === 'undefined') return DEFAULT_ENVIRONMENTS
  
  try {
    const stored = localStorage.getItem(ENVIRONMENTS_KEY)
    return stored ? JSON.parse(stored) : DEFAULT_ENVIRONMENTS
  } catch (error) {
    console.error('Failed to get environments:', error)
    return DEFAULT_ENVIRONMENTS
  }
}

/**
 * Save environments
 */
export function saveEnvironments(environments) {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(ENVIRONMENTS_KEY, JSON.stringify(environments))
  } catch (error) {
    console.error('Failed to save environments:', error)
  }
}

/**
 * Get active environment
 */
export function getActiveEnvironment() {
  if (typeof window === 'undefined') return 'development'
  
  try {
    return localStorage.getItem(ACTIVE_ENV_KEY) || 'development'
  } catch (error) {
    console.error('Failed to get active environment:', error)
    return 'development'
  }
}

/**
 * Set active environment
 */
export function setActiveEnvironment(envId) {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(ACTIVE_ENV_KEY, envId)
  } catch (error) {
    console.error('Failed to set active environment:', error)
  }
}

/**
 * Replace variables in text with environment values
 * Supports {{variableName}} syntax
 */
export function replaceVariables(text, variables = {}) {
  if (!text || typeof text !== 'string') return text
  
  return text.replace(/\{\{([^}]+)\}\}/g, (match, variableName) => {
    const trimmedName = variableName.trim()
    return variables[trimmedName] || match
  })
}

/**
 * Get variables for active environment
 */
export function getActiveVariables() {
  const environments = getEnvironments()
  const activeEnv = getActiveEnvironment()
  return environments[activeEnv]?.variables || {}
}

/**
 * Process request object and replace variables
 */
export function processRequestWithVariables(request) {
  const variables = getActiveVariables()
  
  return {
    ...request,
    url: replaceVariables(request.url, variables),
    headers: Object.fromEntries(
      Object.entries(request.headers).map(([key, value]) => [
        replaceVariables(key, variables),
        replaceVariables(value, variables)
      ])
    ),
    body: replaceVariables(request.body, variables)
  }
}