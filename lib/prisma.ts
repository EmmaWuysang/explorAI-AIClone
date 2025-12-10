import { PrismaClient } from '@/lib/generated/prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'


const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient({
    adapter: new PrismaBetterSqlite3({
        url: process.env.DATABASE_URL || 'file:./dev.db'
    }),
});

// Enable WAL mode for better concurrency
if (!globalForPrisma.prisma) {
    try {
        const Database = require('better-sqlite3');
        const db = new Database('dev.db');
        db.pragma('journal_mode = WAL');
        db.close();
    } catch (e) {
        // Ignore if db doesn't exist yet or other errors, strictly optimization
        console.warn("Could not enable WAL mode", e);
    }
}

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
