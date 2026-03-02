import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';
import { prisma as prismaOriginal } from '@/lib/db';

const prisma = prismaOriginal as any;

// Mock the Prisma DB singleton
vi.mock('@/lib/db', () => ({
  prisma: {
    asset: {
      findUnique: vi.fn(),
    },
  },
}));

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

  it('should return 404 if asset is not found or has no prices', async () => {
    // Mock Prisma returning null
    (prisma.asset.findUnique as any).mockResolvedValue(null);

    const request = createRequest('/api/stocks/UNKNOWN/quote');
    const response = await GET(request, { params: Promise.resolve({ symbol: 'UNKNOWN' }) });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data).toEqual({
      success: false,
      error: 'Quote not found for symbol: UNKNOWN',
    });
  });

  it('should successfully return formatted quote data if found', async () => {
    const mockTime = new Date('2026-03-01T10:00:00Z');
    const mockPreviousTime = new Date('2026-02-28T10:00:00Z');
    
    // Mock valid asset with prices and fundamentals
    (prisma.asset.findUnique as any).mockResolvedValue({
      symbol: 'AAPL',
      name: 'Apple Inc.',
      exchange: 'NASDAQ',
      prices: [
        {
          time: mockTime,
          open: 149.0,
          high: 151.0,
          low: 148.0,
          close: 150.0,
          volume: 1000000,
        },
        {
          time: mockPreviousTime,
          open: 145.0,
          high: 147.0,
          low: 144.0,
          close: 146.0,
          volume: 900000,
        },
      ],
      fundamentals: {
        fiftyTwoWeekHigh: 180.0,
        fiftyTwoWeekLow: 120.0,
        marketCap: 2500000000000,
        eps: 5.5,
        peRatio: 27.2,
      },
    });

    const request = createRequest('/api/stocks/AAPL/quote');
    const response = await GET(request, { params: Promise.resolve({ symbol: 'AAPL' }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    
    // verify the mapped data matches the expected quote structure
    expect(data.data.symbol).toBe('AAPL');
    expect(data.data.name).toBe('Apple Inc.');
    expect(data.data.price).toBe(150.0);
    expect(data.data.change).toBeCloseTo(4.0); // 150 - 146
    expect(data.data.changesPercentage).toBeCloseTo((4 / 146) * 100);
    expect(data.data.dayLow).toBe(148.0);
    expect(data.data.dayHigh).toBe(151.0);
    expect(data.data.yearHigh).toBe(180.0);
    expect(data.data.yearLow).toBe(120.0);
    expect(data.data.marketCap).toBe(2500000000000);
    expect(data.data.exchange).toBe('NASDAQ');
    expect(data.data.volume).toBe(1000000);
    expect(data.data.open).toBe(149.0);
    expect(data.data.previousClose).toBe(146.0);
    expect(data.data.eps).toBe(5.5);
    expect(data.data.pe).toBe(27.2);
    expect(data.data.timestamp).toBe(Math.floor(mockTime.getTime() / 1000));
  });
});
