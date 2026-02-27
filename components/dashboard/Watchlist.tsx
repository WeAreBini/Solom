"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { TrendingUp, TrendingDown, Star, Trash2, Loader2, RefreshCw } from "lucide-react";

interface WatchlistProps {
  symbols: string[];
  onRemove: (symbol: string) => void;
}

export function Watchlist({ symbols, onRemove }: WatchlistProps) {
  const [stocks, setStocks] = useState<Map<string, {
    symbol: string;
    name: string;
    price: number;
    change: number;
    changePercent: number;
    previousPrice: number | null;
  }>>(new Map());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch initial quotes
  const { data, isLoading, error, refetch } = trpc.finance.searchStocks.useQuery(
    { query: "" },
    {
      enabled: symbols.length > 0,
    }
  );

  // Update stocks when data changes using derived state pattern
  const stocksData = data?.filter(s => symbols.includes(s.symbol)) ?? [];
  
  // Initialize stocks from fetched data
  useEffect(() => {
    if (stocksData.length > 0) {
      setStocks(prev => {
        const newMap = new Map(prev);
        stocksData.forEach(stock => {
          const prevStock = newMap.get(stock.symbol);
          if (!prevStock) {
            newMap.set(stock.symbol, {
              symbol: stock.symbol,
              name: stock.name,
              price: stock.price,
              change: stock.change,
              changePercent: stock.changePercent,
              previousPrice: null,
            });
          }
        });
        return newMap;
      });
    }
  }, [stocksData]);

  // Simulate real-time updates
  useEffect(() => {
    if (symbols.length === 0) return;

    const interval = setInterval(() => {
      setStocks(prev => {
        const newMap = new Map(prev);
        newMap.forEach((stock, symbol) => {
          if (symbols.includes(symbol)) {
            // Simulate price fluctuation
            const volatility = 0.001;
            const priceChange = stock.price * volatility * (Math.random() - 0.5) * 2;
            const newPrice = Math.max(0.01, stock.price + priceChange);
            const roundedPrice = Math.round(newPrice * 100) / 100;
            
            newMap.set(symbol, {
              ...stock,
              previousPrice: stock.price,
              price: roundedPrice,
            });
          }
        });
        return newMap;
      });
    }, 3000); // Update every 3 seconds

    return () => clearInterval(interval);
  }, [symbols]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 500);
  };

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

  if (isLoading) {
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

  if (error) {
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

  const stocksList = Array.from(stocks.values()).filter(s => symbols.includes(s.symbol));

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
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
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
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Real-time updates every 3s
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