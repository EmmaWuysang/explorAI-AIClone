import React from 'react';

export default function DoctorDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Doctor Portal</h2>
        <button className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all font-medium flex items-center gap-2">
          <span>+</span> New Prescription
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Recent Patients */}
        <div className="md:col-span-2 glass-card p-6">
          <h3 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white flex items-center gap-2">
            <span className="w-2 h-6 bg-blue-500 rounded-full"></span>
            Recent Patients
          </h3>
          <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
            <table className="w-full text-left">
              <thead className="bg-gray-50/50 dark:bg-gray-800/50">
                <tr>
                  <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-300 text-sm">Name</th>
                  <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-300 text-sm">Last Visit</th>
                  <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-300 text-sm">Status</th>
                  <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-300 text-sm">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 bg-white/30 dark:bg-gray-900/30">
                <tr className="group hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4 text-gray-900 dark:text-white font-medium">Alice Johnson</td>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400">Oct 24, 2023</td>
                  <td className="px-6 py-4"><span className="px-2.5 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200">Follow-up</span></td>
                  <td className="px-6 py-4"><button className="text-blue-600 hover:text-blue-700 font-medium text-sm hover:underline">View Profile</button></td>
                </tr>
                <tr className="group hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4 text-gray-900 dark:text-white font-medium">Bob Smith</td>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400">Oct 22, 2023</td>
                  <td className="px-6 py-4"><span className="px-2.5 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 border border-green-200">Stable</span></td>
                  <td className="px-6 py-4"><button className="text-blue-600 hover:text-blue-700 font-medium text-sm hover:underline">View Profile</button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Pending Requests */}
        <div className="glass-card p-6">
          <h3 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white flex items-center gap-2">
            <span className="w-2 h-6 bg-yellow-500 rounded-full"></span>
            Refill Requests
          </h3>
          <div className="space-y-4">
            <div className="p-5 rounded-xl bg-yellow-50/50 dark:bg-yellow-900/10 border border-yellow-100 dark:border-yellow-900/30 hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-bold text-gray-900 dark:text-white">Alice Johnson</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Amoxicillin 500mg</p>
                </div>
                <span className="px-2 py-0.5 text-xs font-bold text-yellow-700 bg-yellow-100 rounded border border-yellow-200">URGENT</span>
              </div>
              <div className="flex gap-3 mt-4">
                <button className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 shadow-sm transition-colors">Approve</button>
                <button className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">Deny</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
