"use client";

import { useState, useEffect, useCallback } from "react";

/**
 * Hook for generating historical data points for sparklines
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

  useEffect(() => {
    if (initialData.length > 0) {
      setIndices(initialData);
    }
  }, [initialData]);

  return indices;
}

export default useHistoricalData;