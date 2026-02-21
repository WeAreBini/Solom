"use client";

/**
 * @ai-context Compact sparkline chart for inline display in tables and cards.
 * Uses recharts LineChart with glowing effects and minimal visual chrome.
 */
import React from 'react';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';

interface SparklineProps {
  data: number[];
  width?: number | string;
  height?: number | string;
  className?: string;
}

export function Sparkline({
  data,
  width = 100,
  height = 40,
  className = '',
}: SparklineProps) {
  // Generate a unique ID for the glow filter to avoid conflicts if multiple sparklines are rendered
  const filterId = React.useId();

  if (!data || data.length < 2) return null;

  const isPositive = data[data.length - 1] >= data[0];
  const color = isPositive ? 'hsl(var(--positive))' : 'hsl(var(--negative))';

  const chartData = data.map((value, index) => ({ value, index }));
  const min = Math.min(...data);
  const max = Math.max(...data);
  const padding = (max - min) * 0.1 || 1;

  return (
    <div className={className} style={{ width, height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
          <defs>
            <filter id={`glow-${filterId}`} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          <YAxis domain={[min - padding, max + padding]} hide />
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={false}
            isAnimationActive={true}
            style={{ filter: `url(#glow-${filterId})` }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
