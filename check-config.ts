
import { prisma } from './lib/prisma'

async function main() {
    try {
        const count = await prisma.user.count();
        console.log('User count:', count);
        const users = await prisma.user.findMany();
        console.log('Users:', JSON.stringify(users, null, 2));

        const rx = await prisma.prescription.findMany();
        console.log('Prescriptions:', rx.length);
    } catch (e) {
        console.error(e);
    }
}
main()
