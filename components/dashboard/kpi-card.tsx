"use client";

import React, { useMemo } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MiniSparkline } from "@/components/charts/sparkline";
import {
  semanticColors,
  formatPercentage,
  TrendDirection,
  SizeVariant,
  determineTrend,
} from "@/lib/design-tokens";
import { TrendingUp, TrendingDown, Minus, LucideIcon } from "lucide-react";

export interface KPICardProps {
  /** Label describing the metric */
  label: string;
  /** Primary value to display */
  value: number | string;
  /** Optional sublabel below the main label */
  sublabel?: string;
  /** Percentage change (e.g., 12.5 for +12.5%) */
  change?: number;
  /** Label for the change (e.g., "vs last month") */
  changeLabel?: string;
  /** Trend direction - auto-detected from change if not provided */
  trend?: TrendDirection;
  /** Sparkline data for mini chart */
  sparklineData?: number[];
  /** Optional icon to display */
  icon?: LucideIcon;
  /** Size variant */
  size?: SizeVariant;
  /** Currency code for formatting */
  currency?: string;
  /** Whether to use compact number formatting */
  compact?: boolean;
  /** Whether the card is clickable */
  onClick?: () => void;
  /** Badge text to show in header */
  badge?: string;
  /** Badge variant */
  badgeVariant?: "default" | "success" | "destructive" | "secondary" | "outline";
  /** Loading state */
  isLoading?: boolean;
  /** Error state */
  error?: string;
  /** Additional class name */
  className?: string;
  /** Children for custom content */
  children?: React.ReactNode;
}

/**
 * Format currency value consistently
 */
function formatCurrency(value: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Format large numbers in compact form
 */
function formatCompact(value: number): string {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

/**
 * KPI Card Component
 * 
 * Displays a key performance indicator with optional trend,
 * sparkline chart, and contextual information.
 */
export function KPICard({
  label,
  value,
  sublabel,
  change,
  changeLabel,
  trend,
  sparklineData,
  icon: Icon,
  size = "md",
  currency = "USD",
  compact = false,
  onClick,
  badge,
  badgeVariant = "secondary",
  isLoading = false,
  error,
  className,
  children,
}: KPICardProps) {
  // Determine trend from change if not provided
  const computedTrend = useMemo((): TrendDirection => {
    if (trend) return trend;
    if (typeof change === "number") {
      if (change > 0) return "up";
      if (change < 0) return "down";
    }
    if (sparklineData && sparklineData.length > 1) {
      return determineTrend(sparklineData);
    }
    return "neutral";
  }, [trend, change, sparklineData]);

  // Format value based on type
  const formattedValue = useMemo(() => {
    if (typeof value === "string") return value;
    if (compact) return formatCompact(value);
    return formatCurrency(value, currency);
  }, [value, currency, compact]);

  // Get color for change
  const trendColor = useMemo(() => {
    switch (computedTrend) {
      case "up":
        return semanticColors.positive.DEFAULT;
      case "down":
        return semanticColors.negative.DEFAULT;
      default:
        return semanticColors.neutral.DEFAULT;
    }
  }, [computedTrend]);

  // Size classes
  const sizeClasses = {
    sm: {
      padding: "p-3",
      title: "text-xs",
      value: "text-lg font-bold",
    },
    md: {
      padding: "p-4",
      title: "text-sm",
      value: "text-xl font-bold",
    },
    lg: {
      padding: "p-6",
      title: "text-base",
      value: "text-2xl font-bold",
    },
    xl: {
      padding: "p-8",
      title: "text-lg",
      value: "text-3xl font-bold",
    },
  };

  // Trend icons
  const TrendIcon = useMemo(() => {
    switch (computedTrend) {
      case "up":
        return TrendingUp;
      case "down":
        return TrendingDown;
      default:
        return Minus;
    }
  }, [computedTrend]);

  // Loading skeleton
  if (isLoading) {
    return <KPICardSkeleton size={size} />;
  }

  // Error state
  if (error) {
    return (
      <Card className={cn("border-destructive/50", className)}>
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <p className="text-sm text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all duration-200",
        onClick && "cursor-pointer hover:shadow-lg hover:border-primary/30",
        className
      )}
      onClick={onClick}
    >
      {/* Header with label and optional badge */}
      <CardHeader className={cn("flex flex-row items-center justify-between space-y-0 pb-2", sizeClasses[size].padding)}>
        <div className="flex items-center gap-2">
          {Icon && (
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Icon className="h-4 w-4 text-primary" />
            </div>
          )}
          <CardTitle className={sizeClasses[size].title + " font-medium text-muted-foreground"}>
            {label}
          </CardTitle>
        </div>
        {badge && (
          <Badge variant={badgeVariant}>
            {badge}
          </Badge>
        )}
      </CardHeader>

      {/* Main content */}
      <CardContent className={sizeClasses[size].padding}>
        <div className="flex flex-col gap-2">
          {/* Value row */}
          <div className="flex items-end justify-between">
            <div className="flex flex-col">
              {/* Main value with currency formatting */}
              <div className={cn("tabular-nums", sizeClasses[size].value)}>
                {formattedValue}
              </div>
              
              {/* Sublabel */}
              {sublabel && (
                <p className="text-xs text-muted-foreground mt-1">{sublabel}</p>
              )}
            </div>

            {/* Trend indicator */}
            {typeof change === "number" && (
              <div className="flex flex-col items-end">
                <div
                  className="flex items-center gap-1"
                  style={{ color: trendColor }}
                >
                  <TrendIcon className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    {formatPercentage(Math.abs(change))}
                  </span>
                </div>
                {changeLabel && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {changeLabel}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Sparkline if data provided */}
          {sparklineData && sparklineData.length > 1 && (
            <div className="mt-2">
              <MiniSparkline
                data={sparklineData}
                trend={computedTrend}
              />
            </div>
          )}

          {/* Custom children */}
          {children}
        </div>
      </CardContent>

      {/* Decorative gradient based on trend */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1 opacity-20"
        style={{
          background: `linear-gradient(90deg, ${trendColor}, transparent)`,
        }}
      />
    </Card>
  );
}

/**
 * KPI Card Skeleton for loading states
 */
export function KPICardSkeleton({ size = "md" }: { size?: SizeVariant }) {
  const paddingClass = {
    sm: "p-3",
    md: "p-4",
    lg: "p-6",
    xl: "p-8",
  }[size];

  return (
    <Card className="animate-pulse">
      <CardHeader className={cn("flex flex-row items-center justify-between space-y-0 pb-2", paddingClass)}>
        <div className="h-4 w-24 rounded bg-muted" />
        <div className="h-5 w-12 rounded bg-muted" />
      </CardHeader>
      <CardContent className={paddingClass}>
        <div className="flex flex-col gap-2">
          <div className="h-8 w-32 rounded bg-muted" />
          <div className="h-4 w-20 rounded bg-muted" />
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Grid of KPI Cards
 */
export interface KPIGridProps {
  cards: Array<KPICardProps>;
  /** Number of columns - uses Tailwind responsive classes */
  columns?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  /** Gap between cards */
  gap?: "sm" | "md" | "lg";
  className?: string;
}

export function KPIGrid({
  cards,
  gap = "md",
  className,
}: KPIGridProps) {
  const gapClass = {
    sm: "gap-2",
    md: "gap-4",
    lg: "gap-6",
  }[gap];

  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4", gapClass, className)}>
      {cards.map((card, index) => (
        <KPICard key={index} {...card} />
      ))}
    </div>
  );
}

/**
 * Mini KPI Stat for inline display
 */
export interface MiniKPIStatProps {
  label: string;
  value: number | string;
  change?: number;
  trend?: TrendDirection;
  size?: "sm" | "md";
  className?: string;
}

export function MiniKPIStat({
  label,
  value,
  change,
  trend = "neutral",
  size = "md",
  className,
}: MiniKPIStatProps) {
  const trendColor = useMemo(() => {
    if (change !== undefined) {
      if (change > 0) return semanticColors.positive.DEFAULT;
      if (change < 0) return semanticColors.negative.DEFAULT;
    }
    return semanticColors.neutral.DEFAULT;
  }, [change]);

  const TrendIcon = useMemo(() => {
    if (change !== undefined) {
      if (change > 0) return TrendingUp;
      if (change < 0) return TrendingDown;
    }
    return Minus;
  }, [change]);

  const sizeClass = {
    sm: "text-xs",
    md: "text-sm",
  }[size];

  return (
    <div className={cn("flex flex-col", className)}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="flex items-center gap-2">
        <span className={cn("font-semibold", sizeClass)}>{value}</span>
        {change !== undefined && (
          <div
            className="flex items-center gap-0.5"
            style={{ color: trendColor }}
          >
            <TrendIcon className="h-3 w-3" />
            <span className="text-xs">{formatPercentage(Math.abs(change))}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default KPICard;