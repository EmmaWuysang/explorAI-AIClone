import { User, Medication, Prescription, Reminder } from '@/lib/types';

// Extended Types for Location
export interface Location {
    id: string;
    name: string;
    type: 'pharmacy' | 'clinic' | 'hospital';
    address: string;
    lat: number;
    lng: number;
    rating: number;
    isOpen: boolean;
    phone: string;
    website?: string;
}

// Seed Data
export const USERS: User[] = [
    { id: 'u1', name: 'Alex Thompson', email: 'alex@example.com', role: 'client', avatarUrl: 'https://i.pravatar.cc/150?u=u1' },
    { id: 'd1', name: 'Dr. Sarah Strange', email: 'sarah.strange@medassist.ai', role: 'doctor', avatarUrl: 'https://i.pravatar.cc/150?u=d1' },
    { id: 'p1', name: 'Pharma. John Doe', email: 'john.doe@medassist.ai', role: 'pharmacist', avatarUrl: 'https://i.pravatar.cc/150?u=p1' },
];

export const LOCATIONS: Location[] = [
    {
        id: 'l1',
        name: 'City Central Pharmacy',
        type: 'pharmacy',
        address: '123 Main St, Metropolis',
        lat: 37.7749,
        lng: -122.4194,
        rating: 4.8,
        isOpen: true,
        phone: '(555) 123-4567'
    },
    {
        id: 'l2',
        name: 'Westside Medical Clinic',
        type: 'clinic',
        address: '456 West Ave, Metropolis',
        lat: 37.7849,
        lng: -122.4094,
        rating: 4.5,
        isOpen: true,
        phone: '(555) 987-6543'
    },
    {
        id: 'l3',
        name: 'General Hospital ER',
        type: 'hospital',
        address: '789 Health Blvd, Metropolis',
        lat: 37.7649,
        lng: -122.4294,
        rating: 4.2,
        isOpen: true,
        phone: '(555) 555-5555'
    }
];

export const MEDICATIONS: Medication[] = [
    { id: 'm1', name: 'Amoxicillin', description: 'Antibiotic for bacterial infections', dosageForm: 'Capsule', strength: '500mg' },
    { id: 'm2', name: 'Lisinopril', description: 'ACE inhibitor for high blood pressure', dosageForm: 'Tablet', strength: '10mg' },
    { id: 'm3', name: 'Vitamin D3', description: 'Dietary supplement', dosageForm: 'Softgel', strength: '1000IU' },
];

export const PRESCRIPTIONS: Prescription[] = [
    {
        id: 'rx1',
        medicationId: 'm1',
        patientId: 'u1',
        doctorId: 'd1',
        status: 'pending',
        instructions: 'Take one capsule every 8 hours with food',
        startDate: '2023-10-25',
        refillsRemaining: 1,
        createdAt: '2023-10-24'
    },
    {
        id: 'rx2',
        medicationId: 'm2',
        patientId: 'u1',
        doctorId: 'd1',
        status: 'filled',
        instructions: 'Take one tablet daily in the morning',
        startDate: '2023-09-01',
        refillsRemaining: 3,
        createdAt: '2023-08-30'
    }
];

// Mock Database Class
class MockDatabase {
    private users: User[] = [...USERS];
    private locations: Location[] = [...LOCATIONS];
    private medications: Medication[] = [...MEDICATIONS];
    private prescriptions: Prescription[] = [...PRESCRIPTIONS];

    // Users
    getUser(id: string) {
        return this.users.find(u => u.id === id);
    }

    // Locations
    getNearbyLocations(lat: number, lng: number, radiusKm: number = 10) {
        // Simple mock distance filter (in reality would use Haversine)
        return this.locations;
    }

    // Medications
    getMedications() {
        return this.medications;
    }

    // Prescriptions
    getPrescriptionsForUser(userId: string) {
        return this.prescriptions.filter(p => p.patientId === userId).map(p => ({
            ...p,
            medication: this.medications.find(m => m.id === p.medicationId),
            doctor: this.users.find(u => u.id === p.doctorId)
        }));
    }
}

export const db = new MockDatabase();
