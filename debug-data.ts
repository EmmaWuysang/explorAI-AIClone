
import { PrismaClient } from './lib/generated/prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const adapter = new PrismaBetterSqlite3({
    url: 'file:./dev.db'
})
const prisma = new PrismaClient({ adapter })

async function main() {
    const clients = await prisma.user.findMany({ where: { role: 'client' } })
    console.log('Clients:', clients)

    if (clients.length > 0) {
        const client = clients[0]
        const rx = await prisma.prescription.findMany({ where: { patientId: client.id } })
        console.log('Prescriptions for', client.name, ':', rx)
    }
}

main()
