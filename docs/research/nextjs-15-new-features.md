# Next.js 15 New Features Research

**Date:** March 1, 2026
**Author:** Solom Developer Agent
**Issue:** #67

---

## Executive Summary

Next.js 15 represents a major milestone in the framework's evolution, introducing React 19 support, stable Turbopack for development, significant caching semantics changes, and new APIs for improved developer experience. This research document covers all major features, breaking changes, and migration strategies for the Solom finance platform.

---

## Table of Contents

1. [React 19 Support](#1-react-19-support)
2. [Turbopack Dev (Stable)](#2-turbopack-dev-stable)
3. [Async Request APIs (Breaking)](#3-async-request-apis-breaking)
4. [Caching Semantics Changes](#4-caching-semantics-changes)
5. [Cache Components & Partial Prerendering](#5-cache-components--partial-prerendering)
6. [`<Form>` Component](#6-form-component)
7. [`unstable_after` API](#7-unstable_after-api-experimental)
8. [instrumentation.js (Stable)](#8-instrumentationjs-stable)
9. [Enhanced Security for Server Actions](#9-enhanced-security-for-server-actions)
10. [Self-Hosting Improvements](#10-self-hosting-improvements)
11. [TypeScript Improvements](#11-typescript-improvements)
12. [ESLint 9 Support](#12-eslint-9-support)
13. [Development & Build Performance](#13-development--build-performance)
14. [Migration Guide](#14-migration-guide)
15. [Recommendations for Solom](#15-recommendations-for-solom)

---

## 1. React 19 Support

### Overview
Next.js 15 aligns with React 19, bringing significant improvements to the React ecosystem integration.

### Key Changes

#### useFormState → useActionState
```tsx
// Before (React 18)
import { useFormState } from 'react-dom';
const [state, formAction] = useFormState(action, initialState);

// After (React 19)
import { useActionState } from 'react';
const [state, formAction, isPending] = useActionState(action, initialState);
```

#### useFormStatus Enhancements
The `useFormStatus` hook now includes additional properties:
- `data`: FormData being submitted
- `method`: HTTP method (get/post)
- `action`: The form action URL

```tsx
'use client';
import { useFormStatus } from 'react-dom';

function SubmitButton() {
  const { pending, data, method, action } = useFormStatus();
  return (
    <button type="submit" disabled={pending}>
      {pending ? 'Submitting...' : 'Submit'}
    </button>
  );
}
```

#### React Compiler (Experimental)
Next.js 15 supports the React Compiler, which automatically optimizes memoization:

```ts
// next.config.ts
const nextConfig = {
  experimental: {
    reactCompiler: true,
  },
};
```

> **Note:** The React Compiler is currently only available as a Babel plugin, which may result in slower development and build times.

### Hydration Error Improvements
Hydration errors now display source code with suggestions:

```
Before (Next.js 14.1):
- Text content does not match server-rendered HTML

After (Next.js 15):
- Shows the exact code location
- Provides actionable suggestions
- Highlights the mismatched content
```

---

## 2. Turbopack Dev (Stable)

### Overview
Turbopack is now stable for development, offering significant performance improvements.

### Performance Benchmarks
Based on `vercel.com` (a large Next.js application):
- **76.7% faster** local server startup
- **96.3% faster** code updates with Fast Refresh
- **45.8% faster** initial route compile (without disk caching)

### Usage
```bash
# Enable Turbopack in development
next dev --turbo
```

### When to Use
- ✅ Development environment
- ✅ Large codebases with many files
- ✅ Projects needing faster HMR
- ❌ Production builds (still webpack-based)

---

## 3. Async Request APIs (Breaking)

### Overview
APIs that rely on request-specific data are now **asynchronous**. This enables the server to prepare as much as possible before a request arrives.

### Affected APIs

| API | Before | After |
|-----|--------|-------|
| `cookies()` | `cookies()` | `await cookies()` |
| `headers()` | `headers()` | `await headers()` |
| `draftMode()` | `draftMode()` | `await draftMode()` |
| `params` (layouts/pages/routes) | `params.slug` | `(await params).slug` |
| `searchParams` (pages) | `searchParams.query` | `(await searchParams).query` |

### Migration Examples

#### cookies()
```tsx
// Before
import { cookies } from 'next/headers';
const cookieStore = cookies();
const token = cookieStore.get('token');

// After
import { cookies } from 'next/headers';
const cookieStore = await cookies();
const token = cookieStore.get('token');
```

#### headers()
```tsx
// Before
import { headers } from 'next/headers';
const headersList = headers();
const userAgent = headersList.get('user-agent');

// After
import { headers } from 'next/headers';
const headersList = await headers();
const userAgent = headersList.get('user-agent');
```

#### params in Pages
```tsx
// Before
type Params = { slug: string };
type SearchParams = { [key: string]: string | string[] | undefined };

export default async function Page({ 
  params, 
  searchParams 
}: { 
  params: Params; 
  searchParams: SearchParams;
}) {
  const { slug } = params;
  const { query } = searchParams;
}

// After
type Params = Promise<{ slug: string }>;
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function Page(props: {
  params: Params;
  searchParams: SearchParams;
}) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const { slug } = params;
  const { query } = searchParams;
}
```

### Automatic Migration
```bash
npx @next/codemod@canary next-async-request-api .
```

---

## 4. Caching Semantics Changes

### Overview
Next.js 15 changes default caching behavior based on community feedback.

### GET Route Handlers
```tsx
// Before (Next.js 14): Cached by default
export async function GET() {
  return Response.json({ data: 'cached' });
}

// After (Next.js 15): NOT cached by default
export async function GET() {
  return Response.json({ data: 'not cached' });
}

// To opt into caching:
export const dynamic = 'force-static';
export async function GET() {
  return Response.json({ data: 'cached' });
}
```

### Client Router Cache
```tsx
// next.config.ts
const nextConfig = {
  experimental: {
    staleTimes: {
      dynamic: 30,  // 30 seconds for dynamic pages
      static: 180,   // 3 minutes for static pages
    },
  },
};
```

**Default behavior in Next.js 15:**
- Page segments: `staleTime: 0` (always fresh)
- Back/forward navigation: still cached (for scroll restoration)
- Shared layouts: not refetched
- `loading.js`: cached for 5 minutes

### fetch Requests
```tsx
// Before: Cached by default
const data = await fetch('https://api.example.com/data');

// After: NOT cached by default
const data = await fetch('https://api.example.com/data');

// Opt into caching:
const data = await fetch('https://api.example.com/data', { 
  cache: 'force-cache' 
});

// Or page-level:
export const fetchCache = 'default-cache';
```

---

## 5. Cache Components & Partial Prerendering

### Overview
Cache Components (enabled by `cacheComponents: true` in config) introduces Partial Prerendering as the default behavior, mixing static, cached, and dynamic content in a single route.

### Enabling Cache Components
```ts
// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  cacheComponents: true,
};

export default nextConfig;
```

### How It Works

1. **Static Content** - Prerendered automatically at build time
2. **Cached Dynamic Content** - Using `use cache` directive with `cacheLife`
3. **Runtime Dynamic Content** - Wrapped in `<Suspense>` for streaming

### Using `use cache` Directive
```tsx
import { cacheLife } from 'next/cache';

export default async function Page() {
  'use cache';
  cacheLife('hours'); // Cache for hours

  const users = await db.query('SELECT * FROM users');
  
  return (
    <ul>
      {users.map(user => <li key={user.id}>{user.name}</li>)}
    </ul>
  );
}
```

### Cache Life Profiles
```tsx
// Predefined profiles
cacheLife('hours');   // 1 hour stale, 2 hour revalidate, 1 day expire
cacheLife('days');    // 1 day stale, 7 days revalidate, 30 days expire
cacheLife('weeks');   // 1 week stale, 1 month revalidate, 1 year expire
cacheLife('max');     // Maximum caching

// Custom configuration
cacheLife({
  stale: 3600,      // 1 hour until stale
  revalidate: 7200,  // 2 hours until revalidated
  expire: 86400,    // 1 day until expired
});
```

### Combining Static, Cached, and Dynamic
```tsx
import { Suspense } from 'react';
import { cookies } from 'next/headers';
import { cacheLife } from 'next/cache';

export default function BlogPage() {
  return (
    <>
      {/* Static - prerendered automatically */}
      <header>
        <h1>Our Blog</h1>
      </header>

      {/* Cached with use cache */}
      <BlogPosts />

      {/* Runtime dynamic - streams at request time */}
      <Suspense fallback={<p>Loading preferences...</p>}>
        <UserPreferences />
      </Suspense>
    </>
  );
}

async function BlogPosts() {
  'use cache';
  cacheLife('hours');

  const res = await fetch('https://api.vercel.app/blog');
  const posts = await res.json();

  return (
    <section>
      {posts.slice(0, 5).map(post => (
        <article key={post.id}>
          <h3>{post.title}</h3>
        </article>
      ))}
    </section>
  );
}

async function UserPreferences() {
  const theme = (await cookies()).get('theme')?.value || 'light';
  return <aside>Your theme: {theme}</aside>;
}
```

### Cache Tagging and Revalidation
```tsx
import { cacheTag, updateTag, revalidateTag } from 'next/cache';

// Tag cached data
export async function getCart() {
  'use cache';
  cacheTag('cart');
  // fetch data
}

// Immediate update in Server Action
export async function updateCart(itemId: string) {
  'use server';
  // write data
  updateTag('cart'); // Immediate refresh
}

// Background revalidation
export async function createPost(post: FormData) {
  'use server';
  // write data
  revalidateTag('posts', 'max'); // Stale-while-revalidate
}
```

---

## 6. `<Form>` Component

### Overview
The new `<Form>` component extends HTML forms with client-side navigation and prefetching.

### Basic Usage
```tsx
import Form from 'next/form';

export default function SearchPage() {
  return (
    <Form action="/search">
      <input name="query" placeholder="Search..." />
      <button type="submit">Search</button>
    </Form>
  );
}
```

### Features
- **Prefetching**: Layout and loading UI prefetched when form is in view
- **Client-side Navigation**: Shared layouts and state preserved on submission
- **Progressive Enhancement**: Works without JavaScript via full-page navigation

---

## 7. `unstable_after` API (Experimental)

### Overview
Execute code after a response finishes streaming, useful for logging, analytics, and background tasks.

### Enabling
```ts
// next.config.ts
const nextConfig = {
  experimental: {
    after: true,
  },
};
```

### Usage
```tsx
import { unstable_after as after } from 'next/server';
import { log } from '@/app/utils';

export default function Layout({ children }) {
  // Secondary task (doesn't block response)
  after(() => {
    log();
  });

  // Primary task
  return <>{children}</>;
}
```

---

## 8. `instrumentation.js` (Stable)

### Overview
The `instrumentation` file with `register()` API is now stable, enabling server lifecycle observability.

### Usage
```tsx
// instrumentation.ts
export async function register() {
  // Initialize observability SDK
  // e.g., OpenTelemetry, Sentry, etc.
}

export async function onRequestError(err, request, context) {
  // Capture error context
  await fetch('https://logging.example.com/errors', {
    method: 'POST',
    body: JSON.stringify({ 
      message: err.message, 
      request, 
      context 
    }),
  });
}
```

---

## 9. Enhanced Security for Server Actions

### Improvements

1. **Dead Code Elimination**: Unused Server Actions won't have IDs exposed to client bundle
2. **Secure Action IDs**: Non-deterministic, unguessable IDs that change between builds

```tsx
// app/actions.ts
'use server';

// Used in app - secure ID created
export async function updateUserAction(formData: FormData) {}

// Not used - automatically removed during build
export async function deleteUserAction(formData: FormData) {}
```

> **Security Note:** Always treat Server Actions as public HTTP endpoints.

---

## 10. Self-Hosting Improvements

### Cache-Control Configuration
```ts
// next.config.ts
const nextConfig = {
  expireTime: 31536000, // 1 year (for ISR stale-while-revalidate)
};
```

### Automatic Sharp Installation
Next.js 15 automatically uses `sharp` for image optimization when using `next start` or standalone output mode. No manual installation required.

---

## 11. TypeScript Improvements

### `next.config.ts` Support
```ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
```

### Better Type Inference
- Improved `useReducer` types
- Ref cleanups required in TypeScript
- `useRef` requires an argument

---

## 12. ESLint 9 Support

### Overview
Next.js 15 supports ESLint 9 with backward compatibility for ESLint 8.

### Migration Notes
- Flat config is now the default in ESLint 9
- Next.js applies `ESLINT_USE_FLAT_CONFIG=false` escape hatch automatically if needed
- Deprecated options (`--ext`, `--ignore-path`) removed from `next lint`
- `eslint-plugin-react-hooks` upgraded to v5.0.0

---

## 13. Development & Build Performance

### Server Components HMR Cache
During development, Server component HMR now reuses `fetch` responses from previous renders, reducing API calls and costs.

### Faster Static Generation
- Single-pass rendering (previously required two passes)
- Shared `fetch` cache across pages in static generation workers

### Static Generation Controls (Experimental)
```ts
// next.config.ts
const nextConfig = {
  experimental: {
    staticGenerationRetryCount: 1,
    staticGenerationMaxConcurrency: 8,
    staticGenerationMinPagesPerWorker: 25,
  },
};
```

---

## 14. Migration Guide

### Upgrade Commands
```bash
# Using codemod CLI (recommended)
npx @next/codemod@canary upgrade latest

# Manual upgrade
npm install next@latest react@rc react-dom@rc
```

### Breaking Changes Checklist

- [ ] Update `cookies()`, `headers()`, `draftMode()` to async
- [ ] Update `params` and `searchParams` to async
- [ ] Review caching behavior for GET Route Handlers
- [ ] Update `fetch` calls with explicit cache options
- [ ] Remove `experimental-edge` runtime (use `edge` instead)
- [ ] Migrate from `@next/font` to `next/font`
- [ ] Replace `ReactDOM.render` with `createRoot`
- [ ] Replace `ReactDOM.hydrate` with `hydrateRoot`
- [ ] Remove `propTypes` and `defaultProps` (use TypeScript)
- [ ] Update string refs to callback refs
- [ ] Remove `experimental.serverComponentsExternalPackages` (use `serverExternalPackages`)
- [ ] Remove `experimental.bundlePagesExternals` (use `bundlePagesRouterDependencies`)

### Recommended Migration Order
1. Run codemods for automated fixes
2. Update async request APIs
3. Review and test caching behavior changes
4. Update deprecated configurations
5. Test thoroughly in development and staging

---

## 15. Recommendations for Solom

### Immediate Actions
1. **Upgrade to Next.js 15** - Use the codemod CLI for automated migration
2. **Enable Turbopack for development** - Significant DX improvement
3. **Review caching strategy** - Understand new defaults for financial data freshness

### Architecture Considerations

#### Financial Data Handling
```tsx
// For real-time stock prices - always fresh
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// For historical data - use cache with revalidation
export default async function HistoricalData() {
  'use cache';
  cacheLife('hours'); // Revalidate hourly
  
  const data = await fetchHistoricalPrices();
  return <Chart data={data} />;
}
```

#### Authentication & Cookies
```tsx
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Note: cookies() in middleware remains synchronous
  // But in Server Components, use await cookies()
}
```

#### Form Handling
```tsx
// Use new Form component for search and filter forms
import Form from 'next/form';

export default function StockSearch() {
  return (
    <Form action="/stocks/search">
      <input name="symbol" placeholder="Enter symbol..." />
      <button type="submit">Search</button>
    </Form>
  );
}
```

### Performance Optimizations
1. **Enable Cache Components** for pages with mixed static/dynamic content
2. **Use `unstable_after`** for analytics and logging without blocking responses
3. **Implement `instrumentation.js`** for observability

### Security Best Practices
1. Treat all Server Actions as public endpoints
2. Use `cookies()` for session validation in Server Actions
3. Implement proper input validation

---

## Static Route Indicator

Next.js 15 displays a visual indicator during development showing whether routes are static or dynamic:

```
○ /about (static)
● /dashboard (dynamic)
```

This helps optimize performance by understanding rendering strategies.

---

## Additional Resources

- [Next.js 15 Release Blog](https://nextjs.org/blog/next-15)
- [Next.js 15 Upgrade Guide](https://nextjs.org/docs/app/building-your-application/upgrading/version-15)
- [React 19 Upgrade Guide](https://react.dev/blog/2024/04/25/react-19-upgrade-guide)
- [Cache Components Documentation](https://nextjs.org/docs/app/getting-started/cache-components)
- [Turbopack Documentation](https://nextjs.org/docs/app/api-reference/turbopack)

---

## Changelog Summary

### Major Breaking Changes
- Async request APIs (`cookies`, `headers`, `params`, `searchParams`)
- Caching defaults changed (`fetch`, `GET` handlers, router cache)
- Removed `@next/font` (use `next/font`)
- Removed `experimental-edge` runtime
- Minimum Node.js 18.18.0

### Major Additions
- React 19 support
- Turbopack (stable for development)
- Cache Components with Partial Prerendering
- `<Form>` component
- `unstable_after` API
- `next.config.ts` TypeScript support
- Static Route Indicator

### Major Improvements
- Hydration error messages
- Server Components HMR cache
- Static generation performance
- Self-hosting controls
- Server Actions security

---

*Document generated from official Next.js and React documentation.*