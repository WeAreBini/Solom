import { NextRequest, NextResponse } from 'next/server';
import { getMarketMovers } from '@/lib/fmp';
import { parseLimitParam } from '@/lib/api-utils';

export const dynamic = 'force-dynamic';

// Shape expected by the frontend (lib/api.ts MarketMover)
interface FrontendMarketMover {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
}

interface MoversResponse {
  success: boolean;
  data?: {
    gainers: FrontendMarketMover[];
    losers: FrontendMarketMover[];
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

    // Transform FMP field names to the shape the frontend hooks expect and filter by limit/type
    const transformMover = (m: typeof movers.gainers[0]): FrontendMarketMover => ({
      symbol: m.symbol,
      name: m.name,
      price: m.price,
      change: m.change,
      changePercent: m.changesPercentage,
      volume: m.volume,
    });

    let gainers = movers.gainers.slice(0, limit).map(transformMover);
    let losers = movers.losers.slice(0, limit).map(transformMover);

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
