'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Settings, Plus, Trash2, Globe } from 'lucide-react'
import { 
  getEnvironments, 
  saveEnvironments, 
  getActiveEnvironment, 
  setActiveEnvironment 
} from '@/lib/environments'

export default function EnvironmentSelector({ onEnvironmentChange }) {
  const [environments, setEnvironments] = useState({})
  const [activeEnv, setActiveEnv] = useState('development')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [newEnvName, setNewEnvName] = useState('')
  const [newVarKey, setNewVarKey] = useState('')
  const [newVarValue, setNewVarValue] = useState('')

  useEffect(() => {
    loadEnvironments()
  }, [])

  const loadEnvironments = () => {
    const envs = getEnvironments()
    const active = getActiveEnvironment()
    setEnvironments(envs)
    setActiveEnv(active)
  }

  const handleEnvironmentChange = (envId) => {
    setActiveEnv(envId)
    setActiveEnvironment(envId)
    if (onEnvironmentChange) {
      onEnvironmentChange(envId)
    }
  }

  const addEnvironment = () => {
    if (!newEnvName.trim()) return
    
    const envId = newEnvName.toLowerCase().replace(/\s+/g, '-')
    const updatedEnvs = {
      ...environments,
      [envId]: {
        name: newEnvName,
        variables: {}
      }
    }
    
    setEnvironments(updatedEnvs)
    saveEnvironments(updatedEnvs)
    setNewEnvName('')
  }

  const deleteEnvironment = (envId) => {
    if (Object.keys(environments).length <= 1) return // Keep at least one
    
    const { [envId]: removed, ...rest } = environments
    setEnvironments(rest)
    saveEnvironments(rest)
    
    if (activeEnv === envId) {
      const firstEnv = Object.keys(rest)[0]
      handleEnvironmentChange(firstEnv)
    }
  }

  const addVariable = (envId) => {
    if (!newVarKey.trim() || !newVarValue.trim()) return
    
    const updatedEnvs = {
      ...environments,
      [envId]: {
        ...environments[envId],
        variables: {
          ...environments[envId].variables,
          [newVarKey]: newVarValue
        }
      }
    }
    
    setEnvironments(updatedEnvs)
    saveEnvironments(updatedEnvs)
    setNewVarKey('')
    setNewVarValue('')
  }

  const removeVariable = (envId, varKey) => {
    const { [varKey]: removed, ...rest } = environments[envId].variables
    const updatedEnvs = {
      ...environments,
      [envId]: {
        ...environments[envId],
        variables: rest
      }
    }
    
    setEnvironments(updatedEnvs)
    saveEnvironments(updatedEnvs)
  }

  const updateVariable = (envId, varKey, newValue) => {
    const updatedEnvs = {
      ...environments,
      [envId]: {
        ...environments[envId],
        variables: {
          ...environments[envId].variables,
          [varKey]: newValue
        }
      }
    }
    
    setEnvironments(updatedEnvs)
    saveEnvironments(updatedEnvs)
  }

  return (
    <div className="flex items-center gap-2">
      <Globe className="h-4 w-4 text-muted-foreground" />
      <Select value={activeEnv} onValueChange={handleEnvironmentChange}>
        <SelectTrigger className="w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(environments).map(([id, env]) => (
            <SelectItem key={id} value={id}>
              <div className="flex items-center gap-2">
                <span>{env.name}</span>
                <Badge variant="secondary" className="text-xs">
                  {Object.keys(env.variables).length} vars
                </Badge>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm">
            <Settings className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Environments</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Add New Environment */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Add New Environment</h3>
              <div className="flex gap-2">
                <Input
                  placeholder="Environment name"
                  value={newEnvName}
                  onChange={(e) => setNewEnvName(e.target.value)}
                />
                <Button onClick={addEnvironment}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
            </div>

            {/* Environment List */}
            <div className="space-y-4">
              {Object.entries(environments).map(([envId, env]) => (
                <div key={envId} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{env.name}</h3>
                    <div className="flex items-center gap-2">
                      {activeEnv === envId && (
                        <Badge variant="default">Active</Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteEnvironment(envId)}
                        disabled={Object.keys(environments).length <= 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Variables */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">Variables</h4>
                    
                    {/* Existing Variables */}
                    {Object.entries(env.variables).map(([key, value]) => (
                      <div key={key} className="flex gap-2">
                        <Input value={key} disabled className="bg-muted flex-1" />
                        <Input
                          value={value}
                          onChange={(e) => updateVariable(envId, key, e.target.value)}
                          className="flex-1"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeVariable(envId, key)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    
                    {/* Add Variable */}
                    <div className="flex gap-2">
                      <Input
                        placeholder="Variable name"
                        value={newVarKey}
                        onChange={(e) => setNewVarKey(e.target.value)}
                      />
                      <Input
                        placeholder="Variable value"
                        value={newVarValue}
                        onChange={(e) => setNewVarValue(e.target.value)}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => addVariable(envId)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Usage hint */}
                  <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                    Use variables in requests with <code>{'{{variableName}}'}</code> syntax
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}