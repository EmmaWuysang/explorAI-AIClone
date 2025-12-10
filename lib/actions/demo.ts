
'use server';

import { prisma } from '@/lib/prisma';
import { seedDatabase } from '@/lib/seed-logic';
import { revalidatePath } from 'next/cache';

export async function resetDemoState() {
    try {
        await seedDatabase(prisma);
        revalidatePath('/dashboard/client');
        revalidatePath('/dashboard/doctor');
        revalidatePath('/dashboard/pharmacist');
        return { success: true, message: 'Demo state reset successfully.' };
    } catch (error) {
        console.error('Failed to reset demo state:', error);
        return { success: false, error: 'Failed to reset demo state.' };
    }
}
