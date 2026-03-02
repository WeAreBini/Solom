import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

// Mock the FMP library
vi.mock('@/lib/fmp', () => ({
  getStockQuote: vi.fn(),
}));

import { getStockQuote } from '@/lib/fmp';
const mockGetStockQuote = getStockQuote as ReturnType<typeof vi.fn>;

describe('GET /api/stocks/[symbol]/quote', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function createRequest(url: string) {
    return new NextRequest(new URL(url, 'http://localhost'));
  }

  it('should return 400 if symbol is missing', async () => {
    const request = createRequest('/api/stocks//quote');
    const response = await GET(request, { params: Promise.resolve({ symbol: '' }) });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({
      success: false,
      error: 'Missing required path parameter: symbol',
    });
  });

  it('should return 400 for invalid symbol format', async () => {
    const request = createRequest('/api/stocks/invalid!sym/quote');
    const response = await GET(request, { params: Promise.resolve({ symbol: 'invalid!sym' }) });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toContain('Invalid symbol format');
  });

  it('should return 404 if quote is not found', async () => {
    mockGetStockQuote.mockResolvedValue(null);

    const request = createRequest('/api/stocks/UNKNOWN/quote');
    const response = await GET(request, { params: Promise.resolve({ symbol: 'UNKNOWN' }) });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data).toEqual({
      success: false,
      error: 'Quote not found for symbol: UNKNOWN',
    });
  });

  it('should successfully return transformed quote data from FMP', async () => {
    mockGetStockQuote.mockResolvedValue({
      symbol: 'AAPL',
      name: 'Apple Inc.',
      price: 150.0,
      change: 4.0,
      changesPercentage: 2.74,
      dayLow: 148.0,
      dayHigh: 151.0,
      yearHigh: 180.0,
      yearLow: 120.0,
      marketCap: 2500000000000,
      priceAvg50: 145.0,
      priceAvg200: 140.0,
      exchange: 'NASDAQ',
      volume: 1000000,
      avgVolume: 950000,
      open: 149.0,
      previousClose: 146.0,
      eps: 5.5,
      pe: 27.2,
      earningsAnnouncement: '',
      sharesOutstanding: 0,
      timestamp: 1740816000,
    });

    const request = createRequest('/api/stocks/AAPL/quote');
    const response = await GET(request, { params: Promise.resolve({ symbol: 'AAPL' }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);

    // Verify field name transformation (FMP → frontend)
    expect(data.data.symbol).toBe('AAPL');
    expect(data.data.name).toBe('Apple Inc.');
    expect(data.data.price).toBe(150.0);
    expect(data.data.change).toBe(4.0);
    expect(data.data.changePercent).toBe(2.74);     // changesPercentage → changePercent
    expect(data.data.high52Week).toBe(180.0);       // yearHigh → high52Week
    expect(data.data.low52Week).toBe(120.0);        // yearLow → low52Week
    expect(data.data.peRatio).toBe(27.2);           // pe → peRatio
    expect(data.data.dayLow).toBe(148.0);
    expect(data.data.dayHigh).toBe(151.0);
    expect(data.data.marketCap).toBe(2500000000000);
    expect(data.data.volume).toBe(1000000);
    expect(data.data.avgVolume).toBe(950000);
    expect(data.data.open).toBe(149.0);
    expect(data.data.previousClose).toBe(146.0);
  });
});
