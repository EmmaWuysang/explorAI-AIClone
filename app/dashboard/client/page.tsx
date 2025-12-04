import React from 'react';

export default function ClientDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">My Health Dashboard</h2>
        <button className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all font-medium">
          + Add Medication
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Today's Reminders */}
        <div className="md:col-span-2 glass-card p-6">
          <h3 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white flex items-center gap-2">
            <span className="w-2 h-6 bg-blue-500 rounded-full"></span>
            Today's Reminders
          </h3>
          <div className="space-y-4">
            {/* Reminder Item */}
            <div className="p-4 rounded-xl bg-white/50 dark:bg-gray-800/50 border border-white/60 dark:border-gray-700/50 flex items-center justify-between hover:bg-white/80 dark:hover:bg-gray-800 transition-colors group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xl">
                  💊
                </div>
                <div>
                  <p className="font-bold text-gray-900 dark:text-white text-lg">Amoxicillin</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">500mg • Take with food</p>
                </div>
              </div>
              <div className="text-right flex flex-col items-end gap-2">
                <p className="text-lg font-bold text-blue-600 dark:text-blue-400">8:00 AM</p>
                <button className="text-sm px-3 py-1 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors opacity-0 group-hover:opacity-100">
                  Mark as Taken
                </button>
              </div>
            </div>
            
            <div className="p-4 rounded-xl bg-gray-50/50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800 flex items-center justify-between opacity-60">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center text-xl">
                  ✓
                </div>
                <div>
                  <p className="font-bold text-gray-900 dark:text-white text-lg line-through">Lisinopril</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">10mg</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-500">9:00 AM</p>
                <span className="text-sm text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded">Taken</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats / Adherence */}
        <div className="glass-card p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 z-0"></div>
          <h3 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white relative z-10">Weekly Adherence</h3>
          
          <div className="relative w-40 h-40 flex items-center justify-center mb-4 z-10">
            {/* Simple CSS Ring Chart Placeholder */}
            <div className="w-full h-full rounded-full border-8 border-gray-100 dark:border-gray-700 absolute"></div>
            <div className="w-full h-full rounded-full border-8 border-green-500 border-t-transparent border-l-transparent rotate-45 absolute"></div>
            <div className="text-center">
              <p className="text-5xl font-bold text-gray-900 dark:text-white">95%</p>
            </div>
          </div>
          <p className="text-green-600 font-medium relative z-10">Excellent!</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 relative z-10">You missed 1 dose this week</p>
        </div>
      </div>

      {/* Active Medications */}
      <div className="glass-card p-6">
        <h3 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white flex items-center gap-2">
          <span className="w-2 h-6 bg-purple-500 rounded-full"></span>
          Active Medications
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Medication Card */}
          <div className="p-5 rounded-xl bg-white/50 dark:bg-gray-800/50 border border-white/60 dark:border-gray-700/50 hover:shadow-lg transition-all cursor-pointer group">
            <div className="flex justify-between items-start mb-3">
              <h4 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">Amoxicillin</h4>
              <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300">Active</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">500mg • Capsule</p>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Refills: 1</span>
              <span className="text-blue-600 group-hover:underline">Details →</span>
            </div>
          </div>
           <div className="p-5 rounded-xl bg-white/50 dark:bg-gray-800/50 border border-white/60 dark:border-gray-700/50 hover:shadow-lg transition-all cursor-pointer group">
            <div className="flex justify-between items-start mb-3">
              <h4 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">Lisinopril</h4>
              <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300">Active</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">10mg • Tablet</p>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Refills: 3</span>
              <span className="text-blue-600 group-hover:underline">Details →</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
