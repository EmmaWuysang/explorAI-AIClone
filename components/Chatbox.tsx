'use client';

import { useState, FormEvent, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, Copy, Activity } from 'lucide-react';
import { useStore } from '@/lib/store';

interface StreamingMessage {
  id: string;
  text: string;
  isComplete: boolean;
}


const MessageBubble = ({ message, isUser }: { message: any; isUser: boolean }) => {
  const [showActions, setShowActions] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(message.content);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} group`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div
        className={`max-w-[85%] rounded-md px-5 py-3 relative ${
          isUser
            ? 'arc-button'
            : 'hud-panel'
        }`}
      >
        {!isUser && (
          <div className="flex items-center gap-2 mb-2">
            <div className="power-indicator" style={{ width: '6px', height: '6px' }} />
            <span className="diagnostic-text text-xs" style={{ color: 'rgb(var(--color-stark-gold))' }}>
              TONY STARK
            </span>
          </div>
        )}
        <p
          className={`text-sm leading-relaxed whitespace-pre-wrap break-words ${
            isUser ? '' : 'diagnostic-text'
          }`}
          style={{ color: isUser ? 'rgb(var(--color-arc-reactor))' : 'rgb(var(--color-text-secondary))' }}
        >
          {message.content}
        </p>
        <p
          className="text-xs mt-2 diagnostic-text"
          style={{ color: isUser ? 'rgba(var(--color-arc-reactor), 0.6)' : 'rgb(var(--color-text-muted))' }}
        >
          {new Date(message.timestamp).toLocaleTimeString()}
        </p>

        {/* Action Buttons */}
        <AnimatePresence>
          {showActions && !isUser && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              onClick={copyToClipboard}
              className="absolute -left-12 top-1/2 -translate-y-1/2 p-2 rounded-md hud-panel cursor-pointer"
              title="Copy message"
            >
              <Copy className="w-4 h-4" style={{ color: 'rgb(var(--color-arc-reactor))' }} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default function Chatbox() {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState<StreamingMessage | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    conversations,
    activeConversationId,
    createConversation,
    addMessage,
    setAgentStatus,
    setIsStreaming,
  } = useStore();

  const activeConversation = conversations.find((c) => c.id === activeConversationId);
  const messages = useMemo(() => activeConversation?.messages || [], [activeConversation]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage]);

  useEffect(() => {
    // Create initial conversation if none exists
    if (conversations.length === 0) {
      createConversation('tony-stark');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!input.trim() || isLoading) return;

    let conversationId = activeConversationId;
    if (!conversationId) {
      conversationId = createConversation('tony-stark');
    }

    const userMessageContent = input.trim();
    setInput('');
    setIsLoading(true);
    setAgentStatus({ isThinking: true });

    // Add user message
    addMessage(conversationId, {
      role: 'user',
      content: userMessageContent,
    });

    const streamId = `${Date.now()}-stream`;
    setStreamingMessage({
      id: streamId,
      text: '',
      isComplete: false,
    });

    setIsStreaming(true, streamId);

    try {
      const conversationHistory = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessageContent,
          personaId: 'tony-stark',
          conversationHistory,
        }),
      });

      if (!response.ok) {
        let errorMessage = `Failed to get response (${response.status})`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = '';

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          if (accumulatedText.trim()) {
            addMessage(conversationId!, {
              role: 'assistant',
              content: accumulatedText,
            });
          }
          setStreamingMessage(null);
          setIsLoading(false);
          setAgentStatus({ isThinking: false });
          setIsStreaming(false);
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();

            if (data === '[DONE]') {
              if (accumulatedText.trim()) {
                addMessage(conversationId!, {
                  role: 'assistant',
                  content: accumulatedText,
                });
              }
              setStreamingMessage(null);
              setIsLoading(false);
              setAgentStatus({ isThinking: false });
              setIsStreaming(false);
              return;
            }

            try {
              const parsed = JSON.parse(data);

              if (parsed.error) {
                addMessage(conversationId!, {
                  role: 'assistant',
                  content: parsed.error,
                });
                setStreamingMessage(null);
                setIsLoading(false);
                setAgentStatus({ isThinking: false });
                setIsStreaming(false);
                return;
              }

              if (parsed.content) {
                accumulatedText += parsed.content;
                setStreamingMessage({
                  id: streamId,
                  text: accumulatedText,
                  isComplete: false,
                });
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      addMessage(conversationId!, {
        role: 'assistant',
        content:
          error instanceof Error
            ? error.message
            : 'Sorry, there was an error processing your message. Please try again.',
      });
      setStreamingMessage(null);
      setAgentStatus({ isThinking: false });
      setIsStreaming(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full relative z-10">
      {/* Scanlines overlay */}
      <div className="scanlines" />

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 min-h-0 relative z-10">
        {messages.length === 0 && !streamingMessage ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mt-20"
          >
            <motion.div
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="inline-block mb-6"
            >
              <Activity
                className="w-16 h-16 arc-glow"
                style={{ color: 'rgb(var(--color-arc-reactor))' }}
              />
            </motion.div>
            <p
              className="text-lg hud-header mb-2"
            >
              STARK INDUSTRIES
            </p>
            <p
              className="text-sm diagnostic-text"
              style={{ color: 'rgb(var(--color-text-tertiary))' }}
            >
              Ready when you are. What do you need?
            </p>
          </motion.div>
        ) : (
          <>
            <AnimatePresence mode="popLayout">
              {messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isUser={message.role === 'user'}
                />
              ))}
            </AnimatePresence>

            {streamingMessage && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex justify-start"
              >
                <div className="max-w-[85%] rounded-md px-5 py-3 hud-panel">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="power-indicator" style={{ width: '6px', height: '6px' }} />
                    <span className="diagnostic-text text-xs" style={{ color: 'rgb(var(--color-stark-gold))' }}>
                      TONY STARK
                    </span>
                  </div>
                  <p
                    className="text-sm leading-relaxed whitespace-pre-wrap break-words diagnostic-text"
                    style={{ color: 'rgb(var(--color-text-secondary))' }}
                  >
                    {streamingMessage.text}
                    <motion.span
                      animate={{ opacity: [0, 1, 0] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="inline-block ml-1 w-1 h-4"
                      style={{ background: 'rgb(var(--color-arc-reactor))' }}
                    />
                  </p>
                </div>
              </motion.div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="shrink-0 p-4 border-t relative z-10" style={{ borderColor: 'rgba(var(--color-arc-reactor), 0.3)' }}>
        <form onSubmit={handleSubmit} className="relative">
          <div className="relative holo-border">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter command..."
              className="w-full px-5 py-4 pr-14 rounded-md diagnostic-text focus:outline-none transition-all duration-200"
              style={{
                background: 'rgba(var(--color-bg-elevated), 0.9)',
                borderColor: 'rgba(var(--color-arc-reactor), 0.4)',
                color: 'rgb(var(--color-text-primary))',
              }}
              disabled={isLoading}
            />
            <motion.button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-3 rounded-md arc-button disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: input.trim() && !isLoading ? 1.05 : 1 }}
              whileTap={{ scale: input.trim() && !isLoading ? 0.95 : 1 }}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'rgb(var(--color-arc-reactor))' }} />
              ) : (
                <Send className="w-5 h-5" style={{ color: 'rgb(var(--color-arc-reactor))' }} />
              )}
            </motion.button>
          </div>
        </form>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 flex items-center gap-3"
          >
            <div className="flex gap-1.5">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 rounded-full"
                  style={{ background: 'rgb(var(--color-arc-reactor))' }}
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.4, 1, 0.4],
                  }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </div>
            <span
              className="text-xs diagnostic-text"
              style={{ color: 'rgb(var(--color-text-tertiary))' }}
            >
              Processing request...
            </span>
          </motion.div>
        )}
      </div>
    </div>
  );
}
