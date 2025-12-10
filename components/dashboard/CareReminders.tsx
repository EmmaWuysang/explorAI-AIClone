
'use client';

import React, { useState, useEffect } from 'react';
import GlassCard from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import { Users, Clock, Calendar, MessageSquare, ArrowRight, RefreshCw, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAllClients } from '@/lib/actions/user';

interface CareRemindersProps {
    onMessage?: (patientId: string) => void;
}

export default function CareReminders({ onMessage }: CareRemindersProps) {
    const [reminders, setReminders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState<string | null>(null);

    const fetchReminders = async () => {
        setLoading(true);
        try {
            // Fetch patients to analyze
            const res = await getAllClients();
            if (res.success && res.data) {
                // Mock Analysis: Randomly select "overdue" patients
                const allPatients = res.data;
                const overdue = allPatients
                    .sort(() => 0.5 - Math.random()) // Shuffle
                    .slice(0, 3) // Take 3
                    .map((p: any) => ({
                        id: p.id,
                        name: p.name,
                        reason: Math.random() > 0.5 ? 'Overdue for Checkup' : 'Prescription Expiring Soon',
                        lastVisit: new Date(Date.now() - Math.random() * 10000000000).toLocaleDateString(),
                        urgency: Math.random() > 0.7 ? 'High' : 'Medium' 
                    }));
                setReminders(overdue);
            }
        } catch (error) {
            console.error("Failed to generate care reminders", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReminders();
    }, []);

    const handleAction = async (id: string, action: 'schedule' | 'message') => {
        setProcessing(id);
        
        if (action === 'message' && onMessage) {
            onMessage(id);
            setProcessing(null);
            return;
        }

        // Simulate API for schedule
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Remove from list
        setReminders(prev => prev.filter(r => r.id !== id));
        setProcessing(null);
    };

    return (
        <GlassCard className="border-blue-100 dark:border-blue-900/30 bg-blue-50/50 dark:bg-blue-900/10">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Users className="text-blue-600" size={20} />
                    Care Reminders
                </h3>
                <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={fetchReminders}
                    className={loading ? 'animate-spin' : ''}
                >
                    <RefreshCw size={16} />
                </Button>
            </div>

            {loading ? (
                <div className="space-y-3">
                    {[1, 2].map(i => (
                        <div key={i} className="h-20 bg-white/50 dark:bg-slate-800/50 rounded-xl animate-pulse" />
                    ))}
                </div>
            ) : reminders.length > 0 ? (
                <div className="space-y-3">
                    <AnimatePresence>
                        {reminders.map((reminder) => (
                            <motion.div
                                key={reminder.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, height: 0 }}
                                className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-blue-100 dark:border-blue-800/30 shadow-sm"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h4 className="font-bold text-slate-900 dark:text-white">
                                            {reminder.name}
                                        </h4>
                                        <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                                            <Clock size={12} /> Last visit: {reminder.lastVisit}
                                        </p>
                                    </div>
                                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                        reminder.urgency === 'High' 
                                            ? 'bg-red-100 text-red-600' 
                                            : 'bg-amber-100 text-amber-600'
                                    }`}>
                                        {reminder.urgency}
                                    </span>
                                </div>
                                
                                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                                    {reminder.reason}
                                </p>
                                
                                <div className="grid grid-cols-2 gap-2">
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        className="h-8 text-xs justify-center"
                                        onClick={() => handleAction(reminder.id, 'message')}
                                        disabled={!!processing}
                                    >
                                        <MessageSquare size={12} className="mr-1" />
                                        Message
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="primary"
                                        className="h-8 text-xs justify-center"
                                        onClick={() => handleAction(reminder.id, 'schedule')}
                                        disabled={!!processing}
                                    >
                                        {processing === reminder.id ? (
                                            <RefreshCw className="animate-spin w-3 h-3" />
                                        ) : (
                                            <>
                                                <Calendar size={12} className="mr-1" />
                                                Schedule
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            ) : (
                <div className="text-center py-8 text-slate-500 text-sm">
                    <Check className="w-8 h-8 text-green-500 mx-auto mb-2" />
                    All patients up to date.
                </div>
            )}
        </GlassCard>
    );
}
