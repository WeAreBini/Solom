import { NextRequest, NextResponse } from 'next/server';
import { getMarketMovers } from '@/lib/fmp';
import type { MarketMover } from '@/lib/types/stock';
import { parseLimitParam } from '@/lib/api-utils';

export const dynamic = 'force-dynamic';

interface MoversResponse {
  success: boolean;
  data?: {
    gainers: MarketMover[];
    losers: MarketMover[];
  };
  error?: string;
  gainersCount: number;
  losersCount: number;
}

export async function GET(request: NextRequest): Promise<NextResponse<MoversResponse>> {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'gainers', 'losers', or null for both
    const limitParam = searchParams.get('limit');
    const limit = parseLimitParam(limitParam);

    if (limit === null) {
      return NextResponse.json(
        {
          success: false,
          error: 'Limit must be a valid number between 1 and 50',
          gainersCount: 0,
          losersCount: 0,
        },
        { status: 400 }
      );
    }

    if (limit > 50) {
      return NextResponse.json(
        {
          success: false,
          error: 'Limit must be between 1 and 50',
          gainersCount: 0,
          losersCount: 0,
        },
        { status: 400 }
      );
    }

    const movers = await getMarketMovers();

    // Filter by type if specified
    let gainers = movers.gainers.slice(0, limit);
    let losers = movers.losers.slice(0, limit);

    if (type === 'gainers') {
      losers = [];
    } else if (type === 'losers') {
      gainers = [];
    }

    return NextResponse.json({
      success: true,
      data: {
        gainers,
        losers,
      },
      gainersCount: gainers.length,
      losersCount: losers.length,
    });
  } catch (error) {
    console.error('Market movers error:', error);
    
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    
    // Check for FMP API key error
    if (message.includes('FMP_API_KEY')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Server configuration error: FMP API key not configured',
          gainersCount: 0,
          losersCount: 0,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: message,
        gainersCount: 0,
        losersCount: 0,
      },
      { status: 500 }
    );
  }
}
