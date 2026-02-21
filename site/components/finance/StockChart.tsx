"use client";

/**
 * @ai-context Main StockChart component using recharts for rendering financial data
 * @ai-related app/ticker/[symbol]/page.tsx
 */
import React, { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export interface ChartData {
  time?: string;
  date?: string; // FMP API format
  value?: number;
  open?: number;
  high?: number;
  low?: number;
  close?: number;
}

interface StockChartProps {
  /** The data to display on the chart */
  data: ChartData[];
  /** Additional CSS classes */
  className?: string;
}

export function StockChart({ data, className = '' }: StockChartProps) {
  const formattedData = useMemo(() => {
    return data
      .map((item) => {
        const time = item.time || item.date;
        return {
          time,
          value: item.value !== undefined ? item.value : item.close,
        };
      })
      .sort((a, b) => {
        const timeA = new Date(a.time as string).getTime();
        const timeB = new Date(b.time as string).getTime();
        return timeA - timeB;
      });
  }, [data]);

  const filterId = React.useId();
  const gradientId = React.useId();

  if (!formattedData || formattedData.length === 0) {
    return (
      <div className={`flex items-center justify-center w-full h-full min-h-[300px] bg-black/5 rounded-xl ${className}`}>
        <span className="text-muted-foreground">No chart data available</span>
      </div>
    );
  }

  const isPositive = formattedData[formattedData.length - 1].value! >= formattedData[0].value!;
  const color = isPositive ? 'hsl(var(--positive))' : 'hsl(var(--negative))';

  const min = Math.min(...formattedData.map((d) => d.value!));
  const max = Math.max(...formattedData.map((d) => d.value!));
  const padding = (max - min) * 0.1 || 1;

  return (
    <div className={`w-full h-full min-h-[300px] bg-zinc-950 dark:bg-black rounded-xl p-4 ${className}`}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={formattedData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <filter id={`glow-${filterId}`} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <linearGradient id={`gradient-${gradientId}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
          <XAxis
            dataKey="time"
            tickFormatter={(tick) => {
              const date = new Date(tick);
              return `${date.getMonth() + 1}/${date.getDate()}`;
            }}
            stroke="rgba(255,255,255,0.5)"
            tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            minTickGap={30}
          />
          <YAxis
            domain={[min - padding, max + padding]}
            tickFormatter={(tick) => `$${tick.toFixed(2)}`}
            stroke="rgba(255,255,255,0.5)"
            tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            orientation="right"
            width={60}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                const date = new Date(label);
                return (
                  <div className="bg-zinc-900 border border-zinc-800 p-3 rounded-lg shadow-xl">
                    <p className="text-zinc-400 text-xs mb-1">
                      {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                    <p className="text-white font-mono font-bold text-lg">
                      ${Number(payload[0].value).toFixed(2)}
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            fillOpacity={1}
            fill={`url(#gradient-${gradientId})`}
            style={{ filter: `url(#glow-${filterId})` }}
            activeDot={{ r: 6, fill: color, stroke: '#000', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
