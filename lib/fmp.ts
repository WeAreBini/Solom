import { StockSearchResult, StockProfile, StockQuote, MarketIndex, MarketMover } from './types/stock';

const FMP_BASE_URL = 'https://financialmodelingprep.com/stable';
const FMP_API_KEY = process.env.FMP_API_KEY || '';

// Flag to track if we've logged the API key warning
let apiKeyWarningLogged = false;

/**
 * Check if FMP API key is configured
 */
export function isFMPConfigured(): boolean {
  return !!FMP_API_KEY;
}

/**
 * Log a warning once if API key is not configured
 */
function logApiKeyWarning(): void {
  if (!apiKeyWarningLogged) {
    console.warn('⚠️  FMP_API_KEY not configured. Using demo data. Get a free API key at: https://site.financialmodelingprep.com/developer/docs');
    apiKeyWarningLogged = true;
  }
}

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

/**
 * Generate mock stock search results for demo mode
 */
function getMockSearchResults(query: string, limit: number): StockSearchResult[] {
  const mockStocks: StockSearchResult[] = [
    { symbol: 'AAPL', name: 'Apple Inc.', currency: 'USD', exchangeFullName: 'NASDAQ Global Select', exchange: 'NASDAQ' },
    { symbol: 'MSFT', name: 'Microsoft Corporation', currency: 'USD', exchangeFullName: 'NASDAQ Global Select', exchange: 'NASDAQ' },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', currency: 'USD', exchangeFullName: 'NASDAQ Global Select', exchange: 'NASDAQ' },
    { symbol: 'AMZN', name: 'Amazon.com Inc.', currency: 'USD', exchangeFullName: 'NASDAQ Global Select', exchange: 'NASDAQ' },
    { symbol: 'NVDA', name: 'NVIDIA Corporation', currency: 'USD', exchangeFullName: 'NASDAQ Global Select', exchange: 'NASDAQ' },
    { symbol: 'TSLA', name: 'Tesla Inc.', currency: 'USD', exchangeFullName: 'NASDAQ Global Select', exchange: 'NASDAQ' },
    { symbol: 'META', name: 'Meta Platforms Inc.', currency: 'USD', exchangeFullName: 'NASDAQ Global Select', exchange: 'NASDAQ' },
    { symbol: 'JPM', name: 'JPMorgan Chase & Co.', currency: 'USD', exchangeFullName: 'New York Stock Exchange', exchange: 'NYSE' },
  ];
  
  const q = query.toLowerCase();
  return mockStocks
    .filter(s => s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q))
    .slice(0, limit);
}

/**
 * Generate mock market indices for demo mode
 */
function getMockMarketIndices(): MarketIndex[] {
  const baseTime = Date.now();
  return [
    { symbol: '^DJI', name: 'Dow Jones Industrial Average', price: 39127.80, change: 156.33, changesPercentage: 0.40 },
    { symbol: '^GSPC', name: 'S&P 500', price: 5234.56, change: 28.45, changesPercentage: 0.55 },
    { symbol: '^IXIC', name: 'NASDAQ Composite', price: 16428.93, change: 184.67, changesPercentage: 1.14 },
    { symbol: '^RUT', name: 'Russell 2000', price: 2089.45, change: -12.34, changesPercentage: -0.59 },
    { symbol: '^VIX', name: 'CBOE Volatility Index', price: 14.23, change: -0.89, changesPercentage: -5.89 },
    { symbol: '^FTSE', name: 'FTSE 100', price: 8156.78, change: 23.45, changesPercentage: 0.29 },
    { symbol: '^GDAXI', name: 'DAX', price: 18456.23, change: 89.12, changesPercentage: 0.48 },
    { symbol: '^N225', name: 'Nikkei 225', price: 39876.45, change: 234.56, changesPercentage: 0.59 },
    { symbol: '^HSI', name: 'Hang Seng', price: 17234.89, change: -156.78, changesPercentage: -0.90 },
  ];
}

/**
 * Generate mock market movers for demo mode
 */
function getMockMarketMovers(): { gainers: MarketMover[]; losers: MarketMover[] } {
  const now = Date.now();
  return {
    gainers: [
      { symbol: 'NVDA', name: 'NVIDIA Corporation', price: 892.34, change: 45.67, changesPercentage: 5.39, volume: 45890000, dayLow: 850.00, dayHigh: 900.00, yearHigh: 974.00, yearLow: 392.00, marketCap: 2200000000000, avgVolume: 45000000, exchange: 'NASDAQ', open: 855.00, previousClose: 846.67, eps: 13.04, pe: 68.5, earningsAnnouncement: '', sharesOutstanding: 2460000000, timestamp: now },
      { symbol: 'AMD', name: 'Advanced Micro Devices', price: 178.45, change: 12.34, changesPercentage: 7.43, volume: 32450000, dayLow: 168.00, dayHigh: 180.00, yearHigh: 227.30, yearLow: 93.12, marketCap: 290000000000, avgVolume: 35000000, exchange: 'NASDAQ', open: 167.50, previousClose: 166.11, eps: 2.65, pe: 67.3, earningsAnnouncement: '', sharesOutstanding: 1620000000, timestamp: now },
      { symbol: 'META', name: 'Meta Platforms Inc.', price: 505.12, change: 8.45, changesPercentage: 1.70, volume: 15670000, dayLow: 498.00, dayHigh: 510.00, yearHigh: 542.81, yearLow: 274.38, marketCap: 1290000000000, avgVolume: 15000000, exchange: 'NASDAQ', open: 500.00, previousClose: 496.67, eps: 15.13, pe: 33.4, earningsAnnouncement: '', sharesOutstanding: 2553000000, timestamp: now },
      { symbol: 'TSM', name: 'Taiwan Semiconductor', price: 156.78, change: 7.89, changesPercentage: 5.30, volume: 8920000, dayLow: 150.00, dayHigh: 158.00, yearHigh: 170.80, yearLow: 99.20, marketCap: 810000000000, avgVolume: 9000000, exchange: 'NYSE', open: 150.50, previousClose: 148.89, eps: 5.18, pe: 30.3, earningsAnnouncement: '', sharesOutstanding: 5170000000, timestamp: now },
      { symbol: 'AVGO', name: 'Broadcom Inc.', price: 1345.67, change: 45.23, changesPercentage: 3.47, volume: 2340000, dayLow: 1310.00, dayHigh: 1360.00, yearHigh: 1445.00, yearLow: 733.61, marketCap: 620000000000, avgVolume: 2500000, exchange: 'NASDAQ', open: 1315.00, previousClose: 1300.44, eps: 37.67, pe: 35.7, earningsAnnouncement: '', sharesOutstanding: 461000000, timestamp: now },
    ],
    losers: [
      { symbol: 'TSLA', name: 'Tesla Inc.', price: 245.67, change: -3.21, changesPercentage: -1.29, volume: 89230000, dayLow: 242.00, dayHigh: 255.00, yearHigh: 299.29, yearLow: 152.37, marketCap: 780000000000, avgVolume: 95000000, exchange: 'NASDAQ', open: 250.00, previousClose: 248.88, eps: 3.41, pe: 72.1, earningsAnnouncement: '', sharesOutstanding: 3177000000, timestamp: now },
      { symbol: 'PYPL', name: 'PayPal Holdings', price: 62.34, change: -4.56, changesPercentage: -6.82, volume: 12450000, dayLow: 61.00, dayHigh: 66.00, yearHigh: 84.90, yearLow: 55.77, marketCap: 60000000000, avgVolume: 13000000, exchange: 'NASDAQ', open: 65.50, previousClose: 66.90, eps: 3.84, pe: 16.2, earningsAnnouncement: '', sharesOutstanding: 962000000, timestamp: now },
      { symbol: 'BA', name: 'Boeing Company', price: 189.45, change: -8.67, changesPercentage: -4.38, volume: 5670000, dayLow: 185.00, dayHigh: 197.00, yearHigh: 267.45, yearLow: 176.25, marketCap: 114000000000, avgVolume: 6000000, exchange: 'NYSE', open: 195.00, previousClose: 198.12, eps: -5.89, pe: 0, earningsAnnouncement: '', sharesOutstanding: 602000000, timestamp: now },
      { symbol: 'DIS', name: 'Walt Disney Co.', price: 112.34, change: -3.45, changesPercentage: -2.98, volume: 7890000, dayLow: 110.00, dayHigh: 116.00, yearHigh: 123.74, yearLow: 78.73, marketCap: 205000000000, avgVolume: 8000000, exchange: 'NYSE', open: 115.00, previousClose: 115.79, eps: 2.87, pe: 39.1, earningsAnnouncement: '', sharesOutstanding: 1825000000, timestamp: now },
      { symbol: 'NFLX', name: 'Netflix Inc.', price: 628.45, change: -12.34, changesPercentage: -1.93, volume: 4560000, dayLow: 620.00, dayHigh: 645.00, yearHigh: 700.99, yearLow: 344.73, marketCap: 270000000000, avgVolume: 5000000, exchange: 'NASDAQ', open: 642.00, previousClose: 640.79, eps: 16.03, pe: 39.2, earningsAnnouncement: '', sharesOutstanding: 430000000, timestamp: now },
    ],
  };
}

/**
 * Generate mock stock quote for demo mode
 */
function getMockStockQuote(symbol: string): StockQuote | null {
  const now = Date.now();
  const quotes: Record<string, StockQuote> = {
    'AAPL': { symbol: 'AAPL', name: 'Apple Inc.', price: 178.72, changesPercentage: 1.33, change: 2.34, dayLow: 175.89, dayHigh: 179.45, yearHigh: 199.62, yearLow: 124.17, marketCap: 2800000000000, priceAvg50: 175.50, priceAvg200: 165.30, exchange: 'NASDAQ', volume: 52340000, avgVolume: 55000000, open: 176.38, previousClose: 176.38, eps: 6.26, pe: 28.5, earningsAnnouncement: '', sharesOutstanding: 15680000000, timestamp: now },
    'MSFT': { symbol: 'MSFT', name: 'Microsoft Corporation', price: 425.22, changesPercentage: 1.08, change: 4.56, dayLow: 419.23, dayHigh: 426.89, yearHigh: 467.42, yearLow: 309.45, marketCap: 3150000000000, priceAvg50: 415.80, priceAvg200: 385.60, exchange: 'NASDAQ', volume: 21560000, avgVolume: 22000000, open: 420.66, previousClose: 420.66, eps: 12.09, pe: 35.2, earningsAnnouncement: '', sharesOutstanding: 7406000000, timestamp: now },
    'GOOGL': { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 154.87, changesPercentage: -0.29, change: -0.45, dayLow: 154.01, dayHigh: 156.12, yearHigh: 180.45, yearLow: 102.21, marketCap: 1900000000000, priceAvg50: 150.20, priceAvg200: 138.90, exchange: 'NASDAQ', volume: 18420000, avgVolume: 19000000, open: 155.32, previousClose: 155.32, eps: 6.24, pe: 24.8, earningsAnnouncement: '', sharesOutstanding: 12270000000, timestamp: now },
  };
  
  return quotes[symbol.toUpperCase()] || {
    symbol: symbol.toUpperCase(),
    name: `${symbol.toUpperCase()} Inc.`,
    price: 100 + Math.random() * 200,
    changesPercentage: (Math.random() - 0.5) * 5,
    change: (Math.random() - 0.5) * 10,
    dayLow: 100 + Math.random() * 100,
    dayHigh: 150 + Math.random() * 150,
    yearHigh: 200 + Math.random() * 100,
    yearLow: 50 + Math.random() * 100,
    marketCap: Math.floor(Math.random() * 500000000000),
    priceAvg50: 100 + Math.random() * 150,
    priceAvg200: 90 + Math.random() * 130,
    exchange: 'NASDAQ',
    volume: Math.floor(Math.random() * 50000000),
    avgVolume: Math.floor(Math.random() * 50000000),
    open: 100 + Math.random() * 150,
    previousClose: 100 + Math.random() * 150,
    eps: 5 + Math.random() * 10,
    pe: 15 + Math.random() * 30,
    earningsAnnouncement: '',
    sharesOutstanding: Math.floor(Math.random() * 2000000000),
    timestamp: now,
  };
}

/**
 * Generate mock stock profile for demo mode
 */
function getMockStockProfile(symbol: string): StockProfile {
  return {
    symbol: symbol.toUpperCase(),
    price: 100 + Math.random() * 200,
    beta: 1.0 + (Math.random() - 0.5) * 0.5,
    volAvg: Math.floor(Math.random() * 50000000),
    mktCap: Math.floor(Math.random() * 500000000000),
    lastDiv: Math.random() * 5,
    range: '100 - 200',
    changes: (Math.random() - 0.5) * 10,
    companyName: `${symbol.toUpperCase()} Inc.`,
    currency: 'USD',
    cik: '0000000000',
    isin: 'US' + symbol.toUpperCase().padEnd(10, 'X'),
    cusip: symbol.toUpperCase().padEnd(9, '0'),
    exchange: 'NASDAQ',
    exchangeShortName: 'NASDAQ',
    industry: 'Technology',
    website: `https://www.${symbol.toLowerCase()}.com`,
    description: `Demo profile for ${symbol.toUpperCase()}. Configure FMP_API_KEY for real data. This is a placeholder company profile shown when the Financial Modeling Prep API key is not configured.`,
    ceo: 'Demo CEO',
    sector: 'Information Technology',
    country: 'United States',
    fullTimeEmployees: '10000',
    phone: '+1-555-123-4567',
    address: '123 Demo Street',
    city: 'San Francisco',
    state: 'CA',
    zip: '94102',
    dcfDiff: 0,
    dcf: 0,
    image: `https://logo.clearbit.com/${symbol.toLowerCase()}.com`,
    ipoDate: '2020-01-01',
    defaultImage: true,
    isEtf: false,
    isActivelyTrading: true,
    isAdr: false,
    isFund: false,
  };
}

async function fetchFMP<T>(
  endpoint: string,
  params?: Record<string, string | number>,
  cacheTTL: number = 5
): Promise<T> {
  // If no API key, return mock data based on endpoint
  if (!FMP_API_KEY) {
    logApiKeyWarning();
    
    // Return mock data based on the endpoint
    if (endpoint === '/search-symbol') {
      return getMockSearchResults(String(params?.query || ''), Number(params?.limit || 10)) as T;
    }
    if (endpoint === '/batch-quote' && String(params?.symbols || '').includes('^')) {
      return getMockMarketIndices() as unknown as T;
    }
    if (endpoint === '/quote') {
      const quote = getMockStockQuote(String(params?.symbol || ''));
      return (quote ? [quote] : []) as T;
    }
    if (endpoint === '/biggest-gainers') {
      return getMockMarketMovers().gainers as T;
    }
    if (endpoint === '/biggest-losers') {
      return getMockMarketMovers().losers as T;
    }
    if (endpoint === '/profile') {
      return [getMockStockProfile(String(params?.symbol || ''))] as T;
    }
    
    // Default: return empty array
    return [] as unknown as T;
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