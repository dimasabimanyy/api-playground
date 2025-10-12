const HISTORY_KEY = 'api-playground-history'
const MAX_HISTORY_ITEMS = 10

/**
 * Save a request to history
 */
export function saveToHistory(request, response) {
  if (typeof window === 'undefined') return
  
  try {
    const historyItem = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      request: { ...request },
      response: response ? {
        status: response.status,
        statusText: response.statusText,
        time: response.time,
        size: response.size
      } : null
    }
    
    const existing = getHistory()
    const updated = [historyItem, ...existing].slice(0, MAX_HISTORY_ITEMS)
    
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated))
  } catch (error) {
    console.error('Failed to save to history:', error)
  }
}

/**
 * Get request history
 */
export function getHistory() {
  if (typeof window === 'undefined') return []
  
  try {
    const stored = localStorage.getItem(HISTORY_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error('Failed to get history:', error)
    return []
  }
}

/**
 * Clear request history
 */
export function clearHistory() {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.removeItem(HISTORY_KEY)
  } catch (error) {
    console.error('Failed to clear history:', error)
  }
}

/**
 * Remove a specific item from history
 */
export function removeFromHistory(id) {
  if (typeof window === 'undefined') return
  
  try {
    const existing = getHistory()
    const updated = existing.filter(item => item.id !== id)
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated))
  } catch (error) {
    console.error('Failed to remove from history:', error)
  }
}