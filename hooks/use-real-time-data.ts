"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

/**
 * Real-time data hook for finance dashboard
 * Simulates WebSocket updates with configurable intervals
 */

export interface RealTimeOptions<T> {
  /** Unique key for caching */
  queryKey: string[];
  /** Initial fetch function */
  fetchFn: () => Promise<T>;
  /** Update interval in milliseconds */
  interval?: number;
  /** Whether updates are enabled */
  enabled?: boolean;
  /** Generate simulated update from previous data */
  simulateUpdate?: (prev: T) => T;
  /** Stale time in milliseconds */
  staleTime?: number;
}

export interface RealTimeState<T> {
  data: T | undefined;
  isLoading: boolean;
  error: Error | null;
  isUpdating: boolean;
  lastUpdate: Date | null;
}

/**
 * Hook for real-time data updates with simulated WebSocket
 */
export function useRealTimeData<T>({
  queryKey,
  fetchFn,
  interval = 5000,
  enabled = true,
  simulateUpdate,
  staleTime = 60 * 1000,
}: RealTimeOptions<T>): RealTimeState<T> {
  const queryClient = useQueryClient();
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const updateCountRef = useRef(0);

  // Initial query
  const query = useQuery({
    queryKey,
    queryFn: fetchFn,
    enabled,
    staleTime,
  });

  // Real-time update simulation
  useEffect(() => {
    if (!enabled || !query.data || !simulateUpdate) return;

    const updateData = () => {
      setIsUpdating(true);
      updateCountRef.current += 1;

      // Get current data from cache
      const currentData = queryClient.getQueryData<T>(queryKey);
      if (currentData && simulateUpdate) {
        const newData = simulateUpdate(currentData);
        queryClient.setQueryData(queryKey, newData);
        setLastUpdate(new Date());
      }

      // Brief delay to show update indicator
      setTimeout(() => setIsUpdating(false), 300);
    };

    const intervalId = setInterval(updateData, interval);

    return () => clearInterval(intervalId);
  }, [enabled, query.data, interval, queryKey, queryClient, simulateUpdate]);

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error ?? null,
    isUpdating,
    lastUpdate,
  };
}

/**
 * Hook for real-time stock price updates
 */
export interface StockPriceUpdate {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  previousPrice: number;
  timestamp: Date;
}

export function useRealTimeStockPrice(
  symbol: string,
  initialPrice: number,
  enabled = true,
  volatility = 0.002,
  interval = 3000
): StockPriceUpdate {
  const [state, setState] = useState<StockPriceUpdate>({
    symbol,
    price: initialPrice,
    change: 0,
    changePercent: 0,
    previousPrice: initialPrice,
    timestamp: new Date(),
  });

  useEffect(() => {
    if (!enabled) return;

    const updatePrice = () => {
      setState((prev) => {
        // Simulate price movement with configurable volatility
        const priceChange = prev.price * volatility * (Math.random() - 0.5) * 2;
        const newPrice = Math.max(0.01, prev.price + priceChange);
        const roundedPrice = Math.round(newPrice * 100) / 100;
        const change = roundedPrice - initialPrice;
        const changePercent = (change / initialPrice) * 100;

        return {
          symbol,
          price: roundedPrice,
          change: Math.round(change * 100) / 100,
          changePercent: Math.round(changePercent * 100) / 100,
          previousPrice: prev.price,
          timestamp: new Date(),
        };
      });
    };

    const intervalId = setInterval(updatePrice, interval);
    return () => clearInterval(intervalId);
  }, [symbol, initialPrice, volatility, interval, enabled]);

  return state;
}

/**
 * Hook for real-time market indices updates
 */
export interface MarketIndexUpdate {
  symbol: string;
  name: string;
  value: number;
  change: number;
  changePercent: number;
}

export function useRealTimeMarketIndices(
  initialData: MarketIndexUpdate[],
  enabled = true,
  interval = 5000
): MarketIndexUpdate[] {
  const [indices, setIndices] = useState<MarketIndexUpdate[]>(initialData);

  useEffect(() => {
    if (!enabled || !initialData.length) return;

    const updateIndices = () => {
      setIndices((prev) =>
        prev.map((index) => {
          // Simulate realistic index movement (smaller volatility for indices)
          const volatility = 0.0005;
          const change = index.value * volatility * (Math.random() - 0.5) * 2;
          const newValue = Math.max(0.01, index.value + change);
          const totalChange = newValue - index.value;
          const totalChangePercent = (totalChange / index.value) * 100;

          return {
            ...index,
            value: Math.round(newValue * 100) / 100,
            change: Math.round(totalChange * 100) / 100,
            changePercent: Math.round(totalChangePercent * 100) / 100,
          };
        })
      );
    };

    const intervalId = setInterval(updateIndices, interval);
    return () => clearInterval(intervalId);
  }, [enabled, interval]);

  // Initialize with initialData
  useEffect(() => {
    if (initialData.length > 0) {
      setIndices(initialData);
    }
  }, [initialData]);

  return indices;
}

/**
 * Hook for generating historical data points
 */
export function useHistoricalData(
  baseValue: number,
  points = 24,
  volatility = 0.02,
  enabled = true
): number[] {
  const generateData = useCallback(() => {
    const data: number[] = [];
    let current = baseValue;

    for (let i = 0; i < points; i++) {
      const change = current * volatility * (Math.random() - 0.5) * 2;
      current = Math.max(0.01, current + change);
      data.push(Math.round(current * 100) / 100);
    }

    return data;
  }, [baseValue, points, volatility]);

  const [data, setData] = useState<number[]>([]);

  useEffect(() => {
    if (enabled) {
      setData(generateData());
    }
  }, [enabled, generateData]);

  return data;
}

/**
 * Hook for managing a collection of real-time prices
 */
export function useRealTimePrices(
  symbols: string[],
  initialPrices: Record<string, number>,
  options: {
    enabled?: boolean;
    interval?: number;
    volatility?: number;
  } = {}
): Record<string, StockPriceUpdate> {
  const { enabled = true, interval = 3000, volatility = 0.002 } = options;
  const [prices, setPrices] = useState<Record<string, StockPriceUpdate>>({});

  // Initialize prices
  useEffect(() => {
    const initial: Record<string, StockPriceUpdate> = {};
    for (const symbol of symbols) {
      const price = initialPrices[symbol] ?? 100;
      initial[symbol] = {
        symbol,
        price,
        change: 0,
        changePercent: 0,
        previousPrice: price,
        timestamp: new Date(),
      };
    }
    setPrices(initial);
  }, [symbols, initialPrices]);

  // Update prices periodically
  useEffect(() => {
    if (!enabled || symbols.length === 0) return;

    const updatePrices = () => {
      setPrices((prev) => {
        const updated: Record<string, StockPriceUpdate> = { ...prev };

        for (const symbol of symbols) {
          const current = prev[symbol];
          if (!current) continue;

          const priceChange = current.price * volatility * (Math.random() - 0.5) * 2;
          const newPrice = Math.max(0.01, current.price + priceChange);
          const roundedPrice = Math.round(newPrice * 100) / 100;
          const initialPrice = initialPrices[symbol] ?? current.price;
          const change = roundedPrice - initialPrice;
          const changePercent = (change / initialPrice) * 100;

          updated[symbol] = {
            symbol,
            price: roundedPrice,
            change: Math.round(change * 100) / 100,
            changePercent: Math.round(changePercent * 100) / 100,
            previousPrice: current.price,
            timestamp: new Date(),
          };
        }

        return updated;
      });
    };

    const intervalId = setInterval(updatePrices, interval);
    return () => clearInterval(intervalId);
  }, [enabled, symbols, initialPrices, volatility, interval]);

  return prices;
}

/**
 * Custom hook for debounced updates
 */
export function useDebouncedUpdates<T>(
  data: T,
  delay: number = 500
): { data: T; isPending: boolean } {
  const [debouncedData, setDebouncedData] = useState<T>(data);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    setIsPending(true);
    const timer = setTimeout(() => {
      setDebouncedData(data);
      setIsPending(false);
    }, delay);

    return () => clearTimeout(timer);
  }, [data, delay]);

  return { data: debouncedData, isPending };
}

export default useRealTimeData;