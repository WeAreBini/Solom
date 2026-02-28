"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import type { OHLCVDataPoint, Timeframe } from '@/lib/types/chart';

// ============================================
// Types
// ============================================

export interface UseChartDataOptions {
  /** Stock symbol */
  symbol: string;
  /** Timeframe for data */
  timeframe?: Timeframe;
  /** Number of data points to fetch */
  limit?: number;
  /** Enable real-time updates */
  realtime?: boolean;
  /** Polling interval for updates (ms) */
  pollInterval?: number;
  /** WebSocket URL for streaming data */
  websocketUrl?: string;
  /** Callback when new price is received */
  onPriceUpdate?: (price: number) => void;
}

export interface UseChartDataReturn {
  /** Historical OHLCV data */
  data: OHLCVDataPoint[];
  /** Current/last price */
  currentPrice: number | null;
  /** Price change from previous close */
  priceChange: number | null;
  /** Price change percentage */
  priceChangePercent: number | null;
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error: Error | null;
  /** Refetch data */
  refetch: () => Promise<void>;
  /** Clear data */
  clear: () => void;
  /** Connected state (for WebSocket) */
  isConnected: boolean;
}

// ============================================
// Mock Data Generator (for development)
// ============================================

/**
 * Generate mock OHLCV data for testing
 * In production, this would be replaced by actual API calls
 */
function generateMockData(symbol: string, timeframe: Timeframe, limit: number): OHLCVDataPoint[] {
  const basePrice = symbol === 'AAPL' ? 150 : symbol === 'GOOGL' ? 140 : symbol === 'MSFT' ? 380 : 100;
  const volatility = basePrice * 0.02; // 2% volatility
  
  const now = Date.now();
  const interval = timeframeToMs(timeframe) * 1000;
  
  const data: OHLCVDataPoint[] = [];
  
  for (let i = limit - 1; i >= 0; i--) {
    const time = Math.floor((now - i * interval) / 1000);
    const open = basePrice + (Math.random() - 0.5) * volatility;
    const close = open + (Math.random() - 0.5) * volatility * 0.5;
    const high = Math.max(open, close) + Math.random() * volatility * 0.2;
    const low = Math.min(open, close) - Math.random() * volatility * 0.2;
    const volume = Math.floor(Math.random() * 10000000) + 100000;
    
    data.push({
      time,
      open: Math.round(open * 100) / 100,
      high: Math.round(high * 100) / 100,
      low: Math.round(low * 100) / 100,
      close: Math.round(close * 100) / 100,
      volume,
    });
  }
  
  return data;
}

/**
 * Convert timeframe string to milliseconds
 */
function timeframeToMs(timeframe: Timeframe): number {
  const intervals: Record<Timeframe, number> = {
    '1m': 60,
    '5m': 300,
    '15m': 900,
    '30m': 1800,
    '1h': 3600,
    '4h': 14400,
    '1d': 86400,
    '1w': 604800,
    '1M': 2592000,
  };
  return intervals[timeframe];
}

// ============================================
// API Response Types
// ============================================

interface HistoricalDataResponse {
  data: OHLCVDataPoint[];
  symbol: string;
}

// ============================================
// Hook Implementation
// ============================================

/**
 * Custom hook for fetching and managing stock chart data
 * 
 * @example
 * ```tsx
 * const { data, currentPrice, isLoading, error } = useChartData({
 *   symbol: 'AAPL',
 *   timeframe: '1d',
 *   realtime: true,
 * });
 * ```
 */
export function useChartData({
  symbol,
  timeframe = '1d',
  limit = 100,
  realtime = false,
  pollInterval = 5000,
  websocketUrl,
  onPriceUpdate,
}: UseChartDataOptions): UseChartDataReturn {
  // State
  const [data, setData] = useState<OHLCVDataPoint[]>([]);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [priceChange, setPriceChange] = useState<number | null>(null);
  const [priceChangePercent, setPriceChangePercent] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Refs
  const wsRef = useRef<WebSocket | null>(null);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ============================================
  // Fetch Historical Data
  // ============================================

  const fetchData = useCallback(async () => {
    if (!symbol) return;

    setIsLoading(true);
    setError(null);

    try {
      // Try to fetch from API
      const response = await fetch(`/api/stocks/${symbol}/history?timeframe=${timeframe}&limit=${limit}`);

      if (response.ok) {
        const result: HistoricalDataResponse = await response.json();
        
        if (result.data && Array.isArray(result.data)) {
          setData(result.data);
          
          // Calculate current price and change
          if (result.data.length >= 2) {
            const lastCandle = result.data[result.data.length - 1];
            const prevCandle = result.data[result.data.length - 2];
            
            setCurrentPrice(lastCandle.close);
            setPriceChange(lastCandle.close - prevCandle.close);
            setPriceChangePercent(((lastCandle.close - prevCandle.close) / prevCandle.close) * 100);
          }
        }
      } else {
        // API not available, use mock data for development
        console.info('API not available, using mock data for development');
        const mockData = generateMockData(symbol, timeframe, limit);
        setData(mockData);
        
        if (mockData.length >= 2) {
          const lastCandle = mockData[mockData.length - 1];
          const prevCandle = mockData[mockData.length - 2];
          
          setCurrentPrice(lastCandle.close);
          setPriceChange(lastCandle.close - prevCandle.close);
          setPriceChangePercent(((lastCandle.close - prevCandle.close) / prevCandle.close) * 100);
        }
      }
    } catch (err) {
      // Use mock data on error for development
      console.info('Using mock data for development:', err);
      const mockData = generateMockData(symbol, timeframe, limit);
      setData(mockData);
      
      if (mockData.length >= 2) {
        const lastCandle = mockData[mockData.length - 1];
        const prevCandle = mockData[mockData.length - 2];
        
        setCurrentPrice(lastCandle.close);
        setPriceChange(lastCandle.close - prevCandle.close);
        setPriceChangePercent(((lastCandle.close - prevCandle.close) / prevCandle.close) * 100);
      }
    } finally {
      setIsLoading(false);
    }
  }, [symbol, timeframe, limit]);

  // ============================================
  // Real-time Updates
  // ============================================

  const startPolling = useCallback(() => {
    if (!realtime) return;

    pollIntervalRef.current = setInterval(async () => {
      try {
        const response = await fetch(`/api/stocks/${symbol}/quote`);
        if (response.ok) {
          const quote = await response.json();
          
          setCurrentPrice(quote.price);
          onPriceUpdate?.(quote.price);
          
          // Update last candle
          if (data.length > 0) {
            setData(prev => {
              const updated = [...prev];
              const lastCandle = updated[updated.length - 1];
              
              if (lastCandle) {
                lastCandle.close = quote.price;
                lastCandle.high = Math.max(lastCandle.high, quote.price);
                lastCandle.low = Math.min(lastCandle.low, quote.price);
                
                if (quote.volume !== undefined) {
                  lastCandle.volume = quote.volume;
                }
              }
              
              return updated;
            });
          }
        }
      } catch (err) {
        // Silently fail for polling errors
        console.warn('Polling error:', err);
      }
    }, pollInterval);
  }, [realtime, symbol, pollInterval, data.length, onPriceUpdate]);

  const connectWebSocket = useCallback(() => {
    if (!websocketUrl) return;

    try {
      wsRef.current = new WebSocket(websocketUrl);

      wsRef.current.onopen = () => {
        setIsConnected(true);
        
        // Subscribe to stock updates
        wsRef.current?.send(JSON.stringify({
          type: 'subscribe',
          symbol,
        }));
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          if (message.type === 'price' && message.data) {
            const { price, volume } = message.data;
            
            setCurrentPrice(price);
            onPriceUpdate?.(price);
            
            // Update last candle
            if (data.length > 0) {
              setData(prev => {
                const updated = [...prev];
                const lastCandle = updated[updated.length - 1];
                
                if (lastCandle) {
                  const now = Math.floor(Date.now() / 1000);
                  
                  // If same candle interval, update
                  if (Math.abs(now - (lastCandle.time as number)) < timeframeToMs(timeframe)) {
                    lastCandle.close = price;
                    lastCandle.high = Math.max(lastCandle.high, price);
                    lastCandle.low = Math.min(lastCandle.low, price);
                    if (volume) lastCandle.volume += volume;
                  } else {
                    // New candle
                    updated.push({
                      time: now,
                      open: lastCandle.close,
                      high: price,
                      low: price,
                      close: price,
                      volume: volume || 0,
                    });
                  }
                }
                
                return updated;
              });
            }
          }
        } catch (err) {
          console.warn('WebSocket message parse error:', err);
        }
      };

      wsRef.current.onclose = () => {
        setIsConnected(false);
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
      };
    } catch (err) {
      console.error('WebSocket connection error:', err);
    }
  }, [websocketUrl, symbol, timeframe, data.length, onPriceUpdate]);

  // ============================================
  // Lifecycle
  // ============================================

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!realtime) return;

    if (websocketUrl) {
      connectWebSocket();
    } else {
      startPolling();
    }

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [realtime, websocketUrl, startPolling, connectWebSocket]);

  // ============================================
  // Public Methods
  // ============================================

  const clear = useCallback(() => {
    setData([]);
    setCurrentPrice(null);
    setPriceChange(null);
    setPriceChangePercent(null);
    setError(null);
  }, []);

  return {
    data,
    currentPrice,
    priceChange,
    priceChangePercent,
    isLoading,
    error,
    refetch: fetchData,
    clear,
    isConnected,
  };
}

// ============================================
// Exports
// ============================================

export default useChartData;