/**
 * @ai-context PriceDisplay — formatted currency value with optional animated change display.
 * @ai-related GainLossBadge.tsx, AnimatedNumber.tsx
 */
import React from 'react';
import { GainLossBadge } from './GainLossBadge';
import { cn } from '@/lib/utils';

interface PriceDisplayProps {
  price: number;
  currency?: string;
  previousPrice?: number;
  className?: string;
  priceClassName?: string;
  compact?: boolean;
}

export function PriceDisplay({
  price,
  currency = '$',
  previousPrice,
  className = '',
  priceClassName = '',
  compact = false,
}: PriceDisplayProps) {
  const formattedPrice = price.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const change = previousPrice !== undefined ? price - previousPrice : undefined;
  const changePercentage =
    previousPrice !== undefined && previousPrice !== 0
      ? (change! / previousPrice) * 100
      : undefined;

  return (
    <div className={cn('flex items-baseline gap-2', className)}>
      <span
        className={cn(
          'font-bold tracking-tight text-foreground tabular-nums',
          compact ? 'text-lg' : 'text-2xl',
          priceClassName
        )}
      >
        {currency}
        {formattedPrice}
      </span>
      {change !== undefined && changePercentage !== undefined && (
        <div className="flex items-center gap-1">
          <GainLossBadge value={change} size={compact ? 'sm' : 'md'} />
          <GainLossBadge value={changePercentage} isPercentage size={compact ? 'sm' : 'md'} />
        </div>
      )}
    </div>
  );
}
