import { StockSearchResult, StockProfile, StockQuote, MarketIndex, MarketMover } from './types/stock';

const FMP_BASE_URL = 'https://financialmodelingprep.com/stable';
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
    '/search-symbol',
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
      '/profile',
      { symbol },
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
      '/quote',
      { symbol },
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
      '/batch-quote',
      { symbols: symbols.join(',') },
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
      '/batch-quote',
      { symbols: indicesSymbols.join(',') },
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
      '/biggest-gainers',
      undefined,
      5 // Cache for 5 minutes
    );
    
    // Fetch losers
    const losers = await fetchFMP<MarketMover[]>(
      '/biggest-losers',
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

// Export types for consumers
export type { StockSearchResult, StockProfile, StockQuote, MarketIndex, MarketMover };