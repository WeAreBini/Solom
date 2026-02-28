# Prisma 7.2.0 Upgrade Guide

## Overview

This document describes the upgrade from Prisma 6 to Prisma 7.2.0, including all breaking changes and migration steps.

## Changes Made

### 1. Package Updates (`package.json`)

- **Upgraded:**
  - `@prisma/client`: `6` → `^7.2.0`
  - `prisma`: `6` → `^7.2.0` (moved to devDependencies)

- **Added:**
  - `@prisma/adapter-pg`: `^7.2.0` (required driver adapter for PostgreSQL)
  - `dotenv`: `^16.4.7` (explicit env loading for Prisma CLI)
  - `tsx`: `^4.19.2` (for running TypeScript seed files)

- **New Scripts:**
  - `db:generate`: Generate Prisma client
  - `db:push`: Push schema changes to database
  - `db:migrate`: Run migrations
  - `db:studio`: Open Prisma Studio

### 2. Schema Changes (`prisma/schema.prisma`)

**Before (Prisma 6):**
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

**After (Prisma 7):**
```prisma
generator client {
  provider = "prisma-client"
  output   = "../generated/prisma"
}

datasource db {
  provider = "postgresql"
}
```

Key changes:
- Changed `provider` from `prisma-client-js` to `prisma-client` (new Rust-free client)
- Added `output` field (now required in Prisma 7)
- Removed `url` from datasource block (moved to `prisma.config.ts`)

### 3. New Configuration File (`prisma.config.ts`)

Prisma 7 introduces a new configuration file at the project root:

```typescript
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL,
  },
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
});
```

### 4. Database Client Changes (`lib/db.ts`)

**Before (Prisma 6):**
```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

**After (Prisma 7):**
```typescript
import { PrismaClient } from '@/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

Key changes:
- Import from generated path instead of `@prisma/client`
- Added PostgreSQL driver adapter (`@prisma/adapter-pg`)
- Pass adapter to `PrismaClient` constructor

### 5. Added Seed Script (`prisma/seed.ts`)

Created a TypeScript seed script template for database seeding.

### 6. Updated `.gitignore`

Added `generated/` to ignore the generated Prisma client files.

## Breaking Changes from Prisma 6 to 7

### ESM Support
Prisma 7 ships as ES modules. Next.js handles this automatically, no changes needed.

### Driver Adapters Required
All databases now require driver adapters:
- PostgreSQL: `@prisma/adapter-pg`
- SQLite: `@prisma/adapter-better-sqlite3`

### Environment Variables
Environment variables are no longer auto-loaded by Prisma CLI. We use `dotenv` in `prisma.config.ts` to load `.env` files.

### Client Middleware Removed
Client middleware API was removed. Use client extensions instead.

### Metrics Preview Feature Removed
The Metrics preview feature was removed. Use driver adapters or client extensions for metrics.

## New Features in Prisma 7.2.0

1. **`--url` flag restored**: Can now pass database URL directly to CLI commands
2. **Runtime-specific init**: `prisma init` generates configs based on runtime (Node/Bun)
3. **Generate without URL**: `prisma generate` works without DATABASE_URL set
4. **Fixed `@db.Money`**: Decimal parsing for PostgreSQL money type is fixed

## Commands

```bash
# Install dependencies
bun install

# Generate Prisma client
bun run db:generate

# Push schema to database (development)
bun run db:push

# Run migrations
bun run db:migrate

# Open Prisma Studio
bun run db:studio

# Build the project
bun run build
```

## References

- [Prisma 7 Upgrade Guide](https://www.prisma.io/docs/orm/more/upgrade-guides/upgrading-versions/upgrading-to-prisma-7)
- [Prisma 7.2.0 Release Notes](https://www.prisma.io/blog/announcing-prisma-orm-7-2-0)
- [Driver Adapters](https://www.prisma.io/docs/orm/overview/databases/database-drivers)