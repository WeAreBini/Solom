'use client';

import { useQuery } from '@tanstack/react-query';

// Solom Data Service URL - configurable via environment variable
// This connects to the Python/FastAPI service that fetches data from Yahoo Finance
const SOLOM_DATA_SERVICE_URL = process.env.NEXT_PUBLIC_SOLOM_DATA_SERVICE_URL || 'https://solom-data-service.up.railway.app';

// Types (matching frontend expectations)
export interface MarketIndex {
  symbol: string;
  name: string;
  value: number;
  change: number;
  changePercent: number;
}

export interface MarketMover {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
}

export interface StockSearchResult {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  peRatio: number | null;
}

export interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  avgVolume: number;
  marketCap: number;
  peRatio: number | null;
  high52Week: number;
  low52Week: number;
  open: number;
  previousClose: number;
  dayHigh: number;
  dayLow: number;
  volume: number;
}

export interface StockProfile {
  symbol: string;
  companyName: string;
  industry: string;
  sector: string;
  country: string;
  exchange: string;
  description: string;
  website: string;
  image: string;
}

interface MarketMoversResponse {
  gainers: MarketMover[];
  losers: MarketMover[];
}

// API fetch function with error handling
async function fetchSolomApi<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(`${SOLOM_DATA_SERVICE_URL}${endpoint}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
  }
  
  const response = await fetch(url.toString(), {
    headers: {
      'Accept': 'application/json',
    },
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.error?.message || `API error: ${response.status}`);
  }
  
  const json = await response.json();
  
  // Solom API wraps responses in { data: ... } or { error: ... }
  if (json && typeof json === 'object') {
    if ('error' in json) {
      throw new Error(json.error.message || 'Unknown error');
    }
    if ('data' in json) {
      return json.data as T;
    }
  }
  
  return json as T;
}

// Query keys for React Query
export const queryKeys = {
  marketIndices: ['marketIndices'] as const,
  marketMovers: ['marketMovers'] as const,
  stockSearch: (query: string) => ['stockSearch', query] as const,
  stockQuote: (symbol: string) => ['stockQuote', symbol] as const,
  stockProfile: (symbol: string) => ['stockProfile', symbol] as const,
  historicalData: (symbol: string, period: string) => ['historicalData', symbol, period] as const,
};

// Market indices - fetch major indices using batch quote
export function useMarketIndices() {
  return useQuery({
    queryKey: queryKeys.marketIndices,
    queryFn: async (): Promise<MarketIndex[]> => {
      // Fetch quotes for major indices
      const symbols = ['^DJI', '^GSPC', '^IXIC', '^RUT', '^VIX'];
      const quotes = await Promise.all(
        symbols.map(async (symbol) => {
          try {
            const data = await fetchSolomApi<{
              symbol: string;
              price: number;
              change: number | null;
              change_pct: number | null;
              name?: string;
            }>(`/api/v1/stocks/quote/${symbol}`);
            
            return {
              symbol: data.symbol,
              name: getIndexName(symbol),
              value: data.price,
              change: data.change || 0,
              changePercent: data.change_pct || 0,
            };
          } catch {
            return null;
          }
        })
      );
      
      return quotes.filter((q): q is MarketIndex => q !== null);
    },
    staleTime: 60 * 1000, // 1 minute
    refetchInterval: 60 * 1000, // Refresh every minute
  });
}

// Get human-readable index names
function getIndexName(symbol: string): string {
  const names: Record<string, string> = {
    '^DJI': 'Dow Jones Industrial Average',
    '^GSPC': 'S&P 500',
    '^IXIC': 'NASDAQ Composite',
    '^RUT': 'Russell 2000',
    '^VIX': 'CBOE Volatility Index',
  };
  return names[symbol] || symbol;
}

// Market movers - top gainers and losers
export function useMarketMovers() {
  return useQuery({
    queryKey: queryKeys.marketMovers,
    queryFn: async (): Promise<MarketMoversResponse> => {
      const data = await fetchSolomApi<Array<{
        symbol: string;
        name: string;
        price: number;
        change: number;
        change_pct: number;
        volume: number;
      }>>('/api/v1/stocks/movers');
      
      // Split into gainers and losers
      const allMovers = data || [];
      const gainers = allMovers
        .filter((m) => m.change > 0)
        .slice(0, 5)
        .map((m) => ({
          symbol: m.symbol,
          name: m.name || m.symbol,
          price: m.price,
          change: m.change,
          changePercent: m.change_pct,
          volume: m.volume,
        }));
      
      const losers = allMovers
        .filter((m) => m.change < 0)
        .slice(0, 5)
        .map((m) => ({
          symbol: m.symbol,
          name: m.name || m.symbol,
          price: m.price,
          change: m.change,
          changePercent: m.change_pct,
          volume: m.volume,
        }));
      
      return { gainers, losers };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000,
  });
}

// Stock search
export function useStockSearch(query: string, enabled: boolean = true) {
  return useQuery({
    queryKey: queryKeys.stockSearch(query),
    queryFn: async (): Promise<StockSearchResult[]> => {
      const data = await fetchSolomApi<Array<{
        symbol: string;
        name: string;
        asset_type?: string;
        exchange?: string;
      }>>('/api/v1/stocks/search', { q: query });
      
      return (data || []).map((item) => ({
        symbol: item.symbol,
        name: item.name || item.symbol,
        price: 0, // Search doesn't include price
        change: 0,
        changePercent: 0,
        volume: 0,
        marketCap: 0,
        peRatio: null,
      }));
    },
    enabled: enabled && query.length >= 1,
    staleTime: 60 * 60 * 1000, // 1 hour
  });
}

// Stock quote
export function useStockQuote(symbol: string) {
  return useQuery({
    queryKey: queryKeys.stockQuote(symbol),
    queryFn: async (): Promise<StockQuote> => {
      const data = await fetchSolomApi<{
        symbol: string;
        price: number;
        open: number;
        high: number;
        low: number;
        prev_close: number;
        change: number | null;
        change_pct: number | null;
        volume: number;
        market_cap: number;
        day_high: number;
        day_low: number;
        week_52_high: number;
        week_52_low: number;
      }>(`/api/v1/stocks/quote/${symbol}`);
      
      return {
        symbol: data.symbol,
        name: data.symbol, // Quote doesn't include name
        price: data.price,
        change: data.change || 0,
        changePercent: data.change_pct || 0,
        avgVolume: data.volume,
        marketCap: data.market_cap || 0,
        peRatio: null,
        high52Week: data.week_52_high,
        low52Week: data.week_52_low,
        open: data.open,
        previousClose: data.prev_close,
        dayHigh: data.day_high || data.high,
        dayLow: data.day_low || data.low,
        volume: data.volume,
      };
    },
    enabled: !!symbol,
    staleTime: 60 * 1000, // 1 minute
    refetchInterval: 60 * 1000,
  });
}

// Stock profile
export function useStockProfile(symbol: string) {
  return useQuery({
    queryKey: queryKeys.stockProfile(symbol),
    queryFn: async (): Promise<StockProfile> => {
      const data = await fetchSolomApi<{
        symbol: string;
        name: string;
        description?: string;
        sector?: string;
        industry?: string;
        country?: string;
        exchange?: string;
        website?: string;
        logo_url?: string;
      }>(`/api/v1/companies/${symbol}/profile`);
      
      return {
        symbol: data.symbol,
        companyName: data.name || data.symbol,
        industry: data.industry || 'N/A',
        sector: data.sector || 'N/A',
        country: data.country || 'N/A',
        exchange: data.exchange || 'N/A',
        description: data.description || '',
        website: data.website || '',
        image: data.logo_url || `https://logo.clearbit.com/${symbol.toLowerCase()}.com`,
      };
    },
    enabled: !!symbol,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });
}

// Historical data (OHLCV)
export interface HistoricalDataPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export function useHistoricalData(
  symbol: string,
  period: '1D' | '1W' | '1M' | '3M' | '6M' | '1Y' | '2Y' | '5Y' = '1Y',
  _options?: {
    indicators?: string[];
    smaPeriod?: number;
    emaPeriod?: number;
    rsiPeriod?: number;
    macdFast?: number;
    macdSlow?: number;
    macdSignal?: number;
  }
) {
  return useQuery({
    queryKey: queryKeys.historicalData(symbol, period),
    queryFn: async (): Promise<{ candlestick: HistoricalDataPoint[] }> => {
      const days = periodToDays(period);
      const data = await fetchSolomApi<Array<{
        timestamp: string;
        open: number;
        high: number;
        low: number;
        close: number;
        volume: number;
      }>>(`/api/v1/stocks/ohlcv/${symbol}`, { days: String(days) });
      
      const candlestick = (data || []).map((item) => ({
        date: item.timestamp,
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close,
        volume: item.volume,
      }));
      
      return { candlestick };
    },
    enabled: !!symbol,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Convert period string to days
function periodToDays(period: string): number {
  const mapping: Record<string, number> = {
    '1D': 1,
    '1W': 7,
    '1M': 30,
    '3M': 90,
    '6M': 180,
    '1Y': 365,
    '2Y': 730,
    '5Y': 1825,
  };
  return mapping[period] || 365;
}

// Export indicator types for compatibility
export interface IndicatorValue {
  time: string;
  value: number;
}

export interface MACDValue {
  time: string;
  macd: number;
  signal: number;
  histogram: number;
}

export interface ChartIndicators {
  sma: IndicatorValue[];
  ema: IndicatorValue[];
  rsi: IndicatorValue[];
  macd: MACDValue[];
  volume: IndicatorValue[];
}

export interface ChartData {
  candlestick: HistoricalDataPoint[];
  indicators: ChartIndicators;
}