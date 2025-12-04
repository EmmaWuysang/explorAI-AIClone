'use client';

import React, { useEffect, useState, useRef } from 'react';
import GlassCard from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import StatCard from '@/components/ui/StatCard';
import { Plus, Check, Clock, Pill, Activity, MapPin, Search } from 'lucide-react';
import ClinicMap, { ClinicMapRef } from '@/components/maps/ClinicMap';
import MapProvider from '@/components/maps/MapProvider';
import { Location } from '@/lib/db/mock-db';
import { Prescription } from '@/lib/types';

export default function ClientDashboard() {
  const timeOfDay = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 18 ? 'Good afternoon' : 'Good evening';
  const [locations, setLocations] = useState<Location[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const mapRef = useRef<ClinicMapRef>(null);

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
      } catch (error) {
        console.error("Failed to fetch data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearch = () => {
    if (mapRef.current && searchQuery) {
      mapRef.current.search(searchQuery);
    }
  };

  return (
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

          {/* Map Section */}
          <div className="space-y-4">
             <div className="flex items-center justify-between">
               <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <MapPin className="text-blue-500" />
                  Nearby Care
                </h3>
                <div className="flex gap-2">
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="Search pharmacies..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      className="pl-4 pr-10 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-blue-500"
                    />
                    <button 
                      onClick={handleSearch}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-500"
                    >
                      <Search size={16} />
                    </button>
                  </div>
                </div>
             </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <MapProvider>
                  <ClinicMap ref={mapRef} locations={locations} onLocationSelect={handleLocationSelect} />
                </MapProvider>
              </div>
              
              {/* Selected Location Details */}
              <div className="md:col-span-1">
                {selectedLocation ? (
                  <GlassCard className="h-full flex flex-col">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-lg leading-tight mb-1">{selectedLocation.name}</h4>
                        <span className={`text-xs px-2 py-1 rounded-full ${selectedLocation.type === 'pharmacy' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                          {selectedLocation.type.charAt(0).toUpperCase() + selectedLocation.type.slice(1)}
                        </span>
                      </div>
                      <div className="flex flex-col items-end">
                        <div className="flex items-center gap-1 text-amber-500 font-bold">
                          <span>★</span> {selectedLocation.rating || 'N/A'}
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300 flex-1">
                      <div className="flex gap-2">
                        <MapPin size={16} className="shrink-0 mt-0.5 text-slate-400" />
                        <p>{selectedLocation.address}</p>
                      </div>
                      
                      {selectedLocation.isOpen !== undefined && (
                        <div className="flex gap-2">
                          <Clock size={16} className="shrink-0 mt-0.5 text-slate-400" />
                          <p className={selectedLocation.isOpen ? "text-emerald-600 font-medium" : "text-red-500"}>
                            {selectedLocation.isOpen ? "Open Now" : "Closed"}
                          </p>
                        </div>
                      )}

                      {selectedLocation.phone && (
                        <div className="flex gap-2">
                          <div className="shrink-0 mt-0.5 text-slate-400">📞</div>
                          <a href={`tel:${selectedLocation.phone}`} className="hover:text-blue-500 transition-colors">{selectedLocation.phone}</a>
                        </div>
                      )}

                      {selectedLocation.website && (
                        <div className="flex gap-2">
                          <div className="shrink-0 mt-0.5 text-slate-400">🌐</div>
                          <a href={selectedLocation.website} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline truncate block">
                            Visit Website
                          </a>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                      <Button variant="primary" size="sm" className="w-full justify-center">
                        Get Directions
                      </Button>
                    </div>
                  </GlassCard>
                ) : (
                  <GlassCard className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                    <MapPin size={32} className="mb-2 opacity-50" />
                    <p className="text-sm">Select a location on the map to see details</p>
                  </GlassCard>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Stats */}
        <div className="space-y-6">
          <StatCard 
            label="Weekly Adherence" 
            value="95%" 
            trend={{ value: 5, isPositive: true }}
            icon={<Activity size={24} />}
            color="green"
          />
          
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

          <GlassCard>
            <h3 className="text-lg font-bold mb-4 text-slate-900 dark:text-white">Active Meds</h3>
            <div className="space-y-3">
              {prescriptions.length > 0 ? prescriptions.map((rx: any, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="font-medium text-slate-700 dark:text-slate-200">{rx.medication?.name}</span>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400">
                    →
                  </div>
                </div>
              )) : (
                <p className="text-slate-500 text-sm">No active medications.</p>
              )}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
