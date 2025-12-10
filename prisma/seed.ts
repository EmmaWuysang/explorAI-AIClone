import { PrismaClient } from '../lib/generated/prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { seedDatabase } from '../lib/seed-logic'

const adapter = new PrismaBetterSqlite3({
    url: 'file:./dev.db'
})
const prisma = new PrismaClient({ adapter })

async function main() {
    await seedDatabase(prisma)
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
