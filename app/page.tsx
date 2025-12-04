'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-900 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-bold text-blue-900 dark:text-white mb-4"
          >
            MedAssist AI
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-blue-700 dark:text-blue-200"
          >
            Your intelligent partner in medication management.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Client Card */}
          <Link href="/dashboard/client">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all cursor-pointer border border-transparent hover:border-blue-500 group"
            >
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors">
                <span className="text-3xl group-hover:text-white transition-colors">👤</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Patient</h2>
              <p className="text-gray-600 dark:text-gray-300">
                Manage your prescriptions, track reminders, and chat with your AI assistant.
              </p>
            </motion.div>
          </Link>

          {/* Doctor Card */}
          <Link href="/dashboard/doctor">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all cursor-pointer border border-transparent hover:border-green-500 group"
            >
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-6 group-hover:bg-green-600 transition-colors">
                <span className="text-3xl group-hover:text-white transition-colors">👨‍⚕️</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Doctor</h2>
              <p className="text-gray-600 dark:text-gray-300">
                Monitor patient adherence, approve refills, and manage prescriptions.
              </p>
            </motion.div>
          </Link>

          {/* Pharmacist Card */}
          <Link href="/dashboard/pharmacist">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all cursor-pointer border border-transparent hover:border-purple-500 group"
            >
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mb-6 group-hover:bg-purple-600 transition-colors">
                <span className="text-3xl group-hover:text-white transition-colors">💊</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Pharmacist</h2>
              <p className="text-gray-600 dark:text-gray-300">
                Verify prescriptions, manage inventory, and ensure patient safety.
              </p>
            </motion.div>
          </Link>
        </div>
      </div>
    </main>
  );
}
