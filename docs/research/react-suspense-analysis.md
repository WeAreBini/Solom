# React Suspense Analysis for Solom Dashboard

**Issue:** #12  
**Date:** 2026-03-01  
**Author:** Solom Developer Agent  
**Status:** Research Complete

---

## Executive Summary

After analyzing the Solom codebase and researching React Suspense best practices, I recommend **adopting React Suspense** for the dashboard loading states. This will simplify the codebase, improve user experience, and align with modern React patterns in Next.js 14+.

**Key Recommendations:**
1. ✅ **Adopt React Suspense** for component-level loading states
2. ✅ **Use Server Components** with `async/await` where possible
3. ✅ **Replace manual `isLoading` states** with Suspense boundaries
4. ✅ **Maintain TanStack Query** with Suspense-enabled hooks
5. ⚠️ **Keep real-time WebSocket updates** separate from Suspense

---

## Current State Analysis

### Existing Loading Patterns

The Solom dashboard currently uses **manual loading state management**:

#### 1. TanStack Query `isLoading` Pattern
```typescript
// app/dashboard/finance/page.tsx
const { data: indices, isLoading, error, refetch } = useMarketIndices();

// Conditional rendering based on isLoading
<KPIGrid cards={isLoading ? [
  { label: "Loading...", value: "-", isLoading: true },
  { label: "Loading...", value: "-", isLoading: true },
] : kpiData} />
```

#### 2. Skeleton Components
```typescript
// components/dashboard/kpi-card.tsx
export function KPICardSkeleton({ size = "md" }: { size?: SizeVariant }) {
  return (
    <Card className="animate-pulse">
      <CardHeader className="...">
        <div className="h-4 w-24 rounded bg-muted" />
      </CardHeader>
      <CardContent className="...">
        <div className="h-8 w-32 rounded bg-muted" />
      </CardContent>
    </Card>
  );
}
```

#### 3. Real-time Data Hooks
```typescript
// lib/hooks/useRealTimePrice.ts
export interface UseRealTimePriceResult {
  price: RealTimePrice | null;
  isLoading: boolean;
  error: Error | null;
  direction: PriceDirection;
  isWebSocket: boolean;
}
```

### Pain Points

| Issue | Description |
|-------|-------------|
| **Verbose** | Every component needs `isLoading` prop handling |
| **Inconsistent** | Different components handle loading differently |
| **Nested Loading** | Multiple loading states create "spinner hell" |
| **No Streaming** | All data must load before any UI renders |
| **Error Handling** | Separate error states from loading states |

---

## React Suspense Research Findings

### What is React Suspense?

React Suspense is a **rendering coordination mechanism** that lets you declaratively specify loading states for asynchronous operations. Think of it as a "try/catch for async UI."

### Key Benefits

1. **Centralized Loading State Management**
   - Single place to define fallback UI
   - Consistent loading experience across the app

2. **Code Splitting**
   - Lazy load components with `React.lazy()`
   - Reduces initial bundle size

3. **Progressive Rendering**
   - Stream content as it becomes available
   - Better perceived performance

4. **Simplified Component Code**
   - No manual `isLoading` state
   - Components assume data is available

5. **Server Components Integration**
   - Works seamlessly with Next.js App Router
   - Built-in streaming support

### Best Practices from Research

#### 1. Strategic Suspense Boundaries

> "Don't put a Suspense boundary around every component. Suspense boundaries should not be more granular than the loading sequence that you want the user to experience."
> — [React Documentation](https://react.dev/reference/react/Suspense)

```tsx
// ❌ Too granular
<Suspense fallback={<Skeleton />}>
  <Suspense fallback={<Skeleton />}>
    <ComponentA />
  </Suspense>
  <Suspense fallback={<Skeleton />}>
    <ComponentB />
  </Suspense>
</Suspense>

// ✅ Appropriate granularity
<Suspense fallback={<DashboardSkeleton />}>
  <KPIGrid />
  <Charts />
  <Tables />
</Suspense>
```

#### 2. Skeleton UIs as Fallbacks

Use meaningful skeleton components instead of generic spinners:

```tsx
<Suspense fallback={<KPICardSkeleton />}>
  <KPICard data={data} />
</Suspense>
```

#### 3. Error Boundaries Pairing

Always pair Suspense with Error Boundaries:

```tsx
<ErrorBoundary fallback={<ErrorCard />}>
  <Suspense fallback={<Skeleton />}>
    <AsyncComponent />
  </Suspense>
</ErrorBoundary>
```

#### 4. Streaming with Server Components

In Next.js 14+, Server Components can use `async/await` directly:

```tsx
// app/dashboard/page.tsx (Server Component)
async function Dashboard() {
  const indices = await fetchMarketIndices();
  return <KPIGrid data={indices} />;
}

// app/dashboard/loading.tsx
export default function Loading() {
  return <DashboardSkeleton />;
}
```

---

## Recommendations for Solom

### Phase 1: Server Components with Suspense (High Priority)

Convert data-fetching page components to Server Components:

**Before (Client Component):**
```tsx
// app/dashboard/finance/page.tsx
"use client";

export default function FinanceDashboardPage() {
  const { data: indices, isLoading, error } = useMarketIndices();
  
  if (isLoading) return <Skeleton />;
  if (error) return <Error />;
  
  return <KPIGrid cards={indices} />;
}
```

**After (Server Component with Suspense):**
```tsx
// app/dashboard/finance/page.tsx
import { Suspense } from 'react';

export default function FinanceDashboardPage() {
  return (
    <Suspense fallback={<FinanceDashboardSkeleton />}>
      <MarketIndicesSection />
      <PortfolioSection />
    </Suspense>
  );
}

// Server Component
async function MarketIndicesSection() {
  const indices = await fetchMarketIndices(); // Direct async
  return <KPIGrid cards={indices} />;
}

// app/dashboard/finance/loading.tsx
export default function Loading() {
  return <FinanceDashboardSkeleton />;
}
```

### Phase 2: TanStack Query with Suspense (Medium Priority)

Use TanStack Query's built-in Suspense support:

**Before:**
```tsx
const { data, isLoading, error } = useQuery({ queryKey: ['stocks'] });
if (isLoading) return <Skeleton />;
```

**After:**
```tsx
// Using useSuspenseQuery
import { useSuspenseQuery } from '@tanstack/react-query';

function StockList() {
  const { data } = useSuspenseQuery({ 
    queryKey: ['stocks'],
    queryFn: fetchStocks 
  });
  // data is guaranteed to be available
  return <ul>{data.map(...)}</ul>;
}

// In parent
<Suspense fallback={<StockListSkeleton />}>
  <StockList />
</Suspense>
```

### Phase 3: Real-time Data Handling (Consider Carefully)

**Important:** Real-time WebSocket updates should remain outside Suspense:

```tsx
// Real-time component - keep as Client Component with hooks
"use client";
function RealtimePriceCard({ symbol }: { symbol: string }) {
  const { price, isLoading } = useRealTimePrice(symbol);
  
  // For initial load, can use Suspense
  // For live updates, keep manual state
  if (isLoading) return <PriceCardSkeleton />;
  
  return <PriceCard price={price} />;
}
```

### What NOT to Do

1. **Don't wrap everything in Suspense** - Be strategic about boundaries
2. **Don't replace real-time updates with Suspense** - Keep WebSocket logic separate
3. **Don't mix patterns inconsistently** - Choose Server Components OR Client Suspense, not both for same data
4. **Don't forget Error Boundaries** - Suspense needs error handling

---

## Implementation Strategy

### Step 1: Add loading.tsx Files

Create loading.tsx files for each route segment:

```
app/
├── dashboard/
│   ├── loading.tsx         # Dashboard skeleton
│   ├── finance/
│   │   ├── page.tsx
│   │   └── loading.tsx     # Finance skeleton
│   └── stocks/
│       ├── page.tsx
│       └── loading.tsx     # Stocks skeleton
```

### Step 2: Create Suspense Wrapper Components

```tsx
// components/dashboard/suspense-boundary.tsx
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

interface SuspenseBoundaryProps {
  children: React.ReactNode;
  fallback: React.ReactNode;
  errorFallback?: React.ReactNode;
}

export function SuspenseBoundary({ 
  children, 
  fallback,
  errorFallback = <ErrorCard />
}: SuspenseBoundaryProps) {
  return (
    <ErrorBoundary fallback={errorFallback}>
      <Suspense fallback={fallback}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
}
```

### Step 3: Convert Queries to Suspense

Update Tanstack Query usage:

```tsx
// Before
const { data, isLoading } = useQuery({ ... });
if (isLoading) return <Skeleton />;
return <Component data={data} />;

// After
const { data } = useSuspenseQuery({ ... });
return <Component data={data} />;
```

### Step 4: Progressive Migration

Priority order for migration:

| Component | Priority | Effort | Impact |
|-----------|----------|--------|--------|
| KPI Cards | High | Low | High |
| Market Indices | High | Low | High |
| Charts | Medium | Medium | Medium |
| Watchlist | Medium | Low | Medium |
| Real-time prices | Low | High | Low* |

*Real-time prices should keep manual loading states for WebSocket updates

---

## Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| Breaking existing functionality | Migrate incrementally, test thoroughly |
| Learning curve for team | Document patterns, add examples |
| Real-time data complexity | Keep WebSocket logic in Client Components |
| Skeleton mismatches | Create reusable skeleton components |

---

## Conclusion

**Recommendation: ADOPT React Suspense**

React Suspense is a natural fit for the Solom dashboard:

1. **Already using Next.js 14** - Built-in support
2. **TanStack Query supports Suspense** - Easy migration path
3. **Current skeleton components are well-designed** - Can be reused as fallbacks
4. **Improves code maintainability** - Less boilerplate, cleaner components

**Next Steps:**
1. Create `loading.tsx` files for each dashboard route
2. Add `ErrorBoundary` component for error handling
3. Migrate `useMarketIndices` hook to use `useSuspenseQuery`
4. Update KPI Grid to work with Suspense
5. Document the new patterns in MEMORY/patterns.md

---

## References

- [React Suspense Documentation](https://react.dev/reference/react/Suspense)
- [TanStack Query Suspense](https://tanstack.com/query/latest/docs/react/guides/suspense)
- [Next.js Loading UI](https://nextjs.org/docs/app/building-your-application/routing/loading-ui-and-streaming)
- [Mastering React Suspense: Loading States Done Right](https://dev.to/cristiansifuentes/mastering-react-suspense-loading-states-done-right-4083)
- [Understanding the Power of React Suspense](https://medium.com/@bloodturtle/understanding-the-power-of-react-suspense-beyond-just-loading-states-b2adaea6fe9f)