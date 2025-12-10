import { PrismaClient } from '../lib/generated/prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

async function main() {
    const adapterFactory = new PrismaBetterSqlite3({
        url: 'file:./dev.db'
    })
    // const adapter = await adapterFactory.connect()
    const prisma = new PrismaClient({ adapter: adapterFactory })

    console.log('Verifying database content...')

    const pharmacies = await prisma.pharmacy.findMany()
    console.log(`Found ${pharmacies.length} pharmacies.`)

    if (pharmacies.length > 0) {
        const firstPharmacy = pharmacies[0]
        console.log(`Checking inventory for ${firstPharmacy.name}...`)

        const inventory = await prisma.inventory.findMany({
            where: { pharmacyId: firstPharmacy.id },
            include: { product: true }
        })
        console.log(`Found ${inventory.length} items in inventory.`)

        if (inventory.length > 0) {
            console.log('Sample item:', inventory[0].product.name, '-', inventory[0].quantity, 'in stock at $', inventory[0].price)
        }
    }

    await prisma.$disconnect()
}

main().catch(console.error)
