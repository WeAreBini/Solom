import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * @ai-context Displays key financial statistics for a given stock quote.
 * @ai-related app/trade/page.tsx, app/actions/fmp.ts
 */

interface Quote {
  open?: number;
  dayHigh?: number;
  dayLow?: number;
  yearHigh?: number;
  yearLow?: number;
  volume?: number;
  avgVolume?: number;
  marketCap?: number;
  pe?: number;
  eps?: number;
}

interface KeyStatisticsProps {
  quote: Quote;
}

export function KeyStatistics({ quote }: KeyStatisticsProps) {
  const formatCurrency = (value?: number) => {
    if (value === undefined || value === null) return "-";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  };

  const formatNumber = (value?: number) => {
    if (value === undefined || value === null) return "-";
    return new Intl.NumberFormat("en-US", {
      notation: "compact",
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatRatio = (value?: number) => {
    if (value === undefined || value === null) return "-";
    return value.toFixed(2);
  };

  const stats = [
    { label: "Open", value: formatCurrency(quote.open) },
    { label: "High", value: formatCurrency(quote.dayHigh) },
    { label: "Low", value: formatCurrency(quote.dayLow) },
    { label: "52 Wk High", value: formatCurrency(quote.yearHigh) },
    { label: "52 Wk Low", value: formatCurrency(quote.yearLow) },
    { label: "Volume", value: formatNumber(quote.volume) },
    { label: "Avg Volume", value: formatNumber(quote.avgVolume) },
    { label: "Market Cap", value: formatNumber(quote.marketCap) },
    { label: "P/E Ratio", value: formatRatio(quote.pe) },
    { label: "EPS", value: formatCurrency(quote.eps) },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Key Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col">
              <span className="text-xs text-muted-foreground">{stat.label}</span>
              <span className="text-sm font-medium">{stat.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
