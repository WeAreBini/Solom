"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useMarketMovers } from "@/lib/solom-api";
import { TrendingUp, TrendingDown, Flame, Snowflake } from "lucide-react";

export function MarketMovers() {
  const { data: movers, isLoading, error } = useMarketMovers();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="h-5 w-5" />
            Market Movers
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-6 w-20" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error || !movers) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="h-5 w-5" />
            Market Movers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-center text-destructive">
            Failed to load market movers
          </div>
        </CardContent>
      </Card>
    );
  }

  const gainers = movers.gainers || [];
  const losers = movers.losers || [];

  return (
    <div className="space-y-6">
      {/* Top Gainers */}
      <Card className="overflow-hidden border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-transparent">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Flame className="h-5 w-5 text-emerald-500" />
            Top Gainers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {gainers.map((stock) => (
              <MoverRow key={stock.symbol} stock={stock} isGainer />
            ))}
            {gainers.length === 0 && (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No gainers today
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Top Losers */}
      <Card className="overflow-hidden border-red-500/20 bg-gradient-to-br from-red-500/5 to-transparent">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Snowflake className="h-5 w-5 text-red-500" />
            Top Losers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {losers.map((stock) => (
              <MoverRow key={stock.symbol} stock={stock} />
            ))}
            {losers.length === 0 && (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No losers today
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface MoverRowProps {
  stock: {
    symbol: string;
    name: string;
    price: number;
    change: number;
    changePercent: number;
  };
  isGainer?: boolean;
}

function MoverRow({ stock, isGainer }: MoverRowProps) {
  const positive = stock.changePercent >= 0;
  
  return (
    <div className="flex items-center justify-between rounded-lg bg-background/50 p-2.5 transition-colors hover:bg-background">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold">{stock.symbol}</span>
          <span className="text-xs text-muted-foreground">{stock.name?.slice(0, 15) || stock.symbol}</span>
        </div>
        <div className="mt-0.5 text-sm text-muted-foreground">
          ${stock.price.toFixed(2)}
        </div>
      </div>
      <div className="text-right">
        <Badge
          variant={positive ? "success" : "destructive"}
          className="font-mono"
        >
          {positive ? "+" : ""}{stock.changePercent.toFixed(2)}%
        </Badge>
      </div>
    </div>
  );
}