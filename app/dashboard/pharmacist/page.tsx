import React from 'react';

export default function PharmacistDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Pharmacy Dashboard</h2>
        <div className="flex gap-3">
          <button className="px-5 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-medium shadow-sm">
            Inventory
          </button>
          <button className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all font-medium">
            Verify Prescription
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Stats Cards */}
        {[
          { label: 'Pending Verification', value: '12', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: 'Ready for Pickup', value: '28', color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
          { label: 'Low Stock Items', value: '3', color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20' },
          { label: 'Total Filled Today', value: '145', color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
        ].map((stat, idx) => (
          <div key={idx} className="glass-card p-6 flex flex-col justify-between hover:scale-105 transition-transform duration-200">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{stat.label}</p>
            <div className="flex items-end justify-between mt-4">
              <p className={`text-4xl font-bold ${stat.color}`}>{stat.value}</p>
              <div className={`w-10 h-10 rounded-full ${stat.bg} flex items-center justify-center`}>
                <span className={`text-lg ${stat.color}`}>●</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Verification Queue */}
      <div className="glass-card p-6">
        <h3 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white flex items-center gap-2">
          <span className="w-2 h-6 bg-indigo-500 rounded-full"></span>
          Verification Queue
        </h3>
        <div className="space-y-4">
          <div className="p-5 rounded-xl bg-white/50 dark:bg-gray-800/50 border border-white/60 dark:border-gray-700/50 hover:shadow-md transition-all group">
            <div className="flex justify-between items-start">
              <div className="flex gap-5">
                <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-lg shadow-inner">
                  Rx
                </div>
                <div>
                  <h4 className="font-bold text-lg text-gray-900 dark:text-white">Prescription #RX-9823</h4>
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-1">
                    <span>Alice Johnson</span>
                    <span>•</span>
                    <span>Dr. Smith</span>
                  </div>
                  <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mt-2 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-lg inline-block">
                    Amoxicillin 500mg - 30 Capsules
                  </p>
                </div>
              </div>
              <button className="px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0">
                Review Order
              </button>
            </div>
          </div>
           <div className="p-5 rounded-xl bg-white/50 dark:bg-gray-800/50 border border-white/60 dark:border-gray-700/50 hover:shadow-md transition-all group">
            <div className="flex justify-between items-start">
              <div className="flex gap-5">
                <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-lg shadow-inner">
                  Rx
                </div>
                <div>
                  <h4 className="font-bold text-lg text-gray-900 dark:text-white">Prescription #RX-9824</h4>
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-1">
                    <span>Bob Smith</span>
                    <span>•</span>
                    <span>Dr. Jones</span>
                  </div>
                  <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mt-2 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-lg inline-block">
                    Lipitor 20mg - 90 Tablets
                  </p>
                </div>
              </div>
              <button className="px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0">
                Review Order
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
