import React, { Suspense } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { GainLossBadge } from '@/components/finance/GainLossBadge';
import { StockTickerCard } from '@/components/finance/StockTickerCard';
import { NewsCard } from '@/components/finance/NewsCard';
import { MarketIndicesStrip } from '@/components/finance/MarketIndicesStrip';
import { Sparkline } from '@/components/finance/Sparkline';
import { StockChart } from '@/components/finance/StockChart';
import { AssetAllocationChart } from '@/components/finance/AssetAllocationChart';
import { PortfolioSummary } from '@/components/dashboard/PortfolioSummary';
import { WatchlistWidget } from '@/components/watchlist/WatchlistWidget';
import { AIInsightsWidget } from '@/components/dashboard/AIInsightsWidget';
import { getMarketActives, getQuotes, getMarketNews, getHistoricalPrices } from '@/app/actions/fmp';
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
  const sparklineDataMap: Record<string, number[]> = {};

  let portfolioHistory: Array<{ date: string; value: number }> = [];

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

      // Fetch historical data for sparklines
      const historicalDataPromises = symbols.map(symbol => getHistoricalPrices(symbol).catch(() => []));
      const historicalDataResults = await Promise.all(historicalDataPromises);
      
      symbols.forEach((symbol, index) => {
        const data = historicalDataResults[index];
        // Get last 30 days of close prices, reversed so oldest is first
        sparklineDataMap[symbol] = data.slice(0, 30).map((d: { close: number }) => d.close).reverse();
      });

      // Build portfolio history
      const maxDays = Math.min(30, Math.max(...historicalDataResults.map(d => d.length)));
      for (let i = 0; i < maxDays; i++) {
        let dailyValue = 0;
        let date = '';
        
        portfolioItems.forEach(item => {
          const symbolIndex = symbols.indexOf(item.symbol);
          const data = historicalDataResults[symbolIndex];
          if (data && data[i]) {
            dailyValue += data[i].close * item.amount_of_shares;
            if (!date) date = data[i].date;
          } else {
            dailyValue += item.price_purchased * item.amount_of_shares;
          }
        });
        
        if (date) {
          portfolioHistory.push({ date, value: dailyValue });
        }
      }
      portfolioHistory.reverse(); // Oldest first

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

  // If we have portfolio items, group by symbol for a simple allocation.
  // In a real app, you'd group by sector or asset class.
  const allocationData = portfolioItems.length > 0 
    ? portfolioItems.map(item => {
        const quote = quotesMap[item.symbol];
        const livePrice = quote?.price ?? item.price_purchased;
        return {
          name: item.symbol,
          value: livePrice * item.amount_of_shares
        };
      }).sort((a, b) => b.value - a.value).slice(0, 5) // Top 5
    : [
        { name: 'Cash', value: 10000 },
        { name: 'Equities', value: 0 }
      ];

  const watchlistItems = marketSummary.map(stock => ({
    symbol: stock.symbol,
    name: stock.name,
    price: stock.price,
    changePct: stock.change,
    sparklineData: sparklineDataMap[stock.symbol] || [],
  }));

  return (
    <div className="flex flex-col gap-6">
      {/* Market Indices Strip */}
      <Suspense fallback={<Skeleton className="h-10 w-full" />}>
        <MarketIndicesStrip />
      </Suspense>

      <div className="flex flex-col gap-6 p-4 md:p-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Command Center</h1>
          <p className="text-muted-foreground">Welcome back! Here&apos;s an overview of your portfolio.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-12">
          {/* Main Left Column: Portfolio Metrics & Holdings */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {/* Portfolio Metrics */}
            <div className="grid gap-4 md:grid-cols-3">
              <div className="md:col-span-3">
                <PortfolioSummary
                  totalBalance={currentValue}
                  dailyPnL={totalReturn}
                  dailyPnLPct={returnPct}
                  chartData={portfolioHistory}
                />
              </div>
            </div>

            {/* Holdings */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold tracking-tight flex items-center gap-2">
                  Holdings
                  {!isEmpty && (
                    <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                      {portfolioItems.length}
                    </span>
                  )}
                </h2>
                {!isEmpty && (
                  <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
                    <Link href="/watchlist">View Watchlist <ArrowRight className="ml-1 h-3 w-3" /></Link>
                  </Button>
                )}
              </div>

              {isEmpty ? (
                <Card className="glass-card">
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
                <Card className="glass-card">
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
                          <th className="px-4 py-3 text-right font-medium">30D Trend</th>
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
                              <td className="px-4 py-3 text-right">
                                {sparklineDataMap[item.symbol] && sparklineDataMap[item.symbol].length > 0 ? (
                                  <div className="flex justify-end">
                                    <Sparkline data={sparklineDataMap[item.symbol]} width={80} height={30} />
                                  </div>
                                ) : (
                                  <span className="text-muted-foreground text-xs">N/A</span>
                                )}
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

            {/* Asset Allocation */}
            <div className="flex flex-col gap-4">
              <h2 className="text-xl font-semibold tracking-tight">Asset Allocation</h2>
              <AssetAllocationChart data={allocationData} />
            </div>
          </div>

          {/* Right Column: Market Summary & News */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            {/* AI Insights Widget */}
            <AIInsightsWidget />

            {/* Watchlist Widget */}
            <div className="h-[400px]">
              <WatchlistWidget items={watchlistItems} />
            </div>

            {/* Market Summary */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold tracking-tight">Market Summary</h2>
                <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
                  <Link href="/market">View All <ArrowRight className="ml-1 h-3 w-3" /></Link>
                </Button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                {marketSummary.map((stock) => (
                  <Link key={stock.symbol} href={`/ticker/${stock.symbol}`}>
                    <StockTickerCard
                      symbol={stock.symbol}
                      name={stock.name}
                      price={stock.price}
                      change={stock.change}
                      className="glass-card"
                    />
                  </Link>
                ))}
              </div>
            </div>

            {/* News */}
            <div className="flex flex-col gap-4">
              <h2 className="text-xl font-semibold tracking-tight">Latest News</h2>
              <Card className="glass-card">
                <CardContent className="p-0 divide-y max-h-[600px] overflow-y-auto">
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
    </div>
  );
}
