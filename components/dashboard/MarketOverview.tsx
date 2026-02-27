"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";

export function MarketOverview() {
  const { data: indices, isLoading, error } = trpc.finance.getMarketIndices.useQuery();

  if (isLoading) {
    return <MarketOverviewSkeleton />;
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-center text-destructive">
        Failed to load market data. Please try again.
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {indices?.map((index) => (
        <MarketIndexCard
          key={index.symbol}
          symbol={index.symbol}
          name={index.name}
          value={index.value}
          change={index.change}
          changePercent={index.changePercent}
        />
      ))}
    </div>
  );
}

interface MarketIndexCardProps {
  symbol: string;
  name: string;
  value: number;
  change: number;
  changePercent: number;
}

function MarketIndexCard({ symbol, name, value, change, changePercent }: MarketIndexCardProps) {
  const isPositive = change >= 0;

  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{name}</CardTitle>
        <Badge variant={isPositive ? "success" : "destructive"} className="text-xs">
          {symbol}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between">
          <div>
            <div className="text-2xl font-bold tabular-nums">
              {value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="flex items-center gap-1 text-sm">
              {isPositive ? (
                <TrendingUp className="h-4 w-4 text-emerald-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
              <span className={isPositive ? "text-emerald-500" : "text-red-500"}>
                {isPositive ? "+" : ""}{change.toFixed(2)} ({isPositive ? "+" : ""}{changePercent.toFixed(2)}%)
              </span>
            </div>
          </div>
          <Activity className={`h-8 w-8 ${isPositive ? "text-emerald-500/20" : "text-red-500/20"}`} />
        </div>
      </CardContent>
    </Card>
  );
}

function MarketOverviewSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="animate-pulse">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="h-4 w-24 rounded bg-muted" />
            <div className="h-5 w-12 rounded bg-muted" />
          </CardHeader>
          <CardContent>
            <div className="h-8 w-32 rounded bg-muted" />
            <div className="mt-2 h-4 w-24 rounded bg-muted" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}