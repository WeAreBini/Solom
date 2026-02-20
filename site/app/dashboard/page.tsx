import React, { Suspense } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { GainLossBadge } from '@/components/finance/GainLossBadge';
import { StockTickerCard } from '@/components/finance/StockTickerCard';
import { NewsCard } from '@/components/finance/NewsCard';
import { MarketIndicesStrip } from '@/components/finance/MarketIndicesStrip';
import { getMarketActives, getQuotes, getMarketNews } from '@/app/actions/fmp';
import { createClient } from '@/lib/supabase/server';
import { TrendingUp, Search, ArrowRight } from 'lucide-react';

/**
 * @ai-context Dashboard page — portfolio overview, market summary, and real news.
 * Server Component with live Supabase + FMP data.
 * @ai-related app/watchlist/page.tsx, app/actions/fmp.ts, utils/supabase/server.ts
 * @ai-warning Portfolio data requires an authenticated user. Falls back to zeros on any error.
 */

export const metadata = { title: 'Dashboard' };

export default async function DashboardPage() {
  // ─── Portfolio data ──────────────────────────────────────────────────
  let portfolioItems: Array<{
    symbol: string;
    price_purchased: number;
    amount_of_shares: number;
  }> = [];
  let totalInvested = 0;
  let currentValue = 0;
  let totalReturn = 0;
  let returnPct = 0;
  let quotesMap: Record<string, { price: number; name: string; changesPercentage: number }> = {};

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { data: rows } = await supabase
      .from('portfolio')
      .select('*')
      .eq('user_id', user?.id ?? '');

    portfolioItems = (rows ?? []) as typeof portfolioItems;

    if (portfolioItems.length > 0) {
      totalInvested = portfolioItems.reduce(
        (sum, p) => sum + p.price_purchased * p.amount_of_shares, 0
      );

      const symbols = [...new Set(portfolioItems.map((p) => p.symbol))];
      const quotes = await getQuotes(symbols);

      quotesMap = Object.fromEntries(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        quotes.map((q: any) => [
          q.symbol,
          { price: q.price ?? 0, name: q.name ?? q.symbol, changesPercentage: q.changesPercentage ?? 0 },
        ])
      );

      currentValue = portfolioItems.reduce((sum, p) => {
        const q = quotesMap[p.symbol];
        return sum + ((q?.price ?? p.price_purchased) * p.amount_of_shares);
      }, 0);

      totalReturn = currentValue - totalInvested;
      returnPct = totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0;
    }
  } catch (error) {
    console.error('Failed to load portfolio data:', error);
  }

  // ─── Market summary ────────────────────────────────────────────────
  let marketSummary: Array<{ symbol: string; name: string; price: number; change: number }> = [];
  try {
    const actives = await getMarketActives();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    marketSummary = actives.slice(0, 6).map((stock: any) => ({
      symbol: stock.symbol,
      name: stock.name,
      price: stock.price,
      change: stock.change,
    }));
  } catch {
    // Graceful fallback
  }

  // ─── Real news ────────────────────────────────────────────────────
  let news: Array<{ title: string; site: string; publishedDate: string; url: string; image: string; symbol: string }> = [];
  try {
    news = await getMarketNews(8);
  } catch {
    // Graceful fallback
  }

  const fmt = (n: number) =>
    n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const isEmpty = portfolioItems.length === 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Market Indices Strip */}
      <Suspense fallback={<Skeleton className="h-10 w-full" />}>
        <MarketIndicesStrip />
      </Suspense>

      <div className="flex flex-col gap-6 p-4 md:p-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here&apos;s an overview of your portfolio.</p>
        </div>

        {/* Portfolio Metrics */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Value</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tabular-nums">${fmt(currentValue)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Cost basis: ${fmt(totalInvested)}
              </p>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Return</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-2">
              <div className="text-2xl font-bold tabular-nums">
                {totalReturn < 0 ? '-' : ''}${fmt(Math.abs(totalReturn))}
              </div>
              <GainLossBadge value={returnPct} isPercentage />
            </CardContent>
          </Card>
          <Card className="hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Holdings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{portfolioItems.length}</div>
              <p className="text-xs text-muted-foreground mt-1">positions tracked</p>
            </CardContent>
          </Card>
        </div>

        {/* Holdings */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold tracking-tight">Holdings</h2>
            {!isEmpty && (
              <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
                <Link href="/watchlist">View Watchlist <ArrowRight className="ml-1 h-3 w-3" /></Link>
              </Button>
            )}
          </div>

          {isEmpty ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 text-center gap-4">
                <div className="rounded-full bg-primary/10 p-4">
                  <Search className="h-8 w-8 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">No holdings yet</h3>
                  <p className="text-muted-foreground max-w-sm text-sm">
                    Search for stocks to start tracking your investments and building your portfolio.
                  </p>
                </div>
                <Button asChild className="press-scale">
                  <Link href="/market">Browse Market</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/40 text-muted-foreground">
                      <th className="px-4 py-3 text-left font-medium">Symbol</th>
                      <th className="px-4 py-3 text-left font-medium">Company</th>
                      <th className="px-4 py-3 text-right font-medium">Shares</th>
                      <th className="px-4 py-3 text-right font-medium">Avg Cost</th>
                      <th className="px-4 py-3 text-right font-medium">Current</th>
                      <th className="px-4 py-3 text-right font-medium">Value</th>
                      <th className="px-4 py-3 text-right font-medium">Return</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {portfolioItems.map((item) => {
                      const quote = quotesMap[item.symbol];
                      const livePrice = quote?.price ?? item.price_purchased;
                      const positionValue = livePrice * item.amount_of_shares;
                      const positionCost = item.price_purchased * item.amount_of_shares;
                      const positionReturnPct =
                        positionCost > 0
                          ? ((positionValue - positionCost) / positionCost) * 100
                          : 0;

                      return (
                        <tr key={item.symbol} className="hover:bg-muted/30 transition-colors cursor-pointer">
                          <td className="px-4 py-3">
                            <Link href={`/ticker/${item.symbol}`} className="font-mono font-semibold text-primary hover:underline">
                              {item.symbol}
                            </Link>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {quote?.name ?? item.symbol}
                          </td>
                          <td className="px-4 py-3 text-right tabular-nums">
                            {item.amount_of_shares.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-right tabular-nums">${fmt(item.price_purchased)}</td>
                          <td className="px-4 py-3 text-right tabular-nums">${fmt(livePrice)}</td>
                          <td className="px-4 py-3 text-right tabular-nums font-medium">${fmt(positionValue)}</td>
                          <td className="px-4 py-3 text-right">
                            <GainLossBadge value={positionReturnPct} isPercentage size="sm" />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Market Summary + News — side by side on desktop */}
        <div className="grid gap-6 lg:grid-cols-5">
          {/* Market Summary */}
          <div className="lg:col-span-3 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold tracking-tight">Market Summary</h2>
              <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
                <Link href="/market">View All <ArrowRight className="ml-1 h-3 w-3" /></Link>
              </Button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {marketSummary.map((stock) => (
                <Link key={stock.symbol} href={`/ticker/${stock.symbol}`}>
                  <StockTickerCard
                    symbol={stock.symbol}
                    name={stock.name}
                    price={stock.price}
                    change={stock.change}
                  />
                </Link>
              ))}
            </div>
          </div>

          {/* News */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <h2 className="text-xl font-semibold tracking-tight">Latest News</h2>
            <Card>
              <CardContent className="p-0 divide-y">
                {news.length === 0 ? (
                  <div className="p-6 text-center text-sm text-muted-foreground">
                    No news available at the moment.
                  </div>
                ) : (
                  news.slice(0, 6).map((article, i) => (
                    <NewsCard
                      key={i}
                      title={article.title}
                      source={article.site}
                      publishedDate={article.publishedDate}
                      url={article.url}
                      image={article.image}
                      symbol={article.symbol}
                    />
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
