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
      {/* Noise Texture Removed for Cleaner Look */}
      
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
}
