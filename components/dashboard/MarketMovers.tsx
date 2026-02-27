"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Loader2 } from "lucide-react";

export function MarketMovers() {
  const { data: movers, isLoading, error } = trpc.finance.getMarketMovers.useQuery();

  if (isLoading) {
    return <MarketMoversSkeleton />;
  }

  if (error) {
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
            Failed to load market movers. Please try again.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <TrendingUp className="h-5 w-5" />
          Market Movers
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="gainers" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="gainers" className="flex items-center gap-1">
              <ArrowUpRight className="h-4 w-4 text-emerald-500" />
              Top Gainers
            </TabsTrigger>
            <TabsTrigger value="losers" className="flex items-center gap-1">
              <ArrowDownRight className="h-4 w-4 text-red-500" />
              Top Losers
            </TabsTrigger>
          </TabsList>

          <TabsContent value="gainers" className="mt-4">
            <div className="space-y-2">
              {movers?.gainers.map((stock, index) => (
                <MoverRow key={stock.symbol} stock={stock} rank={index + 1} type="gainer" />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="losers" className="mt-4">
            <div className="space-y-2">
              {movers?.losers.map((stock, index) => (
                <MoverRow key={stock.symbol} stock={stock} rank={index + 1} type="loser" />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

interface MoverRowProps {
  stock: {
    symbol: string;
    name: string;
    price: number;
    change: number;
    changePercent: number;
    volume: number;
  };
  rank: number;
  type: "gainer" | "loser";
}

function MoverRow({ stock, rank, type }: MoverRowProps) {
  const isPositive = type === "gainer";
  const formatVolume = (vol: number) => {
    if (vol >= 1e9) return `${(vol / 1e9).toFixed(1)}B`;
    if (vol >= 1e6) return `${(vol / 1e6).toFixed(1)}M`;
    if (vol >= 1e3) return `${(vol / 1e3).toFixed(1)}K`;
    return vol.toString();
  };

  return (
    <div className="flex items-center justify-between rounded-lg border bg-card/50 p-3 transition-colors hover:bg-muted/50">
      <div className="flex items-center gap-3">
        <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${isPositive ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"}`}>
          #{rank}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">{stock.symbol}</span>
            <span className="text-xs text-muted-foreground truncate max-w-[120px]">{stock.name}</span>
          </div>
          <span className="text-sm text-muted-foreground">
            Vol: {formatVolume(stock.volume)}
          </span>
        </div>
      </div>
      <div className="text-right">
        <div className="font-medium tabular-nums">${stock.price.toFixed(2)}</div>
        <div className={`flex items-center justify-end gap-0.5 text-sm tabular-nums ${isPositive ? "text-emerald-500" : "text-red-500"}`}>
          {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          <span>{isPositive ? "+" : ""}{stock.changePercent.toFixed(2)}%</span>
        </div>
      </div>
    </div>
  );
}

function MarketMoversSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <TrendingUp className="h-5 w-5" />
          Market Movers
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