"use client";

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
import { useStockQuote, useStockProfile } from "@/lib/api";
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
  const { data: quote, isLoading: quoteLoading, error: quoteError } = useStockQuote(symbol || "");
  const { data: profile, isLoading: profileLoading } = useStockProfile(symbol || "");
  
  const isLoading = quoteLoading || profileLoading;
  const error = quoteError;
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
        ) : quote ? (
          <>
            <DialogHeader>
              <div className="flex items-start justify-between">
                <div>
                  <DialogTitle className="flex items-center gap-3 text-2xl">
                    {quote.symbol}
                    <Badge variant={quote.change >= 0 ? "success" : "destructive"}>
                      {quote.change >= 0 ? "+" : ""}{quote.changePercent.toFixed(2)}%
                    </Badge>
                  </DialogTitle>
                  <DialogDescription className="text-base">
                    {profile?.companyName || quote.name}
                  </DialogDescription>
                </div>
                <Button
                  variant={isInWatchlist ? "secondary" : "outline"}
                  onClick={() => onAddToWatchlist?.(quote.symbol)}
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
                <div className="mt-1 text-2xl font-bold">${quote.price.toFixed(2)}</div>
                <div className={`flex items-center gap-1 text-sm ${quote.change >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                  {quote.change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {quote.change >= 0 ? "+" : ""}{quote.change.toFixed(2)}
                </div>
              </div>
              
              <div className="rounded-lg border bg-muted/50 p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <BarChart3 className="h-4 w-4" />
                  Market Cap
                </div>
                <div className="mt-1 text-2xl font-bold">{formatNumber(quote.marketCap)}</div>
              </div>
              
              <div className="rounded-lg border bg-muted/50 p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Activity className="h-4 w-4" />
                  P/E Ratio
                </div>
                <div className="mt-1 text-2xl font-bold">
                  {quote.peRatio?.toFixed(1) ?? "N/A"}
                </div>
              </div>
            </div>

            {/* Additional Info */}
            {profile && (
              <div className="mb-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Sector:</span>{" "}
                  <span className="font-medium">{profile.sector}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Industry:</span>{" "}
                  <span className="font-medium">{profile.industry}</span>
                </div>
              </div>
            )}

            {/* Tabs */}
            <Tabs defaultValue="overview">
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
                      {quote.volume.toLocaleString()}
                    </div>
                  </div>
                  <div className="rounded-lg border p-4">
                    <div className="text-sm text-muted-foreground">Avg Volume</div>
                    <div className="mt-1 text-lg font-medium">
                      {quote.avgVolume.toLocaleString()}
                    </div>
                  </div>
                  <div className="rounded-lg border p-4">
                    <div className="text-sm text-muted-foreground">52W High</div>
                    <div className="mt-1 text-lg font-medium text-emerald-500">
                      ${quote.high52Week.toFixed(2)}
                    </div>
                  </div>
                  <div className="rounded-lg border p-4">
                    <div className="text-sm text-muted-foreground">52W Low</div>
                    <div className="mt-1 text-lg font-medium text-red-500">
                      ${quote.low52Week.toFixed(2)}
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
                    Latest news and analysis for {quote.symbol} will be available here
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