'use client';

import React, { useState, useEffect, useRef } from 'react';
import { sendMessage, getMessages } from '@/lib/actions/chat';
import Button from '@/components/ui/Button';
import { Send, User as UserIcon } from 'lucide-react';

interface ChatProps {
    currentUser: { id: string; name: string };
    otherUser: { id: string; name: string; avatarUrl?: string | null };
    className?: string;
}

export default function ChatInterface({ currentUser, otherUser, className = '' }: ChatProps) {
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const fetchMessages = React.useCallback(async () => {
        const res = await getMessages(currentUser.id, otherUser.id);
        if (res.success) {
            setMessages(res.data || []);
        }
    }, [currentUser.id, otherUser.id]);

    useEffect(() => {
        fetchMessages();
        // Poll for new messages every 3 seconds
        const interval = setInterval(fetchMessages, 3000);
        return () => clearInterval(interval);
    }, [fetchMessages]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (!newMessage.trim()) return;
        setSending(true);
        try {
            const res = await sendMessage(currentUser.id, otherUser.id, newMessage);
            if (res.success) {
                setNewMessage('');
                fetchMessages(); // Refresh immediately
            }
        } catch (error) {
            console.error(error);
        } finally {
            setSending(false);
        }
    };

    return (
        <div className={`flex flex-col h-[500px] bg-white dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 ${className}`}>
            {/* Header */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center overflow-hidden">
                    {otherUser.avatarUrl ? (
                         // eslint-disable-next-line @next/next/no-img-element
                        <img src={otherUser.avatarUrl} alt={otherUser.name} className="w-full h-full object-cover" />
                    ) : (
                        <UserIcon className="text-blue-500" />
                    )}
                </div>
                <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">{otherUser.name}</h3>
                    <p className="text-xs text-green-500 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-green-500" />
                        Online
                    </p>
                </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {messages.length === 0 ? (
                    <div className="text-center text-slate-400 mt-10">
                        <p>No messages yet.</p>
                        <p className="text-sm">Start the conversation!</p>
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isMe = msg.senderId === currentUser.id;
                        return (
                            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div className={`
                                    max-w-[80%] p-3 rounded-2xl 
                                    ${isMe 
                                        ? 'bg-blue-600 text-white rounded-tr-none' 
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none'}
                                `}>
                                    <p className="text-sm">{msg.content}</p>
                                    <p className={`text-[10px] mt-1 ${isMe ? 'text-blue-200' : 'text-slate-400'}`}>
                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Input */}
            <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-700 flex gap-2">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Type a message..."
                    className="flex-1 p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                    disabled={sending}
                />
                <Button 
                    variant="primary" 
                    onClick={handleSend}
                    disabled={sending || !newMessage.trim()}
                    className="px-4"
                >
                    {sending ? '...' : <Send size={18} />}
                </Button>
            </div>
        </div>
    );
}
