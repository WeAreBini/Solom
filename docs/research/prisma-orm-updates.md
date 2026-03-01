# Prisma ORM Updates Research

**Document Version:** 1.0  
**Last Updated:** March 1, 2026  
**Issue:** #68  
**Author:** Solom Developer Agent

---

## Executive Summary

Prisma ORM has undergone significant evolution with the release of version 7.x. This research documents the major changes, performance improvements, and migration considerations for the Solom finance platform.

### Key Findings

| Category | Before (v6) | After (v7.4) | Impact |
|----------|-------------|--------------|--------|
| Bundle Size | Large (~50MB+) | ~90% smaller | Faster deployments |
| Query Speed | Baseline | Up to 3x faster | Better UX |
| Architecture | Rust-based | TypeScript/WASM | Simpler deployments |
| Query Caching | None | LRU cache | 100x faster repeated queries |

---

## Major Version Releases

### Prisma ORM 7.0.0 (November 19, 2025)

The landmark release that fundamentally changed Prisma's architecture.

#### Rust-Free Architecture

- **Removed:** Rust-based query engine
- **Added:** WebAssembly (WASM) query compiler running in JavaScript
- **Benefit:** Simpler deployment, no binary compilation needed

#### Bundle Size Reduction

- **Old (v6):** ~50MB+ including Rust binaries
- **New (v7):** ~90% smaller bundle
- **Why:** No Rust engine binary required

#### Performance Claims

- Up to **3x faster queries** in benchmarks
- Faster type checking than competitors
- Reduced cold start times

#### Breaking Changes

```prisma
// OLD (v6)
generator client {
  provider = "prisma-client-js"
}

// NEW (v7)
generator client {
  provider = "prisma-client"
  output = "../src/generated/prisma"
}
```

#### Required Configuration Changes

1. **Output path now required:**
   ```prisma
   generator client {
     provider = "prisma-client"
     output   = "../src/generated/prisma"
   }
   ```

2. **Driver adapter or accelerateUrl required:**
   ```typescript
   // Driver adapter approach
   import { PrismaClient } from './generated/prisma/client';
   import { PrismaPg } from '@prisma/adapter-pg';

   const adapter = new PrismaPg({
     connectionString: process.env.DATABASE_URL
   });
   const prisma = new PrismaClient({ adapter });
   ```

3. **New config file required:**
   ```typescript
   // prisma.config.ts
   import 'dotenv/config';
   import { defineConfig } from "prisma/config";
   
   export default defineConfig({
     schema: "prisma/schema.prisma",
     datasource: {
       url: process.env.DATABASE_URL,
     },
   });
   ```

#### Import Path Changes

```typescript
// OLD (v6)
import { PrismaClient } from '@prisma/client';

// NEW (v7)
import { PrismaClient } from './generated/prisma/client';
```

#### Removed Features

| Feature | Status |
|---------|--------|
| `datasources` option in PrismaClient | ❌ Removed |
| `datasourceUrl` option | ❌ Removed |
| `new PrismaClient()` (no args) | ❌ Removed |
| `engineType: "library"` | ❌ Removed |
| `engineType: "binary"` | ❌ Removed |
| `metrics` preview feature | ❌ Removed |
| MongoDB support | ⏳ Coming soon |
| `--data-proxy` flag | ❌ Removed |
| `--accelerate` flag | ❌ Removed |
| `--no-engine` flag | ❌ Removed |

---

### Prisma ORM 7.1.0 (December 3, 2025)

Quality of life improvements and new observability features.

#### SQL Comments Support

New feature for adding metadata to SQL queries for observability:

```typescript
import { PrismaClient } from './generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { queryTags } from '@prisma/sqlcommenter-query-tags';
import { traceContext } from '@prisma/sqlcommenter-trace-context';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
  comments: [queryTags(), traceContext()],
});
```

#### Query Tags

Add custom metadata to queries:

```typescript
import { queryTags, withQueryTags } from '@prisma/sqlcommenter-query-tags';

const users = await withQueryTags(
  { route: '/api/users', requestId: 'abc-123' },
  () => prisma.user.findMany(),
);

// Resulting SQL:
// SELECT ... FROM "User" /*requestId='abc-123',route='/api/users'*/
```

#### Trace Context (Distributed Tracing)

W3C Trace Context support for OpenTelemetry:

```typescript
import { traceContext } from '@prisma/sqlcommenter-trace-context';

const prisma = new PrismaClient({
  adapter,
  comments: [traceContext()],
});

// When tracing is active:
// SELECT * FROM "User" /*traceparent='00-0af7651916cd43dd8448eb211c80319c-b9c7c989f97918e1-01'*/
```

---

### Prisma ORM 7.2.0 (December 17, 2025)

CLI improvements and bug fixes.

#### CLI Improvements

```bash
# New -url flag for migrate commands
prisma db pull --url "postgresql://..."
prisma db push --url "postgresql://..."
prisma migrate dev --url "postgresql://..."

# More flexible connection configuration
```

#### Key Fixes

- Fixed pnpm monorepo issues with `@prisma/client-runtime-utils`
- Added better error messages for client configuration
- Fixed multibyte UTF-8 character handling
- Improvements to Studio connections

---

### Prisma ORM 7.3.0 (January 21, 2026)

Performance-focused release with compiler options.

#### Query Compiler Options

Choose between speed or bundle size:

```prisma
generator client {
  provider       = "prisma-client"
  output         = "../src/generated/prisma"
  compilerBuild  = "fast"  // or "small"
}
```

| Option | Bundle Size | Query Speed | Best For |
|--------|-------------|-------------|----------|
| `fast` | Larger | Faster | Production backends |
| `small` | Smaller | Slightly slower | Serverless/Edge |

#### Raw Query Optimization

```typescript
// Raw queries now bypass the query compiler
// Reduced overhead for $queryRaw and $executeRaw
const result = await prisma.$queryRaw`
  SELECT * FROM "User" WHERE "status" = 'active'
`;
```

#### BigInt JSON Precision Fix

When using `relationJoins`, BigInt values are now preserved correctly:

```typescript
// Before v7.3.0: BigInt precision lost in JSON
// id: 312590077454712834 → 312590077454712830 (corrupted!)

// After v7.3.0: BigInt preserved as string
// id: "312590077454712834" (correct!)
```

#### Mapped Enum Behavior Reverted

```prisma
// v7.0 had breaking change for mapped enums
// v7.3.0 reverts to v6.19 behavior for compatibility

enum Status {
  Active    @map("active")
  Inactive  @map("inactive")
}
// Now works as expected, matching v6 behavior
```

#### Adapter Updates

- **MSSQL:** Updated to v12.2.0
- **SQLite:** Pinned version to avoid SQLite 3.51.0 bug

---

### Prisma ORM 7.4.0 (February 11, 2026)

Major performance release with query caching.

#### Query Caching Layer (Key Feature)

The most significant performance improvement in v7:

```typescript
// These queries have the same "shape"
const alice = await prisma.user.findUnique({ where: { email: 'alice@prisma.io' } })
const bob = await prisma.user.findUnique({ where: { email: 'bob@prisma.io' } })

// Prisma now caches the query shape:
// prisma.user.findUnique({ where: { email: %1 } })
//                              ↑ parameterized
```

##### Performance Impact

| Metric | Without Caching (v7.3.0) | With Caching (v7.4.0) |
|--------|-------------------------|----------------------|
| Per-query compilation | 0.1-1ms | 1-10µs |
| Cache hit rate | - | ~100% |
| Requests/second | Lower | Higher |
| Latency | Higher | Lower |

##### How It Works

1. Prisma extracts user-provided values and replaces with typed placeholders
2. Creates a normalized query shape as cache key
3. First call: compiles and caches the plan
4. Subsequent calls: reuses cached plan instantly

##### Schema-Aware Parameterization

The caching mechanism understands:
- Scalar values (strings, numbers, booleans)
- Rich types (DateTime, Decimal, BigInt, Bytes, Json)
- Enum values (validated against schema)
- Lists (arrays of scalars or enums)
- Nested objects (relation queries, filters)

#### Partial Indexes (Preview Feature)

Create indexes on subsets of data:

```prisma
generator client {
  provider        = "prisma-client"
  output          = "../src/generated/prisma"
  previewFeatures = ["partialIndexes"]
}

// Using raw SQL syntax
model User {
  id     Int    @id
  email  String
  status String

  @@unique([email], where: raw("status = 'active'"))
  @@index([email], where: raw("deletedAt IS NULL"))
}

// Using type-safe object syntax
model Post {
  id        Int      @id
  title     String
  published Boolean

  @@index([title], where: { published: true })
  @@unique([title], where: { published: { not: false } })
}
```

**Supported Databases:** PostgreSQL, SQLite, SQL Server, CockroachDB

---

## Migration Guide

### From Prisma v6 to v7

#### Step 1: Update Generator

```prisma
// Before
generator client {
  provider = "prisma-client-js"
}

// After
generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
}
```

#### Step 2: Create Config File

```typescript
// prisma.config.ts
import 'dotenv/config';
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    seed: "tsx prisma/seed.ts"
  },
  datasource: {
    url: process.env.DATABASE_URL,
    shadowDatabaseUrl: process.env.SHADOW_DATABASE_URL,
  },
});
```

#### Step 3: Install Driver Adapter

```bash
# PostgreSQL
npm install @prisma/adapter-pg pg

# MySQL
npm install @prisma/adapter-mariadb mariadb

# SQLite
npm install @prisma/adapter-better-sqlite3 better-sqlite3

# For prisma-client-js compatibility
npm install @prisma/client-runtime-utils
```

#### Step 4: Update PrismaClient Initialization

```typescript
// Before (v6)
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// After (v7) - Driver Adapter
import { PrismaClient } from './generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL
});

const prisma = new PrismaClient({ adapter });

// After (v7) - Accelerate
import { PrismaClient } from "./generated/prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

const prisma = new PrismaClient({
  accelerateUrl: process.env.DATABASE_URL,
}).$extends(withAccelerate());
```

#### Step 5: Environment Variables

No longer auto-loaded by Prisma CLI:

```bash
# Before: Prisma would read .env automatically
# After: You must load env vars explicitly

# Option 1: Use dotenv in config
import 'dotenv/config';

# Option 2: Load manually
source .env && prisma migrate dev
```

---

## Performance Considerations

### Event Loop Contention

v7's WASM approach runs on the main JavaScript thread:

```typescript
// Every query blocks the event loop briefly (0.1-1ms)
// Under high concurrency, this adds up

// Solutions:
// 1. Use PM2 for process clustering
// 2. Use Node.js cluster module
// 3. Use platform scaling features
```

### Query Caching (v7.4.0+)

Best practices for maximizing cache benefits:

```typescript
// Good: Reusing query shapes
await prisma.user.findMany({ where: { status: 'active' } });
await prisma.user.findMany({ where: { status: 'inactive' } });
// Same shape → cache hit

// Avoid: Dynamic field selection in loops
for (const fields of dynamicFieldSets) {
  await prisma.user.findMany({ select: fields });
  // Different shapes → no caching benefit
}
```

### Compiler Build Options

```prisma
// Production backend: optimize for speed
generator client {
  provider       = "prisma-client"
  output         = "../src/generated/prisma"
  compilerBuild  = "fast"
}

// Serverless/Edge: optimize for bundle size
generator client {
  provider       = "prisma-client"
  output         = "../src/generated/prisma"
  compilerBuild  = "small"
}
```

---

## Database Adapters

### Available Adapters

| Database | Package | Notes |
|----------|---------|-------|
| PostgreSQL | `@prisma/adapter-pg` | Standard pg driver |
| MySQL | `@prisma/adapter-mariadb` | MariaDB driver |
| SQLite | `@prisma/adapter-better-sqlite3` | Better-sqlite3 |
| Neon | `@prisma/adapter-neon` | Serverless Postgres |
| PlanetScale | `@prisma/adapter-planetscale` | Serverless MySQL |
| D1 (HTTP) | `@prisma/adapter-d1-http` | Cloudflare D1 |
| LibSQL | `@prisma/adapter-libsql` | Turso, etc. |
| MSSQL | `@prisma/adapter-mssql` | SQL Server v12+ |
| CockroachDB | `@prisma/adapter-pg` | Uses pg adapter |

### Adapter Naming Updates

```typescript
// Old (v6) → New (v7)
PrismaBetterSQLite3 → PrismaBetterSqlite3
PrismaD1HTTP → PrismaD1Http
PrismaLibSQL → PrismaLibSql
PrismaNeonHTTP → PrismaNeonHttp
```

---

## Known Limitations

### MongoDB Support

- **Status:** Not supported in v7.0
- **Workaround:** Stay on v6.x
- **ETA:** Coming in future release

### Removed Features

1. **DataProxy Engine:** Replaced with new RemoteExecutor
2. **React Native Engine:** Removed
3. **Library Engine:** No longer available
4. **Binary Engine:** Replaced by WASM

### Shadow Database URL

Moved from schema to config:

```prisma
// Before (v6)
datasource db {
  provider        = "postgresql"
  url             = "..."
  shadowDatabaseUrl = "..."
}

// After (v7)
// prisma.config.ts
export default defineConfig({
  datasource: {
    url: "...",
    shadowDatabaseUrl: "...",
  },
});
```

---

## Recommendations for Solom

### Immediate Actions

1. **Evaluate v7.4.0+ for Solom:**
   - Query caching significantly improves performance
   - 90% smaller bundle size beneficial for deployments
   - Better TypeScript integration

2. **Plan Migration Path:**
   ```prisma
   // Recommended generator config for Solom
   generator client {
     provider       = "prisma-client"
     output         = "../src/generated/prisma"
     compilerBuild  = "fast"  // Production backend
     previewFeatures = ["partialIndexes"]  // For filtered indexes
   }
   ```

3. **Add SQL Comments for Observability:**
   ```typescript
   // Integrate with existing observability stack
   import { queryTags } from '@prisma/sqlcommenter-query-tags';
   import { traceContext } from '@prisma/sqlcommenter-trace-context';
   
   const prisma = new PrismaClient({
     adapter,
     comments: [queryTags(), traceContext()],
   });
   ```

### Performance Optimizations

1. **Use query caching (v7.4.0+):**
   - Automatically enabled
   - Benefits repeated query shapes
   - Critical for high-traffic endpoints

2. **Consider partial indexes:**
   - Useful for `status` filtering
   - Reduces index size
   - Better query performance

3. **Choose compilerBuild wisely:**
   - `fast` for traditional backends
   - `small` for serverless/edge

### Migration Timeline

| Phase | Task | Effort |
|-------|------|--------|
| Week 1 | Create test branch, update generator | Low |
| Week 2 | Configure driver adapter, create config file | Medium |
| Week 3 | Update all PrismaClient imports | Medium |
| Week 4 | Test migrations, fix breaking changes | High |
| Week 5 | Performance testing, benchmark comparison | Medium |
| Week 6 | Production deployment | Low |

---

## References

- [Prisma 7.0 Release Announcement](https://www.prisma.io/blog/announcing-prisma-orm-7-0-0)
- [Prisma 7.1.0 Release](https://www.prisma.io/blog/announcing-prisma-orm-7-2-0)
- [Prisma 7.3.0 Release](https://www.prisma.io/blog/prisma-orm-7-3-0)
- [Prisma 7.4.0 Release](https://www.prisma.io/blog/prisma-orm-v7-4-query-caching-partial-indexes-and-major-performance-improvements)
- [GitHub Releases](https://github.com/prisma/prisma/releases)
- [Upgrade Guide](https://www.prisma.io/docs/orm/more/upgrade-guides/upgrading-versions/upgrading-to-prisma-7)
- [InfoQ: Prisma 7 Performance Analysis](https://www.infoq.com/news/2026/01/prisma-7-performance/)

---

## Summary

Prisma ORM 7 represents a significant architectural shift from Rust-based to TypeScript/WASM-based query compilation. Key benefits include:

- **90% smaller bundle sizes**
- **Up to 3x faster queries**
- **Simplified deployment** (no binary engine)
- **Query caching** (v7.4.0+) for repeated queries
- **Better observability** via SQL comments

The migration requires updating generator configuration, creating a config file, and changing PrismaClient initialization to use driver adapters. For Solom, this migration offers meaningful performance improvements and simplified deployment at the cost of a structured migration effort.

---

*Research completed: March 1, 2026*