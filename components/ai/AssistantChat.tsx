'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Send, X, Minimize2, Maximize2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import { usePathname } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function AssistantChat() {
// ... existing code ...

  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'assistant', content: string}[]>([
    { role: 'assistant', content: 'Hello! I am your AI assistant. How can I help you within this dashboard?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const getDashboardContext = () => {
      if (pathname?.includes('/client')) return 'Client Dashboard (Patient View)';
      if (pathname?.includes('/doctor')) return 'Doctor Dashboard (Provider View)';
      if (pathname?.includes('/pharmacist')) return 'Pharmacist Dashboard (Inventory View)';
      return 'General Application';
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMessage = input.trim();
    const newMessages = [
      ...messages,
      { role: 'user' as const, content: userMessage }
    ];
    setMessages(newMessages);
    setInput('');
    setIsTyping(true);

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: userMessage,
                conversationHistory: messages.map(m => ({ role: m.role, content: m.content })),
                dashboardContext: getDashboardContext()
            })
        });

        if (!response.ok) throw new Error('Failed to send message');

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let assistantMessage = '';
        
        // Add placeholder message
        setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

        if (reader) {
            let buffer = '';
            
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                
                const chunk = decoder.decode(value, { stream: true });
                buffer += chunk;
                
                const lines = buffer.split('\n');
                
                // Keep the last part which might be incomplete
                buffer = lines.pop() || '';
                
                for (const line of lines) {
                    if (line.trim().startsWith('data: ')) {
                        const data = line.trim().slice(6);
                        if (data === '[DONE]') continue;
                        
                        try {
                            const parsed = JSON.parse(data);
                            if (parsed.error) {
                                console.error('AI Error:', parsed.error);
                                setMessages(prev => {
                                    const updated = [...prev];
                                    updated[updated.length - 1] = { 
                                        role: 'assistant', 
                                        content: `Error: ${parsed.error}` 
                                    };
                                    return updated;
                                });
                            } else if (parsed.content) {
                                assistantMessage += parsed.content;
                                setMessages(prev => {
                                    const updated = [...prev];
                                    updated[updated.length - 1] = { role: 'assistant', content: assistantMessage };
                                    return updated;
                                });
                            }
                        } catch (e) {
                            console.error('Error parsing chunk', e);
                        }
                    }
                }
            }
        }
    } catch (error) {
        console.error(error);
        setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I encountered an error. Please try again." }]);
    } finally {
        setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      <AnimatePresence mode="wait">
        {isOpen ? (
          <motion.div
            layoutId="chat-window"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              y: 0,
              width: isExpanded ? '600px' : '384px',
              height: isExpanded ? '80vh' : '600px'
            }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            className="glass-panel rounded-3xl overflow-hidden flex flex-col shadow-2xl border-white/40 dark:border-white/10"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <Sparkles size={16} className="text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm">MedAssist AI</h3>
                  <p className="text-blue-100 text-xs flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Online &bull; {getDashboardContext().split(' ')[0]}
                  </p>
                </div>
              </div>
              <div className="flex gap-1">
                <button 
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  title={isExpanded ? "Minimize" : "Maximize"}
                >
                  {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  title="Close"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
            
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50/50 dark:bg-slate-900/50 scroll-smooth">
              {messages.map((msg, idx) => (
                <motion.div 
                  key={idx} 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] rounded-2xl px-5 py-3.5 shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-blue-600 text-white rounded-br-none' 
                      : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none border border-slate-100 dark:border-slate-700'
                  }`}>

<div className={`text-sm leading-relaxed ${
  msg.role === 'user' ? 'text-white' : 'text-slate-800 dark:text-slate-200'
}`}>
  <ReactMarkdown 
    remarkPlugins={[remarkGfm]}
    components={{
      p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
      ul: ({node, ...props}) => <ul className="list-disc ml-4 mb-2" {...props} />,
      ol: ({node, ...props}) => <ol className="list-decimal ml-4 mb-2" {...props} />,
      li: ({node, ...props}) => <li className="mb-0.5" {...props} />,
      a: ({node, ...props}) => <a className="underline hover:opacity-80 transition-opacity" target="_blank" rel="noopener noreferrer" {...props} />,
      code: ({node, className, children, ...props}: any) => {
        const match = /language-(\w+)/.exec(className || '')
        const isInline = !match && !String(children).includes('\n');
        return !isInline ? (
          <div className="bg-slate-950 text-slate-50 rounded-lg p-3 my-2 text-xs overflow-x-auto font-mono">
            <code className={className} {...props}>
              {children}
            </code>
          </div>
        ) : (
          <code className="bg-black/10 dark:bg-white/10 rounded px-1 py-0.5 text-xs font-mono" {...props}>
            {children}
          </code>
        )
      }
    }}
  >
    {msg.content}
  </ReactMarkdown>
</div>
                  </div>
                </motion.div>
              ))}
              
              {isTyping && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="bg-white dark:bg-slate-800 rounded-2xl rounded-bl-none px-4 py-3 border border-slate-100 dark:border-slate-700 flex gap-1.5 items-center">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700">
              <div className="flex gap-2 relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder={`Ask regarding ${getDashboardContext().toLowerCase()}...`}
                  className="flex-1 px-4 py-3 pr-12 rounded-xl bg-slate-50 dark:bg-slate-900 border-none focus:ring-2 focus:ring-blue-500 text-sm transition-all"
                />
                <Button 
                  onClick={handleSend}
                  disabled={!input.trim() || isTyping}
                  size="sm"
                  variant="primary"
                  className="absolute right-1.5 top-1.5 !p-2 rounded-lg aspect-square"
                >
                  <Send size={16} />
                </Button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.button
            layoutId="chat-window"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="group flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full shadow-lg shadow-blue-600/30 text-white border border-white/20"
          >
            <Sparkles size={20} className="group-hover:rotate-12 transition-transform" />
            <span className="font-medium">Ask AI</span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
