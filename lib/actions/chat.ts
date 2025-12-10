'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function sendMessage(senderId: string, receiverId: string, content: string) {
    try {
        const message = await prisma.message.create({
            data: {
                senderId,
                receiverId,
                content
            }
        })

        revalidatePath('/dashboard/doctor')
        revalidatePath('/dashboard/client')
        return { success: true, data: message }
    } catch (error) {
        console.error('Failed to send message:', error)
        return { success: false, error: 'Failed to send message' }
    }
}

export async function getMessages(userId1: string, userId2: string) {
    try {
        const messages = await prisma.message.findMany({
            where: {
                OR: [
                    { senderId: userId1, receiverId: userId2 },
                    { senderId: userId2, receiverId: userId1 }
                ]
            },
            orderBy: { createdAt: 'asc' },
            include: { sender: true }
        })
        return { success: true, data: messages }
    } catch (error) {
        console.error('Failed to fetch messages:', error)
        return { success: false, error: 'Failed to fetch messages' }
    }
}
