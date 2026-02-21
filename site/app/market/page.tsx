/**
 * @ai-context Market Overview — gainers, losers, most active with clickable rows.
 * Server Component with Suspense streaming.
 */
import React, { Suspense } from "react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, TrendingUp, TrendingDown, Activity } from "lucide-react";
import { getMarketGainers, getMarketLosers, getMarketActives } from "@/app/actions/fmp";
import { StockTickerCard } from "@/components/finance/StockTickerCard";

export const metadata = { title: "Market" };

interface MarketStock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changesPercentage: number;
  volume: number;
}

function MarketListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 10 }).map((_, i) => (
        <Skeleton key={i} className="h-24 w-full rounded-xl" />
      ))}
    </div>
  );
}

function MarketGridSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <MarketListSkeleton />
      <MarketListSkeleton />
      <MarketListSkeleton />
    </div>
  );
}

function MarketList({ stocks }: { stocks: MarketStock[] }) {
  if (stocks.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No data available.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {stocks.slice(0, 15).map((stock) => (
        <Link key={stock.symbol} href={`/ticker/${stock.symbol}`} className="block outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl">
          <StockTickerCard
            symbol={stock.symbol}
            name={stock.name}
            price={stock.price ?? 0}
            change={stock.change ?? 0}
            changePercent={stock.changesPercentage ?? 0}
            className="glass-card"
          />
        </Link>
      ))}
    </div>
  );
}

async function MarketContent() {
  let gainers: MarketStock[] = [];
  let losers: MarketStock[] = [];
  let actives: MarketStock[] = [];
  let error: string | null = null;

  try {
    [gainers, losers, actives] = await Promise.all([
      getMarketGainers(),
      getMarketLosers(),
      getMarketActives(),
    ]);
  } catch (err) {
    error = err instanceof Error ? err.message : "Failed to load market data.";
  }

  if (error) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-destructive">
        <AlertCircle className="h-5 w-5 shrink-0" />
        <p className="text-sm font-medium">{error}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Gainers */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <TrendingUp className="h-5 w-5 text-positive" />
          <h2 className="text-xl font-semibold tracking-tight">Top Gainers</h2>
        </div>
        <MarketList stocks={gainers} />
      </div>

      {/* Losers */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <TrendingDown className="h-5 w-5 text-negative" />
          <h2 className="text-xl font-semibold tracking-tight">Top Losers</h2>
        </div>
        <MarketList stocks={losers} />
      </div>

      {/* Actives */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <Activity className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold tracking-tight">Most Active</h2>
        </div>
        <MarketList stocks={actives} />
      </div>
    </div>
  );
}

export default function MarketPage() {
  return (
    <div className="flex flex-col gap-8 p-4 md:p-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Market Overview</h1>
        <p className="text-muted-foreground">
          Real-time market movers — gainers, losers, and most active stocks.
        </p>
      </div>
      <Suspense fallback={<MarketGridSkeleton />}>
        <MarketContent />
      </Suspense>
    </div>
  );
}
