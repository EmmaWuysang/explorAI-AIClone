'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import crypto from 'crypto'

export async function createPrescription(data: {
    patientId: string
    doctorId: string
    medicationName: string
    dosage: string
    instructions: string
}) {
    try {
        // Generate a unique token
        const token = crypto.randomBytes(32).toString('hex')

        const prescription = await prisma.prescription.create({
            data: {
                ...data,
                status: 'PENDING',
                token,
            },
        })

        revalidatePath('/dashboard/doctor')
        revalidatePath('/dashboard/client')
        return { success: true, data: prescription }
    } catch (error) {
        console.error('Failed to create prescription:', error)
        return { success: false, error: 'Failed to create prescription' }
    }
}

export async function getPatientPrescriptions(patientId: string) {
    try {
        const prescriptions = await prisma.prescription.findMany({
            where: { patientId },
            include: { doctor: true, refillRequests: true },
            orderBy: { createdAt: 'desc' },
        })
        return { success: true, data: prescriptions }
    } catch (error) {
        console.error('Failed to fetch prescriptions:', error)
        return { success: false, error: 'Failed to fetch prescriptions' }
    }
}

// ... imports
// ... existing code ...

export async function requestRefill(prescriptionId: string) {
    try {
        // Check if pending request exists?
        const existing = await prisma.refillRequest.findFirst({
            where: {
                prescriptionId,
                status: 'PENDING'
            }
        });

        if (existing) {
            return { success: false, error: "Refill request already pending" };
        }

        const refill = await prisma.refillRequest.create({
            data: {
                prescriptionId,
                status: 'PENDING'
            }
        });
        revalidatePath('/dashboard/client');
        revalidatePath('/dashboard/doctor');
        return { success: true, data: refill };
    } catch (error) {
        console.error("Refill request failed", error);
        return { success: false, error: "Failed to request refill" };
    }
}
export async function redeemPrescription(token: string, pharmacyId: string) {
    try {
        const prescription = await prisma.prescription.findUnique({
            where: { token },
        })

        if (!prescription) {
            return { success: false, error: 'Invalid prescription token' }
        }

        if (prescription.status === 'REDEEMED') {
            return { success: false, error: 'Prescription already redeemed' }
        }

        // Transaction to update prescription and inventory
        const result = await prisma.$transaction(async (tx) => {
            // 1. Update Prescription
            const updatedRx = await tx.prescription.update({
                where: { id: prescription.id },
                data: {
                    status: 'REDEEMED',
                    redeemedAt: new Date(),
                    redeemedByPharmacyId: pharmacyId,
                },
            })

            // 2. Decrement Inventory (Try to find matching product)
            const product = await tx.product.findFirst({
                where: { name: prescription.medicationName }
            });

            if (product) {
                // Find inventory item
                const inventoryItem = await tx.inventory.findUnique({
                    where: {
                        pharmacyId_productId: {
                            pharmacyId,
                            productId: product.id
                        }
                    }
                });

                if (inventoryItem) {
                    await tx.inventory.update({
                        where: { id: inventoryItem.id },
                        data: { quantity: { decrement: 1 } }
                    });
                }
            }

            return updatedRx;
        });

        revalidatePath('/dashboard/pharmacist')
        revalidatePath('/dashboard/client')
        revalidatePath('/dashboard/doctor') // Update doctor feed
        return { success: true, data: result }
    } catch (error) {
        console.error('Failed to redeem prescription:', error)
        return { success: false, error: 'Failed to redeem prescription' }
    }
}
// ... rest of file

export async function getDoctorPatients(doctorId: string) {
    try {
        // Fetch patients who have either an Appointment OR a Prescription with this doctor
        const patients = await prisma.user.findMany({
            where: {
                role: 'client',
                OR: [
                    {
                        appointmentsAsPatient: {
                            some: { doctorId }
                        }
                    },
                    {
                        prescriptionsAsPatient: {
                            some: { doctorId }
                        }
                    }
                ]
            },
            distinct: ['id'] // Ensure unique patients
        })
        return { success: true, data: patients }
    } catch (error) {
        console.error('Failed to fetch patients:', error)
        return { success: false, error: 'Failed to fetch patients' }
    }
}

export async function logMedication(prescriptionId: string, status: 'TAKEN' | 'MISSED' | 'SKIPPED') {
    try {
        const log = await prisma.medicationLog.create({
            data: {
                prescriptionId,
                status,
            }
        })

        revalidatePath('/dashboard/client')
        revalidatePath('/dashboard/doctor')
        return { success: true, data: log }
    } catch (error) {
        console.error('Failed to log medication:', error)
        return { success: false, error: 'Failed to log medication' }
    }
}

export async function getMedicationLogs(patientId: string) {
    try {
        // Get all prescriptions for the patient
        const prescriptions = await prisma.prescription.findMany({
            where: { patientId },
            include: {
                logs: {
                    orderBy: { takenAt: 'desc' },
                    take: 10 // Last 10 logs per prescription
                }
            }
        })

        return { success: true, data: prescriptions }
    } catch (error) {
        console.error('Failed to fetch medication logs:', error)
        return { success: false, error: 'Failed to fetch medication logs' }
    }
}
