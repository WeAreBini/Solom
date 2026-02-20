"use client";

/**
 * @ai-context TradingViewChart component using lightweight-charts for rendering financial data
 * @ai-related app/ticker/[symbol]/page.tsx
 */
import React, { useEffect, useRef } from 'react';
import { createChart, ColorType, IChartApi, ISeriesApi, Time } from 'lightweight-charts';

export interface ChartData {
  time?: Time;
  date?: string; // FMP API format
  value?: number;
  open?: number;
  high?: number;
  low?: number;
  close?: number;
}

interface TradingViewChartProps {
  /** The data to display on the chart */
  data: ChartData[];
  /** The type of chart to render */
  type?: 'line' | 'candlestick';
  /** Additional CSS classes */
  className?: string;
}

export function TradingViewChart({ data, type = 'line', className = '' }: TradingViewChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Line" | "Candlestick"> | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        });
      }
    };

    // Initialize chart
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: 'hsl(var(--muted-foreground))',
      },
      grid: {
        vertLines: { color: 'hsl(var(--border))' },
        horzLines: { color: 'hsl(var(--border))' },
      },
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
      timeScale: {
        borderColor: 'hsl(var(--border))',
      },
      rightPriceScale: {
        borderColor: 'hsl(var(--border))',
      },
    });

    chartRef.current = chart;

    // Map data to lightweight-charts format
    const formattedData = data.map((item) => {
      const time = (item.time || item.date) as Time;
      if (type === 'candlestick') {
        return {
          time,
          open: item.open,
          high: item.high,
          low: item.low,
          close: item.close,
        };
      } else {
        return {
          time,
          value: item.value !== undefined ? item.value : item.close,
        };
      }
    }).sort((a, b) => {
      // Ensure data is sorted by time ascending
      const timeA = new Date(a.time as string).getTime();
      const timeB = new Date(b.time as string).getTime();
      return timeA - timeB;
    });

    // Add series based on type
    if (type === 'candlestick') {
      const candlestickSeries = chart.addCandlestickSeries({
        upColor: 'hsl(var(--positive))',
        downColor: 'hsl(var(--negative))',
        borderVisible: false,
        wickUpColor: 'hsl(var(--positive))',
        wickDownColor: 'hsl(var(--negative))',
      });
      candlestickSeries.setData(formattedData as import('lightweight-charts').CandlestickData[]);
      seriesRef.current = candlestickSeries as unknown as ISeriesApi<"Line" | "Candlestick">;
    } else {
      const lineSeries = chart.addLineSeries({
        color: 'hsl(var(--primary))',
        lineWidth: 2,
      });
      lineSeries.setData(formattedData as import('lightweight-charts').LineData[]);
      seriesRef.current = lineSeries as unknown as ISeriesApi<"Line" | "Candlestick">;
    }

    chart.timeScale().fitContent();

    // Handle resize
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(chartContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [data, type]);

  return (
    <div
      ref={chartContainerRef}
      className={`w-full h-full min-h-[300px] ${className}`}
    />
  );
}
