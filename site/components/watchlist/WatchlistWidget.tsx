import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkline } from "@/components/finance/Sparkline";
import { cn } from "@/lib/utils";
import Link from "next/link";

/**
 * @ai-context WatchlistWidget component for the dashboard.
 * Displays a list of assets with mini sparklines or price changes.
 * @ai-related app/dashboard/page.tsx, components/finance/Sparkline.tsx
 */

interface WatchlistItem {
  symbol: string;
  name: string;
  price: number;
  changePct: number;
  sparklineData?: number[];
}

interface WatchlistWidgetProps {
  items: WatchlistItem[];
}

export function WatchlistWidget({ items }: WatchlistWidgetProps) {
  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">Watchlist</CardTitle>
        <Link
          href="/watchlist"
          className="text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          View All
        </Link>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-4">
          {items.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-4">
              No items in watchlist.
            </div>
          ) : (
            items.map((item) => {
              const isPositive = item.changePct >= 0;
              return (
                <div
                  key={item.symbol}
                  className="flex items-center justify-between group"
                >
                  <div className="flex flex-col">
                    <span className="font-semibold text-sm">{item.symbol}</span>
                    <span className="text-xs text-muted-foreground truncate max-w-[100px]">
                      {item.name}
                    </span>
                  </div>

                  {item.sparklineData && item.sparklineData.length > 0 && (
                    <div className="w-20 h-8 hidden sm:block">
                      <Sparkline
                        data={item.sparklineData}
                        color={isPositive ? "#10b981" : "#f43f5e"}
                        strokeWidth={1.5}
                      />
                    </div>
                  )}

                  <div className="flex flex-col items-end">
                    <span className="font-medium text-sm">
                      ${item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <span
                      className={cn(
                        "text-xs font-medium",
                        isPositive ? "text-emerald-500" : "text-rose-500"
                      )}
                    >
                      {isPositive ? "+" : ""}
                      {item.changePct.toFixed(2)}%
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
