"use client";

import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Search, TrendingUp, TrendingDown, Plus, Check, Loader2 } from "lucide-react";

interface StockSearchProps {
  onAddToWatchlist?: (symbol: string) => void;
  watchlistSymbols?: Set<string>;
}

export function StockSearch({ onAddToWatchlist, watchlistSymbols = new Set() }: StockSearchProps) {
  const [query, setQuery] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced search using ref
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setSearchQuery(query);
    }, 300);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [query]);

  const { data: results, isLoading, error } = trpc.finance.searchStocks.useQuery(
    { query: searchQuery },
    { enabled: searchQuery.length >= 0 }
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleAddToWatchlist = (symbol: string) => {
    onAddToWatchlist?.(symbol);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Search className="h-5 w-5" />
          Stock Search
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by symbol or company name..."
            value={query}
            onChange={handleInputChange}
            className="pl-10"
          />
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            Failed to search stocks. Please try again.
          </div>
        )}

        {!isLoading && !error && results && (
          <div className="space-y-2">
            {results.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No stocks found. Try a different search term.
              </p>
            ) : (
              results.map((stock) => (
                <StockSearchResult
                  key={stock.symbol}
                  stock={stock}
                  isInWatchlist={watchlistSymbols.has(stock.symbol)}
                  onAddToWatchlist={handleAddToWatchlist}
                />
              ))
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface StockSearchResultProps {
  stock: {
    symbol: string;
    name: string;
    price: number;
    change: number;
    changePercent: number;
    volume: number;
    marketCap: number;
    peRatio: number | null;
  };
  isInWatchlist: boolean;
  onAddToWatchlist: (symbol: string) => void;
}

function StockSearchResult({ stock, isInWatchlist, onAddToWatchlist }: StockSearchResultProps) {
  const isPositive = stock.change >= 0;

  const formatMarketCap = (cap: number) => {
    if (cap >= 1e12) return `$${(cap / 1e12).toFixed(2)}T`;
    if (cap >= 1e9) return `$${(cap / 1e9).toFixed(2)}B`;
    if (cap >= 1e6) return `$${(cap / 1e6).toFixed(2)}M`;
    return `$${cap}`;
  };

  return (
    <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-3 transition-colors hover:bg-muted/50">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold">{stock.symbol}</span>
          <Badge variant="secondary" className="text-xs">
            {stock.name}
          </Badge>
        </div>
        <div className="mt-1 flex items-center gap-3 text-sm">
          <span className="font-medium tabular-nums">${stock.price.toFixed(2)}</span>
          <span className={`flex items-center gap-0.5 tabular-nums ${isPositive ? "text-emerald-500" : "text-red-500"}`}>
            {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {isPositive ? "+" : ""}{stock.change.toFixed(2)} ({isPositive ? "+" : ""}{stock.changePercent.toFixed(2)}%)
          </span>
        </div>
        <div className="mt-1 flex gap-4 text-xs text-muted-foreground">
          <span>MCap: {formatMarketCap(stock.marketCap)}</span>
          <span>PE: {stock.peRatio?.toFixed(1) ?? "N/A"}</span>
        </div>
      </div>
      <Button
        variant={isInWatchlist ? "secondary" : "outline"}
        size="sm"
        onClick={() => onAddToWatchlist(stock.symbol)}
        disabled={isInWatchlist}
      >
        {isInWatchlist ? (
          <>
            <Check className="mr-1 h-3 w-3" />
            Watching
          </>
        ) : (
          <>
            <Plus className="mr-1 h-3 w-3" />
            Watch
          </>
        )}
      </Button>
    </div>
  );
}