"use client";

import React, { useMemo } from "react";
import { LineChart as RechartsLineChart, Line, ResponsiveContainer, Area, AreaChart, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { cn } from "@/lib/utils";
import { chartColors } from "@/lib/design-tokens";

export interface LineChartProps {
  data: Record<string, unknown>[];
  xKey: string;
  yKeys: string[];
  height?: number;
  showGrid?: boolean;
  showXAxis?: boolean;
  showYAxis?: boolean;
  showDots?: boolean;
  lineWidth?: number;
  showArea?: boolean;
  colors?: string[];
  className?: string;
  isAnimationActive?: boolean;
}

export interface PriceLineChartProps {
  data: Array<{ date: string; price: number; volume?: number }>;
  height?: number;
  showVolume?: boolean;
  color?: "positive" | "negative" | "neutral";
  showGradient?: boolean;
  className?: string;
  isAnimationActive?: boolean;
}

export function LineChart({
  data,
  xKey,
  yKeys,
  height = 300,
  showGrid = false,
  showXAxis = false,
  showYAxis = false,
  showDots = true,
  lineWidth = 2,
  showArea = false,
  colors = [chartColors.primary, chartColors.secondary, chartColors.tertiary],
  isAnimationActive = true,
  className,
}: LineChartProps) {
  const gradientId = useMemo(
    () => `chart-gradient-${Math.random().toString(36).slice(2, 9)}`,
    []
  );

  const ChartComponent = showArea ? AreaChart : RechartsLineChart;

  return (
    <div className={cn("w-full", className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <ChartComponent data={data} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
          {showArea && (
            <defs>
              {yKeys.map((key, index) => (
                <linearGradient key={key} id={`${gradientId}-${index}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={colors[index % colors.length]} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={colors[index % colors.length]} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
          )}

          {showGrid && (
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground))" strokeOpacity={0.1} />
          )}

          {showXAxis && (
            <XAxis
              dataKey={xKey}
              stroke="hsl(var(--muted-foreground))"
              strokeOpacity={0.5}
              tick={{ fontSize: 12 }}
            />
          )}

          {showYAxis && (
            <YAxis stroke="hsl(var(--muted-foreground))" strokeOpacity={0.5} tick={{ fontSize: 12 }} width={60} />
          )}

          <Tooltip content={<DefaultTooltip />} isAnimationActive={isAnimationActive} />

          {yKeys.map((key, index) => {
            const color = colors[index % colors.length];
            if (showArea) {
              return (
                <Area
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={color}
                  strokeWidth={lineWidth}
                  fill={`url(#${gradientId}-${index})`}
                  fillOpacity={1}
                  dot={showDots}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                  isAnimationActive={isAnimationActive}
                  animationDuration={300}
                />
              );
            }
            return (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={color}
                strokeWidth={lineWidth}
                dot={showDots}
                activeDot={{ r: 6, strokeWidth: 0 }}
                isAnimationActive={isAnimationActive}
                animationDuration={300}
              />
            );
          })}
        </ChartComponent>
      </ResponsiveContainer>
    </div>
  );
}

export function PriceLineChart({
  data,
  height = 300,
  showVolume = false,
  color,
  showGradient = true,
  isAnimationActive = true,
  className,
}: PriceLineChartProps) {
  const computedColor = useMemo((): "positive" | "negative" | "neutral" => {
    if (color) return color;
    if (data.length < 2) return "neutral";
    const firstPrice = data[0].price;
    const lastPrice = data[data.length - 1].price;
    if (lastPrice > firstPrice) return "positive";
    if (lastPrice < firstPrice) return "negative";
    return "neutral";
  }, [data, color]);

  const strokeColor = {
    positive: chartColors.secondary,
    negative: chartColors.quaternary,
    neutral: chartColors.primary,
  }[computedColor];

  const gradientId = useMemo(() => `price-gradient-${Math.random().toString(36).slice(2, 9)}`, []);

  return (
    <div className={cn("w-full", className)}>
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
            {showGradient && (
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={strokeColor} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={strokeColor} stopOpacity={0} />
                </linearGradient>
              </defs>
            )}

            <Area
              type="monotone"
              dataKey="price"
              stroke={strokeColor}
              strokeWidth={2}
              fill={showGradient ? `url(#${gradientId})` : strokeColor}
              fillOpacity={showGradient ? 1 : 0.1}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
              isAnimationActive={isAnimationActive}
              animationDuration={300}
            />

            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || payload.length === 0) return null;
                const point = payload[0].payload as { date: string; price: number; volume?: number };
                return (
                  <div className="rounded-lg bg-slate-900 px-3 py-2 text-white shadow-lg">
                    <p className="text-xs text-slate-300">{new Date(point.date).toLocaleDateString()}</p>
                    <p className="text-lg font-bold">${point.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                    {point.volume !== undefined && <p className="text-xs text-slate-400">Vol: {(point.volume / 1e6).toFixed(2)}M</p>}
                  </div>
                );
              }}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {showVolume && data.length > 0 && data[0].volume !== undefined && (
        <div className="flex h-[40px] items-end justify-stretch gap-[1px]">
          {data.slice(-30).map((point, index) => {
            const slicedData = data.slice(-30);
            const prevPrice = index > 0 ? slicedData[index - 1].price : point.price;
            const isUp = point.price >= prevPrice;
            const maxVolume = Math.max(...slicedData.map((d) => d.volume || 0));
            return (
              <div
                key={index}
                className={cn("flex-1 rounded-t", isUp ? "bg-emerald-500/40" : "bg-red-500/40")}
                style={{ height: `${Math.max(((point.volume || 0) / maxVolume) * 100, 2)}%` }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

export function MiniLineChart({
  data,
  dataKey = "value",
  height = 40,
  color = chartColors.primary,
  className,
}: {
  data: Array<{ [key: string]: number | string }>;
  dataKey?: string;
  height?: number;
  color?: string;
  className?: string;
}) {
  return (
    <div className={cn("w-full", className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 2, right: 0, bottom: 2, left: 0 }}>
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={1.5}
            fill={color}
            fillOpacity={0.1}
            dot={false}
            isAnimationActive={true}
            animationDuration={300}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function DefaultTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name?: string; value?: number | string }>; label?: string }) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="rounded-lg bg-slate-900 px-3 py-2 text-white shadow-lg">
      {label && <p className="text-xs text-slate-300 mb-1">{label}</p>}
      {payload.map((entry, index) => (
        <p key={index} className="text-sm">
          <span className="text-slate-400">{entry.name}: </span>
          <span className="font-semibold">
            {typeof entry.value === "number" ? entry.value.toLocaleString(undefined, { minimumFractionDigits: 2 }) : entry.value}
          </span>
        </p>
      ))}
    </div>
  );
}