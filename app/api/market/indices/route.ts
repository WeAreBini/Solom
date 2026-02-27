import { NextResponse } from 'next/server';
import { getMarketIndices } from '@/lib/fmp';
import type { MarketIndex } from '@/lib/types/stock';

export const dynamic = 'force-dynamic';

interface IndicesResponse {
  success: boolean;
  data?: MarketIndex[];
  error?: string;
  count: number;
}

export async function GET(): Promise<NextResponse<IndicesResponse>> {
  try {
    const indices = await getMarketIndices();

    return NextResponse.json({
      success: true,
      data: indices,
      count: indices.length,
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