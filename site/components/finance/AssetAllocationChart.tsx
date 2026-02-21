"use client";

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { cn } from '@/lib/utils';

/**
 * @ai-context AssetAllocationChart component displays a donut chart of portfolio allocation.
 * @ai-related SectorHeatmap.tsx, FinancialsChart.tsx
 */

export interface AllocationData {
  name: string;
  value: number;
}

interface AssetAllocationChartProps {
  data: AllocationData[];
  className?: string;
}

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981', '#06b6d4'];

export function AssetAllocationChart({ data, className }: AssetAllocationChartProps) {
  return (
    <div className={cn("w-full h-[300px] glass-card rounded-xl p-4", className)}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(9, 9, 11, 0.9)', 
              borderColor: 'rgba(39, 39, 42, 0.8)',
              borderRadius: '8px',
              color: '#fff',
              boxShadow: '0 0 15px rgba(0,0,0,0.5)'
            }}
            itemStyle={{ color: '#fff' }}
            formatter={(value: number) => [`${value.toFixed(2)}%`, 'Allocation']}
          />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            iconType="circle"
            wrapperStyle={{ fontSize: '12px', color: '#a1a1aa' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
