"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MarketOverview,
  StockSearch,
  MarketMovers,
  Watchlist,
  StockQuoteDetail,
} from "@/components/dashboard";
import {
  Sparkles,
  Search,
  TrendingUp,
  Activity,
  RefreshCw,
  ExternalLink,
} from "lucide-react";

// Local storage key for watchlist persistence
const WATCHLIST_KEY = "solom_watchlist";

// Custom hook for localStorage that avoids the lint issue
function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  // Get initial value from localStorage synchronously during render
  const getStoredValue = (): T => {
    if (typeof window === "undefined") return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  };

  const [storedValue, setStoredValue] = useState<T>(getStoredValue);

  // Return a wrapped setter that also persists to localStorage
  const setValue = (value: T | ((prev: T) => T)) => {
    setStoredValue(prev => {
      const valueToStore = value instanceof Function ? value(prev) : value;
      try {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch {
        // Ignore localStorage errors
      }
      return valueToStore;
    });
  };

  return [storedValue, setValue];
}

export default function DashboardPage() {
  const [watchlist, setWatchlist] = useLocalStorage<string[]>(WATCHLIST_KEY, []);
  const [selectedStock, setSelectedStock] = useState<string | null>(null);

  const addToWatchlist = (symbol: string) => {
    setWatchlist((prev) => {
      if (prev.includes(symbol)) return prev;
      return [...prev, symbol];
    });
  };

  const removeFromWatchlist = (symbol: string) => {
    setWatchlist((prev) => prev.filter((s) => s !== symbol));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="text-xl font-bold">Solom</span>
            <Badge variant="secondary" className="ml-2">
              Markets
            </Badge>
          </Link>
          <nav className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">
                Home
              </Link>
            </Button>
            <Button variant="outline" size="sm">
              <ExternalLink className="mr-2 h-4 w-4" />
              API Docs
            </Button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Title Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Stock Market Dashboard</h1>
          <p className="mt-2 text-muted-foreground">
            Real-time market data, stock quotes, and market movers
          </p>
        </div>

        {/* Market Status Bar */}
        <div className="mb-6 flex items-center justify-between rounded-lg border bg-muted/50 px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
            <span className="text-sm font-medium">Market Open</span>
            <Badge variant="success" className="text-xs">
              Live
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Last updated: {new Date().toLocaleTimeString()}</span>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Market Overview */}
        <section className="mb-8">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
            <Activity className="h-5 w-5 text-primary" />
            Market Overview
          </h2>
          <MarketOverview />
        </section>

        {/* Main Dashboard Content */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Search & Movers */}
          <div className="space-y-6 lg:col-span-2">
            {/* Tabs for Search and Market Movers */}
            <Tabs defaultValue="search" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="search" className="flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  Stock Search
                </TabsTrigger>
                <TabsTrigger value="movers" className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Market Movers
                </TabsTrigger>
              </TabsList>

              <TabsContent value="search" className="mt-4">
                <StockSearch
                  onAddToWatchlist={addToWatchlist}
                  watchlistSymbols={new Set(watchlist)}
                />
              </TabsContent>

              <TabsContent value="movers" className="mt-4">
                <MarketMovers />
              </TabsContent>
            </Tabs>

            {/* Selected Stock Detail */}
            {selectedStock && (
              <section className="mt-6">
                <StockQuoteDetail
                  symbol={selectedStock}
                  onClose={() => setSelectedStock(null)}
                />
              </section>
            )}
          </div>

          {/* Right Column - Watchlist */}
          <div>
            <Watchlist
              symbols={watchlist}
              onRemove={removeFromWatchlist}
            />
          </div>
        </div>

        {/* Information Footer */}
        <section className="mt-12 rounded-lg border bg-muted/30 p-6">
          <h3 className="mb-2 font-semibold">About This Dashboard</h3>
          <p className="text-sm text-muted-foreground">
            This dashboard provides real-time stock market data simulation. Market indices,
            stock quotes, and market movers are randomly generated for demonstration purposes.
            In production, data would be fetched from real financial APIs. Watchlist data is
            persisted in your browser&apos;s local storage.
          </p>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2026 Solom. Built with ❤️ by WeAreBini</p>
        </div>
      </footer>
    </div>
  );
}