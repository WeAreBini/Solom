"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ConnectionStatusIndicator, useConnectionStatus } from "@/components/ui/connection-status";
import { useRealTimePrice } from "@/lib/hooks";
import { TrendingUp, TrendingDown, X, Loader2 } from "lucide-react";

interface StockQuoteDetailProps {
  symbol: string;
  onClose?: () => void;
}

export function StockQuoteDetail({ symbol, onClose }: StockQuoteDetailProps) {
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  
  // Get connection status for WebSocket
  const connectionStatus = useConnectionStatus();

  // Use real-time price with WebSocket + polling fallback
  const { price, isLoading, error, direction, isWebSocket } = useRealTimePrice(symbol, {
    onPriceUpdate: useCallback(() => {
      setLastUpdate(new Date());
    }, []),
  });

  // Track price animation
  const [showPriceAnimation, setShowPriceAnimation] = useState(false);

  useEffect(() => {
    if (direction !== "neutral") {
      setShowPriceAnimation(true);
      const timer = setTimeout(() => setShowPriceAnimation(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [direction]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (error || !price) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-destructive">
          Failed to load stock data for {symbol}
        </CardContent>
      </Card>
    );
  }

  const isPositive = price.changePercent >= 0;
  const priceUp = direction === "up";
  const priceDown = direction === "down";

  const formatNumber = (num: number) => {
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    return `$${num.toLocaleString()}`;
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="flex items-center gap-2">
              <span>{price.symbol}</span>
              <Badge variant="secondary" className="font-normal">
                {symbol}
              </Badge>
            </CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <ConnectionStatusIndicator 
              status={connectionStatus.status} 
              showLabel={false}
              size="sm"
            />
            {onClose && (
              <button
                onClick={onClose}
                className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Price Section */}
        <div>
          <div className="flex items-baseline gap-3">
            <div
              className={`text-4xl font-bold tabular-nums transition-colors duration-300 ${
                priceUp
                  ? "text-emerald-500"
                  : priceDown
                  ? "text-red-500"
                  : ""
              }`}
            >
              ${price.price.toFixed(2)}
            </div>
            {isWebSocket && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                </span>
                Live
              </div>
            )}
          </div>
          <div className="mt-2 flex items-center gap-2">
            <div
              className={`flex items-center gap-1 ${
                isPositive ? "text-emerald-500" : "text-red-500"
              }`}
            >
              {isPositive ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              <span className="font-medium tabular-nums">
                {isPositive ? "+" : ""}
                {price.change.toFixed(2)}
              </span>
              <span className="tabular-nums">
                ({isPositive ? "+" : ""}
                {price.changePercent.toFixed(2)}%)
              </span>
            </div>
            <Badge variant={isPositive ? "success" : "destructive"}>
              {isPositive ? "Up" : "Down"}
            </Badge>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {price.open !== undefined && (
            <StatItem label="Open" value={`$${price.open.toFixed(2)}`} />
          )}
          {price.previousClose !== undefined && (
            <StatItem label="Prev Close" value={`$${price.previousClose.toFixed(2)}`} />
          )}
          <StatItem label="Volume" value={price.volume.toLocaleString()} />
          {price.dayHigh !== undefined && (
            <StatItem label="Day High" value={`$${price.dayHigh.toFixed(2)}`} />
          )}
          {price.dayLow !== undefined && (
            <StatItem label="Day Low" value={`$${price.dayLow.toFixed(2)}`} />
          )}
          {price.bid !== undefined && (
            <StatItem label="Bid" value={`$${price.bid.toFixed(2)}`} />
          )}
          {price.ask !== undefined && (
            <StatItem label="Ask" value={`$${price.ask.toFixed(2)}`} />
          )}
        </div>

        {/* Price Animation Indicator */}
        {showPriceAnimation && (
          <div
            className={`text-sm font-medium ${
              priceUp ? "text-emerald-500" : "text-red-500"
            }`}
          >
            {priceUp ? "↑ Price increased" : "↓ Price decreased"}
          </div>
        )}

        {/* Last Update & Source */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <span>
              Source:{" "}
              {price.source === "websocket"
                ? "Real-time"
                : price.source === "polling"
                ? "Polled"
                : "Initial"}
            </span>
          </div>
          {lastUpdate && (
            <span>Last update: {formatTime(lastUpdate)}</span>
          )}
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