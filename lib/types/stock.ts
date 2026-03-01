// Stock search result type
export interface StockSearchResult {
  symbol: string;
  name: string;
  currency: string;
  exchangeFullName: string;
  exchange: string;
}

// Stock profile type
export interface StockProfile {
  symbol: string;
  price: number;
  beta: number;
  volAvg: number;
  mktCap: number;
  lastDiv: number;
  range: string;
  changes: number;
  companyName: string;
  currency: string;
  cik: string;
  isin: string;
  cusip: string;
  exchange: string;
  exchangeShortName: string;
  industry: string;
  website: string;
  description: string;
  ceo: string;
  sector: string;
  country: string;
  fullTimeEmployees: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  dcfDiff: number;
  dcf: number;
  image: string;
  ipoDate: string;
  defaultImage: boolean;
  isEtf: boolean;
  isActivelyTrading: boolean;
  isAdr: boolean;
  isFund: boolean;
}

// Real-time quote type
export interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  changesPercentage: number;
  change: number;
  dayLow: number;
  dayHigh: number;
  yearHigh: number;
  yearLow: number;
  marketCap: number;
  priceAvg50: number;
  priceAvg200: number;
  exchange: string;
  volume: number;
  avgVolume: number;
  open: number;
  previousClose: number;
  eps: number;
  pe: number;
  earningsAnnouncement: string;
  sharesOutstanding: number;
  timestamp: number;
}

// Market index type
export interface MarketIndex {
  symbol: string;
  name: string;
  price: number;
  changesPercentage: number;
  change: number;
}

// Market mover type
export interface MarketMover {
  symbol: string;
  name: string;
  price: number;
  changesPercentage: number;
  change: number;
  dayLow: number;
  dayHigh: number;
  yearHigh: number;
  yearLow: number;
  marketCap: number;
  volume: number;
  avgVolume: number;
  exchange: string;
  open: number;
  previousClose: number;
  eps: number;
  pe: number;
  earningsAnnouncement: string;
  sharesOutstanding: number;
  timestamp: number;
}

// Market movers response type
export interface MarketMoversResponse {
  gainers: MarketMover[];
  losers: MarketMover[];
}

// API error type
export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
}

// Cache entry type
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

// Historical data point for OHLCV data
export interface HistoricalDataPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// Indicator value type (for SMA, EMA, RSI, etc.)
export interface IndicatorValue {
  time: string;
  value: number;
}

// MACD value type
export interface MACDValue {
  time: string;
  macd: number;
  signal: number;
  histogram: number;
}

// Bollinger Bands value type
export interface BollingerBandValue {
  time: string;
  upper: number;
  middle: number;
  lower: number;
}

// Indicator configuration type
export interface IndicatorConfig {
  type: 'sma' | 'ema' | 'rsi' | 'macd' | 'bollingerBands';
  enabled: boolean;
  params: Record<string, number>;
}

// Chart indicators type (all calculated indicator data)
export interface ChartIndicators {
  sma: IndicatorValue[];
  ema: IndicatorValue[];
  rsi: IndicatorValue[];
  macd: MACDValue[];
  bollingerBands: BollingerBandValue[];
  volume: IndicatorValue[];
}

// Chart data type (historical + indicators)
export interface ChartData {
  candlestick: HistoricalDataPoint[];
  indicators: ChartIndicators;
}