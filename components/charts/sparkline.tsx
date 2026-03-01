"use client";

import React, { useMemo } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip } from "recharts";
import { cn } from "@/lib/utils";
import { chartColors } from "@/lib/design-tokens";

export interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  trend?: "up" | "down" | "neutral";
  showGradient?: boolean;
  showTooltip?: boolean;
  className?: string;
  showDots?: boolean;
}

interface ChartDataPoint {
  value: number;
  index: number;
}

export function Sparkline({
  data,
  width = 100,
  height = 40,
  trend = "neutral",
  showGradient = true,
  showTooltip = true,
  className,
  showDots = false,
}: SparklineProps) {
  if (!data || data.length === 0) {
    return (
      <div className={cn("flex items-center justify-center", className)} style={{ width, height }}>
        <span className="text-xs text-muted-foreground">No data</span>
      </div>
    );
  }

  const chartData: ChartDataPoint[] = useMemo(
    () => data.map((value, index) => ({ value, index })),
    [data]
  );

  const colors = {
    up: { stroke: chartColors.secondary, fill: chartColors.secondary },
    down: { stroke: chartColors.quaternary, fill: chartColors.quaternary },
    neutral: { stroke: chartColors.neutral, fill: chartColors.neutral },
  };

  const computedTrend = useMemo(() => {
    if (trend !== "neutral") return trend;
    if (data.length < 2) return "neutral";
    const first = data[0];
    const last = data[data.length - 1];
    if (last > first) return "up";
    if (last < first) return "down";
    return "neutral";
  }, [data, trend]);

  const { stroke, fill } = colors[computedTrend];

  const gradientId = useMemo(
    () => `sparkline-gradient-${Math.random().toString(36).slice(2, 9)}`,
    []
  );

  return (
    <div className={cn("sparkline-container", className)} style={{ width, height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
          {showGradient && (
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={fill} stopOpacity={0.3} />
                <stop offset="100%" stopColor={fill} stopOpacity={0} />
              </linearGradient>
            </defs>
          )}
          <Area
            type="monotone"
            dataKey="value"
            stroke={stroke}
            strokeWidth={1.5}
            fill={showGradient ? `url(#${gradientId})` : fill}
            fillOpacity={showGradient ? 1 : 0.1}
            dot={showDots}
            isAnimationActive={true}
            animationDuration={300}
          />
          {showTooltip && <Tooltip content={<CustomTooltip />} />}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ value?: number }> }) {
  if (!active || !payload || payload.length === 0) return null;
  const value = payload[0].value as number;
  return (
    <div className="rounded-md bg-slate-900 px-2 py-1 text-xs text-white shadow-lg">
      {value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
    </div>
  );
}

export function MiniSparkline({
  data,
  trend,
  className,
}: {
  data: number[];
  trend?: "up" | "down" | "neutral";
  className?: string;
}) {
  return (
    <Sparkline
      data={data}
      width={80}
      height={24}
      trend={trend}
      showGradient={true}
      showTooltip={false}
      className={className}
    />
  );
}