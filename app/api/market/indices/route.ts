import { NextResponse } from 'next/server';
import { getMarketIndices } from '@/lib/fmp';

export const dynamic = 'force-dynamic';

// Shape expected by the frontend (lib/api.ts MarketIndex)
interface FrontendMarketIndex {
  symbol: string;
  name: string;
  value: number;
  change: number;
  changePercent: number;
}

interface IndicesResponse {
  success: boolean;
  data?: FrontendMarketIndex[];
  error?: string;
  count: number;
}

export async function GET(): Promise<NextResponse<IndicesResponse>> {
  try {
    const indices = await getMarketIndices();

    // Transform FMP field names to the shape the frontend hooks expect
    const data: FrontendMarketIndex[] = indices.map((idx) => ({
      symbol: idx.symbol,
      name: idx.name,
      value: idx.price,
      change: idx.change,
      changePercent: idx.changesPercentage,
    }));

    return NextResponse.json({
      success: true,
      data,
      count: data.length,
    });
  } catch (error) {
    console.error('Market indices error:', error);
    
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    
    // Check for FMP API key error
    if (message.includes('FMP_API_KEY')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Server configuration error: FMP API key not configured',
          count: 0,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: message,
        count: 0,
      },
      { status: 500 }
    );
  }
}