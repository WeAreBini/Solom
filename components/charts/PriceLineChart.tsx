'use client';

import React, { useMemo } from 'react';
import { Line, Area } from 'recharts';
import {
  ComposedChart,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Bar,
} from 'recharts';
import { cn } from '@/lib/utils';

export interface PriceLineChartProps {
  data: Array<{
    date: string | number;
    price: number;
    volume?: number;
  }>;
  height?: number;
  showVolume?: boolean;
  color?: 'positive' | 'negative' | 'neutral';
  showGradient?: boolean;
  className?: string;
}

const COLORS = {
  positive: {
    line: '#10b981',
    gradient: 'rgba(16, 185, 129, 0.3)',
    volume: 'rgba(16, 185, 129, 0.5)',
  },
  negative: {
    line: '#ef4444',
    gradient: 'rgba(239, 68, 68, 0.3)',
    volume: 'rgba(239, 68, 68, 0.5)',
  },
  neutral: {
    line: '#2563eb',
    gradient: 'rgba(37, 99, 235, 0.3)',
    volume: 'rgba(37, 99, 235, 0.5)',
  },
};

export function PriceLineChart({
  data,
  height = 200,
  showVolume = false,
  color = 'neutral',
  showGradient = false,
  className,
}: PriceLineChartProps) {
  const colors = COLORS[color];

  // Format data for recharts
  const chartData = useMemo(() => {
    return data.map((d) => ({
      date: typeof d.date === 'string' ? d.date : new Date(d.date * 1000).toLocaleDateString(),
      price: d.price,
      volume: d.volume ?? 0,
    }));
  }, [data]);

  // Calculate price range
  const { minPrice, maxPrice } = useMemo(() => {
    const prices = chartData.map((d) => d.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const padding = (max - min) * 0.1;
    return { minPrice: min - padding, maxPrice: max + padding };
  }, [chartData]);

  // Calculate max volume for scaling
  const maxVolume = useMemo(() => {
    if (!showVolume) return 0;
    return Math.max(...chartData.map((d) => d.volume)) || 1;
  }, [chartData, showVolume]);

  if (chartData.length === 0) {
    return (
      <div
        className={cn('flex items-center justify-center text-muted-foreground', className)}
        style={{ height }}
      >
        No data available
      </div>
    );
  }

  return (
    <div className={cn('w-full', className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={colors.gradient} stopOpacity={0.8} />
              <stop offset="100%" stopColor={colors.gradient} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: '#94a3b8' }}
            tickFormatter={(value) => {
              // Show fewer ticks
              const parts = value.split('/');
              return parts.length >= 2 ? `${parts[0]}/${parts[1]}` : value;
            }}
            interval="preserveStartEnd"
          />
          <YAxis
            yAxisId="price"
            domain={[minPrice, maxPrice]}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: '#94a3b8' }}
            tickFormatter={(value) => `$${value.toFixed(0)}`}
            width={45}
          />
          {showVolume && (
            <YAxis
              yAxisId="volume"
              domain={[0, maxVolume * 1.1]}
              orientation="right"
              hide
            />
          )}
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
            labelStyle={{ color: 'hsl(var(--foreground))' }}
            itemStyle={{ color: 'hsl(var(--foreground))' }}
            formatter={(value: number, name: string) => {
              if (name === 'price') return [`$${value.toFixed(2)}`, 'Price'];
              if (name === 'volume') return [value.toLocaleString(), 'Volume'];
              return [value, name];
            }}
          />
          {showVolume && (
            <Bar
              yAxisId="volume"
              dataKey="volume"
              fill={colors.volume}
              opacity={0.5}
              barSize={4}
            />
          )}
          {showGradient ? (
            <Area
              yAxisId="price"
              type="monotone"
              dataKey="price"
              stroke={colors.line}
              fill="url(#priceGradient)"
              strokeWidth={2}
            />
          ) : (
            <Line
              yAxisId="price"
              type="monotone"
              dataKey="price"
              stroke={colors.line}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: colors.line }}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

export default PriceLineChart;