import { NextResponse } from 'next/server';

// Solom Data Service URL
const DATA_SERVICE_URL = process.env.SOLOM_DATA_SERVICE_URL || 'http://localhost:8080';

export const dynamic = 'force-dynamic';

interface MoverResponse {
  success: boolean;
  data?: {
    gainers: MarketMover[];
    losers: MarketMover[];
  };
  error?: string;
  source?: string;
}

interface MarketMover {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changesPercentage: number;
  volume: number;
  marketCap?: number;
}

export async function GET(): Promise<NextResponse<MoverResponse>> {
  try {
    // Call our data service which uses Yahoo Finance
    const response = await fetch(`${DATA_SERVICE_URL}/api/market/movers`, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Data service error: ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      data: data.data,
      source: 'yfinance',
    });
  } catch (error) {
    console.error('Market movers error:', error);

    // Fallback mock data
    const mockGainers: MarketMover[] = [
      { symbol: 'NVDA', name: 'NVIDIA Corporation', price: 892.34, change: 45.67, changesPercentage: 5.39, volume: 45890000 },
      { symbol: 'AMD', name: 'Advanced Micro Devices', price: 178.45, change: 12.34, changesPercentage: 7.43, volume: 32450000 },
      { symbol: 'META', name: 'Meta Platforms Inc.', price: 505.12, change: 8.45, changesPercentage: 1.70, volume: 15670000 },
    ];

    const mockLosers: MarketMover[] = [
      { symbol: 'TSLA', name: 'Tesla Inc.', price: 245.67, change: -3.21, changesPercentage: -1.29, volume: 89230000 },
      { symbol: 'PYPL', name: 'PayPal Holdings', price: 62.34, change: -4.56, changesPercentage: -6.82, volume: 12450000 },
    ];

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Data service unavailable',
      data: {
        gainers: mockGainers,
        losers: mockLosers,
      },
      source: 'fallback',
    });
  }
}