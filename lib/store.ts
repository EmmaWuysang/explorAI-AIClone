import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  toolCalls?: ToolCall[];
}

export interface ToolCall {
  id: string;
  tool: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  input?: Record<string, unknown>;
  output?: unknown;
  error?: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
  personaId?: string;
}

export interface AgentStatus {
  isThinking: boolean;
  isUsingTool: boolean;
  currentTool?: string;
  toolProgress?: string;
}

export interface Persona {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
  model: string;
}

interface AppState {
  // Conversations
  conversations: Conversation[];
  activeConversationId: string | null;

  // Persona
  activePersonaId: string;

  // Agent Status
  agentStatus: AgentStatus;

  // UI State
  isStreaming: boolean;
  streamingMessageId: string | null;

  // Actions
  createConversation: (personaId?: string) => string;
  deleteConversation: (id: string) => void;
  setActiveConversation: (id: string) => void;

  addMessage: (conversationId: string, message: Omit<Message, 'id' | 'timestamp'>) => void;
  updateMessage: (conversationId: string, messageId: string, content: string) => void;
  deleteMessage: (conversationId: string, messageId: string) => void;

  setAgentStatus: (status: Partial<AgentStatus>) => void;
  setIsStreaming: (isStreaming: boolean, messageId?: string) => void;

  setActivePersona: (personaId: string) => void;

  addToolCall: (conversationId: string, messageId: string, toolCall: ToolCall) => void;
  updateToolCall: (conversationId: string, messageId: string, toolCallId: string, update: Partial<ToolCall>) => void;

  clearAllConversations: () => void;
  cleanupEmptyConversations: () => void;
}

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial State
      conversations: [],
      activeConversationId: null,
      activePersonaId: 'tony-stark',
      agentStatus: {
        isThinking: false,
        isUsingTool: false,
      },
      isStreaming: false,
      streamingMessageId: null,

      // Actions
      createConversation: (personaId?: string) => {
        const id = generateId();
        const conversation: Conversation = {
          id,
          title: 'New Conversation',
          messages: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
          personaId,
        };

        set((state) => ({
          conversations: [conversation, ...state.conversations],
          activeConversationId: id,
        }));

        return id;
      },

      deleteConversation: (id: string) => {
        set((state) => {
          const filtered = state.conversations.filter((c) => c.id !== id);
          const newActiveId = state.activeConversationId === id
            ? filtered[0]?.id || null
            : state.activeConversationId;

          return {
            conversations: filtered,
            activeConversationId: newActiveId,
          };
        });
      },

      setActiveConversation: (id: string) => {
        set({ activeConversationId: id });
      },

      addMessage: (conversationId: string, message: Omit<Message, 'id' | 'timestamp'>) => {
        const newMessage: Message = {
          ...message,
          id: generateId(),
          timestamp: Date.now(),
        };

        set((state) => ({
          conversations: state.conversations.map((conv) =>
            conv.id === conversationId
              ? {
                  ...conv,
                  messages: [...conv.messages, newMessage],
                  updatedAt: Date.now(),
                  // Auto-generate title from first user message
                  title: conv.messages.length === 0 && message.role === 'user'
                    ? message.content.slice(0, 50) + (message.content.length > 50 ? '...' : '')
                    : conv.title,
                }
              : conv
          ),
        }));
      },

      updateMessage: (conversationId: string, messageId: string, content: string) => {
        set((state) => ({
          conversations: state.conversations.map((conv) =>
            conv.id === conversationId
              ? {
                  ...conv,
                  messages: conv.messages.map((msg) =>
                    msg.id === messageId ? { ...msg, content } : msg
                  ),
                  updatedAt: Date.now(),
                }
              : conv
          ),
        }));
      },

      deleteMessage: (conversationId: string, messageId: string) => {
        set((state) => ({
          conversations: state.conversations.map((conv) =>
            conv.id === conversationId
              ? {
                  ...conv,
                  messages: conv.messages.filter((msg) => msg.id !== messageId),
                  updatedAt: Date.now(),
                }
              : conv
          ),
        }));
      },

      setAgentStatus: (status: Partial<AgentStatus>) => {
        set((state) => ({
          agentStatus: { ...state.agentStatus, ...status },
        }));
      },

      setIsStreaming: (isStreaming: boolean, messageId?: string) => {
        set({ isStreaming, streamingMessageId: messageId || null });
      },

      setActivePersona: (personaId: string) => {
        set({ activePersonaId: personaId });
      },

      addToolCall: (conversationId: string, messageId: string, toolCall: ToolCall) => {
        set((state) => ({
          conversations: state.conversations.map((conv) =>
            conv.id === conversationId
              ? {
                  ...conv,
                  messages: conv.messages.map((msg) =>
                    msg.id === messageId
                      ? { ...msg, toolCalls: [...(msg.toolCalls || []), toolCall] }
                      : msg
                  ),
                }
              : conv
          ),
        }));
      },

      updateToolCall: (
        conversationId: string,
        messageId: string,
        toolCallId: string,
        update: Partial<ToolCall>
      ) => {
        set((state) => ({
          conversations: state.conversations.map((conv) =>
            conv.id === conversationId
              ? {
                  ...conv,
                  messages: conv.messages.map((msg) =>
                    msg.id === messageId
                      ? {
                          ...msg,
                          toolCalls: msg.toolCalls?.map((tc) =>
                            tc.id === toolCallId ? { ...tc, ...update } : tc
                          ),
                        }
                      : msg
                  ),
                }
              : conv
          ),
        }));
      },

      clearAllConversations: () => {
        set({ conversations: [], activeConversationId: null });
      },

      cleanupEmptyConversations: () => {
        set((state) => {
          // Filter out conversations with no user messages
          const nonEmptyConversations = state.conversations.filter((conv) =>
            conv.messages.some((msg) => msg.role === 'user')
          );

          // If active conversation was deleted, select the first remaining one
          const activeWasDeleted = !nonEmptyConversations.some(
            (c) => c.id === state.activeConversationId
          );

          return {
            conversations: nonEmptyConversations,
            activeConversationId: activeWasDeleted
              ? nonEmptyConversations[0]?.id || null
              : state.activeConversationId,
          };
        });
      },
    }),
    {
      name: 'explorAI-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        conversations: state.conversations,
        activeConversationId: state.activeConversationId,
        activePersonaId: state.activePersonaId,
      }),
    }
  )
);

// Selectors for optimized access
export const useActiveConversation = () => {
  const conversations = useStore((state) => state.conversations);
  const activeId = useStore((state) => state.activeConversationId);
  return conversations.find((c) => c.id === activeId);
};

export const useConversationMessages = (conversationId: string | null) => {
  return useStore((state) =>
    state.conversations.find((c) => c.id === conversationId)?.messages || []
  );
};
