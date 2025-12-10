'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function createUser(data: {
    name: string
    email: string
    role: 'client' | 'doctor' | 'pharmacist'
}) {
    try {
        const user = await prisma.user.create({
            data: {
                ...data,
                avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.name}`,
            },
        })

        revalidatePath('/dashboard/doctor')
        return { success: true, data: user }
    } catch (error) {
        console.error('Failed to create user:', error)
        return { success: false, error: 'Failed to create user' }
    }
}

export async function getFirstDoctorId() {
    try {
        const doctor = await prisma.user.findFirst({
            where: { role: 'doctor' },
        })

        if (doctor) {
            return { success: true, data: doctor.id }
        }

        // If no doctor exists, create one (fallback for dev)
        const newDoctor = await prisma.user.create({
            data: {
                name: 'Dr. Default',
                email: 'doctor@example.com',
                role: 'doctor',
                avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=doctor',
            }
        })
        return { success: true, data: newDoctor.id }

    } catch (error) {
        console.error('Failed to get doctor ID:', error)
        return { success: false, error: 'Failed to get doctor ID' }
    }
}

export async function getDemoClient() {
    try {
        const client = await prisma.user.findFirst({
            where: { role: 'client' },
        })

        if (client) {
            return { success: true, data: client }
        }

        // If no client exists, create one
        const newClient = await prisma.user.create({
            data: {
                name: 'Alex Client',
                email: 'alex@example.com',
                role: 'client',
                avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
            }
        })
        return { success: true, data: newClient }

    } catch (error) {
        console.error('Failed to get demo client:', error)
        return { success: false, error: 'Failed to get demo client' }
    }
}

export async function bookAppointment(patientId: string, doctorId: string) {
    try {
        // Check if appointment already exists for specific logic? For now, just create new one (multiple appts allowed)
        const appointment = await prisma.appointment.create({
            data: {
                patientId,
                doctorId,
                date: new Date(), // For demo, just set to now
                status: 'PENDING'
            }
        })

        revalidatePath('/dashboard/client')
        revalidatePath('/dashboard/doctor')
        return { success: true, data: appointment }
    } catch (error) {
        console.error('Failed to book appointment:', error)
        return { success: false, error: 'Failed to book appointment' }
    }
}

export async function getClientAppointments(patientId: string) {
    try {
        const appointments = await prisma.appointment.findMany({
            where: { patientId },
            include: { doctor: true },
            orderBy: { date: 'desc' }
        });
        return { success: true, data: appointments };
    } catch (error) {
        return { success: false, error: "Failed to fetch appointments" };
    }
}

export async function getAllClients() {
    try {
        let clients = await prisma.user.findMany({
            where: { role: 'client' },
            orderBy: { name: 'asc' },
        })

        if (clients.length === 0) {
            const newClient = await prisma.user.create({
                data: {
                    name: "Sam G",
                    email: "sam@example.com",
                    role: "client",
                    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sam"
                }
            });
            clients = [newClient];
        }

        return { success: true, data: clients }
    } catch (error) {
        return { success: false, error: "Failed to fetch clients" }
    }
}
