'use client';

import { motion } from 'framer-motion';
import Chatbox from '@/components/Chatbox';
import Sidebar from '@/components/Sidebar';

export default function Home() {
  return (
    <main className="flex h-screen overflow-hidden">
      <Sidebar />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="flex-1 flex flex-col relative"
        style={{ background: 'rgb(var(--color-bg-primary))' }}
      >
        {/* Scanlines */}
        <div className="scanlines" />

        <div className="flex-1 overflow-hidden">
          <Chatbox />
        </div>
      </motion.div>
    </main>
  );
}
