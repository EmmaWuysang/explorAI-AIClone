'use client';

import React from 'react';
import GlassCard from './GlassCard';

interface StatCardProps {
  label: string;
  value: string | number;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon?: React.ReactNode;
  color?: 'blue' | 'green' | 'red' | 'purple' | 'amber';
}

export default function StatCard({ label, value, trend, icon, color = 'blue' }: StatCardProps) {
  
  const colorMap = {
    blue: { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-400', ring: 'ring-blue-100 dark:ring-blue-900/30' },
    green: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-600 dark:text-emerald-400', ring: 'ring-emerald-100 dark:ring-emerald-900/30' },
    red: { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-600 dark:text-red-400', ring: 'ring-red-100 dark:ring-red-900/30' },
    purple: { bg: 'bg-purple-50 dark:bg-purple-900/20', text: 'text-purple-600 dark:text-purple-400', ring: 'ring-purple-100 dark:ring-purple-900/30' },
    amber: { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-600 dark:text-amber-400', ring: 'ring-amber-100 dark:ring-amber-900/30' },
  };

  const styles = colorMap[color];

  return (
    <GlassCard variant="hover" className="relative overflow-hidden">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</p>
          <h3 className="text-3xl font-bold mt-2 text-slate-900 dark:text-white tracking-tight">{value}</h3>
          
          {trend && (
            <div className={`flex items-center mt-2 text-sm font-medium ${trend.isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
              <span>{trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%</span>
              <span className="text-slate-400 ml-1 font-normal">vs last week</span>
            </div>
          )}
        </div>
        
        {icon && (
          <div className={`p-3 rounded-xl ${styles.bg} ${styles.text} ring-1 ${styles.ring}`}>
            {icon}
          </div>
        )}
      </div>
      
      {/* Decorative Background Blob */}
      <div className={`absolute -bottom-4 -right-4 w-24 h-24 rounded-full ${styles.bg} opacity-50 blur-2xl pointer-events-none`} />
    </GlassCard>
  );
}
