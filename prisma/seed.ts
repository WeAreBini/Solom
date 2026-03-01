/**
 * Database seed script for Solom
 * 
 * Usage: npx prisma db seed
 * 
 * This script is called automatically by Prisma Migrate when
 * running `npx prisma migrate dev` or `npx prisma db seed`
 */

import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');
  
  // Add seed data here as needed
  // Example:
  // await prisma.userSettings.create({
  //   data: {
  //     userId: 'demo-user',
  //     preferences: { theme: 'dark', currency: 'USD' }
  //   }
  // });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });