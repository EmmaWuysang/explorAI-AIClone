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

export const INVENTORY: import('@/lib/types').InventoryItem[] = [
    // Antibiotics
    {
        id: 'inv1',
        name: 'Amoxil',
        genericName: 'Amoxicillin',
        category: 'Antibiotic',
        description: 'Penicillin-type antibiotic used to treat a wide variety of bacterial infections.',
        sideEffects: ['Nausea', 'Vomiting', 'Diarrhea', 'Rash'],
        price: 15.99,
        stockLevel: 500,
        dosageForm: 'Capsule',
        strength: '500mg',
        manufacturer: 'GSK',
        requiresPrescription: true
    },
    {
        id: 'inv2',
        name: 'Zithromax',
        genericName: 'Azithromycin',
        category: 'Antibiotic',
        description: 'Macrolide antibiotic used for respiratory infections, skin infections, and more.',
        sideEffects: ['Diarrhea', 'Nausea', 'Abdominal pain'],
        price: 25.50,
        stockLevel: 300,
        dosageForm: 'Tablet',
        strength: '250mg',
        manufacturer: 'Pfizer',
        requiresPrescription: true
    },
    // Pain Management
    {
        id: 'inv3',
        name: 'Tylenol',
        genericName: 'Acetaminophen',
        category: 'Pain Management',
        description: 'Pain reliever and fever reducer.',
        sideEffects: ['Nausea', 'Stomach pain', 'Loss of appetite'],
        price: 8.99,
        stockLevel: 1000,
        dosageForm: 'Tablet',
        strength: '500mg',
        manufacturer: 'Johnson & Johnson',
        requiresPrescription: false
    },
    {
        id: 'inv4',
        name: 'Advil',
        genericName: 'Ibuprofen',
        category: 'Pain Management',
        description: 'Nonsteroidal anti-inflammatory drug (NSAID) used to treat pain and inflammation.',
        sideEffects: ['Upset stomach', 'Nausea', 'Vomiting', 'Headache'],
        price: 9.50,
        stockLevel: 850,
        dosageForm: 'Tablet',
        strength: '200mg',
        manufacturer: 'Pfizer',
        requiresPrescription: false
    },
    {
        id: 'inv5',
        name: 'OxyContin',
        genericName: 'Oxycodone',
        category: 'Pain Management',
        description: 'Opioid pain medication used for treatment of moderate to severe pain.',
        sideEffects: ['Constipation', 'Nausea', 'Sleepiness', 'Vomiting'],
        price: 120.00,
        stockLevel: 50,
        dosageForm: 'Tablet',
        strength: '10mg',
        manufacturer: 'Purdue Pharma',
        requiresPrescription: true
    },
    // Cardiovascular
    {
        id: 'inv6',
        name: 'Lipitor',
        genericName: 'Atorvastatin',
        category: 'Cardiovascular',
        description: 'Statin medication used to prevent cardiovascular disease and treat abnormal lipid levels.',
        sideEffects: ['Joint pain', 'Diarrhea', 'Pain in extremities'],
        price: 45.00,
        stockLevel: 200,
        dosageForm: 'Tablet',
        strength: '20mg',
        manufacturer: 'Pfizer',
        requiresPrescription: true
    },
    {
        id: 'inv7',
        name: 'Prinivil',
        genericName: 'Lisinopril',
        category: 'Cardiovascular',
        description: 'ACE inhibitor used to treat high blood pressure and heart failure.',
        sideEffects: ['Dizziness', 'Cough', 'Headache'],
        price: 12.00,
        stockLevel: 400,
        dosageForm: 'Tablet',
        strength: '10mg',
        manufacturer: 'Merck',
        requiresPrescription: true
    },
    // Antidepressant
    {
        id: 'inv8',
        name: 'Prozac',
        genericName: 'Fluoxetine',
        category: 'Antidepressant',
        description: 'SSRI antidepressant used to treat major depressive disorder, bulimia nervosa, OCD, panic disorder, and PMDD.',
        sideEffects: ['Nausea', 'Insomnia', 'Drowsiness', 'Anxiety'],
        price: 30.00,
        stockLevel: 150,
        dosageForm: 'Capsule',
        strength: '20mg',
        manufacturer: 'Eli Lilly',
        requiresPrescription: true
    },
    // Diabetes
    {
        id: 'inv9',
        name: 'Glucophage',
        genericName: 'Metformin',
        category: 'Diabetes',
        description: 'First-line medication for the treatment of type 2 diabetes.',
        sideEffects: ['Diarrhea', 'Nausea', 'Vomiting', 'Gas'],
        price: 10.00,
        stockLevel: 600,
        dosageForm: 'Tablet',
        strength: '500mg',
        manufacturer: 'Bristol-Myers Squibb',
        requiresPrescription: true
    },
    // Antihistamine
    {
        id: 'inv10',
        name: 'Claritin',
        genericName: 'Loratadine',
        category: 'Antihistamine',
        description: 'Used to treat allergies.',
        sideEffects: ['Headache', 'Sleepiness', 'Fatigue'],
        price: 14.99,
        stockLevel: 500,
        dosageForm: 'Tablet',
        strength: '10mg',
        manufacturer: 'Bayer',
        requiresPrescription: false
    }
];

export const PRESCRIPTIONS: Prescription[] = [
    {
        id: 'rx1',
        medicationId: 'm1',
        medicationName: 'Amoxicillin',
        dosage: '500mg',
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
        medicationName: 'Lisinopril',
        dosage: '10mg',
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
    private inventory: import('@/lib/types').InventoryItem[] = [...INVENTORY];

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

    // Inventory
    getInventory(query?: string, category?: string) {
        let items = this.inventory;

        if (category) {
            items = items.filter(i => i.category === category);
        }

        if (query) {
            const lowerQuery = query.toLowerCase();
            items = items.filter(i =>
                i.name.toLowerCase().includes(lowerQuery) ||
                i.genericName.toLowerCase().includes(lowerQuery) ||
                i.description.toLowerCase().includes(lowerQuery)
            );
        }

        return items;
    }
}

export const db = new MockDatabase();
