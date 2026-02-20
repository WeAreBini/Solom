/**
 * @ai-context GainLossBadge — displays positive/negative financial changes with semantic colors.
 * Uses design system tokens: positive/negative from CSS variables.
 * @ai-related PriceDisplay.tsx, StockTickerCard.tsx
 */
import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GainLossBadgeProps {
  value: number;
  isPercentage?: boolean;
  className?: string;
  showIcon?: boolean;
  size?: 'sm' | 'md';
}

export function GainLossBadge({
  value,
  isPercentage = false,
  className = '',
  showIcon = true,
  size = 'md',
}: GainLossBadgeProps) {
  const isPositive = value > 0;
  const isNegative = value < 0;

  const formattedValue = Math.abs(value).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const displayValue = `${formattedValue}${isPercentage ? '%' : ''}`;

  const iconSize = size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 font-medium tabular-nums w-fit',
        size === 'sm' ? 'text-xs' : 'text-xs',
        isPositive && 'border-positive/20 bg-positive/10 text-positive',
        isNegative && 'border-negative/20 bg-negative/10 text-negative',
        !isPositive && !isNegative && 'border-border bg-muted/50 text-muted-foreground',
        className
      )}
    >
      {showIcon && isPositive && <TrendingUp className={iconSize} />}
      {showIcon && isNegative && <TrendingDown className={iconSize} />}
      {showIcon && !isPositive && !isNegative && <Minus className={iconSize} />}
      <span>
        {isPositive ? '+' : isNegative ? '-' : ''}
        {displayValue}
      </span>
    </span>
  );
}
