import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * @ai-context PortfolioSummary component for the dashboard.
 * Displays total balance, daily P&L, and a placeholder for an interactive chart.
 * @ai-related app/dashboard/page.tsx
 */

interface PortfolioSummaryProps {
  totalBalance: number;
  dailyPnL: number;
  dailyPnLPct: number;
}

export function PortfolioSummary({
  totalBalance,
  dailyPnL,
  dailyPnLPct,
}: PortfolioSummaryProps) {
  const isPositive = dailyPnL >= 0;

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Total Balance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <div className="text-4xl font-bold tracking-tight">
              ${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div
              className={cn(
                "flex items-center text-sm font-medium",
                isPositive ? "text-emerald-500" : "text-rose-500"
              )}
            >
              {isPositive ? (
                <TrendingUp className="mr-1 h-4 w-4" />
              ) : (
                <TrendingDown className="mr-1 h-4 w-4" />
              )}
              {isPositive ? "+" : "-"}$
              {Math.abs(dailyPnL).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (
              {isPositive ? "+" : ""}
              {dailyPnLPct.toFixed(2)}%) Today
            </div>
          </div>

          {/* Chart Placeholder */}
          <div className="h-[250px] w-full rounded-md border border-dashed border-border bg-muted/20 flex items-center justify-center">
            <span className="text-sm text-muted-foreground">
              Interactive Chart Placeholder
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
