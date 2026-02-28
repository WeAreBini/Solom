'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface MiniSparklineProps {
  data: number[];
  trend?: 'up' | 'down' | 'neutral';
  width?: number;
  height?: number;
  className?: string;
}

const TREND_COLORS = {
  up: {
    stroke: '#10b981',
    fill: 'rgba(16, 185, 129, 0.2)',
  },
  down: {
    stroke: '#ef4444',
    fill: 'rgba(239, 68, 68, 0.2)',
  },
  neutral: {
    stroke: '#64748b',
    fill: 'rgba(100, 116, 139, 0.2)',
  },
};

export function MiniSparkline({
  data,
  trend = 'neutral',
  width = 80,
  height = 32,
  className,
}: MiniSparklineProps) {
  if (data.length < 2) {
    return (
      <div
        className={cn('bg-muted/20 animate-pulse rounded', className)}
        style={{ width, height }}
      />
    );
  }

  const colors = TREND_COLORS[trend];
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  // Calculate points for the sparkline
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((value - min) / range) * height;
    return `${x},${y}`;
  });

  // Calculate path for fill (area under the line)
  const areaPath = `M 0,${height} L ${points.join(' L ')} L ${width},${height} Z`;

  // Calculate path for line
  const linePath = `M ${points.join(' L ')}`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={cn('overflow-visible', className)}
      style={{ width, height }}
    >
      {/* Fill area */}
      <path
        d={areaPath}
        fill={colors.fill}
      />
      {/* Line */}
      <path
        d={linePath}
        fill="none"
        stroke={colors.stroke}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Last point dot */}
      <circle
        cx={width}
        cy={height - ((data[data.length - 1] - min) / range) * height}
        r={3}
        fill={colors.stroke}
      />
    </svg>
  );
}

export default MiniSparkline;