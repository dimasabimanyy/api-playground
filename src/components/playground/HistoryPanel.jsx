'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { History, Trash2, RotateCcw } from 'lucide-react'
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <History className="h-5 w-5 mr-2" />
            Request History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-12">
            <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <div className="text-lg mb-2">No history yet</div>
            <div className="text-sm">Your request history will appear here</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <History className="h-5 w-5 mr-2" />
            Request History
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={handleClearHistory}>
            <Trash2 className="h-4 w-4 mr-2" />
            Clear
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {history.map((item) => (
            <div key={item.id} className="border rounded-lg p-3 hover:bg-muted/50 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className={getMethodColor(item.request.method)}>
                    {item.request.method}
                  </Badge>
                  {item.response && (
                    <Badge variant="secondary" className={getStatusColor(item.response.status)}>
                      {item.response.status}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleLoadRequest(item.request)}
                    title="Load this request"
                  >
                    <RotateCcw className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveItem(item.id)}
                    title="Remove from history"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              
              <div className="text-sm font-mono truncate mb-1">
                {item.request.url}
              </div>
              
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {new Date(item.timestamp).toLocaleString()}
                </span>
                {item.response && (
                  <span>
                    {item.response.time}ms
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}