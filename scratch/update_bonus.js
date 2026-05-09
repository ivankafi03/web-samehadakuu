const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.systemSettings.update({
    where: { id: 'global' },
    data: { 
      registrationBonus: 0.10,
      welcomeBonus: 1.00 
    }
  });
  console.log('Successfully separated bonuses: Referral $0.10, Welcome $1.00');
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
