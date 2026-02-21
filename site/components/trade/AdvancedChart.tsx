"use client";

/**
 * @ai-context Advanced Charting component using lightweight-charts.
 * Displays candlestick data and volume bars.
 * @ai-related app/trade/page.tsx
 */
import React, { useEffect, useRef } from "react";
import { createChart, ColorType, IChartApi, ISeriesApi } from "lightweight-charts";
import { useTheme } from "next-themes";

interface AdvancedChartProps {
  symbol: string;
  data?: { time: string; open: number; high: number; low: number; close: number; volume: number }[];
}

// Mock data generator if no data provided
const generateMockData = () => {
  const data = [];
  let time = new Date("2023-01-01").getTime();
  let close = 150;
  for (let i = 0; i < 100; i++) {
    const open = close + (Math.random() - 0.5) * 5;
    const high = Math.max(open, close) + Math.random() * 5;
    const low = Math.min(open, close) - Math.random() * 5;
    close = open + (Math.random() - 0.5) * 10;
    const volume = Math.floor(Math.random() * 10000) + 1000;
    
    data.push({
      time: new Date(time).toISOString().split("T")[0],
      open,
      high,
      low,
      close,
      volume,
    });
    time += 24 * 60 * 60 * 1000; // Add one day
  }
  return data;
};

export function AdvancedChart({ symbol, data = generateMockData() }: AdvancedChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const isDark = resolvedTheme === "dark";
    const backgroundColor = isDark ? "transparent" : "transparent";
    const textColor = isDark ? "#d1d5db" : "#374151";
    const gridColor = isDark ? "#374151" : "#e5e7eb";

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: backgroundColor },
        textColor,
      },
      grid: {
        vertLines: { color: gridColor },
        horzLines: { color: gridColor },
      },
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
      },
    });

    chartRef.current = chart;

    const candlestickSeries = chart.addCandlestickSeries({
      upColor: "#22c55e",
      downColor: "#ef4444",
      borderVisible: false,
      wickUpColor: "#22c55e",
      wickDownColor: "#ef4444",
    });

    candlestickSeries.setData(
      data.map((d) => ({
        time: d.time,
        open: d.open,
        high: d.high,
        low: d.low,
        close: d.close,
      }))
    );

    const volumeSeries = chart.addHistogramSeries({
      color: "#3b82f6",
      priceFormat: {
        type: "volume",
      },
      priceScaleId: "", // set as an overlay
    });

    chart.priceScale("").applyOptions({
      scaleMargins: {
        top: 0.8, // highest point of the series will be at 80% of the chart height
        bottom: 0,
      },
    });

    volumeSeries.setData(
      data.map((d) => ({
        time: d.time,
        value: d.volume,
        color: d.close > d.open ? "rgba(34, 197, 94, 0.5)" : "rgba(239, 68, 68, 0.5)",
      }))
    );

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        });
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, [data, resolvedTheme]);

  return (
    <div className="w-full h-full min-h-[400px] relative">
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-background/80 backdrop-blur-sm p-2 rounded-md border">
        <span className="font-bold">{symbol}</span>
        <span className="text-sm text-muted-foreground">1D</span>
      </div>
      <div ref={chartContainerRef} className="w-full h-full absolute inset-0" />
    </div>
  );
}
