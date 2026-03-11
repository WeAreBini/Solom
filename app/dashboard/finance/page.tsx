"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KPIGrid } from "@/components/dashboard/kpi-card";
import { PriceLineChart, LineChart } from "@/components/charts/line-chart";
import { useMarketIndices } from "@/lib/solom-api";
import { chartColors } from "@/lib/design-tokens";
import { useHistoricalData } from "@/hooks/use-real-time-data";
import { TrendingUp, TrendingDown, Activity, DollarSign, Percent, BarChart3, RefreshCw, ArrowUpRight, Zap, Clock } from "lucide-react";

export default function FinanceDashboardPage() {
  const { data: indices, isLoading, error, refetch } = useMarketIndices();

  const sparklineData = {
    sp500: useHistoricalData(4500, 48, 0.002, true),
    nasdaq: useHistoricalData(14000, 48, 0.002, true),
    dow: useHistoricalData(35000, 48, 0.002, true),
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const kpiData = useMemo(() => {
    if (!indices || indices.length === 0) return [];
    const sparklineArrays = [sparklineData.sp500, sparklineData.nasdaq, sparklineData.dow];

    return indices.map((index, i) => ({
      label: index.name,
      value: formatCurrency(index.value),
      change: index.changePercent,
      changeLabel: "Today",
      trend: index.changePercent >= 0 ? ("up" as const) : ("down" as const),
      sparklineData: sparklineArrays[i] || [],
      icon: i === 0 ? BarChart3 : undefined,
    }));
  }, [indices, sparklineData.sp500, sparklineData.nasdaq, sparklineData.dow]);

  const priceHistoryData = useMemo(
    () =>
      sparklineData.sp500.map((value: number, index: number) => ({
        date: new Date(Date.UTC(2026, 0, 1, index)).toISOString(),
        price: value,
        volume: 650000000 + index * 15000000,
      })),
    [sparklineData.sp500]
  );

  const comparisonData = useMemo(
    () =>
      Array.from({ length: 24 }, (_, i) => ({
        time: `${i}:00`,
        sp500: 4500 + Math.sin(i * 0.5) * 50 + i * 3,
        nasdaq: 14000 + Math.cos(i * 0.3) * 100 + i * 5,
      })),
    []
  );

  return (
    <div className="space-y-12 bg-gradient-to-b from-background via-background to-muted/20">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Finance Dashboard</h1>
          <p className="mt-2 text-muted-foreground">Real-time market insights with KPI cards and visualizations</p>
        </div>

        <div className="mb-6 flex items-center justify-between rounded-lg border bg-muted/50 px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </div>
            <span className="text-sm font-medium">Market Open</span>
            <Badge variant="success" className="text-xs"><Zap className="mr-1 h-3 w-3" />Live</Badge>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
              <span suppressHydrationWarning>Last updated: {new Date().toLocaleTimeString()}</span>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => refetch()}><RefreshCw className="h-4 w-4" /></Button>
          </div>
        </div>

        <section className="mb-8">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold"><Activity className="h-5 w-5 text-primary" />Market Indices</h2>
          {error ? (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-center text-destructive">Failed to load market data. Please try again.</div>
          ) : (
            <KPIGrid cards={isLoading ? [
              { label: "Loading...", value: "-", isLoading: true },
              { label: "Loading...", value: "-", isLoading: true },
              { label: "Loading...", value: "-", isLoading: true },
            ] : kpiData} />
          )}
        </section>

        <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" />S&P 500 Price History</CardTitle></CardHeader>
              <CardContent>
                {sparklineData.sp500.length > 0 && (
                  <PriceLineChart
                    data={priceHistoryData}
                    height={250}
                    showVolume
                    color="neutral"
                  />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5" />Multi-Index Comparison</CardTitle></CardHeader>
              <CardContent>
                <LineChart
                  data={comparisonData}
                  xKey="time"
                  yKeys={["sp500", "nasdaq"]}
                  height={200}
                  showGrid
                  showXAxis
                  showYAxis
                  colors={[chartColors.primary, chartColors.secondary]}
                />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><DollarSign className="h-5 w-5" />Portfolio Summary</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Value</p>
                    <p className="text-2xl font-bold font-financial">$124,563.00</p>
                  </div>
                  <Badge variant="success" className="text-sm"><ArrowUpRight className="mr-1 h-4 w-4" />+12.5%</Badge>
                </div>
                <div className="h-px bg-border" />
                <div className="grid grid-cols-2 gap-4">
                  <div><p className="text-sm text-muted-foreground">Today&apos;s Gain</p><p className="text-lg font-semibold text-emerald-600">$+1,234.56</p></div>
                  <div><p className="text-sm text-muted-foreground">Positions</p><p className="text-lg font-semibold">12</p></div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Percent className="h-5 w-5" />Quick Stats</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2"><TrendingUp className="h-4 w-4 text-emerald-500" /><span className="text-sm font-medium">Top Mover</span></div>
                  <div className="text-right"><p className="text-sm font-bold">NVDA</p><p className="text-xs text-emerald-500">+15.4%</p></div>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2"><TrendingDown className="h-4 w-4 text-red-500" /><span className="text-sm font-medium">Bottom Mover</span></div>
                  <div className="text-right"><p className="text-sm font-bold">META</p><p className="text-xs text-red-500">-8.2%</p></div>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2"><Activity className="h-4 w-4 text-primary" /><span className="text-sm font-medium">Market Volatility</span></div>
                  <div className="text-right"><p className="text-sm font-bold">VIX</p><p className="text-xs text-amber-500">18.32</p></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <section className="mt-12 rounded-lg border bg-muted/30 p-6">
          <h3 className="mb-2 font-semibold">About This Dashboard</h3>
          <p className="text-sm text-muted-foreground">This finance dashboard showcases the KPI card component system with real-time updates, sparkline visualizations, and responsive grid layouts. Built following the design patterns documented in our finance dashboard UI guidelines.</p>
          <div className="mt-4 flex gap-2">
            <Badge variant="secondary">React</Badge>
            <Badge variant="secondary">Tailwind CSS</Badge>
            <Badge variant="secondary">Recharts</Badge>
            <Badge variant="secondary">TanStack Query</Badge>
          </div>
        </section>
    </div>
  );
}