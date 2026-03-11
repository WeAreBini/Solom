"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useConnectionStatus } from "@/components/ui/connection-status";
import {
  MarketOverview,
  StockSearch,
  MarketMovers,
  Watchlist,
  StockQuoteDetail,
  PriceAlerts,
  AlertNotifications,
} from "@/components/dashboard";
import { useWatchlist, useWatchlistMutations, useAlerts } from "@/lib/hooks/use-alerts";
import { useMarketIndices, useMarketMovers } from "@/lib/solom-api";
import {
  Sparkles,
  Search,
  TrendingUp,
  Activity,
  RefreshCw,
  Bell,
  Clock,
  Zap,
} from "lucide-react";

// Local storage key for fallback watchlist (when database is unavailable)
const LOCAL_WATCHLIST_KEY = "solom_watchlist_v2";

export default function StockDashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // State
  const [selectedStock, setSelectedStock] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("search");
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Use local storage for watchlist as fallback
  const [localWatchlist, setLocalWatchlist] = useState<string[]>(() => {
    if (typeof window === "undefined") {
      return [];
    }

    try {
      const saved = window.localStorage.getItem(LOCAL_WATCHLIST_KEY);
      return saved ? (JSON.parse(saved) as string[]) : [];
    } catch {
      return [];
    }
  });

  // Database-backed watchlist (when connected)
  const { watchlist: dbWatchlist } = useWatchlist();
  const { addToWatchlist: addToDbWatchlist, removeFromWatchlist: removeFromDbWatchlist } = useWatchlistMutations();

  // Alerts
  const { triggeredAlerts, activeAlerts } = useAlerts();

  // API hooks
  const { error: indicesError, refetch: refetchIndices } = useMarketIndices();
  const { refetch: refetchMovers } = useMarketMovers();

  // Connection status
  const connectionStatus = useConnectionStatus();

  const requestedSymbol = searchParams.get("symbol")?.toUpperCase() ?? null;
  const visibleSelectedStock = selectedStock ?? requestedSymbol;
  const visibleActiveTab = requestedSymbol ? "search" : activeTab;

  useEffect(() => {
    if (localWatchlist.length === 0) return;
    try {
      localStorage.setItem(LOCAL_WATCHLIST_KEY, JSON.stringify(localWatchlist));
    } catch {
      // Ignore errors
    }
  }, [localWatchlist]);

  const handleStockSelect = useCallback((symbol: string) => {
    if (requestedSymbol) {
      router.replace("/dashboard/stocks", { scroll: false });
    }

    setSelectedStock(symbol);
  }, [requestedSymbol, router]);

  const handleStockDetailClose = useCallback(() => {
    if (requestedSymbol) {
      router.replace("/dashboard/stocks", { scroll: false });
    }

    setSelectedStock(null);
  }, [requestedSymbol, router]);

  // Add to watchlist (with database fallback)
  const addToWatchlist = useCallback(async (symbol: string) => {
    const upperSymbol = symbol.toUpperCase();
    
    // Add to local first for immediate UI update
    setLocalWatchlist(prev => {
      if (prev.includes(upperSymbol)) return prev;
      return [...prev, upperSymbol];
    });

    // Try to add to database
    try {
      await addToDbWatchlist.mutateAsync(upperSymbol);
    } catch (error) {
      console.warn('Failed to add to database watchlist:', error);
      // Local storage already has it, so this is fine
    }
    
    setLastUpdate(new Date());
  }, [addToDbWatchlist]);

  // Remove from watchlist
  const removeFromWatchlist = useCallback(async (symbol: string) => {
    // Remove from local first
    setLocalWatchlist(prev => prev.filter(s => s !== symbol));

    // Try to remove from database
    try {
      await removeFromDbWatchlist.mutateAsync(symbol);
    } catch (error) {
      console.warn('Failed to remove from database watchlist:', error);
    }
    
    setLastUpdate(new Date());
  }, [removeFromDbWatchlist]);

  // Refresh all data
  const handleRefresh = useCallback(async () => {
    await Promise.all([
      refetchIndices(),
      refetchMovers(),
    ]);
    setLastUpdate(new Date());
  }, [refetchIndices, refetchMovers]);

  // Format time for display
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  // Auto-refresh every 30 seconds (as per acceptance criteria)
  useEffect(() => {
    const interval = setInterval(() => {
      handleRefresh();
    }, 30000);

    return () => clearInterval(interval);
  }, [handleRefresh]);

  // Use database watchlist if available, otherwise use local storage
  const watchlist = dbWatchlist.length > 0 
    ? dbWatchlist.map(w => w.symbol)
    : localWatchlist;

  return (
    <div className="space-y-10 bg-gradient-to-b from-background via-background to-muted/20">
        {/* Title Section with Auto-refresh Status */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">Stock Market Dashboard</h1>
            <p className="mt-1 text-sm text-muted-foreground sm:text-base">
              Real-time market data with price alerts and watchlist tracking
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-lg border bg-muted/50 px-3 py-1.5 text-sm">
              <Zap className="h-3.5 w-3.5 text-emerald-500" />
              <span className="font-medium text-emerald-600">Live Updates</span>
              <Clock className="ml-2 h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">{formatTime(lastUpdate)}</span>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6" 
                onClick={handleRefresh}
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </Button>
            </div>
            {triggeredAlerts.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="relative"
                onClick={() => setShowNotifications((current) => !current)}
              >
                <Bell className="mr-2 h-4 w-4" />
                Alerts
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                  {triggeredAlerts.length}
                </span>
              </Button>
            )}
          </div>
        </div>

        {/* Triggered Alerts Notifications */}
        {triggeredAlerts.length > 0 && showNotifications && (
          <div className="mb-6">
            <AlertNotifications maxNotifications={3} />
          </div>
        )}

        {/* Market Status & Auto-refresh Indicator */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-muted/50 px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
            </div>
            <span className="text-sm font-medium">Market Open</span>
            <Badge variant="success" className="text-xs">
              <Activity className="mr-1 h-3 w-3" />
              Live
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Real-time prices •</span>
            <span>Auto-refresh: 30s</span>
          </div>
        </div>

        {/* Market Overview KPIs */}
        <section className="mb-8">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <Activity className="h-5 w-5 text-primary" />
            Market Indices Overview
          </h2>
          {indicesError ? (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-center text-destructive">
              Failed to load market data. Please try again.
            </div>
          ) : (
            <MarketOverview />
          )}
        </section>

        {/* Main Dashboard Content */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left/Center - Main Content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Tabs: Search & Market Movers */}
            <Tabs value={visibleActiveTab} onValueChange={setActiveTab} className="w-full">
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
                  onStockSelect={handleStockSelect}
                />
              </TabsContent>

              <TabsContent value="movers" className="mt-4">
                <MarketMovers />
              </TabsContent>
            </Tabs>

            {/* Selected Stock Detail with Price Alerts */}
            {visibleSelectedStock && (
              <div className="space-y-4">
                <StockQuoteDetail
                  symbol={visibleSelectedStock}
                  onClose={handleStockDetailClose}
                />
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Bell className="h-4 w-4" />
                      Price Alerts for {visibleSelectedStock}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <PriceAlerts symbol={visibleSelectedStock} />
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* Right Sidebar - Watchlist & Alerts */}
          <div className="space-y-6">
            {/* Watchlist */}
            <Watchlist
              symbols={watchlist}
              onRemove={removeFromWatchlist}
            />

            {/* Your Alerts Summary */}
            {activeAlerts.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Bell className="h-4 w-4" />
                    Active Alerts
                    <Badge variant="secondary" className="ml-auto">
                      {activeAlerts.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {activeAlerts
                    .slice(0, 5)
                    .map(alert => (
                      <button
                        key={alert.id}
                        className="w-full rounded-lg border bg-card/50 p-2 text-left text-sm transition-colors hover:bg-muted/50"
                        onClick={() => handleStockSelect(alert.symbol)}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{alert.symbol}</span>
                          <Badge variant={alert.condition === 'ABOVE' ? 'success' : 'destructive'} className="text-xs">
                            {alert.condition === 'ABOVE' ? '↑' : '↓'} ${alert.targetPrice.toFixed(2)}
                          </Badge>
                        </div>
                      </button>
                    ))}
                </CardContent>
              </Card>
            )}

            {/* Quick Stats */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Sparkles className="h-4 w-4" />
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between rounded-lg bg-muted/50 p-2 text-sm">
                  <span className="text-muted-foreground">Watchlist Items</span>
                  <span className="font-bold">{watchlist.length}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-muted/50 p-2 text-sm">
                  <span className="text-muted-foreground">Active Alerts</span>
                  <span className="font-bold">{activeAlerts.length}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-muted/50 p-2 text-sm">
                  <span className="text-muted-foreground">Triggered Today</span>
                  <span className="font-bold text-emerald-600">{triggeredAlerts.length}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-muted/50 p-2 text-sm">
                  <span className="text-muted-foreground">Data Source</span>
                  <Badge variant={connectionStatus.status === 'connected' ? 'success' : 'secondary'} className="text-xs">
                    {connectionStatus.status === 'connected' ? 'Real-time' : 'Polling'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer Info */}
        <section className="mt-10 rounded-lg border bg-muted/30 p-6">
          <h3 className="mb-2 font-semibold">About This Dashboard</h3>
          <p className="text-sm text-muted-foreground">
            This stock market dashboard provides real-time market data with WebSocket updates (falling back to polling when needed).
            Add stocks to your watchlist and set price alerts to get notified when prices reach your targets.
            Data is sourced from Financial Modeling Prep API and refreshed automatically every 30 seconds.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge variant="secondary">Next.js 15</Badge>
            <Badge variant="secondary">TypeScript</Badge>
            <Badge variant="secondary">TanStack Query</Badge>
            <Badge variant="secondary">WebSocket</Badge>
            <Badge variant="secondary">PostgreSQL</Badge>
            <Badge variant="secondary">Prisma</Badge>
          </div>
        </section>
    </div>
  );
}