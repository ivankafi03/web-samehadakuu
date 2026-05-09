const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.systemSettings.update({
    where: { id: 'global' },
    data: { registrationBonus: 1.00 }
  });
  console.log('Successfully updated registration bonus to $1.00');
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
