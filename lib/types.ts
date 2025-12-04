export type UserRole = 'client' | 'doctor' | 'pharmacist';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
}

export interface Medication {
  id: string;
  name: string;
  description: string;
  dosageForm: string; // e.g., tablet, capsule, liquid
  strength: string; // e.g., 500mg
  sideEffects?: string[];
  interactions?: string[];
}

export interface InventoryItem {
  id: string;
  name: string;
  genericName: string;
  category: 'Antibiotic' | 'Pain Management' | 'Cardiovascular' | 'Antidepressant' | 'Antihistamine' | 'Diabetes' | 'Other';
  description: string;
  sideEffects: string[];
  price: number;
  stockLevel: number;
  dosageForm: string;
  strength: string;
  manufacturer: string;
  requiresPrescription: boolean;
  imageUrl?: string;
}

export interface Prescription {
  id: string;
  medicationId: string;
  patientId: string;
  doctorId: string;
  pharmacistId?: string; // Assigned pharmacist for verification
  status: 'pending' | 'verified' | 'filled' | 'cancelled';
  instructions: string;
  startDate: string;
  endDate?: string;
  refillsRemaining: number;
  createdAt: string;
}

export interface Reminder {
  id: string;
  prescriptionId: string;
  userId: string;
  time: string; // ISO time string or cron format
  daysOfWeek?: number[]; // 0-6 for Sunday-Saturday
  taken: boolean;
  takenAt?: string;
  skipped: boolean;
  skippedReason?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  relatedEntityId?: string; // Link to a medication or prescription context
  relatedEntityType?: 'medication' | 'prescription' | 'reminder';
}
