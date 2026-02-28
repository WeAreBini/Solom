"use client";

import { useEffect, useRef, useCallback, useState } from 'react';
import { 
  createChart, 
  ColorType, 
  IChartApi, 
  ISeriesApi,
  LineSeries,
  AreaSeries,
  HistogramSeries,
  Time
} from 'lightweight-charts';

export interface LineDataPoint {
  time: string;
  value: number;
}

interface PriceLineChartProps {
  data: LineDataPoint[];
  symbol?: string;
  height?: number;
  showVolume?: boolean;
  className?: string;
  lineColor?: string;
  lineWidth?: number;
  showArea?: boolean;
  volumeData?: { time: string; value: number; color?: string }[];
}

// Default colors matching the app theme
const CHART_COLORS = {
  lineColor: '#3b82f6', // blue-500
  areaColor: 'rgba(59, 130, 246, 0.1)',
  upColor: '#22c55e', // emerald-500
  downColor: '#ef4444', // red-500
  volumeUpColor: 'rgba(34, 197, 94, 0.5)',
  volumeDownColor: 'rgba(239, 68, 68, 0.5)',
  background: 'transparent',
  gridColor: 'rgba(120, 134, 156, 0.1)',
  textColor: '#9ca3af', // gray-400
};

export function PriceLineChart({
  data,
  symbol,
  height = 400,
  showVolume = false,
  className,
  lineColor = CHART_COLORS.lineColor,
  lineWidth = 2,
  showArea = false,
  volumeData,
}: PriceLineChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const lineSeriesRef = useRef<ISeriesApi<'Line' | 'Area', Time> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram', Time> | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Handle client-side rendering
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Determine trend direction for color
  const getValueColor = useCallback((dataPoints: LineDataPoint[]): string => {
    if (dataPoints.length < 2) return lineColor;
    const firstValue = dataPoints[0].value;
    const lastValue = dataPoints[dataPoints.length - 1].value;
    if (lastValue > firstValue) return CHART_COLORS.upColor;
    if (lastValue < firstValue) return CHART_COLORS.downColor;
    return lineColor;
  }, [lineColor]);

  // Convert data to lightweight-charts format
  const convertData = useCallback((dataPoints: LineDataPoint[]): { time: Time; value: number }[] => {
    return dataPoints.map(point => {
      // Convert date string to timestamp (seconds)
      const timestamp = Math.floor(new Date(point.time).getTime() / 1000) as Time;
      return {
        time: timestamp,
        value: point.value,
      };
    });
  }, []);

  // Initialize chart
  useEffect(() => {
    if (!isClient || !chartContainerRef.current || data.length === 0) return;

    const container = chartContainerRef.current;
    const containerWidth = container.clientWidth;
    const chartLineColor = getValueColor(data);

    // Create chart
    const chart = createChart(container, {
      width: containerWidth,
      height: height,
      layout: {
        background: { type: ColorType.Solid, color: CHART_COLORS.background },
        textColor: CHART_COLORS.textColor,
      },
      grid: {
        vertLines: { color: CHART_COLORS.gridColor },
        horzLines: { color: CHART_COLORS.gridColor },
      },
      crosshair: {
        mode: 1, // CrosshairMode.Normal
      },
      rightPriceScale: {
        borderColor: CHART_COLORS.gridColor,
      },
      timeScale: {
        borderColor: CHART_COLORS.gridColor,
        timeVisible: true,
        secondsVisible: false,
      },
    });

    chartRef.current = chart;

    // Create line or area series based on showArea prop
    if (showArea) {
      const areaSeries = chart.addSeries(AreaSeries, {
        topColor: chartLineColor,
        bottomColor: 'transparent',
        lineColor: chartLineColor,
        lineWidth: lineWidth as 1 | 2 | 3 | 4,
      });
      lineSeriesRef.current = areaSeries;
    } else {
      const lineSeries = chart.addSeries(LineSeries, {
        color: chartLineColor,
        lineWidth: lineWidth as 1 | 2 | 3 | 4,
      });
      lineSeriesRef.current = lineSeries;
    }

    // Create volume series if enabled
    if (showVolume && volumeData && volumeData.length > 0) {
      const volumeSeries = chart.addSeries(HistogramSeries, {
        color: CHART_COLORS.volumeUpColor,
        priceFormat: {
          type: 'volume',
        },
        priceScaleId: 'volume',
      });

      volumeSeriesRef.current = volumeSeries as any;

      // Add separate price scale for volume
      chart.priceScale('volume').applyOptions({
        scaleMargins: {
          top: 0.8,
          bottom: 0,
        },
      });
    }

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
        lineSeriesRef.current = null;
        volumeSeriesRef.current = null;
      }
    };
  }, [isClient, height, showVolume, data, showArea, lineWidth, getValueColor, volumeData]);

  // Update data when it changes
  useEffect(() => {
    if (!isClient || !lineSeriesRef.current || data.length === 0) return;

    const lineData = convertData(data);
    lineSeriesRef.current.setData(lineData);

    // Update volume if available
    if (volumeSeriesRef.current && volumeData && volumeData.length > 0) {
      const volumeSeriesData = volumeData.map(v => ({
        time: Math.floor(new Date(v.time).getTime() / 1000) as Time,
        value: v.value,
        color: v.color,
      }));
      volumeSeriesRef.current.setData(volumeSeriesData);
    }

    // Fit content
    if (chartRef.current) {
      chartRef.current.timeScale().fitContent();
    }
  }, [isClient, data, convertData, volumeData]);

  if (!isClient) {
    return (
      <div 
        className={`flex items-center justify-center bg-muted/20 ${className || ''}`}
        style={{ height }}
      >
        <div className="text-muted-foreground text-sm">Loading chart...</div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div 
        className={`flex items-center justify-center bg-muted/20 ${className || ''}`}
        style={{ height }}
      >
        <div className="text-muted-foreground text-sm">No historical data available</div>
      </div>
    );
  }

  return (
    <div className={className}>
      {symbol && (
        <div className="mb-2 text-sm font-medium text-foreground">
          {symbol} - Price Chart
        </div>
      )}
      <div 
        ref={chartContainerRef} 
        className="w-full"
        style={{ height }}
      />
    </div>
  );
}

export default PriceLineChart;