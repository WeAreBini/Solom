// Finance types and mock data for stock market dashboard

export interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  avgVolume: number;
  marketCap: number;
  peRatio: number | null;
  high52Week: number;
  low52Week: number;
  open: number;
  previousClose: number;
}

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

// Mock data generators for demo purposes
// In production, these would be replaced with real API calls

const generateRandomChange = (base: number, volatility: number = 0.02): { price: number; change: number; changePercent: number } => {
  const changePercent = (Math.random() - 0.5) * 2 * volatility * 100;
  const change = base * (changePercent / 100);
  const price = base + change;
  return { price: Math.round(price * 100) / 100, change: Math.round(change * 100) / 100, changePercent: Math.round(changePercent * 100) / 100 };
};

export function getMarketIndices(): MarketIndex[] {
  const sp500 = generateRandomChange(5032.45, 0.005);
  const nasdaq = generateRandomChange(15785.32, 0.008);
  const dow = generateRandomChange(38675.68, 0.004);

  return [
    { symbol: 'SPX', name: 'S&P 500', value: sp500.price, change: sp500.change, changePercent: sp500.changePercent },
    { symbol: 'IXIC', name: 'NASDAQ', value: nasdaq.price, change: nasdaq.change, changePercent: nasdaq.changePercent },
    { symbol: 'DJI', name: 'DOW JONES', value: dow.price, change: dow.change, changePercent: dow.changePercent },
  ];
}

export function getTopGainers(): MarketMover[] {
  return [
    { symbol: 'NVDA', name: 'NVIDIA Corporation', price: 875.42, change: 45.23, changePercent: 5.45, volume: 45230000 },
    { symbol: 'AMD', name: 'Advanced Micro Devices', price: 172.85, change: 9.12, changePercent: 5.58, volume: 32150000 },
    { symbol: 'TSLA', name: 'Tesla, Inc.', price: 248.92, change: 11.34, changePercent: 4.77, volume: 67890000 },
    { symbol: 'META', name: 'Meta Platforms Inc.', price: 485.67, change: 18.92, changePercent: 4.05, volume: 18920000 },
    { symbol: 'PLTR', name: 'Palantir Technologies', price: 21.45, change: 0.87, changePercent: 4.23, volume: 56780000 },
  ];
}

export function getTopLosers(): MarketMover[] {
  return [
    { symbol: 'BABA', name: 'Alibaba Group', price: 72.34, change: -5.23, changePercent: -6.74, volume: 23450000 },
    { symbol: 'NIO', name: 'NIO Inc.', price: 5.87, change: -0.42, changePercent: -6.68, volume: 45670000 },
    { symbol: 'PYPL', name: 'PayPal Holdings', price: 58.92, change: -3.12, changePercent: -5.03, volume: 12340000 },
    { symbol: 'DIS', name: 'Walt Disney Co.', price: 95.34, change: -4.23, changePercent: -4.24, volume: 8920000 },
    { symbol: 'BA', name: 'Boeing Company', price: 178.45, change: -6.78, changePercent: -3.66, volume: 5678000 },
  ];
}

export function searchStocks(query: string): StockQuote[] {
  const stocks: StockQuote[] = [
    { symbol: 'AAPL', name: 'Apple Inc.', price: 178.52, change: 2.34, changePercent: 1.33, volume: 52340000, avgVolume: 58000000, marketCap: 2780000000000, peRatio: 28.5, high52Week: 199.62, low52Week: 124.17, open: 176.18, previousClose: 176.18 },
    { symbol: 'MSFT', name: 'Microsoft Corporation', price: 415.67, change: 5.89, changePercent: 1.44, volume: 18920000, avgVolume: 22000000, marketCap: 3080000000000, peRatio: 35.2, high52Week: 468.35, low52Week: 309.45, open: 409.78, previousClose: 409.78 },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 142.45, change: -1.23, changePercent: -0.86, volume: 23450000, avgVolume: 25000000, marketCap: 1780000000000, peRatio: 24.8, high52Week: 153.78, low52Week: 83.34, open: 143.68, previousClose: 143.68 },
    { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 178.92, change: 3.45, changePercent: 1.97, volume: 34210000, avgVolume: 42000000, marketCap: 1850000000000, peRatio: 62.4, high52Week: 189.77, low52Week: 88.12, open: 175.47, previousClose: 175.47 },
    { symbol: 'NVDA', name: 'NVIDIA Corporation', price: 875.42, change: 45.23, changePercent: 5.45, volume: 45230000, avgVolume: 48000000, marketCap: 2160000000000, peRatio: 68.5, high52Week: 974.00, low52Week: 108.13, open: 830.19, previousClose: 830.19 },
    { symbol: 'TSLA', name: 'Tesla, Inc.', price: 248.92, change: 11.34, changePercent: 4.77, volume: 67890000, avgVolume: 112000000, marketCap: 789000000000, peRatio: 48.2, high52Week: 299.29, low52Week: 101.81, open: 237.58, previousClose: 237.58 },
    { symbol: 'META', name: 'Meta Platforms Inc.', price: 485.67, change: 18.92, changePercent: 4.05, volume: 18920000, avgVolume: 21000000, marketCap: 1245000000000, peRatio: 28.9, high52Week: 531.49, low52Week: 88.09, open: 466.75, previousClose: 466.75 },
    { symbol: 'BRK.B', name: 'Berkshire Hathaway', price: 412.34, change: 2.56, changePercent: 0.62, volume: 3450000, avgVolume: 3800000, marketCap: 876000000000, peRatio: 8.9, high52Week: 439.00, low52Week: 290.00, open: 409.78, previousClose: 409.78 },
    { symbol: 'JPM', name: 'JPMorgan Chase & Co.', price: 198.45, change: 1.89, changePercent: 0.96, volume: 8920000, avgVolume: 9500000, marketCap: 572000000000, peRatio: 12.4, high52Week: 205.88, low52Week: 123.11, open: 196.56, previousClose: 196.56 },
    { symbol: 'V', name: 'Visa Inc.', price: 282.67, change: 3.12, changePercent: 1.12, volume: 6780000, avgVolume: 7200000, marketCap: 578000000000, peRatio: 31.2, high52Week: 290.96, low52Week: 206.33, open: 279.55, previousClose: 279.55 },
  ];

  if (!query) return stocks.slice(0, 5);
  
  const lowerQuery = query.toLowerCase();
  return stocks.filter(
    (stock) =>
      stock.symbol.toLowerCase().includes(lowerQuery) ||
      stock.name.toLowerCase().includes(lowerQuery)
  );
}

export function getStockQuote(symbol: string): StockQuote | null {
  const stocks = searchStocks('');
  return stocks.find(s => s.symbol.toUpperCase() === symbol.toUpperCase()) || null;
}

// Generate realistic-looking price fluctuations for real-time simulation
export function simulatePriceUpdate(quote: StockQuote): StockQuote {
  const volatility = 0.001; // 0.1% volatility
  const priceChange = quote.price * volatility * (Math.random() - 0.5) * 2;
  const newPrice = Math.round((quote.price + priceChange) * 100) / 100;
  const priceDiff = newPrice - quote.previousClose;
  
  return {
    ...quote,
    price: newPrice,
    change: Math.round(priceDiff * 100) / 100,
    changePercent: Math.round((priceDiff / quote.previousClose) * 100 * 100) / 100,
  };
}