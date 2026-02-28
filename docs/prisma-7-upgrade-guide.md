# Prisma ORM 7.x Upgrade Guide

> **Research Date:** February 28, 2026  
> **Current Version:** Prisma ORM 7.4.2  
> **Issue:** #16  

## Executive Summary

Prisma ORM 7 represents the most significant architectural change in Prisma's history. The Rust-based query engine has been replaced with a pure TypeScript implementation, delivering substantial performance improvements, dramatic bundle size reduction, and simplified deployment. This guide covers everything you need to know about upgrading and leveraging Prisma 7 in the Solom finance platform.

---

## Key Changes at a Glance

| Feature | Prisma 6.x | Prisma 7.x |
|---------|------------|------------|
| Query Engine | Rust binary | Pure TypeScript |
| Bundle Size | ~10MB+ | ~90% smaller |
| Query Performance | Baseline | Up to 3x faster |
| Generated Code | `node_modules/@prisma/client` | Project source (configurable) |
| Configuration | `schema.prisma` + `package.json` | `schema.prisma` + `prisma.config.ts` |
| Database Drivers | Embedded | Explicit adapters (npm packages) |
| Edge Deployment | Complex (WASM) | Native support |

---

## Architecture Changes

### 1. Rust-Free Query Engine

The defining change in Prisma 7 is the removal of the Rust-based query engine.

**Benefits:**
- **~90% smaller bundle output** - From megabytes to kilobytes
- **Up to 3x faster queries** - Eliminates cross-language runtime overhead
- **Lower CPU/memory footprint** - Native JavaScript execution
- **Simplified deployments** - No binary compilation, works everywhere
- **Easier contributions** - TypeScript-only codebase

**Quote from Deno:**
> "We remember hearing about Prisma's move away from Rust and thinking about how not dealing with the native addon API would make supporting Prisma in Deno so much simpler."

### 2. New `prisma-client` Provider

The default generator has changed:

```prisma
// Before (Prisma 6)
generator client {
  provider = "prisma-client-js"
}

// After (Prisma 7)
generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
  // Optional: Choose between speed and size
  compilerBuild = "fast"  // "fast" | "small"
}
```

**Key differences:**
- `prisma-client-js` still works but is deprecated
- `output` path is now **required** (no more `node_modules` generation)
- `compilerBuild` option lets you optimize for speed or bundle size

### 3. Driver Adapters Required

Database drivers are no longer embedded. You must explicitly install and configure adapters:

```typescript
// Install the adapter
// npm install @prisma/adapter-pg pg

import { PrismaClient } from './generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
})

export const prisma = new PrismaClient({ adapter })
```

**Available Adapters:**
| Database | Package |
|----------|---------|
| PostgreSQL | `@prisma/adapter-pg` |
| MySQL | `@prisma/adapter-mariadb` |
| SQLite | `@prisma/adapter-better-sqlite3` |
| Neon | `@prisma/adapter-neon` |
| PlanetScale | `@prisma/adapter-pg` |
| D1 | `@prisma/adapter-d1` |
| LibSQL | `@prisma/adapter-libsql` |

### 4. New Configuration File: `prisma.config.ts`

Prisma 7 introduces a dedicated configuration file:

```typescript
import { defineConfig, env } from 'prisma/config'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    url: env('DATABASE_URL'),
    shadowDatabaseUrl: env('SHADOW_DATABASE_URL'), // optional
  },
})
```

**What moved from schema.prisma:**
- `datasource.url` → `prisma.config.ts`
- `datasource.shadowDatabaseUrl` → `prisma.config.ts`
- `datasource.directUrl` → **removed** (no longer needed)

---

## Migration Guide

### Step 1: Update Dependencies

```bash
# Update Prisma packages
npm install prisma@latest @prisma/client@latest

# Install your database adapter
npm install @prisma/adapter-pg pg

# For existing prisma-client-js users
npm install @prisma/client-runtime-utils
```

### Step 2: Update `schema.prisma`

```diff
generator client {
-  provider = "prisma-client-js"
+  provider = "prisma-client"
+  output   = "../src/generated/prisma"
}

datasource db {
  provider = "postgresql"
-  url      = env("DATABASE_URL")
-  directUrl = env("DIRECT_URL")
  // URLs moved to prisma.config.ts
}
```

### Step 3: Create `prisma.config.ts`

```typescript
import 'dotenv/config'
import { defineConfig, env } from 'prisma/config'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: env('DATABASE_URL'),
  },
})
```

### Step 4: Update Client Code

```diff
- import { PrismaClient } from '@prisma/client'
+ import { PrismaClient } from '../generated/prisma/client'
+ import { PrismaPg } from '@prisma/adapter-pg'
+ 
+ const adapter = new PrismaPg({
+   connectionString: process.env.DATABASE_URL!,
+ })
  
- export const prisma = new PrismaClient()
+ export const prisma = new PrismaClient({ adapter })
```

### Step 5: Explicit Generation

The post-install hook has been removed. You must explicitly run:

```bash
npx prisma generate
```

Add to your build scripts:

```json
{
  "scripts": {
    "build": "prisma generate && next build",
    "postinstall": "prisma generate"
  }
}
```

---

## New Features

### Query Caching (7.4.0+)

Prisma 7.4 introduces built-in query caching:

```typescript
const prisma = new PrismaClient({
  adapter,
  // Automatic query result caching
})
```

### SQL Comments (7.1.0+)

Add metadata to queries for observability:

```typescript
import { queryTags, withQueryTags } from '@prisma/sqlcommenter-query-tags'
import { traceContext } from '@prisma/sqlcommenter-trace-context'

const prisma = new PrismaClient({
  adapter,
  comments: [queryTags(), traceContext()],
})

// Add tags to queries
const users = await withQueryTags(
  { route: '/api/users', requestId: 'abc-123' },
  () => prisma.user.findMany()
)
// Result: SELECT * FROM "User" /*requestId='abc-123',route='/api/users'*/
```

### Mapped Enums

```prisma
enum PaymentProvider {
  MixplatSMS  @map("mixplat/sms")
  InternalToken @map("internal/token")
  Offline @map("offline")

  @@map("payment_provider")
}
```

Generates:

```typescript
export const PaymentProvider = {
  MixplatSMS: 'mixplat/sms',
  InternalToken: 'internal/token',
  Offline: 'offline',
}
```

### Compiler Build Options

Choose between speed and bundle size:

```prisma
generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
  // "fast" = faster queries, larger bundle
  // "small" = smaller bundle, slightly slower
  compilerBuild = "fast"
}
```

---

## Performance Benchmarks

Prisma published benchmarks comparing the Rust-free client:

| Metric | Prisma 6 (Rust) | Prisma 7 (TypeScript) |
|--------|-----------------|------------------------|
| Bundle Size | ~10MB+ | ~1MB |
| Query Speed | Baseline | 3x faster |
| Cold Start | Slow (Rust init) | Instant |
| Memory Usage | Higher | Lower |
| CPU Usage | Higher | Lower |

**Type Checking Performance:**
- Prisma requires ~98% fewer types for schema evaluation
- Prisma requires ~45% fewer types for query evaluation  
- Prisma is 70% faster for full type checks

---

## Breaking Changes

### Removed APIs

```typescript
// ❌ Removed - datasources option
new PrismaClient({ datasources: { db: { url: '...' } } })

// ❌ Removed - datasourceUrl option  
new PrismaClient({ datasourceUrl: '...' })

// ❌ Removed - engine types
generator client {
  engineType = "library" // or "binary" - removed
}

// ❌ Removed - runtime (use new runtime options)
generator client {
  runtime = "react-native" // removed
}
```

### Environment Variables

These environment variables have been removed:

| Removed Variable | Replacement |
|-----------------|-------------|
| `PRISMA_CLI_QUERY_ENGINE_TYPE` | Use `prisma.config.ts` |
| `PRISMA_CLIENT_ENGINE_TYPE` | Use `prisma.config.ts` |
| `PRISMA_QUERY_ENGINE_BINARY` | No longer applies |
| `PRISMA_QUERY_ENGINE_LIBRARY` | No longer applies |
| `PRISMA_GENERATE_SKIP_AUTOINSTALL` | Always skipped |
| `PRISMA_SKIP_POSTINSTALL_GENERATE` | Explicit generation |
| `PRISMA_MIGRATE_SKIP_GENERATE` | Use CLI flags |
| `PRISMA_MIGRATE_SKIP_SEED` | Use CLI flags |
| `PRISMA_CLIENT_NO_RETRY` | Configure retry in client |

### Schema Changes

- `datasource.url` → `prisma.config.ts`
- `datasource.shadowDatabaseUrl` → `prisma.config.ts`
- `datasource.directUrl` → **removed** (unnecessary)
- `generator.runtime = "react-native"` → **removed**

---

## Edge Runtime Support

Prisma 7 has first-class support for edge runtimes:

```typescript
// Cloudflare Workers
generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
  runtime  = "workerd" // or "cloudflare"
}

// Vercel Edge Functions
generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
  runtime  = "vercel-edge"
}

// Deno Deploy
generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
  runtime  = "deno"
}
```

---

## Solom-Specific Recommendations

### For Finance Applications

1. **Use `compilerBuild = "fast"`** - Query speed is critical for finance dashboards
2. **Enable query caching** - Reduces latency for frequent price queries
3. **Use SQL Comments** - Essential for debugging production issues

### Update `prisma.config.ts` for Solom

```typescript
import 'dotenv/config'
import { defineConfig, env } from 'prisma/config'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    url: env('DATABASE_URL'),
    // For CI/CD with shadow database
    shadowDatabaseUrl: env('SHADOW_DATABASE_URL'),
  },
})
```

### Database Adapter Setup

```typescript
// src/lib/prisma.ts
import { PrismaClient } from '../generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const connectionString = process.env.DATABASE_URL!

// Connection pooling for production
const adapter = new PrismaPg({
  connectionString,
  // Optional: Configure pool size
  connectionLimit: parseInt(process.env.DB_POOL_SIZE || '10'),
})

export const prisma = new PrismaClient({
  adapter,
  // Optional: Enable query logging in development
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'info', 'warn', 'error'] 
    : ['error'],
})

// Graceful shutdown
if (process.env.NODE_ENV !== 'test') {
  process.on('beforeExit', async () => {
    await prisma.$disconnect()
  })
}
```

---

## Testing

### Before Upgrading

```bash
# 1. Run existing tests
npm test

# 2. Check for deprecated API usage
grep -r "datasources:" src/
grep -r "datasourceUrl:" src/
grep -r "engineType:" prisma/

# 3. Verify your database adapter supports Prisma 7
```

### After Upgrading

```bash
# 1. Regenerate client
npx prisma generate

# 2. Run tests
npm test

# 3. Verify types
npx tsc --noEmit

# 4. Check bundle size (should be smaller)
npx next build
```

---

## Common Issues and Solutions

### Issue: `Cannot find module '../generated/prisma/client'`

**Solution:** Run `npx prisma generate` explicitly. The post-install hook was removed.

### Issue: `Adapter is required`

**Solution:** Database drivers are no longer embedded. Install and configure an adapter:

```bash
npm install @prisma/adapter-pg pg
```

### Issue: `Database URL is undefined`

**Solution:** Environment variables are no longer auto-loaded. Use dotenv in your config:

```typescript
import 'dotenv/config'
import { defineConfig, env } from 'prisma/config'

export default defineConfig({
  // ...
})
```

### Issue: BigInt JSON precision loss

**Solution:** Prisma 7.3.0+ automatically casts BigInt to string in JSON to preserve precision.

---

## Resources

- [Official Prisma 7 Migration Guide](https://pris.ly/migrateto-prisma7)
- [Prisma Changelog](https://www.prisma.io/changelog)
- [Prisma ORM Documentation](https://www.prisma.io/docs/orm)
- [Prisma Blog - Prisma 7 Announcement](https://www.prisma.io/blog/announcing-prisma-orm-7-0-0)
- [Type Checking Benchmarks](https://pris.ly/type-benchmarks)
- [Rust-Free Benchmarks](https://www.prisma.io/blog/prisma-orm-without-rust-latest-performance-benchmarks)

---

## Version History (Recent)

| Version | Date | Key Changes |
|---------|------|-------------|
| 7.4.2 | Feb 2026 | Bug fixes, stability |
| 7.4.0 | Feb 2026 | Query caching, partial indexes |
| 7.3.0 | Jan 2026 | Fast/Small compilers, BigInt JSON fix |
| 7.2.0 | Dec 2025 | CLI improvements, `--url` flag |
| 7.1.0 | Dec 2025 | SQL Comments support |
| 7.0.0 | Nov 2025 | Rust-free architecture |
| 6.19.0 | Nov 2025 | Last 6.x release |
| 6.16.0 | Sep 2025 | Rust-free preview (GA) |

---

## Conclusion

Prisma ORM 7 is a major evolution that delivers on the promise of a faster, smaller, and simpler ORM. The removal of Rust dependencies dramatically improves the developer experience, especially for edge deployments. The explicit driver adapters, configuration file, and generated output provide more control and transparency.

For the Solom finance platform, upgrading to Prisma 7 will:
- Reduce cold start times (critical for serverless)
- Improve query performance for real-time stock data
- Simplify deployment to various platforms
- Provide better observability with SQL Comments

The migration is straightforward for most projects, with the main changes being:
1. Update generator provider
2. Add output path
3. Create `prisma.config.ts`
4. Install and configure database adapter
5. Update import paths

---

*Last updated: February 28, 2026*  
*Author: Solom Developer Agent*  
*Related Issue: #16*