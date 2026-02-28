"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useStockSearch } from "@/lib/api";
import { useRealTimePrices } from "@/lib/hooks";
import { ConnectionStatusIndicator, useConnectionStatus } from "@/components/ui/connection-status";
import { TrendingUp, TrendingDown, Star, Trash2, Loader2, RefreshCw } from "lucide-react";
import type { RealTimePrice } from "@/lib/hooks";

interface WatchlistProps {
  symbols: string[];
  onRemove: (symbol: string) => void;
}

// Track previous prices for animation
interface StockWithPrevious {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  previousPrice: number | null;
  source: RealTimePrice["source"];
}

export function Watchlist({ symbols, onRemove }: WatchlistProps) {
  const [stockNames, setStockNames] = useState<Map<string, string>>(new Map());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [prevPrices, setPrevPrices] = useState<Map<string, number>>(new Map());

  // Get connection status for WebSocket indicator
  const connectionStatus = useConnectionStatus();

  // Fetch stock names from search API
  const { data, isLoading, error, refetch } = useStockSearch("", symbols.length > 0);

  // Extract stock names from search results
  useEffect(() => {
    if (data) {
      setStockNames(prev => {
        const newMap = new Map(prev);
        data.forEach(stock => {
          if (symbols.includes(stock.symbol)) {
            newMap.set(stock.symbol, stock.name);
          }
        });
        return newMap;
      });
    }
  }, [data, symbols]);

  // Get real-time prices via WebSocket with polling fallback
  const { prices, isLoading: pricesLoading, areFromWebSocket } = useRealTimePrices(symbols, {
    enabled: symbols.length > 0,
    onPriceUpdate: useCallback((symbol: string, price: RealTimePrice) => {
      // Track previous price for animation
      setPrevPrices(prev => {
        const currentPrice = prev.get(symbol);
        if (currentPrice !== undefined && currentPrice !== price.price) {
          // Price changed - animation will show
        }
        return prev;
      });
    }, []),
  });

  // Handle manual refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // Merge real-time prices with stock names
  const stocksList: StockWithPrevious[] = useMemo(() => {
    const list: StockWithPrevious[] = [];
    
    for (const symbol of symbols) {
      const rtPrice = prices.get(symbol);
      if (rtPrice) {
        list.push({
          symbol: rtPrice.symbol,
          name: stockNames.get(symbol) || symbol,
          price: rtPrice.price,
          change: rtPrice.change,
          changePercent: rtPrice.changePercent,
          previousPrice: prevPrices.get(symbol) ?? null,
          source: rtPrice.source,
        });
      }
    }
    
    return list;
  }, [symbols, prices, stockNames, prevPrices]);

  if (symbols.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Star className="h-5 w-5" />
            Watchlist
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Star className="h-12 w-12 text-muted-foreground/30" />
            <p className="mt-3 text-sm text-muted-foreground">
              Your watchlist is empty
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Search for stocks and add them to your watchlist
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading && prices.size === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Star className="h-5 w-5" />
            Watchlist
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error && prices.size === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Star className="h-5 w-5" />
            Watchlist
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-center text-destructive">
            Failed to load watchlist. Please try again.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />
            Watchlist
            <Badge variant="secondary" className="ml-1">
              {symbols.length}
            </Badge>
          </CardTitle>
          <div className="flex items-center gap-2">
            <ConnectionStatusIndicator 
              status={connectionStatus.status} 
              showLabel={false}
              size="sm"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {stocksList.length === 0 && symbols.length > 0 && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}
        <div className="space-y-2">
          {stocksList.map((stock) => (
            <WatchlistRow
              key={stock.symbol}
              stock={stock}
              onRemove={onRemove}
            />
          ))}
        </div>
        <div className="mt-4 text-center text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <span className={`h-2 w-2 rounded-full ${areFromWebSocket ? "bg-emerald-500 animate-pulse" : "bg-blue-500"}`} />
            {areFromWebSocket ? "Real-time WebSocket updates" : "Polling updates (3s)"}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

interface WatchlistRowProps {
  stock: {
    symbol: string;
    name: string;
    price: number;
    change: number;
    changePercent: number;
    previousPrice: number | null;
  };
  onRemove: (symbol: string) => void;
}

function WatchlistRow({ stock, onRemove }: WatchlistRowProps) {
  const isPositive = stock.change >= 0;
  const priceUp = stock.previousPrice !== null && stock.price > stock.previousPrice;
  const priceDown = stock.previousPrice !== null && stock.price < stock.previousPrice;

  return (
    <div className="flex items-center justify-between rounded-lg border bg-card/50 p-3 transition-colors hover:bg-muted/50">
      <div className="flex items-center gap-3">
        <div className="min-w-[60px]">
          <span className="font-semibold">{stock.symbol}</span>
          <span className="ml-2 text-xs text-muted-foreground">{stock.name.slice(0, 10)}</span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <div className={`font-medium tabular-nums transition-colors duration-300 ${priceUp ? "text-emerald-500" : priceDown ? "text-red-500" : ""}`}>
            ${stock.price.toFixed(2)}
          </div>
          <div className={`flex items-center justify-end gap-0.5 text-sm tabular-nums ${isPositive ? "text-emerald-500" : "text-red-500"}`}>
            {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            <span>{isPositive ? "+" : ""}{stock.change.toFixed(2)} ({isPositive ? "+" : ""}{stock.changePercent.toFixed(2)}%)</span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onRemove(stock.symbol)}
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}