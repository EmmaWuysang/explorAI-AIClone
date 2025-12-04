'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import AssistantChat from '@/components/ai/AssistantChat';
import { LayoutDashboard, Stethoscope, Pill, Settings, LogOut, User } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navItems = [
    { name: 'Patient View', href: '/dashboard/client', icon: LayoutDashboard },
    { name: 'Doctor Portal', href: '/dashboard/doctor', icon: Stethoscope },
    { name: 'Pharmacy', href: '/dashboard/pharmacist', icon: Pill },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-transparent font-sans text-slate-900 dark:text-slate-50">
      {/* Premium Floating Sidebar */}
      <motion.aside 
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.19, 1, 0.22, 1] }} // ease-out-expo
        className="w-72 m-4 glass-panel rounded-3xl flex flex-col hidden md:flex border-white/40 dark:border-white/10 shadow-2xl z-20"
      >
        <div className="p-8 pb-4">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <span className="text-xl">✨</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              MedAssist<span className="text-blue-500">.ai</span>
            </h1>
          </div>
          
          <div className="h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent mb-6" />
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className="block relative group">
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <div className={`relative flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'text-blue-600 dark:text-blue-400 font-medium' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}>
                  <Icon size={20} className={isActive ? 'stroke-[2.5px]' : 'stroke-[2px]'} />
                  <span>{item.name}</span>
                  {isActive && (
                    <motion.div 
                      initial={{ scale: 0 }} 
                      animate={{ scale: 1 }}
                      className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" 
                    />
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 mt-auto">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 border border-white/50 dark:border-white/5 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden border-2 border-white dark:border-slate-600">
                <User size={20} className="text-slate-500 dark:text-slate-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">Dr. Strange</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">Pro Plan</p>
              </div>
            </div>
            <div className="flex gap-1">
              <button className="flex-1 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 transition-colors">
                <Settings size={16} className="mx-auto" />
              </button>
              <button className="flex-1 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-500 hover:text-red-500 transition-colors">
                <LogOut size={16} className="mx-auto" />
              </button>
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative z-10">
        {/* Mobile Header */}
        <header className="h-16 glass-panel m-4 mb-0 flex items-center justify-between px-6 md:hidden rounded-2xl">
          <h1 className="text-lg font-bold text-slate-900 dark:text-white">MedAssist.ai</h1>
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-8 scroll-smooth">
          <div className="max-w-7xl mx-auto w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                transition={{ duration: 0.4, ease: [0.19, 1, 0.22, 1] }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>
      
      <AssistantChat />
    </div>
  );
}
