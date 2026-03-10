import { NextResponse } from 'next/server';

// Solom Data Service URL
const DATA_SERVICE_URL = process.env.SOLOM_DATA_SERVICE_URL || 'http://localhost:8080';

export const dynamic = 'force-dynamic';

interface MarketIndex {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changesPercentage: number;
}

interface IndicesResponse {
  success: boolean;
  data?: MarketIndex[];
  error?: string;
  count: number;
  source?: string;
}

export async function GET(): Promise<NextResponse<IndicesResponse>> {
  try {
    // Call our data service which uses Yahoo Finance
    const response = await fetch(`${DATA_SERVICE_URL}/api/market/indices`, {
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
      count: data.count || data.data?.length || 0,
      source: 'yfinance',
    });
  } catch (error) {
    console.error('Market indices error:', error);

    // Fallback to mock data if data service is unavailable
    const mockData: MarketIndex[] = [
      { symbol: '^DJI', name: 'Dow Jones Industrial Average', price: 39127.80, change: 156.33, changesPercentage: 0.40 },
      { symbol: '^GSPC', name: 'S&P 500', price: 5234.56, change: 28.45, changesPercentage: 0.55 },
      { symbol: '^IXIC', name: 'NASDAQ Composite', price: 16428.93, change: 184.67, changesPercentage: 1.14 },
      { symbol: '^RUT', name: 'Russell 2000', price: 2089.45, change: -12.34, changesPercentage: -0.59 },
      { symbol: '^VIX', name: 'CBOE Volatility Index', price: 14.23, change: -0.89, changesPercentage: -5.89 },
    ];

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Data service unavailable',
      data: mockData,
      count: mockData.length,
      source: 'fallback',
    });
  }
}