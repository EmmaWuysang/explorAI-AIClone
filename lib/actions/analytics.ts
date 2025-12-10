'use server';

import { prisma } from '@/lib/prisma';
import { analyzeProduct, AnalyzedProduct } from '@/lib/analytics/simulation';

export async function getInventoryAnalytics(pharmacyId: string): Promise<{ success: boolean; data?: AnalyzedProduct[]; error?: string }> {
    try {
        const inventory = await prisma.inventory.findMany({
            where: { pharmacyId },
            include: {
                product: true
            }
        });

        // Run analytics simulation on each item
        const analyzed = inventory.map(item => analyzeProduct(item));

        // Sort by urgency: CRITICAL > REORDER > OPTIMAL > OVERSTOCK
        const urgencyMap = { 'CRITICAL': 0, 'REORDER': 1, 'OVERSTOCK': 2, 'OPTIMAL': 3 };
        analyzed.sort((a, b) => urgencyMap[a.status] - urgencyMap[b.status]);

        return { success: true, data: analyzed };

    } catch (error) {
        console.error('Error calculating analytics:', error);
        return { success: false, error: 'Failed to generate stock analytics' };
    }
}
