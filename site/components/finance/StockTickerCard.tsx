/**
 * @ai-context StockTickerCard — compact card showing stock price, change, and optional sparkline.
 * @ai-related PriceDisplay.tsx, GainLossBadge.tsx, SparklineChart.tsx
 */
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { GainLossBadge } from './GainLossBadge';
import { cn } from '@/lib/utils';

interface StockTickerCardProps {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent?: number;
  currency?: string;
  className?: string;
}

export function StockTickerCard({
  symbol,
  name,
  price,
  change,
  changePercent,
  currency = '$',
  className = '',
}: StockTickerCardProps) {
  const pct = changePercent ?? (price - change !== 0 ? (change / (price - change)) * 100 : 0);

  return (
    <Card
      className={cn(
        'w-full overflow-hidden transition-all duration-200 hover:shadow-md hover:border-primary/20 press-scale cursor-pointer',
        className
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-mono text-sm font-bold uppercase tracking-wider text-foreground">
              {symbol}
            </p>
            <p
              className="text-xs text-muted-foreground truncate max-w-[140px]"
              title={name}
            >
              {name}
            </p>
          </div>
          <GainLossBadge value={pct} isPercentage size="sm" />
        </div>
        <div className="mt-3 flex items-end justify-between">
          <span className="text-xl font-bold tabular-nums text-foreground">
            {currency}
            {price.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
          <span
            className={cn(
              'text-xs font-medium tabular-nums',
              change >= 0 ? 'text-positive' : 'text-negative'
            )}
          >
            {change >= 0 ? '+' : ''}
            {currency}
            {Math.abs(change).toFixed(2)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
