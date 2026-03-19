"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  MarketOverview,
  StockSearch,
  MarketMovers,
  Watchlist,
  Sidebar,
  CommandPalette,
  StockDetailModal,
} from "@/components/dashboard";
import {
  Sparkles,
  RefreshCw,
  Command,
} from "lucide-react";

// Local storage key for watchlist persistence
const WATCHLIST_KEY = "solom_watchlist";

export default function DashboardPage() {
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [selectedStock, setSelectedStock] = useState<string | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const initializedRef = useRef(false);

  // Load watchlist from local storage on mount
  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      const saved = localStorage.getItem(WATCHLIST_KEY);
      if (saved) {
        try {
          setWatchlist(JSON.parse(saved));
        } catch {
          // Invalid data, ignore
        }
      }
      setLastUpdated(new Date().toLocaleTimeString());
      setMounted(true);
    }
  }, []);

  // Save watchlist to local storage when it changes
  useEffect(() => {
    if (mounted) {
      localStorage.setItem(WATCHLIST_KEY, JSON.stringify(watchlist));
    }
  }, [watchlist, mounted]);

  const addToWatchlist = (symbol: string) => {
    setWatchlist((prev) => {
      if (prev.includes(symbol)) return prev;
      return [...prev, symbol];
    });
  };

  const removeFromWatchlist = (symbol: string) => {
    setWatchlist((prev) => prev.filter((s) => s !== symbol));
  };

  const handleStockSelect = (symbol: string) => {
    setSelectedStock(symbol);
    setDetailModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar />

      {/* Command Palette */}
      <CommandPalette onStockSelect={handleStockSelect} />

      {/* Main Content */}
      <div className="pl-64 transition-all duration-300">
        {/* Header */}
        <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur-sm">
          <div className="flex h-16 items-center justify-between px-6">
            <div>
              <h1 className="text-xl font-semibold">Stock Market Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                Real-time market data and stock quotes
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* Keyboard Shortcut Hint */}
              <div className="hidden items-center gap-1 rounded-md border bg-muted/50 px-3 py-1.5 text-xs text-muted-foreground md:flex">
                <Command className="h-3 w-3" />
                <span>K</span>
                <span className="mx-1">to search</span>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/">Home</Link>
              </Button>
            </div>
          </div>
        </header>

        {/* Market Status Bar */}
        <div className="border-b bg-muted/30">
          <div className="flex items-center justify-between px-6 py-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                <span className="text-sm font-medium">Market Open</span>
              </div>
              <Badge variant="success" className="font-mono text-[10px]">
                LIVE
              </Badge>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span suppressHydrationWarning>
                Last updated: {lastUpdated || "--:--:--"}
              </span>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <main className="p-6">
          {/* Market Overview */}
          <section className="mb-8">
            <h2 className="mb-4 text-lg font-semibold">Market Overview</h2>
            <MarketOverview />
          </section>

          {/* Main Grid */}
          <div className="grid gap-6 lg:grid-cols-12">
            {/* Left Column - Search & Movers */}
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

            {/* Right Column - Watchlist */}
            <div className="lg:col-span-4">
              <Watchlist
                symbols={watchlist}
                onRemove={removeFromWatchlist}
                onStockClick={handleStockSelect}
              />
            </div>
          </div>

          {/* Quick Stats */}
          <section className="mt-8">
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
        </main>

        {/* Footer */}
        <footer className="border-t py-6 text-center text-sm text-muted-foreground">
          <p>© 2026 Solom Finance Platform • Built with Next.js & shadcn/ui</p>
        </footer>
      </div>

      {/* Stock Detail Modal */}
      <StockDetailModal
        symbol={selectedStock}
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
        onAddToWatchlist={addToWatchlist}
        watchlistSymbols={new Set(watchlist)}
      />
    </div>
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