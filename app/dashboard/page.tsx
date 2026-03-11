"use client";

/**
 * @ai-context Main dashboard surface with responsive shell controls and watchlist persistence.
 * Adds mobile navigation and section shortcuts without changing the current route architecture.
 * @ai-related components/dashboard/Sidebar.tsx, components/dashboard/navigation.ts, components/dashboard/CommandPalette.tsx
 */

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  MarketOverview,
  StockSearch,
  MarketMovers,
  Watchlist,
  CommandPalette,
  StockDetailModal,
} from "@/components/dashboard";
import { Sidebar } from "@/components/dashboard/Sidebar";
import {
  dashboardNavItems,
  isDashboardNavItemActive,
} from "@/components/dashboard/navigation";
import { cn } from "@/lib/utils";
import {
  House,
  Menu,
  Sparkles,
  RefreshCw,
  Command,
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
  const pathname = usePathname();
  const [watchlist, setWatchlist] = useState<string[]>(getInitialWatchlist);
  const [selectedStock, setSelectedStock] = useState<string | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
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
    <div className="min-h-screen bg-background">
      <Sidebar
        collapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
      />

      <CommandPalette onStockSelect={handleStockSelect} />

      <div
        className={cn(
          "transition-[padding] duration-300",
          sidebarCollapsed ? "md:pl-16" : "md:pl-64"
        )}
      >
        <header className="sticky top-0 z-30 border-b bg-background/90 backdrop-blur-sm">
          <div className="flex min-h-16 items-center justify-between gap-4 px-4 py-3 md:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileNavOpen(true)}
                aria-label="Open dashboard navigation"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                  Dashboard
                </p>
                <h1 className="truncate text-xl font-semibold">Stock Market Dashboard</h1>
                <p className="hidden text-sm text-muted-foreground sm:block">
                  Real-time market data and stock quotes
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-3">
              <div className="hidden items-center gap-1 rounded-md border bg-muted/50 px-3 py-1.5 text-xs text-muted-foreground lg:flex">
                <Command className="h-3 w-3" />
                <span>K</span>
                <span className="mx-1">to search</span>
              </div>
              <Button variant="ghost" size="icon" className="sm:hidden" asChild>
                <Link href="/" aria-label="Go to home">
                  <House className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/">Home</Link>
              </Button>
            </div>
          </div>

          <div className="border-t border-border/60 px-4 py-3 md:px-6">
            <nav className="flex gap-2 overflow-x-auto pb-1" aria-label="Dashboard sections">
              {dashboardNavItems.map((item) => {
                const isActive = isDashboardNavItemActive(pathname, item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors",
                      isActive
                        ? "border-primary/40 bg-primary/10 text-primary"
                        : "border-border/60 bg-background text-muted-foreground hover:border-primary/30 hover:text-foreground"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </header>

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

        <main className="p-4 pb-24 md:p-6 md:pb-6">
          <section className="mb-8">
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

        <footer className="border-t px-4 py-6 pb-24 text-center text-sm text-muted-foreground md:px-6 md:pb-6">
          <p>© 2026 Solom Finance Platform • Built with Next.js & shadcn/ui</p>
        </footer>
      </div>

      <Dialog open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <DialogContent className="left-0 top-0 h-screen w-[88vw] max-w-sm translate-x-0 translate-y-0 rounded-none border-r border-l-0 border-t-0 border-b-0 p-0 sm:max-w-sm">
          <DialogHeader className="border-b px-5 py-4 text-left">
            <DialogTitle>Dashboard Navigation</DialogTitle>
            <DialogDescription>
              Move between the current market, stock, finance, and social surfaces.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[calc(100vh-88px)]">
            <div className="space-y-3 px-5 py-5">
              {dashboardNavItems.map((item) => {
                const isActive = isDashboardNavItemActive(pathname, item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileNavOpen(false)}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "flex items-start gap-3 rounded-2xl border px-4 py-4 transition-colors",
                      isActive
                        ? "border-primary/40 bg-primary/10 text-primary"
                        : "border-border/60 bg-card text-foreground hover:border-primary/30 hover:bg-accent/40"
                    )}
                  >
                    <div className="rounded-lg bg-primary/10 p-2 text-primary">
                      <item.icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-sm font-semibold">{item.title}</h2>
                      <p className="mt-1 text-xs text-muted-foreground">{item.description}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <nav
        className="fixed inset-x-0 bottom-0 z-30 border-t bg-background/95 backdrop-blur md:hidden"
        aria-label="Dashboard quick navigation"
      >
        <div className="grid h-16 grid-cols-4">
          {dashboardNavItems.map((item) => {
            const isActive = isDashboardNavItemActive(pathname, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.shortTitle}</span>
              </Link>
            );
          })}
        </div>
      </nav>

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