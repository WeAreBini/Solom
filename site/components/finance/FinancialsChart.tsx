"use client";

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';

/**
 * @ai-context FinancialsChart component displays a bar chart of revenue vs net income over time.
 * @ai-related SectorHeatmap.tsx, AssetAllocationChart.tsx
 */

export interface FinancialData {
  date: string;
  revenue: number;
  netIncome: number;
}

interface FinancialsChartProps {
  data: FinancialData[];
  className?: string;
}

export function FinancialsChart({ data, className }: FinancialsChartProps) {
  const formatYAxis = (value: number) => {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(1)}K`;
    return `$${value}`;
  };

  return (
    <div className={cn("w-full h-[350px] glass-card rounded-xl p-4", className)}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
          <XAxis 
            dataKey="date" 
            stroke="#a1a1aa" 
            fontSize={12}
            tickLine={false}
            axisLine={false}
            dy={10}
          />
          <YAxis 
            stroke="#a1a1aa" 
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={formatYAxis}
            dx={-10}
          />
          <Tooltip
            cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
            contentStyle={{ 
              backgroundColor: 'rgba(9, 9, 11, 0.9)', 
              borderColor: 'rgba(39, 39, 42, 0.8)',
              borderRadius: '8px',
              color: '#fff',
              boxShadow: '0 0 15px rgba(0,0,0,0.5)'
            }}
            formatter={(value: number) => [formatYAxis(value), undefined]}
          />
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="circle"
          />
          <Bar 
            dataKey="revenue" 
            name="Revenue" 
            fill="#3b82f6" 
            radius={[4, 4, 0, 0]} 
            maxBarSize={50}
          />
          <Bar 
            dataKey="netIncome" 
            name="Net Income" 
            fill="#10b981" 
            radius={[4, 4, 0, 0]} 
            maxBarSize={50}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
