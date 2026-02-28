"use client";

import { useState, useEffect, useCallback, useRef } from "react";

// ============================================
// Types
// ============================================

/**
 * WebSocket connection states
 */
export type ConnectionState = 
  | "connecting"
  | "connected"
  | "disconnected"
  | "error";

/**
 * Real-time data loading states
 */
export type DataState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; error: Error };

/**
 * WebSocket message types
 */
export interface WebSocketMessage<T = unknown> {
  type: "update" | "snapshot" | "error";
  channel: string;
  data: T;
  timestamp: number;
}

/**
 * Configuration for real-time subscriptions
 */
export interface RealtimeConfig {
  /** Whether to automatically reconnect on disconnect */
  autoReconnect?: boolean;
  /** Reconnection delay in ms */
  reconnectDelay?: number;
  /** Maximum reconnection attempts */
  maxReconnectAttempts?: number;
  /** Heartbeat interval in ms */
  heartbeatInterval?: number;
  /** Whether to use mock data (for development) */
  useMockData?: boolean;
}

// ============================================
// Generic WebSocket Hook
// ============================================

/**
 * Hook for managing WebSocket connections
 * Provides connection state and automatic reconnection
 */
export function useWebSocket<T>(
  url: string | null,
  options: RealtimeConfig = {}
) {
  const {
    autoReconnect = true,
    reconnectDelay = 3000,
    maxReconnectAttempts = 5,
    heartbeatInterval = 30000,
  } = options;

  const [connectionState, setConnectionState] = useState<ConnectionState>("disconnected");
  const [lastMessage, setLastMessage] = useState<T | null>(null);
  
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const connect = useCallback(() => {
    if (!url) return;

    setConnectionState("connecting");
    
    try {
      const socket = new WebSocket(url);
      socketRef.current = socket;

      socket.onopen = () => {
        setConnectionState("connected");
        reconnectAttemptsRef.current = 0;
        
        // Start heartbeat
        if (heartbeatInterval > 0) {
          heartbeatRef.current = setInterval(() => {
            if (socket.readyState === WebSocket.OPEN) {
              socket.send(JSON.stringify({ type: "ping" }));
            }
          }, heartbeatInterval);
        }
      };

      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data) as T;
          setLastMessage(message);
        } catch {
          // Invalid JSON, ignore
        }
      };

      socket.onclose = () => {
        setConnectionState("disconnected");
        
        // Stop heartbeat
        if (heartbeatRef.current) {
          clearInterval(heartbeatRef.current);
        }

        // Auto reconnect
        if (autoReconnect && reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++;
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectDelay * reconnectAttemptsRef.current);
        }
      };

      socket.onerror = () => {
        setConnectionState("error");
      };
    } catch {
      setConnectionState("error");
    }
  }, [url, autoReconnect, reconnectDelay, maxReconnectAttempts, heartbeatInterval]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
    }
    if (socketRef.current) {
      socketRef.current.close();
    }
    setConnectionState("disconnected");
  }, []);

  const sendMessage = useCallback((data: unknown) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(data));
    }
  }, []);

  useEffect(() => {
    if (url) {
      connect();
    }
    return () => {
      disconnect();
    };
  }, [url, connect, disconnect]);

  return {
    connectionState,
    lastMessage,
    sendMessage,
    connect,
    disconnect,
  };
}

// ============================================
// Real-time Stock Price Hook
// ============================================

export interface StockPriceUpdate {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  timestamp: number;
}

// Use typeof window !== 'undefined' pattern for browser compatibility
const WS_API_URL = typeof window !== 'undefined' && (window as unknown as { ENV?: { NEXT_PUBLIC_WS_API_URL?: string } }).ENV?.NEXT_PUBLIC_WS_API_URL || null;

/**
 * Hook for subscribing to real-time stock price updates
 * Falls back to mock data if WebSocket unavailable
 */
export function useRealtimeStockPrice(
  symbol: string | null,
  config: RealtimeConfig = {}
) {
  const { useMockData = false } = config;
  
  const [price, setPrice] = useState<StockPriceUpdate | null>(null);
  const [priceHistory, setPriceHistory] = useState<number[]>([]);
  
  // Mock data generator
  const generateMockUpdate = useCallback((): StockPriceUpdate => {
    const basePrice = 150 + Math.random() * 50;
    const change = (Math.random() - 0.5) * 10;
    return {
      symbol: symbol || "UNKNOWN",
      price: basePrice,
      change,
      changePercent: (change / basePrice) * 100,
      volume: Math.floor(Math.random() * 1000000),
      timestamp: Date.now(),
    };
  }, [symbol]);

  // Use WebSocket or mock
  const wsUrl = useMockData || !WS_API_URL ? null : `${WS_API_URL}/stocks/${symbol}`;
  
  const { connectionState, lastMessage } = useWebSocket<WebSocketMessage<StockPriceUpdate>>(
    wsUrl as string | null,
    config
  );

  // Process WebSocket messages
  useEffect(() => {
    if (lastMessage?.type === "update" && lastMessage.data) {
      setPrice(lastMessage.data);
      setPriceHistory((prev) => {
        const newHistory = [...prev, lastMessage.data.price];
        return newHistory.slice(-30); // Keep last 30 prices
      });
    }
  }, [lastMessage]);

  // Mock data interval
  useEffect(() => {
    if (!useMockData || !symbol) return;

    const interval = setInterval(() => {
      const mockUpdate = generateMockUpdate();
      setPrice(mockUpdate);
      setPriceHistory((prev) => {
        const newHistory = [...prev, mockUpdate.price];
        return newHistory.slice(-30);
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [useMockData, symbol, generateMockUpdate]);

  return {
    price,
    priceHistory,
    connectionState,
    isConnected: connectionState === "connected",
    isLoading: connectionState === "connecting",
    error: connectionState === "error" ? new Error("WebSocket error") : null,
  };
}

// ============================================
// Real-time Market Data Hook
// ============================================

export interface MarketIndexUpdate {
  symbol: string;
  name: string;
  value: number;
  change: number;
  changePercent: number;
}

type SymbolMap = Map<string, MarketIndexUpdate>;

/**
 * Hook for subscribing to multiple market symbols
 */
export function useRealtimeMarketData(
  symbols: string[],
  config: RealtimeConfig = {}
) {
  const { useMockData = true } = config;
  
  const [marketData, setMarketData] = useState<SymbolMap>(new Map());
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Mock data generator for market indices
  const generateMockData = useCallback((): Map<string, MarketIndexUpdate> => {
    const data = new Map<string, MarketIndexUpdate>();
    
    const indexNames: Record<string, string> = {
      "SPX": "S&P 500",
      "DJI": "Dow Jones",
      "IXIC": "NASDAQ",
    };
    
    symbols.forEach((symbol) => {
      const baseValue = symbol === "SPX" ? 5000 : symbol === "DJI" ? 39000 : 16000;
      const change = (Math.random() - 0.5) * 100;
      
      data.set(symbol, {
        symbol,
        name: indexNames[symbol] || symbol,
        value: baseValue + (Math.random() - 0.5) * 50,
        change,
        changePercent: (change / baseValue) * 100,
      });
    });
    
    return data;
  }, [symbols]);

  // Mock data interval (always use mock data for now)
  useEffect(() => {
    setIsLoading(true);
    
    // Initial data
    setMarketData(generateMockData());
    setLastUpdated(new Date());
    setIsLoading(false);
    
    // Simulated updates
    const interval = setInterval(() => {
      setMarketData(generateMockData());
      setLastUpdated(new Date());
    }, 5000);
    
    return () => clearInterval(interval);
  }, [generateMockData]);

  return {
    marketData,
    lastUpdated,
    isLoading,
    refresh: () => {
      setIsLoading(true);
      setTimeout(() => {
        setMarketData(generateMockData());
        setLastUpdated(new Date());
        setIsLoading(false);
      }, 500);
    },
  };
}

// ============================================
// Polling Hook
// ============================================

/**
 * Hook for polling data at regular intervals
 * Useful for REST APIs that don't support WebSockets
 */
export function usePolling<T>(
  fetchFn: () => Promise<T>,
  interval: number,
  options: {
    enabled?: boolean;
    immediate?: boolean;
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
  } = {}
) {
  const { enabled = true, immediate = true, onSuccess, onError } = options;
  
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isPending, setIsPending] = useState(false);

  const fetchData = useCallback(async () => {
    if (!enabled) return;
    
    setIsPending(true);
    setError(null);
    
    try {
      const result = await fetchFn();
      setData(result);
      onSuccess?.(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Unknown error");
      setError(error);
      onError?.(error);
    } finally {
      setIsPending(false);
    }
  }, [fetchFn, enabled, onSuccess, onError]);

  useEffect(() => {
    if (!enabled) return;

    if (immediate) {
      fetchData();
    }

    const intervalId = setInterval(fetchData, interval);
    
    return () => {
      clearInterval(intervalId);
    };
  }, [enabled, immediate, interval, fetchData]);

  return {
    data,
    error,
    isPending,
    isLoading: !data && !error,
    refetch: fetchData,
  };
}

// ============================================
// Data State Hook
// ============================================

/**
 * Hook for managing async data loading states
 * Implements the discriminated union pattern from design doc
 */
export function useDataState<T>(
  fetchFn: () => Promise<T>,
  deps: unknown[] = []
) {
  const [state, setState] = useState<DataState<T>>({ status: "idle" });

  const execute = useCallback(async () => {
    setState({ status: "loading" });
    
    try {
      const data = await fetchFn();
      setState({ status: "success", data });
      return data;
    } catch (error) {
      const err = error instanceof Error ? error : new Error("Unknown error");
      setState({ status: "error", error: err });
      throw err;
    }
  }, [fetchFn]);

  useEffect(() => {
    execute();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  const reset = useCallback(() => {
    setState({ status: "idle" });
  }, []);

  return {
    state,
    isLoading: state.status === "loading",
    isSuccess: state.status === "success",
    isError: state.status === "error",
    data: state.status === "success" ? state.data : null,
    error: state.status === "error" ? state.error : null,
    execute,
    reset,
  };
}

export default useRealtimeStockPrice;