import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';
import { NextRequest } from 'next/server';
import { ingestAssetProfile, ingestHistoricalData } from '@/lib/ingestion/market-data';

// Mock Next.js NextResponse
vi.mock('next/server', () => {
  return {
    NextResponse: {
      json: vi.fn((body, init) => {
        return {
          status: init?.status ?? 200,
          json: async () => body,
        };
      }),
    },
    NextRequest: class {}
  };
});

// Mock the ingestion logic
vi.mock('@/lib/ingestion/market-data', () => ({
  ingestAssetProfile: vi.fn(),
  ingestHistoricalData: vi.fn(),
}));

describe('Ingestion Admin API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createMockRequest = (body: any) => {
    return {
      json: async () => body,
    } as NextRequest;
  };

  it('returns 400 if symbol is missing', async () => {
    const req = createMockRequest({ action: 'both' });
    const res: any = await POST(req);
    const body = await res.json();
    
    expect(res.status).toBe(400);
    expect(body.success).toBe(false);
    expect(body.error).toBe('Valid symbol is required');
  });

  it('returns 400 if symbol is invalid format', async () => {
    const req = createMockRequest({ action: 'both', symbol: 'INVALID!@#' });
    const res: any = await POST(req);
    const body = await res.json();
    
    expect(res.status).toBe(400);
    expect(body.success).toBe(false);
    expect(body.error).toBe('Invalid symbol format');
  });

  it('returns 400 if action is invalid', async () => {
    const req = createMockRequest({ action: 'unknown', symbol: 'AAPL' });
    const res: any = await POST(req);
    const body = await res.json();
    
    expect(res.status).toBe(400);
    expect(body.success).toBe(false);
    expect(body.error).toBe('Valid action (profile, historical, both) is required');
  });

  it('handles action: profile successfully', async () => {
    const req = createMockRequest({ action: 'profile', symbol: 'AAPL' });
    vi.mocked(ingestAssetProfile).mockResolvedValueOnce({ success: true, asset: { symbol: 'AAPL' } } as any);
    
    const res: any = await POST(req);
    const body = await res.json();
    
    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.profile).toEqual({ success: true, asset: { symbol: 'AAPL' } });
    expect(body.data.historical).toBeUndefined();
    
    expect(ingestAssetProfile).toHaveBeenCalledWith('AAPL');
    expect(ingestHistoricalData).not.toHaveBeenCalled();
  });

  it('handles action: historical successfully', async () => {
    const req = createMockRequest({ action: 'historical', symbol: 'AAPL', interval: '1h' });
    vi.mocked(ingestHistoricalData).mockResolvedValueOnce({ success: true, count: 100 } as any);
    
    const res: any = await POST(req);
    const body = await res.json();
    
    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.historical).toEqual({ success: true, count: 100 });
    expect(body.data.profile).toBeUndefined();
    
    expect(ingestHistoricalData).toHaveBeenCalledWith('AAPL', expect.any(Date), expect.any(Date), '1h');
    expect(ingestAssetProfile).not.toHaveBeenCalled();
  });

  it('returns 400 for invalid interval in historical', async () => {
    const req = createMockRequest({ action: 'historical', symbol: 'AAPL', interval: 'invalid' });
    
    const res: any = await POST(req);
    const body = await res.json();
    
    expect(res.status).toBe(400);
    expect(body.success).toBe(false);
    expect(body.error).toBe('Invalid interval: invalid');
  });

  it('handles action: both successfully', async () => {
    const req = createMockRequest({ action: 'both', symbol: 'AAPL' });
    vi.mocked(ingestAssetProfile).mockResolvedValueOnce({ success: true, asset: { symbol: 'AAPL' } } as any);
    vi.mocked(ingestHistoricalData).mockResolvedValueOnce({ success: true, count: 50 } as any);
    
    const res: any = await POST(req);
    const body = await res.json();
    
    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.profile).toEqual({ success: true, asset: { symbol: 'AAPL' } });
    expect(body.data.historical).toEqual({ success: true, count: 50 });
    
    expect(ingestAssetProfile).toHaveBeenCalledWith('AAPL');
    expect(ingestHistoricalData).toHaveBeenCalledWith('AAPL', expect.any(Date), expect.any(Date), '1d');
  });

  it('traps errors from ingestion functions without returning 500', async () => {
    const req = createMockRequest({ action: 'both', symbol: 'AAPL' });
    vi.mocked(ingestAssetProfile).mockRejectedValueOnce(new Error('Profile failed'));
    vi.mocked(ingestHistoricalData).mockRejectedValueOnce(new Error('Historical failed'));
    
    const res: any = await POST(req);
    const body = await res.json();
    
    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.profile).toEqual({ success: false, error: 'Profile failed' });
    expect(body.data.historical).toEqual({ success: false, error: 'Historical failed' });
  });

  it('returns 500 on unexpected global exception', async () => {
    // Force a systemic error, e.g. req.json() throws
    const req = {
      json: async () => { throw new Error('Bad request body'); }
    } as unknown as NextRequest;
    
    const res: any = await POST(req);
    const body = await res.json();
    
    expect(res.status).toBe(500);
    expect(body.success).toBe(false);
    expect(body.error).toBe('Bad request body');
  });
});
