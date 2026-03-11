"use client";

/**
 * @ai-context Main dashboard surface with responsive shell controls and watchlist persistence.
 * Adds mobile navigation and section shortcuts without changing the current route architecture.
 * @ai-related components/dashboard/Sidebar.tsx, components/dashboard/navigation.ts, components/dashboard/CommandPalette.tsx
 */

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  MarketOverview,
  StockSearch,
  MarketMovers,
  Watchlist,
  StockDetailModal,
} from "@/components/dashboard";
import {
  Sparkles,
  RefreshCw,
} from "lucide-react";

// Local storage key for watchlist persistence
const WATCHLIST_KEY = "solom_watchlist";

/**
 * @ai-context Reads the persisted watchlist in a client-safe way during initial render.
 * @returns Persisted symbols or an empty list when storage is unavailable or invalid.
 */
function getInitialWatchlist(): string[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const saved = window.localStorage.getItem(WATCHLIST_KEY);
    return saved ? (JSON.parse(saved) as string[]) : [];
  } catch {
    return [];
  }
}

export default function DashboardPage() {
  const [watchlist, setWatchlist] = useState<string[]>(getInitialWatchlist);
  const [selectedStock, setSelectedStock] = useState<string | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(() => new Date());

  // Save watchlist to local storage when it changes
  useEffect(() => {
    try {
      localStorage.setItem(WATCHLIST_KEY, JSON.stringify(watchlist));
    } catch {
      // Ignore storage errors to keep the dashboard usable.
    }
  }, [watchlist]);

  const addToWatchlist = (symbol: string) => {
    setWatchlist((prev) => {
      if (prev.includes(symbol)) return prev;
      return [...prev, symbol];
    });
    setLastUpdated(new Date());
  };

  const removeFromWatchlist = (symbol: string) => {
    setWatchlist((prev) => prev.filter((s) => s !== symbol));
    setLastUpdated(new Date());
  };

  const handleStockSelect = (symbol: string) => {
    setSelectedStock(symbol);
    setDetailModalOpen(true);
    setLastUpdated(new Date());
  };

  const handleRefresh = () => {
    setLastUpdated(new Date());
  };

  return (
    <>
      <div className="space-y-8">
        <div className="border-b bg-muted/30">
          <div className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between md:px-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                <span className="text-sm font-medium">Market Open</span>
              </div>
              <Badge variant="success" className="font-mono text-[10px]">
                LIVE
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={handleRefresh}
                aria-label="Refresh dashboard timestamp"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <section>
          <h2 className="mb-4 text-lg font-semibold">Market Overview</h2>
          <MarketOverview />
        </section>

        <div className="grid gap-6 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-8">
            <Tabs defaultValue="search" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="search" className="gap-2">
                  <Sparkles className="h-4 w-4" />
                  Stock Search
                </TabsTrigger>
                <TabsTrigger value="movers" className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Market Movers
                </TabsTrigger>
              </TabsList>

              <TabsContent value="search" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Search Stocks</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <StockSearch
                      onAddToWatchlist={addToWatchlist}
                      watchlistSymbols={new Set(watchlist)}
                      onStockSelect={handleStockSelect}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="movers" className="mt-4">
                <MarketMovers />
              </TabsContent>
            </Tabs>
          </div>

          <div className="lg:col-span-4">
            <Watchlist
              symbols={watchlist}
              onRemove={removeFromWatchlist}
              onStockClick={handleStockSelect}
            />
          </div>
        </div>

        <section>
          <Card className="bg-gradient-to-r from-primary/5 via-background to-primary/5">
            <CardContent className="p-6">
              <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
                <QuickStat label="Indices Tracked" value="3" />
                <QuickStat label="Stocks Available" value="100+" />
                <QuickStat label="Data Update" value="Real-time" />
                <QuickStat label="Watchlist Items" value={watchlist.length.toString()} />
              </div>
            </CardContent>
          </Card>
        </section>
      </div>

      <StockDetailModal
        symbol={selectedStock}
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
        onAddToWatchlist={addToWatchlist}
        watchlistSymbols={new Set(watchlist)}
      />
    </>
  );
}

function QuickStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
}