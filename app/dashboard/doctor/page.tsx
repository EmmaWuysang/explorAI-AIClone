'use client';

import React from 'react';
import GlassCard from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import { Users, FileText, AlertCircle, Search, Filter, MoreHorizontal } from 'lucide-react';

export default function DoctorDashboard() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Doctor Portal</h2>
          <p className="text-slate-500 dark:text-slate-400">Manage your patients and prescriptions</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" leftIcon={<Filter size={18} />}>Filter</Button>
          <Button variant="primary" leftIcon={<FileText size={18} />}>New Prescription</Button>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard variant="hover" className="bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-800">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-blue-600 dark:text-blue-400 font-medium mb-1">Total Patients</p>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white">1,284</h3>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl text-blue-600">
              <Users size={24} />
            </div>
          </div>
        </GlassCard>
        
        <GlassCard variant="hover" className="bg-amber-50/50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-800">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-amber-600 dark:text-amber-400 font-medium mb-1">Pending Refills</p>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white">12</h3>
            </div>
            <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-xl text-amber-600">
              <AlertCircle size={24} />
            </div>
          </div>
        </GlassCard>

        <GlassCard variant="hover" className="bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-800">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-emerald-600 dark:text-emerald-400 font-medium mb-1">Appointments</p>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white">8</h3>
            </div>
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl text-emerald-600">
              <FileText size={24} />
            </div>
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Patient List */}
        <div className="lg:col-span-2">
          <GlassCard noPadding className="overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recent Patients</h3>
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search patients..." 
                  className="pl-10 pr-4 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border-none text-sm focus:ring-2 focus:ring-blue-500 w-64"
                />
              </div>
            </div>
            
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 dark:bg-slate-800/50">
                <tr>
                  <th className="px-6 py-4 font-semibold text-slate-500 text-xs uppercase tracking-wider">Patient</th>
                  <th className="px-6 py-4 font-semibold text-slate-500 text-xs uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 font-semibold text-slate-500 text-xs uppercase tracking-wider">Last Visit</th>
                  <th className="px-6 py-4 font-semibold text-slate-500 text-xs uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {[
                  { name: 'Alice Johnson', status: 'Critical', date: 'Oct 24, 2023', img: 'AJ' },
                  { name: 'Bob Smith', status: 'Stable', date: 'Oct 22, 2023', img: 'BS' },
                  { name: 'Charlie Davis', status: 'Recovering', date: 'Oct 20, 2023', img: 'CD' },
                ].map((patient, idx) => (
                  <tr key={idx} className="group hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-sm font-bold text-slate-600 dark:text-slate-300">
                          {patient.img}
                        </div>
                        <span className="font-medium text-slate-900 dark:text-white">{patient.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                        patient.status === 'Critical' ? 'bg-red-50 text-red-700 border-red-200' :
                        patient.status === 'Stable' ? 'bg-green-50 text-green-700 border-green-200' :
                        'bg-blue-50 text-blue-700 border-blue-200'
                      }`}>
                        {patient.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-sm">{patient.date}</td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100">
                        <MoreHorizontal size={18} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </GlassCard>
        </div>

        {/* Urgent Tasks */}
        <div className="space-y-6">
          <GlassCard className="bg-gradient-to-b from-amber-50 to-white dark:from-amber-900/10 dark:to-slate-900 border-amber-100 dark:border-amber-900/30">
            <h3 className="text-lg font-bold text-amber-900 dark:text-amber-100 mb-4 flex items-center gap-2">
              <AlertCircle size={20} className="text-amber-500" />
              Urgent Refills
            </h3>
            
            <div className="space-y-4">
              <div className="p-4 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-amber-100 dark:border-amber-900/20">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-slate-900 dark:text-white">Alice Johnson</h4>
                  <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded">ASAP</span>
                </div>
                <p className="text-sm text-slate-500 mb-4">Amoxicillin 500mg • Refill #2</p>
                <div className="flex gap-2">
                  <Button variant="primary" size="sm" className="flex-1 bg-amber-500 hover:bg-amber-600 border-none shadow-amber-500/20">Approve</Button>
                  <Button variant="ghost" size="sm" className="flex-1">Deny</Button>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
