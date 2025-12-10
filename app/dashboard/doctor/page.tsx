'use client';

import React, { useState, useEffect } from 'react';
import GlassCard from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import { Users, FileText, AlertCircle, Search, Filter, MoreHorizontal, X, Activity, Pill, CheckCircle, RefreshCw, Clock } from 'lucide-react';
import { USERS } from '@/lib/db/mock-db';
import { motion, AnimatePresence } from 'framer-motion';
import { getDoctorPatients, getMedicationLogs, createPrescription } from '@/lib/actions/prescription';
import { getDoctorStats, getDoctorNotes, addDoctorNote, getRecentActivity, getPendingAppointments, acceptAppointment } from '@/lib/actions/doctor';
import { getFirstDoctorId, createUser, getAllClients } from '@/lib/actions/user';
import { searchProducts, getInventory, getFirstPharmacyId } from '@/lib/actions/pharmacy';
import ChatInterface from '@/components/dashboard/ChatInterface';
import CareReminders from '@/components/dashboard/CareReminders';

export default function DoctorDashboard() {
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [patientDetails, setPatientDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [rxPatients, setRxPatients] = useState<any[]>([]); 
  
  const [stats, setStats] = useState({ totalPatients: 0, activePrescriptions: 0, redeemedPrescriptions: 0 });
  const [doctorNotes, setDoctorNotes] = useState<any[]>([]);
  const [activity, setActivity] = useState<any[]>([]);
  const [newNote, setNewNote] = useState('');
  const [addingNote, setAddingNote] = useState(false);
  const [pendingAppointments, setPendingAppointments] = useState<any[]>([]);
  const [showChat, setShowChat] = useState(false);
  const [isRxModalOpen, setIsRxModalOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isAddPatientModalOpen, setIsAddPatientModalOpen] = useState(false);
  const [selectedPatientForRx, setSelectedPatientForRx] = useState<string | null>(null);
  const [newPatientName, setNewPatientName] = useState('');
  const [newPatientEmail, setNewPatientEmail] = useState('');
  const [addingPatient, setAddingPatient] = useState(false);
  const [addPatientError, setAddPatientError] = useState<string | null>(null);
  const [currentDoctor, setCurrentDoctor] = useState<any>({ name: 'Dr. Sarah Strange' });

  const refreshData = async (showLoading = true) => {
    if (showLoading) setRefreshing(true);
    
    try {
      // 1. Get Doctor ID
      const docRes = await getFirstDoctorId();
      if (!docRes.success || !docRes.data) return;
      
      const doctorId = docRes.data;
      setCurrentDoctor({ id: doctorId, name: 'Dr. Sarah Strange' });
      
      // 2. Get Patients
      const patientsRes = await getAllClients();
      if (patientsRes.success) {
          const clientData = patientsRes.data as any[];
          setPatients(clientData);
          setRxPatients(clientData); // Sync rxPatients
      }

      // 3. Get Stats
      const statsRes = await getDoctorStats(doctorId);
      if (statsRes.success && statsRes.data) {
          setStats({
              totalPatients: statsRes.data.totalPatients,
              activePrescriptions: statsRes.data.activePrescriptions,
              redeemedPrescriptions: statsRes.data.redeemedPrescriptions
          });
      }

      // 4. Get Activity
      const activityRes = await getRecentActivity(doctorId);
      if (activityRes.success) setActivity(activityRes.data || []);

      // 5. Get Pending Appointments
      const pendingRes = await getPendingAppointments(doctorId);
      if (pendingRes.success) setPendingAppointments(pendingRes.data || []);

    } catch (error) {
      console.error("Failed to refresh", error);
    } finally {
      if (showLoading) setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch data on mount & Poll
  useEffect(() => {
    refreshData(true);
    const interval = setInterval(() => {
        refreshData(false); 
    }, 4000); 
    return () => clearInterval(interval);
  }, []);

  const [inventory, setInventory] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  React.useEffect(() => {
    const fetchInventory = async () => {
      try {
        // 1. Get Pharmacy ID (simulating working with the first available pharmacy)
        const pharmacyRes = await getFirstPharmacyId();
        if (!pharmacyRes.success || !pharmacyRes.data) return;

        // 2. Get Inventory
        const res = await getInventory(pharmacyRes.data);
        if (res.success && res.data) {
            // Map Prisma data to UI shape
            const mapped = res.data.map((item: any) => ({
                id: item.id,
                name: item.product.name,
                genericName: item.product.description, // Using description as fallback for generic name
                strength: 'N/A', // DB might not have strength field yet
                price: item.price,
                stock: item.quantity
            }));
            
            // Client-side search filtering (since action search is currently separate)
            const filtered = searchQuery 
                ? mapped.filter((i: any) => i.name.toLowerCase().includes(searchQuery.toLowerCase()))
                : mapped;
                
            setInventory(filtered);
        }
      } catch (error) {
        console.error("Failed to fetch inventory", error);
      }
    };
    
    // Debounce search
    const timeoutId = setTimeout(() => {
      fetchInventory();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handlePatientClick = async (patient: any, showLoading = true) => {
    setSelectedPatient(patient);
    if (showLoading) setLoading(true);
    
    // Fetch detailed patient info
    try {
      const logsRes = await getMedicationLogs(patient.id);
      
      const notesRes = await getDoctorNotes('d1', patient.id);

      // Mock medical history for now, but use real prescriptions/logs
      setPatientDetails({
        email: patient.email,
        role: patient.role,
        medicalHistory: [
            { condition: 'Hypertension', date: '2023-01-15', notes: 'Diagnosed during annual checkup' },
            { condition: 'Seasonal Allergies', date: '2022-04-10', notes: 'Prescribed antihistamines' }
        ],
        prescriptions: logsRes.success ? logsRes.data : []
      });
      
      if (notesRes.success && notesRes.data) {
          setDoctorNotes(notesRes.data);
      }
    } catch (error) {
      console.error("Failed to fetch patient details", error);
    } finally {
      if (showLoading) setLoading(false);
    }
  };


  const [medicationName, setMedicationName] = useState('');
  const [dosage, setDosage] = useState('');
  const [instructions, setInstructions] = useState('');
  const [submittingRx, setSubmittingRx] = useState(false);



  const [medicationSuggestions, setMedicationSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [rxError, setRxError] = useState<string | null>(null);

  // Fetch medication suggestions
  React.useEffect(() => {
    const fetchSuggestions = async () => {
      if (medicationName.length < 2) {
        setMedicationSuggestions([]);
        return;
      }
      try {
        const res = await searchProducts(medicationName);
        if (res.success && res.data) {
          setMedicationSuggestions(res.data);
        }
      } catch (error) {
        console.error("Failed to fetch suggestions", error);
      }
    };

    const timeoutId = setTimeout(() => {
      if (showSuggestions) { // Only fetch if we are actively typing/searching
          fetchSuggestions();
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [medicationName, showSuggestions]);





  const handleAddPatient = async () => {
    if (!newPatientName || !newPatientEmail) {
      setAddPatientError("Name and Email are required.");
      return;
    }

    setAddingPatient(true);
    setAddPatientError(null);

    try {
      const res = await createUser({
        name: newPatientName,
        email: newPatientEmail,
        role: 'client'
      });

      if (res.success) {
        setIsAddPatientModalOpen(false);
        setNewPatientName('');
        setNewPatientEmail('');
        // Refresh patients list 
        refreshData();
      } else {
        setAddPatientError(res.error || "Failed to create patient.");
      }
    } catch (error) {
      setAddPatientError("An unexpected error occurred.");
    } finally {
      setAddingPatient(false);
    }
  };

  const handleCreatePrescription = async () => {
    if (!selectedPatientForRx || !medicationName || !dosage || !instructions) {
        setRxError("All fields are required.");
        return;
    }
    
    if (!currentDoctor?.id) {
        setRxError("Doctor profile not loaded. Please refresh.");
        return;
    }
    
    setSubmittingRx(true);
    setRxError(null);

    try {
      const res = await createPrescription({
        patientId: selectedPatientForRx,
        doctorId: currentDoctor.id,
        medicationName,
        dosage,
        instructions
      });

      if (res.success) {
        setIsRxModalOpen(false);
        // Reset form
        setSelectedPatientForRx(null);
        setMedicationName('');
        setDosage('');
        setInstructions('');
        setRxError(null);
        refreshData(); // Refresh stats
      } else {
        setRxError(res.error || "Failed to create prescription.");
      }
    } catch (error) {
      setRxError("An unexpected error occurred.");
      console.error(error);
    } finally {
      setSubmittingRx(false);
    }
  };

  const handleAddNote = async () => {
      if (!newNote.trim() || !selectedPatient || !currentDoctor?.id) return;
      
      setAddingNote(true);
      try {
          const res = await addDoctorNote(currentDoctor.id, selectedPatient.id, newNote);
          if (res.success && res.data) {
              setDoctorNotes([res.data, ...doctorNotes]);
              setNewNote('');
          }
      } catch (error) {
          console.error("Failed to add note", error);
      } finally {
          setAddingNote(false);
      }
  };

  return (
    <div className="space-y-8 relative">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Doctor Portal</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage patients and prescriptions</p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="ghost" 
            onClick={() => refreshData()}
            className={`${refreshing ? 'animate-spin' : ''}`}
            title="Refresh Data"
          >
            <RefreshCw className="w-5 h-5" />
          </Button>
          <Button variant="outline" onClick={() => setIsAddPatientModalOpen(true)}>
            <Users className="w-4 h-4 mr-2" />
            Add Patient
          </Button>
          <Button variant="primary" onClick={() => setIsRxModalOpen(true)}>
            <Pill className="w-4 h-4 mr-2" />
            New Prescription
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="p-6 flex items-center gap-4">
          <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Total Patients</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalPatients}</p>
          </div>
        </GlassCard>
        
        <GlassCard className="p-6 flex items-center gap-4">
          <div className="p-3 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Active Prescriptions</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.activePrescriptions}</p>
          </div>
        </GlassCard>

        <GlassCard className="p-6 flex items-center gap-4">
          <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Redeemed Prescriptions</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.redeemedPrescriptions}</p>
          </div>
        </GlassCard>
      </div>

      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Urgent & Feed */}
        <div className="space-y-6">
            {/* Pending Appointments (Moved to High Priority) */}
            <GlassCard className="border-amber-100 dark:border-amber-900/30 bg-amber-50/50 dark:bg-amber-900/10">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Clock className="text-amber-500" />
                Appointment Requests
              </h3>
              {pendingAppointments.length > 0 ? (
                  <div className="space-y-3">
                    {pendingAppointments.map((appt) => (
                      <div key={appt.id} className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-xl border border-amber-100 dark:border-amber-800/30 shadow-sm">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center font-bold text-amber-700 dark:text-amber-400">
                              {appt.patient.name.charAt(0)}
                           </div>
                           <div>
                              <p className="font-bold text-slate-900 dark:text-white text-sm">{appt.patient.name}</p>
                              <p className="text-xs text-slate-500">{new Date(appt.date).toLocaleDateString()}</p>
                           </div>
                        </div>
                        <Button 
                          variant="primary" 
                          size="sm"
                          onClick={async () => {
                              await acceptAppointment(appt.id);
                              refreshData();
                          }}
                          className="bg-amber-500 hover:bg-amber-600 border-amber-500 text-xs px-3"
                        >
                          Accept
                        </Button>
                      </div>
                    ))}
                  </div>
              ) : (
                  <p className="text-sm text-slate-500 text-center py-4">No pending requests.</p>
              )}
            </GlassCard>

            {/* Recent Activity Feed (New Implementation) */}
            <GlassCard>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <Activity className="text-blue-500" />
                    Recent Activity
                </h3>
                <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                    {activity.length > 0 ? (
                        activity.map((act, i) => (
                            <div key={i} className="flex gap-3 items-start p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                                <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${
                                    act.type === 'PRESCRIPTION_REDEEMED' ? 'bg-green-500' : 
                                    act.type === 'MEDICATION_TAKEN' ? 'bg-purple-500' :
                                    act.type === 'PRESCRIPTION_CREATED' ? 'bg-blue-500' : 'bg-slate-400'
                                }`} />
                                <div>
                                    <p className="text-sm text-slate-900 dark:text-white font-medium">{act.description}</p>
                                    <p className="text-xs text-slate-500 mt-1">{new Date(act.timestamp).toLocaleString()}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-slate-500 text-center py-8">No recent activity.</p>
                    )}
                </div>
            </GlassCard>
        </div>

        {/* Right Columns: Patient Management (Spans 2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <CareReminders onMessage={(patientId) => {
            const patient = patients.find(p => p.id === patientId);
            if (patient) {
                handlePatientClick(patient);
                setShowChat(true);
                setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }), 100);
            }
          }} />
          
          <div className="flex items-center justify-between pt-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Recent Patients</h2>
            <Button variant="ghost" size="sm">View All</Button>
          </div>

          <div className="space-y-4">
            {patients.map((patient) => (
              <GlassCard 
                key={patient.id}
                className="p-4 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                onClick={() => handlePatientClick(patient)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 font-medium">
                    {patient.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-900 dark:text-white">{patient.name}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">ID: {patient.id}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal size={16} />
                </Button>
              </GlassCard>
            ))}
          </div>

          <div className="flex items-center justify-between pt-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Pharmacy Inventory</h2>
          </div>

          <GlassCard className="p-4">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Search medications..." 
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {inventory.map((item) => (
                <div key={item.id} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-medium text-slate-900 dark:text-white text-sm">{item.name}</h4>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${item.stock > 10 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                      {item.stock > 0 ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{item.genericName}</p>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-600 dark:text-slate-300">{item.strength}</span>
                    <span className="font-medium text-blue-600 dark:text-blue-400">${item.price}</span>
                  </div>
                </div>
              ))}
              {inventory.length === 0 && (
                <div className="text-center py-8 text-slate-500 dark:text-slate-400 text-sm">
                  No medications found
                </div>
              )}
            </div>
          </GlassCard>
        </div>
      </div>
      
      {/* New Prescription Modal */}
      {/* Patient Details Modal */}
      <AnimatePresence>
        {selectedPatient && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl"
            >
              <GlassCard className="max-h-[80vh] overflow-y-auto custom-scrollbar">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xl">
                      {selectedPatient.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">{selectedPatient.name}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Patient ID: {selectedPatient.id}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedPatient(null)}
                    className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                {loading ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : patientDetails ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Email</p>
                        <p className="font-medium text-slate-900 dark:text-white">{patientDetails.email}</p>
                      </div>
                      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Role</p>
                        <p className="font-medium text-slate-900 dark:text-white capitalize">{patientDetails.role}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white mb-3">Medical History</h4>
                      {patientDetails.medicalHistory && patientDetails.medicalHistory.length > 0 ? (
                        <div className="space-y-2">
                          {patientDetails.medicalHistory.map((record: any, idx: number) => (
                            <div key={idx} className="p-3 rounded-lg border border-slate-100 dark:border-slate-700">
                              <p className="font-medium text-slate-900 dark:text-white">{record.condition}</p>
                              <p className="text-sm text-slate-500 dark:text-slate-400">{record.date} • {record.notes}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-slate-500 dark:text-slate-400 italic">No medical history available.</p>
                      )}
                    </div>

                    {/* Doctor Notes Section */}
                    <div>
                        <h4 className="font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                            <FileText className="text-purple-500" size={18} />
                            Doctor Notes
                        </h4>
                        <div className="space-y-3 mb-4">
                            {doctorNotes.length > 0 ? (
                                doctorNotes.map((note) => (
                                    <div key={note.id} className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-100 dark:border-yellow-900/30">
                                        <p className="text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap">{note.content}</p>
                                        <p className="text-xs text-slate-400 mt-2 text-right">
                                            {new Date(note.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-slate-500 dark:text-slate-400 italic text-sm">No notes added yet.</p>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <textarea 
                                value={newNote}
                                onChange={(e) => setNewNote(e.target.value)}
                                placeholder="Add a private note about this patient..."
                                className="flex-1 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none text-sm"
                                rows={2}
                            />
                            <Button 
                                variant="secondary" 
                                onClick={handleAddNote}
                                disabled={addingNote || !newNote.trim()}
                                className="h-auto"
                            >
                                {addingNote ? 'Saving...' : 'Add Note'}
                            </Button>
                        </div>
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white mb-3">Current Prescriptions</h4>
                      {patientDetails.prescriptions && patientDetails.prescriptions.length > 0 ? (
                        <div className="space-y-2">
                          {patientDetails.prescriptions.map((rx: any) => (
                            <div key={rx.id} className="flex items-center justify-between p-3 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30">
                              <div>
                                <p className="font-medium text-slate-900 dark:text-white">{rx.medicationName}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{rx.dosage} • {rx.instructions}</p>
                              </div>
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                rx.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'
                              }`}>
                                {rx.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-slate-500 dark:text-slate-400 italic">No active prescriptions.</p>
                      )}
                    </div>

                    <div className="flex gap-3 mt-8">
                      <Button 
                        variant="primary" 
                        className="flex-1 justify-center"
                        leftIcon={<FileText size={18} />}
                        onClick={() => {
                          setSelectedPatientForRx(selectedPatient.id);
                          setIsRxModalOpen(true);
                        }}
                      >
                        Prescribe
                      </Button>
                      <Button 
                        variant="secondary" 
                        className="flex-1 justify-center"
                        leftIcon={<Activity size={18} />}
                        onClick={() => setShowChat(!showChat)}
                      >
                        {showChat ? 'Close Chat' : 'Message'}
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="px-3"
                        onClick={() => setIsNoteModalOpen(true)}
                      >
                        Note
                      </Button>
                    </div>

                    {showChat && selectedPatient && (
                        <div className="mt-6 border-t border-slate-100 dark:border-slate-700 pt-6">
                            <ChatInterface 
                                currentUser={{ id: currentDoctor?.id || 'cmiyzkn610000jvvbmofqikx1', name: 'Dr. Sarah Strange' }}
                                otherUser={{ id: selectedPatient.id, name: selectedPatient.name, avatarUrl: selectedPatient.avatarUrl }}
                                className="h-[400px]"
                            />
                        </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    Failed to load patient details.
                  </div>
                )}
              </GlassCard>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isAddPatientModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg"
            >
              <GlassCard>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">Add New Patient</h3>
                  <button 
                    onClick={() => setIsAddPatientModalOpen(false)}
                    className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-4">
                  {addPatientError && (
                    <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm font-medium border border-red-100">
                        {addPatientError}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={newPatientName}
                      onChange={(e) => setNewPatientName(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={newPatientEmail}
                      onChange={(e) => setNewPatientEmail(e.target.value)}
                      placeholder="e.g. john@example.com"
                      className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <Button 
                    variant="primary" 
                    className="w-full justify-center mt-4"
                    onClick={handleAddPatient}
                    disabled={addingPatient || !newPatientName || !newPatientEmail}
                  >
                    {addingPatient ? 'Adding Patient...' : 'Add Patient'}
                  </Button>
                </div>
              </GlassCard>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isRxModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg"
            >
              <GlassCard>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">New Prescription</h3>
                  <button 
                    onClick={() => setIsRxModalOpen(false)}
                    className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-4">
                  {rxError && (
                    <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm font-medium border border-red-100">
                        {rxError}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Patient</label>
                    <select
                      value={selectedPatientForRx || ''}
                      onChange={(e) => setSelectedPatientForRx(e.target.value)}
                      className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="">Select a patient...</option>
                      {patients.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="relative">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Medication Name</label>
                    <input
                      type="text"
                      value={medicationName}
                      onChange={(e) => {
                          setMedicationName(e.target.value);
                          setShowSuggestions(true);
                      }}
                      onFocus={() => setShowSuggestions(true)}
                      placeholder="e.g. Amoxicillin"
                      className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    {showSuggestions && medicationSuggestions.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                            {medicationSuggestions.map((med) => (
                                <button
                                    key={med.id}
                                    className="w-full text-left p-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors border-b border-slate-100 dark:border-slate-700 last:border-0"
                                    onClick={() => {
                                        setMedicationName(med.name);
                                        setDosage(med.strength || ''); // Auto-fill dosage if available
                                        setShowSuggestions(false);
                                    }}
                                >
                                    <p className="font-bold text-slate-900 dark:text-white">{med.name}</p>
                                    <p className="text-xs text-slate-500">{med.genericName} • {med.strength}</p>
                                </button>
                            ))}
                        </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Dosage</label>
                      <input
                        type="text"
                        value={dosage}
                        onChange={(e) => setDosage(e.target.value)}
                        placeholder="e.g. 500mg"
                        list="dosage-suggestions"
                        className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                      <datalist id="dosage-suggestions">
                        <option value="10mg" />
                        <option value="20mg" />
                        <option value="50mg" />
                        <option value="100mg" />
                        <option value="200mg" />
                        <option value="500mg" />
                        <option value="1000mg" />
                        <option value="5ml" />
                        <option value="10ml" />
                      </datalist>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Quantity</label>
                      <input
                        type="number"
                        placeholder="e.g. 30"
                        className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="relative">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Instructions</label>
                    <textarea
                      value={instructions}
                      onChange={(e) => setInstructions(e.target.value)}
                      placeholder="e.g. Take one capsule every 8 hours with food"
                      rows={3}
                      className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                    />
                    <div className="absolute top-full left-0 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg mt-1 z-20 hidden group-focus-within:block">
                        {/* This is a simple implementation, for a better one we'd need state */}
                    </div>
                    <div className="flex gap-2 mt-2 overflow-x-auto pb-2 custom-scrollbar">
                        {['Take once daily', 'Take twice daily', 'Take with food', 'Before bed', 'As needed'].map(note => (
                            <button
                                key={note}
                                onClick={() => setInstructions(prev => prev ? `${prev}, ${note}` : note)}
                                className="whitespace-nowrap px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-medium hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                            >
                                + {note}
                            </button>
                        ))}
                    </div>
                  </div>

                  <Button 
                    variant="primary" 
                    className="w-full justify-center mt-4"
                    onClick={handleCreatePrescription}
                    disabled={submittingRx || !selectedPatientForRx || !medicationName}
                  >
                    {submittingRx ? 'Creating Prescription...' : 'Create Prescription'}
                  </Button>
                </div>
              </GlassCard>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
