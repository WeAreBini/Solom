'use client';

/**
 * @ai-context Compact sparkline chart for inline display in tables and cards.
 * Uses recharts AreaChart with minimal visual chrome.
 */
import { AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts';

interface SparklineChartProps {
  data: number[];
  color?: string;
  height?: number;
  width?: number;
  className?: string;
}

export function SparklineChart({
  data,
  color,
  height = 32,
  width = 80,
  className = '',
}: SparklineChartProps) {
  if (!data || data.length < 2) return null;

  const isPositive = data[data.length - 1] >= data[0];
  const strokeColor = color || (isPositive ? 'hsl(var(--positive))' : 'hsl(var(--negative))');
  const fillColor = color || (isPositive ? 'hsl(var(--positive))' : 'hsl(var(--negative))');

  const chartData = data.map((value, index) => ({ value, index }));
  const min = Math.min(...data);
  const max = Math.max(...data);
  const padding = (max - min) * 0.1 || 1;

  return (
    <div className={className} style={{ width, height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 1, right: 1, bottom: 1, left: 1 }}>
          <YAxis domain={[min - padding, max + padding]} hide />
          <Area
            type="monotone"
            dataKey="value"
            stroke={strokeColor}
            strokeWidth={1.5}
            fill={fillColor}
            fillOpacity={0.1}
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
