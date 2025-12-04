'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface GlassCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'hover' | 'interactive';
  noPadding?: boolean;
}

export default function GlassCard({ 
  children, 
  className = '', 
  variant = 'default',
  noPadding = false,
  ...props 
}: GlassCardProps) {
  
  const variants = {
    default: {
      boxShadow: 'var(--glass-shadow)',
    },
    hover: {
      y: -4,
      boxShadow: '0 12px 40px 0 rgba(31, 38, 135, 0.15)',
    },
    interactive: {
      scale: 0.98,
      boxShadow: '0 4px 12px 0 rgba(31, 38, 135, 0.05)',
    }
  };

  return (
    <motion.div
      initial="default"
      whileHover={variant === 'hover' || variant === 'interactive' ? 'hover' : undefined}
      whileTap={variant === 'interactive' ? 'interactive' : undefined}
      variants={variants}
      className={`
        glass-panel rounded-2xl overflow-hidden
        transition-colors duration-300
        ${noPadding ? '' : 'p-6'}
        ${className}
      `}
      {...props}
    >
      {/* Noise Texture Overlay for Premium Feel */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-0 mix-blend-overlay" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} 
      />
      
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
}
