"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useWebSocketContext } from "@/lib/context/WebSocketContext";
import { PriceUpdatePayload } from "@/lib/types/websocket";

// Configuration
const POLLING_INTERVAL = 5000; // 5 seconds for polling fallback
const PRICE_CHANGE_THRESHOLD = 0.0001; // 0.01% minimum change to trigger update

// Real-time price data type
export interface RealTimePrice {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  timestamp: number;
  dayHigh?: number;
  dayLow?: number;
  bid?: number;
  ask?: number;
  open?: number;
  previousClose?: number;
  isConnected: boolean;
  source: "websocket" | "polling" | "initial";
}

// Price direction for animation
export type PriceDirection = "up" | "down" | "neutral";

// Hook return type
export interface UseRealTimePriceResult {
  price: RealTimePrice | null;
  isLoading: boolean;
  error: Error | null;
  direction: PriceDirection;
  isWebSocket: boolean;
  connectionStatus: "connected" | "polling" | "disconnected";
}

// Quote data from API
interface QuoteData {
  symbol: string;
  name?: string;
  price: number;
  change: number;
  changePercent: number;
  volume?: number;
  dayHigh?: number;
  dayLow?: number;
  bid?: number;
  ask?: number;
  open?: number;
  previousClose?: number;
}

// Hook to get real-time price with WebSocket + polling fallback
export function useRealTimePrice(
  symbol: string,
  options?: {
    enabled?: boolean;
    pollingInterval?: number;
    onPriceUpdate?: (price: RealTimePrice) => void;
  }
): UseRealTimePriceResult {
  const {
    enabled = true,
    pollingInterval = POLLING_INTERVAL,
    onPriceUpdate,
  } = options ?? {};

  // State
  const [realTimePrice, setRealTimePrice] = useState<RealTimePrice | null>(null);
  const [previousPrice, setPreviousPrice] = useState<number | null>(null);
  const [direction, setDirection] = useState<PriceDirection>("neutral");
  const [isUsingWebSocket, setIsUsingWebSocket] = useState(false);

  // Refs
  const lastWebSocketUpdateRef = useRef<number>(0);
  const onPriceUpdateRef = useRef(onPriceUpdate);

  // Keep callback ref updated
  useEffect(() => {
    onPriceUpdateRef.current = onPriceUpdate;
  }, [onPriceUpdate]);

  // Get WebSocket context (works even without provider - returns disconnected state)
  const wsContext = useWebSocketContext();
  const isConnected = wsContext.connectionState.status === "connected";
  const wsPrices = wsContext.latestPrices ?? {};

  // Fetch initial quote and polling fallback
  const { data: quote, isLoading, error } = useQuery<QuoteData>({
    queryKey: ["stockQuote", symbol],
    queryFn: async () => {
      const response = await fetch(`/api/stocks/${symbol}/quote`);
      if (!response.ok) {
        throw new Error(`Failed to fetch quote: ${response.status}`);
      }
      return response.json();
    },
    enabled: enabled && !!symbol,
    staleTime: isUsingWebSocket ? Infinity : pollingInterval, // Don't refetch if using WebSocket
    refetchInterval: isUsingWebSocket ? false : pollingInterval, // Polling fallback
    refetchOnWindowFocus: false,
  });

  // Update price from WebSocket
  useEffect(() => {
    if (!isConnected || !symbol) return;

    // Subscribe to symbol
    wsContext.subscribe([symbol]);

    // Get price from WebSocket
    const wsPrice = wsPrices[symbol] as PriceUpdatePayload | undefined;
    if (!wsPrice) return;

    // Check if this is a new update
    if (wsPrice.timestamp <= lastWebSocketUpdateRef.current) return;
    lastWebSocketUpdateRef.current = wsPrice.timestamp;

    // Determine direction
    setPreviousPrice((prev) => {
      if (prev !== null) {
        const diff = wsPrice.price - prev;
        if (Math.abs(diff) / prev > PRICE_CHANGE_THRESHOLD) {
          setDirection(diff > 0 ? "up" : "down");
          // Reset direction after animation
          setTimeout(() => setDirection("neutral"), 1000);
        }
      }
      return prev;
    });

    // Update state
    const newPrice: RealTimePrice = {
      symbol: wsPrice.symbol,
      price: wsPrice.price,
      change: wsPrice.change,
      changePercent: wsPrice.changePercent,
      volume: wsPrice.volume,
      timestamp: wsPrice.timestamp,
      dayHigh: wsPrice.dayHigh,
      dayLow: wsPrice.dayLow,
      bid: wsPrice.bid,
      ask: wsPrice.ask,
      isConnected: true,
      source: "websocket",
    };

    setRealTimePrice(newPrice);
    setIsUsingWebSocket(true);

    // Callback
    onPriceUpdateRef.current?.(newPrice);

    // Cleanup - unsubscribe on unmount or symbol change
    return () => {
      wsContext.unsubscribe([symbol]);
    };
  }, [isConnected, symbol, wsPrices, wsContext]);

  // Update price from polling/initial fetch
  useEffect(() => {
    if (!quote || isUsingWebSocket) return;

    const newPrice: RealTimePrice = {
      symbol: quote.symbol,
      price: quote.price,
      change: quote.change,
      changePercent: quote.changePercent,
      volume: quote.volume ?? 0,
      timestamp: Date.now(),
      dayHigh: quote.dayHigh,
      dayLow: quote.dayLow,
      bid: quote.bid,
      ask: quote.ask,
      open: quote.open,
      previousClose: quote.previousClose,
      isConnected: isConnected,
      source: isConnected ? "initial" : "polling",
    };

    // Determine direction from quote
    if (realTimePrice?.price && quote.price !== realTimePrice.price) {
      const diff = quote.price - realTimePrice.price;
      setDirection(diff > 0 ? "up" : "down");
      setTimeout(() => setDirection("neutral"), 1000);
    }

    setRealTimePrice(newPrice);
  }, [quote, isUsingWebSocket, isConnected]);

  // Determine connection status
  const connectionStatus = isUsingWebSocket ? "connected" : isConnected ? "polling" : "polling";

  return {
    price: realTimePrice,
    isLoading,
    error: error as Error | null,
    direction,
    isWebSocket: isUsingWebSocket,
    connectionStatus,
  };
}

// Hook for multiple real-time prices
export function useRealTimePrices(
  symbols: string[],
  options?: {
    enabled?: boolean;
    pollingInterval?: number;
    onPriceUpdate?: (symbol: string, price: RealTimePrice) => void;
  }
): {
  prices: Map<string, RealTimePrice>;
  isLoading: boolean;
  errors: Map<string, Error>;
  areFromWebSocket: boolean;
} {
  const { enabled = true, pollingInterval = POLLING_INTERVAL, onPriceUpdate } = options ?? {};

  // State
  const [prices, setPrices] = useState<Map<string, RealTimePrice>>(new Map());
  const [errors, setErrors] = useState<Map<string, Error>>(new Map());

  // Refs
  const onPriceUpdateRef = useRef(onPriceUpdate);
  useEffect(() => {
    onPriceUpdateRef.current = onPriceUpdate;
  }, [onPriceUpdate]);

  // Get WebSocket context
  const wsContext = useWebSocketContext();
  const isConnected = wsContext.connectionState.status === "connected";
  const wsPrices = wsContext.latestPrices ?? {};

  // Manage WebSocket subscriptions
  useEffect(() => {
    if (!isConnected || !enabled || symbols.length === 0) return;

    // Subscribe to all symbols
    wsContext.subscribe(symbols);

    return () => {
      wsContext.unsubscribe(symbols);
    };
  }, [isConnected, symbols, enabled, wsContext]);

  // Process WebSocket updates
  useEffect(() => {
    if (!isConnected) return;

    const newPrices = new Map<string, RealTimePrice>();
    let hasNewUpdates = false;

    for (const symbol of symbols) {
      const wsPrice = wsPrices[symbol] as PriceUpdatePayload | undefined;
      if (wsPrice) {
        newPrices.set(symbol, {
          symbol: wsPrice.symbol,
          price: wsPrice.price,
          change: wsPrice.change,
          changePercent: wsPrice.changePercent,
          volume: wsPrice.volume,
          timestamp: wsPrice.timestamp,
          dayHigh: wsPrice.dayHigh,
          dayLow: wsPrice.dayLow,
          bid: wsPrice.bid,
          ask: wsPrice.ask,
          isConnected: true,
          source: "websocket",
        });
        hasNewUpdates = true;
        onPriceUpdateRef.current?.(symbol, newPrices.get(symbol)!);
      }
    }

    if (hasNewUpdates) {
      setPrices((prev) => {
        const merged = new Map(prev);
        for (const [symbol, price] of newPrices) {
          merged.set(symbol, price);
        }
        return merged;
      });
    }
  }, [isConnected, symbols, wsPrices]);

  // Fetch prices via polling when WebSocket is not available
  const symbolsKey = symbols.sort().join(",");

  const { isLoading } = useQuery({
    queryKey: ["stockQuotes", symbolsKey],
    queryFn: async () => {
      if (symbols.length === 0) return [];
      // Fetch each symbol individually since we may not have a batch endpoint
      const promises = symbols.map(async (symbol) => {
        try {
          const response = await fetch(`/api/stocks/${symbol}/quote`);
          if (!response.ok) throw new Error(`Failed to fetch ${symbol}`);
          const quote = await response.json();
          return { symbol, quote };
        } catch (err) {
          setErrors((prev) => {
            const newErrors = new Map(prev);
            newErrors.set(symbol, err instanceof Error ? err : new Error(String(err)));
            return newErrors;
          });
          return null;
        }
      });

      const results = await Promise.all(promises);
      for (const result of results) {
        if (!result) continue;
        const { symbol, quote } = result;
        const price: RealTimePrice = {
          symbol,
          price: quote.price,
          change: quote.change,
          changePercent: quote.changePercent,
          volume: quote.volume ?? 0,
          timestamp: Date.now(),
          dayHigh: quote.dayHigh,
          dayLow: quote.dayLow,
          bid: quote.bid,
          ask: quote.ask,
          isConnected: false,
          source: "polling",
        };
        setPrices((prev) => {
          const newPrices = new Map(prev);
          newPrices.set(symbol, price);
          return newPrices;
        });
        onPriceUpdateRef.current?.(symbol, price);
      }
      return results;
    },
    enabled: enabled && symbols.length > 0 && !isConnected,
    staleTime: pollingInterval,
    refetchInterval: isConnected ? false : pollingInterval,
    refetchOnWindowFocus: false,
  });

  return {
    prices,
    isLoading,
    errors,
    areFromWebSocket: isConnected,
  };
}