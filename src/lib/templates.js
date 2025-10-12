// Popular API request templates
export const REQUEST_TEMPLATES = {
  'jsonplaceholder-get': {
    name: 'JSONPlaceholder - Get Post',
    description: 'Get a single post from JSONPlaceholder',
    category: 'Testing',
    request: {
      method: 'GET',
      url: 'https://jsonplaceholder.typicode.com/posts/1',
      headers: {},
      body: ''
    }
  },
  'jsonplaceholder-post': {
    name: 'JSONPlaceholder - Create Post',
    description: 'Create a new post on JSONPlaceholder',
    category: 'Testing',
    request: {
      method: 'POST',
      url: 'https://jsonplaceholder.typicode.com/posts',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: 'My New Post',
        body: 'This is the content of my post',
        userId: 1
      }, null, 2)
    }
  },
  'httpbin-get': {
    name: 'HTTPBin - Test GET',
    description: 'Test GET request with query parameters',
    category: 'Testing',
    request: {
      method: 'GET',
      url: 'https://httpbin.org/get?param1=value1&param2=value2',
      headers: {
        'User-Agent': 'API-Playground'
      },
      body: ''
    }
  },
  'httpbin-post': {
    name: 'HTTPBin - Test POST',
    description: 'Test POST request with JSON data',
    category: 'Testing',
    request: {
      method: 'POST',
      url: 'https://httpbin.org/post',
      headers: {
        'Content-Type': 'application/json',
        'X-Custom-Header': 'test-value'
      },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        message: 'Hello from API Playground!'
      }, null, 2)
    }
  },
  'github-user': {
    name: 'GitHub - Get User',
    description: 'Get GitHub user profile (replace username)',
    category: 'GitHub',
    request: {
      method: 'GET',
      url: 'https://api.github.com/users/octocat',
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'API-Playground'
      },
      body: ''
    }
  },
  'github-repos': {
    name: 'GitHub - List Repositories',
    description: 'List public repositories for a user',
    category: 'GitHub',
    request: {
      method: 'GET',
      url: 'https://api.github.com/users/octocat/repos',
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'API-Playground'
      },
      body: ''
    }
  },
  'rest-countries': {
    name: 'REST Countries - Get Country',
    description: 'Get country information by name',
    category: 'Data',
    request: {
      method: 'GET',
      url: 'https://restcountries.com/v3.1/name/united states',
      headers: {},
      body: ''
    }
  },
  'cat-facts': {
    name: 'Cat Facts API',
    description: 'Get random cat facts',
    category: 'Fun',
    request: {
      method: 'GET',
      url: 'https://catfact.ninja/fact',
      headers: {},
      body: ''
    }
  },
  'quotes-api': {
    name: 'Quotable - Random Quote',
    description: 'Get a random inspirational quote',
    category: 'Fun',
    request: {
      method: 'GET',
      url: 'https://api.quotable.io/random',
      headers: {},
      body: ''
    }
  },
  'auth-bearer': {
    name: 'Bearer Token Auth Template',
    description: 'Template for APIs requiring bearer token authentication',
    category: 'Authentication',
    request: {
      method: 'GET',
      url: '{{baseUrl}}/api/protected',
      headers: {
        'Authorization': 'Bearer {{authToken}}',
        'Content-Type': 'application/json'
      },
      body: ''
    }
  },
  'auth-api-key': {
    name: 'API Key Auth Template',
    description: 'Template for APIs requiring API key authentication',
    category: 'Authentication',
    request: {
      method: 'GET',
      url: '{{baseUrl}}/api/data',
      headers: {
        'X-API-Key': '{{apiKey}}',
        'Content-Type': 'application/json'
      },
      body: ''
    }
  },
  'webhook-test': {
    name: 'Webhook.site Test',
    description: 'Test webhooks with webhook.site',
    category: 'Testing',
    request: {
      method: 'POST',
      url: 'https://webhook.site/unique-id',
      headers: {
        'Content-Type': 'application/json',
        'X-Custom-Header': 'webhook-test'
      },
      body: JSON.stringify({
        event: 'test',
        timestamp: new Date().toISOString(),
        data: {
          message: 'Hello from API Playground!'
        }
      }, null, 2)
    }
  }
}

export const TEMPLATE_CATEGORIES = [
  'All',
  'Testing',
  'GitHub',
  'Data',
  'Fun',
  'Authentication'
]

export function getTemplatesByCategory(category = 'All') {
  if (category === 'All') {
    return Object.entries(REQUEST_TEMPLATES)
  }
  
  return Object.entries(REQUEST_TEMPLATES).filter(
    ([, template]) => template.category === category
  )
}

export function getTemplate(templateId) {
  return REQUEST_TEMPLATES[templateId]
}