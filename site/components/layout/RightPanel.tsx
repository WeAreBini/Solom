"use client";

/**
 * @ai-context Collapsible right sidebar for persistent real-time data (Watchlists, Alerts).
 * Hidden on mobile.
 * @ai-related components/layout/AppShell.tsx
 */
import { useState } from "react";
import {
  ChevronRight,
  ChevronLeft,
  TrendingUp,
  TrendingDown,
  Bell,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuotes, useMarketNews } from "@/hooks/use-fmp";

export function RightPanel() {
  const [collapsed, setCollapsed] = useState(false);
  const { data: watchlistData, isLoading, isError } = useQuotes(["AAPL", "MSFT", "NVDA", "TSLA", "SPY"]);
  const { data: newsData, isLoading: isNewsLoading, isError: isNewsError } = useMarketNews();

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col h-screen sticky top-0 border-l border-border bg-card text-card-foreground transition-all duration-300 ease-in-out z-30",
        collapsed ? "w-12" : "w-72"
      )}
    >
      {/* Header & Toggle */}
      <div className="flex items-center justify-between h-14 px-3 shrink-0 border-b border-border/50">
        {!collapsed && (
          <span className="font-semibold text-sm tracking-tight">Market Data</span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "flex items-center justify-center h-8 w-8 rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors",
            collapsed && "mx-auto"
          )}
          aria-label={collapsed ? "Expand right panel" : "Collapse right panel"}
        >
          {collapsed ? (
            <ChevronLeft className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Content */}
      {!collapsed && (
        <ScrollArea className="flex-1">
          <div className="p-4 flex flex-col gap-6">
            {/* Watchlist Section */}
            <section>
              <div className="flex items-center gap-2 mb-3 text-sm font-medium text-muted-foreground">
                <Star className="h-4 w-4" />
                <h2>Watchlist</h2>
              </div>
              <div className="flex flex-col gap-2">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-2">
                      <Skeleton className="h-4 w-12" />
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-4 w-12" />
                      </div>
                    </div>
                  ))
                ) : isError || !watchlistData ? (
                  <div className="text-sm text-muted-foreground p-2">Failed to load watchlist</div>
                ) : (
                  watchlistData.map((item) => {
                    const isUp = item.change >= 0;
                    return (
                      <div
                        key={item.symbol}
                        className="flex items-center justify-between p-2 rounded-md hover:bg-accent/50 transition-colors cursor-pointer"
                      >
                        <span className="font-semibold text-sm">{item.symbol}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-sm">${item.price?.toFixed(2)}</span>
                          <span
                            className={cn(
                              "flex items-center text-xs font-medium w-14 justify-end",
                              isUp ? "text-success" : "text-danger"
                            )}
                          >
                            {isUp ? (
                              <TrendingUp className="h-3 w-3 mr-1" />
                            ) : (
                              <TrendingDown className="h-3 w-3 mr-1" />
                            )}
                            {isUp ? "+" : ""}{item.changesPercentage?.toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </section>

            <Separator className="bg-border/50" />

            {/* Alerts Section */}
            <section>
              <div className="flex items-center gap-2 mb-3 text-sm font-medium text-muted-foreground">
                <Bell className="h-4 w-4" />
                <h2>Market News</h2>
              </div>
              <div className="flex flex-col gap-2">
                {isNewsLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex flex-col gap-1 p-3 rounded-md bg-accent/30 border border-border/50">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-1/2 mt-1" />
                    </div>
                  ))
                ) : isNewsError || !newsData ? (
                  <div className="text-sm text-muted-foreground p-2">Failed to load news</div>
                ) : (
                  newsData.slice(0, 5).map((article) => (
                    <a
                      key={article.url || article.title}
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col gap-1 p-3 rounded-md bg-accent/30 border border-border/50 text-sm hover:bg-accent/50 transition-colors"
                    >
                      <span className="font-medium line-clamp-2">{article.title}</span>
                      <span className="text-xs text-muted-foreground">
                        {article.site} • {new Date(article.publishedDate).toLocaleDateString()}
                      </span>
                    </a>
                  ))
                )}
              </div>
            </section>
          </div>
        </ScrollArea>
      )}

      {/* Collapsed Icons */}
      {collapsed && (
        <div className="flex flex-col items-center gap-4 py-4">
          <button
            className="p-2 rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            title="Watchlist"
            onClick={() => setCollapsed(false)}
          >
            <Star className="h-5 w-5" />
          </button>
          <button
            className="p-2 rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            title="Alerts"
            onClick={() => setCollapsed(false)}
          >
            <Bell className="h-5 w-5" />
          </button>
        </div>
      )}
    </aside>
  );
}
