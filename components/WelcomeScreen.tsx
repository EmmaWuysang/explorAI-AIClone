'use client';

import { motion } from 'framer-motion';
import { Zap, Brain, Shield, Activity, Database, Globe } from 'lucide-react';

interface WelcomeScreenProps {
  onDismiss: () => void;
}

const capabilities = [
  {
    icon: Brain,
    title: 'Cognitive Processing',
    description: 'Advanced AI reasoning with Stark-level wit and intelligence',
    status: 'ONLINE',
  },
  {
    icon: Globe,
    title: 'Web Integration',
    description: 'Real-time data retrieval and web connectivity',
    status: 'READY',
  },
  {
    icon: Database,
    title: 'Memory Matrix',
    description: 'Persistent context and information retention',
    status: 'ACTIVE',
  },
  {
    icon: Activity,
    title: 'System Diagnostics',
    description: 'Analyze, process, and extract actionable insights',
    status: 'ONLINE',
  },
];

export default function WelcomeScreen({ onDismiss }: WelcomeScreenProps) {
  return (
    <>
      {/* Scanlines Effect */}
      <div className="scanlines" />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex flex-col items-center justify-center min-h-screen px-4 pb-20 relative z-10"
      >
        {/* Arc Reactor Logo */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="mb-12"
        >
          <div className="relative w-32 h-32">
            {/* Arc Reactor Core */}
            <div className="absolute inset-0 rounded-full arc-glow" style={{
              background: 'radial-gradient(circle at center, rgba(0, 243, 255, 0.4), rgba(0, 174, 239, 0.2), transparent)',
              border: '2px solid rgb(var(--color-arc-reactor))',
            }}>
              <div className="absolute inset-4 rounded-full" style={{
                background: 'radial-gradient(circle at center, rgba(0, 243, 255, 0.6), transparent)',
                border: '1px solid rgb(var(--color-arc-reactor))',
              }}>
                <div className="absolute inset-4 rounded-full" style={{
                  background: 'rgb(var(--color-arc-reactor))',
                  boxShadow: '0 0 30px rgba(var(--color-arc-reactor), 0.8)',
                }} />
              </div>
            </div>

            {/* Rotating Rings */}
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="absolute inset-0"
                animate={{ rotate: 360 }}
                transition={{
                  duration: 20 + i * 5,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              >
                <div className="w-full h-full rounded-full" style={{
                  border: '1px solid rgba(var(--color-arc-reactor), 0.3)',
                  borderTopColor: 'rgb(var(--color-arc-reactor))',
                }} />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.div
            className="inline-flex items-center gap-3 mb-4 px-4 py-2 rounded-md holo-border"
            style={{
              background: 'rgba(var(--color-bg-elevated), 0.6)',
            }}
          >
            <div className="power-indicator" />
            <span className="diagnostic-text text-xs" style={{ color: 'rgb(var(--color-stark-gold))' }}>
              SYSTEM STATUS: ONLINE
            </span>
          </motion.div>

          <motion.h1
            className="text-6xl md:text-8xl font-bold mb-4 hud-header"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <span className="text-arc-gradient" style={{ opacity: 0.6 }}>(B)</span>
            <span className="text-arc-gradient">est Team</span>
          </motion.h1>

          <motion.p
            className="text-lg md:text-xl mb-2"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            style={{ color: 'rgb(var(--color-text-secondary))' }}
          >
            <span className="diagnostic-text">AI-Powered Assistant</span>
          </motion.p>

          <motion.p
            className="text-sm mb-8"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            style={{ color: 'rgb(var(--color-text-tertiary))' }}
          >
            Built with modern LLM technology
          </motion.p>

          <motion.button
            onClick={onDismiss}
            className="px-8 py-4 rounded-md font-semibold arc-button hud-header text-sm"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Zap className="w-5 h-5 inline mr-2" />
            INITIALIZE INTERFACE
          </motion.button>
        </motion.div>

        {/* Capabilities Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl w-full"
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.6 }}
        >
          {capabilities.map((capability, index) => {
            const Icon = capability.icon;
            return (
              <motion.div
                key={capability.title}
                initial={{ x: index % 2 === 0 ? -20 : 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 1 + index * 0.1, duration: 0.5 }}
                className="hud-panel rounded-md p-4 holo-shimmer"
              >
                <div className="flex items-start gap-4">
                  <motion.div
                    className="w-12 h-12 rounded-md flex items-center justify-center arc-glow"
                    style={{
                      background: 'rgba(var(--color-arc-reactor), 0.2)',
                      border: '1px solid rgb(var(--color-arc-reactor))',
                    }}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Icon className="w-6 h-6" style={{ color: 'rgb(var(--color-arc-reactor))' }} />
                  </motion.div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-sm font-semibold" style={{ color: 'rgb(var(--color-text-primary))' }}>
                        {capability.title}
                      </h3>
                      <span className="text-xs px-2 py-0.5 rounded" style={{
                        color: 'rgb(var(--color-stark-gold))',
                        border: '1px solid rgb(var(--color-stark-gold))',
                        background: 'rgba(var(--color-stark-gold), 0.1)',
                      }}>
                        {capability.status}
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed" style={{ color: 'rgb(var(--color-text-tertiary))' }}>
                      {capability.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* System Info */}
        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.6 }}
        >
          <p className="diagnostic-text text-xs" style={{ color: 'rgb(var(--color-text-muted))' }}>
            (B)EST TEAM // AI ASSISTANT // READY TO HELP
          </p>
        </motion.div>

        {/* Holographic Orbs */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full"
          style={{
            background: 'radial-gradient(circle at center, rgba(0, 243, 255, 0.1), transparent)',
            filter: 'blur(60px)',
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
            x: [0, 50, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        <motion.div
          className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full"
          style={{
            background: 'radial-gradient(circle at center, rgba(255, 193, 7, 0.08), transparent)',
            filter: 'blur(60px)',
          }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
            x: [0, -40, 0],
            y: [0, 40, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </motion.div>
    </>
  );
}
