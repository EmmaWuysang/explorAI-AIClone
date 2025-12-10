
'use client';

import React, { useState } from 'react';
import { RotateCcw, AlertTriangle } from 'lucide-react';
import { resetDemoState } from '@/lib/actions/demo';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '@/components/ui/Button';

export default function DemoResetButton() {
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleReset = async () => {
    setLoading(true);
    const res = await resetDemoState();
    if (res.success) {
      window.location.reload();
    } else {
      alert(res.error);
      setLoading(false);
      setShowConfirm(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        disabled={loading}
        className={`
          fixed bottom-4 left-4 z-50 flex items-center gap-2 px-3 py-2 
          bg-slate-900 text-white rounded-full shadow-lg hover:bg-slate-800 
          transition-all text-xs font-medium border border-slate-700
          ${loading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <RotateCcw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
        {loading ? 'Resetting...' : 'Reset Demo'}
      </button>

      <AnimatePresence>
        {showConfirm && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl max-w-sm w-full overflow-hidden border border-slate-200 dark:border-slate-800"
            >
              <div className="p-6 text-center">
                <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle size={24} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Reset Demo State?</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
                  This will wipe all current data and restore the &quot;Golden Path&quot; demo scenario. This cannot be undone.
                </p>
                
                <div className="flex gap-3">
                  <Button 
                    variant="ghost" 
                    className="flex-1"
                    onClick={() => setShowConfirm(false)}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button 
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white border-none"
                    onClick={handleReset}
                    disabled={loading}
                  >
                    {loading ? 'Resetting...' : 'Yes, Reset Data'}
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
