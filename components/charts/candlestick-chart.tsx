"use client";

import React, { useMemo } from "react";
import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
  CartesianGrid,
} from "recharts";
import { cn } from "@/lib/utils";
import { chartColors, semanticColors } from "@/lib/design-tokens";

// ============================================
// Types
// ============================================

export interface OHLCDataPoint {
  /** Date/time of the data point */
  date: string;
  /** Opening price */
  open: number;
  /** Highest price */
  high: number;
  /** Lowest price */
  low: number;
  /** Closing price */
  close: number;
  /** Trading volume */
  volume?: number;
}

export interface CandlestickChartProps {
  /** OHLC data */
  data: OHLCDataPoint[];
  /** Chart height */
  height?: number;
  /** Show volume bars */
  showVolume?: boolean;
  /** Height of volume section (percentage of total) */
  volumeHeight?: number;
  /** Show grid lines */
  showGrid?: boolean;
  /** Show X axis */
  showXAxis?: boolean;
  /** Show Y axis */
  showYAxis?: boolean;
  /** Color for bullish (up) candles */
  bullishColor?: string;
  /** Color for bearish (down) candles */
  bearishColor?: string;
  /** Show tooltip on hover */
  showTooltip?: boolean;
  /** Animation duration */
  animationDuration?: number;
  /** Custom class name */
  className?: string;
}

interface ChartDataPoint extends OHLCDataPoint {
  /** Whether the candle is bullish */
  isBullish: boolean;
  /** Candle body top */
  bodyTop: number;
  /** Candle body bottom */
  bodyBottom: number;
  /** Candle body height */
  bodyHeight: number;
  /** Candle wick top */
  wickTop: number;
  /** Candle wick bottom */
  wickBottom: number;
}

// ============================================
// Helper Functions
// ============================================

/**
 * Format date for display
 */
function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

/**
 * Format currency value
 */
function formatCurrency(value: number): string {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Format volume value
 */
function formatVolume(value: number): string {
  if (value >= 1e9) {
    return `${(value / 1e9).toFixed(2)}B`;
  }
  if (value >= 1e6) {
    return `${(value / 1e6).toFixed(2)}M`;
  }
  if (value >= 1e3) {
    return `${(value / 1e3).toFixed(2)}K`;
  }
  return value.toFixed(0);
}

// ============================================
// Tooltip Component
// ============================================

function CandlestickTooltip({
  active,
  payload,
}: TooltipProps<number, string>) {
  if (!active || !payload || payload.length === 0) return null;

  const data = (payload[0]?.payload as ChartDataPoint) || {};
  const isBullish = data.isBullish !== undefined ? data.isBullish : (data.close >= data.open);

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-lg dark:border-slate-700 dark:bg-slate-900">
      <p className="mb-2 text-xs font-medium text-slate-500">
        {formatDate(data.date || "")}
      </p>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
        <span className="text-slate-500">Open:</span>
        <span className="font-medium">${formatCurrency(data.open || 0)}</span>
        
        <span className="text-slate-500">High:</span>
        <span className="font-medium">${formatCurrency(data.high || 0)}</span>
        
        <span className="text-slate-500">Low:</span>
        <span className="font-medium">${formatCurrency(data.low || 0)}</span>
        
        <span className="text-slate-500">Close:</span>
        <span className="font-medium">${formatCurrency(data.close || 0)}</span>
        
        {data.volume !== undefined && (
          <>
            <span className="text-slate-500">Volume:</span>
            <span className="font-medium">{formatVolume(data.volume)}</span>
          </>
        )}
      </div>
      <div className="mt-2 flex items-center gap-1 text-xs">
        <span
          className="inline-block h-2 w-2 rounded-full"
          style={{
            backgroundColor: isBullish
              ? semanticColors.positive.DEFAULT
              : semanticColors.negative.DEFAULT,
          }}
        />
        <span
          style={{
            color: isBullish
              ? semanticColors.positive.DEFAULT
              : semanticColors.negative.DEFAULT,
          }}
        >
          {isBullish ? "Bullish" : "Bearish"}
        </span>
      </div>
    </div>
  );
}

// ============================================
// Main Component
// ============================================

/**
 * Candlestick Chart Component
 * 
 * Displays OHLC candlestick data with optional volume bars.
 * Supports responsive sizing and customizable styling.
 */
export function CandlestickChart({
  data,
  height = 300,
  showVolume = true,
  volumeHeight = 0.25,
  showGrid = false,
  showXAxis = false,
  showYAxis = false,
  bullishColor = semanticColors.positive.DEFAULT,
  bearishColor = semanticColors.negative.DEFAULT,
  showTooltip = true,
  className,
}: CandlestickChartProps) {
  // Process data for rendering
  const processedData = useMemo(() => {
    return data.map((point) => ({
      ...point,
      isBullish: point.close >= point.open,
      bodyTop: Math.max(point.open, point.close),
      bodyBottom: Math.min(point.open, point.close),
      bodyHeight: Math.abs(point.close - point.open),
      wickTop: point.high,
      wickBottom: point.low,
    }));
  }, [data]);

  // Calculate price domain
  const [minPrice, maxPrice] = useMemo(() => {
    if (processedData.length === 0) return [0, 100];
    
    const allPrices = processedData.flatMap((d) => [d.high, d.low]);
    const min = Math.min(...allPrices);
    const max = Math.max(...allPrices);
    
    // Add 5% padding
    const padding = (max - min) * 0.05;
    return [min - padding, max + padding];
  }, [processedData]);

  // Calculate volume domain
  const maxVolume = useMemo(() => {
    if (!showVolume || processedData.length === 0) return 0;
    return Math.max(...processedData.map((d) => d.volume || 0));
  }, [processedData, showVolume]);

  return (
    <div className={cn("w-full", className)} style={{ height }}>
      {/* Price Chart */}
      <ResponsiveContainer width="100%" height={showVolume ? "75%" : "100%"}>
        <ComposedChart
          data={processedData}
          margin={{ top: 5, right: 5, bottom: 5, left: 5 }}
        >
          {showGrid && (
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--muted-foreground))"
              strokeOpacity={0.1}
            />
          )}
          
          {showYAxis && (
            <YAxis
              domain={[minPrice, maxPrice]}
              stroke="hsl(var(--muted-foreground))"
              strokeOpacity={0.5}
              tick={{ fontSize: 12 }}
              width={60}
              tickFormatter={(value: number) => `$${value.toFixed(0)}`}
            />
          )}
          
          {showXAxis && (
            <XAxis
              dataKey="date"
              stroke="hsl(var(--muted-foreground))"
              strokeOpacity={0.5}
              tick={{ fontSize: 12 }}
            />
          )}
          
          {showTooltip && <Tooltip content={<CandlestickTooltip />} />}
          
          <Bar dataKey="volume" fill="transparent" />
        </ComposedChart>
      </ResponsiveContainer>

      {/* Volume Chart */}
      {showVolume && maxVolume > 0 && (
        <ResponsiveContainer width="100%" height="25%">
          <ComposedChart
            data={processedData}
            margin={{ top: 2, right: 5, bottom: 2, left: 5 }}
          >
            <XAxis hide />
            <YAxis hide domain={[0, maxVolume * 1.1]} />
            
            {showTooltip && <Tooltip content={<CandlestickTooltip />} />}
          </ComposedChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

// ============================================
// Simple Candlestick Component (SVG-based)
// ============================================

/**
 * Simple SVG-based candlestick chart
 * Lightweight alternative to Recharts for small datasets
 */
export function SimpleCandlestickChart({
  data,
  width,
  height = 200,
  candleWidth = 10,
  bullishColor = "#10b981",
  bearishColor = "#ef4444",
  className,
}: {
  data: OHLCDataPoint[];
  width?: number;
  height?: number;
  candleWidth?: number;
  bullishColor?: string;
  bearishColor?: string;
  className?: string;
}) {
  if (data.length === 0) return null;

  // Calculate bounds
  const allPrices = data.flatMap((d) => [d.high, d.low]);
  const minPrice = Math.min(...allPrices);
  const maxPrice = Math.max(...allPrices);
  const priceRange = maxPrice - minPrice;

  // Scale functions
  const scaleY = (price: number) => {
    return ((maxPrice - price) / priceRange) * height * 0.9 + height * 0.05;
  };

  const candleSpacing = (width || 400) / (data.length + 1);

  return (
    <svg
      className={cn("w-full", className)}
      style={{ height }}
      viewBox={`0 0 ${width || 400} ${height}`}
    >
      {data.map((candle, index) => {
        const x = candleSpacing * (index + 1);
        const isBullish = candle.close >= candle.open;
        const color = isBullish ? bullishColor : bearishColor;

        const highY = scaleY(candle.high);
        const lowY = scaleY(candle.low);
        const openY = scaleY(candle.open);
        const closeY = scaleY(candle.close);

        return (
          <g key={index}>
            {/* Wick */}
            <line
              x1={x}
              y1={highY}
              x2={x}
              y2={lowY}
              stroke={color}
              strokeWidth={1}
            />
            {/* Body */}
            <rect
              x={x - candleWidth / 2}
              y={Math.min(openY, closeY)}
              width={candleWidth}
              height={Math.abs(closeY - openY) || 1}
              fill={isBullish ? color : color}
              stroke={color}
              strokeWidth={1}
            />
          </g>
        );
      })}
    </svg>
  );
}

// ============================================
// Price Bar Component
// ============================================

/**
 * Simple price bar chart for historical prices
 */
export function PriceBarChart({
  data,
  height = 200,
  showGradient = true,
  color,
  className,
}: {
  data: Array<{ date: string; value: number }>;
  height?: number;
  showGradient?: boolean;
  color?: "positive" | "negative" | "neutral";
  className?: string;
}) {
  // Determine color based on price trend
  const computedColor = useMemo(() => {
    if (color) {
      return {
        positive: chartColors.secondary,
        negative: chartColors.quaternary,
        neutral: chartColors.primary,
      }[color];
    }
    
    if (data.length < 2) return chartColors.primary;
    
    const firstValue = data[0].value;
    const lastValue = data[data.length - 1].value;
    
    if (lastValue > firstValue) return chartColors.secondary;
    if (lastValue < firstValue) return chartColors.quaternary;
    return chartColors.primary;
  }, [data, color]);

  const gradientId = `price-bar-gradient-${Math.random().toString(36).slice(2, 9)}`;

  const maxValue = Math.max(...data.map((d) => d.value));
  const barWidth = 100 / data.length;

  return (
    <div className={cn("relative w-full", className)} style={{ height }}>
      <svg className="w-full h-full" preserveAspectRatio="none">
        {showGradient && (
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={computedColor} stopOpacity={0.3} />
              <stop offset="100%" stopColor={computedColor} stopOpacity={0} />
            </linearGradient>
          </defs>
        )}
        
        {data.map((point, index) => {
          const barHeight = (point.value / maxValue) * 100;
          return (
            <rect
              key={index}
              x={`${index * barWidth}%`}
              y={`${100 - barHeight}%`}
              width={`${barWidth - 1}%`}
              height={`${barHeight}%`}
              fill={computedColor}
              opacity={0.8}
            />
          );
        })}
      </svg>
    </div>
  );
}

export default CandlestickChart;