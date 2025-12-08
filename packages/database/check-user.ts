import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({ 
    where: { email: 'admin@tradesphere.com' },
    select: {
      id: true,
      email: true,
      name: true,
      password: true,
      isActive: true,
    }
  });
  
  if (user) {
    console.log('User found:');
    console.log('  Email:', user.email);
    console.log('  Name:', user.name);
    console.log('  Has password:', !!user.password);
    console.log('  Password length:', user.password?.length || 0);
    console.log('  Is active:', user.isActive);
  } else {
    console.log('User NOT FOUND');
  }
}

main()
  .finally(() => prisma.$disconnect());
