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
    <div className="flex items-center gap-3">
      <Globe className="h-4 w-4 text-gray-500 dark:text-gray-400" />
      <Select value={activeEnv} onValueChange={handleEnvironmentChange}>
        <SelectTrigger className="w-44 h-9 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-600">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
          {Object.entries(environments).map(([id, env]) => (
            <SelectItem key={id} value={id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
              <div className="flex items-center gap-2">
                <span className="font-medium">{env.name}</span>
                <Badge variant="secondary" className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                  {Object.keys(env.variables).length} vars
                </Badge>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" className="h-9 w-9 p-0 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800">
            <Settings className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800">
          <DialogHeader className="border-b border-gray-200 dark:border-gray-800 pb-4">
            <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">Manage Environments</DialogTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Configure environment variables for different deployment stages</p>
          </DialogHeader>
          
          <div className="space-y-8 py-4">
            {/* Add New Environment */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Add New Environment</h3>
              <div className="flex gap-3 p-4 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50/50 dark:bg-gray-800/30">
                <Input
                  placeholder="Environment name (e.g., Production, Staging)"
                  value={newEnvName}
                  onChange={(e) => setNewEnvName(e.target.value)}
                  className="h-9 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
                />
                <Button onClick={addEnvironment} className="h-9 bg-blue-600 hover:bg-blue-700 text-white px-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
            </div>

            {/* Environment List */}
            <div className="space-y-6">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Environments</h3>
              {Object.entries(environments).map(([envId, env]) => (
                <div key={envId} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 space-y-4 bg-white dark:bg-gray-950">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{env.name}</h3>
                    <div className="flex items-center gap-3">
                      {activeEnv === envId && (
                        <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Active</Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteEnvironment(envId)}
                        disabled={Object.keys(environments).length <= 1}
                        className="h-8 w-8 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 dark:hover:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Variables */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Variables</h4>
                    
                    {/* Existing Variables */}
                    {Object.entries(env.variables).length > 0 ? (
                      <div className="space-y-3">
                        {Object.entries(env.variables).map(([key, value]) => (
                          <div key={key} className="flex gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                            <Input value={key} disabled className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 flex-1 font-mono" />
                            <Input
                              value={value}
                              onChange={(e) => updateVariable(envId, key, e.target.value)}
                              className="flex-1 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 font-mono"
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeVariable(envId, key)}
                              className="h-9 w-9 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 dark:hover:text-red-400"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
                        <p className="text-sm">No variables defined yet</p>
                      </div>
                    )}
                    
                    {/* Add Variable */}
                    <div className="flex gap-3 p-3 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50/50 dark:bg-gray-800/30">
                      <Input
                        placeholder="Variable name (e.g., baseUrl)"
                        value={newVarKey}
                        onChange={(e) => setNewVarKey(e.target.value)}
                        className="h-9 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 font-mono"
                      />
                      <Input
                        placeholder="Variable value (e.g., https://api.example.com)"
                        value={newVarValue}
                        onChange={(e) => setNewVarValue(e.target.value)}
                        className="h-9 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 font-mono"
                      />
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => addVariable(envId)}
                        className="h-9 bg-blue-600 hover:bg-blue-700 text-white px-4"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add
                      </Button>
                    </div>
                  </div>
                  
                  {/* Usage hint */}
                  <div className="text-sm text-gray-600 dark:text-gray-400 bg-blue-50 dark:bg-blue-950/30 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                    <span className="font-medium">💡 Usage:</span> Reference variables in requests using <code className="bg-blue-100 dark:bg-blue-900 px-1.5 py-0.5 rounded text-xs font-mono">{'{{variableName}}'}</code> syntax
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