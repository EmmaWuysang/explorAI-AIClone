
'use client';

import React, { useState, useEffect } from 'react';
import GlassCard from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import { Package, TrendingUp, AlertTriangle, Check, RefreshCw, ArrowRight, BarChart3, TrendingDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getInventoryAnalytics } from '@/lib/actions/analytics';
import { getFirstPharmacyId } from '@/lib/actions/pharmacy';
import { AnalyzedProduct } from '@/lib/analytics/simulation';
import DemandChart from './DemandChart';
import { useToast } from '@/components/ui/Toast';

export default function StockOptimization() {
    const [analyzedItems, setAnalyzedItems] = useState<AnalyzedProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [reordering, setReordering] = useState<string | null>(null);
    const [expandedItem, setExpandedItem] = useState<string | null>(null);
    const { addToast } = useToast();

    const fetchAnalysis = async () => {
        setLoading(true);
        try {
            const pidRes = await getFirstPharmacyId();
            if (pidRes.success && pidRes.data) {
                const res = await getInventoryAnalytics(pidRes.data);
                if (res.success && res.data) {
                    setAnalyzedItems(res.data.filter(i => i.status !== 'OPTIMAL'));
                }
            }
        } catch (error) {
            console.error("Failed to fetch inventory analysis", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalysis();
    }, []);

    const handleReorder = async (itemId: string, quantity: number) => {
        setReordering(itemId);
        // Call server action
        const res = await import('@/lib/actions/pharmacy').then(mod => mod.restockItem(itemId, quantity));
        
        if (res.success) {
             addToast(`Restock request for ${quantity} units submitted successfully!`, 'success');
             // Update item locally to reflect pending
             setAnalyzedItems(prev => prev.map(item => 
                 item.id === itemId 
                 ? { ...item, incomingStock: item.incomingStock + quantity }
                 : item
             ));
        } else {
             addToast(res.error || "Failed to restock", 'error');
        }
        setReordering(null);
    };

    return (
        <GlassCard className="border-purple-100 dark:border-purple-900/30 bg-purple-50/50 dark:bg-purple-900/10">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <TrendingUp className="text-purple-600" size={20} />
                    AI Stock Optimization
                </h3>
                <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={fetchAnalysis}
                    className={loading ? 'animate-spin' : ''}
                >
                    <RefreshCw size={16} />
                </Button>
            </div>

            {loading ? (
                <div className="space-y-3">
                    {[1, 2].map(i => (
                        <div key={i} className="h-24 bg-white/50 dark:bg-slate-800/50 rounded-xl animate-pulse" />
                    ))}
                </div>
            ) : analyzedItems.length > 0 ? (
                <div className="space-y-3">
                    <AnimatePresence>
                        {analyzedItems.map((item) => (
                            <motion.div
                                key={item.id}
                                layout
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, height: 0 }}
                                className="bg-white dark:bg-slate-800 rounded-xl border border-purple-100 dark:border-purple-800/30 shadow-sm overflow-hidden"
                            >
                                <div 
                                    className="p-3 cursor-pointer"
                                    onClick={() => setExpandedItem(expandedItem === item.id ? null : item.id)}
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                                {item.name}
                                                <span className={`text-xs font-normal px-2 py-0.5 rounded-full ${
                                                    item.status === 'CRITICAL' ? 'bg-red-100 text-red-600' :
                                                    item.status === 'REORDER' ? 'bg-amber-100 text-amber-600' :
                                                    'bg-blue-100 text-blue-600'
                                                }`}>
                                                    {item.status} (Cover: {item.daysCover} days)
                                                </span>
                                            </h4>
                                            <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                                                <BarChart3 size={12} /> Forecast: {item.averageDailyUsage}/day
                                                <span className="text-slate-300">•</span>
                                                <AlertTriangle size={12} className={item.stockoutRisk > 50 ? "text-red-500" : "text-amber-500"} /> 
                                                Risk: {item.stockoutRisk}%
                                                {item.incomingStock > 0 && (
                                                    <span className="ml-2 flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                                                        <Package size={10} /> +{item.incomingStock} Pending
                                                    </span>
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center justify-between mt-3 bg-slate-50 dark:bg-slate-900/50 p-2 rounded-lg" onClick={e => e.stopPropagation()}>
                                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                                            <Package size={16} />
                                            <span>EOQ: <strong>{item.eoq}</strong></span>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="primary"
                                            className={`h-8 text-xs ${item.incomingStock > 0 ? 'bg-slate-100 text-slate-500 border-slate-200' : 'bg-purple-600 hover:bg-purple-700 border-purple-600'}`}
                                            onClick={() => handleReorder(item.id, Math.max(item.eoq, item.reorderPoint - item.stock))}
                                            disabled={reordering === item.id || item.incomingStock > 0}
                                        >
                                            {reordering === item.id ? (
                                                <RefreshCw className="animate-spin w-3 h-3" />
                                            ) : item.incomingStock > 0 ? (
                                                <>On Order</>
                                            ) : (
                                                <>
                                                    Reorder {Math.max(item.eoq, item.reorderPoint - item.stock)} <ArrowRight size={12} className="ml-1" />
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>

                                {/* Expanded Analysis */}
                                <AnimatePresence>
                                    {expandedItem === item.id && (
                                        <motion.div 
                                            initial={{ height: 0 }}
                                            animate={{ height: 'auto' }}
                                            exit={{ height: 0 }}
                                            className="border-t border-slate-100 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-900/20 px-4 pb-4"
                                        >
                                            <div className="pt-2">
                                                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">90-Day Demand & Forecast</p>
                                                <DemandChart data={[...item.salesHistory, ...item.forecast.map(f => ({ ...f, type: 'forecast' as const }))]} />
                                                
                                                <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                                                    <div className="p-2 bg-white dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700">
                                                        <span className="text-slate-400">Reorder Point</span>
                                                        <p className="font-bold text-slate-700 dark:text-slate-300">{item.reorderPoint} units</p>
                                                    </div>
                                                    <div className="p-2 bg-white dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700">
                                                        <span className="text-slate-400">Values</span>
                                                        <p className="font-bold text-slate-700 dark:text-slate-300">σ={item.standardDeviation} (Volatility)</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            ) : (
                <div className="text-center py-8 text-slate-500 text-sm">
                    <Check className="w-8 h-8 text-green-500 mx-auto mb-2" />
                    All metrics within optimal ranges.
                </div>
            )}
        </GlassCard>
    );
}
