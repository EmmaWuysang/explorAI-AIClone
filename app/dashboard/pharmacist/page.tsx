'use client';

import React from 'react';
import GlassCard from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import StatCard from '@/components/ui/StatCard';
import { Pill, CheckCircle, AlertTriangle, Package, ArrowRight, QrCode } from 'lucide-react';
import PharmacyInventory from '@/components/dashboard/PharmacyInventory';
import StockOptimization from '@/components/dashboard/StockOptimization';
import QRScanner from '@/components/ui/QRScanner';
import { useToast } from '@/components/ui/Toast';

export default function PharmacistDashboard() {
  const [redeemToken, setRedeemToken] = React.useState('');
  const [redeeming, setRedeeming] = React.useState(false);

  // handleRedeem moved below


  const [isScannerOpen, setIsScannerOpen] = React.useState(false);
  const [pharmacyId, setPharmacyId] = React.useState<string>('');

  React.useEffect(() => {
      const init = async () => {
          const { getFirstPharmacyId, getPharmacyStats } = await import('@/lib/actions/pharmacy');
          const res = await getFirstPharmacyId();
          if (res.success && res.data) {
              setPharmacyId(res.data);
              // Initial stats fetch
              fetchStats(res.data);
          }
      };
      init();
      
      const interval = setInterval(() => {
          if (pharmacyId) fetchStats(pharmacyId);
      }, 4000);
      return () => clearInterval(interval);

  }, [pharmacyId]);

  const [stats, setStats] = React.useState({
      pending: 0,
      redeemed: 0,
      lowStock: 0,
      filledToday: 0
  });

  const fetchStats = async (pid: string) => {
      const { getPharmacyStats } = await import('@/lib/actions/pharmacy');
      const res = await getPharmacyStats(pid);
      if (res.success && res.data) {
          setStats(res.data);
      }
  };

  const { addToast } = useToast();

  const handleScan = (token: string) => {
    setRedeemToken(token);
    setIsScannerOpen(false);
    addToast("QR Code Scanned!", "info");
  };

  const handleRedeem = async () => {
    if (!redeemToken) return;
    setRedeeming(true);

    try {
      const { redeemPrescription } = await import('@/lib/actions/prescription');
      // Use real pharmacy ID or fallback (though fallback might fail FK if 'p1' not in DB)
      const pid = pharmacyId || 'cmiyzkn610000jvvbmofqikx1'; // Fallback to a seeded ID if possible, or just strict.
      const res = await redeemPrescription(redeemToken, pid);
      
      if (res.success) {
        addToast(`Prescription redeemed for ${res.data?.medicationName}`, 'success');
        setRedeemToken('');
      } else {
        addToast(res.error || 'Failed to redeem', 'error');
      }
    } catch (error) {
      addToast('An error occurred during redemption', 'error');
    } finally {
      setRedeeming(false);
    }
  };
  return (
    <div className="space-y-8">
      {isScannerOpen && (
        <React.Suspense fallback={null}>
            {/* Dynamic import to avoid SSR issues with html5-qrcode if needed, though component handles it via useEffect */}
            <QRScanner onScan={handleScan} onClose={() => setIsScannerOpen(false)} />
        </React.Suspense>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Pharmacy Dashboard</h2>
          <p className="text-slate-500 dark:text-slate-400">Inventory and redemption</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" leftIcon={<Package size={18} />}>Inventory</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Pending Orders" value={stats.pending.toString()} color="blue" icon={<Pill size={20} />} />
        <StatCard label="Total Redemptions" value={stats.redeemed.toString()} color="green" icon={<CheckCircle size={20} />} />
        <StatCard label="Low Stock Items" value={stats.lowStock.toString()} color="red" icon={<AlertTriangle size={20} />} />
        <StatCard label="Filled Today" value={stats.filledToday.toString()} color="purple" icon={<Package size={20} />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Redeem Section */}
        <div className="lg:col-span-1 space-y-6">
          {/* Redeem Card */}
          <GlassCard className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-100 dark:border-blue-800 h-full">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <CheckCircle className="text-blue-600" />
              Redeem Prescription
            </h3>
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                    type="text"
                    value={redeemToken}
                    onChange={(e) => setRedeemToken(e.target.value)}
                    placeholder="Enter Token..."
                    className="flex-1 p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <Button 
                    variant="secondary"
                    onClick={() => setIsScannerOpen(true)}
                    className="px-3"
                    title="Scan QR Code"
                >
                    <QrCode size={20} />
                </Button>
              </div>
              
              <Button 
                variant="primary" 
                onClick={handleRedeem}
                disabled={redeeming || !redeemToken}
                className="w-full justify-center"
              >
                {redeeming ? 'Verifying...' : 'Redeem Prescription'}
              </Button>
            </div>
            
             <div className="mt-6 p-4 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                    <strong>Tip:</strong> Use the scanner for faster verification. Tokens are one-time use only.
                </p>
            </div>

          </GlassCard>
        </div>

        {/* AI Optimization (Elevated) */}
        <div className="lg:col-span-2">
            <StockOptimization />
        </div>
      </div>

        {/* Inventory Management (Full Width) */}
        <div className="w-full">
           <PharmacyInventory mode="pharmacist" />
        </div>
    </div>
  );
}
