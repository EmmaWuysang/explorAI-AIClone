'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { MessageSquare, Users, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navigation() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { href: '/', label: 'Chat', icon: MessageSquare },
    { href: '/personas', label: 'Personas', icon: Users },
  ];

  return (
    <nav
      className="w-full backdrop-blur-md border-b sticky top-0 z-50 hud-panel"
      style={{
        background: 'rgba(var(--color-bg-elevated), 0.9)',
        borderColor: 'rgba(var(--color-arc-reactor), 0.3)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-md arc-glow flex items-center justify-center" style={{
              background: 'radial-gradient(circle at center, rgba(0, 243, 255, 0.3), rgba(0, 174, 239, 0.1))',
              border: '1px solid rgb(var(--color-arc-reactor))',
            }}>
              <div className="power-indicator" />
            </div>
            <span
              className="text-lg font-semibold hidden sm:block hud-header"
              style={{ fontSize: '1rem', letterSpacing: '1.5px' }}
            >
              STARK INDUSTRIES
            </span>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            {navItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link key={item.href} href={item.href}>
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`px-4 py-2 rounded-md flex items-center gap-2 transition-all duration-200 diagnostic-text ${
                      isActive
                        ? 'arc-button'
                        : ''
                    }`}
                    style={
                      !isActive
                        ? {
                            color: 'rgb(var(--color-text-tertiary))',
                          }
                        : undefined
                    }
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Icon className="w-4 h-4" style={{ color: isActive ? 'rgb(var(--color-arc-reactor))' : undefined }} />
                    <span className="font-medium text-sm uppercase" style={{ letterSpacing: '1px' }}>{item.label}</span>
                  </motion.div>
                </Link>
              );
            })}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{ color: 'rgb(var(--color-text-primary))' }}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden pb-4 space-y-2"
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)}>
                  <div
                    className={`px-4 py-3 rounded-md flex items-center gap-3 transition-all duration-200 diagnostic-text ${
                      isActive
                        ? 'arc-button'
                        : 'hud-panel'
                    }`}
                  >
                    <Icon className="w-5 h-5" style={{ color: 'rgb(var(--color-arc-reactor))' }} />
                    <span className="font-medium uppercase" style={{ letterSpacing: '1px' }}>{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </motion.div>
        )}
      </div>
    </nav>
  );
}
