'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getDoctorStats(doctorId: string) {
    try {
        // Total Patients (Unique patients with prescriptions from this doctor)
        // Since we don't have a direct "Doctor-Patient" assignment model other than prescriptions,
        // we can count unique patientIds in prescriptions, OR just count all clients if we assume a small practice.
        // Let's do unique patients from prescriptions + any manually added via notes if we want to be fancy,
        // but for now, let's stick to "All Clients" as the base "Total Patients" as per previous logic,
        // or refine it to "Active Patients" = those with prescriptions.

        // Let's provide both:
        const totalPatientsCount = await prisma.user.count({
            where: { role: 'client' }
        })

        const activePrescriptionsCount = await prisma.prescription.count({
            where: {
                doctorId,
                status: 'PENDING'
            }
        })

        const pendingReviewsCount = await prisma.prescription.count({
            where: {
                doctorId,
                // Assuming 'pending review' might mean something else in future, 
                // but for now let's say it's prescriptions created today?
                // Or maybe just hardcode 0 if feature doesn't exist yet.
                // Let's use "Total Prescriptions All Time" instead of Pending Reviews if that's more useful?
                // The user asked for "valuable metrics".
                // Let's count "Redeemed" as a success metric.
                status: 'REDEEMED'
            }
        })

        return {
            success: true,
            data: {
                totalPatients: totalPatientsCount,
                activePrescriptions: activePrescriptionsCount,
                redeemedPrescriptions: pendingReviewsCount // Re-purposing the card for now or renaming it in UI
            }
        }
    } catch (error) {
        console.error('Failed to get doctor stats:', error)
        return { success: false, error: 'Failed to get stats' }
    }
}

export async function addDoctorNote(doctorId: string, patientId: string, content: string) {
    try {
        // @ts-ignore
        const note = await prisma.doctorNote.create({
            data: {
                doctorId,
                patientId,
                content
            }
        })
        revalidatePath('/dashboard/doctor')
        return { success: true, data: note }
    } catch (error) {
        console.error('Failed to add note:', error)
        return { success: false, error: 'Failed to add note' }
    }
}

export async function getDoctorNotes(doctorId: string, patientId: string) {
    try {
        // @ts-ignore
        const notes = await prisma.doctorNote.findMany({
            where: {
                doctorId,
                patientId
            },
            orderBy: { createdAt: 'desc' }
        })
        return { success: true, data: notes }
    } catch (error) {
        console.error('Failed to get notes:', error)
        return { success: false, error: 'Failed to get notes' }
    }
}

export async function getRecentActivity(doctorId: string) {
    try {
        // 1. Recent Prescriptions (Created or Updated)
        const recentRx = await prisma.prescription.findMany({
            where: { doctorId },
            include: { patient: true },
            orderBy: { updatedAt: 'desc' },
            take: 5
        })

        // 2. Recent Medication Logs (for patients of this doctor)
        const recentLogs = await prisma.medicationLog.findMany({
            where: {
                prescription: {
                    doctorId: doctorId
                }
            },
            include: {
                prescription: {
                    include: { patient: true }
                }
            },
            orderBy: { takenAt: 'desc' },
            take: 5
        })

        // 3. Combine and Sort
        // 3. Combine and Sort
        const combined = [
            ...recentRx.map((rx) => {
                const isRedemption = rx.status === 'REDEEMED' && rx.redeemedAt
                const type = isRedemption ? 'PRESCRIPTION_REDEEMED' : 'PRESCRIPTION_CREATED'
                const description = isRedemption
                    ? `${rx.patient.name} picked up ${rx.medicationName}`
                    : `Prescribed ${rx.medicationName} to ${rx.patient.name}`

                return {
                    type,
                    description,
                    timestamp: rx.updatedAt, // Use updatedAt which changes on redemption
                    data: rx
                }
            }),
            ...recentLogs.map((log) => {
                // @ts-ignore
                const patientName = log.prescription?.patient?.name || 'Unknown'
                // @ts-ignore
                const medName = log.prescription?.medicationName || 'Medication'
                const description = `${patientName} took ${medName}`
                return {
                    type: 'MEDICATION_TAKEN',
                    description,
                    timestamp: log.takenAt,
                    data: log
                }
            })
        ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, 10);

        return { success: true, data: combined }
    } catch (error) {
        console.error('Failed to get recent activity:', error)
        return { success: false, error: 'Failed to get recent activity' }
    }
}

export async function getPendingAppointments(doctorId: string) {
    try {
        const appointments = await prisma.appointment.findMany({
            where: {
                doctorId,
                status: 'PENDING'
            },
            include: { patient: true },
            orderBy: { createdAt: 'desc' }
        })
        return { success: true, data: appointments }
    } catch (error) {
        return { success: false, error: 'Failed' }
    }
}

export async function acceptAppointment(appointmentId: string) {
    try {
        const appt = await prisma.appointment.update({
            where: { id: appointmentId },
            data: { status: 'CONFIRMED' }
        })
        revalidatePath('/dashboard/doctor')
        revalidatePath('/dashboard/client')
        return { success: true, data: appt }
    } catch (error) {
        return { success: false, error: 'Failed' }
    }
}
