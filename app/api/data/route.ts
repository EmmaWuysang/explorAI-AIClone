import { NextResponse } from 'next/server';
import { db } from '@/lib/db/mock-db';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const userId = searchParams.get('userId');

    if (type === 'locations') {
        const lat = parseFloat(searchParams.get('lat') || '0');
        const lng = parseFloat(searchParams.get('lng') || '0');
        const locations = db.getNearbyLocations(lat, lng);
        return NextResponse.json(locations);
    }

    if (type === 'prescriptions' && userId) {
        const prescriptions = db.getPrescriptionsForUser(userId);
        return NextResponse.json(prescriptions);
    }

    if (type === 'user' && userId) {
        const user = db.getUser(userId);
        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        const prescriptions = db.getPrescriptionsForUser(userId);
        return NextResponse.json({ user, prescriptions });
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
}
