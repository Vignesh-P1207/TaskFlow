const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.user.deleteMany({
    where: { email: 'vigneshpachai12@gmail.com' }
  });
  console.log("Deleted test user");
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
