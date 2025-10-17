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
      <div className="px-6 py-6 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-gray-900">History</h2>
            <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {history.length} {history.length === 1 ? 'request' : 'requests'}
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleClearHistory} className="h-8 w-8 p-0 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* History List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-3">
          {history.map((item) => (
            <div key={item.id} className="group bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-200 cursor-pointer"
                 onClick={() => handleLoadRequest(item.request)}>
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-md border ${
                      item.request.method === 'GET' ? 'text-emerald-700 bg-emerald-50 border-emerald-200' :
                      item.request.method === 'POST' ? 'text-blue-700 bg-blue-50 border-blue-200' :
                      item.request.method === 'PUT' ? 'text-amber-700 bg-amber-50 border-amber-200' :
                      item.request.method === 'DELETE' ? 'text-red-700 bg-red-50 border-red-200' :
                      'text-gray-700 bg-gray-50 border-gray-200'
                    }`}>
                      {item.request.method}
                    </span>
                    {item.response && (
                      <span className={`text-xs font-semibold px-2 py-1 rounded-md border ${getStatusColor(item.response.status)}`}>
                        {item.response.status}
                      </span>
                    )}
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                      <span>
                        {new Date(item.timestamp).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-sm font-mono text-gray-900 mb-2 truncate bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                    {item.request.url}
                  </div>
                  
                  {item.response && (
                    <div className="flex items-center gap-3 text-xs text-gray-600">
                      <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                        <span className="font-medium">{item.response.time}ms</span>
                      </div>
                      {item.response.size && (
                        <div className="flex items-center gap-1">
                          <div className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
                          <span className="font-medium">{Math.round(item.response.size / 1024)}KB</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRemoveItem(item.id)
                  }}
                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-all duration-200 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}