/**
 * @ai-context Watchlist page — async Server Component.
 * Reads authenticated user's watchlist from Supabase, batch-fetches live quotes from FMP.
 */
import React, { Suspense } from 'react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

import { createClient } from '@/lib/supabase/server';
import { getQuotes, getHistoricalPrices } from '@/app/actions/fmp';
import { Skeleton } from '@/components/ui/skeleton';
import { WatchlistActions } from '@/components/watchlist/watchlist-actions';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Sparkline } from '@/components/finance/Sparkline';
import { GainLossBadge } from '@/components/finance/GainLossBadge';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';

export const metadata = { title: 'Watchlist' };

function WatchlistSkeleton() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      <Skeleton className="h-9 w-48" />
      <Skeleton className="h-5 w-72" />
      <Skeleton className="h-10 w-72" />
      <div className="glass-card rounded-xl border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Symbol</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Change</TableHead>
              <TableHead className="w-[120px]">7D Trend</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                <TableCell><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
                <TableCell><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
                <TableCell><Skeleton className="h-8 w-24" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// Helper to generate mock 7D trend data removed

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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let quotes: Array<Record<string, any>> = [];
  const sparklineDataMap: Record<string, number[]> = {};
  try {
    quotes = await getQuotes(symbols);
    
    // Fetch historical data for sparklines
    const historicalDataPromises = symbols.map(symbol => getHistoricalPrices(symbol).catch(() => []));
    const historicalDataResults = await Promise.all(historicalDataPromises);
    
    symbols.forEach((symbol, index) => {
      const data = historicalDataResults[index];
      // Get last 7 days of close prices, reversed so oldest is first
      sparklineDataMap[symbol] = data.slice(0, 7).map((d: { close: number }) => d.close).reverse();
    });
  } catch (err) {
    console.error('[WatchlistPage] FMP quotes error:', err);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      
      <div className="glass-card rounded-xl border overflow-hidden">
        <Table className="tabular-nums">
          <TableHeader>
            <TableRow>
              <TableHead>Symbol</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Change</TableHead>
              <TableHead className="w-[120px]">7D Trend</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {symbols.map((sym) => {
              const q = quoteMap.get(sym);
              const name = (q?.name as string) ?? sym;
              const price = (q?.price as number) ?? 0;
              const changePercent = (q?.changesPercentage as number) ?? 0;
              const trendData = sparklineDataMap[sym] || [];

              return (
                <TableRow key={sym} className="group">
                  <TableCell>
                    <Link href={`/ticker/${sym}`} className="flex flex-col hover:underline">
                      <span className="font-bold text-foreground">{sym}</span>
                      <span className="text-xs text-muted-foreground truncate max-w-[150px]">{name}</span>
                    </Link>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    ${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end">
                      <GainLossBadge value={changePercent} isPercentage size="sm" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="h-8 w-24">
                      <Sparkline data={trendData} width="100%" height="100%" />
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" title="Set Alert">
                        <Bell className="h-4 w-4" />
                      </Button>
                      <WatchlistActions symbol={sym} mode="remove" />
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
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
