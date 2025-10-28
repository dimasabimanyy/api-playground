const ENVIRONMENTS_KEY = 'api-playground-environments'
const ACTIVE_ENV_KEY = 'api-playground-active-env'

// Default environments
const DEFAULT_ENVIRONMENTS = {
  'development': {
    id: 'development',
    name: 'Development',
    variables: [
      { key: 'BASE_URL', value: 'http://localhost:3000/api', description: 'Development API base URL' },
      { key: 'API_KEY', value: 'dev_key_123', description: 'Development API key' },
      { key: 'VERSION', value: 'v1', description: 'API version' },
      { key: 'TIMEOUT', value: '5000', description: 'Request timeout in ms' }
    ]
  },
  'staging': {
    id: 'staging',
    name: 'Staging',
    variables: [
      { key: 'BASE_URL', value: 'https://api-staging.example.com', description: 'Staging API base URL' },
      { key: 'API_KEY', value: 'staging_key_456', description: 'Staging API key' },
      { key: 'VERSION', value: 'v1', description: 'API version' },
      { key: 'TIMEOUT', value: '10000', description: 'Request timeout in ms' }
    ]
  },
  'production': {
    id: 'production',
    name: 'Production', 
    variables: [
      { key: 'BASE_URL', value: 'https://api.example.com', description: 'Production API base URL' },
      { key: 'API_KEY', value: 'prod_key_789', description: 'Production API key' },
      { key: 'VERSION', value: 'v1', description: 'API version' },
      { key: 'TIMEOUT', value: '15000', description: 'Request timeout in ms' }
    ]
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
  const variables = environments[activeEnv]?.variables || []
  
  // Convert array format to object for compatibility
  const variableObj = {}
  variables.forEach(variable => {
    if (variable.key) {
      variableObj[variable.key] = variable.value
    }
  })
  
  return variableObj
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
      Object.entries(request.headers || {}).map(([key, value]) => [
        replaceVariables(key, variables),
        replaceVariables(value, variables)
      ])
    ),
    body: replaceVariables(request.body, variables)
  }
}

/**
 * Create a new environment
 */
export function createEnvironment(name, variables = []) {
  const environments = getEnvironments()
  const id = 'env_' + Date.now()
  
  const newEnv = {
    id,
    name,
    variables: variables.map(v => ({
      key: v.key || '',
      value: v.value || '',
      description: v.description || ''
    }))
  }
  
  environments[id] = newEnv
  saveEnvironments(environments)
  return newEnv
}

/**
 * Update environment
 */
export function updateEnvironment(id, updates) {
  const environments = getEnvironments()
  if (!environments[id]) {
    throw new Error('Environment not found')
  }
  
  environments[id] = { ...environments[id], ...updates }
  saveEnvironments(environments)
  return environments[id]
}

/**
 * Delete environment
 */
export function deleteEnvironment(id) {
  const environments = getEnvironments()
  if (!environments[id]) {
    throw new Error('Environment not found')
  }
  
  delete environments[id]
  
  // If we're deleting the active environment, switch to development
  if (getActiveEnvironment() === id) {
    setActiveEnvironment('development')
  }
  
  saveEnvironments(environments)
  return environments
}

/**
 * Add variable to environment
 */
export function addVariableToEnvironment(envId, variable) {
  const environments = getEnvironments()
  if (!environments[envId]) {
    throw new Error('Environment not found')
  }
  
  const updatedVariables = [...environments[envId].variables, {
    key: variable.key || '',
    value: variable.value || '',
    description: variable.description || ''
  }]
  
  environments[envId] = {
    ...environments[envId],
    variables: updatedVariables
  }
  
  saveEnvironments(environments)
  return environments[envId]
}

/**
 * Update variable in environment
 */
export function updateVariableInEnvironment(envId, variableIndex, updates) {
  const environments = getEnvironments()
  if (!environments[envId]) {
    throw new Error('Environment not found')
  }
  
  const variables = [...environments[envId].variables]
  if (variableIndex < 0 || variableIndex >= variables.length) {
    throw new Error('Variable index out of bounds')
  }
  
  variables[variableIndex] = {
    ...variables[variableIndex],
    ...updates
  }
  
  environments[envId] = {
    ...environments[envId],
    variables
  }
  
  saveEnvironments(environments)
  return environments[envId]
}

/**
 * Delete variable from environment
 */
export function deleteVariableFromEnvironment(envId, variableIndex) {
  const environments = getEnvironments()
  if (!environments[envId]) {
    throw new Error('Environment not found')
  }
  
  const variables = [...environments[envId].variables]
  if (variableIndex < 0 || variableIndex >= variables.length) {
    throw new Error('Variable index out of bounds')
  }
  
  variables.splice(variableIndex, 1)
  
  environments[envId] = {
    ...environments[envId],
    variables
  }
  
  saveEnvironments(environments)
  return environments[envId]
}

/**
 * Find variables used in request
 */
export function findVariablesInRequest(request) {
  const variables = new Set()
  
  // Check URL
  const urlVars = (request.url || '').match(/\{\{([^}]+)\}\}/g)
  if (urlVars) {
    urlVars.forEach(match => {
      variables.add(match.replace(/\{\{|\}\}/g, '').trim())
    })
  }
  
  // Check body
  const bodyVars = (request.body || '').match(/\{\{([^}]+)\}\}/g)
  if (bodyVars) {
    bodyVars.forEach(match => {
      variables.add(match.replace(/\{\{|\}\}/g, '').trim())
    })
  }
  
  // Check headers
  if (request.headers) {
    Object.entries(request.headers).forEach(([key, value]) => {
      const keyVars = key.match(/\{\{([^}]+)\}\}/g)
      const valueVars = value.match(/\{\{([^}]+)\}\}/g)
      
      if (keyVars) {
        keyVars.forEach(match => {
          variables.add(match.replace(/\{\{|\}\}/g, '').trim())
        })
      }
      
      if (valueVars) {
        valueVars.forEach(match => {
          variables.add(match.replace(/\{\{|\}\}/g, '').trim())
        })
      }
    })
  }
  
  return Array.from(variables)
}

/**
 * Get environment color options
 */
export function getEnvironmentColors() {
  return [
    { id: 'blue', name: 'Blue', value: '#3B82F6' },
    { id: 'green', name: 'Green', value: '#10B981' },
    { id: 'purple', name: 'Purple', value: '#8B5CF6' },
    { id: 'red', name: 'Red', value: '#EF4444' },
    { id: 'yellow', name: 'Yellow', value: '#F59E0B' },
    { id: 'pink', name: 'Pink', value: '#EC4899' },
    { id: 'indigo', name: 'Indigo', value: '#6366F1' },
    { id: 'gray', name: 'Gray', value: '#6B7280' }
  ]
}