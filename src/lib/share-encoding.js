/**
 * Encode request data into a shareable URL
 */
export function encodeRequest(request) {
  try {
    const encoded = btoa(JSON.stringify(request))
    return encoded
  } catch (error) {
    console.error('Failed to encode request:', error)
    return null
  }
}

/**
 * Decode request data from a shareable URL
 */
export function decodeRequest(encoded) {
  try {
    const decoded = atob(encoded)
    return JSON.parse(decoded)
  } catch (error) {
    console.error('Failed to decode request:', error)
    return null
  }
}

/**
 * Generate a shareable URL for the current request
 */
export function generateShareableUrl(request, baseUrl = window.location.origin) {
  const encoded = encodeRequest(request)
  if (!encoded) return null
  
  return `${baseUrl}?share=${encoded}`
}

/**
 * Extract shared request from current URL
 */
export function getSharedRequest() {
  if (typeof window === 'undefined') return null
  
  const urlParams = new URLSearchParams(window.location.search)
  const shared = urlParams.get('share')
  
  if (!shared) return null
  
  return decodeRequest(shared)
}