const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient()

async function main() {
    const userBalance = await prisma.userBalance.create({
        data: {
        userId: '123',
        balance: 500,
        },
    })
    console.log(userBalance);
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