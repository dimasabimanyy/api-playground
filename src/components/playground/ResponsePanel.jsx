'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Copy, Download } from 'lucide-react'
import { useState } from 'react'

export default function ResponsePanel({ response, loading }) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy: ', err)
    }
  }

  const downloadResponse = () => {
    if (!response?.data) return
    
    const dataStr = typeof response.data === 'string' 
      ? response.data 
      : JSON.stringify(response.data, null, 2)
    
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'response.json'
    link.click()
    URL.revokeObjectURL(url)
  }

  const getStatusColor = (status) => {
    if (status >= 200 && status < 300) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
    if (status >= 300 && status < 400) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
    if (status >= 400 && status < 500) return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
    if (status >= 500) return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
  }

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatResponseData = (data) => {
    if (typeof data === 'string') return data
    return JSON.stringify(data, null, 2)
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Response</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Sending request...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!response) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Response</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-12">
            <div className="text-lg mb-2">Ready to send</div>
            <div className="text-sm">Configure your request and click Send</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (response.error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-red-600">Request Failed</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 border rounded bg-red-50 dark:bg-red-950 text-red-800 dark:text-red-200">
            {response.error}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Response</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(formatResponseData(response.data))}
            >
              <Copy className="h-4 w-4 mr-2" />
              {copied ? 'Copied!' : 'Copy'}
            </Button>
            <Button variant="ghost" size="sm" onClick={downloadResponse}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </div>
        
        {/* Status and Stats */}
        <div className="flex items-center gap-4 text-sm">
          <Badge className={getStatusColor(response.status)}>
            {response.status} {response.statusText}
          </Badge>
          <span className="text-muted-foreground">
            {response.time}ms
          </span>
          <span className="text-muted-foreground">
            {formatBytes(response.size || 0)}
          </span>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="body" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="body">Body</TabsTrigger>
            <TabsTrigger value="headers">
              Headers
              <Badge variant="secondary" className="ml-2">
                {Object.keys(response.headers || {}).length}
              </Badge>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="body">
            <div className="space-y-2">
              <pre className="text-sm bg-muted p-4 rounded-lg overflow-auto max-h-96 whitespace-pre-wrap">
                {formatResponseData(response.data)}
              </pre>
            </div>
          </TabsContent>
          
          <TabsContent value="headers">
            <div className="space-y-2">
              {Object.entries(response.headers || {}).map(([key, value]) => (
                <div key={key} className="grid grid-cols-1 md:grid-cols-3 gap-2 p-2 border rounded">
                  <div className="font-mono text-sm font-medium">{key}</div>
                  <div className="md:col-span-2 font-mono text-sm text-muted-foreground break-all">
                    {value}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}