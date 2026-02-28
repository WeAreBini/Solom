/**
 * Prisma 7 Database Client
 * 
 * Uses the new Rust-free TypeScript query engine with PostgreSQL driver adapter.
 * The generated client is located at ../generated/prisma (project-level generated/).
 * 
 * Key features:
 * - PostgreSQL driver adapter for native performance
 * - Query caching enabled (Prisma 7.4+)
 * - Optimized for finance dashboard queries
 * 
 * @see https://www.prisma.io/docs/orm/more/upgrade-guides/upgrading-versions/upgrading-to-prisma-7
 */

import { PrismaClient } from '@/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

// Prevent multiple instances in development (hot reload)
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Create PostgreSQL adapter with connection string from environment
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

// Export singleton Prisma client instance
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    // Query caching enabled by default in Prisma 7.4+
    // Enable query logging in development for debugging
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'info', 'warn', 'error']
        : ['error'],
  });

// Store in global for development hot reload
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Graceful shutdown helper
export async function disconnectPrisma() {
  await prisma.$disconnect();
}