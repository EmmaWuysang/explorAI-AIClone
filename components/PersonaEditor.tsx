'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User,
  Save,
  Trash2,
  Plus,
  Check,
  AlertCircle,
  Zap,
  Settings,
  FileJson
} from 'lucide-react'
import { useStore, Persona } from '@/lib/store'

export default function PersonaEditor() {
  const [personas, setPersonas] = useState<Persona[]>([])
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null)
  const [editedPrompt, setEditedPrompt] = useState('')
  const [editedName, setEditedName] = useState('')
  const [editedDescription, setEditedDescription] = useState('')
  const [editedTemperature, setEditedTemperature] = useState(0.7)
  const [editedMaxTokens, setEditedMaxTokens] = useState(2000)
  const [editedModel, setEditedModel] = useState('gpt-4o-mini')
  const [isLoading, setIsLoading] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)

  const { activePersonaId, setActivePersona } = useStore()
  const autoSaveTimeout = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    fetchPersonas()
  }, [])

  // Auto-select active persona on load
  useEffect(() => {
    if (personas.length > 0 && !selectedPersona) {
      const active = personas.find(p => p.id === activePersonaId)
      if (active) {
        handleSelectPersona(active.id)
      }
    }
  }, [personas, activePersonaId, selectedPersona])

  const fetchPersonas = async () => {
    try {
      const response = await fetch('/api/personas')
      const data = await response.json()
      setPersonas(data.personas || [])
    } catch (error) {
      console.error('Error fetching personas:', error)
    }
  }

  const handleSelectPersona = async (id: string) => {
    try {
      const response = await fetch(`/api/personas/${id}`)
      const data = await response.json()
      const persona = data.persona
      setSelectedPersona(persona)
      setEditedPrompt(persona.systemPrompt)
      setEditedName(persona.name)
      setEditedDescription(persona.description || '')
      setEditedTemperature(persona.temperature || 0.7)
      setEditedMaxTokens(persona.maxTokens || 2000)
      setEditedModel(persona.model || 'gpt-4o-mini')
      setError(null)
      setSaveStatus('idle')
    } catch (error) {
      setError('Failed to load persona')
    }
  }

  const handleHotSwap = (id: string) => {
    setActivePersona(id)
    handleSelectPersona(id)
  }

  const handleCreateNew = () => {
    const newPersona: Persona = {
      id: `persona-${Date.now()}`,
      name: 'New Persona',
      description: 'Custom AI persona',
      systemPrompt: 'You are a helpful AI assistant.',
      temperature: 0.7,
      maxTokens: 2000,
      model: 'gpt-4o-mini',
    }
    setSelectedPersona(newPersona)
    setEditedPrompt(newPersona.systemPrompt)
    setEditedName(newPersona.name)
    setEditedDescription(newPersona.description)
    setEditedTemperature(newPersona.temperature)
    setEditedMaxTokens(newPersona.maxTokens)
    setEditedModel(newPersona.model)
    setError(null)
    setSaveStatus('idle')
  }

  // Auto-save with debounce
  const triggerAutoSave = useCallback(() => {
    if (autoSaveTimeout.current) {
      clearTimeout(autoSaveTimeout.current)
    }

    autoSaveTimeout.current = setTimeout(() => {
      if (selectedPersona) {
        handleSave()
      }
    }, 1500)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPersona])

  const handleSave = async () => {
    if (!selectedPersona) return

    setIsLoading(true)
    setSaveStatus('saving')
    setError(null)

    try {
      const updatedPersona: Persona = {
        ...selectedPersona,
        name: editedName,
        description: editedDescription,
        systemPrompt: editedPrompt,
        temperature: editedTemperature,
        maxTokens: editedMaxTokens,
        model: editedModel,
      }

      const response = await fetch('/api/personas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPersona),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save persona')
      }

      setSaveStatus('saved')
      setSelectedPersona(updatedPersona)
      await fetchPersonas()

      setTimeout(() => setSaveStatus('idle'), 2000)
    } catch (error) {
      setSaveStatus('error')
      setError(error instanceof Error ? error.message : 'Save failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this persona?')) return

    try {
      const response = await fetch(`/api/personas?id=${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Failed to delete')

      if (activePersonaId === id && personas.length > 1) {
        const other = personas.find(p => p.id !== id)
        if (other) setActivePersona(other.id)
      }

      setSelectedPersona(null)
      await fetchPersonas()
    } catch (error) {
      setError('Failed to delete persona')
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Persona List */}
      <div className="lg:col-span-1">
        <div
          className="rounded-xl p-4"
          style={{
            background: 'rgba(var(--color-bg-elevated), 0.8)',
            border: '1px solid rgba(var(--color-border), 0.3)'
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold" style={{ color: 'rgb(var(--color-text-secondary))' }}>
              Available Personas
            </h3>
            <motion.button
              onClick={handleCreateNew}
              className="p-2 rounded-lg"
              style={{
                background: 'rgba(var(--color-accent), 0.1)',
                color: 'rgb(var(--color-accent))'
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus className="w-4 h-4" />
            </motion.button>
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            <AnimatePresence>
              {personas.map((persona) => (
                <motion.div
                  key={persona.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                    selectedPersona?.id === persona.id ? 'ring-1' : ''
                  }`}
                  style={{
                    background: selectedPersona?.id === persona.id
                      ? 'rgba(var(--color-accent), 0.1)'
                      : 'rgba(var(--color-bg-tertiary), 0.5)',
                    borderColor: selectedPersona?.id === persona.id
                      ? 'rgb(var(--color-accent))'
                      : 'transparent',
                  }}
                  onClick={() => handleSelectPersona(persona.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 shrink-0" style={{ color: 'rgb(var(--color-text-tertiary))' }} />
                        <span
                          className="font-medium text-sm truncate"
                          style={{ color: 'rgb(var(--color-text-primary))' }}
                        >
                          {persona.name}
                        </span>
                        {activePersonaId === persona.id && (
                          <span
                            className="px-1.5 py-0.5 rounded text-[10px] font-medium"
                            style={{
                              background: 'rgba(var(--color-arc-reactor), 0.2)',
                              color: 'rgb(var(--color-arc-reactor))'
                            }}
                          >
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <p
                        className="text-xs mt-1 truncate"
                        style={{ color: 'rgb(var(--color-text-muted))' }}
                      >
                        {persona.description || 'No description'}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      {activePersonaId !== persona.id && (
                        <motion.button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleHotSwap(persona.id)
                          }}
                          className="p-1.5 rounded"
                          style={{ color: 'rgb(var(--color-arc-reactor))' }}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          title="Switch to this persona"
                        >
                          <Zap className="w-3.5 h-3.5" />
                        </motion.button>
                      )}
                      <motion.button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(persona.id)
                        }}
                        className="p-1.5 rounded hover:bg-red-500/10"
                        style={{ color: 'rgb(var(--color-text-muted))' }}
                        whileHover={{ scale: 1.1, color: '#ef4444' }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Editor Panel */}
      <div className="lg:col-span-2">
        {selectedPersona ? (
          <div
            className="rounded-xl p-6"
            style={{
              background: 'rgba(var(--color-bg-elevated), 0.8)',
              border: '1px solid rgba(var(--color-border), 0.3)'
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div
                  className="p-2 rounded-lg"
                  style={{ background: 'rgba(var(--color-accent), 0.1)' }}
                >
                  <Settings className="w-5 h-5" style={{ color: 'rgb(var(--color-accent))' }} />
                </div>
                <div>
                  <h2
                    className="text-lg font-semibold"
                    style={{ color: 'rgb(var(--color-text-primary))' }}
                  >
                    Edit Persona
                  </h2>
                  <p className="text-xs" style={{ color: 'rgb(var(--color-text-muted))' }}>
                    Changes auto-save after 1.5s
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Save Status */}
                <AnimatePresence mode="wait">
                  {saveStatus === 'saving' && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="flex items-center gap-1.5 text-xs"
                      style={{ color: 'rgb(var(--color-text-muted))' }}
                    >
                      <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </motion.div>
                  )}
                  {saveStatus === 'saved' && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="flex items-center gap-1.5 text-xs"
                      style={{ color: 'rgb(var(--color-arc-reactor))' }}
                    >
                      <Check className="w-3 h-3" />
                      Saved
                    </motion.div>
                  )}
                  {saveStatus === 'error' && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="flex items-center gap-1.5 text-xs text-red-400"
                    >
                      <AlertCircle className="w-3 h-3" />
                      Error
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                  style={{
                    background: 'rgb(var(--color-accent))',
                    color: 'white'
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Save className="w-4 h-4" />
                  Save
                </motion.button>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 rounded-lg text-sm"
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  color: '#f87171',
                  border: '1px solid rgba(239, 68, 68, 0.2)'
                }}
              >
                {error}
              </motion.div>
            )}

            {/* Form Fields */}
            <div className="space-y-4">
              {/* Name & Description */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgb(var(--color-text-secondary))' }}>
                    Name
                  </label>
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => {
                      setEditedName(e.target.value)
                      triggerAutoSave()
                    }}
                    className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-1"
                    style={{
                      background: 'rgba(var(--color-bg-tertiary), 0.8)',
                      color: 'rgb(var(--color-text-primary))',
                      border: '1px solid rgba(var(--color-border), 0.3)',
                    }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgb(var(--color-text-secondary))' }}>
                    Description
                  </label>
                  <input
                    type="text"
                    value={editedDescription}
                    onChange={(e) => {
                      setEditedDescription(e.target.value)
                      triggerAutoSave()
                    }}
                    className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-1"
                    style={{
                      background: 'rgba(var(--color-bg-tertiary), 0.8)',
                      color: 'rgb(var(--color-text-primary))',
                      border: '1px solid rgba(var(--color-border), 0.3)',
                    }}
                  />
                </div>
              </div>

              {/* Model Settings */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgb(var(--color-text-secondary))' }}>
                    Model
                  </label>
                  <select
                    value={editedModel}
                    onChange={(e) => {
                      setEditedModel(e.target.value)
                      triggerAutoSave()
                    }}
                    className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-1"
                    style={{
                      background: 'rgba(var(--color-bg-tertiary), 0.8)',
                      color: 'rgb(var(--color-text-primary))',
                      border: '1px solid rgba(var(--color-border), 0.3)',
                    }}
                  >
                    <option value="gpt-4o">GPT-4o</option>
                    <option value="gpt-4o-mini">GPT-4o Mini</option>
                    <option value="gpt-4-turbo">GPT-4 Turbo</option>
                    <option value="claude-3-5-sonnet-20241022">Claude 3.5 Sonnet</option>
                    <option value="claude-3-opus-20240229">Claude 3 Opus</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgb(var(--color-text-secondary))' }}>
                    Temperature: {editedTemperature}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={editedTemperature}
                    onChange={(e) => {
                      setEditedTemperature(parseFloat(e.target.value))
                      triggerAutoSave()
                    }}
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                    style={{ background: 'rgba(var(--color-border), 0.5)' }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgb(var(--color-text-secondary))' }}>
                    Max Tokens
                  </label>
                  <input
                    type="number"
                    value={editedMaxTokens}
                    onChange={(e) => {
                      setEditedMaxTokens(parseInt(e.target.value) || 2000)
                      triggerAutoSave()
                    }}
                    className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-1"
                    style={{
                      background: 'rgba(var(--color-bg-tertiary), 0.8)',
                      color: 'rgb(var(--color-text-primary))',
                      border: '1px solid rgba(var(--color-border), 0.3)',
                    }}
                  />
                </div>
              </div>

              {/* System Prompt */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium" style={{ color: 'rgb(var(--color-text-secondary))' }}>
                    System Prompt
                  </label>
                  <span className="text-xs" style={{ color: 'rgb(var(--color-text-muted))' }}>
                    {editedPrompt.length} characters
                  </span>
                </div>
                <textarea
                  value={editedPrompt}
                  onChange={(e) => {
                    setEditedPrompt(e.target.value)
                    triggerAutoSave()
                  }}
                  rows={12}
                  className="w-full px-3 py-2 rounded-lg text-sm font-mono focus:outline-none focus:ring-1 resize-none"
                  style={{
                    background: 'rgba(var(--color-bg-tertiary), 0.8)',
                    color: 'rgb(var(--color-text-primary))',
                    border: '1px solid rgba(var(--color-border), 0.3)',
                    lineHeight: '1.6',
                  }}
                  placeholder="Enter the system prompt that defines the persona's behavior..."
                />
              </div>
            </div>
          </div>
        ) : (
          <div
            className="rounded-xl p-12 flex flex-col items-center justify-center"
            style={{
              background: 'rgba(var(--color-bg-elevated), 0.8)',
              border: '1px solid rgba(var(--color-border), 0.3)'
            }}
          >
            <FileJson className="w-12 h-12 mb-4" style={{ color: 'rgb(var(--color-text-muted))' }} />
            <p
              className="text-sm"
              style={{ color: 'rgb(var(--color-text-tertiary))' }}
            >
              Select a persona to edit or create a new one
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
