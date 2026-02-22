import React, { Suspense } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GainLossBadge } from "@/components/finance/GainLossBadge";
import { MarketIndicesStrip } from "@/components/finance/MarketIndicesStrip";
import { StockChart } from "@/components/finance/StockChart";
import { getMarketActives, getMarketGainers, getMarketLosers, getHistoricalPrices, getQuote } from "@/app/actions/fmp";
import { ArrowRight, Activity, TrendingUp, TrendingDown, BarChart3 } from "lucide-react";

/**
 * @ai-context Main landing page redesigned as a dense financial terminal.
 * @ai-related app/actions/fmp.ts, components/finance/StockChart.tsx
 */

export const metadata = { title: "Solom Finance | Professional Terminal" };

export default async function Home() {
  // Fetch data in parallel
  const [actives, gainers, losers, spyHistory, spyQuote] = await Promise.all([
    getMarketActives().catch(() => []),
    getMarketGainers().catch(() => []),
    getMarketLosers().catch(() => []),
    getHistoricalPrices("SPY").catch(() => []),
    getQuote("SPY").catch(() => null),
  ]);

  const topActives = actives.slice(0, 5);
  const topGainers = gainers.slice(0, 5);
  const topLosers = losers.slice(0, 5);

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* Top Market Strip */}
      <Suspense fallback={<div className="h-10 border-b bg-surface/50" />}>
        <MarketIndicesStrip />
      </Suspense>

      <main className="flex-1 p-4 md:p-6 max-w-[1600px] mx-auto w-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Market Overview</h1>
            <p className="text-sm text-muted-foreground">Real-time market data and analytics</p>
          </div>
          <div className="flex gap-3">
            <Button asChild variant="outline" size="sm">
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/signup">Create Account</Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar - Gainers & Losers */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            <Card className="bg-card border-border shadow-sm">
              <CardHeader className="pb-2 pt-4 px-4 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-success" />
                  Top Gainers
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {topGainers.map((stock: { symbol: string; name: string; price: number; changesPercentage: number }) => (
                    <div key={stock.symbol} className="flex items-center justify-between p-3 hover:bg-muted/50 transition-colors">
                      <div>
                        <div className="font-mono text-sm font-bold">{stock.symbol}</div>
                        <div className="text-xs text-muted-foreground truncate max-w-[100px]">{stock.name}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">${stock.price?.toFixed(2)}</div>
                        <GainLossBadge value={stock.changesPercentage} isPercentage size="sm" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border shadow-sm">
              <CardHeader className="pb-2 pt-4 px-4 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-danger" />
                  Top Losers
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {topLosers.map((stock: { symbol: string; name: string; price: number; changesPercentage: number }) => (
                    <div key={stock.symbol} className="flex items-center justify-between p-3 hover:bg-muted/50 transition-colors">
                      <div>
                        <div className="font-mono text-sm font-bold">{stock.symbol}</div>
                        <div className="text-xs text-muted-foreground truncate max-w-[100px]">{stock.name}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">${stock.price?.toFixed(2)}</div>
                        <GainLossBadge value={stock.changesPercentage} isPercentage size="sm" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Center - Main Chart */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            <Card className="bg-card border-border shadow-sm flex-1 min-h-[500px] flex flex-col">
              <CardHeader className="pb-2 pt-4 px-4 flex flex-row items-center justify-between border-b border-border">
                <div>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    S&P 500 Index (SPY)
                  </CardTitle>
                  {spyQuote && (
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-2xl font-bold">${spyQuote.price?.toFixed(2)}</span>
                      <GainLossBadge value={spyQuote.changesPercentage} isPercentage size="md" />
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  {["1D", "1W", "1M", "3M", "1Y"].map((tf) => (
                    <Button key={tf} variant={tf === "1M" ? "secondary" : "ghost"} size="sm" className="h-7 text-xs px-2">
                      {tf}
                    </Button>
                  ))}
                </div>
              </CardHeader>
              <CardContent className="p-4 flex-1">
                {spyHistory && spyHistory.length > 0 ? (
                  <StockChart data={spyHistory.slice(0, 100).reverse()} className="h-full w-full" />
                ) : (
                  <div className="flex items-center justify-center h-full w-full bg-zinc-950/50 rounded-lg border border-dashed border-border">
                    <div className="text-center">
                      <BarChart3 className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-50" />
                      <p className="text-muted-foreground font-medium">Select an asset to view chart</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar - Market Actives */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            <Card className="bg-card border-border shadow-sm">
              <CardHeader className="pb-2 pt-4 px-4 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" />
                  Market Actives
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {topActives.map((stock: { symbol: string; name: string; price: number; changesPercentage: number }) => (
                    <div key={stock.symbol} className="flex items-center justify-between p-3 hover:bg-muted/50 transition-colors">
                      <div>
                        <div className="font-mono text-sm font-bold">{stock.symbol}</div>
                        <div className="text-xs text-muted-foreground truncate max-w-[100px]">{stock.name}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">${stock.price?.toFixed(2)}</div>
                        <GainLossBadge value={stock.changesPercentage} isPercentage size="sm" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Promo Card */}
            <Card className="bg-primary/5 border-primary/20 shadow-sm mt-auto">
              <CardContent className="p-5 text-center">
                <h3 className="font-bold text-lg mb-2">Unlock Full Access</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Get real-time data, portfolio tracking, and AI insights.
                </p>
                <Button asChild className="w-full gap-2">
                  <Link href="/signup">
                    Start Free Trial <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
