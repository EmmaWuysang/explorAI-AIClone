'use client';

import React, { useEffect, useState, useRef } from 'react';
import GlassCard from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import StatCard from '@/components/ui/StatCard';
import { Plus, Check, Clock, Pill, Activity, MapPin, Search, ShoppingBag, ShoppingCart, X, Star, Phone, Globe, RefreshCw } from 'lucide-react';
import ClinicMap, { ClinicMapRef } from '@/components/maps/ClinicMap';
import MapProvider from '@/components/maps/MapProvider';
import { Location } from '@/lib/db/mock-db';
import { Prescription } from '@/lib/types';
import PharmacyInventory from '@/components/dashboard/PharmacyInventory';
import QRCode from 'react-qr-code';
import { getPatientPrescriptions, logMedication, getMedicationLogs, requestRefill } from '@/lib/actions/prescription';
import { getAllClients, bookAppointment, getFirstDoctorId, getClientAppointments } from '@/lib/actions/user';
import ChatInterface from '@/components/dashboard/ChatInterface';
import CalendarModal from '@/components/dashboard/CalendarModal';


import { motion, AnimatePresence } from 'framer-motion';

export default function ClientDashboard() {
  const timeOfDay = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 18 ? 'Good afternoon' : 'Good evening';
  const [locations, setLocations] = useState<Location[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [medicationLogs, setMedicationLogs] = useState<any[]>([]);
  const [myAppointments, setMyAppointments] = useState<any[]>([]);
  const [refillLoading, setRefillLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [inventorySearchQuery, setInventorySearchQuery] = useState('');
  const [inventory, setInventory] = useState<any[]>([]);
  const mapRef = useRef<ClinicMapRef>(null);

  // Mock Active Meds


  const [isRxModalOpen, setIsRxModalOpen] = useState(false);
  const [isRefillModalOpen, setIsRefillModalOpen] = useState(false);
  const [selectedRxForQR, setSelectedRxForQR] = useState<any>(null);
  const [bookingAppointment, setBookingAppointment] = useState(false);
  const [appointmentSuccess, setAppointmentSuccess] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const [allClients, setAllClients] = useState<any[]>([]);
  const [currentClient, setCurrentClient] = useState<any>(null);
  const [takingMeds, setTakingMeds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Locations
        const locRes = await fetch('/api/data?type=locations&lat=37.7749&lng=-122.4194');
        const locData = await locRes.json();
        setLocations(locData);

        // Fetch All Clients for Hot Swap
        const clientsRes = await getAllClients();
        if (clientsRes.success && clientsRes.data) {
            setAllClients(clientsRes.data);
        }

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

  // Set default client
  useEffect(() => {
    if (!currentClient && allClients.length > 0) {
        setCurrentClient(allClients[0]);
    }
  }, [allClients, currentClient]);

  // Fetch prescriptions when current client changes
  // Poll for data (Real-time updates)
  useEffect(() => {
      if (currentClient) {
          const fetchData = async () => {
            // Fetch Prescriptions
            const rxRes = await getPatientPrescriptions(currentClient.id);
            if (rxRes.success && rxRes.data) {
                setPrescriptions(rxRes.data as any[]);
            }
            
            // Fetch Appointments
            const apptRes = await getClientAppointments(currentClient.id);
            if (apptRes.success && apptRes.data) {
                setMyAppointments(apptRes.data);
            }
          };
          
          fetchData(); // Initial
          const interval = setInterval(fetchData, 3000); // Poll every 3s
          return () => clearInterval(interval);
      }
  }, [currentClient]);

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
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
                {timeOfDay}, 
            </h2>
            <div className="relative group z-20">
                <button className="flex items-center gap-2 text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-80 transition-opacity">
                    {currentClient ? currentClient.name.split(' ')[0] : 'Guest'}
                    <span className="text-sm text-slate-400">▼</span>
                </button>
                
                {/* Hot Swap Dropdown */}
                <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden hidden group-hover:block">
                    <div className="p-2 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Switch Profile</p>
                    </div>
                    <div className="max-h-64 overflow-y-auto custom-scrollbar">
                        {allClients.map(client => (
                            <button
                                key={client.id}
                                onClick={() => setCurrentClient(client)}
                                className={`w-full text-left p-3 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${
                                    currentClient?.id === client.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                                }`}
                            >
                                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold">
                                    {client.name.charAt(0)}
                                </div>
                                <div>
                                    <p className={`text-sm font-medium ${
                                        currentClient?.id === client.id ? 'text-blue-600 dark:text-blue-400' : 'text-slate-900 dark:text-white'
                                    }`}>
                                        {client.name}
                                    </p>
                                    <p className="text-xs text-slate-500 truncate max-w-[140px]">{client.email}</p>
                                </div>
                                {currentClient?.id === client.id && <Check size={14} className="ml-auto text-blue-600" />}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-lg">You&apos;re on a 12-day streak! Keep it up.</p>
        </div>
        <div className="flex gap-3">
            <Button 
            variant="secondary" 
            size="lg" 
            leftIcon={<Pill size={20} />}
            onClick={() => setIsRxModalOpen(true)}
            >
            My Prescriptions
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content - Timeline */}
        <div className="lg:col-span-2 space-y-8">
        
          {/* Doctor & Messaging Section */}
          {myAppointments.some((a: any) => a.status === 'CONFIRMED') ? (
            <GlassCard className="border-blue-100 dark:border-blue-900/30 bg-blue-50/50 dark:bg-blue-900/10">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Activity className="text-blue-500" />
                            My Doctor
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 mt-1">
                            {myAppointments.find((a: any) => a.status === 'CONFIRMED')?.doctor.name}
                        </p>
                    </div>
                     <Button 
                        variant={showChat ? 'secondary' : 'primary'}
                        onClick={() => setShowChat(!showChat)}
                    >
                        {showChat ? 'Close Chat' : 'Message Doctor'}
                    </Button>
                </div>
                
                {showChat && (
                    <div className="mt-4 border-t border-slate-200 dark:border-slate-700 pt-4">
                         <ChatInterface 
                            currentUser={{ id: currentClient.id, name: currentClient.name }}
                            otherUser={{ 
                                id: myAppointments.find((a: any) => a.status === 'CONFIRMED')?.doctor.id, 
                                name: myAppointments.find((a: any) => a.status === 'CONFIRMED')?.doctor.name,
                                avatarUrl: myAppointments.find((a: any) => a.status === 'CONFIRMED')?.doctor.avatarUrl
                            }}
                            className="h-[400px]"
                        />
                    </div>
                )}
            </GlassCard>
        ) : myAppointments.some((a: any) => a.status === 'PENDING') ? (
             <GlassCard className="border-amber-100 dark:border-amber-900/30 bg-amber-50/50 dark:bg-amber-900/10">
                <div className="flex items-center gap-3">
                    <div className="p-3 rounded-full bg-amber-100 text-amber-600">
                        <Clock size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 dark:text-white">Appointment Requested</h3>
                        <p className="text-sm text-slate-500">Waiting for doctor confirmation.</p>
                    </div>
                </div>
             </GlassCard>
        ) : null}

          {/* Refill Center (Moved to Main for Visibility) */}
          <GlassCard className="!bg-gradient-to-br from-indigo-500 to-purple-600 text-white !border-none relative overflow-hidden group hover:shadow-lg hover:shadow-indigo-500/20 transition-all cursor-pointer" onClick={() => setIsRefillModalOpen(true)}>
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <RefreshCw size={80} />
            </div>
            <div className="relative z-10">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-lg font-bold mb-1 flex items-center gap-2">
                            <RefreshCw size={20} /> Refill Center
                        </h3>
                         <p className="text-indigo-100 text-sm mb-4">Manage your medication supply</p>
                    </div>
                    {(() => {
                        const refillableCount = prescriptions.filter(rx => (rx as any).refillsRemaining > 0).length;
                        return (
                            <div className="text-right">
                                <span className="text-4xl font-bold">{refillableCount}</span>
                                <p className="text-indigo-100 text-xs uppercase tracking-wider font-bold">Refills Available</p>
                            </div>
                        );
                    })()}
                </div>
                
                <Button 
                    variant="glass" 
                    size="sm" 
                    className="mt-2 group-hover:bg-white/20"
                >
                    Manage Refills →
                </Button>
            </div>
          </GlassCard>
          <GlassCard className="min-h-[400px]">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="text-blue-500" />
                Today&apos;s Schedule
              </h3>
              <Button variant="ghost" size="sm" onClick={() => setIsCalendarOpen(true)}>View Calendar</Button>
            </div>

            <div className="space-y-6 relative">
              {/* Timeline Line */}
              <div className="absolute left-8 top-4 bottom-4 w-0.5 bg-slate-100 dark:bg-slate-800" />

              {/* Timeline Items (Real Data) */}
              {prescriptions.length > 0 ? (
                prescriptions.map((rx: any, idx) => {
                  // Determine status based on logs (simplified logic for demo)
                  // In a real app, we'd check if a log exists for "today"
                  const todayLog = rx.logs?.find((log: any) => {
                      const logDate = new Date(log.takenAt);
                      const today = new Date();
                      return logDate.getDate() === today.getDate() &&
                             logDate.getMonth() === today.getMonth() &&
                             logDate.getFullYear() === today.getFullYear();
                  });
                  const isTaken = !!todayLog;
                  const isOptimisticTaken = isTaken || takingMeds[rx.id];
                  const status = isOptimisticTaken ? 'taken' : 'upcoming'; 

                  return (
                    <motion.div 
                        key={rx.id} 
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="relative flex items-center gap-6 group"
                    >
                      <div className={`
                        w-16 text-right text-sm font-medium transition-colors duration-500
                        ${status === 'taken' ? 'text-slate-400' : 'text-slate-900 dark:text-white'}
                      `}>
                        {/* Mock time for now, or parse from instructions if possible */}
                        8:00 AM
                      </div>
                      
                      <motion.div 
                        className={`
                            relative z-10 w-4 h-4 rounded-full border-2 
                        `}
                        animate={{
                            backgroundColor: status === 'taken' ? '#10b981' : '#ffffff',
                            borderColor: status === 'taken' ? '#10b981' : '#3b82f6',
                            scale: status === 'taken' ? 1.1 : 1
                        }}
                      />

                      <motion.div 
                        layout
                        className={`
                            flex-1 p-4 rounded-2xl border transition-all duration-300
                            ${status === 'upcoming' 
                            ? 'bg-white dark:bg-slate-800 border-blue-100 dark:border-blue-900/30 shadow-lg shadow-blue-500/5 scale-[1.02]' 
                            : 'bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/20'}
                        `}
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-4">
                            <motion.div 
                                className={`p-2.5 rounded-xl`}
                                animate={{
                                    backgroundColor: status === 'taken' ? '#d1fae5' : '#dbeafe',
                                    color: status === 'taken' ? '#059669' : '#2563eb'
                                }}
                            >
                              <Pill size={20} />
                            </motion.div>
                            <div>
                              <h4 className={`font-bold transition-colors ${status === 'taken' ? 'text-slate-500' : 'text-slate-900 dark:text-white'}`}>{rx.medicationName}</h4>
                              <p className="text-sm text-slate-500">{rx.dosage} • {rx.instructions}</p>
                            </div>
                          </div>
                          
                          <AnimatePresence mode="wait">
                            {status === 'upcoming' ? (
                                <motion.div
                                    key="take-btn"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                >
                                    <Button 
                                        variant="primary" 
                                        size="sm" 
                                        className="rounded-full px-6 shadow-md shadow-blue-500/20 hover:shadow-blue-500/30"
                                        disabled={takingMeds[rx.id]}
                                        onClick={async () => {
                                            setTakingMeds(prev => ({...prev, [rx.id]: true}));
                                            await logMedication(rx.id, 'TAKEN');
                                            // Refresh data
                                            if (currentClient) {
                                                const res = await getPatientPrescriptions(currentClient.id);
                                                if (res.success) setPrescriptions(res.data as any[]);
                                            }
                                        }}
                                    >
                                        {takingMeds[rx.id] ? <div className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" /> : "Take"}
                                    </Button>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="taken-badge"
                                    initial={{ opacity: 0, scale: 0.5, x: 20 }}
                                    animate={{ opacity: 1, scale: 1, x: 0 }}
                                    className="flex items-center gap-1 text-emerald-600 font-medium text-sm"
                                >
                                    <motion.div
                                        initial={{ rotate: -90 }}
                                        animate={{ rotate: 0 }}
                                        transition={{ type: "spring", stiffness: 200 }}
                                    >
                                        <Check size={18} strokeWidth={3} /> 
                                    </motion.div>
                                    Taken
                                </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </motion.div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-slate-500">
                    No active prescriptions.
                </div>
              )}
            </div>
          </GlassCard>

            {/* Pharmacy Store */}
          <div className="pt-8 border-t border-slate-200 dark:border-slate-700">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Pharmacy Services</h3>
            <div className="space-y-8">
                 <PharmacyInventory mode="client" />
                                  {/* Map Section (Updated) */}
                  <GlassCard className="h-[500px] relative overflow-hidden p-0">
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

                  {/* Selected Location Details Overlay */}
                  <AnimatePresence mode="wait">
                    {selectedLocation && (
                      <motion.div
                        key="details"
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 100 }}
                        className="absolute bottom-4 left-4 right-4 z-20"
                      >
                        <GlassCard className="border-blue-100 dark:border-blue-900/30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-2xl max-h-[300px] overflow-y-auto custom-scrollbar">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{selectedLocation.name}</h3>
                              <p className="text-blue-600 dark:text-blue-400 text-xs font-medium capitalize">{selectedLocation.type}</p>
                            </div>
                            <button 
                              onClick={() => setSelectedLocation(null)}
                              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                            >
                              <X size={18} className="text-slate-400" />
                            </button>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <div className="flex items-start gap-2 text-slate-600 dark:text-slate-300">
                                  <MapPin size={14} className="mt-1 shrink-0 text-blue-500" />
                                  <p className="text-xs">{selectedLocation.address}</p>
                                </div>
                                
                                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                                  <Clock size={14} className="shrink-0 text-blue-500" />
                                  <p className="text-xs">
                                    {selectedLocation.isOpen ? (
                                      <span className="text-emerald-600 font-bold">Open Now</span>
                                    ) : (
                                      <span className="text-rose-600 font-bold">Closed</span>
                                    )}
                                  </p>
                                </div>

                                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                                  <Star size={14} className="shrink-0 text-amber-400 fill-amber-400" />
                                  <p className="text-xs font-medium">{selectedLocation.rating} <span className="text-slate-400 font-normal">(128)</span></p>
                                </div>
                              </div>

                              <div className="space-y-2">
                                {/* Mock Appointment Booking */}
                                {!appointmentSuccess ? (
                                    <Button 
                                        variant="primary" 
                                        size="sm"
                                        className="w-full justify-center text-xs shadow-lg shadow-blue-500/20"
                                        onClick={async () => {
                                            setBookingAppointment(true);
                                            try {
                                                // For demo: book with the first doctor found
                                                const docRes = await getFirstDoctorId();
                                                if (docRes.success && docRes.data && currentClient) {
                                                    const res = await bookAppointment(currentClient.id, docRes.data);
                                                    if (res.success) {
                                                        setAppointmentSuccess(true);
                                                        setTimeout(() => setAppointmentSuccess(false), 5000);
                                                    }
                                                }
                                            } catch (error) {
                                                console.error("Booking failed", error);
                                            } finally {
                                                setBookingAppointment(false);
                                            }
                                        }}
                                        disabled={bookingAppointment}
                                    >
                                        {bookingAppointment ? (
                                            <span className="flex items-center gap-2">
                                                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                ...
                                            </span>
                                        ) : (
                                            'Request Appt'
                                        )}
                                    </Button>
                                ) : (
                                    <motion.div 
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="w-full p-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg text-center font-bold flex items-center justify-center gap-1 text-xs"
                                    >
                                        <Check size={14} />
                                        Sent!
                                    </motion.div>
                                )}

                                <div className="grid grid-cols-2 gap-2">
                                    <Button variant="secondary" size="sm" className="w-full justify-center text-xs">Directions</Button>
                                    <Button variant="secondary" size="sm" className="w-full justify-center text-xs">Call</Button>
                                </div>
                              </div>
                          </div>
                        </GlassCard>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  </GlassCard>
            </div>
          </div>
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

          {/* Refill Center (Moved to Main) */}
          <div className="hidden lg:block">
               {/* This space intentionally left blank as Refill Center was moved to main column */}
          </div>



          {/* Active Medications (New Section) */}
          <GlassCard>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Pill className="text-blue-500" />
                Active Medications
              </h3>
            </div>
            
            <div className="space-y-4">
              {prescriptions.length > 0 ? (
                prescriptions.map((rx: any) => (
                <div key={rx.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white">{rx.medicationName}</h4>
                      <p className="text-sm text-slate-500">{rx.dosage}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-bold ${rx.status === 'REDEEMED' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                      {rx.status}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mb-3">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-1000" 
                      style={{ width: '75%' }} 
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-slate-500 truncate max-w-[120px]">{rx.instructions}</p>
                    <div className="flex gap-2">
                        {rx.status === 'REDEEMED' && (
                            <Button 
                                size="sm" 
                                variant={takingMeds[rx.id] ? "ghost" : "primary"}
                                className={`h-8 text-xs ${takingMeds[rx.id] ? 'text-green-600 bg-green-50' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                                disabled={takingMeds[rx.id]}
                                onClick={async (e) => {
                                    e.stopPropagation();
                                    setTakingMeds(prev => ({...prev, [rx.id]: true}));
                                    await logMedication(rx.id, 'TAKEN');
                                    // Trigger refresh
                                    if(currentClient) {
                                      const res = await getPatientPrescriptions(currentClient.id);
                                      if (res.success && res.data) setPrescriptions(res.data as any[]);
                                    }
                                }}
                            >
                                {takingMeds[rx.id] ? (
                                    <>
                                        <Check size={14} className="mr-1" /> Taken
                                    </>
                                ) : (
                                    "Take"
                                )}
                            </Button>
                        )}
                        <Button size="sm" variant="secondary" className="h-8 text-xs" onClick={() => {
                            setSelectedRxForQR(rx);
                            setIsRxModalOpen(true);
                        }}>View</Button>
                    </div>
                  </div>
                </div>
              ))) : (
                  <p className="text-center text-slate-500 py-4">No active medications.</p>
              )}
            </div>
            
            <Button variant="ghost" className="w-full mt-4 text-slate-500">View All Medications</Button>
          </GlassCard>
        </div>
      </div>

      {/* Prescriptions Modal */}
      <AnimatePresence>
        {isRxModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-4xl h-[80vh]"
            >
              <GlassCard className="h-full flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">My Prescriptions</h3>
                  <button 
                    onClick={() => setIsRxModalOpen(false)}
                    className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="flex-1 overflow-hidden flex flex-col md:flex-row gap-6 relative">
                    {/* List */}
                    <div className={`flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar ${selectedRxForQR ? 'hidden md:block' : 'block'}`}>
                        {prescriptions.length > 0 ? (
                            prescriptions.map((rx: any) => (
                                <div 
                                    key={rx.id} 
                                    onClick={() => setSelectedRxForQR(rx)}
                                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                                        selectedRxForQR?.id === rx.id 
                                        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500' 
                                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-blue-300'
                                    }`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-bold text-slate-900 dark:text-white">{rx.medicationName}</h4>
                                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                                            rx.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                                        }`}>
                                            {rx.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-500 mb-1">{rx.dosage}</p>
                                    <p className="text-xs text-slate-400">{rx.instructions}</p>
                                </div>
                            ))
                        ) : (
                            <p className="text-slate-500 text-center py-8">No prescriptions found.</p>
                        )}
                    </div>

                    {/* QR Code Display */}
                    <div className={`
                        bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 flex-col items-center justify-center border border-slate-200 dark:border-slate-700
                        ${selectedRxForQR ? 'flex w-full md:w-1/3' : 'hidden md:flex md:w-1/3'}
                    `}>
                        {selectedRxForQR ? (
                            <div className="flex flex-col items-center w-full">
                                {/* Mobile Back Button */}
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedRxForQR(null);
                                    }}
                                    className="md:hidden self-start mb-4 flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
                                >
                                    <span className="text-lg">←</span> Back
                                </button>

                                {selectedRxForQR.status === 'PENDING' ? (
                                    <>
                                        <div className="bg-white p-4 rounded-xl shadow-sm mb-4">
                                            <QRCode value={selectedRxForQR.token} size={150} />
                                        </div>
                                        <h4 className="font-bold text-slate-900 dark:text-white mb-2 text-center">{selectedRxForQR.medicationName}</h4>
                                        <p className="text-sm text-slate-500 text-center mb-4">Show this QR code to the pharmacist to redeem.</p>
                                        <p className="text-xs font-mono bg-slate-200 dark:bg-slate-900 px-2 py-1 rounded text-slate-600 dark:text-slate-400 break-all">
                                            Token: {selectedRxForQR.token.substring(0, 8)}...
                                        </p>
                                    </>
                                ) : (
                                    <div className="text-center">
                                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Check size={32} />
                                        </div>
                                        <h4 className="font-bold text-slate-900 dark:text-white mb-2">Redeemed</h4>
                                        <p className="text-sm text-slate-500">This prescription has already been picked up.</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p className="text-slate-400 text-center">Select a prescription to view QR code</p>
                        )}
                    </div>
                </div>
              </GlassCard>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Refill Management Modal */}
      <AnimatePresence>
        {isRefillModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl"
            >
              <GlassCard className="flex flex-col max-h-[80vh]">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-full">
                        <RefreshCw size={24} />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Refill Center</h3>
                        <p className="text-slate-500">Manage your medication supply</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsRefillModalOpen(false)}
                    className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-1">
                    {prescriptions.filter((rx: any) => rx.refillsRemaining > 0).length > 0 ? (
                        <div className="space-y-4">
                            {prescriptions
                                .filter((rx: any) => rx.refillsRemaining > 0)
                                .map((rx: any) => {
                                    const hasPendingRefill = rx.refillRequests?.some((req: any) => req.status === 'PENDING');
                                    
                                    return (
                                        <div 
                                            key={rx.id} 
                                            className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-300 transition-colors bg-slate-50/50 dark:bg-slate-800/20"
                                        >
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <h4 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                                                        {rx.medicationName}
                                                        <span className="text-xs font-normal px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full">
                                                            {rx.refillsRemaining} refills left
                                                        </span>
                                                    </h4>
                                                    <p className="text-sm text-slate-500">{rx.dosage}</p>
                                                </div>
                                                {hasPendingRefill ? (
                                                     <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 flex items-center gap-1">
                                                        <Clock size={12} /> Requested
                                                     </span>
                                                ) : (
                                                    <Button 
                                                        size="sm"
                                                        className={`bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20`}
                                                        disabled={refillLoading}
                                                        onClick={async () => {
                                                            setRefillLoading(true);
                                                            try {
                                                                await requestRefill(rx.id);
                                                                // Refresh prescriptions
                                                                if (currentClient) {
                                                                    const res = await getPatientPrescriptions(currentClient.id);
                                                                    if (res.success && res.data) {
                                                                        setPrescriptions(res.data as any[]);
                                                                    }
                                                                }
                                                            } catch (err) {
                                                                console.error(err);
                                                            } finally {
                                                                setRefillLoading(false);
                                                            }
                                                        }}
                                                    >
                                                        {refillLoading ? (
                                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                        ) : (
                                                            'Request Refill'
                                                        )}
                                                    </Button>
                                                )}
                                            </div>
                                            
                                            <div className="flex items-center gap-4 text-xs text-slate-500">
                                                <div className="flex items-center gap-1">
                                                    <MapPin size={12} />
                                                    Last filled at Local Pharmacy
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Activity size={12} />
                                                    Prescribed by Dr. {rx.doctor?.name || 'Smith'}
                                                </div>
                                            </div>
                                        </div>
                                    );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                                <Check size={32} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">All Good!</h3>
                            <p className="text-slate-500 max-w-[200px] mx-auto">
                                You don&apos;t have any prescriptions that need refilling right now.
                            </p>
                        </div>
                    )}
                </div>

                <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                    <p className="text-xs text-slate-400 text-center">
                        Refill requests are usually processed within 24 hours. You&apos;ll be notified when your prescription is ready for pickup.
                    </p>
                </div>
              </GlassCard>
            </motion.div>
          </div>
        )}
      </AnimatePresence>


      <AnimatePresence>
        {isCalendarOpen && (
            <CalendarModal 
                isOpen={isCalendarOpen} 
                onClose={() => setIsCalendarOpen(false)} 
                appointments={myAppointments}
            />
        )}
      </AnimatePresence>
    </div>
  );
}
