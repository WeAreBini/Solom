# Next.js 15 & 16 New Features (2026)

> Research documentation for Solom project - Understanding Next.js 15 and 16 capabilities for application architecture.

## Executive Summary

Next.js 15 (October 2024) and Next.js 16 (October 2025) represent major architectural shifts in the React framework landscape. Key changes include:

- **Turbopack** becoming the default bundler (2-5× faster builds)
- **Cache Components** model replacing implicit caching
- **React 19/19.2 support** with new hooks and features
- **Async Request APIs** for better rendering optimization
- **Enhanced caching APIs** with explicit control

---

## Version Overview

| Feature | Next.js 14 | Next.js 15 | Next.js 16 |
|---------|-----------|-------------|-------------|
| React Version | 18 | 19 RC | 19.2 |
| Bundler | webpack | Turbopack (dev only) | Turbopack (stable, default) |
| Caching | Implicit by default | Opt-out by default | Explicit with Cache Components |
| Request APIs | Synchronous | Async (breaking) | Async only |
| Minimum Node.js | 18.17 | 18.18 | 20.9 |
| TypeScript | 4.x | 5.x | 5.x |

---

## Next.js 15 Key Features

### 1. React 19 Support

Next.js 15 ships with React 19 RC support, enabling:

- **`useActionState`**: Replacement for `useFormState` with additional properties like `pending` state
- **Enhanced `useFormStatus`**: Now includes `data`, `method`, and `action` keys
- **Actions API**: Form handling with progressive enhancement

```tsx
// React 19 useActionState
import { useActionState } from 'react'

function Form({ action }) {
  const [state, formAction, pending] = useActionState(action, initialState)
  return (
    <form action={formAction}>
      <input name="field" />
      <button type="submit" disabled={pending}>Submit</button>
    </form>
  )
}
```

### 2. Async Request APIs (Breaking Change)

All request-dependent APIs are now asynchronous:

```tsx
// Before (Next.js 14)
import { cookies, headers } from 'next/headers'
const cookieStore = cookies()
const headerStore = headers()

// After (Next.js 15+)
import { cookies, headers } from 'next/headers'
const cookieStore = await cookies()
const headerStore = await headers()

// params and searchParams are now async
export default async function Page({ params, searchParams }) {
  const { slug } = await params
  const { query } = await searchParams
  return <div>...</div>
}
```

**Migration Commands:**
```bash
npx @next/codemod@canary upgrade latest
# or manual upgrade
npx @next/codemod@canary next-async-request-api .
```

### 3. Caching Semantics Changes

Next.js 15 changed default caching behavior:

```tsx
// fetch requests are NO LONGER cached by default
const data = await fetch('https://api.example.com/data') // Not cached

// Opt into caching explicitly
const cached = await fetch('https://api.example.com/data', { 
  cache: 'force-cache' 
})

// GET Route Handlers are NOT cached by default
export async function GET() {
  return Response.json({ data: '...' })
}

// Opt into caching
export const dynamic = 'force-static'
export async function GET() {
  return Response.json({ data: '...' })
}
```

### 4. Turbopack Dev (Stable)

```bash
# Enable Turbopack in development
next dev --turbo

# Performance improvements:
# - Up to 76.7% faster local server startup
# - Up to 96.3% faster Fast Refresh
# - Up to 45% faster initial route compile
```

### 5. Static Route Indicator

New development UI showing which routes are static or dynamic:

- Visual indicator in dev mode
- Helps optimize performance
- Configurable via `devIndicators.appIsrStatus`

### 6. `unstable_after` API (Experimental)

Execute code after response streaming completes:

```tsx
import { unstable_after as after } from 'next/server'

export default function Layout({ children }) {
  // Secondary task - runs after response
  after(() => {
    log() // Analytics, logging, etc.
  })

  return <>{children}</>
}
```

### 7. `next/form` Component

Enhanced HTML forms with client-side navigation:

```tsx
import Form from 'next/form'

export default function SearchPage() {
  return (
    <Form action="/search">
      <input name="query" />
      <button type="submit">Search</button>
    </Form>
  )
}
```

Features:
- **Prefetching**: Layout and loading UI prefetched on viewport
- **Client-side Navigation**: Shared layouts preserved
- **Progressive Enhancement**: Works without JavaScript

### 8. TypeScript Config Support

```ts
// next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  /* config options here */
}

export default nextConfig
```

### 9. Self-hosting Improvements

- More control over `Cache-Control` headers
- Automatic `sharp` installation for image optimization
- Configurable `expireTime` for ISR stale-while-revalidate

### 10. Server Actions Security

- Dead code elimination for unused actions
- Secure, unguessable action IDs
- IDs recalculated between builds

---

## Next.js 16 Key Features

### 1. Cache Components (Game Changer)

Cache Components introduce a new caching model that replaces implicit caching with explicit declarations:

```ts
// next.config.ts
const nextConfig: NextConfig = {
  cacheComponents: true,
}

export default nextConfig
```

**Key Concepts:**
- All dynamic code executes at request time by default
- Use `"use cache"` directive to opt into caching
- Static shells with streaming dynamic content (Partial Prerendering)

```tsx
// Explicit caching with "use cache"
import { cacheLife } from 'next/cache'

export default async function Page() {
  'use cache'
  cacheLife('hours') // Cache profile

  const data = await fetch('https://api.example.com/data')
  return <div>{data}</div>
}
```

### 2. Turbopack (Stable, Default)

Turbopack is now the default bundler for all apps:

```bash
# Default bundler (no flag needed)
next dev
next build

# Opt out of Turbopack (use webpack)
next dev --webpack
next build --webpack

# File System Caching (beta)
# next.config.ts
const nextConfig = {
  experimental: {
    turbopackFileSystemCacheForDev: true,
  },
}
```

**Performance:**
- 2-5× faster production builds
- Up to 10× faster Fast Refresh
- Faster startup times with disk caching

### 3. React 19.2 Features

- **View Transitions**: Animate elements during navigation
- **`useEffectEvent()`**: Extract non-reactive logic from Effects
- **`<Activity/>`**: Render background content with `display: none`

```tsx
// View Transitions example
import { ViewTransition } from 'react'

function Page() {
  return (
    <ViewTransition>
      <Content />
    </ViewTransition>
  )
}
```

### 4. Next.js Devtools MCP

Model Context Protocol integration for AI-assisted debugging:
- Contextual insight into routing, caching, rendering
- Unified browser and server logs
- Automatic error access with stack traces
- Page awareness for context

### 5. `proxy.ts` (replaces `middleware.ts`)

```tsx
// proxy.ts - New naming convention
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export default function proxy(request: NextRequest) {
  return NextResponse.redirect(new URL('/home', request.url))
}

// middleware.ts still works but is deprecated
// Recommended: Rename to proxy.ts
```

### 6. Enhanced Routing & Navigation

- **Layout deduplication**: Shared layouts downloaded once
- **Incremental prefetching**: Only fetch parts not in cache
- **Request cancellation**: Links leaving viewport cancel prefetches
- **Priority on hover**: Prefetches prioritized on interaction

### 7. Improved Caching APIs

#### `revalidateTag()` (updated)

Requires a cacheLife profile:

```tsx
import { revalidateTag } from 'next/cache'

// ✅ New signature with profile
revalidateTag('blog-posts', 'max')

// Built-in profiles: 'max', 'hours', 'days', 'weeks'
// Or custom: { expire: 3600 }

// ⚠️ Deprecated: Single argument
revalidateTag('blog-posts')
```

#### `updateTag()` (new)

Server Actions-only API for read-your-writes semantics:

```tsx
'use server'

import { updateTag } from 'next/cache'

export async function updateUserProfile(userId: string, profile: Profile) {
  await db.users.update(userId, profile)
  
  // Expire cache and refresh immediately
  updateTag(`user-${userId}`)
}
```

#### `refresh()` (new)

Server Actions-only API for refreshing uncached data:

```tsx
'use server'

import { refresh } from 'next/cache'

export async function markNotificationAsRead(id: string) {
  await db.notifications.markAsRead(id)
  refresh() // Refresh uncached data (e.g., notification count in header)
}
```

### 8. Logging Improvements

Development logs show time breakdown:
```
✓ Compiled successfully in 615ms
✓ Finished TypeScript in 1114ms
✓ Collecting page data in 208ms
✓ Generating static pages in 239ms
✓ Finalizing page optimization in 5ms
```

---

## Migration Guide

### From Next.js 14 to 15

```bash
# Automated upgrade
npx @next/codemod@canary upgrade latest

# Manual upgrade
npm install next@latest react@latest react-dom@latest
```

**Key Changes:**
1. Make `cookies()`, `headers()`, `params`, `searchParams` async
2. Update caching behavior (fetch no longer cached by default)
3. Remove `@next/font` imports (use `next/font`)
4. Update `experimental-edge` to `edge` runtime

### From Next.js 15 to 16

**Key Changes:**
1. Enable `cacheComponents: true` in config
2. Rename `middleware.ts` to `proxy.ts`
3. Use `use cache` directive for caching
4. Update `revalidateTag()` to include profile
5. Remove deprecated config options

---

## Recommended Patterns for Solom

### 1. API Routes

```tsx
// app/api/stocks/route.ts
import { NextResponse } from 'next/server'
import { cacheLife } from 'next/cache'

export const runtime = 'nodejs' // or 'edge' (not with cacheComponents)

// For cached responses
export async function GET() {
  'use cache'
  cacheLife('minutes')
  
  const stocks = await getStockData()
  return NextResponse.json(stocks)
}
```

### 2. Server Components with Real-time Data

```tsx
// app/stocks/page.tsx
import { Suspense } from 'react'
import { cacheLife } from 'next/cache'

// Cached market hours data
async function StockList() {
  'use cache'
  cacheLife('minutes')
  
  const stocks = await fetchStocks()
  return <div>{/* render stocks */}</div>
}

// Real-time personalized data
async function UserPortfolio() {
  'use server'
  const session = await getCurrentSession()
  const portfolio = await getUserPortfolio(session.userId)
  return <div>{/* render portfolio */}</div>
}

export default function StocksPage() {
  return (
    <>
      <StockList />
      <Suspense fallback={<div>Loading portfolio...</div>}>
        <UserPortfolio />
      </Suspense>
    </>
  )
}
```

### 3. Financial Data Caching Strategy

```ts
// Recommended cache profiles for financial data
const cacheProfiles = {
  // Stock prices - short cache, frequent revalidation
  stockPrice: { stale: 60, revalidate: 60, expire: 300 },
  
  // Company info - medium cache
  companyInfo: { stale: 3600, revalidate: 3600, expire: 86400 },
  
  // Historical data - long cache
  historicalData: { stale: 86400, revalidate: 86400, expire: 604800 },
  
  // User preferences - update on mutation
  userPreferences: 'max',
}
```

### 4. Server Actions for Mutations

```tsx
// app/actions/stock-actions.ts
'use server'

import { updateTag } from 'next/cache'
import { revalidatePath } from 'next/cache'

export async function addToWatchlist(symbol: string, userId: string) {
  await db.watchlist.create({ data: { symbol, userId } })
  
  // Immediate update
  updateTag(`watchlist-${userId}`)
  
  // Revalidate specific path
  revalidatePath('/watchlist', 'max')
}
```

---

## Breaking Changes Summary

### Removed in Next.js 15
- AMP support
- `@next/font` package (use `next/font`)
- `serverRuntimeConfig` and `publicRuntimeConfig`
- Auto `scroll-behavior: smooth`
- Synchronous request APIs

### Removed in Next.js 16
- `experimental.ppr` flag (replaced by `cacheComponents`)
- `experimental-edge` runtime (use `edge`)
- `next lint` command (use Biome/ESLint directly)
- `images.domains` (use `images.remotePatterns`)
- `next/legacy/image` component

---

## Resources

- [Next.js 15 Release Notes](https://nextjs.org/blog/next-15)
- [Next.js 16 Release Notes](https://nextjs.org/blog/next-16)
- [Upgrade Guide v15](https://nextjs.org/docs/app/guides/upgrading/version-15)
- [Upgrade Guide v16](https://nextjs.org/docs/app/guides/upgrading/version-16)
- [Cache Components Documentation](https://nextjs.org/docs/app/getting-started/cache-components)
- [React 19 Release](https://react.dev/blog/2024/12/05/react-19)

---

## Last Updated

March 2026 - Based on Next.js 16.1.6 documentation

## Authors

Solom Developer Agent - Research Task