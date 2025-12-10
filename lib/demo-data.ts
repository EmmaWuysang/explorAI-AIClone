
export const DEMO_DATA = {
    products: [
        {
            name: 'Amoxicillin 500mg',
            description: 'Antibiotic used to treat bacterial infections.',
            category: 'Antibiotics',
            manufacturer: 'Sandoz',
            price: 12.99,
            defaultQuantity: 85, // Healthy stock
        },
        {
            name: 'Lisinopril 10mg',
            description: 'ACE inhibitor for high blood pressure.',
            category: 'Cardiovascular',
            manufacturer: 'Lupin',
            price: 8.50,
            defaultQuantity: 15, // Low stock (Target for refill/alert)
        },
        {
            name: 'Atorvastatin 20mg',
            description: 'Statin to lower cholesterol.',
            category: 'Cardiovascular',
            manufacturer: 'Pfizer',
            price: 24.99,
            defaultQuantity: 45,
        },
        {
            name: 'Metformin 500mg',
            description: 'Type 2 diabetes medication.',
            category: 'Diabetes',
            manufacturer: 'Bristol-Myers Squibb',
            price: 4.00,
            defaultQuantity: 120,
        },
        {
            name: 'Albuterol Inhaler',
            description: 'Bronchodilator for asthma.',
            category: 'Respiratory',
            manufacturer: 'Teva',
            price: 35.00,
            defaultQuantity: 8, // Very low stock
        },
        {
            name: 'Ibuprofen 200mg',
            description: 'Non-steroidal anti-inflammatory drug (NSAID).',
            category: 'Pain Relief',
            manufacturer: 'Advil',
            price: 6.99,
            defaultQuantity: 0, // OUT OF STOCK
        },
        {
            name: 'Omeprazole 20mg',
            description: 'Proton pump inhibitor for acid reflux.',
            category: 'Gastrointestinal',
            manufacturer: 'AstraZeneca',
            price: 18.50,
            defaultQuantity: 60,
        },
        {
            name: 'Gabapentin 300mg',
            description: 'Anticonvulsant and nerve pain medication.',
            category: 'Neurology',
            manufacturer: 'Greenstone',
            price: 14.25,
            defaultQuantity: 30,
        },
        {
            name: 'Sertraline 50mg',
            description: 'SSRI antidepressant.',
            category: 'Mental Health',
            manufacturer: 'Zoloft',
            price: 22.00,
            defaultQuantity: 50,
        },
        {
            name: 'Prednisone 10mg',
            description: 'Corticosteroid to reduce inflammation.',
            category: 'Anti-inflammatory',
            manufacturer: 'Horizon',
            price: 9.75,
            defaultQuantity: 100,
        }
    ],
    pharmacies: [
        {
            name: 'CVS Pharmacy',
            address: '123 Main St, San Francisco, CA',
            latitude: 37.7749,
            longitude: -122.4194,
            phone: '(415) 555-0123',
        },
        {
            name: 'Walgreens',
            address: '456 Market St, San Francisco, CA',
            latitude: 37.7849,
            longitude: -122.4094,
            phone: '(415) 555-0124',
        }
    ],
    users: {
        doctor: {
            name: 'Dr. Sarah Strange',
            email: 'sarah.strange@medassist.ai',
            role: 'doctor',
            avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah'
        },
        client: {
            name: 'Sam G',
            email: 'sam@example.com',
            role: 'client',
            avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sam'
        },
        pharmacist: {
            name: 'Pharma Joe',
            email: 'joe@cvs.com',
            role: 'pharmacist',
            avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Joe'
        }
    },
    scenarios: {
        // Defines active data states to create
        redeemedRx: {
            medicationName: 'Lisinopril 10mg', // Matches product name
            status: 'REDEEMED',
            instructions: 'Take one tablet daily in the morning',
        },
        activeRx: {
            medicationName: 'Amoxicillin 500mg',
            status: 'PENDING',
            instructions: 'Take one capsule every 8 hours for 7 days',
        },
        appointment: {
            dateOffset: 1, // Days from now (Tomorrow)
            status: 'PENDING'
        }
    }
}
