"use client";

/**
 * @ai-context Advanced Charting component using lightweight-charts.
 * Displays candlestick data and volume bars.
 * @ai-related app/trade/page.tsx
 */
import React, { useEffect, useRef, useMemo } from "react";
import { createChart, ColorType, IChartApi } from "lightweight-charts";
import { useTheme } from "next-themes";
import { useHistoricalPrices } from "@/hooks/use-fmp";
import { Loader2 } from "lucide-react";

interface AdvancedChartProps {
  symbol: string;
}

export function AdvancedChart({ symbol }: AdvancedChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();
  const chartRef = useRef<IChartApi | null>(null);

  const { data: historicalData, isLoading, isError } = useHistoricalPrices(symbol);

  const chartData = useMemo(() => {
    if (!historicalData || !Array.isArray(historicalData)) return [];
    
    // FMP returns newest first, so we reverse it to oldest first
    // Map date to time for lightweight-charts
    return [...historicalData].reverse().map((d) => ({
      time: d.date,
      open: d.open,
      high: d.high,
      low: d.low,
      close: d.close,
      volume: d.volume,
    }));
  }, [historicalData]);

  useEffect(() => {
    if (!chartContainerRef.current || chartData.length === 0) return;

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
      chartData.map((d) => ({
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
      chartData.map((d) => ({
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
  }, [chartData, resolvedTheme]);

  if (isLoading) {
    return (
      <div className="w-full h-full min-h-[400px] flex items-center justify-center border rounded-md bg-muted/10">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-full h-full min-h-[400px] flex items-center justify-center border rounded-md bg-muted/10">
        <p className="text-muted-foreground">Failed to load chart data.</p>
      </div>
    );
  }

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
