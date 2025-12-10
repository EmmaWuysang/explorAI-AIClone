'use server'

import { prisma } from '@/lib/prisma'



export async function getPharmacies() {
    try {
        const pharmacies = await prisma.pharmacy.findMany({
            orderBy: { name: 'asc' }
        })
        return { success: true, data: pharmacies }
    } catch (error) {
        console.error('Error fetching pharmacies:', error)
        return { success: false, error: 'Failed to fetch pharmacies' }
    }
}

export async function getFirstPharmacyId() {
    try {
        const pharmacy = await prisma.pharmacy.findFirst();
        return { success: true, data: pharmacy?.id };
    } catch (error) {
        return { success: false, error: 'Failed' };
    }
}

export async function getInventory(pharmacyId: string) {
    try {
        const inventory = await prisma.inventory.findMany({
            where: { pharmacyId },
            include: {
                product: true
            }
        })
        return { success: true, data: inventory }
    } catch (error) {
        console.error('Error fetching inventory:', error)
        return { success: false, error: 'Failed to fetch inventory' }
    }
}

export async function searchProducts(query: string) {
    try {
        const products = await prisma.product.findMany({
            where: {
                OR: [
                    { name: { contains: query } }, // Case insensitive usually depends on DB collation
                    { description: { contains: query } }
                ]
            }
        })
        return { success: true, data: products }
    } catch (error) {
        console.error('Error searching products:', error)
        return { success: false, error: 'Failed to search products' }
    }
}

export async function purchaseItem(inventoryId: string, quantity: number) {
    try {
        // Transaction to ensure stock is available
        const result = await prisma.$transaction(async (tx) => {
            const item = await tx.inventory.findUnique({
                where: { id: inventoryId }
            })

            if (!item) {
                throw new Error('Item not found')
            }

            if (item.quantity < quantity) {
                throw new Error('Insufficient stock')
            }

            const updatedItem = await tx.inventory.update({
                where: { id: inventoryId },
                data: { quantity: item.quantity - quantity }
            })

            return updatedItem
        })

        return { success: true, data: result }
    } catch (error: any) {
        console.error('Error purchasing item:', error)
        return { success: false, error: error.message || 'Failed to purchase item' }
    }
}

export async function restockItem(inventoryId: string, quantity: number) {
    try {
        const updatedItem = await prisma.inventory.update({
            where: { id: inventoryId },
            data: { incomingStock: { increment: quantity } }
        })
        return { success: true, data: updatedItem }
    } catch (error: any) {
        console.error('Error restocking item:', error)
        return { success: false, error: error.message || 'Failed to restock item' }
    }
}

export async function getPharmacyStats(pharmacyId: string) {
    try {
        // 1. Pending (Prescriptions not yet redeemed for this pharmacy? Actually prescriptions are global or per doctor usually, but let's assume valid for any pharmacy or check if we store pharmacyId on rx)
        // Schema check: Prescription has pharmacyId? 
        // Based on previous views, Prescription has status 'active' | 'REDEEMED' | 'CANCELLED'.
        // If it's 'active', it's pending. If 'REDEEMED', it's ready/filled.

        // Let's get "Pending" as all active prescriptions (since any pharmacy can fill them potentially)
        // Or strictly, those assigned to this pharmacy if that concept existed. For now, specific to all 'active' is fine for demo as "Marketplace Demand".
        const pendingCount = await prisma.prescription.count({
            where: { status: 'active' }
        });

        const redeemedCount = await prisma.prescription.count({
            where: {
                status: 'REDEEMED',
                redeemedByPharmacyId: pharmacyId // Correct field name from schema
            }
        });

        // Today's fills
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const filledTodayCount = await prisma.prescription.count({
            where: {
                status: 'REDEEMED',
                redeemedByPharmacyId: pharmacyId, // Correct field name
                updatedAt: { gte: todayStart }
            }
        });

        // Low Stock
        const lowStockCount = await prisma.inventory.count({
            where: {
                pharmacyId: pharmacyId,
                quantity: { lt: 10 }
            }
        });

        return {
            success: true,
            data: {
                pending: pendingCount,
                redeemed: redeemedCount,
                filledToday: filledTodayCount,
                lowStock: lowStockCount
            }
        }
    } catch (error) {
        console.error('Error fetching stats:', error);
        return { success: false, error: 'Failed' }
    }
}
