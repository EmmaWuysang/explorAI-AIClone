'use client'

import { useState, useEffect, FormEvent } from 'react'
import { Persona } from '@/lib/persona-manager'

export default function PersonaEditor() {
  const [personas, setPersonas] = useState<Persona[]>([])
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null)
  const [editingPersona, setEditingPersona] = useState<Persona | null>(null)
  const [jsonText, setJsonText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    fetchPersonas()
  }, [])

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
      setSelectedPersona(data.persona)
      setEditingPersona(data.persona)
      setJsonText(JSON.stringify(data.persona, null, 2))
      setError(null)
    } catch (error) {
      setError('Failed to load persona')
    }
  }

  const handleCreateNew = () => {
    const newPersona: Persona = {
      id: `persona-${Date.now()}`,
      name: 'New Persona',
      description: '',
      systemPrompt: 'You are a helpful AI assistant.',
      temperature: 0.7,
      maxTokens: 1000,
      model: 'gpt-4o-mini',
      personality: {
        tone: 'friendly',
        style: 'conversational',
        formality: 'casual',
      },
    }
    setEditingPersona(newPersona)
    setSelectedPersona(newPersona)
    setJsonText(JSON.stringify(newPersona, null, 2))
    setError(null)
  }

  const handleSave = async (e: FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const parsed = JSON.parse(jsonText)
      
      if (!parsed.id || !parsed.name || !parsed.systemPrompt) {
        throw new Error('Persona must have id, name, and systemPrompt')
      }

      const response = await fetch('/api/personas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(parsed),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save persona')
      }

      setSuccess('Persona saved successfully!')
      setEditingPersona(parsed)
      setSelectedPersona(parsed)
      await fetchPersonas()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Invalid JSON or save failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this persona?')) {
      return
    }

    try {
      const response = await fetch(`/api/personas?id=${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete persona')
      }

      setSuccess('Persona deleted successfully!')
      setSelectedPersona(null)
      setEditingPersona(null)
      setJsonText('')
      await fetchPersonas()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete persona')
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          AI Persona Editor
        </h2>
        <button
          onClick={handleCreateNew}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
        >
          Create New
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Persona List */}
        <div>
          <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
            Available Personas
          </h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {personas.map((persona) => (
              <div
                key={persona.id}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedPersona?.id === persona.id
                    ? 'bg-blue-100 dark:bg-blue-900 border-blue-500'
                    : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
                onClick={() => handleSelectPersona(persona.id)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {persona.name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {persona.description || 'No description'}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(persona.id)
                    }}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* JSON Editor */}
        <div>
          <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
            Edit Persona JSON
          </h3>
          {editingPersona && (
            <form onSubmit={handleSave} className="space-y-4">
              <textarea
                value={jsonText}
                onChange={(e) => setJsonText(e.target.value)}
                className="w-full h-96 p-3 border border-gray-300 dark:border-gray-600 rounded-lg font-mono text-sm bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Paste or edit persona JSON here..."
              />
              {error && (
                <div className="p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-lg text-sm">
                  {error}
                </div>
              )}
              {success && (
                <div className="p-3 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-lg text-sm">
                  {success}
                </div>
              )}
              <div className="flex space-x-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? 'Saving...' : 'Save Persona'}
                </button>
              </div>
            </form>
          )}
          {!editingPersona && (
            <div className="text-center text-gray-500 dark:text-gray-400 py-12">
              Select a persona to edit or create a new one
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

