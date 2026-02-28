"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export type TrendDirection = "up" | "down" | "neutral";
export type SizeVariant = "sm" | "md" | "lg" | "xl";

export interface KPICardProps {
  label: string;
  value: string | number;
  subLabel?: string;
  change?: number;
  changeLabel?: string;
  trend?: TrendDirection;
  sparklineData?: number[];
  icon?: React.ReactNode;
  variant?: "default" | "compact" | "large" | "minimal";
  isLoading?: boolean;
  onClick?: () => void;
  className?: string;
}

const kpiCardVariants = {
  default: { padding: "p-6", valueSize: "text-2xl" },
  compact: { padding: "p-4", valueSize: "text-xl" },
  large: { padding: "p-8", valueSize: "text-4xl" },
  minimal: { padding: "p-3", valueSize: "text-lg" },
} as const;

export function KPICard({
  label,
  value,
  subLabel,
  change,
  changeLabel,
  trend,
  sparklineData,
  icon,
  variant = "default",
  isLoading = false,
  onClick,
  className,
}: KPICardProps) {
  const computedTrend: TrendDirection = React.useMemo(() => {
    if (trend) return trend;
    if (change === undefined || change === 0) return "neutral";
    return change > 0 ? "up" : "down";
  }, [change, trend]);

  const valueSize = kpiCardVariants[variant].valueSize;

  if (isLoading) {
    return <KPICardSkeleton variant={variant} />;
  }

  return (
    <Card
      className={cn(
        kpiCardVariants[variant].padding,
        "transition-all duration-200",
        "hover:shadow-lg hover:border-muted-foreground/20",
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-0 space-y-3">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>

        <div className="flex items-end justify-between">
          <div className="flex items-baseline gap-1">
            {icon && <span className="mr-2 h-5 w-5 shrink-0 text-muted-foreground">{icon}</span>}
            <span
              className={cn(
                "font-bold tabular-nums tracking-tight",
                valueSize,
                computedTrend === "up" && "text-emerald-600 dark:text-emerald-400",
                computedTrend === "down" && "text-red-600 dark:text-red-400"
              )}
            >
              {value}
            </span>
          </div>

          {change !== undefined && (
            <Badge variant={computedTrend === "up" ? "success" : computedTrend === "down" ? "destructive" : "secondary"} className="font-mono text-xs">
              <span className="flex items-center gap-0.5">
                {computedTrend === "up" && <TrendingUp className="h-3 w-3" />}
                {computedTrend === "down" && <TrendingDown className="h-3 w-3" />}
                {computedTrend === "neutral" && <Minus className="h-3 w-3" />}
                <span>
                  {change >= 0 ? "+" : ""}
                  {change.toFixed(2)}%
                </span>
              </span>
            </Badge>
          )}
        </div>

        {subLabel && <p className="text-xs text-muted-foreground/70">{subLabel}</p>}
        {changeLabel && <p className="text-xs text-muted-foreground/70">{changeLabel}</p>}

        {sparklineData && sparklineData.length > 1 && <SparklineBars data={sparklineData} trend={computedTrend} />}
      </CardContent>
    </Card>
  );
}

export interface KPICardGridProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
}

export function KPICardGrid({ children, columns = 4, className }: KPICardGridProps) {
  return (
    <div
      className={cn(
        "grid gap-4",
        columns === 2 && "grid-cols-1 sm:grid-cols-2",
        columns === 3 && "grid-cols-1 sm:grid-cols-2 md:grid-cols-3",
        columns === 4 && "grid-cols-1 sm:grid-cols-2 md:grid-cols-4"
      )}
    >
      {children}
    </div>
  );
}

export function KPICardSkeleton({ variant = "default" }: { variant?: "default" | "compact" | "large" | "minimal" }) {
  return (
    <Card className={kpiCardVariants[variant].padding}>
      <CardContent className="p-0 space-y-3">
        <div className="h-4 w-24 rounded bg-muted animate-pulse" />
        <div className="flex items-end justify-between">
          <div className={cn("h-8 w-32 rounded bg-muted animate-pulse", variant === "large" && "h-12 w-40")} />
          <div className="h-5 w-16 rounded bg-muted animate-pulse" />
        </div>
        {variant !== "minimal" && <div className="h-2 w-20 rounded bg-muted animate-pulse" />}
      </CardContent>
    </Card>
  );
}

export interface KPIGroupProps {
  kpis: Array<{
    label: string;
    value: string | number;
    change?: number;
    changeLabel?: string;
    trend?: TrendDirection;
    sparklineData?: number[];
    icon?: React.ReactNode;
    onClick?: () => void;
  }>;
  columns?: 2 | 3 | 4;
  isLoading?: boolean;
  error?: Error | null;
  variant?: "default" | "compact" | "large" | "minimal";
}

export function KPIGroup({ kpis, columns = 4, isLoading, error, variant = "default" }: KPIGroupProps) {
  if (error) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-center text-destructive">
        Failed to load KPI data. Please try again.
      </div>
    );
  }

  return (
    <KPICardGrid columns={columns}>
      {isLoading
        ? Array.from({ length: kpis.length || 4 }).map((_, i) => <KPICardSkeleton key={i} variant={variant} />)
        : kpis.map((kpi) => (
            <KPICard
              key={kpi.label}
              label={kpi.label}
              value={kpi.value}
              change={kpi.change}
              changeLabel={kpi.changeLabel}
              trend={kpi.trend}
              sparklineData={kpi.sparklineData}
              icon={kpi.icon}
              variant={variant}
              onClick={kpi.onClick}
            />
          ))}
    </KPICardGrid>
  );
}

function SparklineBars({ data, trend }: { data: number[]; trend: TrendDirection }) {
  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  return (
    <div className="flex h-8 w-full items-end gap-[2px]">
      {data.map((value, index) => {
        const height = ((value - min) / range) * 100;
        const barColor = trend === "up" ? "bg-emerald-500" : trend === "down" ? "bg-red-500" : "bg-slate-400";
        return <div key={index} className={cn("w-[3px] rounded-t opacity-60 transition-all", barColor)} style={{ height: `${Math.max(height, 5)}%` }} />;
      })}
    </div>
  );
}

export default KPICard;