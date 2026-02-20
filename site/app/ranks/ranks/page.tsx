/**
 * @ai-context Market Rankings — top 10 gainers and losers in leaderboard format.
 * Server Component with clickable items linking to ticker detail.
 */
import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertCircle, Medal, Trophy, TrendingUp, TrendingDown } from 'lucide-react';
import { GainLossBadge } from '@/components/finance/GainLossBadge';
import { getMarketGainers, getMarketLosers } from '@/app/actions/fmp';

export const metadata = { title: 'Rankings' };

interface MarketStock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changesPercentage: number;
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-yellow-500/15 text-yellow-500">
        <Trophy className="h-4 w-4" />
      </div>
    );
  }
  if (rank === 2) {
    return (
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-400/15 text-slate-400">
        <Medal className="h-4 w-4" />
      </div>
    );
  }
  if (rank === 3) {
    return (
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-700/15 text-amber-600">
        <Medal className="h-4 w-4" />
      </div>
    );
  }
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted">
      <span className="text-xs font-bold tabular-nums text-muted-foreground">#{rank}</span>
    </div>
  );
}

function LeaderboardList({
  title,
  description,
  icon: Icon,
  stocks,
}: {
  title: string;
  description: string;
  icon: React.ElementType;
  stocks: MarketStock[];
}) {
  return (
    <Card className="flex-1">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Icon className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-1 px-4 pb-4">
        {stocks.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No data available.</p>
        ) : (
          stocks.slice(0, 10).map((stock, idx) => (
            <Link
              key={stock.symbol}
              href={`/ticker/${stock.symbol}`}
              className="flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-muted/50 press-scale"
            >
              <RankBadge rank={idx + 1} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-mono font-semibold leading-tight">{stock.symbol}</p>
                <p className="truncate text-xs text-muted-foreground">{stock.name}</p>
              </div>
              <span className="shrink-0 tabular-nums text-sm font-medium">
                ${(stock.price ?? 0).toFixed(2)}
              </span>
              <div className="shrink-0">
                <GainLossBadge value={stock.changesPercentage ?? 0} isPercentage size="sm" />
              </div>
            </Link>
          ))
        )}
      </CardContent>
    </Card>
  );
}

export default async function RanksPage() {
  let gainers: MarketStock[] = [];
  let losers: MarketStock[] = [];
  let error: string | null = null;

  try {
    [gainers, losers] = await Promise.all([
      getMarketGainers(),
      getMarketLosers(),
    ]);
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load rankings.';
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Market Rankings</h1>
        <p className="text-muted-foreground">
          Today&apos;s top 10 gainers and losers by percentage change.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-destructive">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <LeaderboardList
          title="Top Gainers"
          description="Highest % increase today"
          icon={TrendingUp}
          stocks={gainers}
        />
        <LeaderboardList
          title="Top Losers"
          description="Highest % decrease today"
          icon={TrendingDown}
          stocks={losers}
        />
      </div>
    </div>
  );
}
