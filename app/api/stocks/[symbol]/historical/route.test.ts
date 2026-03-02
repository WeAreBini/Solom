import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';
import { prisma as prismaOriginal } from '@/lib/db';

const prisma = prismaOriginal as any;

// Mock the Prisma DB singleton
vi.mock('@/lib/db', () => ({
  prisma: {
    historicalPrice: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock('@/lib/indicators', () => ({
  calculateSMA: vi.fn().mockReturnValue([{ time: new Date().toISOString(), value: 100 }]),
  calculateEMA: vi.fn().mockReturnValue([]),
  calculateRSI: vi.fn().mockReturnValue([]),
  calculateMACD: vi.fn().mockReturnValue([]),
  validateIndicatorParams: vi.fn().mockReturnValue({ valid: true }),
}));

describe('GET /api/stocks/[symbol]/historical', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function createRequest(url: string) {
    return new NextRequest(new URL(url, 'http://localhost'));
  }

  it('should return 400 if symbol is missing', async () => {
    const request = createRequest('/api/stocks//historical');
    const response = await GET(request, { params: Promise.resolve({ symbol: '' }) });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({
      success: false,
      error: 'Missing required path parameter: symbol',
    });
  });

  it('should return 400 for invalid symbol format', async () => {
    const request = createRequest('/api/stocks/invalid!sym/historical');
    const response = await GET(request, { params: Promise.resolve({ symbol: 'invalid!sym' }) });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toContain('Invalid symbol format');
  });

  it('should return empty historical data if no prices are found (resilient fallback)', async () => {
    (prisma.historicalPrice.findMany as any).mockResolvedValue([]);

    const request = createRequest('/api/stocks/AAPL/historical');
    const response = await GET(request, { params: Promise.resolve({ symbol: 'AAPL' }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.candlestick).toEqual([]);
    expect(data.data.indicators).toBeDefined();
  });

  it('should successfully return historical data with default indicators (volume included)', async () => {
    const mockTime1 = new Date('2026-03-01T10:00:00Z');
    const mockTime2 = new Date('2026-03-02T10:00:00Z');
    
    (prisma.historicalPrice.findMany as any).mockResolvedValue([
      {
        time: mockTime1,
        open: 150.0,
        high: 155.0,
        low: 149.0,
        close: 154.0,
        volume: BigInt(1000000), // BigInt from DB
      },
      {
        time: mockTime2,
        open: 154.0,
        high: 158.0,
        low: 153.0,
        close: 157.0,
        volume: BigInt(1500000),
      }
    ]);

    const request = createRequest('/api/stocks/AAPL/historical');
    const response = await GET(request, { params: Promise.resolve({ symbol: 'AAPL' }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    
    expect(data.data.candlestick.length).toBe(2);
    expect(data.data.candlestick[0].close).toBe(154.0);
    expect(data.data.candlestick[0].volume).toBe(1000000); // Volume should be converted to number
    expect(data.data.candlestick[1].close).toBe(157.0);

    // Indicator checking
    expect(data.data.indicators.volume.length).toBe(2);
    expect(data.data.indicators.volume[0].value).toBe(1000000);
    expect(data.data.indicators.sma).toEqual([]); // not enabled
  });

  it('should correctly configure and calculate requested indicators', async () => {
    // Generate some mock data for indicators
    const mockData = Array.from({ length: 20 }, (_, i) => ({
      time: new Date(Date.now() - (20 - i) * 86400000),
      open: 100 + i,
      high: 105 + i,
      low: 95 + i,
      close: 100 + i,
      volume: BigInt(1000),
    }));

    (prisma.historicalPrice.findMany as any).mockResolvedValue(mockData);

    // Provide query parameters to enable sma and custom period
    const request = createRequest('/api/stocks/AAPL/historical?indicators=sma&smaPeriod=10');
    const response = await GET(request, { params: Promise.resolve({ symbol: 'AAPL' }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    
    expect(data.data.indicators.sma.length).toBeGreaterThan(0); // Should be populated now
    // Volume is always returned according to implementation
    expect(data.data.indicators.volume).toBeDefined();
    
    // We can also verify that config params were parsed by spying on Prisma query?
    // Not needed, as indicator results being present is enough.
  });

  it('should handle internal errors gracefully', async () => {
    (prisma.historicalPrice.findMany as any).mockRejectedValue(new Error('Database explosion'));

    const request = createRequest('/api/stocks/AAPL/historical');
    const response = await GET(request, { params: Promise.resolve({ symbol: 'AAPL' }) });
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Database explosion');
  });
});
