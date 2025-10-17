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
        <div className="px-6 py-6 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">History</h2>
            <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              0 requests
            </div>
          </div>
        </div>
        
        {/* Empty State */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center py-12 space-y-6 max-w-sm">
            <div className="relative inline-flex items-center justify-center">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center shadow-sm">
                <History className="h-8 w-8 text-gray-400" />
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="text-base font-semibold text-gray-800">No Requests Yet</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Send your first API request to start building your request history. All executed requests will appear here for easy access.
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
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-medium text-gray-900">History</h2>
            <span className="text-xs text-gray-500">
              {history.length}
            </span>
          </div>
          <button onClick={handleClearHistory} className="h-6 w-6 text-gray-400 hover:text-red-600 rounded transition-colors flex items-center justify-center">
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* History List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-2 space-y-1">
          {history.map((item) => (
            <div key={item.id} className="group border-b border-gray-100 last:border-b-0 p-3 hover:bg-gray-50 transition-colors cursor-pointer"
                 onClick={() => handleLoadRequest(item.request)}>
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                      item.request.method === 'GET' ? 'text-green-700 bg-green-50' :
                      item.request.method === 'POST' ? 'text-blue-700 bg-blue-50' :
                      item.request.method === 'PUT' ? 'text-orange-700 bg-orange-50' :
                      item.request.method === 'DELETE' ? 'text-red-700 bg-red-50' :
                      'text-gray-700 bg-gray-50'
                    }`}>
                      {item.request.method}
                    </span>
                    {item.response && (
                      <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${getStatusColor(item.response.status)}`}>
                        {item.response.status}
                      </span>
                    )}
                    <span className="text-xs text-gray-500">
                      {new Date(item.timestamp).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  
                  <div className="text-xs font-mono text-gray-700 truncate mb-1">
                    {item.request.url}
                  </div>
                  
                  {item.response && (
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>{item.response.time}ms</span>
                      {item.response.size && (
                        <span>{Math.round(item.response.size / 1024)}KB</span>
                      )}
                    </div>
                  )}
                </div>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRemoveItem(item.id)
                  }}
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-600 rounded flex items-center justify-center"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}