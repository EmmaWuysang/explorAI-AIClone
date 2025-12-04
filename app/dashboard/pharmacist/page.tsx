'use client';

import React from 'react';
import GlassCard from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import StatCard from '@/components/ui/StatCard';
import { Pill, CheckCircle, AlertTriangle, Package, ArrowRight } from 'lucide-react';

export default function PharmacistDashboard() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Pharmacy Dashboard</h2>
          <p className="text-slate-500 dark:text-slate-400">Inventory and verification queue</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" leftIcon={<Package size={18} />}>Inventory</Button>
          <Button variant="primary" leftIcon={<CheckCircle size={18} />}>Verify Batch</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Pending" value="12" color="blue" icon={<Pill size={20} />} />
        <StatCard label="Ready" value="28" color="green" icon={<CheckCircle size={20} />} />
        <StatCard label="Low Stock" value="3" color="red" icon={<AlertTriangle size={20} />} />
        <StatCard label="Filled Today" value="145" color="purple" icon={<Package size={20} />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Verification Queue */}
        <div className="lg:col-span-2">
          <GlassCard>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Verification Queue</h3>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">12 Pending</span>
            </div>

            <div className="space-y-4">
              {[1, 2].map((item) => (
                <div key={item} className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:shadow-lg hover:border-blue-200 dark:hover:border-blue-800 transition-all group">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-5">
                      <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center font-bold text-xl">
                        Rx
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold text-lg text-slate-900 dark:text-white">#RX-982{item}</h4>
                          <span className="px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600">New</span>
                        </div>
                        <p className="text-slate-500 text-sm mb-3">Alice Johnson • Dr. Smith</p>
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 rounded-lg bg-blue-50 text-blue-700 text-sm font-medium border border-blue-100">
                            Amoxicillin 500mg
                          </span>
                          <span className="text-slate-400 text-sm">30 Capsules</span>
                        </div>
                      </div>
                    </div>
                    <Button variant="primary" size="sm" className="opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all" rightIcon={<ArrowRight size={16} />}>
                      Review
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Inventory Alerts */}
        <div>
          <GlassCard className="h-full">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Inventory Alerts</h3>
            <div className="space-y-4">
              {[
                { name: 'Lipitor 20mg', stock: 15, status: 'Critical' },
                { name: 'Metformin 500mg', stock: 45, status: 'Low' },
                { name: 'Zoloft 50mg', stock: 20, status: 'Low' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">{item.name}</p>
                    <p className="text-xs text-slate-500">{item.stock} units left</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    item.status === 'Critical' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {item.status}
                  </span>
                </div>
              ))}
              
              <Button variant="outline" className="w-full mt-4">View All Inventory</Button>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
