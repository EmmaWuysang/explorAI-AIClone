'use client';

import { motion } from 'framer-motion';
import Chatbox from '@/components/Chatbox';
import Navigation from '@/components/Navigation';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      <Navigation />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 relative z-10"
      >
        <div className="w-full max-w-5xl h-[calc(100vh-8rem)] flex flex-col">
          {/* Scanlines */}
          <div className="scanlines" />

          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mb-6 text-center"
          >
            <h1
              className="text-3xl md:text-5xl font-bold mb-2 text-arc-gradient hud-header"
            >
              STARK INDUSTRIES
            </h1>
            <p
              className="text-sm diagnostic-text flex items-center justify-center gap-2"
              style={{ color: 'rgb(var(--color-text-tertiary))' }}
            >
              <div className="power-indicator" style={{ width: '6px', height: '6px' }} />
              <span>TONY STARK // AI INTERFACE</span>
            </p>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="flex-1 rounded-md hud-panel overflow-hidden holo-border"
          >
            <Chatbox />
          </motion.div>
        </div>
      </motion.div>
    </main>
  );
}
