import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ingestAssetProfile, ingestHistoricalData } from './market-data';
import { prisma } from '@/lib/db';
import yahooFinance from 'yahoo-finance2';

// Mock dependencies
vi.mock('@/lib/db', () => ({
  prisma: {
    asset: {
      upsert: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    companyFundamental: {
      upsert: vi.fn(),
    },
    historicalPrice: {
      createMany: vi.fn(),
    },
  },
}));

vi.mock('yahoo-finance2', () => ({
  default: {
    quoteSummary: vi.fn(),
    historical: vi.fn(),
  },
}));

vi.mock('technicalindicators', () => ({
  SMA: vi.fn(),
  EMA: vi.fn(),
  RSI: vi.fn(),
}));

describe('Market Data Ingestion', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  describe('ingestAssetProfile', () => {
    it('throws error for invalid symbol', async () => {
      await expect(ingestAssetProfile('')).rejects.toThrow('Invalid symbol format');
      await expect(ingestAssetProfile('INVALID!@#')).rejects.toThrow('Invalid symbol format: INVALID!@#');
    });

    it('successfully ingests and upserts asset profile', async () => {
      const mockResult = {
        price: {
          longName: 'Apple Inc.',
          quoteType: 'EQUITY',
          exchangeName: 'NMS',
          currency: 'USD',
          marketCap: 3000000000000,
          epsTrailingTwelveMonths: 6.5,
        },
        summaryProfile: {
          sector: 'Technology',
          industry: 'Consumer Electronics',
          longBusinessSummary: 'Designs smartphones',
          beta: 1.2,
        },
        summaryDetail: {
          trailingPE: 30.5,
          dividendYield: 0.005,
          fiftyTwoWeekHigh: 199.99,
          fiftyTwoWeekLow: 124.17,
        },
        defaultKeyStatistics: {
        },
      };

      vi.mocked(yahooFinance.quoteSummary).mockResolvedValueOnce(mockResult as any);

      const mockAsset = { id: 'asset-123', symbol: 'AAPL' };
      vi.mocked(prisma.asset.upsert).mockResolvedValueOnce(mockAsset as any);

      const result = await ingestAssetProfile('AAPL');

      expect(yahooFinance.quoteSummary).toHaveBeenCalledWith('AAPL', {
        modules: ['summaryProfile', 'defaultKeyStatistics', 'summaryDetail', 'price'],
      });
      
      expect(prisma.asset.upsert).toHaveBeenCalledWith({
        where: { symbol: 'AAPL' },
        create: expect.objectContaining({
          symbol: 'AAPL',
          name: 'Apple Inc.',
          type: 'EQUITY',
          exchange: 'NMS',
          currency: 'USD',
          active: true,
        }),
        update: expect.objectContaining({
          name: 'Apple Inc.',
          type: 'EQUITY',
          exchange: 'NMS',
          currency: 'USD',
          active: true,
        }),
      });

      expect(prisma.companyFundamental.upsert).toHaveBeenCalledWith({
        where: { assetId: 'asset-123' },
        create: expect.objectContaining({
          assetId: 'asset-123',
          sector: 'Technology',
          industry: 'Consumer Electronics',
          peRatio: 30.5,
          dividendYield: 0.005,
          eps: 6.5,
          beta: 1.2,
          fiftyTwoWeekHigh: 199.99,
          fiftyTwoWeekLow: 124.17,
          description: 'Designs smartphones',
        }),
        update: expect.any(Object),
      });

      expect(result).toEqual({ success: true, asset: mockAsset });
    });

    it('retries on rate limit (429) error', async () => {
      const rateLimitError = new Error('Rate limit');
      (rateLimitError as any).status = 429;

      const mockResult = { price: { longName: 'NVDA' } };

      vi.mocked(yahooFinance.quoteSummary)
        .mockRejectedValueOnce(rateLimitError)
        .mockResolvedValueOnce(mockResult as any);

      vi.mocked(prisma.asset.upsert).mockResolvedValueOnce({ id: 'nvda-1', symbol: 'NVDA' } as any);
      vi.mocked(prisma.companyFundamental.upsert).mockResolvedValueOnce({} as any);

      const promise = ingestAssetProfile('NVDA');

      // Fast-forward timers to jump over the backoff delay
      await vi.advanceTimersByTimeAsync(2000);

      await promise;

      expect(yahooFinance.quoteSummary).toHaveBeenCalledTimes(2);
    });

    it('does not retry on 404 error', async () => {
      const notFoundError = new Error('Not found');
      (notFoundError as any).status = 404;

      vi.mocked(yahooFinance.quoteSummary).mockRejectedValueOnce(notFoundError);

      await expect(ingestAssetProfile('UNKNOWN')).rejects.toThrow('Not found');
      expect(yahooFinance.quoteSummary).toHaveBeenCalledTimes(1);
    });

    it('throws error when no price data returned', async () => {
      vi.mocked(yahooFinance.quoteSummary).mockResolvedValueOnce({} as any);
      await expect(ingestAssetProfile('AAPL')).rejects.toThrow('Could not fetch profile for AAPL');
    });
  });

  describe('ingestHistoricalData', () => {
    it('throws error for invalid symbol', async () => {
      await expect(ingestHistoricalData('', '2023-01-01')).rejects.toThrow('Invalid symbol format');
    });

    it('creates asset if not exists and inserts historical data', async () => {
      vi.mocked(prisma.asset.findUnique).mockResolvedValueOnce(null);
      vi.mocked(prisma.asset.create).mockResolvedValueOnce({ id: 'new-asset', symbol: 'TSLA' } as any);

      const mockHistoricalData = [
        { date: new Date('2023-01-01'), open: 100, high: 110, low: 90, close: 105, volume: 1000 },
        { date: new Date('2023-01-02'), open: 105, high: 115, low: 95, close: 110, volume: 2000 },
      ];
      vi.mocked(yahooFinance.historical).mockResolvedValueOnce(mockHistoricalData as any);
      vi.mocked(prisma.historicalPrice.createMany).mockResolvedValueOnce({ count: 2 } as any);

      const result = await ingestHistoricalData('TSLA', '2023-01-01', '2023-01-02', '1d');

      expect(prisma.asset.findUnique).toHaveBeenCalledWith({ where: { symbol: 'TSLA' } });
      expect(prisma.asset.create).toHaveBeenCalledWith({
        data: { symbol: 'TSLA', name: 'TSLA', type: 'EQUITY', exchange: 'UNKNOWN', active: true },
      });

      expect(yahooFinance.historical).toHaveBeenCalledWith('TSLA', {
        period1: '2023-01-01',
        period2: '2023-01-02',
        interval: '1d',
      });

      expect(prisma.historicalPrice.createMany).toHaveBeenCalledWith({
        data: [
          { assetId: 'new-asset', time: mockHistoricalData[0].date, interval: '1d', open: 100, high: 110, low: 90, close: 105, volume: 1000n },
          { assetId: 'new-asset', time: mockHistoricalData[1].date, interval: '1d', open: 105, high: 115, low: 95, close: 110, volume: 2000n },
        ],
        skipDuplicates: true,
      });

      expect(result).toEqual({ success: true, count: 2, totalFetched: 2 });
    });

    it('uses existing asset if found', async () => {
      vi.mocked(prisma.asset.findUnique).mockResolvedValueOnce({ id: 'existing', symbol: 'MSFT' } as any);
      
      const mockHistoricalData = [
        { date: new Date('2023-01-01'), open: 100, high: 110, low: 90, close: 105, volume: 1000 },
      ];
      vi.mocked(yahooFinance.historical).mockResolvedValueOnce(mockHistoricalData as any);
      vi.mocked(prisma.historicalPrice.createMany).mockResolvedValueOnce({ count: 1 } as any);

      await ingestHistoricalData('MSFT', '2023-01-01');

      expect(prisma.asset.create).not.toHaveBeenCalled();
      expect(prisma.historicalPrice.createMany).toHaveBeenCalledTimes(1);
    });

    it('handles empty results gracefully', async () => {
      vi.mocked(prisma.asset.findUnique).mockResolvedValueOnce({ id: 'existing', symbol: 'MSFT' } as any);
      vi.mocked(yahooFinance.historical).mockResolvedValueOnce([] as any);

      const result = await ingestHistoricalData('MSFT', '2023-01-01');

      expect(result).toEqual({ success: true, count: 0, message: 'No data found for period' });
      expect(prisma.historicalPrice.createMany).not.toHaveBeenCalled();
    });

    it('filters out invalid data points', async () => {
      vi.mocked(prisma.asset.findUnique).mockResolvedValueOnce({ id: 'existing', symbol: 'MSFT' } as any);
      
      const mockHistoricalData = [
        { date: new Date('2023-01-01'), open: 100, high: 110, low: 90, close: 105, volume: 1000 },
        { date: new Date('2023-01-02'), open: null, high: 110, low: 90, close: 105, volume: 1000 }, // Invalid open
        { open: 100, high: 110, low: 90, close: 105, volume: 1000 }, // Missing date
      ];
      vi.mocked(yahooFinance.historical).mockResolvedValueOnce(mockHistoricalData as any);
      vi.mocked(prisma.historicalPrice.createMany).mockResolvedValueOnce({ count: 1 } as any);

      await ingestHistoricalData('MSFT', '2023-01-01');

      expect(prisma.historicalPrice.createMany).toHaveBeenCalledWith({
        data: expect.arrayContaining([
          expect.objectContaining({ time: mockHistoricalData[0].date }),
        ]),
        skipDuplicates: true,
      });

      // It should only have 1 valid record
      const callArgs = vi.mocked(prisma.historicalPrice.createMany).mock.calls[0][0];
      expect(callArgs.data).toHaveLength(1);
    });
  });
});
