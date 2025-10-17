'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { History, Trash2 } from 'lucide-react'
import { getHistory, clearHistory, removeFromHistory } from '@/lib/storage'

export default function HistoryPanel({ onLoadRequest }) {
  const [history, setHistory] = useState([])

  useEffect(() => {
    loadHistory()
  }, [])

  const loadHistory = () => {
    const historyData = getHistory()
    setHistory(historyData)
  }

  const handleClearHistory = () => {
    clearHistory()
    setHistory([])
  }

  const handleRemoveItem = (id) => {
    removeFromHistory(id)
    loadHistory()
  }

  const handleLoadRequest = (request) => {
    if (onLoadRequest) {
      onLoadRequest(request)
    }
  }

  const getStatusColor = (status) => {
    if (status >= 200 && status < 300) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
    if (status >= 300 && status < 400) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
    if (status >= 400 && status < 500) return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
    if (status >= 500) return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
  }

  const getMethodColor = (method) => {
    const colors = {
      GET: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      POST: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      PUT: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      PATCH: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      DELETE: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    }
    return colors[method] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
  }

  if (history.length === 0) {
    return (
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="px-4 py-4">
          <h2 className="text-sm font-semibold text-gray-900">History</h2>
        </div>
        
        {/* Empty State */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center py-16 space-y-4">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-lg">
              <History className="h-6 w-6 text-gray-400" />
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-700">No history yet</h3>
              <p className="text-sm text-gray-500 max-w-sm mx-auto">
                Your request history will appear here
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-4 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">History</h2>
          <Button variant="ghost" size="sm" onClick={handleClearHistory} className="h-6 w-6 p-0 text-gray-500 hover:text-gray-700">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* History List */}
      <div className="flex-1 overflow-y-auto bg-white">
        <div className="p-2 space-y-1">
          {history.map((item) => (
            <div key={item.id} className="group flex items-center px-3 py-2 rounded hover:bg-gray-50 transition-colors cursor-pointer"
                 onClick={() => handleLoadRequest(item.request)}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-mono px-1.5 py-0.5 rounded ${
                    item.request.method === 'GET' ? 'text-green-600 bg-green-100' :
                    item.request.method === 'POST' ? 'text-blue-600 bg-blue-100' :
                    item.request.method === 'PUT' ? 'text-orange-600 bg-orange-100' :
                    item.request.method === 'DELETE' ? 'text-red-600 bg-red-100' :
                    'text-gray-600 bg-gray-100'
                  }`}>
                    {item.request.method}
                  </span>
                  {item.response && (
                    <span className={`text-xs px-1.5 py-0.5 rounded ${getStatusColor(item.response.status)}`}>
                      {item.response.status}
                    </span>
                  )}
                </div>
                
                <div className="text-sm font-mono truncate text-gray-900 mb-1">
                  {item.request.url}
                </div>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>
                    {new Date(item.timestamp).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                  {item.response && (
                    <span>
                      {item.response.time}ms
                    </span>
                  )}
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  handleRemoveItem(item.id)
                }}
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}