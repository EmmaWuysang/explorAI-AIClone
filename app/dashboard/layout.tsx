'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import AssistantChat from '@/components/ai/AssistantChat';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navItems = [
    { name: 'Client View', href: '/dashboard/client', icon: '👤' },
    { name: 'Doctor View', href: '/dashboard/doctor', icon: '👨‍⚕️' },
    { name: 'Pharmacist View', href: '/dashboard/pharmacist', icon: '💊' },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-transparent">
      {/* Sidebar */}
      <motion.aside 
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="w-64 m-4 glass-panel rounded-2xl flex flex-col hidden md:flex"
      >
        <div className="p-6">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
            MedAssist AI
          </h1>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200/50 dark:border-blue-700/30' 
                    : 'text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-white/5'
                }`}>
                  <span className="text-xl">{item.icon}</span>
                  <span className="font-medium">{item.name}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 mt-auto">
          <div className="glass-card p-4 flex items-center gap-3 bg-white/30 dark:bg-black/20 border-none">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg">
              U
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 dark:text-white">User Name</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Settings</p>
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Mobile Header */}
        <header className="h-16 glass-panel m-4 mb-0 flex items-center justify-between px-6 md:hidden rounded-xl">
          <h1 className="text-xl font-bold text-blue-600 dark:text-blue-400">MedAssist AI</h1>
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-6">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </div>
      </main>
      
      <AssistantChat />
    </div>
  );
}
