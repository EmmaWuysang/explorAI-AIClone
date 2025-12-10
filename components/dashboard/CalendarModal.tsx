'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/ui/GlassCard';
import { ChevronLeft, ChevronRight, X, Clock, MapPin, Video } from 'lucide-react';
import Button from '@/components/ui/Button';

interface CalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointments: any[];
}

export default function CalendarModal({ isOpen, onClose, appointments }: CalendarModalProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Reset to today when opening
  useEffect(() => {
    if (isOpen) {
      const today = new Date();
      setSelectedDate(today);
      setCurrentDate(today);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Calendar Logic
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month, 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const isSameDay = (d1: Date, d2: Date) => {
    return d1.getDate() === d2.getDate() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getFullYear() === d2.getFullYear();
  };

  // Filter appointments for the month to show dots
  const getAppointmentsForDay = (day: number) => {
    return appointments.filter(apt => {
      const aptDate = new Date(apt.date);
      return aptDate.getDate() === day &&
             aptDate.getMonth() === currentDate.getMonth() &&
             aptDate.getFullYear() === currentDate.getFullYear();
    });
  };

  // Selected Day Appointments
  const selectedDayAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.date);
    return isSameDay(aptDate, selectedDate);
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg"
      >
        <GlassCard className="flex flex-col max-h-[85vh] overflow-hidden p-0">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Schedule</h3>
                    <p className="text-sm text-slate-500">{monthName} {year}</p>
                </div>
                <button 
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X size={20} />
                </button>
            </div>

            {/* Calendar Grid */}
            <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <button onClick={handlePrevMonth} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
                        <ChevronLeft size={20} />
                    </button>
                    <span className="font-bold text-slate-900 dark:text-white">{monthName} {year}</span>
                    <button onClick={handleNextMonth} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
                        <ChevronRight size={20} />
                    </button>
                </div>

                <div className="grid grid-cols-7 gap-2 text-center mb-2">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                        <div key={i} className="text-xs font-bold text-slate-400">{d}</div>
                    ))}
                </div>

                <div className="grid grid-cols-7 gap-2">
                    {Array.from({ length: firstDay }).map((_, i) => (
                        <div key={`empty-${i}`} />
                    ))}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                        const day = i + 1;
                        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                        const isSelected = isSameDay(date, selectedDate);
                        const isToday = isSameDay(date, new Date());
                        const dayAppts = getAppointmentsForDay(day);
                        const hasAppts = dayAppts.length > 0;

                        return (
                            <button
                                key={day}
                                onClick={() => setSelectedDate(date)}
                                className={`
                                    relative h-10 w-10 rounded-full flex items-center justify-center text-sm transition-all
                                    ${isSelected ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 
                                      isToday ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 font-bold' : 
                                      'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}
                                `}
                            >
                                {day}
                                {hasAppts && !isSelected && (
                                    <span className="absolute bottom-1 w-1 h-1 rounded-full bg-blue-500"></span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Selected Day Agenda */}
            <div className="flex-1 bg-slate-50 dark:bg-slate-900/50 p-6 border-t border-slate-200 dark:border-slate-700 overflow-y-auto custom-scrollbar">
                <h4 className="font-bold text-slate-900 dark:text-white mb-4">
                    {selectedDate.toLocaleDateString('default', { weekday: 'long', month: 'long', day: 'numeric' })}
                </h4>
                
                {selectedDayAppointments.length > 0 ? (
                    <div className="space-y-3">
                        {selectedDayAppointments.map((apt: any) => (
                            <div key={apt.id} className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm flex gap-4">
                                <div className="flex flex-col items-center justify-center w-20 bg-blue-50 dark:bg-blue-900/20 rounded-lg shrink-0 p-2">
                                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400 text-center leading-tight">
                                        {new Date(apt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <div className="flex-1">
                                    <h5 className="font-bold text-slate-900 dark:text-white text-sm">{apt.doctor.name}</h5>
                                    <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                                        {apt.type === 'video' ? <Video size={12} /> : <MapPin size={12} />}
                                        <span className="capitalize">{apt.type} Consultation</span>
                                    </div>
                                    <div className={`mt-2 text-xs px-2 py-0.5 rounded-full w-fit ${
                                        apt.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                                    }`}>
                                        {apt.status}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-slate-400 text-sm">
                        No appointments for this day.
                    </div>
                )}
            </div>
            
            <div className="p-4 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700">
                <Button variant="primary" className="w-full justify-center" onClick={() => {
                   // In a real app, this would open the booking flow
                   onClose();
                   // Could trigger a callback to open booking modal if passed
                }}>
                    Schedule Appointment
                </Button>
            </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
