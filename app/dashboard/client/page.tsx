'use client';

import React, { useEffect, useState, useRef } from 'react';
import GlassCard from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import StatCard from '@/components/ui/StatCard';
import { Plus, Check, Clock, Pill, Activity, MapPin, Search, ShoppingBag, ShoppingCart, X, Star, Phone, Globe } from 'lucide-react';
import ClinicMap, { ClinicMapRef } from '@/components/maps/ClinicMap';
import MapProvider from '@/components/maps/MapProvider';
import { Location } from '@/lib/db/mock-db';
import { Prescription } from '@/lib/types';

import { motion, AnimatePresence } from 'framer-motion';

export default function ClientDashboard() {
  const timeOfDay = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 18 ? 'Good afternoon' : 'Good evening';
  const [locations, setLocations] = useState<Location[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [inventorySearchQuery, setInventorySearchQuery] = useState('');
  const [inventory, setInventory] = useState<any[]>([]);
  const mapRef = useRef<ClinicMapRef>(null);

  // Mock Active Meds
  const activeMeds = [
    { id: 'am1', name: 'Amoxicillin', dosage: '500mg', timeLeft: '2 hrs', progress: 75, pillsLeft: 12 },
    { id: 'am2', name: 'Lisinopril', dosage: '10mg', timeLeft: '12 hrs', progress: 20, pillsLeft: 28 },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Locations
        const locRes = await fetch('/api/data?type=locations&lat=37.7749&lng=-122.4194');
        const locData = await locRes.json();
        setLocations(locData);

        // Fetch Prescriptions (Mock User ID 'u1')
        const rxRes = await fetch('/api/data?type=prescriptions&userId=u1');
        const rxData = await rxRes.json();
        setPrescriptions(rxData);

        // Fetch Inventory
        const invRes = await fetch(`/api/data?type=inventory${inventorySearchQuery ? `&search=${inventorySearchQuery}` : ''}`);
        const invData = await invRes.json();
        setInventory(invData);

      } catch (error) {
        console.error("Failed to fetch data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [inventorySearchQuery]);

  const handleSearch = () => {
    if (mapRef.current && searchQuery) {
      mapRef.current.search(searchQuery);
    }
  };

  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

  const handleLocationSelect = (location: Location) => {
    setSelectedLocation(location);
    // Optional: Scroll to details or show modal
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight mb-1">
            {timeOfDay}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Alex</span>
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-lg">You&apos;re on a 12-day streak! Keep it up.</p>
        </div>
        <Button 
          variant="primary" 
          size="lg" 
          leftIcon={<Plus size={20} />}
          className="shadow-xl shadow-blue-500/20"
        >
          Add Medication
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content - Timeline */}
        <div className="lg:col-span-2 space-y-8">
          <GlassCard className="min-h-[400px]">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="text-blue-500" />
                Today&apos;s Schedule
              </h3>
              <Button variant="ghost" size="sm">View Calendar</Button>
            </div>

            <div className="space-y-6 relative">
              {/* Timeline Line */}
              <div className="absolute left-8 top-4 bottom-4 w-0.5 bg-slate-100 dark:bg-slate-800" />

              {/* Timeline Items (Mixed Mock + Real Data could go here, using static for now for visual consistency) */}
              {[
                { time: '8:00 AM', name: 'Amoxicillin', dose: '500mg', status: 'upcoming', type: 'pill' },
                { time: '9:00 AM', name: 'Vitamin D', dose: '1000IU', status: 'taken', type: 'capsule' },
                { time: '8:00 PM', name: 'Lisinopril', dose: '10mg', status: 'future', type: 'tablet' },
              ].map((item, idx) => (
                <div key={idx} className="relative flex items-center gap-6 group">
                  <div className={`
                    w-16 text-right text-sm font-medium 
                    ${item.status === 'taken' ? 'text-slate-400' : 'text-slate-900 dark:text-white'}
                  `}>
                    {item.time}
                  </div>
                  
                  <div className={`
                    relative z-10 w-4 h-4 rounded-full border-2 
                    ${item.status === 'taken' ? 'bg-emerald-500 border-emerald-500' : 
                      item.status === 'upcoming' ? 'bg-white border-blue-500 ring-4 ring-blue-500/20' : 
                      'bg-slate-200 border-slate-300 dark:bg-slate-700 dark:border-slate-600'}
                  `} />

                  <div className={`
                    flex-1 p-4 rounded-2xl border transition-all duration-300
                    ${item.status === 'upcoming' 
                      ? 'bg-white dark:bg-slate-800 border-blue-100 dark:border-blue-900/30 shadow-lg shadow-blue-500/5 scale-[1.02]' 
                      : 'bg-slate-50 dark:bg-slate-800/50 border-transparent opacity-80'}
                  `}>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <div className={`p-2.5 rounded-xl ${item.status === 'upcoming' ? 'bg-blue-100 text-blue-600' : 'bg-slate-200 text-slate-500'}`}>
                          <Pill size={20} />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-white">{item.name}</h4>
                          <p className="text-sm text-slate-500">{item.dose} • {item.type}</p>
                        </div>
                      </div>
                      
                      {item.status === 'upcoming' && (
                        <Button variant="primary" size="sm" className="rounded-full px-6">
                          Take
                        </Button>
                      )}
                      {item.status === 'taken' && (
                        <span className="flex items-center gap-1 text-emerald-600 font-medium text-sm">
                          <Check size={16} /> Taken
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Map Section (Updated) */}
          <GlassCard className="h-[400px] relative overflow-hidden p-0">
             <div className="absolute top-4 left-4 z-10 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-3 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <MapPin className="text-blue-500" size={18} />
                Nearby Services
              </h3>
            </div>
            <MapProvider>
              <ClinicMap 
                ref={mapRef}
                locations={locations}
                onLocationSelect={handleLocationSelect}
              />
            </MapProvider>
          </GlassCard>

          {/* Pharmacy Store */}
          <GlassCard>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShoppingBag className="text-emerald-500" />
                Pharmacy Store
              </h3>
              <Button variant="ghost" size="sm">View All</Button>
            </div>

            <div className="relative mb-6">
              <input 
                type="text" 
                placeholder="Search medications..." 
                value={inventorySearchQuery} // Use the new inventorySearchQuery state
                onChange={(e) => setInventorySearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-emerald-500 transition-all"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {inventory.slice(0, 6).map((item) => (
                <div key={item.id} className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-emerald-200 dark:hover:border-emerald-900/50 transition-all hover:shadow-md bg-white dark:bg-slate-800/50 group">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400">
                      {item.category}
                    </span>
                    {item.requiresPrescription && (
                      <span className="text-xs font-bold text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded">Rx</span>
                    )}
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white mb-1 group-hover:text-emerald-600 transition-colors">{item.name}</h4>
                  <p className="text-sm text-slate-500 mb-3">{item.genericName}</p>
                  <div className="flex items-center justify-between mt-auto">
                    <p className="font-bold text-lg text-slate-900 dark:text-white">${item.price.toFixed(2)}</p>
                    <Button size="sm" variant="secondary" className="h-8 px-3">Add</Button>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Weekly Adherence (Original StatCard) */}
          <StatCard 
            label="Weekly Adherence" 
            value="95%" 
            trend={{ value: 5, isPositive: true }}
            icon={<Activity size={24} />}
            color="green"
          />

          {/* Next Refill (Original GlassCard) */}
          <GlassCard className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-none">
            <h3 className="text-lg font-bold mb-2">Next Refill</h3>
            <div className="flex items-center justify-between mb-4">
              <span className="text-indigo-100">Lisinopril</span>
              <span className="bg-white/20 px-2 py-1 rounded text-xs font-medium">3 days left</span>
            </div>
            <Button variant="glass" size="sm" className="w-full justify-center">
              Order Refill
            </Button>
          </GlassCard>

          {/* Selected Location Details (Updated) */}
          <AnimatePresence mode="wait">
            {selectedLocation ? (
              <motion.div
                key="details"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <GlassCard className="border-blue-100 dark:border-blue-900/30 bg-blue-50/50 dark:bg-blue-900/10">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">{selectedLocation.name}</h3>
                      <p className="text-blue-600 dark:text-blue-400 text-sm font-medium capitalize">{selectedLocation.type}</p>
                    </div>
                    <button 
                      onClick={() => setSelectedLocation(null)}
                      className="p-1 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-full transition-colors"
                    >
                      <X size={18} className="text-slate-400" />
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 text-slate-600 dark:text-slate-300">
                      <MapPin size={18} className="mt-1 shrink-0 text-blue-500" />
                      <p className="text-sm">{selectedLocation.address}</p>
                    </div>
                    
                    <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                      <Clock size={18} className="shrink-0 text-blue-500" />
                      <p className="text-sm">
                        {selectedLocation.isOpen ? (
                          <span className="text-emerald-600 font-bold">Open Now</span>
                        ) : (
                          <span className="text-rose-600 font-bold">Closed</span>
                        )}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                      <Star size={18} className="shrink-0 text-amber-400 fill-amber-400" />
                      <p className="text-sm font-medium">{selectedLocation.rating} <span className="text-slate-400 font-normal">(128 reviews)</span></p>
                    </div>

                    {selectedLocation.phone && (
                      <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                        <Phone size={18} className="shrink-0 text-blue-500" />
                        <a href={`tel:${selectedLocation.phone}`} className="text-sm hover:underline">{selectedLocation.phone}</a>
                      </div>
                    )}

                    {selectedLocation.website && (
                      <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                        <Globe size={18} className="shrink-0 text-blue-500" />
                        <a href={selectedLocation.website} target="_blank" rel="noopener noreferrer" className="text-sm hover:underline truncate max-w-[200px]">
                          Visit Website
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <Button variant="primary" className="w-full justify-center">Directions</Button>
                    <Button variant="secondary" className="w-full justify-center">Call Now</Button>
                  </div>
                </GlassCard>
              </motion.div>
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <GlassCard className="text-center py-12 border-dashed border-2 border-slate-200 dark:border-slate-700 bg-transparent shadow-none">
                  <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                    <MapPin size={32} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No Location Selected</h3>
                  <p className="text-slate-500 text-sm max-w-[200px] mx-auto">
                    Click on a map marker to view detailed information about a clinic or pharmacy.
                  </p>
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Active Medications (New Section) */}
          <GlassCard>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Pill className="text-blue-500" />
                Active Medications
              </h3>
            </div>
            
            <div className="space-y-4">
              {activeMeds.map((med) => (
                <div key={med.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white">{med.name}</h4>
                      <p className="text-sm text-slate-500">{med.dosage}</p>
                    </div>
                    <span className="px-2 py-1 rounded text-xs font-bold bg-blue-100 text-blue-700">
                      {med.timeLeft}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mb-3">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-1000" 
                      style={{ width: `${med.progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-slate-500">{med.pillsLeft} pills left</p>
                    <Button size="sm" variant="secondary" className="h-8 text-xs">Take</Button>
                  </div>
                </div>
              ))}
            </div>
            
            <Button variant="ghost" className="w-full mt-4 text-slate-500">View All Medications</Button>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
