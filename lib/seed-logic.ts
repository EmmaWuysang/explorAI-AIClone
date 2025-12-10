
import { PrismaClient } from './generated/prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { DEMO_DATA } from './demo-data'

// We need to instantiate client here or accept it as arg
// Accepting as arg is better for reuse?
// But `seed.ts` and Next.js might use different instances. This is tricky.
// Let's instantiate inside to be self-contained for the "Reset" operation.
// Actually, using the singleton `prisma` from `lib/prisma` is best for Next.js app context.
// But `seed.ts` runs in CLI context. 

// Compromise: Accept prisma instance as argument.

export async function seedDatabase(prisma: any) {
    console.log('Start seeding Demo Data...')

    // Clear DB
    try {
        console.log('Clearing old data...')
        await prisma.refillRequest.deleteMany()
        await prisma.medicationLog.deleteMany()
        await prisma.doctorNote.deleteMany()
        await prisma.message.deleteMany()
        await prisma.appointment.deleteMany()
        await prisma.prescription.deleteMany()
        await prisma.inventory.deleteMany()
        await prisma.product.deleteMany()
        await prisma.pharmacy.deleteMany()
        await prisma.user.deleteMany()
    } catch (error) {
        console.log('Error clearing DB:', error)
    }

    // 1. Create Pharmacies
    const pharmacies = []
    for (const p of DEMO_DATA.pharmacies) {
        // Check if exists? schema has no unique on name, but cleaner to just create fresh after delete
        const pharmacy = await prisma.pharmacy.create({
            data: p
        })
        pharmacies.push(pharmacy)
    }

    // 2. Create Products
    const products = []
    for (const p of DEMO_DATA.products) {
        const { defaultQuantity, price, ...productData } = p
        const product = await prisma.product.create({
            data: productData
        })
        products.push(product)
    }

    // 3. Create Inventory
    for (let i = 0; i < pharmacies.length; i++) {
        const pharm = pharmacies[i];
        const isMainPharmacy = i === 0;

        for (let j = 0; j < products.length; j++) {
            const prod = products[j];
            const curatedData = DEMO_DATA.products[j];

            const quantity = isMainPharmacy ? curatedData.defaultQuantity : Math.floor(Math.random() * 50) + 10
            const price = curatedData.price;

            await prisma.inventory.create({
                data: {
                    pharmacyId: pharm.id,
                    productId: prod.id,
                    quantity: quantity,
                    price: price
                }
            })
        }
    }

    // 4. Create Users
    const doctor = await prisma.user.create({ data: DEMO_DATA.users.doctor })
    const client = await prisma.user.create({ data: DEMO_DATA.users.client })
    const pharmacist = await prisma.user.create({ data: DEMO_DATA.users.pharmacist })

    // 5. Create Scenarios

    // Redeemed Logic (Lisinopril)
    const lisinoprilScenario = DEMO_DATA.scenarios.redeemedRx
    const redeemedRx = await prisma.prescription.create({
        data: {
            medicationName: lisinoprilScenario.medicationName,
            dosage: '10mg',
            instructions: lisinoprilScenario.instructions,
            status: 'REDEEMED',
            token: 'TOKEN-LISINOPRIL',
            patientId: client.id,
            doctorId: doctor.id,
            redeemedAt: new Date(),
            redeemedByPharmacyId: pharmacies[0].id
        }
    })

    // Active Logic (Amoxicillin)
    const amoxScenario = DEMO_DATA.scenarios.activeRx
    await prisma.prescription.create({
        data: {
            medicationName: amoxScenario.medicationName,
            dosage: '500mg',
            instructions: amoxScenario.instructions,
            status: 'PENDING',
            token: 'TOKEN-AMOXICILLIN',
            patientId: client.id,
            doctorId: doctor.id
        }
    })

    // Appointment
    await prisma.appointment.create({
        data: {
            patientId: client.id,
            doctorId: doctor.id,
            date: new Date(Date.now() + 86400000 * DEMO_DATA.scenarios.appointment.dateOffset),
            status: DEMO_DATA.scenarios.appointment.status
        }
    })

    // Refill Request
    await prisma.refillRequest.create({
        data: {
            prescriptionId: redeemedRx.id,
            status: 'PENDING',
            requestDate: new Date()
        }
    })

    console.log('Demo Seeding finished.')
}
