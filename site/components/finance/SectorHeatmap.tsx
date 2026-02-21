import React from 'react';
import { cn } from '@/lib/utils';

/**
 * @ai-context SectorHeatmap component displays a grid of sectors and their performance.
 * @ai-related AssetAllocationChart.tsx, FinancialsChart.tsx
 */

export interface SectorData {
  sector: string;
  changesPercentage: number;
}

interface SectorHeatmapProps {
  data: SectorData[];
  className?: string;
}

export function SectorHeatmap({ data, className }: SectorHeatmapProps) {
  const maxAbsChange = Math.max(...data.map(d => Math.abs(d.changesPercentage)), 1);

  return (
    <div className={cn("grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3", className)}>
      {data.map((item) => {
        const isPositive = item.changesPercentage >= 0;
        const intensity = Math.min(Math.abs(item.changesPercentage) / maxAbsChange, 1);
        
        // Calculate opacity between 0.2 and 1
        const opacity = 0.2 + (intensity * 0.8);
        
        return (
          <div
            key={item.sector}
            className={cn(
              "flex flex-col items-center justify-center p-4 rounded-xl transition-all hover:scale-[1.02] cursor-pointer glass-card",
              isPositive ? "border-green-500/30" : "border-red-500/30"
            )}
            style={{
              backgroundColor: isPositive 
                ? `rgba(34, 197, 94, ${opacity * 0.3})` 
                : `rgba(239, 68, 68, ${opacity * 0.3})`
            }}
          >
            <span className="text-sm font-medium text-zinc-300 text-center line-clamp-2">
              {item.sector}
            </span>
            <span className={cn(
              "text-lg font-bold mt-1",
              isPositive ? "text-green-400 text-glow-positive" : "text-red-400 text-glow-negative"
            )}>
              {isPositive ? '+' : ''}{item.changesPercentage.toFixed(2)}%
            </span>
          </div>
        );
      })}
    </div>
  );
}
