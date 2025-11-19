'use client'

import { motion } from 'framer-motion'
import { Users } from 'lucide-react'
import PersonaEditor from '@/components/PersonaEditor'
import Sidebar from '@/components/Sidebar'

export default function PersonasPage() {
  return (
    <main className="flex h-screen overflow-hidden">
      <Sidebar />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="flex-1 flex flex-col relative overflow-hidden"
        style={{ background: 'rgb(var(--color-bg-primary))' }}
      >
        {/* Scanlines */}
        <div className="scanlines" />

        <div className="flex-1 overflow-y-auto px-6 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-2">
              <div
                className="p-2.5 rounded-lg"
                style={{ background: 'rgba(var(--color-accent), 0.1)' }}
              >
                <Users className="w-6 h-6" style={{ color: 'rgb(var(--color-accent))' }} />
              </div>
              <h1
                className="text-2xl font-bold"
                style={{ color: 'rgb(var(--color-text-primary))' }}
              >
                Persona Management
              </h1>
            </div>
            <p
              className="text-sm ml-12"
              style={{ color: 'rgb(var(--color-text-tertiary))' }}
            >
              Create and configure AI personas with custom system prompts
            </p>
          </motion.div>

          {/* Editor */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <PersonaEditor />
          </motion.div>
        </div>
      </motion.div>
    </main>
  )
}
