"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { TrendingUp, TrendingDown, X, Loader2 } from "lucide-react";

interface StockQuoteDetailProps {
  symbol: string;
  onClose?: () => void;
}

export function StockQuoteDetail({ symbol, onClose }: StockQuoteDetailProps) {
  const [price, setPrice] = useState<number | null>(null);
  const [previousPrice, setPreviousPrice] = useState<number | null>(null);
  
  const { data: stock, isLoading, error } = trpc.finance.getStockQuote.useQuery({ symbol });

  // Set initial price when stock data loads - use derived state
  const basePrice = stock?.price ?? null;
  
  // Initialize price from stock data
  useEffect(() => {
    if (basePrice !== null && price === null) {
      setPrice(basePrice);
    }
  }, [basePrice, price]);

  // Simulate real-time updates
  useEffect(() => {
    if (!stock || price === null) return;

    const interval = setInterval(() => {
      setPrice(currentPrice => {
        if (currentPrice === null) return null;
        setPreviousPrice(currentPrice);
        // Simulate price fluctuation
        const volatility = 0.001;
        const priceChange = currentPrice * volatility * (Math.random() - 0.5) * 2;
        return Math.round(Math.max(0.01, currentPrice + priceChange) * 100) / 100;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [stock, price ]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (error || !stock) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-destructive">
          Failed to load stock data for {symbol}
        </CardContent>
      </Card>
    );
  }

  const isPositive = stock.change >= 0;
  const priceUp = previousPrice !== null && price !== null && price > previousPrice;
  const priceDown = previousPrice !== null && price !== null && price < previousPrice;
  const currentPrice = price ?? stock.price;

  const formatNumber = (num: number) => {
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    return `$${num.toLocaleString()}`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <span>{stock.symbol}</span>
            <Badge variant="secondary" className="font-normal">
              {stock.name}
            </Badge>
          </CardTitle>
          {onClose && (
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Price Section */}
        <div>
          <div className={`text-4xl font-bold tabular-nums transition-colors duration-300 ${priceUp ? "text-emerald-500" : priceDown ? "text-red-500" : ""}`}>
            ${currentPrice.toFixed(2)}
          </div>
          <div className="mt-2 flex items-center gap-2">
            <div className={`flex items-center gap-1 ${isPositive ? "text-emerald-500" : "text-red-500"}`}>
              {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              <span className="font-medium tabular-nums">
                {isPositive ? "+" : ""}{stock.change.toFixed(2)}
              </span>
              <span className="tabular-nums">
                ({isPositive ? "+" : ""}{stock.changePercent.toFixed(2)}%)
              </span>
            </div>
            <Badge variant={isPositive ? "success" : "destructive"}>
              {isPositive ? "Up" : "Down"}
            </Badge>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <StatItem label="Open" value={`$${stock.open.toFixed(2)}`} />
          <StatItem label="Prev Close" value={`$${stock.previousClose.toFixed(2)}`} />
          <StatItem label="Market Cap" value={formatNumber(stock.marketCap)} />
          <StatItem label="Volume" value={stock.volume.toLocaleString()} />
          <StatItem label="Avg Volume" value={stock.avgVolume.toLocaleString()} />
          <StatItem label="P/E Ratio" value={stock.peRatio?.toFixed(2) ?? "N/A"} />
          <StatItem label="52W High" value={`$${stock.high52Week.toFixed(2)}`} />
          <StatItem label="52W Low" value={`$${stock.low52Week.toFixed(2)}`} />
        </div>

        {/* Price Range Bar */}
        <div>
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">52 Week Range</span>
            <span className="tabular-nums">${stock.low52Week.toFixed(2)} - ${stock.high52Week.toFixed(2)}</span>
          </div>
          <div className="relative h-2 w-full rounded-full bg-muted">
            <div
              className="absolute h-full rounded-full bg-primary"
              style={{
                width: `${Math.min(100, Math.max(0, ((currentPrice - stock.low52Week) / (stock.high52Week - stock.low52Week)) * 100))}%`,
              }}
            />
            <div
              className="absolute top-1/2 h-4 w-1 -translate-y-1/2 rounded-full bg-foreground"
              style={{
                left: `${Math.min(100, Math.max(0, ((currentPrice - stock.low52Week) / (stock.high52Week - stock.low52Week)) * 100))}%`,
              }}
            />
          </div>
        </div>

        <div className="text-center text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Real-time price updates every 2s
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium tabular-nums">{value}</p>
    </div>
  );
}