'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Code, Copy, Check } from 'lucide-react'
import { CODE_GENERATORS } from '@/lib/code-generation'
import { processRequestWithVariables } from '@/lib/environments'

export default function CodeGenerationPanel({ request }) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [copiedCode, setCopiedCode] = useState('')

  const copyToClipboard = async (code, codeType) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedCode(codeType)
      setTimeout(() => setCopiedCode(''), 2000)
    } catch (err) {
      console.error('Failed to copy code:', err)
    }
  }

  // Process request with environment variables before generating code
  const processedRequest = processRequestWithVariables(request)

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Code className="h-4 w-4 mr-2" />
          Code
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Generate Code</DialogTitle>
        </DialogHeader>
        
        <div className="text-sm text-muted-foreground mb-4">
          Generate code snippets for your API request in different languages and frameworks.
        </div>
        
        <Tabs defaultValue="curl" className="w-full">
          <TabsList className="grid grid-cols-5 mb-4">
            {Object.entries(CODE_GENERATORS).map(([key, generator]) => (
              <TabsTrigger key={key} value={key} className="text-xs">
                {generator.name}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {Object.entries(CODE_GENERATORS).map(([key, generator]) => {
            const generatedCode = generator.generator(processedRequest)
            
            return (
              <TabsContent key={key} value={key} className="mt-0">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{generator.name}</h3>
                      <Badge variant="secondary">{generator.language}</Badge>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(generatedCode, key)}
                    >
                      {copiedCode === key ? (
                        <>
                          <Check className="h-4 w-4 mr-2" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-2" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                  
                  <pre className="bg-muted p-4 rounded-lg overflow-auto max-h-96 text-sm font-mono">
                    <code>{generatedCode}</code>
                  </pre>
                </div>
              </TabsContent>
            )
          })}
        </Tabs>
        
        <div className="border-t pt-4 text-xs text-muted-foreground">
          💡 Tip: Environment variables are automatically replaced in the generated code
        </div>
      </DialogContent>
    </Dialog>
  )
}