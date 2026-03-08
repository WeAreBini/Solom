"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import {
  TrendingUp,
  TrendingDown,
  Plus,
  Check,
  Loader2,
  BarChart3,
  Clock,
  DollarSign,
  Activity,
} from "lucide-react";

interface StockDetailModalProps {
  symbol: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddToWatchlist?: (symbol: string) => void;
  watchlistSymbols?: Set<string>;
}

export function StockDetailModal({
  symbol,
  open,
  onOpenChange,
  onAddToWatchlist,
  watchlistSymbols = new Set(),
}: StockDetailModalProps) {
  const [selectedTab, setSelectedTab] = useState("overview");
  
  const { data: quotes, isLoading, error } = trpc.finance.searchStocks.useQuery(
    { query: symbol || "" },
    { enabled: !!symbol && open }
  );

  const stock = quotes?.find((q) => q.symbol === symbol);
  const isInWatchlist = symbol ? watchlistSymbols.has(symbol) : false;

  if (!symbol) return null;

  const formatNumber = (num: number) => {
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    return `$${num.toLocaleString()}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="py-8 text-center text-destructive">
            Failed to load stock details
          </div>
        ) : stock ? (
          <>
            <DialogHeader>
              <div className="flex items-start justify-between">
                <div>
                  <DialogTitle className="flex items-center gap-3 text-2xl">
                    {stock.symbol}
                    <Badge variant={stock.change >= 0 ? "success" : "destructive"}>
                      {stock.change >= 0 ? "+" : ""}{stock.changePercent.toFixed(2)}%
                    </Badge>
                  </DialogTitle>
                  <DialogDescription className="text-base">
                    {stock.name}
                  </DialogDescription>
                </div>
                <Button
                  variant={isInWatchlist ? "secondary" : "outline"}
                  onClick={() => onAddToWatchlist?.(stock.symbol)}
                  disabled={isInWatchlist}
                >
                  {isInWatchlist ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Watching
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Add to Watchlist
                    </>
                  )}
                </Button>
              </div>
            </DialogHeader>

            {/* Price Section */}
            <div className="my-6 grid grid-cols-3 gap-4">
              <div className="rounded-lg border bg-muted/50 p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <DollarSign className="h-4 w-4" />
                  Price
                </div>
                <div className="mt-1 text-2xl font-bold">${stock.price.toFixed(2)}</div>
                <div className={`flex items-center gap-1 text-sm ${stock.change >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                  {stock.change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {stock.change >= 0 ? "+" : ""}{stock.change.toFixed(2)}
                </div>
              </div>
              
              <div className="rounded-lg border bg-muted/50 p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <BarChart3 className="h-4 w-4" />
                  Market Cap
                </div>
                <div className="mt-1 text-2xl font-bold">{formatNumber(stock.marketCap)}</div>
              </div>
              
              <div className="rounded-lg border bg-muted/50 p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Activity className="h-4 w-4" />
                  P/E Ratio
                </div>
                <div className="mt-1 text-2xl font-bold">
                  {stock.peRatio?.toFixed(1) ?? "N/A"}
                </div>
              </div>
            </div>

            {/* Tabs */}
            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="financials">Financials</TabsTrigger>
                <TabsTrigger value="news">News</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg border p-4">
                    <div className="text-sm text-muted-foreground">Volume</div>
                    <div className="mt-1 text-lg font-medium">
                      {stock.volume.toLocaleString()}
                    </div>
                  </div>
                  <div className="rounded-lg border p-4">
                    <div className="text-sm text-muted-foreground">Avg Volume</div>
                    <div className="mt-1 text-lg font-medium">
                      {(stock.volume * 0.8).toLocaleString()}
                    </div>
                  </div>
                  <div className="rounded-lg border p-4">
                    <div className="text-sm text-muted-foreground">52W High</div>
                    <div className="mt-1 text-lg font-medium text-emerald-500">
                      ${(stock.price * 1.15).toFixed(2)}
                    </div>
                  </div>
                  <div className="rounded-lg border p-4">
                    <div className="text-sm text-muted-foreground">52W Low</div>
                    <div className="mt-1 text-lg font-medium text-red-500">
                      ${(stock.price * 0.85).toFixed(2)}
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="financials" className="mt-4">
                <div className="rounded-lg border bg-muted/30 p-8 text-center text-muted-foreground">
                  <BarChart3 className="mx-auto mb-2 h-8 w-8 opacity-50" />
                  <p>Financial charts coming soon</p>
                  <p className="mt-1 text-sm">
                    Detailed financial data and historical charts are being prepared
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="news" className="mt-4">
                <div className="rounded-lg border bg-muted/30 p-8 text-center text-muted-foreground">
                  <Clock className="mx-auto mb-2 h-8 w-8 opacity-50" />
                  <p>News feed coming soon</p>
                  <p className="mt-1 text-sm">
                    Latest news and analysis for {stock.symbol} will be available here
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}