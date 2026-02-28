'use client';

import { useQuery } from '@tanstack/react-query';

// Types
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

// API fetch functions
async function fetchApi<T>(endpoint: string): Promise<T> {
  const response = await fetch(endpoint);
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  return response.json();
}

// Query keys
export const queryKeys = {
  marketIndices: ['marketIndices'] as const,
  marketMovers: ['marketMovers'] as const,
  stockSearch: (query: string) => ['stockSearch', query] as const,
  stockQuote: (symbol: string) => ['stockQuote', symbol] as const,
  stockProfile: (symbol: string) => ['stockProfile', symbol] as const,
};

// React Query hooks
export function useMarketIndices() {
  return useQuery({
    queryKey: queryKeys.marketIndices,
    queryFn: () => fetchApi<MarketIndex[]>('/api/market/indices'),
    staleTime: 60 * 1000, // 1 minute
    refetchInterval: 60 * 1000, // Refresh every minute
  });
}

export function useMarketMovers() {
  return useQuery({
    queryKey: queryKeys.marketMovers,
    queryFn: () => fetchApi<MarketMoversResponse>('/api/market/movers'),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });
}

export function useStockSearch(query: string, enabled: boolean = true) {
  return useQuery({
    queryKey: queryKeys.stockSearch(query),
    queryFn: () => fetchApi<StockSearchResult[]>(`/api/stocks/search?query=${encodeURIComponent(query)}`),
    enabled: enabled && query.length >= 1,
    staleTime: 60 * 60 * 1000, // 1 hour (company names don't change often)
  });
}

export function useStockQuote(symbol: string) {
  return useQuery({
    queryKey: queryKeys.stockQuote(symbol),
    queryFn: () => fetchApi<StockQuote>(`/api/stocks/${symbol}/quote`),
    enabled: !!symbol,
    staleTime: 60 * 1000, // 1 minute
    refetchInterval: 60 * 1000, // Refresh every minute
  });
}

export function useStockProfile(symbol: string) {
  return useQuery({
    queryKey: queryKeys.stockProfile(symbol),
    queryFn: () => fetchApi<StockProfile>(`/api/stocks/${symbol}`),
    enabled: !!symbol,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours (company profile rarely changes)
  });
}

export interface HistoricalDataPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

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

interface HistoricalDataResponse {
  success: boolean;
  data?: ChartData;
  error?: string;
}

export function useHistoricalData(
  symbol: string, 
  period: '1D' | '1W' | '1M' | '3M' | '6M' | '1Y' | '2Y' | '5Y' = '1Y',
  options?: {
    indicators?: string[];
    smaPeriod?: number;
    emaPeriod?: number;
    rsiPeriod?: number;
    macdFast?: number;
    macdSlow?: number;
    macdSignal?: number;
  }
) {
  const params = new URLSearchParams({ period });
  
  if (options?.indicators?.length) {
    params.set('indicators', options.indicators.join(','));
  }
  if (options?.smaPeriod) {
    params.set('smaPeriod', String(options.smaPeriod));
  }
  if (options?.emaPeriod) {
    params.set('emaPeriod', String(options.emaPeriod));
  }
  if (options?.rsiPeriod) {
    params.set('rsiPeriod', String(options.rsiPeriod));
  }
  if (options?.macdFast) {
    params.set('macdFast', String(options.macdFast));
  }
  if (options?.macdSlow) {
    params.set('macdSlow', String(options.macdSlow));
  }
  if (options?.macdSignal) {
    params.set('macdSignal', String(options.macdSignal));
  }

  return useQuery({
    queryKey: ['historicalData', symbol, period, options],
    queryFn: async () => {
      const response = await fetch(`/api/stocks/${symbol}/historical?${params.toString()}`);
      const data: HistoricalDataResponse = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || `API error: ${response.status}`);
      }
      return data.data;
    },
    enabled: !!symbol,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}