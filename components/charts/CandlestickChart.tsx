"use client";

import { useEffect, useRef, useCallback, useState } from 'react';
import { 
  createChart, 
  ColorType, 
  IChartApi, 
  ISeriesApi,
  CandlestickSeries,
  HistogramSeries,
  Time
} from 'lightweight-charts';

export interface CandlestickDataPoint {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

interface CandlestickChartProps {
  data: CandlestickDataPoint[];
  symbol?: string;
  height?: number;
  showVolume?: boolean;
  className?: string;
}

// Default colors matching the app theme
const CHART_COLORS = {
  upColor: '#22c55e', // emerald-500
  downColor: '#ef4444', // red-500
  borderUpColor: '#22c55e',
  borderDownColor: '#ef4444',
  wickUpColor: '#22c55e',
  wickDownColor: '#ef4444',
  volumeUpColor: 'rgba(34, 197, 94, 0.5)', // emerald-500 with 50% opacity
  volumeDownColor: 'rgba(239, 68, 68, 0.5)', // red-500 with 50% opacity
  background: 'transparent',
  gridColor: 'rgba(120, 134, 156, 0.1)', // subtle grid
  textColor: '#9ca3af', // gray-400
};

export function CandlestickChart({
  data,
  symbol,
  height = 400,
  showVolume = true,
  className,
}: CandlestickChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Handle client-side rendering
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Convert data to lightweight-charts format
  const convertData = useCallback((data: CandlestickDataPoint[]): { 
    candleData: { time: Time; open: number; high: number; low: number; close: number }[]; 
    volumeData: { time: Time; value: number; color: string }[] 
  } => {
    const candleData: { time: Time; open: number; high: number; low: number; close: number }[] = [];
    const volumeData: { time: Time; value: number; color: string }[] = [];

    for (const point of data) {
      // Convert date string to timestamp (seconds) or use string directly
      const time = Math.floor(new Date(point.time).getTime() / 1000) as Time;
      
      candleData.push({
        time,
        open: point.open,
        high: point.high,
        low: point.low,
        close: point.close,
      });

      if (point.volume !== undefined) {
        volumeData.push({
          time,
          value: point.volume,
          color: point.close >= point.open ? CHART_COLORS.volumeUpColor : CHART_COLORS.volumeDownColor,
        });
      }
    }

    return { candleData, volumeData };
  }, []);

  // Initialize chart
  useEffect(() => {
    if (!isClient || !chartContainerRef.current || data.length === 0) return;

    const container = chartContainerRef.current;
    const containerWidth = container.clientWidth;

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

    // Create candlestick series using the new v5 API
    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: CHART_COLORS.upColor,
      downColor: CHART_COLORS.downColor,
      borderUpColor: CHART_COLORS.borderUpColor,
      borderDownColor: CHART_COLORS.borderDownColor,
      wickUpColor: CHART_COLORS.wickUpColor,
      wickDownColor: CHART_COLORS.wickDownColor,
    });

    candlestickSeriesRef.current = candlestickSeries;

    // Create volume series if enabled
    if (showVolume) {
      const volumeSeries = chart.addSeries(HistogramSeries, {
        color: CHART_COLORS.volumeUpColor,
        priceFormat: {
          type: 'volume',
        },
        priceScaleId: 'volume',
      });

      volumeSeriesRef.current = volumeSeries;

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
        candlestickSeriesRef.current = null;
        volumeSeriesRef.current = null;
      }
    };
  }, [isClient, height, showVolume]);

  // Update data when it changes
  useEffect(() => {
    if (!isClient || !candlestickSeriesRef.current || data.length === 0) return;

    const { candleData, volumeData } = convertData(data);

    candlestickSeriesRef.current.setData(candleData);

    if (volumeSeriesRef.current && volumeData.length > 0) {
      volumeSeriesRef.current.setData(volumeData);
    }

    // Fit content
    if (chartRef.current) {
      chartRef.current.timeScale().fitContent();
    }
  }, [isClient, data, convertData]);

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

export default CandlestickChart;