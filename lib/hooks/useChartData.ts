"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRealTimePrice } from "./useRealTimePrice";

// Types
export interface HistoricalCandle {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface IndicatorData {
  sma?: { time: string; value: number }[];
  ema?: { time: string; value: number }[];
  rsi?: { time: string; value: number }[];
  macd?: { time: string; macd: number; signal: number; histogram: number }[];
  bollingerBands?: { time: string; upper: number; middle: number; lower: number }[];
  volume?: { time: string; value: number }[];
}

export interface ChartData {
  candlestick: HistoricalCandle[];
  indicators: IndicatorData;
}

export type TimePeriod = '1D' | '1W' | '1M' | '3M' | '6M' | '1Y' | '2Y' | '5Y';

export interface UseChartDataOptions {
  symbol: string;
  period?: TimePeriod;
  indicators?: string[];
  smaPeriod?: number;
  emaPeriod?: number;
  rsiPeriod?: number;
  bollingerPeriod?: number;
  bollingerStdDev?: number;
  macdFast?: number;
  macdSlow?: number;
  macdSignal?: number;
  enabled?: boolean;
  enableRealtime?: boolean;
}

export interface UseChartDataResult {
  data: ChartData | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  realtimePrice: {
    price: number;
    timestamp: number;
  } | null;
  isRealtimeConnected: boolean;
}

/**
 * Hook for fetching chart data with optional real-time updates
 * 
 * @example
 * ```tsx
 * const { data, isLoading, realtimePrice } = useChartData({
 *   symbol: 'AAPL',
 *   period: '1M',
 *   indicators: ['sma', 'ema', 'rsi'],
 *   enableRealtime: true,
 * });
 * ```
 */
export function useChartData({
  symbol,
  period = '1Y',
  indicators = [],
  smaPeriod = 20,
  emaPeriod = 20,
  rsiPeriod = 14,
  bollingerPeriod = 20,
  bollingerStdDev = 2,
  macdFast = 12,
  macdSlow = 26,
  macdSignal = 9,
  enabled = true,
  enableRealtime = false,
}: UseChartDataOptions): UseChartDataResult {
  const [realtimeCandle, setRealtimeCandle] = useState<HistoricalCandle | null>(null);
  const lastUpdateRef = useRef<number>(0);

  // Build query params
  const queryParams = new URLSearchParams({
    period,
    ...(indicators.length > 0 && { indicators: indicators.join(',') }),
    ...(smaPeriod !== 20 && { smaPeriod: smaPeriod.toString() }),
    ...(emaPeriod !== 20 && { emaPeriod: emaPeriod.toString() }),
    ...(rsiPeriod !== 14 && { rsiPeriod: rsiPeriod.toString() }),
    ...(bollingerPeriod !== 20 && { bollingerPeriod: bollingerPeriod.toString() }),
    ...(bollingerStdDev !== 2 && { bollingerStdDev: bollingerStdDev.toString() }),
    ...(macdFast !== 12 && { macdFast: macdFast.toString() }),
    ...(macdSlow !== 26 && { macdSlow: macdSlow.toString() }),
    ...(macdSignal !== 9 && { macdSignal: macdSignal.toString() }),
  });

  // Fetch historical data
  const {
    data: response,
    isLoading,
    error,
    refetch,
  } = useQuery<ChartData>({
    queryKey: ['chartData', symbol, period, indicators.join(','), smaPeriod, emaPeriod, rsiPeriod],
    queryFn: async () => {
      const url = `/api/stocks/${symbol}/historical?${queryParams.toString()}`;
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Failed to fetch chart data: ${res.status}`);
      }
      const json = await res.json();
      return json.data as ChartData;
    },
    enabled: enabled && !!symbol,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // Real-time price updates
  const { price: realtimePriceData, isWebSocket } = useRealTimePrice(
    symbol,
    {
      enabled: enabled && enableRealtime && !!symbol,
      pollingInterval: 10000, // 10 seconds for polling fallback
    }
  );

  // Merge real-time price with historical data
  const realtimePrice = realtimePriceData && enableRealtime
    ? {
        price: realtimePriceData.price,
        timestamp: realtimePriceData.timestamp,
      }
    : null;

  // Update last candle with real-time data
  useEffect(() => {
    if (!enableRealtime || !realtimePriceData || !response?.candlestick?.length) {
      setRealtimeCandle(null);
      return;
    }

    // Throttle updates to prevent excessive re-renders
    const now = Date.now();
    if (now - lastUpdateRef.current < 1000) return;
    lastUpdateRef.current = now;

    const lastCandle = response.candlestick[response.candlestick.length - 1];
    const today = new Date().toISOString().split('T')[0];
    const lastDate = lastCandle.date;

    // If we have a real-time price update
    if (realtimePriceData.price) {
      const newCandle: HistoricalCandle = {
        date: lastDate === today ? lastDate : today,
        open: lastDate === today ? lastCandle.open : realtimePriceData.open ?? realtimePriceData.price,
        high: Math.max(
          lastDate === today ? lastCandle.high : realtimePriceData.price,
          realtimePriceData.dayHigh ?? realtimePriceData.price
        ),
        low: Math.min(
          lastDate === today ? lastCandle.low : realtimePriceData.price,
          realtimePriceData.dayLow ?? realtimePriceData.price
        ),
        close: realtimePriceData.price,
        volume: realtimePriceData.volume ?? lastCandle.volume,
      };
      setRealtimeCandle(newCandle);
    }
  }, [realtimePriceData, response, enableRealtime]);

  // Merge real-time candle with historical data
  const mergedData: ChartData | null = useMemo(() => {
    if (!response) return null;
    if (!realtimeCandle) return response;

    const lastCandle = response.candlestick[response.candlestick.length - 1];
    const today = new Date().toISOString().split('T')[0];

    // If the last candle is today, update it
    if (lastCandle.date === today) {
      const updatedCandlestick = [...response.candlestick];
      updatedCandlestick[updatedCandlestick.length - 1] = realtimeCandle;
      return {
        ...response,
        candlestick: updatedCandlestick,
      };
    }

    // Otherwise, append the new candle
    return {
      ...response,
      candlestick: [...response.candlestick, realtimeCandle],
    };
  }, [response, realtimeCandle]);

  const refetchCallback = useCallback(() => {
    refetch();
  }, [refetch]);

  return {
    data: mergedData,
    isLoading,
    error: error as Error | null,
    refetch: refetchCallback,
    realtimePrice,
    isRealtimeConnected: isWebSocket,
  };
}