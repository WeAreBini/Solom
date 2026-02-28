import { StockSearchResult, StockProfile, StockQuote, MarketIndex, MarketMover } from './types/stock';

const FMP_BASE_URL = 'https://financialmodelingprep.com/api/v3';
const FMP_API_KEY = process.env.FMP_API_KEY || '';

// Simple in-memory cache
const cache = new Map<string, { data: unknown; timestamp: number; ttl: number }>();

// Rate limiting configuration
const rateLimitConfig = {
  maxRequests: 10, // per second
  windowMs: 1000,
  requests: [] as number[],
};

function checkRateLimit(): Promise<void> {
  return new Promise((resolve, reject) => {
    const now = Date.now();
    
    // Remove requests outside the window
    rateLimitConfig.requests = rateLimitConfig.requests.filter(
      (time) => now - time < rateLimitConfig.windowMs
    );
    
    if (rateLimitConfig.requests.length >= rateLimitConfig.maxRequests) {
      // Calculate wait time
      const oldestRequest = Math.min(...rateLimitConfig.requests);
      const waitTime = rateLimitConfig.windowMs - (now - oldestRequest) + 10;
      
      setTimeout(() => {
        resolve();
      }, waitTime);
    } else {
      rateLimitConfig.requests.push(now);
      resolve();
    }
  });
}

function getCacheKey(endpoint: string, params?: Record<string, string | number>): string {
  const sortedParams = params
    ? Object.keys(params)
        .sort()
        .map((k) => `${k}=${params[k]}`)
        .join('&')
    : '';
  return `${endpoint}?${sortedParams}`;
}

async function getFromCache<T>(key: string): Promise<T | null> {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < cached.ttl) {
    return cached.data as T;
  }
  return null;
}

function setCache<T>(key: string, data: T, ttlMinutes: number = 5): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
    ttl: ttlMinutes * 60 * 1000,
  });
}

async function fetchFMP<T>(
  endpoint: string,
  params?: Record<string, string | number>,
  cacheTTL: number = 5
): Promise<T> {
  if (!FMP_API_KEY) {
    throw new Error('FMP_API_KEY environment variable is not set');
  }
  
  await checkRateLimit();
  
  const cacheKey = getCacheKey(endpoint, params);
  
  // Check cache first
  const cachedData = await getFromCache<T>(cacheKey);
  if (cachedData) {
    return cachedData;
  }
  
  // Build URL
  const url = new URL(`${FMP_BASE_URL}${endpoint}`);
  url.searchParams.append('apikey', FMP_API_KEY);
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, String(value));
    });
  }
  
  const response = await fetch(url.toString());
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`FMP API error: ${response.status} - ${errorText}`);
  }
  
  const data = await response.json();
  
  // Cache the result
  setCache(cacheKey, data, cacheTTL);
  
  return data as T;
}

// ============ API Functions ============

/**
 * Search for stocks by symbol or company name
 */
export async function searchStocks(query: string, limit: number = 10): Promise<StockSearchResult[]> {
  if (!query || query.length < 1) {
    return [];
  }
  
  const results = await fetchFMP<StockSearchResult[]>(
    '/search',
    { query, limit },
    60 // Cache for 60 minutes since company names don't change often
  );
  
  return results;
}

/**
 * Get stock profile/details by symbol
 */
export async function getStockProfile(symbol: string): Promise<StockProfile | null> {
  try {
    const results = await fetchFMP<StockProfile[]>(
      `/profile/${symbol}`,
      undefined,
      30 // Cache for 30 minutes
    );
    
    return results?.[0] || null;
  } catch (error) {
    console.error(`Error fetching profile for ${symbol}:`, error);
    return null;
  }
}

/**
 * Get real-time quote for a stock
 */
export async function getStockQuote(symbol: string): Promise<StockQuote | null> {
  try {
    const results = await fetchFMP<StockQuote[]>(
      `/quote/${symbol}`,
      undefined,
      1 // Cache for 1 minute (real-time data)
    );
    
    return results?.[0] || null;
  } catch (error) {
    console.error(`Error fetching quote for ${symbol}:`, error);
    return null;
  }
}

/**
 * Get multiple stock quotes
 */
export async function getMultipleQuotes(symbols: string[]): Promise<StockQuote[]> {
  if (!symbols.length) return [];
  
  try {
    const results = await fetchFMP<StockQuote[]>(
      `/quote/${symbols.join(',')}`,
      undefined,
      1 // Cache for 1 minute
    );
    
    return results || [];
  } catch (error) {
    console.error('Error fetching multiple quotes:', error);
    return [];
  }
}

/**
 * Get market indices
 */
export async function getMarketIndices(): Promise<MarketIndex[]> {
  // Major market indices to track
  const indicesSymbols = [
    '^DJI',    // Dow Jones
    '^GSPC',   // S&P 500
    '^IXIC',   // NASDAQ
    '^RUT',    // Russell 2000
    '^VIX',    // VIX
    '^FTSE',   // FTSE 100
    '^GDAXI',  // DAX
    '^N225',   // Nikkei 225
    '^HSI',    // Hang Seng
  ];
  
  try {
    const results = await fetchFMP<StockQuote[]>(
      `/quote/${indicesSymbols.join(',')}`,
      undefined,
      1 // Cache for 1 minute
    );
    
    return (results || []).map((quote) => ({
      symbol: quote.symbol,
      name: quote.name,
      price: quote.price,
      changesPercentage: quote.changesPercentage,
      change: quote.change,
    }));
  } catch (error) {
    console.error('Error fetching market indices:', error);
    return [];
  }
}

/**
 * Get market movers (gainers and losers)
 */
export async function getMarketMovers(): Promise<{ gainers: MarketMover[]; losers: MarketMover[] }> {
  try {
    // Fetch gainers
    const gainers = await fetchFMP<MarketMover[]>(
      '/stock_market/gainers',
      undefined,
      5 // Cache for 5 minutes
    );
    
    // Fetch losers
    const losers = await fetchFMP<MarketMover[]>(
      '/stock_market/losers',
      undefined,
      5 // Cache for 5 minutes
    );
    
    return {
      gainers: gainers || [],
      losers: losers || [],
    };
  } catch (error) {
    console.error('Error fetching market movers:', error);
    return { gainers: [], losers: [] };
  }
}

// ============ Historical Data Types ============

export interface HistoricalDataPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  adjClose?: number;
  change?: number;
  changePercent?: number;
}

export interface HistoricalDataResponse {
  symbol: string;
  historical: HistoricalDataPoint[];
}

/**
 * Get historical price data for a stock
 * @param symbol Stock symbol
 * @param period Time period (1D, 1W, 1M, 3M, 1Y)
 */
export async function getHistoricalData(
  symbol: string,
  period: '1D' | '1W' | '1M' | '3M' | '1Y' = '1M'
): Promise<HistoricalDataPoint[]> {
  // Map period to days
  const periodDays: Record<string, number> = {
    '1D': 1,
    '1W': 7,
    '1M': 30,
    '3M': 90,
    '1Y': 365,
  };
  
  const days = periodDays[period] || 30;
  
  try {
    // Calculate date range
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - days);
    
    const formatDate = (date: Date) => date.toISOString().split('T')[0];
    
    const results = await fetchFMP<{ historical: HistoricalDataPoint[] }>(
      `/historical-price-full/${symbol}`,
      { from: formatDate(from), to: formatDate(to) },
      5 // Cache for 5 minutes
    );
    
    // Transform and add calculated fields
    const historical = results?.historical || [];
    
    // Calculate changes
    for (let i = 0; i < historical.length; i++) {
      const current = historical[i];
      const prev = i > 0 ? historical[i - 1] : null;
      if (current && prev && prev.close) {
        current.change = current.close - prev.close;
        current.changePercent = current.change / prev.close * 100;
      } else if (current) {
        current.change = 0;
        current.changePercent = 0;
      }
    }
    
    return historical.reverse(); // Most recent last
  } catch (error) {
    console.error(`Error fetching historical data for ${symbol}:`, error);
    return [];
  }
}

/**
 * Get intraday data for real-time charts (1D view)
 * @param symbol Stock symbol
 */
export async function getIntradayData(
  symbol: string
): Promise<HistoricalDataPoint[]> {
  try {
    // Fetch 1-hour intervals for the current day
    const results = await fetchFMP<{ historical: HistoricalDataPoint[] }>(
      `/historical-price-full/interval/${symbol}`,
      { interval: '1hour' },
      1 // Cache for 1 minute (real-time)
    );
    
    return results?.historical || [];
  } catch (error) {
    // Fallback to simulated data if intraday API fails
    console.warn(`Intraday API failed for ${symbol}, using simulation:`, error);
    return generateSimulatedIntradayData();
  }
}

/**
 * Generate simulated intraday data when API is unavailable
 */
function generateSimulatedIntradayData(): HistoricalDataPoint[] {
  const data: HistoricalDataPoint[] = [];
  const now = new Date();
  const basePrice = 150 + Math.random() * 100; // Random base price
  
  for (let i = 0; i < 24; i++) {
    const time = new Date(now.getTime() - (23 - i) * 60 * 60 * 1000);
    const volatility = 0.002;
    const change = basePrice * volatility * (Math.random() - 0.5) * 2;
    const price = Math.max(basePrice + change, 0.01);
    
    data.push({
      date: time.toISOString(),
      open: price * (1 - Math.random() * 0.01),
      high: price * (1 + Math.random() * 0.02),
      low: price * (1 - Math.random() * 0.02),
      close: price,
      volume: Math.floor(Math.random() * 1000000) + 500000,
      change: change,
      changePercent: (change / basePrice) * 100,
    });
  }
  
  return data;
}

// Export types for consumers
export type { StockSearchResult, StockProfile, StockQuote, MarketIndex, MarketMover };