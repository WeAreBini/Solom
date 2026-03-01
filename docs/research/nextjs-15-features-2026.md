# Next.js 15 Features & Best Practices (2026)

> **Research Document** - Comprehensive overview of Next.js 15 features, migration considerations, and best practices for the Solom finance platform.
> 
> **Created:** March 1, 2026 | **Issue:** #69

---

## Executive Summary

Next.js 15 represents a significant milestone in the React framework ecosystem, introducing React 19 support, stable Turbopack for development, and foundational changes to caching semantics. This release focuses heavily on **stability and developer experience** while setting the stage for future optimizations like Partial Prerendering.

---

## Table of Contents

1. [Key Features Overview](#key-features-overview)
2. [Async Request APIs](#async-request-apis-breaking-change)
3. [Caching Semantics Changes](#caching-semantics)
4. [React 19 Support](#react-19-support)
5. [Turbopack Dev (Stable)](#turbopack-dev)
6. [Form Component](#form-component)
7. [Security Enhancements](#enhanced-security-for-server-actions)
8. [Developer Experience Improvements](#developer-experience-improvements)
9. [Migration Guide](#migration-guide)
10. [Best Practices for Solom](#best-practices-for-solom)
11. [Next.js 16 Preview](#nextjs-16-preview)
12. [References](#references)

---

## Key Features Overview

| Feature | Status | Impact |
|---------|--------|--------|
| React 19 Support | Stable | High |
| Turbopack Dev | Stable | High |
| Async Request APIs | Breaking | High |
| Caching Semantics | Breaking | High |
| `next/form` Component | Stable | Medium |
| `unstable_after` API | Experimental | Medium |
| `instrumentation.js` | Stable | Medium |
| React Compiler | Experimental | Medium |
| Static Route Indicator | Stable | Low |

---

## Async Request APIs (Breaking Change)

### Overview

Next.js 15 transitions request-specific APIs from synchronous to **asynchronous**. This change enables better server-side rendering optimizations by allowing the server to prepare content before request data arrives.

### Affected APIs

- `cookies()`
- `headers()`
- `draftMode()`
- `params` in `layout.js`, `page.js`, `route.js`, `default.js`, `generateMetadata`, `generateViewport`
- `searchParams` in `page.js`

### Migration Pattern

```typescript
// ❌ Next.js 14 (deprecated synchronous access)
import { cookies } from 'next/headers'

export function AdminPanel() {
  const cookieStore = cookies() // Synchronous
  const token = cookieStore.get('token')
  return <div>{token?.value}</div>
}

// ✅ Next.js 15 (required async access)
import { cookies } from 'next/headers'

export async function AdminPanel() {
  const cookieStore = await cookies() // Asynchronous
  const token = cookieStore.get('token')
  return <div>{token?.value}</div>
}
```

### Automatic Migration

```bash
npx @next/codemod@canary next-async-request-api .
```

### Why This Matters for Finance Apps

For finance applications like Solom that rely heavily on:
- Authentication tokens in cookies
- User session data in headers
- Dynamic routing parameters

This change requires careful migration but enables **better streaming and partial rendering** for improved perceived performance.

---

## Caching Semantics

### Breaking Changes

Next.js 15 fundamentally changes caching defaults based on community feedback:

| Resource | Next.js 14 | Next.js 15 |
|----------|------------|------------|
| `fetch` requests | Cached by default | **Not cached by default** |
| `GET` Route Handlers | Cached by default | **Not cached by default** |
| Client Router Cache (Pages) | Cached for 5 min | **staleTime of 0** |

### Configuration Options

```typescript
// next.config.ts
const nextConfig = {
  experimental: {
    staleTimes: {
      dynamic: 30, // Cache dynamic routes for 30 seconds
    },
  },
}

export default nextConfig
```

### Implications for Financial Data

**Positive:**
- Real-time stock prices are now uncached by default (correct behavior)
- Market data fetches won't serve stale data unexpectedly

**Considerations:**
- API rate limiting becomes more critical
- Implement explicit caching for less volatile data:

```typescript
// Explicitly cache stable data
export const revalidate = 60 // seconds

// Or use fetch cache options
fetch('/api/stock-info', { 
  next: { 
    revalidate: 60, 
    tags: ['stock-info'] 
  } 
})
```

---

## React 19 Support

### Key Features

Next.js 15 includes React 19 RC support with the following improvements:

1. **React 19 RC Compatibility**
   - App Router uses React 19 RC
   - Pages Router maintains React 18 backward compatibility

2. **React Compiler (Experimental)**
   - Automatic memoization of components
   - Reduces need for `useMemo` and `useCallback`
   - Available as Babel plugin (slower builds currently)

```typescript
// next.config.ts
const nextConfig = {
  experimental: {
    reactCompiler: true,
  },
}
```

3. **Improved Hydration Errors**
   - Clearer error messages with source code context
   - Actionable suggestions for resolution

### React Compiler Benefits

```typescript
// Before React Compiler
function StockList({ stocks }) {
  const sorted = useMemo(() => stocks.sort((a, b) => a.price - b.price), [stocks])
  const totalValue = useMemo(() => stocks.reduce((acc, s) => acc + s.value, 0), [stocks])
  
  return (
    <>
      <div>Total: ${totalValue}</div>
      {sorted.map(stock => <StockCard key={stock.id} stock={stock} />)}
    </>
  )
}

// With React Compiler - automatic optimization
function StockList({ stocks }) {
  const sorted = stocks.sort((a, b) => a.price - b.price)
  const totalValue = stocks.reduce((acc, s) => acc + s.value, 0)
  
  return (
    <>
      <div>Total: ${totalValue}</div>
      {sorted.map(stock => <StockCard key={stock.id} stock={stock} />)}
    </>
  )
}
```

---

## Turbopack Dev

### Performance Benchmarks

Turbopack, written in Rust, is now **stable for development**:

| Metric | Improvement |
|--------|-------------|
| Local server startup | Up to **76.7% faster** |
| Fast Refresh | Up to **96.3% faster** |
| Initial route compile | Up to **45.8% faster** |

### Usage

```bash
# Enable Turbopack in development
next dev --turbo

# Or in package.json
{
  "scripts": {
    "dev": "next dev --turbo"
  }
}
```

### Real-World Impact

For the Solom platform:
- Faster iteration during feature development
- Quicker feedback loop for UI changes
- Better developer experience with large codebases

**Note:** Turbopack for production builds remains in development.

---

## Form Component

### New `next/form` Component

Enhanced HTML form with client-side navigation:

```typescript
import Form from 'next/form'

export function StockSearchForm() {
  return (
    <Form action="/search">
      <input name="query" type="text" placeholder="Search stocks..." />
      <button type="submit">Search</button>
    </Form>
  )
}
```

### Features

1. **Prefetching** - Forms prefetch their destination on hover
2. **Progressive Enhancement** - Works without JavaScript
3. **Client-side Navigation** - SPA-like transitions between pages
4. **Loading States** - Built-in loading indicator support

### Migration from Standard Forms

```typescript
// Before: Standard HTML form (full page reload)
<form action="/search" method="GET">
  <input name="query" />
</form>

// After: Next.js Form (client navigation)
import Form from 'next/form'

<Form action="/search">
  <input name="query" />
</Form>
```

---

## Enhanced Security for Server Actions

### Unguessable Endpoints

Server Actions now use **hashed function names** as endpoint identifiers instead of predictable paths:

```typescript
// Server actions are no longer predictable
// Before: /_next/data/buildId/action-name
// After: /_next/data/buildId/a1b2c3d4e5...
```

### Benefits

1. **Reduced Attack Surface** - Harder to enumerate available actions
2. **Automatic Dead Code Elimination** - Unused actions are tree-shaken
3. **CSRF Protection** - Built-in security mechanisms

### Best Practices

```typescript
// app/actions/stock-actions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

// Always validate input
const BuyStockSchema = z.object({
  symbol: z.string().min(1).max(10),
  quantity: z.number().positive().int(),
})

export async function buyStock(formData: FormData) {
  const validated = BuyStockSchema.parse({
    symbol: formData.get('symbol'),
    quantity: Number(formData.get('quantity')),
  })
  
  // ... business logic
  
  revalidatePath('/portfolio')
}
```

---

## Developer Experience Improvements

### 1. Static Route Indicator

Visual indicator in development showing route rendering strategy:

- 🟢 Static - Pre-rendered at build time
- 🟡 Dynamic - Server-rendered on each request
- 🔵 ISR - Static with revalidation

### 2. TypeScript Config Support

```typescript
// next.config.ts (TypeScript support)
import type { NextConfig } from 'next'

const config: NextConfig = {
  // Full type safety
  images: {
    domains: ['api.solom.io'],
  },
}

export default config
```

### 3. `instrumentation.js` API (Stable)

```typescript
// instrumentation.ts
export function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Initialize monitoring, logging, etc.
    console.log('Server started')
  }
}
```

### 4. ESLint 9 Support

Full compatibility with ESLint 9's new configuration format.

### 5. Self-Hosting Improvements

More control over `Cache-Control` headers for deployments outside Vercel:

```typescript
// next.config.ts
const config: NextConfig = {
  headers: async () => [
    {
      source: '/api/:path*',
      headers: [
        { key: 'Cache-Control', value: 'public, max-age=60' },
      ],
    },
  ],
}
```

---

## Migration Guide

### Step 1: Upgrade Command

```bash
# Automated upgrade
npx @next/codemod@canary upgrade latest

# Manual upgrade
npm install next@latest react@rc react-dom@rc
```

### Step 2: Fix Async APIs

```bash
# Automatic codemod for async request APIs
npx @next/codemod@canary next-async-request-api .
```

### Step 3: Update Caching

Review and update caching strategies:

```typescript
// If you relied on default caching, explicitly opt-in
export const dynamic = 'force-static'

// Or use fetch cache options
fetch(url, { cache: 'force-cache' })
```

### Step 4: Enable Turbopack

```json
// package.json
{
  "scripts": {
    "dev": "next dev --turbo"
  }
}
```

### Step 5: Update TypeScript

```bash
npm install -D @types/react@latest @types/react-dom@latest
```

---

## Best Practices for Solom

### 1. Financial Data Caching Strategy

```typescript
// app/api/stocks/route.ts
import { NextResponse } from 'next/server'

// Real-time data - no caching
export async function GET(request: Request) {
  const stocks = await fetchLiveStockData()
  return NextResponse.json(stocks)
}

// Historical data - cache aggressively
export async function getHistoricalData(symbol: string) {
  const data = await fetch(`/api/history/${symbol}`, {
    next: { revalidate: 3600, tags: ['historical'] }
  })
  return data.json()
}
```

### 2. Authentication with Async Cookies

```typescript
// lib/auth.ts
import { cookies } from 'next/headers'

export async function getAuthUser() {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get('session')
  
  if (!sessionToken) {
    return null
  }
  
  return verifySession(sessionToken.value)
}

// app/dashboard/page.tsx
import { getAuthUser } from '@/lib/auth'

export default async function DashboardPage() {
  const user = await getAuthUser()
  
  if (!user) {
    redirect('/login')
  }
  
  return <Dashboard user={user} />
}
```

### 3. Form Handling for Financial Operations

```typescript
// app/trade/page.tsx
import Form from 'next/form'
import { buyStock } from '@/app/actions/trade'

export default function TradePage() {
  return (
    <Form action={buyStock}>
      <select name="symbol">
        <option value="AAPL">Apple Inc.</option>
        <option value="GOOGL">Alphabet Inc.</option>
      </select>
      <input type="number" name="quantity" min="1" />
      <button type="submit">Buy</button>
    </Form>
  )
}
```

### 4. Performance Monitoring

```typescript
// instrumentation.ts
export function register() {
  if (process.env.NODE_ENV === 'production') {
    // Initialize APM/monitoring
    initMonitoring()
  }
}

// app/api/metrics/route.ts
import { unstable_after as after } from 'next/server'

after(() => {
  // Log after response completes
  logMetrics()
})
```

---

## Next.js 16 Preview

### What's Coming in Next.js 16

Based on official documentation, Next.js 16 introduces:

| Feature | Description |
|---------|-------------|
| Turbopack by Default | No `--turbo` flag needed for dev/build |
| Node.js 20.9+ Required | Minimum version increased |
| TypeScript 5+ Required | Minimum TypeScript version |
| Async APIs Only | Synchronous access removed |
| Browser Support Update | Chrome 111+, Firefox 111+, Safari 16.4+ |

### Turbopack Configuration Changes

```typescript
// Next.js 15
const config: NextConfig = {
  experimental: {
    turbopack: { /* options */ }
  }
}

// Next.js 16
const config: NextConfig = {
  turbopack: { /* options - top level */ }
}
```

### Opting Out of Turbopack

```json
// package.json (if you need webpack)
{
  "scripts": {
    "dev": "next dev",
    "build": "next build --webpack"
  }
}
```

---

## References

1. [Next.js 15 Official Release](https://nextjs.org/blog/next-15) - Primary source for feature details
2. [Next.js 16 Upgrade Guide](https://nextjs.org/docs/app/guides/upgrading/version-16) - Migration path
3. [React 19 Upgrade Guide](https://react.dev/blog/2024/04/25/react-19-upgrade-guide) - React changes
4. [Turbopack Documentation](https://nextjs.org/docs/app/api-reference/next-config-js/turbopack) - Configuration options
5. [Static Route Indicator](https://nextjs.org/docs/app/api-reference/next-config-js/devIndicators) - Development observability
6. [Jishu Labs Migration Guide](https://jishulabs.com/blog/nextjs-15-16-features-migration-guide-2026) - Community perspective

---

## Conclusion

Next.js 15 is a pivotal release that:

1. **Modernizes the framework** with React 19 support and async APIs
2. **Improves developer experience** with stable Turbopack and better errors
3. **Enhances security** with hardened Server Actions
4. **Simplifies caching** with more intuitive defaults

For the Solom finance platform, this release provides:
- Better real-time data handling with uncached fetches
- Improved security for financial operations
- Faster development iteration with Turbopack
- Cleaner authentication code with async cookies

**Recommendation:** Plan migration to Next.js 15 in Q1 2026, with Next.js 16 targeted for Q2 2026 after its stable release.

---

*Research conducted using official Next.js documentation, community resources, and release notes.*