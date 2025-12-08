import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 12);
  
  // Update all users with the default password
  const users = await prisma.user.findMany();
  
  for (const user of users) {
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });
    console.log(`Updated password for: ${user.email}`);
  }
  
  console.log('\nAll users updated with password: admin123');
}

main()
  .finally(() => prisma.$disconnect());
