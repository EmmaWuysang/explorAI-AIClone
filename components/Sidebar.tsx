'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Users,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Settings,
  Zap,
  PlusCircle,
} from 'lucide-react';
import { useStore } from '@/lib/store';

interface Persona {
  id: string;
  name: string;
  description?: string;
}

export default function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [showPersonas, setShowPersonas] = useState(false);

  // Determine if sidebar should show expanded (either not collapsed or being hovered)
  const showExpanded = !isCollapsed || isHovered;

  const {
    conversations,
    activeConversationId,
    activePersonaId,
    setActiveConversation,
    createConversation,
    deleteConversation,
    setActivePersona,
    cleanupEmptyConversations,
  } = useStore();

  // Cleanup empty conversations on mount and when conversations change
  useEffect(() => {
    cleanupEmptyConversations();
  }, [cleanupEmptyConversations]);

  useEffect(() => {
    fetchPersonas();
  }, []);

  const fetchPersonas = async () => {
    try {
      const response = await fetch('/api/personas');
      const data = await response.json();
      setPersonas(data.personas || []);
    } catch (error) {
      console.error('Error fetching personas:', error);
    }
  };

  const handleNewChat = () => {
    createConversation(activePersonaId);
  };

  const handleDeleteConversation = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Delete this conversation?')) {
      deleteConversation(id);
    }
  };

  const activePersona = personas.find(p => p.id === activePersonaId);

  return (
    <motion.aside
      initial={false}
      animate={{ width: showExpanded ? 280 : 60 }}
      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
      className="h-screen flex flex-col border-r"
      style={{
        background: 'rgb(var(--color-bg-secondary))',
        borderColor: 'rgba(var(--color-border), 0.3)',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header */}
      <div
        className="h-14 flex items-center justify-between px-3 border-b shrink-0"
        style={{ borderColor: 'rgba(var(--color-border), 0.3)' }}
      >
        {showExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2"
          >
            <div
              className="w-7 h-7 rounded-md flex items-center justify-center"
              style={{
                background: 'rgba(var(--color-accent), 0.1)',
                border: '1px solid rgba(var(--color-accent), 0.3)',
              }}
            >
              <div className="power-indicator" style={{ width: 6, height: 6 }} />
            </div>
            <span
              className="text-sm font-medium"
              style={{ color: 'rgb(var(--color-text-primary))' }}
            >
              <span style={{ opacity: 0.6 }}>(B)</span>est Team
            </span>
          </motion.div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-md hover:bg-white/5 transition-colors"
          style={{ color: 'rgb(var(--color-text-tertiary))' }}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* New Chat Button */}
      <div className="p-3 shrink-0">
        <motion.button
          onClick={handleNewChat}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg transition-colors"
          style={{
            background: 'rgba(var(--color-accent), 0.1)',
            border: '1px solid rgba(var(--color-accent), 0.2)',
            color: 'rgb(var(--color-accent))',
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Plus className="w-4 h-4" />
          {showExpanded && <span className="text-sm font-medium">New Chat</span>}
        </motion.button>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto px-3 space-y-1">
        {showExpanded && (
          <p
            className="text-xs font-medium uppercase tracking-wider px-2 py-2"
            style={{ color: 'rgb(var(--color-text-muted))' }}
          >
            Conversations
          </p>
        )}
        <AnimatePresence>
          {conversations.map((conversation) => (
            <motion.div
              key={conversation.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              onClick={() => setActiveConversation(conversation.id)}
              className={`group flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer transition-all ${
                activeConversationId === conversation.id ? 'bg-white/5' : 'hover:bg-white/5'
              }`}
              style={{
                borderLeft: activeConversationId === conversation.id
                  ? '2px solid rgb(var(--color-accent))'
                  : '2px solid transparent',
              }}
            >
              <MessageSquare
                className="w-4 h-4 shrink-0"
                style={{
                  color: activeConversationId === conversation.id
                    ? 'rgb(var(--color-accent))'
                    : 'rgb(var(--color-text-muted))',
                }}
              />
              {showExpanded && (
                <>
                  <span
                    className="flex-1 text-sm truncate"
                    style={{
                      color: activeConversationId === conversation.id
                        ? 'rgb(var(--color-text-primary))'
                        : 'rgb(var(--color-text-secondary))',
                    }}
                  >
                    {conversation.messages[0]?.content.slice(0, 30) || 'New conversation'}
                    {(conversation.messages[0]?.content.length || 0) > 30 ? '...' : ''}
                  </span>
                  <button
                    onClick={(e) => handleDeleteConversation(e, conversation.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/10 transition-all"
                    style={{ color: 'rgb(var(--color-text-muted))' }}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        {conversations.length === 0 && showExpanded && (
          <p
            className="text-xs text-center py-4"
            style={{ color: 'rgb(var(--color-text-muted))' }}
          >
            No conversations yet
          </p>
        )}
      </div>

      {/* Persona Selector */}
      <div
        className="p-3 border-t shrink-0"
        style={{ borderColor: 'rgba(var(--color-border), 0.3)' }}
      >
        {showExpanded ? (
          <div className="space-y-2">
            <p
              className="text-xs font-medium uppercase tracking-wider px-2 py-1"
              style={{ color: 'rgb(var(--color-text-muted))' }}
            >
              Active Persona
            </p>
            <button
              onClick={() => setShowPersonas(!showPersonas)}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors"
              style={{
                background: 'rgba(var(--color-accent), 0.05)',
                border: '1px solid rgba(var(--color-accent), 0.15)',
              }}
            >
              <div className="flex items-center gap-2">
                <Zap
                  className="w-4 h-4"
                  style={{ color: 'rgb(var(--color-accent))' }}
                />
                <span
                  className="text-sm font-medium"
                  style={{ color: 'rgb(var(--color-accent))' }}
                >
                  {activePersona?.name || 'Select Persona'}
                </span>
              </div>
              <ChevronRight
                className={`w-4 h-4 transition-transform ${showPersonas ? 'rotate-90' : ''}`}
                style={{ color: 'rgb(var(--color-accent))' }}
              />
            </button>

            <AnimatePresence>
              {showPersonas && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="space-y-1 pt-1">
                    {personas.map((persona) => (
                      <button
                        key={persona.id}
                        onClick={() => {
                          setActivePersona(persona.id);
                          setShowPersonas(false);
                        }}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-left transition-colors ${
                          activePersonaId === persona.id ? 'bg-white/10' : 'hover:bg-white/5'
                        }`}
                      >
                        {activePersonaId === persona.id ? (
                          <Zap
                            className="w-3 h-3"
                            style={{ color: 'rgb(var(--color-accent))' }}
                          />
                        ) : (
                          <div className="w-3 h-3" />
                        )}
                        <span
                          className="text-sm"
                          style={{
                            color: activePersonaId === persona.id
                              ? 'rgb(var(--color-accent))'
                              : 'rgb(var(--color-text-secondary))',
                          }}
                        >
                          {persona.name}
                        </span>
                      </button>
                    ))}
                    <div className="border-t mt-2 pt-2" style={{ borderColor: 'rgba(var(--color-border), 0.2)' }}>
                      <Link href="/personas">
                        <div className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-white/5 transition-colors">
                          <PlusCircle
                            className="w-3 h-3"
                            style={{ color: 'rgb(var(--color-accent))' }}
                          />
                          <span
                            className="text-sm"
                            style={{ color: 'rgb(var(--color-accent))' }}
                          >
                            Create New
                          </span>
                        </div>
                      </Link>
                      <Link href="/personas">
                        <div className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-white/5 transition-colors">
                          <Settings
                            className="w-3 h-3"
                            style={{ color: 'rgb(var(--color-text-muted))' }}
                          />
                          <span
                            className="text-sm"
                            style={{ color: 'rgb(var(--color-text-muted))' }}
                          >
                            Manage All
                          </span>
                        </div>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <button
            onClick={() => setShowPersonas(!showPersonas)}
            className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-white/5 transition-colors"
            title={activePersona?.name || 'Personas'}
          >
            <Zap
              className="w-4 h-4"
              style={{ color: 'rgb(var(--color-accent))' }}
            />
          </button>
        )}
      </div>
    </motion.aside>
  );
}
