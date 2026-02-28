# Next.js 15 Features Documentation

> **Research Document for Solom Platform**  
> Issue #15 - Created: February 28, 2026

---

## Executive Summary

Next.js 15 represents a significant evolution in the React framework, introducing React 19 support, stable Turbopack for development, breaking caching changes, and numerous developer experience improvements. This document provides a comprehensive overview of all major features and migration considerations for the Solom finance platform.

---

## Table of Contents

1. [Major New Features](#major-new-features)
2. [Breaking Changes](#breaking-changes)
3. [Developer Experience Improvements](#developer-experience-improvements)
4. [Performance Enhancements](#performance-enhancements)
5. [Migration Guide](#migration-guide)
6. [Recommendations for Solom](#recommendations-for-solom)

---

## Major New Features

### 1. React 19 Support

Next.js 15 officially supports React 19, bringing significant improvements:

- **Server Components**: Full support for React Server Components (RSC)
- **Server Actions**: Simplified server-side mutations
- **React Compiler (Experimental)**: Automatic memoization optimizations
- **Improved Hydration Error Messages**: Better debugging experience

```tsx
// Server Action example with React 19
async function updateStockPrice(formData: FormData) {
  'use server'
  const symbol = formData.get('symbol') as string
  const price = parseFloat(formData.get('price') as string)
  await updateStock(symbol, price)
  revalidatePath('/stocks')
}
```

### 2. Turbopack Dev (Stable)

Turbopack is now production-ready for development:

```bash
# Enable Turbopack in development
next dev --turbo
```

**Performance Improvements:**
- Up to **76.7% faster** local server startup
- Up to **96.3% faster** code updates with Fast Refresh
- Up to **45.8% faster** initial route compile

### 3. Async Request APIs (Breaking Change)

Request-specific APIs are now asynchronous for better performance:

```tsx
// Before (Next.js 14)
import { cookies } from 'next/headers'
const cookieStore = cookies() // Synchronous

// After (Next.js 15)
import { cookies } from 'next/headers'
const cookieStore = await cookies() // Async
```

**Affected APIs:**
- `cookies()`
- `headers()`
- `draftMode()`
- `params` in `layout.js`, `page.js`, `route.js`, `default.js`
- `searchParams` in `page.js`

### 4. `<Form>` Component

New built-in form component with progressive enhancement:

```tsx
import Form from 'next/form'

export default function SearchPage() {
  return (
    <Form action="/search">
      <input name="query" type="text" />
      <button type="submit">Search</button>
    </Form>
  )
}
```

**Features:**
- Prefetching when form is in view
- Client-side navigation on submission
- Progressive enhancement for JavaScript-disabled clients

### 5. `instrumentation.js` (Stable)

Server lifecycle observability hook:

```tsx
// instrumentation.ts
export async function register() {
  // Initialize observability SDK
}

export async function onRequestError(err, request, context) {
  // Capture errors with context
  await logError({
    message: err.message,
    router: context.router, // 'AppRouter' | 'PagesRouter'
    serverContext: context.serverComponent, // 'action' | 'page' | etc.
  })
}
```

### 6. `unstable_after` API (Experimental)

Execute code after response streaming:

```tsx
import { unstable_after as after } from 'next/server'

export default function Layout({ children }) {
  after(() => {
    // Run analytics, logging, etc.
    logPageView()
  })
  
  return <>{children}</>
}
```

### 7. TypeScript Config Support

Native TypeScript config file:

```ts
// next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  /* typed config options */
}

export default nextConfig
```

---

## Breaking Changes

### 1. Caching Semantics

**GET Route Handlers** no longer cached by default:

```tsx
// Before: GET routes cached by default
// After: Need explicit opt-in for caching

export const dynamic = 'force-static' // Opt into caching
```

**Client Router Cache** has `staleTime: 0` for Page segments:
- Shared layouts still support partial rendering
- Back/forward navigation still uses cache
- `loading.js` remains cached for 5 minutes

### 2. Image Component Changes

- Removed `squoosh` in favor of `sharp`
- Changed default `Content-Disposition` to `attachment`
- Error on leading/trailing spaces in `src`

### 3. Server Actions Security

Enhanced security with:
- Dead code elimination for unused actions
- Unguessable, non-deterministic action IDs

### 4. Minimum Node.js Version

Now requires Node.js **18.18.0** or higher.

### 5. Deprecated Features Removed

- `experimental-edge` runtime (use `edge` instead)
- `@next/font` package (use built-in `next/font`)
- Auto-instrumentation for Speed Insights

---

## Developer Experience Improvements

### Static Route Indicator

Visual indicator showing which routes are static during development:

```
○ /about (static)
● /dashboard (dynamic)
ƒ /profile (server component)
```

### ESLint 9 Support

Full compatibility with ESLint 9:
- Backwards compatible with ESLint 8
- Automatic flat config migration support
- Updated `eslint-plugin-react-hooks` to v5.0.0

### Improved Error Messages

Better hydration error diagnostics with:
- Source code context
- Suggestions for fixes
- Clearer stack traces

### Codemod CLI

Automated upgrade tool:

```bash
npx @next/codemod@canary upgrade latest
```

---

## Performance Enhancements

### Server Components HMR Cache

Hot Module Replacement now reuses `fetch` responses during development, reducing:
- API call costs
- Development latency

### Faster Static Generation

Optimizations include:
- Single-pass rendering (was two-pass)
- Shared `fetch` cache across pages
- Configurable worker concurrency

### External Package Bundling

Unified configuration for App and Pages Router:

```ts
const nextConfig = {
  // Bundle external packages by default
  bundlePagesRouterDependencies: true,
  
  // Opt out specific packages
  serverExternalPackages: ['package-name'],
}
```

---

## Migration Guide

### Step 1: Update Dependencies

```bash
# Using the upgrade CLI (recommended)
npx @next/codemod@canary upgrade latest

# Or manually
npm install next@latest react@rc react-dom@rc
```

### Step 2: Update Async APIs

```bash
# Run the async API codemod
npx @next/codemod@canary next-async-request-api .
```

### Step 3: Update Caching

Review and update any `GET` Route Handlers that relied on default caching:

```tsx
// Add explicit caching where needed
export const dynamic = 'force-static'
// or
export const revalidate = 3600 // Revalidate every hour
```

### Step 4: Update Image Handling

Ensure `sharp` is properly configured:
```bash
npm install sharp
```

### Step 5: Test Thoroughly

1. Run `next build` to catch build-time errors
2. Test Server Actions for proper security
3. Verify caching behavior matches expectations
4. Check hydration errors in development

---

## Recommendations for Solom

### Immediate Actions

1. **Upgrade to Next.js 15** - The React 19 support and Turbopack improvements are significant
2. **Enable Turbopack in development** - Will significantly improve DX
3. **Update async API calls** - Especially in middleware and server components

### Architecture Considerations

1. **Server Actions for Data Mutations**
   - Replace API routes with Server Actions where appropriate
   - Particularly useful for stock updates, user actions

2. **Static Generation for Market Data**
   - Use ISR (Incremental Static Regeneration) for semi-static data
   - Revalidate stock listings hourly for SEO

3. **Form Component for Search**
   - Replace custom search implementation with `<Form>`
   - Benefits: prefetching, progressive enhancement

### Configuration Updates

```ts
// recommended next.config.ts for Solom
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Enable Turbopack in dev
  experimental: {
    after: true, // For analytics after response
  },
  
  // Self-hosting improvements
  expireTime: 86400, // 24 hours for ISR
  
  // Bundle optimization
  serverExternalPackages: ['@prisma/client'],
}

export default nextConfig
```

### Testing Priorities

1. **Real-time data flows** - WebSocket connections, SSE
2. **Authentication** - Cookie handling with async APIs
3. **Caching** - Stock quotes, market data
4. **Server Actions** - All mutation endpoints

---

## Resources

- [Official Next.js 15 Blog Post](https://nextjs.org/blog/next-15)
- [Next.js 15 Upgrade Guide](https://nextjs.org/docs/app/building-your-application/upgrading/version-15)
- [React 19 Upgrade Guide](https://react.dev/blog/2024/04/25/react-19-upgrade-guide)
- [Turbopack Documentation](https://nextjs.org/docs/app/building-your-application/configuring/turbopack)

---

## Changelog Reference

### Next.js 15 Key Dates
- **May 2024**: RC1 Released
- **October 2024**: Stable Release (Next.js 15.0)
- **December 2024**: Next.js 15.1 with React 19 stable support

### Support Timeline
- **Active LTS**: Until Next.js 16 release
- **Security Updates**: Until October 2026

---

*This document will be updated as additional Next.js 15.x releases are published.*