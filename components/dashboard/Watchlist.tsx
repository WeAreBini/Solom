"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useStockQuote } from "@/lib/api";
import { TrendingUp, TrendingDown, Star, Trash2, Loader2, RefreshCw } from "lucide-react";

interface WatchlistProps {
  symbols: string[];
  onRemove: (symbol: string) => void;
  onStockClick?: (symbol: string) => void;
}

// Individual watchlist item that fetches its own quote
function WatchlistItem({ 
  symbol, 
  onRemove, 
  onStockClick 
}: { 
  symbol: string; 
  onRemove: (symbol: string) => void;
  onStockClick?: (symbol: string) => void;
}) {
  const { data: quote, isLoading, error } = useStockQuote(symbol);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-between rounded-lg border bg-card/50 p-3">
        <span className="font-semibold">{symbol}</span>
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      </div>
    );
  }
  
  if (error || !quote) {
    return (
      <div className="flex items-center justify-between rounded-lg border bg-card/50 p-3">
        <span className="font-semibold">{symbol}</span>
        <span className="text-xs text-muted-foreground">Error loading</span>
      </div>
    );
  }
  
  const isPositive = quote.change >= 0;
  
  return (
    <div 
      className="flex items-center justify-between rounded-lg border bg-card/50 p-3 transition-colors hover:bg-muted/50 cursor-pointer"
      onClick={() => onStockClick?.(symbol)}
    >
      <div className="flex items-center gap-3">
        <div className="min-w-[60px]">
          <span className="font-semibold">{quote.symbol}</span>
          <span className="ml-2 text-xs text-muted-foreground">{quote.name.slice(0, 10)}</span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <div className="font-medium tabular-nums">
            ${quote.price.toFixed(2)}
          </div>
          <div className={`flex items-center justify-end gap-0.5 text-sm tabular-nums ${isPositive ? "text-emerald-500" : "text-red-500"}`}>
            {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            <span>{isPositive ? "+" : ""}{quote.change.toFixed(2)} ({isPositive ? "+" : ""}{quote.changePercent.toFixed(2)}%)</span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(symbol);
          }}
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export function Watchlist({ symbols, onRemove, onStockClick }: WatchlistProps) {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
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
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2" key={refreshKey}>
          {symbols.map((symbol) => (
            <WatchlistItem
              key={symbol}
              symbol={symbol}
              onRemove={onRemove}
              onStockClick={onStockClick}
            />
          ))}
        </div>
        <div className="mt-4 text-center text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Auto-refresh every minute
          </span>
        </div>
      </CardContent>
    </Card>
  );
}