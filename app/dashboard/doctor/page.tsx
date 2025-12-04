'use client';

import React, { useState } from 'react';
import GlassCard from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import { Users, FileText, AlertCircle, Search, Filter, MoreHorizontal, X, Activity, Pill } from 'lucide-react';
import { USERS } from '@/lib/db/mock-db';
import { motion, AnimatePresence } from 'framer-motion';

export default function DoctorDashboard() {
  const patients = USERS.filter(u => u.role === 'client');
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [patientDetails, setPatientDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handlePatientClick = async (patient: any) => {
    setSelectedPatient(patient);
    setLoading(true);
    try {
      const res = await fetch(`/api/data?type=user&userId=${patient.id}`);
      const data = await res.json();
      setPatientDetails(data);
    } catch (error) {
      console.error("Failed to fetch patient details", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 relative">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Doctor Portal</h2>
          <p className="text-slate-500 dark:text-slate-400">Manage your patients and prescriptions</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" leftIcon={<Filter size={18} />}>Filter</Button>
          <Button variant="primary" leftIcon={<FileText size={18} />}>New Prescription</Button>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard variant="hover" className="bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-800">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-blue-600 dark:text-blue-400 font-medium mb-1">Total Patients</p>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white">1,284</h3>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl text-blue-600">
              <Users size={24} />
            </div>
          </div>
        </GlassCard>
        
        <GlassCard variant="hover" className="bg-amber-50/50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-800">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-amber-600 dark:text-amber-400 font-medium mb-1">Pending Refills</p>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white">12</h3>
            </div>
            <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-xl text-amber-600">
              <AlertCircle size={24} />
            </div>
          </div>
        </GlassCard>

        <GlassCard variant="hover" className="bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-800">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-emerald-600 dark:text-emerald-400 font-medium mb-1">Appointments</p>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white">8</h3>
            </div>
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl text-emerald-600">
              <FileText size={24} />
            </div>
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Patient List */}
                           <img src={patient.avatarUrl} alt={patient.name} className="w-full h-full object-cover" />
                        </div>
                        <span className="font-medium text-slate-900 dark:text-white">{patient.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium border bg-green-50 text-green-700 border-green-200">
                        Stable
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-sm">Oct 24, 2023</td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100">
                        <MoreHorizontal size={18} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </GlassCard>
        </div>

        {/* Urgent Tasks */}
        <div className="space-y-6">
          <GlassCard className="bg-gradient-to-b from-amber-50 to-white dark:from-amber-900/10 dark:to-slate-900 border-amber-100 dark:border-amber-900/30">
            <h3 className="text-lg font-bold text-amber-900 dark:text-amber-100 mb-4 flex items-center gap-2">
              <AlertCircle size={20} className="text-amber-500" />
              Urgent Refills
            </h3>
            
            <div className="space-y-4">
              <div className="p-4 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-amber-100 dark:border-amber-900/20">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-slate-900 dark:text-white">Alex Thompson</h4>
                  <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded">ASAP</span>
                </div>
                <p className="text-sm text-slate-500 mb-4">Amoxicillin 500mg • Refill #2</p>
                <div className="flex gap-2">
                  <Button variant="primary" size="sm" className="flex-1 bg-amber-500 hover:bg-amber-600 border-none shadow-amber-500/20">Approve</Button>
                  <Button variant="ghost" size="sm" className="flex-1">Deny</Button>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>

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
              <GlassCard className="relative max-h-[80vh] overflow-y-auto">
                <button 
                  onClick={() => setSelectedPatient(null)}
                  className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X size={20} />
                </button>

                <div className="flex items-center gap-4 mb-8">
                  <div className="w-20 h-20 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={selectedPatient.avatarUrl} alt={selectedPatient.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{selectedPatient.name}</h3>
                    <p className="text-slate-500">{selectedPatient.email}</p>
                  </div>
                </div>

                {loading ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                ) : patientDetails ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
                        <div className="flex items-center gap-2 mb-2 text-blue-600 dark:text-blue-400">
                          <Activity size={20} />
                          <span className="font-bold">Adherence</span>
                        </div>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">95%</p>
                      </div>
                      <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800">
                        <div className="flex items-center gap-2 mb-2 text-purple-600 dark:text-purple-400">
                          <Pill size={20} />
                          <span className="font-bold">Active Meds</span>
                        </div>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{patientDetails.prescriptions?.length || 0}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-bold text-lg mb-4 text-slate-900 dark:text-white">Medication History</h4>
                      <div className="space-y-3">
                        {patientDetails.prescriptions?.map((rx: any, i: number) => (
                          <div key={i} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-bold text-slate-900 dark:text-white">{rx.medication?.name}</p>
                                <p className="text-sm text-slate-500">{rx.instructions}</p>
                              </div>
                              <span className={`px-2 py-1 rounded text-xs font-bold ${
                                rx.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'
                              }`}>
                                {rx.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-center text-slate-500">No details available.</p>
                )}
              </GlassCard>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
