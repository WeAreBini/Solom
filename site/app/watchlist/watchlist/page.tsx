/**
 * @ai-context Watchlist page — async Server Component.
 * Reads authenticated user's watchlist from Supabase, batch-fetches live quotes from FMP.
 */
import React, { Suspense } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getQuotes } from '@/app/actions/fmp';
import { StockTickerCard } from '@/components/finance/StockTickerCard';
import { Skeleton } from '@/components/ui/skeleton';
import { WatchlistActions } from '@/components/watchlist/watchlist-actions';

export const metadata = { title: 'Watchlist' };

function WatchlistSkeleton() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      <Skeleton className="h-9 w-48" />
      <Skeleton className="h-5 w-72" />
      <Skeleton className="h-10 w-72" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

async function WatchlistContent() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="flex flex-col gap-6 p-4 md:p-8">
        <h1 className="text-3xl font-bold tracking-tight">Watchlist</h1>
        <p className="text-muted-foreground">
          Please{' '}
          <Link href="/login" className="underline underline-offset-4 hover:text-foreground">
            sign in
          </Link>{' '}
          to view your watchlist.
        </p>
      </div>
    );
  }

  const { data: watchlistRows, error } = await supabase
    .from('watchlist_items')
    .select('symbol')
    .eq('user_id', user.id);

  if (error) console.error('[WatchlistPage] Supabase error:', error.message);

  const symbols: string[] = (watchlistRows ?? []).map(
    (row: { symbol: string }) => row.symbol
  );

  if (symbols.length === 0) {
    return (
      <div className="flex flex-col gap-6 p-4 md:p-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Watchlist</h1>
          <p className="text-muted-foreground">Keep track of your favorite stocks and assets.</p>
        </div>
        <WatchlistActions />
        <div className="flex flex-col items-center justify-center min-h-[30vh] gap-4 rounded-xl border border-dashed">
          <div className="rounded-full bg-primary/10 p-4">
            <svg className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
            </svg>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold">Your watchlist is empty</p>
            <p className="text-muted-foreground text-sm mt-1">
              Search for stocks above to add them to your watchlist.
            </p>
          </div>
        </div>
      </div>
    );
  }

  let quotes: Array<Record<string, any>> = [];
  try {
    quotes = await getQuotes(symbols);
  } catch (err) {
    console.error('[WatchlistPage] FMP quotes error:', err);
  }

  const quoteMap = new Map<string, Record<string, any>>();
  for (const q of quotes) {
    if (q.symbol) quoteMap.set(q.symbol as string, q);
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Watchlist</h1>
        <p className="text-muted-foreground">Keep track of your favorite stocks and assets.</p>
      </div>
      <WatchlistActions />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {symbols.map((sym) => {
          const q = quoteMap.get(sym);
          return (
            <div key={sym} className="relative group">
              <Link href={`/ticker/${sym}`}>
                <StockTickerCard
                  symbol={sym}
                  name={(q?.name as string) ?? sym}
                  price={(q?.price as number) ?? 0}
                  change={(q?.change as number) ?? 0}
                  changePercent={(q?.changesPercentage as number) ?? undefined}
                />
              </Link>
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <WatchlistActions symbol={sym} mode="remove" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function WatchlistPage() {
  return (
    <Suspense fallback={<WatchlistSkeleton />}>
      <WatchlistContent />
    </Suspense>
  );
}
